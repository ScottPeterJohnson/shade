package net.justmachinery.shade

import kotlinx.html.HtmlBlockTag
import kotlinx.html.Tag
import kotlinx.html.script
import kotlinx.html.unsafe
import mu.KLogging
import java.util.*
import kotlin.reflect.KClass


class ShadeRoot(
    val endpoint : String
) {
    companion object : KLogging() {
        private val shadeScript = ClassLoader.getSystemClassLoader().getResource("shade.js")!!.readText()
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
        val component = root.java.getDeclaredConstructor(Props::class.java).newInstance(propObj)
        context.renderRoot(builder, component)
    }

    fun installFramework(builder : HtmlBlockTag, cb : (ClientContext)-> Unit){
        val id = UUID.randomUUID()
        val context = ClientContext(id)
        clientDataMap[id] = context
        withLoggingInfo("shadeClientId" to id.toString()){
            logger.info { "Created new client id" }
        }
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

    fun handler(send : (String)->Unit) = MessageHandler(send)

    private val clientDataMap = Collections.synchronizedMap(mutableMapOf<UUID, ClientContext>())

    inner class MessageHandler internal constructor(
        val send : (String)->Unit
    ) {
        private var clientId : UUID? = null
        private var clientData : ClientContext? = null

        suspend fun onMessage(message : String){
            withLoggingInfo("shadeClientId" to clientId.toString()){
                logger.trace { "Message received: ${message.ellipsizeAfter(200)}" }
                if(clientData == null){
                    clientId = UUID.fromString(message)!!
                    clientData = clientDataMap[clientId]
                    if(clientData == null){
                        logger.info { "Client ID expired or invalid: $clientId" }
                        send("window.location.reload(true)")
                    } else {
                        clientData!!.setHandler(this)
                    }
                } else {
                    val parts = message.split('|', limit = 2)
                    val callbackId = parts.first().toLong()
                    val data = if(parts.size > 1) parts[1] else null
                    clientData!!.callCallback(callbackId, data)
                }
            }
        }
        fun onDisconnect(){
            withLoggingInfo("shadeClientId" to clientId.toString()){
                logger.info { "Client disconnected" }
            }
            clientId?.let {
                clientDataMap.remove(it)
            }
        }
    }
}