package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.html.FlowOrInteractiveOrPhrasingContent
import kotlinx.html.INPUT
import kotlinx.html.id
import kotlinx.html.input
import java.util.*

class InputReference(private val context : ShadeContext, private val id : UUID) {
    val value : Deferred<String>
        get() = GlobalScope.async {
            val value = context.runExpression("document.getElementById(\"$id\").value").await()
            Gson().fromJson(value, String::class.java)
        }
}
fun FlowOrInteractiveOrPhrasingContent.renderCaptureInput(
    context : ShadeContext,
    cb : INPUT.()->Unit
) : InputReference {
    val inputId = UUID.randomUUID()
    input {
        id = inputId.toString()
        cb()
    }
    return InputReference(context, inputId)
}