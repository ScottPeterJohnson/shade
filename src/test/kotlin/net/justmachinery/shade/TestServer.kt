package net.justmachinery.shade

import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
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



class SubComponent(props : ComponentProps<Unit>) : Component<Unit>(props) {
    override fun HtmlBlockTag.render() {
        div {
            +"I am sub-component; hear me roar"
        }
    }
}

class PseudocodeComponent(props : ComponentProps<Unit>) : Component<Unit>(props) {
    var todo by state(emptyList<String>())
    override fun HtmlBlockTag.render() {
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
                                root.component(this, ComponentSpec(
                                    clazz = PseudocodeComponent::class,
                                    props = Unit,
                                    key = null
                                ))

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