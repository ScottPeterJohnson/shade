package net.justmachinery.shade

import kotlinx.html.*
import kotlinx.html.stream.appendHTML
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.reflect.KClass
import kotlin.reflect.KProperty


internal class ComponentHandle(val context : ShadeContext, val component : Component<*>){
    private val componentId = UUID.randomUUID()

    internal fun HtmlBlockTag.renderInternal(){
        div {
            id = componentId.toString()
            component.run { render() }
        }
    }
    internal fun reRender(){
        val html = ByteArrayOutputStream().let { baos ->
            baos.writer().buffered().use {
                it.appendHTML().div {
                    component.run { render() }
                }
            }
            baos.toByteArray()
        }
        val base64 = Base64.getEncoder().encode(html).toString(Charsets.UTF_8)
        context.executeScript("r(\"$componentId\",\"$base64\");")
    }
}

data class ComponentContext(val shade : ShadeContext, val identifier: ComponentHierarchyIdentifier)

data class ComponentSpec<Props>(val clazz : KClass<out Component<Props>>, val props : Props, val key : String?)

open class ComponentProps<T>(
    val context : ComponentContext,
    val key : String? = null,
    val props : T
)


abstract class Component<Props>(fullProps : ComponentProps<Props>) {
    val props = fullProps.props
    val context = fullProps.context
    val key = fullProps.key

    abstract fun HtmlBlockTag.render()
    fun afterMount(){}
    fun beforeUnmount(){}
    open fun onCatch(throwable: Throwable) : Boolean = false

    fun FlowOrInteractiveOrPhrasingContent.captureInput(cb : INPUT.()->Unit) : InputReference {
        val inputId = UUID.randomUUID()
        input {
            id = inputId.toString()
            cb()
        }
        return InputReference(context.shade, inputId)
    }

    fun <T> state(initial : T) = ClientState(context.shade, initial)
    fun callbackString(cb : suspend ()->Unit) = context.shade.callbackString(cb)
    fun <T> HtmlBlockTag.add(component : KClass<out Component<T>>, props : T, key : String? = null){
        val comp = component.java.getDeclaredConstructor(ComponentProps::class.java).newInstance(ComponentProps(
            context = context,
            props = props,
            key = key
        ))
        ComponentHandle(context.shade, comp).run {
            renderInternal()
        }
    }
}

class ClientState<T>(private val context : ShadeContext, private var initial : T) {
    private val dependentComponents = mutableSetOf<Component<*>>()
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T {
        context.currentlyRenderingComponent?.let {
            dependentComponents.add(it)
        }
        return initial
    }
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        if(context.currentlyRenderingComponent != null){
            throw IllegalStateException("State cannot be set from inside render")
        }
        context.needReRender.addAll(dependentComponents)
        initial = value
    }
}



