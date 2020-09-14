package net.justmachinery.shade.component

import kotlinx.html.Tag
import net.justmachinery.shade.EqLambda


class FunctionComponent<RenderIn : Tag>(fullProps : ComponentInitData<Props<RenderIn>>) : CallbackWrappingComponent<RenderIn, FunctionComponent.Props<RenderIn>>(fullProps) {
    data class Props<RenderIn : Tag>(
        override val cb : EqLambda<RenderIn.() -> Unit>,
        override val parent : AdvancedComponent<*, *>
    ) : BaseProps
    override fun RenderIn.callCb() {
        val cb = props.cb.raw
        cb()
    }
}