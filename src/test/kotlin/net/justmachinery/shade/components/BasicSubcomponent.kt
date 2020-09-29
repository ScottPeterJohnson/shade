package net.justmachinery.shade.components

import kotlinx.css.Color
import kotlinx.css.backgroundColor
import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.utility.withStyle

class BasicSubcomponent : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        h2 {
            +"Basic subcomponent"
        }
        div {

            //We can add subcomponents anywhere.
            //This one takes no props.
            add(SubComponent::class)
        }
    }
}

class SubComponent : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div {
            render {
                withStyle {
                    backgroundColor = Color.aliceBlue
                }
            }
            +"This text was rendered in a sub component."
        }
    }
}