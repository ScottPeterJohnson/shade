package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.html.HtmlBlockTag
import kotlinx.html.Tag
import kotlinx.html.script
import kotlinx.html.unsafe
import mu.KLogging
import net.justmachinery.shade.component.*
import java.time.Duration
import java.util.*
import kotlin.coroutines.CoroutineContext
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
    val afterConstructComponent : (AdvancedComponent<*, *>)->Unit = {},
    /**
     * Called whenever an exception is thrown in a client's JS page that cannot be mapped to or is not handled by an [ErrorHandler] in a [ShadeContext]
     */
    val onUncaughtJavascriptException : (Client, JavascriptException)->Unit = { client, err ->
        logger.error(err){ "Uncaught JS exception for client ${client.clientId}" }
    },
    /**
     * For testing purposes.
     * An extra delay to add before passing receiving or sending any messages to the client, to simulate poor connections.
     */
    var simulateExtraDelay : Duration? = null,

    /**
     * Base context used to launch all coroutines by default.
     */
    val context : CoroutineContext = Dispatchers.Default,

    //Maximum acceptable delay between a client loading a page and connecting back via websocket before its data is removed
    //(and it has to reload the page if it wants to add interactivity)
    val maximumAcceptableConnectionDelay : Duration = Duration.ofSeconds(30)
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
            clazz.isSubclassOf(Component::class) || clazz.isSubclassOf(
                ComponentInTag::class) -> {
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

    /**
     * Installs the Shade framework and begins rendering within cb()
     */
    fun render(tag : HtmlBlockTag, cb : (ShadeRootComponent.()->Unit)){
        installFramework(tag){client ->
            renderComponentAsRoot(client, tag, ShadeRootComponent::class, EqLambda(cb))
        }
    }

    /**
     * As render, but does not create a new client (and can be used multiple times on a page)
     */
    fun renderWithClient(client: Client, tag : HtmlBlockTag, cb : (ShadeRootComponent.()->Unit)){
        renderComponentAsRoot(client, tag, ShadeRootComponent::class, EqLambda(cb))
    }


    private fun <T : Any, RenderIn : Tag> renderComponentAsRoot(
        client : Client,
        builder : RenderIn,
        root : KClass<out AdvancedComponent<T, RenderIn>>,
        props : T
    ){
        val propObj = ComponentInitData(
            client = client,
            key = null,
            props = props,
            renderIn = builder::class,
            treeDepth = 0,
            context = ShadeContext.empty
        )
        val component = constructComponent(root, propObj)
        client.renderRoot(builder, component)
    }

    /**
     * Just installs the framework into an HTML builder, creating a new client object.
     * You probably don't want to use this directly.
     */
    fun installFramework(tag : HtmlBlockTag, cb : (Client)-> Unit){
        val id = UUID.randomUUID()

        val client = Client(id, this)

        client.coroutineScope.launch {
            delay(maximumAcceptableConnectionDelay.toMillis())
            if(!client.connected()){
                val data = clientDataMap.remove(id)
                data?.cleanup()
            }
        }

        clientDataMap[id] = client
        withLoggingInfo("shadeClientId" to id.toString()){
            logger.info { "Created new client id" }
        }
        tag.run {
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
        cb(client)
    }

    fun handler(send : (String)->Unit, disconnect : ()->Unit) = MessageHandler(send, disconnect)

    private val clientDataMap = Collections.synchronizedMap(mutableMapOf<UUID, Client>())

    inner class MessageHandler internal constructor(
        private val send : (String)->Unit,
        private val disconnect : ()->Unit
    ) {
        var clientId : UUID? = null
        private var clientData : Client? = null

        internal fun sendMessage(errorTag : String?, message : String){
            if (simulateExtraDelay == null) {
                send("${errorTag ?: ""}|$message")
            } else {
                GlobalScope.launch(context){
                    delay(simulateExtraDelay!!.toMillis())
                    send("${errorTag ?: ""}|$message")
                }
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
                GlobalScope.launch(context){
                    delay(simulateExtraDelay!!.toMillis())
                    processMessage(message)
                }
            }
        }

        private fun processMessage(message : String){
            synchronized(this){
                withLoggingInfo("shadeClientId" to clientId.toString()){
                    logger.trace { "Message received: ${message.ellipsizeAfter(200)}" }
                    if(clientData == null){
                        try {
                            clientId = UUID.fromString(message)!!
                        } catch(t : IllegalArgumentException){
                            logger.info { "Not a UUID: ${message.ellipsizeAfter(200)}" }
                            disconnect()
                            return
                        }
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
                                clientData!!.onCallbackJsError(callbackId, error)
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
    }
}

class ShadeRootComponent : Component<EqLambda<ShadeRootComponent.()->Unit>>() {
    override fun HtmlBlockTag.render() {
        props.raw(this@ShadeRootComponent)
    }
}