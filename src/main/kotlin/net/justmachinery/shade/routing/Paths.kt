package net.justmachinery.shade.routing

import net.justmachinery.shade.ObservableValue
import net.justmachinery.shade.mergeMut
import org.apache.http.client.utils.URLEncodedUtils
import java.nio.charset.Charset

class PathData {
    private var pathParts : MutableMap<Int, ObservableValue<String?>> = mutableMapOf()
    private var queryParams : MutableMap<String, ObservableValue<String?>> = mutableMapOf()

    fun segmentAtIndex(index : Int): ObservableValue<String?> {
        return synchronized(pathParts){
            pathParts.getOrPut(index){ ObservableValue(null) }
        }
    }
    fun getParam(name : String): ObservableValue<String?> {
        return synchronized(queryParams){
            queryParams.getOrPut(name){ObservableValue(null) }
        }
    }

    internal fun update(urlInfo: UrlInfo){
        updateMap(pathParts, urlInfo.pathSegments.mapIndexed { index, it -> index to it })
        updateMap(queryParams, urlInfo.queryParams)
    }

    private fun <T : Any> updateMap(map : MutableMap<T, ObservableValue<String?>>, entries : Sequence<Pair<T,String>>){
        synchronized(map){
            map.mergeMut(entries) { _, existingObservable, new ->
                if(existingObservable != null){
                    if(new == null && !existingObservable.isObserved()){
                        null
                    } else {
                        existingObservable.set(new)
                        existingObservable
                    }
                } else {
                    if(new != null){
                        ObservableValue<String?>(new)
                    } else {
                        null
                    }
                }
            }
        }
    }
}

interface UrlInfo {
    val pathSegments : Sequence<String>
    val queryParams : Sequence<Pair<String,String>>

    companion object {
        fun of(pathInfo : String?, queryString : String?) : UrlInfo = ParseUrlInfo(pathInfo, queryString)
    }
}

internal class BasicUrlInfo(
    override val pathSegments: Sequence<String>,
    override val queryParams: Sequence<Pair<String, String>>
) : UrlInfo

private class ParseUrlInfo(pathInfo : String?, queryString : String?) : UrlInfo {
    override val pathSegments by lazy { URLEncodedUtils.parsePathSegments(pathInfo ?: "").asSequence() }
    override val queryParams by lazy { URLEncodedUtils.parse(queryString, Charset.defaultCharset()).asSequence().map { it.name to it.value } }
}