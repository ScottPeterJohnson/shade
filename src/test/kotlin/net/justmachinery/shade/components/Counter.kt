package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.div
import kotlinx.html.h2
import net.justmachinery.shade.*

class Counter : Component<Unit>() {
    var counter = observable(0)
    override fun HtmlBlockTag.render() {
        h2 { +"A simple counter" }
        div {
            button {
                onClick {
                    counter.value += 1
                }
                +"Add to counter"
            }
        }
        div {
            +"This subcomponent takes the counter as a prop, and outputs it: "
            //This is an example of passing a prop that changes.
            //It's also an example of using the related props class to specify the component.
            add(SubComponentShowingCounter.Props(counter = counter))
        }
    }
}

private class SubComponentShowingCounter : Component<SubComponentShowingCounter.Props>() {
    data class Props (val counter : ObservableValue<Int>) : PropsType<Props, SubComponentShowingCounter>()
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()
            +"Counter is ${props.counter.value} ✓"
        }
    }
}
