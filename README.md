![Maven Central](https://img.shields.io/maven-central/v/net.justmachinery/shade)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# Shade

Shade is an experimental web library framework for Kotlin on the JVM. Using it allows you to quickly and efficiently
build interactive websites.

Conceptually, it's a combination of [Kweb](http://docs.kweb.io/en/latest/index.html), [React](https://reactjs.org/), [MobX](https://mobx.js.org/README.html), and the [kotlinx HTML DSL](https://github.com/Kotlin/kotlinx.html). The core idea is to:
- Write HTML with a server-side DSL, allowing you to use one language and treat writing webpages just like any other code
- Break that HTML into a series of logical components, which can be configured with properties and have internal state. Components will automatically rerender themselves when either changes.
- Communicate with user's web browser over a websocket connection, allowing seamless integration of
user actions and server-side responses

## A Quick Sample
This example shows a simple TODO list component:
```kotlin
class TodoList : Component<TodoList.Props>() {
    data class Props(val userName : String) : PropsType<Props, TodoList>()

    var todoList by observable(listOf<String>())
    var newItem = observable("")
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
        boundInput(newItem){
            type = InputType.text
        }
        button {
            onClick {
                todoList = todoList + newItem.value
            }
        }
    }
}
```
Whenever either the user name or the items in the todoList change, the view will update itself on the client.

It can be added from another component by simply calling:
```kotlin
add(TodoList.Props(userName = "Foo"))
```

## Cost/Benefit
While for developers this is a much better way to work, server-driven web pages aren't a free lunch. Consider your use case closely. Note that some of these tradeoffs will change as the framework
matures and opens up new ways to circumvent earlier limitations.

### Pros
- Only one language and target required: Kotlin JVM
- Very lightweight for the client, compared to hefty JS frameworks
- Page can render on the first server-client roundtrip, and update from there
- Extremely simple to do push notifications on the client
- Extremely simple to add action callbacks (no more defining routes!)
- Kotlinx DSL is excellent, complete and mostly type-safe
- Security is more straightforward, since most state and logic lives on the server and can't be easily faked

### Cons
- Latency. This could be a big drawback if your users have poor latency and need tons of actions to navigate your interfaces. (This might be improved in the future to "preload" changes on the client.)
- More work is done by the server. More bandwidth may be required for long lived, highly dynamic pages.
- State that lives on the server dies if that server does, which could interrupt user's work.

## How is Shade different from Kweb?
- Shade uses the Kotlinx HTML DSL
    - Kweb uses its own, less complete DSL
- Shade is less opinionated about choice of web server and is designed to be
drop-in for projects already using the Kotlinx HTML DSL, or embedded within any HTML
    - Kweb runs on its own Ktor server
- Shade does not (yet) provide database bindings
- Shade is based on components and reactive rerendering, like everything is wrapped in a granular kweb `render {}` block
    - Kweb has a more imperative update style
- Shade does not currently have any "immediate events" beyond allowing arbitrary JavaScript
- Shade likely has a faster initial page render than Kweb

[Kweb](http://docs.kweb.io/en/latest/index.html) is lovely and might be a better fit for your needs.

## Demo
Clone this project and run `./gradlew testServer` to play with a simple demo page. Check [TestServer.kt](https://github.com/ScottPeterJohnson/shade/blob/master/src/test/kotlin/net/justmachinery/shade/TestServer.kt) for an example source.

## Installation
Add the following to your Gradle build file:
```
dependencies {
    implementation "net.justmachinery:shade:VERSION"
}
```

Replace VERSION with the latest version of this repository (currently ![Maven Central](https://img.shields.io/maven-central/v/net.justmachinery/shade))

## Contributions welcome!
This is a highly experimental library. The core is simple enough to be functionally usable, but parts and polish may be lacking. Help us out by opening an issue or submitting a patch!

## Usage
### Routing
Shade does include support for routing, both basic and an annotation-based generator that
allows for both typesafe URL construction and navigation.

To use annotation-based routing, enable kapt then add `kapt "net.justmachinery:shade:VERSION"` to your gradle dependencies. Then, annotate an instance of `RoutingSpecBase` with `@GenerateRouting`.

See the included RoutingTest for a sample.