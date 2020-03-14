package net.justmachinery.shade.routing.base

import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.ComponentContextIdentifier
import net.justmachinery.shade.currentContext


open class RoutingException(message : String) : RuntimeException(message)

data class RoutingComponentContext(
    val pathData: PathData,
    internal var currentPathSegment : Int = 0
){
    fun currentPathFragment() = pathData.segmentAtIndex(currentPathSegment)

    companion object {
        fun get(component: AdvancedComponent<*, *>) = currentContext()[routingComponentContextIdentifier]
            ?: throw IllegalStateException("Not currently routing")
    }
}
val routingComponentContextIdentifier =
    ComponentContextIdentifier<RoutingComponentContext>()
