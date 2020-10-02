package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.AttributeNames
import net.justmachinery.shade.SocketScopeNames
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.state.Atom
import net.justmachinery.shade.utility.EqLambda
import net.justmachinery.shade.utility.GetSet
import net.justmachinery.shade.utility.gson
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
        val fromString : EqLambda<(String) -> T>,
        /**
         * Controls when to replace an input string with the "canonical" result of toString(fromString())
         */
        val normalize : Normalize
    )
    enum class Normalize {
        Immediately,
        OnBlur,
        Never
    }

    /**
     * Used to locate the input in question without messing with the "id" attribute that clients may use
     */
    private val bindingId = boundId.incrementAndGet()

    /**
     * Helps prevent overwriting what the user has entered based on something older that they entered.
     */
    private var serverSeen = 0

    private var lastKnownInput : String? = null
    private var checkChange = Atom()

    override fun MountingContext.mounted() {
        react {
            checkChange.reportObserved()
            val valueDiffers = lastKnownInput?.let { props.bound.get() != props.fromString.raw(it) } ?: true
            val shouldNormalize by lazy {
                props.normalize == Normalize.Immediately && props.toString.raw(props.bound.get()) != lastKnownInput
            }
            if(valueDiffers || shouldNormalize){
                val asString = props.toString.raw(props.bound.get())
                client.executeScript("${SocketScopeNames.updateBoundInput.raw}($bindingId,$serverSeen,${gson.toJson(asString)})")
            }
            lastKnownInput = null
        }
    }
    override fun HtmlBlockTag.render() {
        tag {
            this.attributes[AttributeNames.Bound.raw] = bindingId.toString()
            this.onValueInput(prefix = "it.boundSeen+=1") {
                serverSeen += 1
                lastKnownInput = it
                val asValue = props.fromString.raw(it)
                props.bound.set(asValue)
                checkChange.reportChanged()
            }
            if(props.normalize == Normalize.OnBlur){
                this.onBlur {
                    checkChange.reportChanged()
                }
            }
            props.cb.raw(this)
        }
    }
    abstract fun HtmlBlockTag.tag(cb: Tag.()->Unit)
}