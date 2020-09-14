package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.h2
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs

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
    var text = obs("foobar")
}

class SharedStateRender : Component<SharedRootState>(){
    override fun HtmlBlockTag.render() {
        +"You entered: ${props.text.value}"
    }
}

class SharedStateInput : Component<SharedRootState>(){
    override fun HtmlBlockTag.render() {
        div {
            boundInput(props.text){}
        }
    }
}