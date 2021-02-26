package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.INPUT
import kotlinx.html.InputType
import kotlinx.html.input
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.utility.EqLambda
import net.justmachinery.shade.utility.GetSet
import net.justmachinery.shade.utility.Json

class BoundCheckbox : Component<BoundCheckbox.Props>() {
    data class Props(
        val bound: GetSet<Boolean>,
        val cb: EqLambda<INPUT.() -> Unit>
    ) : PropsType<Props, BoundCheckbox>()
    override fun HtmlBlockTag.render() {
        add(BoundTag.Props(
            bound = props.bound,
            cb = props.cb,
            behavior = object : BoundTag.BoundTagBehavior<Boolean, INPUT> {
                override val toJs = EqLambda<(Boolean) -> Json> {
                    Json(if(it) "true" else "false")
                }
                override val fromJs = EqLambda<(Json)->Boolean> {
                    it.raw == "true"
                }
                override val normalize = BoundTag.Normalize.Never
                override val changeEvents = listOf("change")
                /**
                 * The HTML checkbox has whacky "value" behavior and value is really the "checked" property
                 */
                override val getValueJs = "it.checked"
                override val setValueJs = "it.checked = value"

                override fun HtmlBlockTag.tag(cb: INPUT.() -> Unit) {
                    input {
                        type = InputType.checkBox
                        cb()
                    }
                }
            }
        ))
    }
}