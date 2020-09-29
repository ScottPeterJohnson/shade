package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.INPUT
import kotlinx.html.InputType
import kotlinx.html.input
import net.justmachinery.shade.AttributeNames
import net.justmachinery.shade.SocketScopeNames
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.state.Atom
import net.justmachinery.shade.utility.EqLambda
import net.justmachinery.shade.utility.GetSet
import java.util.concurrent.atomic.AtomicInteger

/**
 * The HTML checkbox has whacky "value" behavior and value is really the "checked" property
 */
class BoundCheckbox : Component<BoundCheckbox.Props>(){
    companion object {
        private val checkboxId = AtomicInteger(0)
    }
    data class Props(
        val bound: GetSet<Boolean>,
        val cb: EqLambda<INPUT.() -> Unit>
    ) : PropsType<Props, BoundCheckbox>()

    private val bindingId = checkboxId.incrementAndGet()
    private var serverSeen = 0
    private var lastKnownInput : Boolean? = null
    private var checkChange = Atom()
    override fun MountingContext.mounted() {
        react {
            checkChange.reportObserved()
            val value = props.bound.get()
            if(value != lastKnownInput){
                client.executeScript("${SocketScopeNames.updateBoundCheckbox.raw}($bindingId,$serverSeen,${if(value) "1" else "0"})")
            }
            lastKnownInput = null
        }
    }
    override fun HtmlBlockTag.render() {
        input {
            type = InputType.checkBox
            attributes[AttributeNames.Checkbox.raw] = bindingId.toString()
            onChange(prefix = "it.boundSeen+=1", data = "it.checked") {
                serverSeen += 1
                val checked = it!!.raw == "true"
                lastKnownInput = checked
                props.bound.set(checked)
                checkChange.reportChanged()
            }
            props.cb.raw(this)
        }
    }
}