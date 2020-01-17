package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.html.HtmlBlockTag
import kotlinx.html.Tag
import kotlinx.html.script
import kotlinx.html.unsafe
import mu.KLogging
import java.time.Duration
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import kotlin.reflect.KClass
import kotlin.reflect.full.isSubclassOf

/**
 * Configuration object.
 */
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
    val afterConstructComponent : (AdvancedComponent<*,*>)->Unit = {},
    /**
     * Called whenever an exception is thrown in a client's JS page that cannot be mapped to a deferred
     */
    val onUncaughtJavascriptException : (ClientContext, JavascriptException)->Unit = { context, err ->
        logger.error(err){ "Uncaught JS exception for client ${context.clientId}" }
    },
    /**
     * For testing purposes.
     * An extra delay to add before passing receiving or sending any messages to the client, to simulate poor connections.
     */
    var simulateExtraDelay : Duration? = null
) {
    companion object : KLogging() {
        private val shadeScript = ClassLoader.getSystemClassLoader().getResource("shade.js")!!.readText()
    }

    internal fun <T : Any, RenderIn : Tag> constructComponent(clazz : KClass<out AdvancedComponent<T, RenderIn>>, props : ComponentInitData<T>) : AdvancedComponent<T, RenderIn> {
        val component = when {
            clazz == FunctionComponent::class -> {
                @Suppress("UNCHECKED_CAST")
                FunctionComponent(props as ComponentInitData<FunctionComponent.Props<RenderIn>>) as AdvancedComponent<T, RenderIn>
            }
            clazz.isSubclassOf(Component::class) || clazz.isSubclassOf(ComponentInTag::class) -> {
                try {
                    componentPassProps.set(props)
                    clazz.java.getDeclaredConstructor().also { it.isAccessible = true }.newInstance()
                } finally {
                    componentPassProps.remove()
                }
            }
            else -> {
                clazz.java.getDeclaredConstructor(ComponentInitData::class.java).also { it.isAccessible = true }.newInstance(props)
            }
        }!!
        component.props = props.props
        afterConstructComponent(component)
        return component
    }

    fun <T : Any, RenderIn : Tag> component(context : ClientContext, builder : RenderIn, root : KClass<out AdvancedComponent<T, RenderIn>>, props : T){
        val propObj = ComponentInitData(
            context = context,
            key = null,
            props = props,
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
        var clientId : UUID? = null
        private var clientData : ClientContext? = null

        internal fun sendMessage(errorTag : String?, message : String){
            if (simulateExtraDelay == null) {
                send("${errorTag ?: ""}|$message")
            } else {
                delayExecutor.schedule({
                    send("${errorTag ?: ""}|$message")
                }, simulateExtraDelay!!.toMillis(), TimeUnit.MILLISECONDS)
            }
        }
        /**
         * This should be called by your web framework when a websocket receives a message.
         * Ideally, the web framework should process these messages sequentially.
         */
        fun onMessage(message : String){
            if(message.isEmpty()) return
            if (simulateExtraDelay == null) {
                processMessage(message)
            } else {
                delayExecutor.schedule({
                    processMessage(message)
                }, simulateExtraDelay!!.toMillis(), TimeUnit.MILLISECONDS)
            }
        }

        private fun processMessage(message : String){
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
                            try { onUncaughtJavascriptException(clientData!!, error) } catch(t : Throwable){
                                logger.error(t) { "While handling uncaught global JavaScript error" }
                            }
                        } else { //Attached to a callback
                            val isError = tag.startsWith('E')
                            val callbackId = tag.dropWhile { it == 'E' }.toLong()
                            if(isError){
                                clientData!!.onCallbackError(callbackId, error)
                            } else {
                                clientData!!.callCallback(callbackId, data.ifBlank { null }?.let { Json(it) })
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

        private val delayExecutor by lazy { Executors.newSingleThreadScheduledExecutor() }
    }
}

fun <Props : Any, RenderIn : HtmlBlockTag> RenderIn.installRoot(root: ShadeRoot, component : KClass<out AdvancedComponent<Props, RenderIn>>, props : Props){
    root.installFramework(this){
        root.component(it, this, component, props)
    }
}

fun <Props : PropsType<Props, T>, T : AdvancedComponent<Props, RenderIn>, RenderIn : HtmlBlockTag> RenderIn.installRoot(root: ShadeRoot, props : Props){
    installRoot(root, props.type, props)
}