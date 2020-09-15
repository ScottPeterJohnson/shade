package net.justmachinery.shade.routing.base

import kotlinx.html.HtmlTagMarker
import kotlinx.html.Tag
import net.justmachinery.shade.addContext
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.CallbackWrappingComponent
import net.justmachinery.shade.component.ComponentInitData
import net.justmachinery.shade.currentContext
import net.justmachinery.shade.handleErrors
import net.justmachinery.shade.routing.annotation.ParamsHolderSupport
import net.justmachinery.shade.routing.annotation.RoutedPage
import net.justmachinery.shade.routing.annotation.RoutedPath
import net.justmachinery.shade.state.ObservableValue
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.EqLambda
import net.justmachinery.shade.utility.RenderFunction


@HtmlTagMarker
class WithRouting<RenderIn : Tag>(
    private val routeComponent: AdvancedComponent<*, *>,
    private val tag : RenderIn
) {
    private val matches = mutableListOf<Pair<(String?)->Boolean, RenderFunction<RenderIn>>>()
    internal val notFoundHandlers = mutableListOf<RenderFunction<RenderIn>>()

    internal val routingContext = currentContext()[routingContextIdentifier]!!

    fun currentPathPart() = routingContext.currentPathFragment().get()
    fun queryParam(name : String) = routingContext.pathData.getParam(name)

    fun matchRoot(cb : RenderFunction<RenderIn>) {
        match({
            it == null || it.isEmpty()
        }, cb)
    }

    fun match(pathPart : String, cb : RenderFunction<RenderIn>) {
        match({
            it != null && it == pathPart
        }, cb)
    }
    fun match(page : RoutedPage<*>, support: ParamsHolderSupport? = null, cb : RenderFunction<RenderIn>) {
        match({
            (it == page.path || (page.path == null && it?.isEmpty() ?: true)) && (support == null || support.allValid)
        }, cb)
    }
    fun match(path : RoutedPath<*>, support: ParamsHolderSupport? = null, cb : RenderFunction<RenderIn>) {
        match({
            it != null && it == path.path && (support == null || support.allValid)
        }, cb)
    }
    fun match(matcher : (String?)->Boolean, cb : RenderFunction<RenderIn>) {
        matches.add(matcher to cb)
    }

    /**
     * If no match is found, all notFound() handlers will be called.
     */
    fun notFound(cb : RenderFunction<RenderIn>){
        notFoundHandlers.add(cb)
    }

    internal fun runMatching(){
        val part = currentPathPart()
        var hasMatched = false


        matches.forEach { (matcher, cb) ->
            if (!hasMatched && matcher(part)) {
                hasMatched = true
                routeComponent.addContext(
                    identifier = routingContextIdentifier,
                    value = routingContext.copy(currentPathSegment = routingContext.currentPathSegment + 1),
                    cb = {
                        routeComponent.run {
                            tag.render {
                                cb()
                            }
                        }
                    }
                )
            }
        }

        if(!hasMatched){
            throw PathNotFoundException(part + "")
        }
    }
    fun getParam(name : String) : ObservableValue<String?> = routingContext.pathData.getParam(name)
}

internal class RoutingComponent<RenderIn : Tag>(fullProps : ComponentInitData<Props<RenderIn>>) : CallbackWrappingComponent<RenderIn, RoutingComponent.Props<RenderIn>>(fullProps) {
    data class Props<RenderIn : Tag>(
        override val cb : EqLambda<WithRouting<RenderIn>.() -> Unit>,
        override val parent : AdvancedComponent<*, *>
    ) : BaseProps

    private var error by obs<Throwable?>(null)
    private var lastPathUpdate = -1

    override fun RenderIn.callCb() {
        val setupRouting = props.cb.raw
        val withRouting = WithRouting(
            this@RoutingComponent,
            this@callCb
        )
        setupRouting(withRouting)
        val hasNotFoundHandlers = withRouting.notFoundHandlers.isNotEmpty()
        val pathData = withRouting.routingContext.pathData

        if(error != null && pathData.updateIdentifier.get() == lastPathUpdate){
            withRouting.notFoundHandlers.forEach {
                it()
            }
        } else {
            if(hasNotFoundHandlers){
                handleErrors({
                    if(throwable is PathNotFoundException){
                        lastPathUpdate = pathData.updateIdentifier._value
                        error = throwable
                        true
                    } else {
                        false
                    }
                }){
                    withRouting.runMatching()
                }
            } else {
                withRouting.runMatching()
            }
        }
    }
}