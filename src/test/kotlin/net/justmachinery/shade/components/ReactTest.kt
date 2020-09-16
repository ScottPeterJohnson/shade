package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.state.obs

class ReactTest : Component<Unit>() {
    var counter by obs(0)
    override fun MountingContext.mounted() {
        react {
            println("The counter is $counter in react test $this")
        }
    }
    override fun HtmlBlockTag.render() {
        h2 { +"React test" }
        p { +"This uses a component-linked reaction to print while this component is mounted" }
        div {
            button {
                onClick {
                    counter += 1
                }
                +"Add to counter"
            }
        }
    }
}
