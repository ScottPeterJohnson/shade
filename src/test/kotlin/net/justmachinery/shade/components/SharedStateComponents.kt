package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.h2
import kotlinx.html.input
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.react

//This file shows sharing state between components, by passing it in via props

class SharedStateComponents  : Component<Unit>() {
    val sharedState = SharedRootState()
    override fun HtmlBlockTag.render() {
        h2 {
            +"These two components share state"
        }
        div { +"This one reads it:" }
        add(SharedStateRender::class, sharedState)
        div { +"This one modifies it:" }
        add(SharedStateInput::class, sharedState)
    }
}

class SharedRootState {
    //The state can itself contain observable properties
    var text by react("")
}

class SharedStateRender : Component<SharedRootState>(){
    override fun HtmlBlockTag.render() {
        +"You entered: ${props.text}"
    }
}

class SharedStateInput : Component<SharedRootState>(){
    override fun HtmlBlockTag.render() {
        div {
            input {
                onValueInput {
                    props.text = it
                }
            }
        }
    }
}