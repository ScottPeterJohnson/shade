package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.generated.routing.SubDirectoryRouter
import net.justmachinery.shade.generated.routing.TestRoutingSpecRouter
import net.justmachinery.shade.generated.routing.build
import net.justmachinery.shade.routing.annotation.processor.GenerateRouting
import net.justmachinery.shade.routing.annotation.QueryParamSpec
import net.justmachinery.shade.routing.annotation.RoutingSpec
import net.justmachinery.shade.routing.annotation.RoutingSpecBase
import net.justmachinery.shade.routing.base.InternalUrlInfo

class RoutingTest : Component<Unit>(){
    override fun HtmlBlockTag.render() {
        h2 { +"Routing" }
        a{
            navigate = TestRoutingSpec.build().index()
            +"Click here to go to a routing page"
        }
    }
}

@GenerateRouting
object TestRoutingSpec : RoutingSpecBase() {
    override fun internalTransform(urlInfo: InternalUrlInfo) = urlInfo.addPathPrefix("/test/routing")

    val index = indexPage()
    val subPage = page("subpage")
    val subDirectory = path("subDirectory", SubDirectory)

    val user = page("user", UserParams)

    val notFound = notFound()
}

object UserParams : QueryParamSpec {
    val id = intParam("id")
}

object SubDirectory : RoutingSpec() {
    val subDirectoryParam = stringParam("subDirectoryParam")

    val index = indexPage()
    val subSubPage = page("sub", SubSubPageParams)
}
object SubSubPageParams : QueryParamSpec {
    val isVerySub = booleanParam("isVerySub")
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

            override fun subDirectory(subDirectoryParams: SubDirectoryParams): SubDirectoryRouter<HtmlBlockTag> = object: SubDirectoryRouter<HtmlBlockTag>() {
                override fun HtmlBlockTag.index() {
                    p { +"This is the index page of the subdirectory." }
                    p { +"The subdirectory param is: ${subDirectoryParams.subDirectoryParam}"}
                }

                override fun HtmlBlockTag.subSubPage(params: SubSubPageParams) {
                    p { +"This is a subpage of the subdirectory. It is ${if(params.isVerySub) "very sub" else "not very sub"}" }
                    p { +"The subdirectory param is: ${subDirectoryParams.subDirectoryParam}"}
                }
            }

            override fun HtmlBlockTag.user(params: UserParams) {
                p { +"This is a user page for user ${params.id}" }
            }

            override fun HtmlBlockTag.notFound() {
                p { +"Subpage not found!" }
            }
        })
        listOf(
            TestRoutingSpec.build().index(),
            TestRoutingSpec.build().subPage(),
            TestRoutingSpec.build().subDirectory(subDirectoryParam = "foob").index(),
            TestRoutingSpec.build().subDirectory(subDirectoryParam = "baz").subSubPage(isVerySub = true),
            TestRoutingSpec.build().user(id = 49)
        ).forEach { route ->
            div {
                a(){
                    navigate = route
                    +route.asExternalUrl()
                }
            }
        }
    }
}