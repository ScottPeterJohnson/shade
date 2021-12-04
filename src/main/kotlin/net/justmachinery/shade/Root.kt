package net.justmachinery.shade

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.html.*
import mu.KLogging
import net.justmachinery.shade.component.*
import net.justmachinery.shade.render.shadeToString
import net.justmachinery.shade.render.shadeToWriter
import net.justmachinery.shade.utility.*
import java.io.Writer
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

    /**
     * Maximum acceptable delay between a client loading a page and connecting back via websocket before its data is removed
     * (and it has to reload the page if it wants to add interactivity)
     */
    val maximumAcceptableConnectionDelay : Duration = Duration.ofSeconds(30),

    /**
     * For adding the Shade client script, it can be either added as an inline script at first render or as a script with a given path.
     */
    val addScriptStrategy: AddScriptStrategy = AddScriptStrategy.Inline(production = true)
) {
    companion object : KLogging() {
        val shadeDevScript by lazy { ClassLoader.getSystemClassLoader().getResource("js/shade-bundle.js")!!.readText() }
        val shadeProdScript by lazy { ClassLoader.getSystemClassLoader().getResource("js/shade-bundle-min.js")!!.readText() }
    }

    internal fun <T : Any, RenderIn : Tag> constructComponent(clazz : KClass<out AdvancedComponent<T, RenderIn>>, props : ComponentInitData<T>) : AdvancedComponent<T, RenderIn> {
        val component = when {
            clazz == FunctionComponent::class -> {
                componentPassProps.withValue(props){
                    @Suppress("UNCHECKED_CAST")
                    FunctionComponent<RenderIn>() as AdvancedComponent<T, RenderIn>
                }
            }
            clazz.isSubclassOf(Component::class) || clazz.isSubclassOf(
                ComponentInTag::class) -> {
                componentPassProps.withValue(props){
                    clazz.java.getDeclaredConstructor().also { it.isAccessible = true }.newInstance()
                }
            }
            else -> {
                clazz.java.getDeclaredConstructor(ComponentInitData::class.java).also { it.isAccessible = true }.newInstance(props)
            }
        }!!
        component.initializeProps(props.props)
        afterConstructComponent(component)
        return component
    }

    /**
     * Installs the Shade framework and begins rendering within cb(), returning output as a String
     */
    fun render(cb : (ShadeRootRender.()->Unit)) : String {
        val consumer = shadeToString()
        return renderImpl(consumer, cb)
    }
    /**
     * As [render] but writes output to [writer]
     */
    fun render(writer: Writer, cb : (ShadeRootRender.()->Unit)) {
        val consumer = shadeToWriter(writer)
        return renderImpl(consumer, cb)
    }

    private fun <T> renderImpl(consumer: TagConsumer<T>, cb : (ShadeRootRender.()->Unit)) : T {
        consumer.onTagContentUnsafe { +"<!doctype html>" }
        return consumer.html {
            val client = createClient()
            renderComponentAsRoot(client, this, cb.eqL)
        }
    }

    private fun renderComponentAsRoot(
        client : Client,
        builder : HTML,
        cb : EqLambda<ShadeRootRender.()->Unit>
    ){
        val propObj = ComponentInitData(
            client = client,
            key = null,
            props = cb,
            renderIn = builder::class,
            treeDepth = 0,
            context = ShadeContext.empty
        )
        val component = constructComponent(ShadeRootComponent::class, propObj) as ShadeRootComponent
        client.renderRoot(builder, component)
    }

    /**
     * Just creates a new client.
     * You probably don't want to use this directly.
     */
    fun createClient() : Client {
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

        return client
    }

    /**
     * Creates a handler.
     * [send] should send data to the client over websocket, and [disconnect] should be called when the client disconnects
     * You should take care of calling [MessageHandler.onMessage] and [MessageHandler.onDisconnect]
     */
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
         * Ideally, the web framework should process these messages sequentially for a given websocket.
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
                        val error by lazy { JavascriptException(gson.fromJson(data, JavascriptExceptionDetails::class.java)) }
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

sealed class AddScriptStrategy {
    data class Inline(val production : Boolean) : AddScriptStrategy()
    data class AtPath(val path : String) : AddScriptStrategy()
}

interface ShadeRootRender {
    fun head(cb : ShadeRootComponent.(HEAD)->Unit)
    fun body(cb : ShadeRootComponent.(BODY)->Unit)
}

class ShadeRootComponent : ComponentInTag<EqLambda<ShadeRootRender.() -> Unit>, HTML>(), ShadeRootRender {
    private class RenderingData {
        val headCbs = ArrayList<ShadeRootComponent.(HEAD)->Unit>(1)
        val bodyCbs = ArrayList<ShadeRootComponent.(BODY)->Unit>(1)
    }
    private var rendering : RenderingData? = null
    override fun HTML.render() {
        try {
            val render = RenderingData()
            rendering = render
            props.raw(this@ShadeRootComponent)
            head {
                meta(charset = "UTF-8") {  }
                addShadeScript()
                render.headCbs.forEach { it(this) }
            }
            body {
                render.bodyCbs.forEach { it(this) }
            }
        } finally {
            rendering = null
        }
    }

    private fun HEAD.addShadeScript(){
        script {
            unsafe {
                //language=JavaScript 1.8
                raw(
                    """
                            window.shadeEndpoint = "${client.root.endpoint}";
                            window.shadeHost = ${if (client.root.host != null) "\"${client.root.host}\"" else "null"};
                            window.shadeId = "${client.clientId}";
                        """
                )
            }
        }
        when(val strat = client.root.addScriptStrategy){
            is AddScriptStrategy.Inline -> {
                script {
                    async = true
                    unsafe {
                        raw(if(strat.production) ShadeRoot.shadeProdScript else ShadeRoot.shadeDevScript)
                    }
                }
            }
            is AddScriptStrategy.AtPath -> {
                script(src = strat.path){
                    async = true
                }
            }
        }

    }
    override fun head(cb : ShadeRootComponent.(HEAD)->Unit){
        rendering!!.headCbs.add(cb)
    }
    override fun body(cb : ShadeRootComponent.(BODY)->Unit){
        rendering!!.bodyCbs.add(cb)
    }
}