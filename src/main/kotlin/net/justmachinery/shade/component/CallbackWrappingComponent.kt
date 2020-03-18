package net.justmachinery.shade.component

import kotlinx.html.Tag

/**
 * Used if a function that accepts a callback introduces a new component, and the callback captures the wrong component
 * (its parent) because Kotlin only supports a single receiver introduced at a time
 */
abstract class CallbackWrappingComponent<RenderIn : Tag, Props : CallbackWrappingComponent.BaseProps>(
    fullProps: ComponentInitData<Props>
) : AdvancedComponent<Props, RenderIn>(fullProps) {
    interface BaseProps {
        val realCb : Any //For debugging
        val parent : AdvancedComponent<*, *>
    }

    override fun RenderIn.render() {
        val parent = props.parent
        val oldRenderingFunction = parent.renderState.currentComponentOverride
        try {
            parent.renderState.currentComponentOverride = this@CallbackWrappingComponent
            callCb()
        } finally {
            parent.renderState.currentComponentOverride = oldRenderingFunction
        }
    }

    abstract fun RenderIn.callCb()

    override fun toString() = "${super.toString()}(${_props?.realCb?.javaClass})"
}