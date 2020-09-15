package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.h2
import kotlinx.html.p
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs

class BoundInputTest : Component<Unit>() {
    var novel = obs("")
    var checkbox = obs(false)
    enum class Selected {
        FIRST,
        SECOND,
        THIRD
    }
    val selected = obs(Selected.FIRST)
    override fun HtmlBlockTag.render() {
        h2 { +"Bound input test" }
        button {
            onClick {
                novel.value = ""
                checkbox.value = false
                selected.value = Selected.FIRST
            }
            +"Reset this section"
        }
        p { +"A text input that does not allow the letter 'e'" }
        boundInput(
            novel,
            toString = { it },
            fromString = { it.filter { it != 'e' } }
        ){}
        p { +"This checkbox is ${if(checkbox.value) "checked" else "not checked"}" }
        boundCheckbox(checkbox){
            +"Checked"
        }
        p { +"${selected.value} is selected" }
        add(Select.Props(
            selected = selected,
            options = Selected.values().toList(),
            render = { it.name }
        ))
    }
}
