[ ![Download](https://api.bintray.com/packages/scottpjohnson/generic/shade/images/download.svg) ](https://bintray.com/scottpjohnson/generic/shade/_latestVersion)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# Shade

Shade is an experimental web library framework for Kotlin. Using it allows you to quickly and efficiently
build interactive websites.

Conceptually, it's a combination of [Kweb](http://docs.kweb.io/en/latest/index.html), [React](https://reactjs.org/), [MobX](https://mobx.js.org/README.html), and the [kotlinx HTML DSL](https://github.com/Kotlin/kotlinx.html).

## How is Shade different from Kweb?
- Shade uses the Kotlinx HTML DSL
- Shade is less opinionated about choice of web server and is designed to be
drop-in for projects already using the Kotlinx HTML DSL
- Shade does not provide routing or database bindings
- Shade is based on components and reactive rerendering, like everything is wrapped in a granular kweb `render {}` block

## Demo
Clone this project and run `./gradlew testServer` to play with a simple demo page. Check [TestServer.kt](https://github.com/ScottPeterJohnson/shade/blob/master/src/test/kotlin/net/justmachinery/shade/TestServer.kt) for an example source.

## Installation
Add the following to your Gradle build file:
```
maven { url 'https://dl.bintray.com/scottpjohnson/generic/' }
dependencies {
    compile "net.justmachinery:shade:VERSION"
}
```

Replace VERSION with the latest version of this repository (currently [ ![Download](https://api.bintray.com/packages/scottpjohnson/generic/shade/images/download.svg) ](https://bintray.com/scottpjohnson/generic/shade/_latestVersion))

## Contributions welcome!
This is a highly experimental library. The core is simple enough to be functionally usable, but parts and polish may be lacking. Help us out by opening an issue or submitting a patch!
