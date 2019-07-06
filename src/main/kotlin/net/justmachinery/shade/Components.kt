package net.justmachinery.shade

import kotlinx.html.FlowOrInteractiveOrPhrasingContent
import kotlinx.html.HtmlBlockTag
import kotlinx.html.INPUT
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.addComponent
import kotlin.reflect.KClass



open class ComponentProps<T : Any>(
    val context : ShadeContext,
    val props : T,
    val key : String? = null,
    val kClass : KClass<out Component<T>>
)


abstract class Component<Props : Any>(fullProps : ComponentProps<Props>) {
    var props = fullProps.props
    val context = fullProps.context
    val key = fullProps.key
    val kClass = fullProps.kClass

    //Main render function to override.
    abstract fun HtmlBlockTag.render()

    //Lifecycle functions.
    fun afterMount(){}
    fun beforeUnmount(){}
    open fun onCatch(throwable: Throwable) : Boolean = false

    //Useful helper functions and aliases
    fun FlowOrInteractiveOrPhrasingContent.captureInput(cb : INPUT.()->Unit) = renderCaptureInput(context, cb)
    fun <T> state(initial : T) = ClientState(context, initial)
    fun callbackString(cb : suspend ()->Unit) = context.callbackString(cb)
    fun <T : Any> HtmlBlockTag.add(component : KClass<out Component<T>>, props : T, key : String? = null) =
        addComponent(this@Component, this, component, props, key)


    internal val renderState = ComponentRenderState()
}


