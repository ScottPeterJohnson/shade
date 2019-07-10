package net.justmachinery.shade

import kotlinx.html.FlowOrInteractiveOrPhrasingContent
import kotlinx.html.INPUT
import kotlinx.html.Tag
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.addComponent
import kotlin.reflect.KClass



open class Props<T : Any>(
    val context : ClientContext,
    val props : T,
    val key : String? = null,
    val kClass : KClass<out Component<T, *>>,
    val renderIn : KClass<out Tag>,
    val treeDepth : Int
)

/**
 * A Component renders a chunk of DOM which can attach server-side callbacks on client-side events.
 * It is automatically rerendered when any observable state used in its render function changes.
 * Note that instances of this class MUST have a constructor that accepts the single fullProps parameter.
 */
abstract class Component<PropType : Any, RenderIn : Tag>(fullProps : Props<PropType>) {
    var props = fullProps.props
    val context = fullProps.context
    val key = fullProps.key
    val kClass = fullProps.kClass
    val renderIn = fullProps.renderIn
    internal val treeDepth = fullProps.treeDepth
    internal val renderState = ComponentRenderState()
    @Suppress("LeakingThis")
    internal val ref = ComponentReference(this)

    /**
     * Main function to implement. This will be called whenever any observable state used in it changes.
     */
    abstract fun RenderIn.render()

    //Lifecycle functions.
    open fun mounted(){}
    open fun unmounted(){}

    internal fun doUnmount(){
        ref.component = null
        unmounted()
    }
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

    fun <Props : Any, RenderIn : Tag> RenderIn.add(component : KClass<out Component<Props, RenderIn>>, props : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(this@Component, this, component, this::class, props, key)


}

//This allows for components to be unmounted and garbage collected while still retaining references in state
internal data class ComponentReference(var component : Component<*,*>?)


