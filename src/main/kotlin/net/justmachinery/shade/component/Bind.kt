package net.justmachinery.shade.component

import com.google.gson.Gson
import kotlinx.html.HtmlBlockTag
import kotlinx.html.INPUT
import kotlinx.html.input
import net.justmachinery.shade.EqLambda
import net.justmachinery.shade.state.Atom
import net.justmachinery.shade.state.ObservableValue
import java.util.concurrent.atomic.AtomicInteger

class BoundInput<T> : Component<BoundInput.Props<T>>() {
    companion object {
        private val boundId = AtomicInteger(0)
    }
    data class Props<T>(
        val bound: ObservableValue<T>,
        val cb: EqLambda<INPUT.() -> Unit>,
        val toString : EqLambda<(T)->String>,
        val fromString : EqLambda<(String) -> T>
    ) : PropsType<Props<T>, BoundInput<T>>()

    private val bindingId = boundId.incrementAndGet()
    private var serverSeen = 0
    private var lastKnownInput : String? = null
    private var checkChange = Atom()
    override fun MountingContext.mounted() {
        react {
            checkChange.reportObserved()
            val value = props.toString.raw(props.bound.value)
            if(value != lastKnownInput){
                client.executeScript("b($bindingId,$serverSeen,${Gson().toJson(value)})")
            }
            lastKnownInput = null
        }
    }
    override fun HtmlBlockTag.render() {
        input {
            attributes["shade-bound"] = bindingId.toString()
            onValueInput(prefix = "it.boundSeen+=1") {
                serverSeen += 1
                lastKnownInput = it
                props.bound.set(props.fromString.raw(it))
                checkChange.reportChanged()
            }
            props.cb.raw(this)
        }
    }
}