package net.justmachinery.shade.tests

import kotlinx.html.BODY
import net.justmachinery.shade.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.utility.gson
import java.time.Duration
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicBoolean

internal fun waitFor(timeoutMs : Long = 5000, description : String = "condition", condition : () -> Boolean){
    val start = System.currentTimeMillis()
    while(!condition()){
        if(System.currentTimeMillis() - start > timeoutMs){
            throw AssertionError("Timed out waiting for $description")
        }
        Thread.sleep(20)
    }
}

/**
 * Drives a [ShadeRoot] with no browser attached: renders a component tree to HTML, then stands in for the
 * websocket, recording every script Shade sends and letting a test feed client messages back.
 */
internal class ShadeTest(
    connectionDelay : Duration = Duration.ofSeconds(30)
) {
    val constructed : MutableList<AdvancedComponent<*, *>> = CopyOnWriteArrayList()
    val uncaughtJavascript : MutableList<JavascriptException> = CopyOnWriteArrayList()
    val disconnected = AtomicBoolean(false)
    private val sent : MutableList<String> = Collections.synchronizedList(mutableListOf())

    val root = ShadeRoot(
        endpoint = "/shade",
        maximumAcceptableConnectionDelay = connectionDelay,
        afterConstructComponent = { constructed.add(it) },
        onUncaughtJavascriptException = { _, exception -> uncaughtJavascript.add(exception) }
    )

    val client get() = root.allClients().single()

    lateinit var html : String
        private set
    lateinit var handler : ShadeRoot.MessageHandler
        private set

    /**
     * Renders [cb] into the page body, then connects the fake websocket.
     */
    fun render(cb : ShadeRootComponent.(BODY)->Unit) : ShadeTest {
        renderOnly(cb)
        connect()
        return this
    }

    /**
     * As [render], but leaves the client unconnected, so that scripts queued before connection can be inspected.
     */
    fun renderOnly(cb : ShadeRootComponent.(BODY)->Unit) : ShadeTest {
        html = root.render { body(cb) }
        return this
    }

    fun connect(){
        handler = root.handler(send = { sent.add(it) }, disconnect = { disconnected.set(true) })
        handler.onMessage(client.clientId.toString())
    }

    fun <T : AdvancedComponent<*, *>> component(of : Class<T>) : T = constructed.filterIsInstance(of).single()
    fun <T : AdvancedComponent<*, *>> components(of : Class<T>) : List<T> = constructed.filterIsInstance(of)

    /** Raw messages, still carrying the tag that a response should be addressed to. */
    fun messages() = synchronized(sent){ sent.toList() }
    /** Scripts Shade has sent to the client, with their message tags stripped. */
    fun scripts() = messages().map { it.substringAfter(messageTagSeparator) }
    fun clearSent() = synchronized(sent){ sent.clear() }

    /** The callback id that a response to [message] should be addressed to. */
    fun callbackIdOf(message : String) = message.substringBefore(messageTagSeparator).toLong()
    fun messageContaining(text : String) = messages().single { it.contains(text) }

    /** The HTML of each rerender [component] has sent, decoded from its reconcile script. */
    fun reconciles(component : AdvancedComponent<*, *>) : List<String> {
        val prefix = "${SocketScopeNames.reconcile.raw}(${component.renderState.componentId},\""
        return scripts()
            .filter { it.startsWith(prefix) }
            .map { unescapeJsString(it.removePrefix(prefix).removeSuffix("\");")) }
    }

    /**
     * Runs [change], waits for [component] to rerender in response, and returns the HTML it sent.
     * Rerenders are dispatched onto the client's coroutine scope, so they have not happened when [change] returns.
     */
    fun awaitRerender(component : AdvancedComponent<*, *>, change : ()->Unit) : String {
        val before = reconciles(component).size
        change()
        waitFor(description = "rerender of $component"){ reconciles(component).size > before }
        return reconciles(component).last()
    }

    /** Delivers a client event or response addressed to [callbackId]. */
    fun sendResponse(callbackId : Long, data : String = "") =
        handler.onMessage("$callbackId$messageTagSeparator$data")

    /** Delivers a JS error raised while running the script for [callbackId]. */
    fun sendError(callbackId : Long, name : String = "TypeError", message : String = "boom") =
        handler.onMessage("$messageTagErrorPrefix$callbackId$messageTagSeparator${errorJson(name, message)}")

    /** Delivers a JS error that is not attached to any callback. */
    fun sendGlobalError(name : String = "TypeError", message : String = "boom") =
        handler.onMessage("$messageTagErrorPrefix$messageTagSeparator${errorJson(name, message)}")

    private fun errorJson(name : String, message : String) = gson.toJson(
        mapOf("name" to name, "jsMessage" to message, "stack" to "at <anonymous>", "eval" to "someScript()")
    )
}

/**
 * Reverses the escaping Shade applies when it streams HTML into a JS string literal (see JsStringWriter).
 */
private fun unescapeJsString(escaped : String) : String {
    val out = StringBuilder(escaped.length)
    var i = 0
    while(i < escaped.length){
        val c = escaped[i]
        if(c != '\\'){
            out.append(c)
            i += 1
            continue
        }
        i += 1
        when(val code = escaped[i]){
            'n' -> { out.append('\n'); i += 1 }
            'r' -> { out.append('\r'); i += 1 }
            't' -> { out.append('\t'); i += 1 }
            'x' -> { out.append(escaped.substring(i + 1, i + 3).toInt(16).toChar()); i += 3 }
            'u' -> { out.append(escaped.substring(i + 1, i + 5).toInt(16).toChar()); i += 5 }
            else -> { out.append(code); i += 1 }
        }
    }
    return out.toString()
}

/**
 * Waits for [text] to appear on the page, whether in the first render or in a rerender sent afterwards.
 * A route that misses, for instance, only renders its notFound handler on a second pass, because recording
 * the miss is itself a state change.
 */
internal fun ShadeTest.assertShows(text : String) {
    waitFor(description = "'$text' to be rendered") {
        html.contains(text) || scripts().any { it.contains(text) }
    }
}

/**
 * The event handler directives in some rendered HTML, as (event name, callback id) in document order.
 * Shade emits these as `<script type="shade" ... data-e="click" data-i="7"></script>`.
 */
private val eventDirective = Regex("""data-e="([^"]+)"\s+data-i="(\d+)"""")
internal fun eventCallbacks(html : String) : List<Pair<String, Long>> =
    eventDirective.findAll(html).map { it.groupValues[1] to it.groupValues[2].toLong() }.toList()

internal fun callbackIdFor(html : String, eventName : String) : Long =
    eventCallbacks(html).single { it.first == eventName }.second
