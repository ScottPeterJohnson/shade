package net.justmachinery.shade.components

import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.html.*
import net.justmachinery.shade.ComponentErrorHandlingContext
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.JavascriptException
import net.justmachinery.shade.handleErrors
import net.justmachinery.shade.state.observable

class ErrorTests : Component<Unit>() {
    private var message by observable<String?>(null)
    private var error by observable<ComponentErrorHandlingContext?>(
        null
    )
    override fun HtmlBlockTag.render() {
        h2 { +"Error collection and coroutines" }
        message?.let {
            p { +it }
        }
        error?.let {
            p { +"Caught an error in ${it.source}: ${it.throwable}" }
        }
        handleErrors({
            if(throwable !is UncatchableError){
                error = this
                true
            } else {
                false
            }
        }){
            button{
                onClick {
                    //We can execute JS as necessary in our action handlers.
                    //(This error won't be caught by the surrounding error context because it throws in JS outside it)
                    client.executeScript("setTimeout(function(){ throw Error(\"I am a delayed error\") }, 3000)")
                    //We can also evaluate JS expressions. This particular one will throw an error, which will
                    //appear as a JavascriptException.
                    val js = client.runExpression("notAValidSymbol").await()
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

            div {
                handleErrors({
                    println("$throwable was caught")
                    throwable is ErrorTestException
                }){
                    button {
                        onClick {
                            throw ErrorTestException()
                        }
                        +"Error caught by inner handler"
                    }
                    button {
                        onClick {
                            throw IllegalStateException()
                        }
                        +"Error caught by outer handler"
                    }
                    button {
                        onClick {
                            throw UncatchableError()
                        }
                        +"Error not caught"
                    }
                }
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
                //This coroutine is tied to the component and will be interrupted when its component is unmounted
            }
            +"Launch a long-running coroutine"
        }
    }
}

class ErrorTestException : RuntimeException()

class UncatchableError : RuntimeException()