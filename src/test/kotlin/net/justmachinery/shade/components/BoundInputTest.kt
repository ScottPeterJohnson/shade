package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.futility.getSet
import net.justmachinery.futility.lambdas.EqLambda
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs
import java.util.*

class BoundInputTest : Component<Unit>() {
    private class InnerState {
        var noEAllowed by obs("")
        var allCaps by obs("")
        var checkbox by obs(false)
        var nonboundCheckbox by obs(false)
        enum class Selected {
            FIRST,
            SECOND,
            THIRD
        }
        var selected by obs(Selected.FIRST)

        fun reset(){
            allCaps = ""
            noEAllowed = ""
            checkbox = false
            selected = Selected.FIRST
        }
    }

    private var state by obs(InnerState())

    override fun HtmlBlockTag.render() {
        h2 { +"Bound input test" }
        button {
            onClick {
                state.reset()
            }
            +"Reset this section"
        }
        button {
            onClick {
                state = InnerState()
            }
            +"Reset (outer)"
        }
        p { +"A text input that does not allow the letter 'e'" }
        boundInput(
            state::noEAllowed.getSet,
            toString = { it },
            fromString = { it.filter { it != 'e' } },
            normalize = BoundTag.Normalize.Immediately
        ){}
        p {
            +"A text input that converts to CAPS on blur"
        }
        boundInput(
            state::allCaps.getSet,
            toString = { it },
            fromString = { it.uppercase(Locale.getDefault()) },
            normalize = BoundTag.Normalize.OnBlur
        ){}
        p { +"This checkbox is ${if(state.checkbox) "checked" else "not checked"}" }
        boundCheckbox(state::checkbox.getSet){
            +"Checked"
        }
        p {
            +"This is a non-bound checkbox whose checked attribute is toggled"
        }
        input(type = InputType.checkBox) {
            onChange = "event.preventDefault()"
            checked = state.nonboundCheckbox
        }
        button {
            onClick {
                state.nonboundCheckbox = !state.nonboundCheckbox
            }
            +"Toggle"
        }
        p { +"${state.selected} is selected" }
        add(Select.Props(
            selected = state::selected.getSet,
            options = InnerState.Selected.values().toList(),
            render = EqLambda { it.name }
        ))
    }
}