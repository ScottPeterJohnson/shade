package net.justmachinery.shade.routing

import kotlinx.html.Tag
import net.justmachinery.shade.AdvancedComponent
import java.net.URLEncoder

/**
 * A Router is a generated class containing callbacks you can override. It will handle the routing based on
 * the [RoutingSpec] it is generated from.
 */
abstract class Router<RenderIn : Tag> {
    //This function will be generated, and should probably not be called directly from user code.
    abstract fun dispatch(component : AdvancedComponent<*, *>, withRouting: WithRouting<RenderIn>)
}

/**
 * Defines a set of routes by its properties.
 * Properties of type RoutedPath and RoutedPage are used to generate a Router based on annotations.
 * The specific Contents of RoutedPaths are recursively entered to define a path hierarchy.
 */
abstract class RoutingSpec : QueryParamSpec {
    /**
     * A path is intermediate; in /foo/bar/baz it could be either foo or bar, but not baz.
     * The [Contents] type may contain more subpaths or pages.
     */
    fun <Contents : RoutingSpec> path(path : String = "", contents : Contents) = RoutedPath(path, contents)

    /**
     * An endpoint in routing.
     */
    fun <T : QueryParamSpec> page(path : String, spec : T) = RoutedPage(path, spec)
    fun page(path : String) = RoutedPage(path, NoQueryParameters)
    fun <T : QueryParamSpec> indexPage(spec : T) = RoutedPage(null, spec)
    fun indexPage() = RoutedPage(null, NoQueryParameters)
}

abstract class RoutingSpecBase : RoutingSpec() {
    /**
     * A base path to prepend to all URL paths generated by the routing spec builder.
     * Does not affect routing.
     */
    open val appendBasePath : String? = null
}

class RoutedPage<QueryParams : QueryParamSpec>(val path : String?, val contents: QueryParams)
class RoutedPath<Contents>(val path : String, val contents : Contents)



/**
 * A fully finished route, ready to be turned into a string or navigated to.
 */
class FinishedRoute(private val routeBeingBuilt: RouteBeingBuilt) {
    override fun toString() = render()
    fun render() : String {
        val reversedPath = StringBuilder()
        val queryString = StringBuilder()
        var current : RouteBeingBuilt? = routeBeingBuilt
        while(current != null){
            current.segment?.let {
                if(reversedPath.isNotEmpty()) { reversedPath.append("/") }
                reversedPath.append(it.reversed())
            }
            current.queryParams.forEach { (name, value) ->
                if(queryString.isEmpty()){
                    queryString.append("?")
                } else {
                    queryString.append("&")
                }
                queryString.append("${URLEncoder.encode(name, "UTF-8")}=${URLEncoder.encode(value, "UTF-8")}")
            }
            current = current.previous
        }
        val actualPath = reversedPath.reverse()
        return "${if(actualPath.startsWith("/")) "" else "/"}${actualPath}${queryString}"
    }

    fun asUrlInfo() : UrlInfo = BasicUrlInfo(
        pathSegments = pathSegmentSequence(),
        queryParams = queryParamSequence()
    )

    private fun pathSegmentSequence() = (sequence {
        var current: RouteBeingBuilt? = routeBeingBuilt
        while(current != null) {
            if(current.segment != null){
                yield(current.segment!!)
            }
            current = current.previous
        }
    }).toList().asReversed().asSequence()

    private fun queryParamSequence() = sequence {
        var current: RouteBeingBuilt? = routeBeingBuilt
        while(current != null){
            yieldAll(current.queryParams.entries.asSequence().map { it.key to it.value })
            current = current.previous
        }
    }

    /**
     * Replace the client's URL with this path.
     */
    fun navigate(component: AdvancedComponent<*, *>){
        val routingContext = component.context[routingComponentContextIdentifier]
        if(routingContext != null){
            component.client.executeScript("history.pushState(null, \"\", \"${render()}\")")
            routingContext.pathData.update(asUrlInfo())
        } else {
            component.client.executeScript("window.location = \"${render()}\"")
        }
    }
}

/**
 * Internal class, except for generated code.
 */
class RouteBeingBuilt(
    val previous : RouteBeingBuilt? = null,
    val segment : String? = null,
    val queryParams : Map<String, String> = emptyMap()
){
    fun next(path : String?, params : Map<String,String>) = RouteBeingBuilt(previous = this, segment = path, queryParams = params)

    companion object {
        fun fromBase(basePath : String?, queryParams: Map<String, String>) : RouteBeingBuilt {
            return if(basePath == null){
                RouteBeingBuilt()
            } else {
                val segments = UrlInfo.of(basePath, null)
                val iter = segments.pathSegments.iterator()
                var base = RouteBeingBuilt(segment = if(iter.hasNext()) iter.next() else null, queryParams = queryParams)
                while(iter.hasNext()){
                    base = RouteBeingBuilt(previous = base, segment = iter.next())
                }
                base
            }
        }
    }
}