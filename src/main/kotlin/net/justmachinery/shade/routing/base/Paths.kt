package net.justmachinery.shade.routing.base

import net.justmachinery.shade.state.ObservableValue
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.mergeMut
import org.apache.http.client.utils.URLEncodedUtils
import org.apache.http.message.BasicNameValuePair
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
            queryParams.getOrPut(name){ ObservableValue(null) }
        }
    }

    var updateIdentifier = obs(0)

    internal fun update(urlInfo: UrlInfo){
        updateMap(pathParts, urlInfo.pathSegments.mapIndexed { index, it -> index to it })
        updateMap(queryParams, urlInfo.queryParams)
        updateIdentifier.set(updateIdentifier._value + 1)
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

/**
 * An "internal" path consists of path segments that must be matched on.
 * An "external" path is a full path that a client will see.
 * E.g. if you mount shade at /foo/bar/ and have subpaths baz, baz/bing to match, then:
 * /foo/bar/baz is an external path, with a corresponding internal path of baz
 * /foo/bar/baz/bing corresponds to baz/bing
 * etc.
 */
typealias InternalUrlInfo = UrlInfo
typealias ExternalUrlInfo = UrlInfo

interface UrlInfo {
    val pathSegments : Sequence<String>
    val queryParams : Sequence<Pair<String,String>>
    val pathInfo : String
    val queryString : String

    companion object {
        fun of(pathInfo : String?, queryString : String?) : UrlInfo =
            ParseUrlInfo(pathInfo ?: "", queryString ?: "")
    }

    /**
     * Removes prefix from this URL's path if it contains all of prefix's segments
     */
    fun removePathPrefix(prefix : String) : UrlInfo {
        val inf = pathInfo
        return if(inf.length > prefix.length && inf[prefix.length] != '/'){
            this
        } else {
            ParseUrlInfo(
                pathInfo.removePrefix(prefix),
                queryString
            )
        }
    }

    fun addPathPrefix(prefix : String) : UrlInfo {
        return ParseUrlInfo(
            pathInfo = "$prefix${if (prefix.endsWith("/")) "" else "/"}$pathInfo",
            queryString = queryString
        )
    }

    fun render() : String {
        val qs = queryString
        return if(qs.isNotEmpty()){
            "$pathInfo?$qs"
        } else {
            pathInfo
        }
    }
}

internal class BasicUrlInfo(
    override val pathSegments: Sequence<String>,
    override val queryParams: Sequence<Pair<String, String>>
) : UrlInfo {
    override val pathInfo: String
        get() = pathSegments.joinToString("/")
    override val queryString: String
        get() = URLEncodedUtils.format(queryParams.map { BasicNameValuePair(it.first, it.second) }.asIterable(), Charset.forName("ASCII"))
}

private class ParseUrlInfo(override val pathInfo : String, override val queryString : String) :
    UrlInfo {
    override val pathSegments by lazy { URLEncodedUtils.parsePathSegments(pathInfo).asSequence() }
    override val queryParams by lazy { URLEncodedUtils.parse(queryString, Charset.forName("ASCII")).asSequence().map { it.name to it.value } }
}