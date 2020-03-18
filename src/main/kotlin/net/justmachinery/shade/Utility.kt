package net.justmachinery.shade

import kotlinx.coroutines.Job
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


internal class SingleConcurrentExecution(private val launch : ()-> Job){
    private val runningLock = Object()
    private var running = false
    private var waiting = false

    fun maybeLaunch(){
        val proceed = synchronized(runningLock){
            if(running){
                waiting = true
                false
            } else {
                true
            }
        }
        if(proceed){
            launch().invokeOnCompletion {
                release()
            }
        }
    }

    fun runSync(cb : ()->Unit){
        synchronized(runningLock){
            if(running){
                runningLock.wait()
            }
            running = true
        }
        try {
            cb()
        } finally {
            release()
        }
    }

    private fun release(){
        val wasWaiting = synchronized(runningLock){
            running = false
            val wasWaiting = waiting
            waiting = false
            runningLock.notify()
            wasWaiting
        }
        if(wasWaiting){
            maybeLaunch()
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