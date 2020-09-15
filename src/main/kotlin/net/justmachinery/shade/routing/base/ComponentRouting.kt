package net.justmachinery.shade.routing.base

import kotlinx.html.A
import kotlinx.html.Tag
import net.justmachinery.shade.component.ComponentBase
import net.justmachinery.shade.routing.annotation.FinishedRoute
import net.justmachinery.shade.routing.annotation.Router
import net.justmachinery.shade.routing.annotation.routingSetNavigate

interface ComponentRouting : ComponentBase {
    /**
     * Dispatch to a router based on any remaining path segments in the current routing context.
     */
    fun <RenderIn : Tag> RenderIn.dispatch(router : Router<RenderIn>) {
        route {
            router.dispatch(realComponentThis(), this@route)
        }
    }

    /**
     * Create a new routing context and dispatch it to a router.
     * See [startRouting]
     */
    fun <RenderIn : Tag> RenderIn.startDispatching(urlInfo: ExternalUrlInfo, urlTransform: (ExternalUrlInfo) -> InternalUrlInfo, router : Router<RenderIn>)  {
        startRouting(urlInfo, urlTransform) {
            router.dispatch(realComponentThis(), this@startRouting)
        }
    }

    /**
     * Create a new routing context and begin matching on it.
     * The [urlInfo] passed should contain the full path (not including the scheme or host e.g. https), and query parameters
     * not including "?".
     * Provide a [urlTransform] function to transform the URL to one to be routed on by e.g. removing a prefix from the path.
     * This transform will apply to URLs updated from the client.
     */
    fun <RenderIn : Tag> RenderIn.startRouting(urlInfo: ExternalUrlInfo, urlTransform : (ExternalUrlInfo)->InternalUrlInfo, cb : WithRouting<RenderIn>.()->Unit) = startRoutingInternal(realComponentThis(), urlInfo, urlTransform, cb)

    /**
     * Route within remaining path segments in the current routing context.
     */
    fun <RenderIn : Tag> RenderIn.route(cb : WithRouting<RenderIn>.()->Unit) = routeInternal(realComponentThis(), cb)

    fun FinishedRoute.navigate(){
        this.navigate(realComponentThis())
    }
    var A.navigate : FinishedRoute?
        get() = throw NotImplementedError()
        set(value){
            routingSetNavigate(realComponentThis(), this, value)
        }
}