package net.justmachinery.shade.components

import com.google.gson.Gson
import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.state.Atom
import net.justmachinery.shade.utility.EqLambda
import net.justmachinery.shade.utility.GetSet
import java.util.concurrent.atomic.AtomicInteger

class BoundInput<T> : BoundTag<T, INPUT>() {
    override fun HtmlBlockTag.tag(cb: INPUT.() -> Unit) {
        input(block = cb)
    }
}

class BoundSelect<T> : BoundTag<T, SELECT>() {
    override fun HtmlBlockTag.tag(cb: SELECT.() -> Unit) {
        select(block = cb)
    }
}

class BoundTextArea<T> : BoundTag<T, TEXTAREA>() {
    override fun HtmlBlockTag.tag(cb: TEXTAREA.() -> Unit) {
        textArea(block = cb)
    }
}

abstract class BoundTag<T, Tag : CommonAttributeGroupFacade> : Component<BoundTag.Props<T, Tag>>(){
    companion object {
        private val boundId = AtomicInteger(0)
    }
    data class Props<T, Tag>(
        val bound: GetSet<T>,
        val cb: EqLambda<Tag.() -> Unit>,
        val toString : EqLambda<(T) -> String>,
        val fromString : EqLambda<(String) -> T>
    )

    private val bindingId = boundId.incrementAndGet()
    private var serverSeen = 0
    private var lastKnownInput : String? = null
    private var checkChange = Atom()
    override fun MountingContext.mounted() {
        react {
            checkChange.reportObserved()
            val value = props.toString.raw(props.bound.get())
            if(value != lastKnownInput){
                client.executeScript("b($bindingId,$serverSeen,${Gson().toJson(value)})")
            }
            lastKnownInput = null
        }
    }
    override fun HtmlBlockTag.render() {
        tag {
            this.attributes["shade-bound"] = bindingId.toString()
            this.onValueInput(prefix = "it.boundSeen+=1") {
                serverSeen += 1
                lastKnownInput = it
                props.bound.set(props.fromString.raw(it))
                checkChange.reportChanged()
            }
            props.cb.raw(this)
        }
    }
    abstract fun HtmlBlockTag.tag(cb: Tag.()->Unit)
}