package net.justmachinery.shade

import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.computed
import net.justmachinery.shade.state.react

class ComputedState : Component<Unit>() {
    var firstNumber by react(5)
    var secondNumber by react(10)
    val sum by computed { firstNumber + secondNumber }
    val sumMod10 by computed { sum % 10 }
    val sumMod10Plus3 by computed { sumMod10 + 3 }
    override fun HtmlBlockTag.render() {
        h2 { +"Computed State" }
        div {
            render {
                div {
                    newBackgroundColorOnRerender()
                    input(type = InputType.number){
                        value = firstNumber.toString()
                        onValueInput { firstNumber = it.toIntOrNull() ?: 0 }
                    }

                }
            }
            +" + "
            render {
                div {
                    newBackgroundColorOnRerender()
                    input(type = InputType.number) {
                        value = secondNumber.toString()
                        onValueInput { secondNumber = it.toIntOrNull() ?: 0 }
                    }
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