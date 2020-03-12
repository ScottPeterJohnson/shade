package net.justmachinery.shade.routing

import kotlinx.html.Tag
import net.justmachinery.shade.AdvancedComponent

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
     * A transformation to apply to generated URLs to make them "external" i.e. what the client sees
     */
    open fun externalTransform(urlInfo : InternalUrlInfo) : ExternalUrlInfo = urlInfo

    /**
     * A transformation to apply to generated URLs, e.g. prepend them with some base path that's routed on elsewhere
     * but not within this routing spec.
     */
    open fun internalTransform(urlInfo : InternalUrlInfo) : InternalUrlInfo = urlInfo
}

class RoutedPage<QueryParams : QueryParamSpec>(val path : String?, val contents: QueryParams)
class RoutedPath<Contents>(val path : String, val contents : Contents)

interface ParamsHolderSupport {
    val allValid : Boolean
}

/**
 * A fully finished route, ready to be turned into a string or navigated to.
 */
class FinishedRoute(private val routeBeingBuilt: RouteBeingBuilt) {
    override fun toString() = asExternalUrl()
    fun asExternalUrl() = externalUrlInfo.render()
    fun asInternalUrl() = internalUrlInfo.render()
    fun asExternalUrlInfo() : ExternalUrlInfo = externalUrlInfo
    fun asInternalUrlInfo() : InternalUrlInfo = internalUrlInfo

    private val externalUrlInfo by lazy {
        routeBeingBuilt.base.externalTransform(internalUrlInfo)
    }
    private val internalUrlInfo by lazy {
        routeBeingBuilt.base.internalTransform(generateUrlInfo())
    }

    private fun generateUrlInfo() : BasicUrlInfo {
        val segments = mutableListOf<RouteBeingBuilt>()
        var current : RouteBeingBuilt? = routeBeingBuilt
        while(current != null){
            segments.add(current)
            current = current.previous
        }
        segments.reverse()

        return BasicUrlInfo(
            pathSegments = segments.mapNotNull { it.segment }.asSequence(),
            queryParams = segments.flatMap { it.queryParams.entries.asSequence().map { it.key to it.value }.asIterable() }.asSequence()
        )
    }

    /**
     * Replace the client's URL with this path.
     */
    fun navigate(component: AdvancedComponent<*, *>){
        val routingContext = component.context[routingComponentContextIdentifier]
        if(routingContext != null){
            component.client.executeScript("history.pushState(null, \"\", \"${asExternalUrl()}\")")
            routingContext.pathData.update(asInternalUrlInfo())
        } else {
            component.client.executeScript("window.location = \"${asExternalUrl()}\"")
        }
    }
}

/**
 * Internal class, except for generated code.
 */
class RouteBeingBuilt private constructor(
    internal val previous : RouteBeingBuilt? = null,
    internal val segment : String? = null,
    internal val queryParams : Map<String, String> = emptyMap(),
    internal val base : RoutingSpecBase
){
    fun next(path : String?, params : Map<String,String>) = RouteBeingBuilt(previous = this, segment = path, queryParams = params, base = base)

    companion object {
        fun begin(base : RoutingSpecBase, queryParams: Map<String, String>) : RouteBeingBuilt {
            return RouteBeingBuilt(base = base, queryParams = queryParams)
        }
    }
}