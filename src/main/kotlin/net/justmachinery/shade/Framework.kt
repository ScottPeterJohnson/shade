package net.justmachinery.shade

import kotlinx.coroutines.CompletableDeferred
import kotlinx.html.FlowOrPhrasingContent
import kotlinx.html.HtmlBlockTag
import kotlinx.html.script
import kotlinx.html.unsafe
import net.justmachinery.shade.render.renderInternal
import net.justmachinery.shade.render.updateRender
import org.intellij.lang.annotations.Language
import java.util.*
import java.util.concurrent.atomic.AtomicLong
import kotlin.reflect.KClass


class ShadeContext {
    private val nextCallbackId : AtomicLong = AtomicLong(0)
    private val storedCallbacks = Collections.synchronizedMap(mutableMapOf<Long, suspend (String?)->Unit>())
    private val handlerLock = Object()
    private var handler : ShadeRoot.MessageHandler? = null
    private val javascriptQueue = Collections.synchronizedList(mutableListOf<String>())

    var currentlyRenderingComponent : Component<*>? = null
    val needReRender = mutableSetOf<Component<*>>()

    fun triggerReRender(){
        needReRender.forEach {
            it.updateRender()
        }
        needReRender.clear()
    }

    internal fun getCallback(id : Long) : suspend (String?)->Unit {
        return storedCallbacks[id]!!
    }
    internal fun removeCallback(id : Long){
        storedCallbacks.remove(id)
    }
    internal fun storeCallback(cb : suspend (String?)->Unit) : Long {
        val id = nextCallbackId.incrementAndGet()
        storedCallbacks[id] = cb
        return id
    }
    internal fun sendJavascript(javascript : String){
        synchronized(handlerLock){
            if(handler != null){
                handler!!.send(javascript)
            } else {
                javascriptQueue.add(javascript)
            }
        }

    }
    internal fun setHandler(handler : ShadeRoot.MessageHandler){
        synchronized(handlerLock){
            this.handler = handler
            javascriptQueue.forEach {
                handler.send(it)
            }
            javascriptQueue.clear()
        }
    }

    fun callbackString(cb : suspend ()->Unit) : String {
        val id = storeCallback { cb() }
        return "javascript:window.shade($id)"
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


class ShadeRoot(
    val endpoint : String
) {
    companion object {
        private val shadeScript = ClassLoader.getSystemClassLoader().getResource("shade.js")!!.readText()
    }
    private fun shade(builder : FlowOrPhrasingContent, cb : (ShadeContext)-> Unit){
        val id = UUID.randomUUID()
        val context = ShadeContext()
        clientDataMap[id] = context
        builder.run {
            script {
                async = true
                unsafe {
                    //language=JavaScript 1.8
                    raw("window.shadeEndpoint = \"$endpoint\";\nwindow.shadeId = \"$id\";$shadeScript")
                }
            }
        }
        cb(context)
    }
    fun <T : Any> component(builder : HtmlBlockTag, root : KClass<out Component<T>>, props : T){
        shade(builder){ context ->
            val propObj = ComponentProps(
                context = context,
                key = null,
                props = props,
                kClass = root
            )
            val component = root.java.getDeclaredConstructor(ComponentProps::class.java).newInstance(propObj)
            component.run {
                renderInternal(builder)
            }
            component.afterMount()
        }
    }

    fun handler(send : (String)->Unit) = MessageHandler(send)

    private val clientDataMap = Collections.synchronizedMap(mutableMapOf<UUID, ShadeContext>())

    inner class MessageHandler internal constructor(
        val send : (String)->Unit
    ) {
        private var clientId : UUID? = null
        private var clientData : ShadeContext? = null

        suspend fun onMessage(message : String){
            if(clientData == null){
                clientId = UUID.fromString(message)!!
                clientData = clientDataMap[clientId]
                if(clientData == null){
                    send("window.location.reload(true)")
                } else {
                    clientData!!.setHandler(this)
                }
            } else {
                val parts = message.split('|', limit = 2)
                val callbackId = parts.first().toLong()
                val data = if(parts.size > 1) parts[1] else null
                (clientData!!.getCallback(callbackId))(data)
            }
        }
        fun onDisconnect(){
            clientId?.let {
                clientDataMap.remove(it)
            }
        }
    }
}