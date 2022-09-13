package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.observable

class ConditionalRenderingTest : Component<Unit>() {
    var showSection by observable(true)
    override fun HtmlBlockTag.render() {
        h2 { +"Conditional Rendering Test" }
        if(showSection){
            +"This section disappears on click"
        }
        button {
            onClick {
                showSection = !showSection
            }
            +"Toggle"
        }
        render {
            +"This text should not be affected"
        }
    }
}