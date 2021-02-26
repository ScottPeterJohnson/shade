package net.justmachinery.shade

import io.javalin.Javalin
import io.javalin.http.Handler
import kotlinx.html.h2
import net.justmachinery.shade.components.RootComponent
import net.justmachinery.shade.routing.base.UrlInfo
import org.eclipse.jetty.websocket.api.Session
import java.awt.Desktop
import java.net.URI
import java.util.*


fun main(){
    setupTestLogging()
    //A simple demo page for Shade using the spark web framework.
    //Any web framework can be used, as long as it supports websockets.
    val app = Javalin.create {
        it.addStaticFiles("js")
        it.addStaticFiles("telephoneInput")
    }.start(9905)

    //This is a webserver specific shim that passes messages and events to Shade
    val sessions = Collections.synchronizedMap(mutableMapOf<Session, ShadeRoot.MessageHandler>())
    app.ws("/shade"){
        it.onMessage { ws ->
            sessions.getOrPut(ws.session){
                root.handler(
                    send = { ws.send(it) },
                    disconnect = { ws.session.close() }
                )
            }.onMessage(ws.message())
        }
        it.onClose {
            sessions.remove(it.session)?.onDisconnect()
        }
    }

    val shadeDemo = Handler { ctx ->
        //This is Jetty specific; it uses ISO8609 by default
        ctx.res.characterEncoding = "UTF-8"
        ctx.res.contentType = "text/html"
        //Let's throw some shade:
        root.render(ctx.res.writer) {
            head {}
            body { tag ->
                //Adding this line is convenient because Kotlin does not yet allow multiple receivers on a lambda
                tag.run {
                    h2 {
                        +"Shade test page"
                    }
                    //Look at RootComponent for a more in-depth overview of how to render with shade
                    add(
                        RootComponent::class, UrlInfo.of(
                            ctx.req.pathInfo,
                            ctx.req.queryString
                        )
                    )
                }
            }
        }
    }
    app.get("/test", shadeDemo)
    app.get("/test/*", shadeDemo)
    //Open the browser for this demo if we can
    if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
        Desktop.getDesktop().browse(URI("http://localhost:9905/test/"))
    }
}



val root = ShadeRoot(
    endpoint = "/shade",
    addScriptStrategy = AddScriptStrategy.AtPath("/shade-bundle.js")
)