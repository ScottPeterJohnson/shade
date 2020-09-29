package net.justmachinery.shade.routing.base

import kotlinx.html.Tag
import net.justmachinery.shade.addContext
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.currentContext
import net.justmachinery.shade.state.ChangeBatchChangePolicy
import net.justmachinery.shade.state.runChangeBatch
import net.justmachinery.shade.utility.eqL
import kotlin.reflect.KClass

internal fun <RenderIn : Tag> RenderIn.startRoutingInternal(
    component: AdvancedComponent<*, *>,
    urlInfo: ExternalUrlInfo,
    urlTransform : (ExternalUrlInfo) -> InternalUrlInfo = { it },
    cb : WithRouting<RenderIn>.()->Unit
) {
    val globalState = component.client.ensureGlobalRouting(urlTransform)

    runChangeBatch(ChangeBatchChangePolicy.FORCE_ALLOWED) {
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
    @Suppress("UNCHECKED_CAST")
    component.run {
        add(
            component = RoutingComponent::class as KClass<RoutingComponent<RenderIn>>,
            props = RoutingComponent.Props(cb = cb.eqL)
        )
    }
}

