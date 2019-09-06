package net.justmachinery.shade

import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.css.Color
import kotlinx.css.backgroundColor
import kotlinx.html.*
import kotlinx.html.stream.appendHTML
import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage
import org.eclipse.jetty.websocket.api.annotations.WebSocket
import spark.Service.ignite
import java.io.ByteArrayOutputStream
import java.util.*

fun main(){
    ServerTest().run()
}

fun DIV.testBackground(){
    fun gen() = Random().nextInt(255).toString(16).padStart(2, '0')

    withStyle {
        backgroundColor = Color("#${gen()}${gen()}${gen()}")
    }
}

class SharedRootState(context : ClientContext) : StateContainer(context){
    var text by observable("")
}

class RootComponent(props : Props<Unit>) : Component<Unit, HtmlBlockTag>(props) {
    var todo by observable(emptyList<String>())
    var counter = observable(0)
    val sharedState = SharedRootState(context)
    var newTaskName : String = ""
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            div {
                +"Hello!"
                add(SubComponent::class, Unit)
            }

            div {
                todo.forEach {
                    add(TodoComponent::class, it)
                }
            }

            input {
                type = InputType.text
                onValueChange {
                    newTaskName = it
                }
            }
            button {
                onClick {
                    todo = todo + newTaskName
                }
                +"New!"
            }
            div {
                button {
                    onClick {
                        counter.value += 1
                    }
                    +"Add to counter"
                }
            }
            div {
                +"The counter is: "
                add(SubComponentShowingCounter::class, counter)
            }
            table {
                tbody {
                    add(TableRowComponent::class, 3)
                    add(TableRowComponent::class, 4)
                }
            }
            add(SharedStateRender::class, sharedState)
            add(SharedStateInput::class, sharedState)

            button{
                onClick {
                    context.executeScript("setTimeout(function(){ throw Error(\"I am a delayed error\") }, 3000)")
                    val js = context.runExpression("notAValidSymbol").await()
                    println("Shouldn't get here: $js")
                }
                +"Click me to throw an error"
            }
            button{
                onClick {
                    try {
                        context.runPromise("new Promise(function(request, reject){ setTimeout(function(){ reject(Error(\"I am a delayed promise error\")) }, 3000) })").await()
                    } catch(e : JavascriptException){
                        println("Error caught! $e")
                    }
                }
                +"Click me to throw a Promise error"
            }
            button{
                onClick {
                    delay(100 * 1000 * 1000)
                }
                +"Launch a long-running coroutine"
            }

            add(KeyRerenderTest::class, Unit)

            add(ApplyJsTest::class, Unit)
        }
    }

    override fun mounted() {
        launch {
            val result = context.runPromise("new Promise(function(resolve, reject){ setTimeout(function(){ resolve('foo') }, 3000)})").await()
            println("Got: $result")
        }
    }
}

class TodoComponent(props : Props<String>) : Component<String, HtmlBlockTag>(props){
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            +"TODO: $props"
        }
    }
}

class SubComponent(props : Props<Unit>) : Component<Unit, HtmlBlockTag>(props) {
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            +"I am sub-component; hear me roar"
        }
    }
}

private class SubComponentShowingCounter(props : Props<ClientObservableState<Int>>) : Component<ClientObservableState<Int>, HtmlBlockTag>(props) {
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            +"Counter is $props ✓"
        }
    }
}

class TableRowComponent(props : Props<Int>) : Component<Int, TBODY>(props) {
    override fun TBODY.render() {
        tr {
            td {
                div {
                    testBackground()
                    +"Hello!"
                }

            }
            td {
                +"I am $props"
            }
        }
    }
}

class SharedStateRender(props : Props<SharedRootState>) : Component<SharedRootState, HtmlBlockTag>(props){
    override fun HtmlBlockTag.render() {
        +"You entered: ${props.text}"
    }
}

class SharedStateInput(props : Props<SharedRootState>) : Component<SharedRootState, HtmlBlockTag>(props){
    override fun HtmlBlockTag.render() {
        div {
            input {
                onValueInput {
                    props.text = it
                }
            }
        }
    }
}

class KeyRerenderTest(fullProps : Props<Unit>) : Component<Unit, HtmlBlockTag>(fullProps) {
    var numbersList by observable((0 until 10).toList())
    override fun HtmlBlockTag.render() {
        style {
            //language=CSS
            unsafe { raw("""
                @keyframes flash {
                    from {
                        background-color: black;
                    }
                    to {
                        background-color: white;
                    }
                }
                .flashNumber {
                    animation: flash 5s;
                }
            """.trimIndent()) }
        }
        div {
            numbersList.forEach {
                div(classes = "flashNumber") {
                    key = it.toString()
                    +"I am $it"
                }
                if(it.rem(2) == 0){
                    div(classes = "flashNumber") {
                        +"I am not a number"
                    }
                }
            }
            numbersList.forEach {
                add(KeyRerenderTestShow::class, it, key = it.toString())
                if(it.rem(2) == 0){
                    div(classes = "flashNumber") {
                        +"I am also not a number"
                    }
                }
            }
        }
        button {
            onClick {
                numbersList = numbersList.sortedBy { Math.random() }
            }
            +"Shuffle list"
        }
    }
}

class KeyRerenderTestShow(fullProps : Props<Int>) : Component<Int, HtmlBlockTag>(fullProps){
    override fun HtmlBlockTag.render() {
        div(classes = "flashNumber") {
            testBackground()
            +"I am component $props"
        }
    }
}

class ApplyJsTest(fullProps : Props<Unit>) : Component<Unit, HtmlBlockTag>(fullProps){
    var unchanged by observable(0)
    var counter by observable(0)
    override fun HtmlBlockTag.render() {
        div {
            applyJs("it.innerHTML = 'hello world'; console.log('js applied: $counter')")
        }
        button {
            onClick {
                unchanged += 1
            }
            +"Click to rerender w/o changing JS ($unchanged)"
        }
        button {
            onClick {
                counter += 1
            }
            +"Click to rerender w/ changing JS ($counter)"
        }
    }
}


class ServerTest {
    fun run(){
        ignite().apply {
            port(9905)
            get("/test"){ request, response ->
                ByteArrayOutputStream().let { baos ->
                    baos.writer().buffered().use {
                        it.appendHTML(prettyPrint = false).html {
                            body {
                                root.installFramework(this){ context ->
                                    root.component(context, this, RootComponent::class, Unit)
                                }
                            }
                        }
                    }
                    baos.toByteArray().toString(Charsets.UTF_8)
                }
            }
        }
        ignite().apply {
            port(9906)
            webSocketIdleTimeoutMillis(120 * 1000)
            webSocket("/shade", WebSocketHandler::class.java)
            get("/test"){ request, response ->
                "<div>Hello world!</div>"
            }
        }
    }
}

val root = ShadeRoot(
    endpoint = "/shade",
    host = "localhost:9906"
)

@WebSocket
class WebSocketHandler {
    private val sessions = Collections.synchronizedMap(mutableMapOf<Session, ShadeRoot.MessageHandler>())
    @OnWebSocketConnect
    fun connected(session: Session) {}

    @OnWebSocketClose
    fun closed(session: Session, statusCode: Int, reason: String?) {
        sessions.remove(session)?.onDisconnect()
    }

    @OnWebSocketMessage
    fun message(session: Session, message: String) {

        sessions.getOrPut(session){
            root.handler(send = { session.remote.sendString(it) }, disconnect = { session.disconnect() })
        }.onMessage(message)
    }
}