package net.justmachinery.shade.components

import kotlinx.css.Color
import kotlinx.css.color
import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.Atom
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.state.observable
import net.justmachinery.shade.utility.getSet
import net.justmachinery.shade.utility.withStyle

/**
 * We can set the attributes of a tag within a component, which when rerendered should update appropriately.
 */
class AttributeSetTest : Component<Unit>(){
    private var first by observable(false)
    private var second by observable(false)
    private var third by observable(false)
    private var inputV by obs("Colored input")
    private val forceRerender = Atom()
    override fun HtmlBlockTag.render() {
        h2 { +"Attribute application test" }
        label {
            boundCheckbox(::first.getSet){}
            +"First"
        }
        label {
            boundCheckbox(::second.getSet){}
            +"Second"
        }
        label {
            boundCheckbox(::third.getSet){}
            +"Third"
        }
        div {
            nestedColors()
            +"Colored text"
        }
        boundInput(::inputV.getSet){
            nestedColors()
        }

        render {
            forceRerender.reportObserved()
            div {
                nestedColors()
                +"Nested component attribute set"
            }
            button {
                onClick {
                    forceRerender.reportChanged()
                }
                +"Rerender outer"
            }
        }
    }

    private fun CommonAttributeGroupFacade.nestedColors(){
        render {
            if(first){
                withStyle {
                    color = Color.blue
                }
            }
            render {
                if(second){
                    withStyle {
                        color = Color.green
                    }
                }
            }
        }
        render {
            if(third){
                withStyle {
                    color = Color.red
                }
            }
        }
    }
}
