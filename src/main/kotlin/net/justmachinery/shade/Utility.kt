package net.justmachinery.shade

import kotlinx.css.CSSBuilder
import kotlinx.html.CommonAttributeGroupFacade
import kotlinx.html.HtmlBlockTag
import kotlinx.html.HtmlTagMarker
import kotlinx.html.style
import org.intellij.lang.annotations.Language
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

var HtmlBlockTag.key : String?
    get() = attributes["data-key"]
    set(it) {
        if(it != null){
            attributes["data-key"] = it
        } else {
            attributes.remove("data-key")
        }
    }


/**
 * Specifies JS to be executed after the dom element renders.
 * @param onlyOnCreate If true, will run only when the DOM element is created or the JS changes, not on rerenders.
 */
fun HtmlBlockTag.applyJs(
    @Language("JavaScript 1.8", prefix = "const it = document.createElement('div'); ") js : String,
    onlyOnCreate : Boolean = false
){
    attributes["data-shade-element-js"] = "${if(onlyOnCreate) 'R' else 'A'}$js"
}

data class Json(val raw : String)