package net.justmachinery.shade

import kotlinx.coroutines.CompletableDeferred
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
class ClientContext(private val id : UUID) {
    companion object : KLogging()
    private inline fun <T> logging(cb: ()->T) : T {
        return withLoggingInfo("shadeClientId" to id.toString()){
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
                try {
                    val ordered = synchronized(needReRender) {
                        val result = needReRender.sortedBy { it.treeDepth }
                        needReRender.clear()
                        result
                    }
                    logger.debug { "Rerendering: ${ordered.joinToString(",")}" }
                    ordered.forEach {
                        @Suppress("UNCHECKED_CAST")
                        (it as Component<*, Tag>).updateRender(it.renderIn)
                    }
                } finally {
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
    private val storedCallbacks = Collections.synchronizedMap(mutableMapOf<Long, suspend (String?)->Unit>())

    internal suspend fun callCallback(id : Long, data : String?) = logging {
        logger.trace { "Calling callback $id with data ${data?.ellipsizeAfter(100)}" }
        batchingReRenders {
            getCallback(id)(data)
        }
    }
    private fun getCallback(id : Long) : suspend (String?)->Unit {
        return storedCallbacks[id]!!
    }
    internal fun removeCallback(id : Long){
        logger.trace { "Cleanup callback $id" }
        storedCallbacks.remove(id)
    }
    private fun storeCallback(cb : suspend (String?)->Unit) : Long {
        val id = nextCallbackId.incrementAndGet()
        logger.trace { "Create callback $id" }
        storedCallbacks[id] = cb
        return id
    }

    private val handlerLock = Object()
    private var handler : ShadeRoot.MessageHandler? = null
    private val javascriptQueue = Collections.synchronizedList(mutableListOf<String>())
    private fun sendJavascript(javascript : String) = logging {
        logger.trace { "Sending javascript: ${javascript.ellipsizeAfter(200)}" }
        synchronized(handlerLock){
            if(handler != null){
                handler!!.send(javascript)
            } else {
                javascriptQueue.add(javascript)
            }
        }

    }
    internal fun setHandler(handler : ShadeRoot.MessageHandler) = logging {
        synchronized(handlerLock){
            logger.info { "Client connected, handler set" }
            this.handler = handler
            javascriptQueue.forEach {
                handler.send(it)
            }
            javascriptQueue.clear()
        }
    }

    fun callbackString(cb : suspend ()->Unit) : Pair<Long, String> {
        val id = storeCallback { cb() }
        return id to "javascript:window.shade($id)"
    }
    fun executeScript(@Language("JavaScript 1.8") js : String) {
        sendJavascript(js)
    }

    fun runExpression(@Language("JavaScript 1.8", prefix = "var result = ", suffix = ";") js : String) : CompletableDeferred<String> {
        val future = CompletableDeferred<String>()
        var id : Long? = null
        id = storeCallback {
            removeCallback(id!!)
            future.complete(it!!)
        }
        sendJavascript("var result = $js;\nwindow.shade($id, JSON.stringify(result))")
        return future
    }
}

