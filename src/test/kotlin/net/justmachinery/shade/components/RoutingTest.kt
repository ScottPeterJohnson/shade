package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.Component
import net.justmachinery.shade.generated.routing.SubDirectoryRouter
import net.justmachinery.shade.generated.routing.TestRoutingSpecRouter
import net.justmachinery.shade.generated.routing.build
import net.justmachinery.shade.routing.GenerateRouting
import net.justmachinery.shade.routing.RoutingSpec
import net.justmachinery.shade.routing.RoutingSpecBase

class RoutingTest : Component<Unit>(){
    override fun HtmlBlockTag.render() {
        h2 { +"Routing" }
        a(href = "routing"){ +"Click here to go to a routing page" }
    }
}

@GenerateRouting
object TestRoutingSpec : RoutingSpecBase() {
    override val appendBasePath: String = "/test/routing"

    val index = indexPage()
    val subPage = page("subpage")
    val subDirectory = path("subDirectory", SubDirectory)
}

object SubDirectory : RoutingSpec() {
    val index = indexPage()
    val subSubPage = page("sub")
}

class RoutingDemoPage : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        h2 { +"Routing pages" }
        dispatch(object : TestRoutingSpecRouter<HtmlBlockTag>(TestRoutingSpec) {
            override fun HtmlBlockTag.index() {
                p { +"This is the index page." }
            }

            override fun HtmlBlockTag.subPage() {
                p { +"This is a sub page." }
            }

            override fun subDirectory() = object: SubDirectoryRouter<HtmlBlockTag>() {
                override fun HtmlBlockTag.index() {
                    p { +"This is the index page of the subdirectory." }
                }
                override fun HtmlBlockTag.subSubPage() {
                    p { +"This is a subpage of the subdirectory." }
                }
            }
        })
        listOf(
            TestRoutingSpec.build().index(),
            TestRoutingSpec.build().subPage(),
            TestRoutingSpec.build().subDirectory().index(),
            TestRoutingSpec.build().subDirectory().subSubPage()
        ).forEach { route ->
            div {
                a(href = route.render()){ +route.render() }
            }
        }
    }
}