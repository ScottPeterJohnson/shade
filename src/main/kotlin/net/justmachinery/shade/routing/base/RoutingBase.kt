package net.justmachinery.shade.routing.base

import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.ShadeContextIdentifier
import net.justmachinery.shade.currentContext

open class RoutingException(message : String) : RuntimeException(message)
class PathNotFoundException(message : String) : RoutingException(message)

data class RoutingContext(
    val pathData: PathData,
    internal var currentPathSegment : Int = 0
){
    fun currentPathFragment() = pathData.segmentAtIndex(currentPathSegment)

    companion object {
        fun get() = currentContext()[routingContextIdentifier]
            ?: throw IllegalStateException("Not currently routing")
    }
}
val routingContextIdentifier =
    ShadeContextIdentifier<RoutingContext>()
