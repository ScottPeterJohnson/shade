package net.justmachinery.shade.component

import kotlinx.html.Tag


class FunctionComponent<RenderIn : Tag>(fullProps : ComponentInitData<Props<RenderIn>>) : CallbackWrappingComponent<RenderIn, FunctionComponent.Props<RenderIn>>(fullProps) {
    data class Props<RenderIn : Tag>(
        val cb : RenderIn.(FunctionComponent<RenderIn>)->Unit,
        override val realCb : Any, //For debugging
        override val parent : AdvancedComponent<*, *>
    ) : BaseProps
    override fun RenderIn.callCb() {
        val cb = props.cb
        cb(this@FunctionComponent)
    }
}