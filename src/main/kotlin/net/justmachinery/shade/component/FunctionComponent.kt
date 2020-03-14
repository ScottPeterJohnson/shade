package net.justmachinery.shade.component

import kotlinx.html.Tag


class FunctionComponent<RenderIn : Tag>(fullProps : ComponentInitData<Props<RenderIn>>) : AdvancedComponent<FunctionComponent.Props<RenderIn>, RenderIn>(fullProps){
    data class Props<RenderIn : Tag>(
        val cb : RenderIn.(FunctionComponent<RenderIn>)->Unit,
        val realCb : Any, //For debugging
        val parent : AdvancedComponent<*, *>
    )
    override fun RenderIn.render() {
        val parent = props.parent
        val cb = props.cb
        try {
            parent.renderState.renderingFunction = this@FunctionComponent
            cb(this@FunctionComponent)
        } finally {
            parent.renderState.renderingFunction = null
        }
    }

    override fun toString() = "FunctionComponent(${_props?.realCb?.javaClass})"
}