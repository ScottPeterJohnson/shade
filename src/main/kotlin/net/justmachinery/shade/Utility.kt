package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import java.util.*

class InputReference(private val context : ShadeContext, private val id : UUID) {
    val value : Deferred<String>
        get() = GlobalScope.async {
            val value = context.runExpression("document.getElementById(\"$id\").value").await()
            Gson().fromJson(value, String::class.java)
        }
}