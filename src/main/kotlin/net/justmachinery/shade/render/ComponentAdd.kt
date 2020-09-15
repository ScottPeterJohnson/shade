package net.justmachinery.shade.render

import kotlinx.html.Tag
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.ComponentBase
import net.justmachinery.shade.component.FunctionComponent
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.utility.RenderFunction
import net.justmachinery.shade.utility.eql
import kotlin.reflect.KClass

interface ComponentAdd : ComponentBase {
    /**
     * See [add]
     */
    fun <Props : PropsType<Props, T>, T : AdvancedComponent<Props, RenderIn>, RenderIn : Tag> RenderIn.add(pr : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(
            parent = realComponentThis(),
            block = this,
            component = pr.type,
            renderIn = this::class,
            props = pr,
            key = key
        )

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
    fun <RenderIn : Tag> RenderIn.render(cb : RenderFunction<RenderIn>){
        @Suppress("UNCHECKED_CAST")
        add(
            FunctionComponent::class as KClass<FunctionComponent<RenderIn>>,
            FunctionComponent.Props(
                cb = cb.eql,
                parent = thisComponent()
            )
        )
    }
}