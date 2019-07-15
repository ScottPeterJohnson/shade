package net.justmachinery.shade

import kotlinx.css.CSSBuilder
import kotlinx.html.CommonAttributeGroupFacade
import kotlinx.html.HtmlTagMarker
import kotlinx.html.style
import org.slf4j.MDC

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