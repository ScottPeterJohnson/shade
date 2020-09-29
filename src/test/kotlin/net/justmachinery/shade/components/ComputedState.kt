package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.newBackgroundColorOnRerender
import net.justmachinery.shade.state.computed
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.getSet

class ComputedState : Component<Unit>() {
    var firstNumber by obs(5)
    var secondNumber by obs(10)
    val sum by computed { firstNumber + secondNumber }
    val sumMod10 by computed { sum % 10 }
    val sumMod10Plus3 by computed { sumMod10 + 3 }
    override fun HtmlBlockTag.render() {
        h2 { +"Computed State" }
        div {
            render {
                div {
                    newBackgroundColorOnRerender()
                    //intInput is a boundInput helper
                    intInput(::firstNumber.getSet){}

                }
            }
            +" + "
            render {
                div {
                    newBackgroundColorOnRerender()
                    intInput(::secondNumber.getSet){}
                }
            }
            render {
                div {
                    newBackgroundColorOnRerender()
                    +" = "
                    +(sum.toString())
                }
            }
            render {
                div {
                    newBackgroundColorOnRerender()
                    +" % 10 = "
                    +(sumMod10.toString())
                }
            }
            render {
                div {
                    newBackgroundColorOnRerender()
                    +" + 3 = "
                    +(sumMod10Plus3.toString())
                }
            }
        }
    }
}