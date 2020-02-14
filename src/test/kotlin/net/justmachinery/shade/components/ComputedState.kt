package net.justmachinery.shade

import kotlinx.html.*

class ComputedState : Component<Unit>() {
    var firstNumber by react(5)
    var secondNumber by react(10)
    val sum by computed { firstNumber + secondNumber }
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
            +" = "
            render {
                div {
                    newBackgroundColorOnRerender()
                    +(sum.toString())
                }
            }
        }
    }
}