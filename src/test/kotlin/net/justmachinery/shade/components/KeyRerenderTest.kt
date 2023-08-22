package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.div
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.newBackgroundColorOnRerender
import net.justmachinery.shade.state.obs

/**
 * This example tests efficient rerendering of components by key.
 * Like React, keys are used to distinguish between components added in arrays or foreach loops,
 * which might retain an identity but change their number or positioning.
 */
class KeyRerenderTest : Component<Unit>() {
    //Some keys are duplicates; this is not recommended and is here to test what happens.
    var numbersList by obs((0 until 10).toList() + listOf(1,3,3,3,1,5))
    var addKey : Boolean by obs(false)
    override fun HtmlBlockTag.render() {
        h2 { +"Rerendering by key" }

        div {
            numbersList.forEach {
                add(KeyRerenderTestShow::class, it, key = it.toString())
            }
        }
        button {
            onClick {
                val sort = numbersList.sortedBy { Math.random() }.toMutableList()
                numbersList = sort
            }
            +"Shuffle list"
        }
        h2 { +"Key render order" }
        button {
            onClick { addKey = !addKey }
            +"Toggle key"
        }
        div {
            if(addKey){
                add(KeyRerenderTestShow::class, 1, key = (1).toString())
            } else {
                add(KeyRerenderTestShow::class, 1)
            }
            render {
                div {
                    +"Aftertext"
                }
            }
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