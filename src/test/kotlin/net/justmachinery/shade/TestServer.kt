package net.justmachinery.shade

import io.javalin.Javalin
import io.javalin.http.Handler
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.html.h2
import net.justmachinery.shade.components.RootComponent
import net.justmachinery.shade.routing.base.UrlInfo
import org.eclipse.jetty.websocket.api.Session
import java.awt.Desktop
import java.net.URI
import java.time.Duration
import java.util.*


fun main(){
    setupTestLogging()
    //A simple demo page for Shade using the spark web framework.
    //Any web framework can be used, as long as it supports websockets.
    val app = Javalin.create {
        it.staticFiles.add("js")
        it.staticFiles.add("telephoneInput")
    }.start(9905)
    _app = app

    //This is a webserver specific shim that passes messages and events to Shade
    val sessions = Collections.synchronizedMap(mutableMapOf<Session, ShadeRoot.MessageHandler>())
    app.ws("/shade"){
        it.onConnect {
            //Connected clients ping every minute
            it.session.idleTimeout = Duration.ofMinutes(2)
        }
        it.onMessage { ws ->
            //Your handler for this can be pretty simple.
            //Ours has a delay simulation testing feature you probably don't need.
            val session = sessions.getOrPut(ws.session){
                root.handler(
                    send = {
                        if(extraMessageDelay != null){
                            GlobalScope.launch {
                                extraMessageDelay?.let { delay(it.toMillis()) }
                                ws.send(it)
                            }
                        } else {
                            ws.send(it)
                        }
                    },
                    disconnect = {
                        ws.session.close()
                    }
                )
            }
            if(extraMessageDelay != null){
                GlobalScope.launch {
                    extraMessageDelay?.let { delay(it.toMillis()) }
                    session.onMessage(ws.message())
                }
            } else {
                session.onMessage(ws.message())
            }
        }
        it.onClose {
            sessions.remove(it.session)?.onDisconnect()
        }
    }

    val shadeDemo = Handler { ctx ->
        ctx.contentType("text/html;charset=UTF-8")
        //Let's throw some shade:
        root.render(ctx.outputStream().bufferedWriter()) {
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
                            ctx.req().pathInfo,
                            ctx.req().queryString
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


//You probably shouldn't pass things around globally in a production project (use dependency injection),
// but this was done here for simplicity
var _app : Javalin? = null
var extraMessageDelay : Duration? = null

val root = ShadeRoot(
    endpoint = "/shade",
    addScriptStrategy = AddScriptStrategy.AtPath("/shade-bundle.js")
)