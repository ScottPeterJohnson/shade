package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.h2
import kotlinx.html.p
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.EqLambda
import net.justmachinery.shade.utility.getSet

class BoundInputTest : Component<Unit>() {
    var noEAllowed by obs("")
    var allCaps by obs("")
    var checkbox by obs(false)
    enum class Selected {
        FIRST,
        SECOND,
        THIRD
    }
    var selected by obs(Selected.FIRST)
    override fun HtmlBlockTag.render() {
        h2 { +"Bound input test" }
        button {
            onClick {
                noEAllowed = ""
                checkbox = false
                selected = Selected.FIRST
            }
            +"Reset this section"
        }
        p { +"A text input that does not allow the letter 'e'" }
        boundInput(
            ::noEAllowed.getSet,
            toString = { it },
            fromString = { it.filter { it != 'e' } },
            normalize = BoundTag.Normalize.Immediately
        ){}
        p {
            +"A text input that converts to CAPS on blur"
        }
        boundInput(
            ::allCaps.getSet,
            toString = { it },
            fromString = { it.toUpperCase() },
            normalize = BoundTag.Normalize.OnBlur
        ){}
        p { +"This checkbox is ${if(checkbox) "checked" else "not checked"}" }
        boundCheckbox(::checkbox.getSet){
            +"Checked"
        }
        p { +"$selected is selected" }
        add(Select.Props(
            selected = ::selected.getSet,
            options = Selected.values().toList(),
            render = EqLambda { it.name }
        ))
    }
}
