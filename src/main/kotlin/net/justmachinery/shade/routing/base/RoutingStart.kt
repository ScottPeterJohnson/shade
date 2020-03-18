package net.justmachinery.shade.routing.base

import kotlinx.html.Tag
import net.justmachinery.shade.*
import net.justmachinery.shade.component.AdvancedComponent

internal fun <RenderIn : Tag> RenderIn.startRoutingInternal(
    component: AdvancedComponent<*, *>,
    urlInfo: ExternalUrlInfo,
    urlTransform : (ExternalUrlInfo) -> InternalUrlInfo = { it },
    cb : WithRouting<RenderIn>.()->Unit
) {
    val globalState = component.client.ensureGlobalRouting(urlTransform)

    runChangeBatch(force = true) {
        globalState.pathData.update(urlTransform(urlInfo))
    }

    val context = RoutingContext(globalState.pathData)
    component.addContext(routingContextIdentifier, context){
        doRouting(component, cb)
    }
}



internal fun <RenderIn : Tag> RenderIn.routeInternal(
    component: AdvancedComponent<*, *>,
    cb : WithRouting<RenderIn>.()->Unit
){
    if(currentContext()[routingContextIdentifier] == null) throw IllegalStateException("Cannot start routing outside of a routing context.")
    doRouting(component, cb)
}

private fun <RenderIn : Tag> RenderIn.doRouting(
    component: AdvancedComponent<*, *>,
    cb : WithRouting<RenderIn>.()->Unit
){
    component.run {
        //Run in render block for efficiency + to permanently capture routing context
        renderWithNewComponent { component ->
            val routing = WithRouting(
                component,
                this@renderWithNewComponent
            )
            cb(routing)
            routing.finish()
        }
    }
}

