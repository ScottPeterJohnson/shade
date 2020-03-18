package net.justmachinery.shade

import kotlinx.coroutines.*
import kotlinx.coroutines.slf4j.MDCContext
import kotlinx.html.Tag
import mu.KLogging
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.doMount
import net.justmachinery.shade.render.renderInternal
import net.justmachinery.shade.render.updateRender
import org.intellij.lang.annotations.Language
import java.util.*
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

/**
 * Stores and manages state for a particular client connection.
 */
class Client(
    /**
     * Unique per-client identifier
     */
    val clientId : UUID,
    val root : ShadeRoot
) {
    companion object : KLogging()

    private inline fun <T> logging(cb: ()->T) : T {
        return withLoggingInfo("shadeClientId" to clientId.toString()){
            cb()
        }
    }

    private val nextComponentId = AtomicInteger(0)
    fun nextComponentId() = nextComponentId.getAndIncrement()

    /**
     * Set of components known to be dirty and require rerendering
     */
    private val needRerender = Collections.synchronizedSet(mutableSetOf<AdvancedComponent<*, *>>())
    /**
     * Used to avoid excessive rerender of a component when doing batched rendering, as its parent may rerender it.
     */
    private var dontRerender: MutableSet<AdvancedComponent<*, *>>? = null
    internal fun markDontRerender(component : AdvancedComponent<*, *>){ dontRerender?.add(component) }

    /**
     * Flag components dirty, and queue a rerender
     */
    internal fun setComponentsDirty(components : List<AdvancedComponent<*, *>>) = logging {
        logger.debug { "Set dirty: ${components.joinToString(",")}" }
        needRerender.addAll(components)
        triggerReRender()
    }


    /**
     * Render a root component into an existing HTML builder.
     */
    internal fun <RenderIn : Tag> renderRoot(builder : RenderIn, component : AdvancedComponent<*, RenderIn>) = logging {
        logger.debug { "Rendering root $component" }
        renderLock.runSync {
            component.client.swallowExceptions(message = { "While adding root" }) {
                component.renderInternal(builder, addMarkers = true)
                component.doMount()
            }
        }
    }


    /**
     * Only one thread should be rendering for a client at a time.
     */
    private val renderLock = SingleConcurrentExecution(this::rerender)

    /**
     * Re-render dirty components and send their updates over websocket
     */
    private fun rerender() : Job = coroutineScope.launch {
        logging {
            val rerendered = Collections.newSetFromMap<AdvancedComponent<*, *>>(WeakHashMap())
            dontRerender = rerendered
            try {
                //We render from the top of the tree hierarchy down, to avoid excessive rerenders when a parent and
                //some child both depend on some state marked dirty.
                val ordered = synchronized(needRerender) {
                    val result = needRerender.sortedBy { it.treeDepth }
                    needRerender.clear()
                    result
                }
                logger.debug { "Rerendering: ${ordered.joinToString(",")}" }
                ordered.forEach {
                    if(!rerendered.contains(it)){
                        swallowExceptions(message = { "While rerendering $it" }) {
                            @Suppress("UNCHECKED_CAST")
                            (it as AdvancedComponent<*, Tag>).updateRender(it.renderIn)
                        }
                    }
                }
            } finally {
                dontRerender = null
            }
        }
    }

    private fun triggerReRender() {
        if(batchReRenders.get() == 0){
            renderLock.maybeLaunch()
        }
    }

    private val batchReRenders = AtomicInteger(0)
    private suspend fun batchingReRenders(cb: suspend ()->Unit){
        try {
            logger.trace { "Batching rerenders..." }
            batchReRenders.incrementAndGet()
            cb()
        } finally {
            logger.trace { "Finished a rerender batch." }
            batchReRenders.decrementAndGet()
        }
        triggerReRender()
    }

    //These are used to make processing of user events sequential
    @Volatile private var isEventProcessing = false
    private val eventQueue : Queue<Pair<CallbackData, Json?>> = ArrayDeque()

    internal val supervisor = SupervisorJob()
    internal val coroutineScope = CoroutineScope(supervisor)

    internal fun cleanup(){
        //Most cleanup will be handled by the garbage collector.
        GlobalScope.launch {
            supervisor.cancel()
        }
    }

    internal fun onCallbackJsError(id : Long, exception : JavascriptException) = logging {
        val callback = getCallback(id)
        coroutineScope.launch(context = MDCContext()){
            val onError = callback?.errorHandler
            try {
                val handled = onError != null && onError.handleException(
                    context = ComponentErrorHandlingContext(ContextErrorSource.JAVASCRIPT, null, exception),
                    client = this@Client
                )
                if (!handled) {
                    if(callback == null){
                        logger.warn { "Callback $id threw $exception but its handler expired" }
                    }
                    root.onUncaughtJavascriptException(this@Client, exception)
                }
            } catch(t : Throwable){
                if(t is CancellationException){
                    logger.info(t) { "Callback exception processing cancelled" }
                } else {
                    logger.error(t) { "While handling callback exception" }
                }
            }
        }
    }

    internal fun <T> swallowExceptions(message: (()->String)? = null, cb : ()->T) : T? {
        return try {
            cb()
        } catch(t : Throwable){
            swallowException(message, t)
            null
        }
    }

    internal fun swallowException(message: (()->String)? = null, t : Throwable){
        try {
            if(message != null){
                logger.error(t){ message() }
            } else {
                logger.error(t.message, t)
            }
        } catch(t2 : Throwable){
            t.addSuppressed(t2)
            logger.error(t) { "(Could not generate a message for this exception)" }
        }
    }


    internal fun callCallback(id : Long, data : Json?) : Unit = logging {
        logger.trace { "Calling callback $id with data ${data?.raw?.ellipsizeAfter(100)}" }
        val callback = getCallback(id)
        if(callback == null){
            logger.trace { "Cannot call expired callback $id" }
            return
        }
        if(callback.requireEventLock) {
            //We need to make sure only one event callback is running at a time, and put any that should run later into
            //a queue.
            synchronized(eventQueue){
                if(isEventProcessing){
                    logger.trace { "Queuing processing of callback $id" }
                    eventQueue.add(callback to data)
                } else {
                    logger.trace { "Starting new processing coroutine for callback $id" }
                    isEventProcessing = true
                    coroutineScope.launch(context = MDCContext()) {
                        batchingReRenders {
                            runEventLockedCallback(callback, data)
                        }
                    }
                }
                Unit
            }
        } else {
            coroutineScope.launch(context = MDCContext()) {
                batchingReRenders {
                    runCallbackCatchingErrors(callback, data)
                }
            }
        }
    }

    private suspend fun runEventLockedCallback(callback: CallbackData, data: Json?){
        var currentCallback = callback
        var currentData = data
        while(true){
            logger.trace { "Running a callback" }
            runCallbackCatchingErrors(currentCallback, currentData)
            logger.trace { "Checking event queue" }
            synchronized(eventQueue){
                if(eventQueue.isNotEmpty()){
                    logger.trace { "Found a callback" }
                    val cb = eventQueue.poll()
                    currentCallback = cb.first
                    currentData = cb.second
                } else {
                    logger.trace { "No callback; disable event processing" }
                    isEventProcessing = false
                    return
                }
            }
        }
    }

    private suspend fun runCallbackCatchingErrors(callback: CallbackData, data: Json?){
        try {
            callback.callback(data)
        } catch(t : Throwable){
            if(t is CancellationException){
                logger.info(t) { "Callback processing cancelled" }
            } else if(callback.errorHandler?.handleException(ComponentErrorHandlingContext(
                    source = ContextErrorSource.CALLBACK,
                    component = null,
                    throwable = t
                ), this) != true){
                logger.error(t) { "Error processing callback" }
            }
        }
    }


    private val nextCallbackId : AtomicLong = AtomicLong(0)
    private val storedCallbacks = Collections.synchronizedMap(mutableMapOf<Long, CallbackData>())

    private fun getCallback(id : Long) : CallbackData? {
        return storedCallbacks[id] ?: run {
            if(id < nextCallbackId.get()){
                logger.trace { "Expired callback $id" }
                null
            } else {
                throw IllegalStateException("Unknown callback $id")
            }
        }
    }
    internal fun removeCallback(id : Long){
        logger.trace { "Cleanup callback $id" }
        storedCallbacks.remove(id)
    }
    private fun storeCallback(data : CallbackData, forceId : Long? = null) : Long {
        val id = forceId ?: nextCallbackId.incrementAndGet()
        logger.trace { "Create callback $id" }
        storedCallbacks[id] = data
        return id
    }

    private val handlerLock = Object()
    @Volatile private var handler : ShadeRoot.MessageHandler? = null

    private data class QueuedMessage(val errorTag : String?, val message : String)
    private var javascriptQueue : MutableList<QueuedMessage>? = Collections.synchronizedList(mutableListOf())
    private fun sendJavascript(errorTag : String?, javascript : String) = logging {
        logger.trace { "Sending javascript: ${javascript.ellipsizeAfter(200)}" }
        synchronized(handlerLock){
            if(handler != null){
                handler!!.sendMessage(errorTag, javascript)
            } else {
                javascriptQueue?.add(QueuedMessage(errorTag, javascript))
            }
        }

    }
    internal fun setHandler(handler : ShadeRoot.MessageHandler) = logging {
        synchronized(handlerLock){
            logger.info { "Client connected, handler set" }
            this.handler = handler
            javascriptQueue?.forEach {
                handler.sendMessage(it.errorTag, it.message)
            }
            javascriptQueue = null
        }
    }

    internal fun eventCallbackStringInternal(
        @Language("JavaScript 1.8") prefix : String = "",
        @Language("JavaScript 1.8") suffix : String = "",
        @Language("JavaScript 1.8") data : String?,
        forceId: Long?,
        errorHandler: ContextErrorHandler?,
        cb : suspend (Json?)->Unit
    ) : Pair<Long, String> {
        val id = storeCallback(
            CallbackData(
                callback = cb,
                errorHandler = errorHandler,
                requireEventLock = true
            ),
            forceId = forceId
        )
        val wrappedPrefix = if(prefix.isNotBlank()) "$prefix;" else ""
        val wrappedSuffix = if(suffix.isNotBlank()) ";$suffix" else ""
        val wrappedData = if(data != null) ",JSON.stringify($data)" else ""
        return id to "javascript:(function(){ ${wrappedPrefix}window.shade($id$wrappedData)$wrappedSuffix })()"
    }

    fun executeScript(@Language("JavaScript 1.8") js : String) {
        sendJavascript(null, js)
    }

    internal fun runRepeatableExpressionWithTemplate(@Language("JavaScript 1.8") template : (Long)->String, cb : (Json?)->Unit) {
        val id = storeCallback(CallbackData(
            callback = {
                cb(it)
            },
            errorHandler = null,
            requireEventLock = true
        ))
        sendJavascript(id.toString(), template(id))
    }

    private fun runOneoffExpressionWithTemplate(template : (Long)->String) : CompletableDeferred<Json> {
        val future = CompletableDeferred<Json>()
        var id : Long? = null
        id = storeCallback(CallbackData(
            callback = {
                removeCallback(id!!)
                future.complete(it!!)
            },
            errorHandler = ContextErrorHandler(previous = null, handle = {
                removeCallback(id!!)
                future.completeExceptionally(throwable)
                true
            }),
            requireEventLock = false
        ))
        sendJavascript(id.toString(), template(id))
        return future
    }

    /**
     * Run a JS expression and return the JSONified result.
     */
    fun runExpression(
        @Language("JavaScript 1.8", prefix = "var result = ", suffix = ";") js : String) : CompletableDeferred<Json> {
        return runOneoffExpressionWithTemplate { id -> "var result = $js;\nwindow.shade($id, JSON.stringify(result))" }
    }

    /**
     * Run a JS snippet with the "shadeCb" and "shadeErr" functions in immediate scope.
     * Call shadeCb(data) to return data, or shadeErr(error) to throw an exception.
     */
    fun runWithCallback(@Language("JavaScript 1.8", prefix = "function cb(data){}; ", suffix = ";") js : String) : CompletableDeferred<Json> {
        return runOneoffExpressionWithTemplate { id -> "(function(){ function shadeErr(e){ sendIfError(e, $id, script.substring(0,256)) }; function shadeCb(data){ window.shade($id, JSON.stringify(data)) }; $js; })()" }
    }

    /**
     * Run a JS expression that returns a promise, returning the JSON representation of the promise's resolution or throwing
     * a JavascriptException if processing failed.
     */
    fun runPromise(@Language("JavaScript 1.8", prefix = "var result = ", suffix = ";") js : String) : CompletableDeferred<Json> {
        return runWithCallback("var result = $js; result.then(shadeCb).catch(shadeErr);")
    }

    private val globalState = Collections.synchronizedMap(HashMap<GlobalClientStateIdentifier<*>, Any?>(0))
    @Suppress("UNCHECKED_CAST")
    fun <T> getGlobalState(identifier: GlobalClientStateIdentifier<T>) : T? {
        synchronized(globalState){
            return globalState[identifier] as T?
        }
    }
    @Suppress("UNCHECKED_CAST")
    fun <T> getOrPutGlobalState(identifier: GlobalClientStateIdentifier<T>, default : ()->T) : T {
        synchronized(globalState){
            return globalState.getOrPut(identifier, default) as T
        }
    }
    fun <T> putGlobalState(identifier: GlobalClientStateIdentifier<T>, value : T) {
        globalState[identifier] = value
    }
}

private data class CallbackData(
    val callback : suspend (Json?)->Unit,
    val errorHandler: ContextErrorHandler?,
    val requireEventLock : Boolean
)

class JavascriptException(
    val details : JavascriptExceptionDetails
) : RuntimeException("${details.name}: \"${details.jsMessage}\" while evaluating \"${details.eval ?: "Outside of Shade callback"}\"\n${details.stack}")

class JavascriptExceptionDetails(
    val eval : String?,
    val jsMessage : String,
    val name : String,
    val stack : String
)

class GlobalClientStateIdentifier<T> {
    companion object {
        private val nextIdentifier = AtomicInteger(0)
    }

    private val identifier = nextIdentifier.getAndIncrement()
    override fun hashCode(): Int {
        return identifier
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as GlobalClientStateIdentifier<*>
        if (identifier != other.identifier) return false
        return true
    }
}