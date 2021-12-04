package net.justmachinery.shade.render

import kotlinx.html.Tag
import net.justmachinery.shade.DirectiveType
import net.justmachinery.shade.component.*
import net.justmachinery.shade.componentIdPrefix
import net.justmachinery.shade.contextInRenderingThread
import net.justmachinery.shade.utility.RenderFunction
import net.justmachinery.shade.utility.eqL
import kotlin.reflect.KClass

interface ComponentAdd : ComponentBase {
    /**
     * See [add]
     */
    fun <Props : PropsType<Props, T>, T : AdvancedComponent<Props, RenderIn>, RenderIn : Tag> RenderIn.add(props : Props, key : String? = null) =
        add(props.type, props, key)


    /**
     * See [add]
     */
    fun <RenderIn : Tag> RenderIn.add(component : KClass<out AdvancedComponent<Unit, RenderIn>>, key : String? = null) = add(component, Unit, key)

    /**
     * Adds a component at this point in the render tree, with the given component class and props.
     * During the execution of a render function this may either create a new component (always on first render),
     * or reuse an existing one.
     */
    fun <Props : Any, RenderIn : Tag> RenderIn.add(component : KClass<out AdvancedComponent<Props, RenderIn>>, props : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(
            parent = realComponentThis(),
            block = this,
            component = component,
            renderIn = this::class,
            props = props,
            key = key
        )

    /**
     * Renders a new block as if it were an anonymous subcomponent; i.e. it alone will rerender if its dependencies
     * change.
     * Note that the component context captured from the render function passed in will be wrong, but is hackily fixed
     * for shade functions like e.g. onChange.
     */
    fun <RenderIn : Tag> RenderIn.render(key : String? = null, cb : RenderFunction<RenderIn>){
        @Suppress("UNCHECKED_CAST")
        add(
            FunctionComponent::class as KClass<FunctionComponent<RenderIn>>,
            FunctionComponent.Props(
                cb = cb.eqL
            ),
            key = key
        )
    }
}


private fun <T : Any, RenderIn : Tag> addComponent(
    parent : AdvancedComponent<*, *>,
    block : RenderIn,
    component : KClass<out AdvancedComponent<T, RenderIn>>,
    renderIn : KClass<out Tag>,
    props : T,
    key : String? = null
){
    val (renderType, comp) = getOrConstructComponent(parent, component, renderIn, props, key)
    when(renderType){
        GetComponentResult.NEW, GetComponentResult.EXISTING_RERENDER -> {
            renderInternal(comp, block, addMarkers = true)
            if(renderType == GetComponentResult.NEW){
                addMounted(comp)
            }
        }
        GetComponentResult.EXISTING_KEEP -> {
            block.scriptDirective(
                type = DirectiveType.ComponentKeep,
                id = componentIdPrefix + comp.renderState.componentId.toString(),
                key = comp.key
            )
        }
    }

    parent.renderState.location?.let {
        it.newRenderTreeLocation.children.add(RenderTreeChild.ComponentChild(it.renderTreeChildIndex, comp))
        it.renderTreeChildIndex += 1
    }
}

private enum class GetComponentResult {
    NEW,
    EXISTING_RERENDER,
    EXISTING_KEEP
}

private fun <T : Any, RenderIn : Tag> getOrConstructComponent(
    parent : AdvancedComponent<*, *>,
    component : KClass<out AdvancedComponent<T, RenderIn>>,
    renderIn : KClass<out Tag>,
    props : T,
    key : String? = null
) : Pair<GetComponentResult, AdvancedComponent<T, RenderIn>> {
    parent.renderState.location?.let { frame ->
        val oldComponent = if(key != null){
            frame.oldRenderTreeLocation?.children?.firstOrNull { it is RenderTreeChild.ComponentChild && it.component.key == key }
        } else {
            frame.oldRenderTreeLocation?.children?.getOrNull(frame.renderTreeChildIndex)
        }
        if(oldComponent is RenderTreeChild.ComponentChild && oldComponent.component::class == component){
            @Suppress("UNCHECKED_CAST")
            (oldComponent.component as AdvancedComponent<T, RenderIn>)
            return if(oldComponent.component._props == props){
                GetComponentResult.EXISTING_KEEP to oldComponent.component
            } else {
                oldComponent.component.updateProps(props)
                GetComponentResult.EXISTING_RERENDER to oldComponent.component
            }
        }
    }
    return GetComponentResult.NEW to parent.client.root.constructComponent(
        component,
        ComponentInitData(
            client = parent.client,
            props = props,
            key = key,
            renderIn = renderIn,
            treeDepth = parent.treeDepth + 1,
            context = contextInRenderingThread.get()!!
        )
    )
}