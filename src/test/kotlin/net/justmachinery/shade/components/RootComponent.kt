package net.justmachinery.shade.components

import kotlinx.coroutines.launch
import kotlinx.html.*
import net.justmachinery.shade.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.routing.base.UrlInfo
import java.time.Duration
import java.time.temporal.ChronoUnit

/**
 * This is our root component. A component is, like React, a combination of props, state, and the ability to rerender as
 * a chunk.
 */
class RootComponent : Component<UrlInfo /* Takes a single prop; the page URL */>() {
    //Render function. Should be a function of state and props, like React.
    override fun HtmlBlockTag.render() {
        //First we'll just do some top-level routing, to show different pages per different URLs.
        //This is the basic routing API; see the RoutingDemoPage for a more thorough explanation.
        startRouting(urlInfo = props, urlTransform = { it }){
            match("test"){
                route {
                    matchRoot {
                        add(RootPageComponent::class)
                    }
                    match("routing"){
                        add(RoutingDemoPage::class)
                    }
                    notFound {
                        div {
                            +"Page not found!"
                        }
                    }
                }
            }
        }
    }


}

class RootPageComponent : Component<Unit>(){
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()

            h1 {
                +"Welcome to Shade!"
            }

            add(BasicSubcomponent::class)

            add(TodoListSection::class)

            add(Counter::class)

            add(TableComponents::class)

            add(SharedStateComponents::class)

            add(ErrorTests::class)

            add(KeyRerenderTest::class)

            add(ApplyJsTest::class)

            add(ComputedState::class)

            add(RoutingTest::class)

            h2 { +"Demo settings" }

            button {
                onClick { rootRerenders += 1 }
                +"Rerender root (${rootRerenders})"
            }
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
                        client.root.simulateExtraDelay = if(delay == 0L) null else Duration.of(delay/2, ChronoUnit.MILLIS)
                    }
                }
            }
        }
    }

    var rootRerenders by observable(0)

    override fun mounted() {
        //The mounted() lifecycle function allows you to e.g. run JS expressions when the component is mounted
        launch {
            val result = client.runPromise("new Promise(function(resolve, reject){ setTimeout(function(){ resolve('foo') }, 3000)})").await()
            println("Component-mounted callback complete. Got: $result")
        }
    }
}