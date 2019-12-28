package net.justmachinery.shade

import kotlinx.coroutines.*
import kotlinx.coroutines.slf4j.MDCContext
import kotlinx.html.Tag
import mu.KLogging
import net.justmachinery.shade.render.renderInternal
import net.justmachinery.shade.render.updateRender
import org.intellij.lang.annotations.Language
import java.util.*
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

/**
 * Stores and manages state for a particular client connection.
 */
class ClientContext(val clientId : UUID, val root : ShadeRoot) {
    companion object : KLogging()
    private inline fun <T> logging(cb: ()->T) : T {
        return withLoggingInfo("shadeClientId" to clientId.toString()){
            cb()
        }
    }

    /**
     * We track the currently rendering component so that we can implicitly add its dependencies
     */
    private var currentlyRenderingComponent : Component<*,*>? = null
    fun getCurrentlyRenderingComponent() = currentlyRenderingComponent
    /**
     * Properly set and reset the currently rendering component around cb
     */
    internal fun withComponentRendering(component : Component<*,*>, cb : ()->Unit){
        val old = currentlyRenderingComponent
        currentlyRenderingComponent = component
        try {
            cb()
        } finally {
            currentlyRenderingComponent = old
        }
    }

    /**
     * Set of components known to be dirty and require rerendering
     */
    private val needReRender = Collections.synchronizedSet(mutableSetOf<Component<*,*>>())
    /**
     * Used to avoid excessive rerender of a component when doing batched rendering, as its parent may rerender it.
     */
    internal var hasReRendered: MutableSet<Component<*,*>>? = null

    /**
     * Flag components dirty, and queue a rerender
     */
    internal fun setComponentsDirty(components : List<Component<*,*>>) = logging {
        logger.debug { "Set dirty: ${components.joinToString(",")}" }
        needReRender.addAll(components)
        triggerReRender()
    }

    private val renderLock = Object()
    private var renderingThread : Thread? = null

    /**
     * Is this thread currently rendering for this client?
     */
    internal fun isRenderingThread() : Boolean {
        return renderingThread == Thread.currentThread()
    }

    /**
     * Render a root component
     */
    internal fun <RenderIn : Tag> renderRoot(builder : RenderIn, component : Component<*, RenderIn>) = logging {
        logger.debug { "Rendering root $component" }
        synchronized(renderLock){
            renderingThread = Thread.currentThread()
            try {
                component.run {
                    renderInternal(builder, addMarkers = true)
                }
                component.mounted()
            } finally {
                renderingThread = null
            }
        }
    }

    /**
     * Re-render dirty components
     */
    private fun triggerReRender() = logging {
        if(batchReRenders.get() == 0){
            synchronized(renderLock){
                renderingThread = Thread.currentThread()
                val rerendered = mutableSetOf<Component<*,*>>()
                hasReRendered = rerendered
                try {
                    //We render from the top of the tree hierarchy down, to avoid excessive rerenders when a parent and
                    //some child both depend on some state marked dirty.
                    val ordered = synchronized(needReRender) {
                        val result = needReRender.sortedBy { it.treeDepth }
                        needReRender.clear()
                        result
                    }
                    logger.debug { "Rerendering: ${ordered.joinToString(",")}" }
                    ordered.forEach {
                        if(!rerendered.contains(it)){
                            @Suppress("UNCHECKED_CAST")
                            (it as Component<*, Tag>).updateRender(it.renderIn)
                        }
                    }
                } finally {
                    hasReRendered = null
                    renderingThread = null
                }
            }
        }
    }

    private val batchReRenders = AtomicInteger(0)
    private suspend fun batchingReRenders(cb: suspend ()->Unit){
        try {
            batchReRenders.incrementAndGet()
            cb()
        } finally {
            batchReRenders.decrementAndGet()
        }
        triggerReRender()
    }

    private val nextCallbackId : AtomicLong = AtomicLong(0)
    private val storedCallbacks = Collections.synchronizedMap(mutableMapOf<Long, CallbackData>())
    /**
     * This is used to make processing of user events sequential
     */
    private var eventProcessing = false
    private val eventQueue : Queue<Pair<suspend (Json?) -> Unit, Json?>> = ArrayDeque()

    private val supervisor = SupervisorJob()
    internal var coroutineScope = CoroutineScope(supervisor)

    internal fun cleanup(){
        GlobalScope.launch {
            supervisor.cancel()
        }
    }

    internal fun onCallbackError(id : Long, exception : JavascriptException) = logging {
        val callback = getCallback(id)
        coroutineScope.launch(context = MDCContext()){
            val onError = callback?.onError
            try {
                if(onError != null){
                    onError(exception)
                } else {
                    if(callback == null){
                        logger.warn { "Callback $id threw $exception but its handler expired" }
                    }
                    root.onUncaughtJavascriptException(this@ClientContext, exception)
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
                if(eventProcessing){
                    logger.trace { "Queuing processing of callback $id" }
                    eventQueue.add(callback.callback to data)
                } else {
                    logger.trace { "Starting new processing coroutine for callback $id" }
                    eventProcessing = true
                    coroutineScope.launch(context = MDCContext()) {
                        batchingReRenders {
                            runEventLockedCallback(callback.callback, data)
                        }
                    }
                }
                Unit
            }
        } else {
            coroutineScope.launch(context = MDCContext()) {
                batchingReRenders {
                    try {
                        callback.callback(data)
                    } catch(t : Throwable){
                        if(t is CancellationException){
                            logger.info(t) { "Callback processing cancelled" }
                        } else {
                            logger.error(t) { "Error processing callback" }
                        }
                    }
                }
            }
        }
    }

    private suspend fun runEventLockedCallback(callback: suspend (Json?) -> Unit, data: Json?){
        var currentCallback = callback
        var currentData = data
        while(true){
            try {
                currentCallback(currentData)
            } catch(t : Throwable){
                if(t is CancellationException){
                    logger.info(t) { "Callback cancelled" }
                } else {
                    logger.error(t) { "Error processing event callback" }
                }
            }

            val cb = synchronized(eventQueue){
                if(eventQueue.isNotEmpty()){
                    eventQueue.poll()
                } else {
                    eventProcessing = false
                    null
                }
            }

            if(cb != null){
                currentCallback = cb.first
                currentData = cb.second
            } else {
                break
            }
        }

    }


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
    private fun storeCallback(data : CallbackData) : Long {
        val id = nextCallbackId.incrementAndGet()
        logger.trace { "Create callback $id" }
        storedCallbacks[id] = data
        return id
    }

    private val handlerLock = Object()
    private var handler : ShadeRoot.MessageHandler? = null

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

    fun eventCallbackString(
        @Language("JavaScript 1.8") prefix : String = "",
        @Language("JavaScript 1.8") suffix : String = "",
        @Language("JavaScript 1.8") data : String? = null,
        cb : suspend (Json?)->Unit
    ) : Pair<Long, String> {
        val id = storeCallback(CallbackData(
            callback = cb,
            onError = null,
            requireEventLock = true
        ))
        val wrappedPrefix = if(prefix.isNotBlank()) "$prefix;" else ""
        val wrappedSuffix = if(suffix.isNotBlank()) ";$suffix" else ""
        val wrappedData = if(data != null) ",JSON.stringify($data)" else ""
        return id to "javascript:(function(){ ${wrappedPrefix}window.shade($id$wrappedData)$wrappedSuffix })()"
    }
    fun executeScript(@Language("JavaScript 1.8") js : String) {
        sendJavascript(null, js)
    }


    private fun runExpressionWithTemplate(template : (Long)->String) : CompletableDeferred<Json> {
        val future = CompletableDeferred<Json>()
        var id : Long? = null
        id = storeCallback(CallbackData(
            callback = {
                removeCallback(id!!)
                future.complete(it!!)
            },
            onError = {
                removeCallback(id!!)
                future.completeExceptionally(it)
            },
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
        return runExpressionWithTemplate {id -> "var result = $js;\nwindow.shade($id, JSON.stringify(result))" }
    }

    /**
     * Run a JS snippet with the "shadeCb" and "shadeErr" functions in immediate scope.
     * Call shadeCb(data) to return data, or shadeErr(error) to throw an exception.
     */
    fun runWithCallback(@Language("JavaScript 1.8", prefix = "function cb(data){}; ", suffix = ";") js : String) : CompletableDeferred<Json> {
        return runExpressionWithTemplate {id -> "(function(){ function shadeErr(e){ sendIfError(e, $id, script.substring(0,256)) }; function shadeCb(data){ window.shade($id, JSON.stringify(data)) }; $js; })()" }
    }

    /**
     * Run a JS expression that returns a promise, returning the JSON representation of the promise's resolution or throwing
     * a JavascriptException if processing failed.
     */
    fun runPromise(@Language("JavaScript 1.8", prefix = "var result = ", suffix = ";") js : String) : CompletableDeferred<Json> {
        return runWithCallback("var result = $js; result.then(shadeCb).catch(shadeErr);")
    }
}

private data class CallbackData(
    val callback : suspend (Json?)->Unit,
    val onError : (suspend(JavascriptException)->Unit)?,
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