package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.html.HtmlBlockTag
import kotlinx.html.Tag
import kotlinx.html.script
import kotlinx.html.unsafe
import mu.KLogging
import java.util.*
import kotlin.reflect.KClass


class ShadeRoot(
    /**
     * Websocket URL at which the shade endpoint will be accessible
     */
    val endpoint : String,
    /**
     * Host to use for websocket URL; use same host as page delivered over if null
     */
    val host : String? = null,
    /**
     * This is called after a component is constructed, and could be used to e.g. inject dependencies.
     */
    val afterConstructComponent : (Component<*,*>)->Unit = {},
    /**
     * Called whenever an exception is thrown in a client's JS page that cannot be mapped to a deferred
     */
    val onUncaughtJavascriptException : (JavascriptException)->Unit = {
        logger.error(it){ "Uncaught JS exception" }
    }
) {
    companion object : KLogging() {
        private val shadeScript = ClassLoader.getSystemClassLoader().getResource("shade.js")!!.readText()
    }

    fun <T : Any, RenderIn : Tag> constructComponent(clazz : KClass<out Component<T, RenderIn>>, props : Props<T>) : Component<T, RenderIn> {
        val component = clazz.java.getDeclaredConstructor(Props::class.java).also { it.isAccessible = true }.newInstance(props)!!
        afterConstructComponent(component)
        return component
    }

    fun <T : Any, RenderIn : Tag> component(context : ClientContext, builder : RenderIn, root : KClass<out Component<T, RenderIn>>, props : T){
        val propObj = Props(
            context = context,
            key = null,
            props = props,
            kClass = root,
            renderIn = builder::class,
            treeDepth = 0
        )
        val component = constructComponent(root, propObj)
        context.renderRoot(builder, component)
    }

    fun installFramework(builder : HtmlBlockTag, cb : (ClientContext)-> Unit){
        val id = UUID.randomUUID()
        val context = ClientContext(id, this)
        clientDataMap[id] = context
        withLoggingInfo("shadeClientId" to id.toString()){
            logger.info { "Created new client id" }
        }
        builder.run {
            script {
                async = true
                unsafe {
                    //language=JavaScript 1.8
                    raw(
                        """
                            window.shadeEndpoint = "$endpoint";
                            window.shadeHost = ${if(host != null) "\"$host\"" else "null"};
                            window.shadeId = "$id";
                            $shadeScript
                        """
                    )
                }
            }
        }
        cb(context)
    }

    fun handler(send : (String)->Unit, disconnect : ()->Unit) = MessageHandler(send, disconnect)

    private val clientDataMap = Collections.synchronizedMap(mutableMapOf<UUID, ClientContext>())

    inner class MessageHandler internal constructor(
        private val send : (String)->Unit,
        private val disconnect : ()->Unit
    ) {
        private var clientId : UUID? = null
        private var clientData : ClientContext? = null

        internal fun sendMessage(errorTag : String?, message : String){
            send("${errorTag ?: ""}|$message")
        }
        /**
         * This should be called by your web framework when a websocket receives a message.
         * Ideally, the web framework should process these messages sequentially.
         */
        fun onMessage(message : String){
            if(message.isEmpty()) return
            synchronized(this){
                withLoggingInfo("shadeClientId" to clientId.toString()){
                    logger.trace { "Message received: ${message.ellipsizeAfter(200)}" }
                    if(clientData == null){
                        clientId = UUID.fromString(message)!!
                        clientData = clientDataMap[clientId]
                        if(clientData == null){
                            logger.info { "Client ID expired or invalid: $clientId" }
                            sendMessage(null, "window.location.reload(true)")
                            disconnect()
                        } else {
                            clientData!!.setHandler(this@MessageHandler)
                        }
                    } else {
                        val (tag, data) = message.split('|', limit = 2)
                        val error by lazy { JavascriptException(Gson().fromJson(data, JavascriptExceptionDetails::class.java)) }
                        if(tag == "E"){ //Global caught error
                            try { onUncaughtJavascriptException(error) } catch(t : Throwable){
                                logger.error(t) { "While handling uncaught global JavaScript error" }
                            }
                        } else { //Attached to a callback
                            val isError = tag.startsWith('E')
                            val callbackId = tag.dropWhile { it == 'E' }.toLong()
                            if(isError){
                                clientData!!.onCallbackError(callbackId, error)
                            } else {
                                clientData!!.callCallback(callbackId, data.ifBlank { null })
                            }
                        }
                    }
                }
            }
        }

        fun onDisconnect(){
            synchronized(this){
                withLoggingInfo("shadeClientId" to clientId.toString()){
                    logger.info { "Client disconnected" }
                }
                clientId?.let {
                    val data = clientDataMap.remove(it)
                    data?.cleanup()
                }
            }
        }
    }
}