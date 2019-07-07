package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.css.CSSBuilder
import kotlinx.html.*
import org.slf4j.MDC
import java.util.*

class InputReference(private val context : ClientContext, private val id : UUID) {
    val value : Deferred<String>
        get() = GlobalScope.async {
            val value = context.runExpression("document.getElementById(\"$id\").value").await()
            Gson().fromJson(value, String::class.java)
        }
}
fun FlowOrInteractiveOrPhrasingContent.renderCaptureInput(
    context : ClientContext,
    cb : INPUT.()->Unit
) : InputReference {
    val inputId = UUID.randomUUID()
    input {
        id = inputId.toString()
        cb()
    }
    return InputReference(context, inputId)
}

@HtmlTagMarker
fun CommonAttributeGroupFacade.withStyle(builder: CSSBuilder.() -> Unit) {
    this.style = CSSBuilder().apply(builder).toString().trim()
}


internal inline fun <T> withLoggingInfo(vararg pair: Pair<String, String>, body: () -> T): T {
    val oldValues = arrayOfNulls<String?>(pair.size)
    try {
        pair.forEachIndexed { index, it ->
            oldValues[index] = MDC.get(it.first)
            MDC.put(it.first, it.second)
        }
        return body()
    } finally {
        pair.forEachIndexed { index, it ->
            if(oldValues[index] == null){
                MDC.remove(it.first)
            } else {
                MDC.put(it.first, oldValues[index])
            }
        }
    }
}

internal fun String.ellipsizeAfter(maxLength : Int) = if(this.length > maxLength) this.take(maxLength) + "..." else this