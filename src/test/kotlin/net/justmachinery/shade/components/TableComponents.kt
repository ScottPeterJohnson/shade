package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.ComponentInTag
import net.justmachinery.shade.newBackgroundColorOnRerender
import net.justmachinery.shade.state.Atom

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
    val rerender = Atom()
    override fun TBODY.render() {
        rerender.reportObserved()
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
            td {
                button {
                    onClick {
                        rerender.reportChanged()
                    }
                    +"Rerender"
                }
            }
        }
    }
}