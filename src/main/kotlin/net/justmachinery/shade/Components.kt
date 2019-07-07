package net.justmachinery.shade

import kotlinx.html.FlowOrInteractiveOrPhrasingContent
import kotlinx.html.HtmlBlockTag
import kotlinx.html.INPUT
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.addComponent
import kotlin.reflect.KClass



open class ComponentProps<T : Any>(
    val context : ClientContext,
    val props : T,
    val key : String? = null,
    val kClass : KClass<out Component<T>>,
    val treeDepth : Int
)

/**
 * A Component renders a chunk of DOM which can attach server-side callbacks on client-side events.
 * It is automatically rerendered when any observable state used in its render function changes.
 * Note that instances of this class MUST have a constructor that accepts the single fullProps parameter.
 */
abstract class Component<Props : Any>(fullProps : ComponentProps<Props>) {
    var props = fullProps.props
    val context = fullProps.context
    val key = fullProps.key
    val kClass = fullProps.kClass
    internal val treeDepth = fullProps.treeDepth
    internal val renderState = ComponentRenderState()

    /**
     * Main function to implement. This will be called whenever any observable state used in it changes.
     */
    abstract fun HtmlBlockTag.render()

    //Lifecycle functions.
    fun mounted(){}
    fun unmounted(){}
    /**
     * Allows a component to catch errors.
     * If true, error has been handled by this component.
     */
    open fun onCatch(throwable: Throwable) : Boolean = false

    //Useful helper functions and aliases
    fun FlowOrInteractiveOrPhrasingContent.captureInput(cb : INPUT.()->Unit) = renderCaptureInput(context, cb)
    fun <T> observable(initial : T) = ClientObservableState(context, initial)
    fun callbackString(cb : suspend ()->Unit): String {
        val (id, js) = context.callbackString(cb)
        renderState.lastRenderCallbackIds.add(id)
        return js
    }
    fun <T : Any> HtmlBlockTag.add(component : KClass<out Component<T>>, props : T, key : String? = null) =
        addComponent(this@Component, this, component, props, key)


}


