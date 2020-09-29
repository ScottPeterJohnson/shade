package net.justmachinery.shade.components

import kotlinx.css.Display
import kotlinx.css.display
import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.newBackgroundColorOnRerender
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.key
import net.justmachinery.shade.utility.withStyle

/**
 * This example tests efficient rerendering of components by key.
 * Like React, keys are used to distinguish between components added in arrays or foreach loops,
 * which might retain an identity but change their number or positioning.
 */
class KeyRerenderTest : Component<Unit>() {
    var numbersList by obs((0 until 10).toList())
    override fun HtmlBlockTag.render() {
        h2 { +"Rerendering" }
        style {
            //Animation should flash whenever a component is newly created.
            //language=CSS
            unsafe { raw("""
                @keyframes flash {
                    from {
                        background-color: black;
                    }
                    to {
                        background-color: white;
                    }
                }
                .flashNumber {
                    animation: flash 5s;
                }
            """.trimIndent()) }
        }

        div {
            +"This test should flash only components that move. 4 should never change."
        }
        div {
            withStyle {
                display = Display.flex
            }
            div {
                numbersList.forEach {
                    div(classes = "flashNumber") {
                        //We can give DOM elements keys
                        key = it.toString()
                        +"DOM $it"
                    }
                    if(it.rem(2) == 0){
                        span(classes = "flashNumber") {
                            +"($it is even)"
                        }
                    }
                }
            }
            div {
                numbersList.forEach {
                    add(KeyRerenderTestShow::class, it, key = it.toString())
                    if(it.rem(2) == 0){
                        span(classes = "flashNumber") {
                            +"($it is even)"
                        }
                    }
                }
            }
        }
        button {
            onClick {
                val sort = numbersList.sortedBy { Math.random() }.toMutableList()
                sort[sort.indexOf(4)] = sort[4]
                sort[4] = 4
                numbersList = sort
            }
            +"Shuffle list"
        }
    }
}

class KeyRerenderTestShow : Component<Int>() {
    override fun HtmlBlockTag.render() {
        div(classes = "flashNumber") {
            newBackgroundColorOnRerender()
            +"Component $props"
        }
    }
}