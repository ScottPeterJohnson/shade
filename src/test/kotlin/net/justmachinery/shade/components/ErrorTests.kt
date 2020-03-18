package net.justmachinery.shade.components

import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.h2
import kotlinx.html.p
import net.justmachinery.shade.ComponentErrorHandlingContext
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.JavascriptException
import net.justmachinery.shade.onErrors
import net.justmachinery.shade.state.observable

class ErrorTests : Component<Unit>() {
    private var error by observable<ComponentErrorHandlingContext?>(
        null
    )
    override fun HtmlBlockTag.render() {
        h2 { +"Error collection and coroutines" }
        error?.let {
            p { +"Caught an error in ${it.source}: ${it.throwable}" }
        }
        onErrors({
            error = this
            true
        }){
            button{
                onClick {
                    //We can execute JS as necessary in our action handlers.
                    client.executeScript("setTimeout(function(){ throw Error(\"I am a delayed error\") }, 3000)")
                    //We can also evaluate JS expressions. This particular one will throw an error, which will
                    //appear as a JavascriptException.
                    val js = client.runExpression("notAValidSymbol").await()
                    //Both errors will by default appear in server logs.
                    println("Shouldn't get here: $js")
                }
                +"Click me to throw an error"
            }
            button{
                onClick {
                    try {
                        //This is an example of erroring from a JS Promise expression.
                        client.runPromise("new Promise(function(request, reject){ setTimeout(function(){ reject(Error(\"I am a delayed promise error\")) }, 3000) })").await()
                    } catch(e : JavascriptException){
                        //We can catch the error if necessary.
                        println("Error caught! $e")
                    }
                }
                +"Click me to throw a Promise error"
            }
        }

        button{
            onClick {
                //Since handlers run in coroutines, they can delay without consuming a thread.
                //However, this would block subsequent rendering for the client:
                //delay(100 * 1000 * 1000)
                //As only one user-event can be processed at a time.
                //Instead, we can launch a new coroutine:
                launch {
                    delay(100 * 1000 * 1000)
                }
            }
            +"Launch a long-running coroutine"
        }
    }
}