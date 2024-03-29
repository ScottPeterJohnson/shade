package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.utility.applyJs

/**
 * Using applyJs() we can specify JS to be executed when a DOM element is rendered.
 */
class ApplyJsTest : Component<Unit>(){
    override fun HtmlBlockTag.render() {
        h2 { +"JS application" }
        div {
            applyJs("it.innerHTML = 'This text was added through JS';")
        }
    }
}