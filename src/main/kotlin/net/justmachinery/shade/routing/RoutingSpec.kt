package net.justmachinery.shade.routing

import kotlinx.html.HtmlTagMarker
import kotlinx.html.Tag
import net.justmachinery.shade.*
import org.apache.http.client.utils.URLEncodedUtils
import java.nio.charset.Charset

class PathData {
    var pathParts : List<ObservableValue<String>> = emptyList()
    private var queryParams : MutableMap<String, ObservableValue<String?>> = mutableMapOf()

    fun getParam(name : String): ObservableValue<String?> {
        return synchronized(queryParams){
            queryParams.getOrPut(name){ ObservableValue(null) }
        }
    }

    internal fun update(urlInfo: UrlInfo){
        val newQueryParams = urlInfo.queryParams
        val pathSegments = urlInfo.pathSegments

        pathParts = pathParts.asSequence().zipAll(pathSegments).mapNotNull { (existing, new) ->
            if(existing != null && new != null){
                existing.set(new)
                existing
            } else if (new == null){
                null
            } else if(existing == null){
                ObservableValue(new)
            } else {
                throw IllegalStateException()
            }
        }.toList()

        synchronized(queryParams){
            queryParams.mergeMut(newQueryParams){ _, existing, new ->
                if(existing != null){
                    existing.set(new)
                    existing
                } else {
                    ObservableValue(new)
                }
            }
        }
    }
}

data class RoutingContext(
    val pathData: PathData,
    internal var currentPathSegment : Int = 0
){
    fun currentPathFragment() = pathData.pathParts.getOrNull(currentPathSegment)

    companion object {
        fun get(component: AdvancedComponent<*, *>) = component.context[routingContextIdentifier]
            ?: throw IllegalStateException("Not currently routing")
    }
}
val routingContextIdentifier =
    ComponentContextIdentifier<RoutingContext>()

internal fun <RenderIn : Tag> RenderIn.startRoutingInternal(
    component: AdvancedComponent<*, *>,
    urlInfo: UrlInfo,
    cb : WithRouting<RenderIn>.()->Unit
) {
    val context = RoutingContext(PathData())
    runChangeBatch(force = true) {
        context.pathData.update(urlInfo)
    }
    component.addContext(routingContextIdentifier, context){
        doRouting(component, cb)
    }
}

internal fun <RenderIn : Tag> RenderIn.routeInternal(
    component: AdvancedComponent<*, *>,
    cb : WithRouting<RenderIn>.()->Unit
){
    if(component.context[routingContextIdentifier] == null) throw IllegalStateException("Cannot start routing outside of a routing context.")
    doRouting(component, cb)
}

internal fun <RenderIn : Tag> RenderIn.doRouting(
    component: AdvancedComponent<*, *>,
    cb : WithRouting<RenderIn>.()->Unit
){
    component.run {
        //Run in render block for efficiency + to permanently capture routing context
        renderWithNewComponent { component ->
            val routing = WithRouting(component, this@renderWithNewComponent)
            cb(routing)
            routing.finish()
        }
    }
}


@HtmlTagMarker
class WithRouting<RenderIn : Tag>(
    private val component: AdvancedComponent<*, *>,
    private val tag : RenderIn
) {
    private var hasMatched = false
    private val notFoundHandlers = mutableListOf<RenderFunction<RenderIn>>()

    private val routingContext = component.context[routingContextIdentifier]!!
    fun currentPathPart() = routingContext.currentPathFragment()?.get()
    fun queryParam(name : String) = routingContext.pathData.getParam(name)

    fun matchRoot(cb : RenderFunction<RenderIn>) {
        match({
            it == null || it.isEmpty()
        }, cb)
    }

    fun match(pathPart : String, cb : RenderFunction<RenderIn>) {
        match({
            it != null && it == pathPart
        }, cb)
    }
    fun match(page : RoutedPage<*>, cb : RenderFunction<RenderIn>) {
        match({
            it == page.path || (page.path == null && it?.isEmpty() ?: true)
        }, cb)
    }
    fun match(path : RoutedPath<*>, cb : RenderFunction<RenderIn>) {
        match({
            it != null && it == path.path
        }, cb)
    }
    fun match(matcher : (String?)->Boolean, cb : RenderFunction<RenderIn>) {
        val part = routingContext.currentPathFragment()?.get()
        if(!hasMatched && matcher(part)){
            hasMatched = true
            component.addContext(
                identifier = routingContextIdentifier,
                value = routingContext.copy(currentPathSegment = routingContext.currentPathSegment + 1),
                cb = {
                    component.run {
                        tag.render {
                            cb()
                        }
                    }
                }
            )
        }
    }

    fun notFound(cb : RenderFunction<RenderIn>){
        notFoundHandlers.add(cb)
    }

    internal fun finish(){
        if(!hasMatched){
            notFoundHandlers.forEach {
                component.run {
                    tag.render {
                        it()
                    }
                }
            }
        }
    }

    fun getParam(name : String) : ObservableValue<String?> = routingContext.pathData.getParam(name)
}

interface UrlInfo {
    val pathSegments : Sequence<String>
    val queryParams : Sequence<Pair<String,String>>

    companion object {
        fun of(pathInfo : String?, queryString : String?) : UrlInfo = ParseUrlInfo(pathInfo, queryString)
    }
}

private class BasicUrlInfo(
    override val pathSegments: Sequence<String>,
    override val queryParams: Sequence<Pair<String, String>>
) : UrlInfo
private class ParseUrlInfo(pathInfo : String?, queryString : String?) : UrlInfo {
    override val pathSegments by lazy { URLEncodedUtils.parsePathSegments(pathInfo ?: "").asSequence() }
    override val queryParams by lazy { URLEncodedUtils.parse(queryString, Charset.defaultCharset()).asSequence().map { it.name to it.value } }
}