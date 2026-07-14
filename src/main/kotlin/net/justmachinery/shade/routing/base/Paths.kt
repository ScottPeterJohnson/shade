package net.justmachinery.shade.routing.base

import net.justmachinery.shade.state.ObservableValue
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.mergeMut
import java.net.URLDecoder
import java.net.URLEncoder

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
        val prefixTrimmed = prefix.removeSuffix("/")
        val pathTrimmed = pathInfo.removePrefix("/")
        return ParseUrlInfo(
            pathInfo = "$prefixTrimmed/$pathTrimmed",
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
        get() = queryParams.joinToString("&") {
            "${URLEncoder.encode(it.first, Charsets.UTF_8)}=${URLEncoder.encode(it.second, Charsets.UTF_8)}"
        }
}

private class ParseUrlInfo(override val pathInfo : String, override val queryString : String) :
    UrlInfo {
    override val pathSegments by lazy {
        pathInfo.splitToSequence('/').filter { it.isNotEmpty() }.map {
            //URLDecoder decodes '+' as a space, which is a query string convention that does not apply in paths
            URLDecoder.decode(it.replace("+", "%2B"), Charsets.UTF_8)
        }
    }
    override val queryParams by lazy {
        queryString.splitToSequence('&').filter { it.isNotEmpty() }.map {
            val separator = it.indexOf('=')
            if(separator == -1){
                URLDecoder.decode(it, Charsets.UTF_8) to ""
            } else {
                URLDecoder.decode(it.take(separator), Charsets.UTF_8) to
                    URLDecoder.decode(it.substring(separator + 1), Charsets.UTF_8)
            }
        }
    }
}