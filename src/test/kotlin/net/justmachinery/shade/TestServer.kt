package net.justmachinery.shade

import kotlinx.coroutines.GlobalScope
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


fun DIV.testBackground(){
    fun gen() = Random().nextInt(255).toString(16).padStart(2, '0')

    withStyle {
        backgroundColor = Color("#${gen()}${gen()}${gen()}")
    }
}

class RootComponent(props : ComponentProps<Unit>) : Component<Unit>(props) {
    var todo by observable(emptyList<String>())
    var counter = observable(0)
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            div {
                +"Hello!"
                add(SubComponent::class, Unit)
            }
            div {
                todo.forEach {
                    div {
                        +"TODO: $it"
                    }
                }
            }
            val newTaskName = captureInput {
                type = InputType.text
            }
            button {
                onClick = callbackString {
                    todo = todo + newTaskName.value.await()
                }
                +"New!"
            }
            div {
                button {
                    onClick = callbackString {
                        counter.value += 1
                    }
                    +"Add to counter"
                }
            }
            div {
                +"The counter is: "
                add(SubComponentShowingCounter::class, counter)
            }
        }
    }
}

class SubComponent(props : ComponentProps<Unit>) : Component<Unit>(props) {
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            +"I am sub-component; hear me roar"
        }
    }
}

class SubComponentShowingCounter(props : ComponentProps<ClientObservableState<Int>>) : Component<ClientObservableState<Int>>(props) {
    override fun HtmlBlockTag.render() {
        div {
            testBackground()
            +"Counter is $props"
        }
    }
}




class ServerTest {
    fun run(){
        ignite().apply {
            port(9905)
            webSocket("/shade", WebSocketHandler::class.java)
            get("/test"){ request, response ->
                ByteArrayOutputStream().let { baos ->
                    baos.writer().buffered().use {
                        it.appendHTML().html {
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
    }
}

val root = ShadeRoot(
    endpoint = "/shade"
)

@WebSocket
class WebSocketHandler {
    private val sessions = Collections.synchronizedMap(mutableMapOf<Session, ShadeRoot.MessageHandler>())
    @OnWebSocketConnect
    fun connected(session: Session) {}

    @OnWebSocketClose
    fun closed(session: Session, statusCode: Int, reason: String) {
        sessions.remove(session)?.onDisconnect()
    }

    @OnWebSocketMessage
    fun message(session: Session, message: String) {
        GlobalScope.launch {
            sessions.getOrPut(session){
                root.handler { session.remote.sendString(it) }
            }.onMessage(message)
        }
    }
}


fun main(){
    ServerTest().run()
}