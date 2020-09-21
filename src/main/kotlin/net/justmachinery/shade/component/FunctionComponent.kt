package net.justmachinery.shade.component

import kotlinx.html.Tag
import net.justmachinery.shade.utility.EqLambda

/**
 * A component that just delegates to a render function
 */
class FunctionComponent<RenderIn : Tag> : ComponentInTag<FunctionComponent.Props<RenderIn>, RenderIn>() {
    data class Props<RenderIn : Tag>(
        val cb : EqLambda<RenderIn.() -> Unit>
    ) : PropsType<Props<RenderIn>, FunctionComponent<RenderIn>>()

    override fun RenderIn.render() {
        val cb = props.cb.raw
        cb()
    }

    override fun toString() = "FunctionComponent(${props.cb.raw})"
}