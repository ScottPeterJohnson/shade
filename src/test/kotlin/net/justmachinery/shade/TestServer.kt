package net.justmachinery.shade

import kotlinx.html.body
import kotlinx.html.h2
import kotlinx.html.html
import kotlinx.html.stream.createHTML
import net.justmachinery.shade.components.RootComponent
import net.justmachinery.shade.routing.UrlInfo
import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage
import org.eclipse.jetty.websocket.api.annotations.WebSocket
import spark.Route
import spark.Service
import java.awt.Desktop
import java.net.URI
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
        val shadeDemo = Route { request, response ->
            createHTML(prettyPrint = false).html {
                body {
                    //You can mix shade with normal kotlinx HTML templates.
                    h2 {
                        +"Shade test page"
                    }
                    //Let's throw some shade:
                    root.installFramework(this){ client ->
                        root.component(
                            client = client,
                            builder = this,
                            //Look at RootComponent for a more in-depth overview of how to render with shade
                            root = RootComponent::class,
                            props = UrlInfo.of(
                                request.pathInfo(),
                                request.queryString()
                            )
                        )
                    }
                }
            }
        }
        get("/test", shadeDemo)
        get("/test/*", shadeDemo)
    }
    //Open the browser for this demo if we can
    if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
        Desktop.getDesktop().browse(URI("http://localhost:9905/test/"));
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