package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.Component
import net.justmachinery.shade.ComponentInTag
import net.justmachinery.shade.newBackgroundColorOnRerender

class TableComponents : Component<Unit>(){
    override fun HtmlBlockTag.render() {
        h2 { +"Components restricted to certain tags" }
        table {
            tbody {
                //Here we add two table row components, which can only be added inside of a TBODY because their
                //component type is ComponentInTag<..., TBODY>
                add(TableRowComponent::class, 3)
                add(TableRowComponent::class, 4)
            }
        }
    }
}

class TableRowComponent : ComponentInTag<Int, TBODY>() {
    override fun TBODY.render() {
        tr {
            td {
                div {
                    newBackgroundColorOnRerender()
                    +"Table row component"
                }

            }
            td {
                +"Value: $props"
            }
        }
    }
}