package net.justmachinery.shade.routing.annotation

import kotlinx.html.Tag
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.routing.base.ExternalUrlInfo
import net.justmachinery.shade.routing.base.InternalUrlInfo
import net.justmachinery.shade.routing.base.WithRouting

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
    fun <Contents : RoutingSpec> path(path : String = "", contents : Contents) =
        RoutedPath(path, contents)

    /**
     * An endpoint in routing.
     */
    fun <T : QueryParamSpec> page(path : String, spec : T) =
        RoutedPage(path, spec)
    fun page(path : String) = RoutedPage(
        path,
        NoQueryParameters
    )
    fun <T : QueryParamSpec> indexPage(spec : T) =
        RoutedPage(null, spec)
    fun indexPage() = RoutedPage(null, NoQueryParameters)

    /**
     * Generates a not-found handler. The closest not-found handler in the hierarchy will fire if nothing matched.
     */
    fun notFound() = NotFound()
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
class NotFound

