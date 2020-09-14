package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs

class BoundInputTest : Component<Unit>() {
    var novel = obs("")
    override fun HtmlBlockTag.render() {
        h2 { +"A text input that does not allow the letter 'e'" }
        boundInput(
            novel,
            toString = { it },
            fromString = { it.filter { it != 'e' } }
        ){}
    }
}
