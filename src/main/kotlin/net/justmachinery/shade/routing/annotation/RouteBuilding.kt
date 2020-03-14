package net.justmachinery.shade.routing.annotation

import kotlinx.html.A
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.currentContext
import net.justmachinery.shade.routing.base.BasicUrlInfo
import net.justmachinery.shade.routing.base.ExternalUrlInfo
import net.justmachinery.shade.routing.base.InternalUrlInfo
import net.justmachinery.shade.routing.base.routingComponentContextIdentifier


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
            queryParams = segments.flatMap {
                it.queryParams.entries.asSequence().map { it.key to it.value }.asIterable()
            }.asSequence()
        )
    }

    /**
     * Replace the client's URL with this path.
     */
    fun navigate(component: AdvancedComponent<*, *>){
        val routingContext = currentContext()[routingComponentContextIdentifier]
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
    fun next(path : String?, params : Map<String,String>) =
        RouteBeingBuilt(
            previous = this,
            segment = path,
            queryParams = params,
            base = base
        )

    companion object {
        fun begin(base : RoutingSpecBase, queryParams: Map<String, String>) : RouteBeingBuilt {
            return RouteBeingBuilt(
                base = base,
                queryParams = queryParams
            )
        }
    }
}


internal fun routingSetNavigate(component: AdvancedComponent<*, *>, anchor : A, value : FinishedRoute?){
    if(value == null){
        anchor.attributes.remove("href")
        anchor.attributes.remove("onclick")
    } else {
        anchor.href = value.asExternalUrl()
        component.run {
            anchor.onClick(suffix = "event.preventDefault()") {
                value.navigate()
            }
        }
    }
}