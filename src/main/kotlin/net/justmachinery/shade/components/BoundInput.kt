package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.futility.GetSet
import net.justmachinery.futility.Json
import net.justmachinery.futility.lambdas.EqLambda
import net.justmachinery.shade.AttributeNames
import net.justmachinery.shade.SocketScopeNames
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.state.Atom
import net.justmachinery.shade.utility.gson
import java.util.concurrent.atomic.AtomicInteger

class BoundInput<T> : BoundValueTag<T, INPUT>() {
    override fun HtmlBlockTag.addTag(cb: INPUT.() -> Unit) {
        input(block = cb)
    }
}

class BoundSelect<T> : BoundValueTag<T, SELECT>() {
    override fun HtmlBlockTag.addTag(cb: SELECT.() -> Unit) {
        select(block = cb)
    }
}

class BoundTextArea<T> : BoundValueTag<T, TEXTAREA>() {
    override fun HtmlBlockTag.addTag(cb: TEXTAREA.() -> Unit) {
        textArea(block = cb)
    }
}

abstract class BoundValueTag<T, Tag : CommonAttributeGroupFacade> : Component<BoundValueTag.Props<T, Tag>>() {
    data class Props<T, Tag>(
        val bound: GetSet<T>,
        val cb: EqLambda<Tag.() -> Unit>,
        val toString : EqLambda<(T) -> String>,
        val fromString : EqLambda<(String) -> T>,
        val normalize: BoundTag.Normalize
    )
    abstract fun HtmlBlockTag.addTag(cb: Tag.()->Unit)

    override fun HtmlBlockTag.render() {
        add(BoundTag.Props(
            bound = props.bound,
            cb = props.cb,
            behavior = object : BoundTag.BoundTagBehavior<T, Tag> {
                override val toJs = EqLambda<(T) -> Json> {
                    Json(gson.toJson(props.toString.raw(it)))
                }
                override val fromJs = EqLambda<(Json)->T> {
                    props.fromString.raw(gson.fromJson(it.raw, String::class.java))
                }
                override val normalize = props.normalize
                override val changeEvents = listOf("input")
                override val getValueJs = "it.value"
                override val setValueJs = "it.value = value"

                override fun HtmlBlockTag.tag(cb: Tag.() -> Unit) {
                    this@BoundValueTag.run { addTag(cb) }
                }
            }
        ))
    }
}


class BoundTag<T, Tag : CommonAttributeGroupFacade> : Component<BoundTag.Props<T, Tag>>(){
    companion object {
        private val boundId = AtomicInteger(0)
    }
    data class Props<T, Tag : CommonAttributeGroupFacade>(
        val bound: GetSet<T>,
        val cb: EqLambda<Tag.() -> Unit>,
        val behavior: BoundTagBehavior<T, Tag>
    ) : PropsType<Props<T, Tag>, BoundTag<T, Tag>>()

    interface BoundTagBehavior<T, Tag> {
        val toJs : EqLambda<(T) -> Json>
        val fromJs : EqLambda<(Json) -> T>
        /**
         * Controls when to replace an input string with the "canonical" result of toString(fromString())
         */
        val normalize : Normalize
        fun normalizeIf(
            currentValue: T,
            currentJson: Json,
            lastInputValue: T?,
            lastInputJson: Json?
        ) : Boolean = currentJson != lastInputJson
        //Change events on tag to listen to
        val changeEvents : List<String>
        //JS to return and set the value (value and the tag ("it") will be in scope)
        val getValueJs : String
        val setValueJs : String
        fun HtmlBlockTag.tag(cb: Tag.()->Unit)
    }

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

    private var lastInput : Json? = null
    private var checkChange = Atom()
    @Volatile private var didBlur : Boolean = false

    private val behavior get() = props.behavior

    override fun MountingContext.mounted() {
        react {
            checkChange.reportObserved()
            val lastInputObj = lastInput?.let { behavior.fromJs.raw(it) }
            val valueDiffers = lastInput?.let { props.bound.get() != lastInputObj } ?: true

            val asString by lazy {
                behavior.toJs.raw(props.bound.get())
            }
            val shouldNormalize by lazy {
                (behavior.normalize == Normalize.Immediately || (behavior.normalize == Normalize.OnBlur && didBlur))
                        && behavior.normalizeIf(props.bound.get(), asString, lastInputObj, lastInput)
            }
            if(valueDiffers || shouldNormalize){
                client.executeScript("${SocketScopeNames.updateBoundInput.raw}($bindingId,$serverSeen,${asString.raw},function(it, value){ ${behavior.setValueJs} })")
            }
            didBlur = false
        }
    }
    override fun HtmlBlockTag.render() {
        behavior.run {
            tag {
                this.attributes[AttributeNames.Bound.raw] = bindingId.toString()
                changeEvents.forEach { event ->
                    this.addEventCallback(event, prefix = "it.boundSeen+=1", data = getValueJs){
                        serverSeen += 1
                        lastInput = it!!
                        val asValue = behavior.fromJs.raw(it)
                        props.bound.set(asValue)
                        checkChange.reportChanged()
                    }
                }
                if(behavior.normalize == Normalize.OnBlur){
                    this.onBlur {
                        didBlur = true
                        checkChange.reportChanged()
                    }
                }
                props.cb.raw(this)
            }
        }
    }
}

