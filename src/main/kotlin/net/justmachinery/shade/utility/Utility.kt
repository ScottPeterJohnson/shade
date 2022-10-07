package net.justmachinery.shade.utility

import com.google.gson.GsonBuilder
import kotlinx.css.CssBuilder
import kotlinx.html.CommonAttributeGroupFacade
import kotlinx.html.HtmlBlockTag
import kotlinx.html.HtmlTagMarker
import kotlinx.html.style
import net.justmachinery.shade.AttributeNames
import net.justmachinery.shade.DirectiveType
import net.justmachinery.shade.render.scriptDirective
import org.intellij.lang.annotations.Language

@HtmlTagMarker
fun CommonAttributeGroupFacade.withStyle(builder: CssBuilder.() -> Unit) {
    if(!this.attributes.containsKey("style")){
        this.style = CssBuilder().apply(builder).toString().trim()
    } else {
        this.style = "${this.style};${CssBuilder().apply(builder).toString().trim()}"
    }
}

var HtmlBlockTag.key : String?
    get() = attributes[AttributeNames.Key.raw]
    set(it) {
        if(it != null){
            attributes[AttributeNames.Key.raw] = it
        } else {
            attributes.remove(AttributeNames.Key.raw)
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
    scriptDirective(
        type = DirectiveType.ApplyJs,
        data = listOf(
            AttributeNames.ApplyJsRunOption to (if(onlyOnCreate) "1" else "0"),
            AttributeNames.ApplyJsScript to js
        )
    )
}

internal fun <T1: Any, T2: Any> Sequence<T1>.zipAll(other: Sequence<T2>): Sequence<Pair<T1?, T2?>> {
    val i1 = this.iterator()
    val i2 = other.iterator()
    return generateSequence {
        if (i1.hasNext() || i2.hasNext()) {
            Pair(if (i1.hasNext()) i1.next() else null,
                if (i2.hasNext()) i2.next() else null)
        } else {
            null
        }
    }
}


internal fun <T1: Any, T2: Any, T3 : Any> MutableMap<T1,T2>.mergeMut(other: Sequence<Pair<T1,T3>>, cb : (key : T1, existing: T2?, new: T3?)->T2?) {
    val otherMap = other.toMap(HashMap())
    val iter = this.entries.iterator()
    while(iter.hasNext()){
        val entry = iter.next()
        val otherValue = otherMap.remove(entry.key)
        val result = cb(entry.key, entry.value, otherValue)
        if(result == null){
            iter.remove()
        } else {
            entry.setValue(result)
        }
    }
    otherMap.entries.forEach {
        val value = cb(it.key, null, it.value)
        if(value != null) { this[it.key] = value }
    }
}

typealias RenderFunction<RenderIn> = RenderIn.()->Unit

internal val gson = GsonBuilder().disableHtmlEscaping().create()