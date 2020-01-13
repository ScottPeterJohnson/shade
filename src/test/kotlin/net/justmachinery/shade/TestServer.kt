package net.justmachinery.shade

import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.css.*
import kotlinx.html.*
import kotlinx.html.stream.createHTML
import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage
import org.eclipse.jetty.websocket.api.annotations.WebSocket
import spark.Service
import java.awt.Desktop
import java.net.URI
import java.time.Duration
import java.time.temporal.ChronoUnit
import java.util.*

fun main(){
    setupTestLogging()
    //A simple demo page for Shade using the spark web framework.
    //Any web framework can be used, as long as it supports websockets.
    Service.ignite().apply {
        port(9905)

        //Setup a websocket handler
        webSocketIdleTimeoutMillis(120 * 1000)
        webSocket("/shade", WebSocketHandler::class.java)

        //Create a test page that uses shade.
        get("/test"){ request, response ->
            createHTML(prettyPrint = false).html {
                body {
                    //You can mix shade with normal HTML templates.
                    h2 {
                        +"Shade test page"
                    }
                    root.installFramework(this){ context ->
                        root.component(context, this, RootComponent::class, Unit)
                    }
                }
            }
        }
    }
    if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
        Desktop.getDesktop().browse(URI("http://localhost:9905/test"));
    }
}

val root = ShadeRoot(
    endpoint = "/shade"
)

/**
 * The websocket handler just needs to pass messages to a client-associated shade handler, and be able to send messages in turn.
 */
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
            root.handler(
                send = { session.remote.sendString(it) },
                disconnect = { session.disconnect() }
            )
        }.onMessage(message)
    }
}

/**
 * This is our root component. A component is, like React, a combination of props, state, and the ability to rerender as
 * a chunk.
 */
class RootComponent : Component<Unit /* Takes effectively no props */>() {
    var rootRerenders by observable(0)
    //This is the syntax for an observable piece of per-component state.
    //When it's reassigned, this component is marked as dirty and will be redrawn.
    var todo by observable(emptyList<String>())
    var counter = observable(0)

    //We can also package state up in an observable wrapper class and pass it between components.
    inner class SharedRootState(context : ClientContext) : StateContainer(context){
        var text by observable("")
    }
    val sharedState = SharedRootState(context)

    var newTaskName : String = ""

    //Render function. Should be a function of state and props, like React.
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()

            h1 {
                +"Welcome to Shade!"
            }
            h2 {
                +"Basic subcomponent"
            }
            div {

                //We can add subcomponents anywhere.
                //This one takes no props.
                add(SubComponent::class)

                button {
                    onClick { rootRerenders += 1 }
                    +"Rerender root (${rootRerenders})"
                }
            }

            render { //Anonymous component/render block
                div {
                    newBackgroundColorOnRerender()
                    h2 {
                        +"List of TODO components"
                    }

                    div {
                        //All standard kotlin logic is supported. Render however makes sense to you.
                        todo.forEach {
                            add(TodoComponent::class, it)
                        }
                    }

                    input {
                        type = InputType.text
                        //Here we directly one-way bind the input's value to serverside state.
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
                }
            }


            h2 { +"A simple counter" }
            div {
                button {
                    onClick {
                        counter.value += 1
                    }
                    +"Add to counter"
                }
            }
            div {
                +"This subcomponent takes the counter as a prop, and outputs it: "
                //This is an example of passing a prop that changes.
                //It's also an example of using the related props class to specify the component.
                add(SubComponentShowingCounter.Props(counter = counter))
            }

            h2 { +"Components restricted to certain tags" }
            table {
                tbody {
                    //Here we add two table row components, which can only be added inside of a TBODY because their
                    //component type is ComponentInTag<..., TBODY>
                    add(TableRowComponent::class, 3)
                    add(TableRowComponent::class, 4)
                }
            }

            h2 {
                +"These two components share state"
            }
            div { +"This one reads it:" }
            add(SharedStateRender::class, sharedState)
            div { +"This one modifies it:" }
            add(SharedStateInput::class, sharedState)

            h2 { +"Error collection and coroutines" }
            button{
                onClick {
                    //We can execute JS as necessary in our action handlers.
                    context.executeScript("setTimeout(function(){ throw Error(\"I am a delayed error\") }, 3000)")
                    //We can also evaluate JS expressions. This particular one will throw an error, which will
                    //appear as a JavascriptException.
                    val js = context.runExpression("notAValidSymbol").await()
                    //Both errors will by default appear in server logs.
                    println("Shouldn't get here: $js")
                }
                +"Click me to throw an error"
            }
            button{
                onClick {
                    try {
                        //This is an example of erroring from a JS Promise expression.
                        context.runPromise("new Promise(function(request, reject){ setTimeout(function(){ reject(Error(\"I am a delayed promise error\")) }, 3000) })").await()
                    } catch(e : JavascriptException){
                        //We can catch the error if necessary.
                        println("Error caught! $e")
                    }
                }
                +"Click me to throw a Promise error"
            }
            button{
                onClick {
                    //Since handlers run in coroutines, they can delay without consuming a thread
                    delay(100 * 1000 * 1000)
                }
                +"Launch a long-running coroutine"
            }

            h2 { +"Rerendering" }
            add(KeyRerenderTest::class)

            h2 { +"JS application" }
            add(ApplyJsTest::class)

            h2 { +"Demo settings" }
            div {
                //Input delay compensation can route user inputs from a past render to the current one, so long as
                //those inputs happened on the same place in this component's render tree.
                //Otherwise, old inputs will be lost if a rerender removes the element they were applicable to.
                +"Simulate extra delay (ms): "
                input(type = InputType.number){
                    min = "0"
                    max = "10000"
                    value = "0"
                    onValueChange {
                        val delay = it.toLong()
                        //Halve the delay (it's a round trip)
                        context.root.simulateExtraDelay = if(delay == 0L) null else Duration.of(delay/2, ChronoUnit.MILLIS)
                    }
                }
            }
        }
    }

    override fun mounted() {
        //The mounted() lifecycle function allows you to e.g. run JS expressions when the component is mounted
        launch {
            val result = context.runPromise("new Promise(function(resolve, reject){ setTimeout(function(){ resolve('foo') }, 3000)})").await()
            println("Component-mounted callback complete. Got: $result")
        }
    }
}

//Helper function just displays a new background color to make it easy to tell what causes a rerender.
fun DIV.newBackgroundColorOnRerender(){
    fun gen() = Random().nextInt(255).toString(16).padStart(2, '0')

    withStyle {
        backgroundColor = Color("#${gen()}${gen()}${gen()}40")
    }
}


class TodoComponent : Component<String>() {
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()
            +"TODO: $props"
        }
    }
}

class SubComponent : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()
            +"This text was rendered in a sub component."
        }
    }
}

private class SubComponentShowingCounter : Component<SubComponentShowingCounter.Props>() {
    data class Props (val counter : ClientObservableState<Int>) : PropsType<Props, SubComponentShowingCounter>()
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()
            +"Counter is ${props.counter} ✓"
        }
    }
}

class TableRowComponent : ComponentInTag<Int, TBODY>() {
    override fun TBODY.render() {
        tr {
            td {
                div {
                    newBackgroundColorOnRerender()
                    +"Table row component"
                }

            }
            td {
                +"Value: $props"
            }
        }
    }
}

class SharedStateRender : Component<RootComponent.SharedRootState>(){
    override fun HtmlBlockTag.render() {
        +"You entered: ${props.text}"
    }
}

class SharedStateInput : Component<RootComponent.SharedRootState>(){
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

/**
 * This example tests efficient rerendering of components by key.
 * Like React, keys are used to distinguish between components added in arrays or foreach loops,
 * which might retain an identity but change their number or positioning.
 */
class KeyRerenderTest : Component<Unit>() {
    var numbersList by observable((0 until 10).toList())
    override fun HtmlBlockTag.render() {
        style {
            //Animation should flash whenever a component is newly created.
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
            +"This test should flash only components that move. 4 should never change."
        }
        div {
            withStyle {
                display = Display.flex
            }
            div {
                numbersList.forEach {
                    div(classes = "flashNumber") {
                        //We can give DOM elements keys
                        key = it.toString()
                        +"DOM $it"
                    }
                    if(it.rem(2) == 0){
                        span(classes = "flashNumber") {
                            +"($it is even)"
                        }
                    }
                }
            }
            div {
                numbersList.forEach {
                    add(KeyRerenderTestShow::class, it, key = it.toString())
                    if(it.rem(2) == 0){
                        span(classes = "flashNumber") {
                            +"($it is even)"
                        }
                    }
                }
            }
        }
        button {
            onClick {
                val sort = numbersList.sortedBy { Math.random() }.toMutableList()
                sort[sort.indexOf(4)] = sort[4]
                sort[4] = 4
                numbersList = sort
            }
            +"Shuffle list"
        }
    }
}

class KeyRerenderTestShow : Component<Int>() {
    override fun HtmlBlockTag.render() {
        div(classes = "flashNumber") {
            newBackgroundColorOnRerender()
            +"Component $props"
        }
    }
}

/**
 * Using applyJs() we can specify JS to be executed when a DOM element is created, but not on subsequent rerenders.
 * This component uses this wrongly to change DOM, which can be overridden on a rerender.
 */
class ApplyJsTest : Component<Unit>(){
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

//This code is used in the README, and is replicated here to make sure it compiles.
class TodoList : Component<TodoList.Props>() {
    data class Props(val userName : String) : PropsType<Props, TodoList>()

    var todoList by observable(listOf<String>())
    var newItem by observable("")
    override fun HtmlBlockTag.render(){
        p {
            +"Hello, "
            span {
                withStyle {
                    fontWeight = FontWeight.bold
                }
                +props.userName
            }
        }
        todoList.forEach { item ->
            div {
                key = item
                +"TODO: "
                +item
            }
        }
        +"Add a new item:"
        input(type = InputType.text){
            onValueChange {
                newItem = it
            }
        }
        button {
            onClick {
                todoList = todoList + newItem
            }
        }
    }
}