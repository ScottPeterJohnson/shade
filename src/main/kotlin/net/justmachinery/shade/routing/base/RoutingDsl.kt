package net.justmachinery.shade.routing.base

import kotlinx.html.HtmlTagMarker
import kotlinx.html.Tag
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.ObservableValue
import net.justmachinery.shade.RenderFunction
import net.justmachinery.shade.currentContext
import net.justmachinery.shade.routing.annotation.ParamsHolderSupport
import net.justmachinery.shade.routing.annotation.RoutedPage
import net.justmachinery.shade.routing.annotation.RoutedPath


@HtmlTagMarker
class WithRouting<RenderIn : Tag>(
    private val component: AdvancedComponent<*, *>,
    private val tag : RenderIn
) {
    private var hasMatched = false
    private val notFoundHandlers = mutableListOf<RenderFunction<RenderIn>>()

    private val routingContext = currentContext()[routingComponentContextIdentifier]!!

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
        val part = routingContext.currentPathFragment().get()
        if(!hasMatched && matcher(part)){
            hasMatched = true
            component.addContext(
                identifier = routingComponentContextIdentifier,
                value = routingContext.copy(currentPathSegment = routingContext.currentPathSegment + 1),
                cb = {
                    component.run {
                        tag.render {
                            cb()
                        }
                    }
                }
            )
        }
    }

    /**
     * If no match is found, all notFound() handlers will be called.
     */
    fun notFound(cb : RenderFunction<RenderIn>){
        notFoundHandlers.add(cb)
    }

    internal fun finish(){
        if(!hasMatched){
            notFoundHandlers.forEach {
                component.run {
                    tag.render {
                        it()
                    }
                }
            }
        }
    }
    fun getParam(name : String) : ObservableValue<String?> = routingContext.pathData.getParam(name)
}