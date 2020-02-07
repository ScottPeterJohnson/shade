package net.justmachinery.shade

import kotlinx.html.HtmlTagMarker
import kotlinx.html.Tag
import org.apache.http.client.utils.URLEncodedUtils
import java.nio.charset.Charset

class PathData {
    var pathParts : List<ObservableValue<String>> = emptyList()
    var queryParams : Map<String, ObservableValue<String?>> = emptyMap()

    internal fun update(urlInfo: UrlInfo){
        val newQueryParams = URLEncodedUtils.parse(urlInfo.queryString, Charset.defaultCharset())
        val pathSegments = URLEncodedUtils.parsePathSegments(urlInfo.pathInfo)

        pathParts = pathParts.zipAll(pathSegments).mapNotNull { (existing, new) ->
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

        queryParams = newQueryParams.associateBy(
            { it.name },
            { pair ->
                val existing = queryParams[pair.name]
                if(existing != null){
                    existing.set(pair.value)
                    existing
                } else {
                    ObservableValue(pair.value)
                }
            }
        )
    }
}

data class RoutingContext(
    val pathData: PathData,
    internal var currentPathSegment : Int = 0
){
    fun currentPathFragment() = pathData.pathParts.getOrNull(currentPathSegment)
}
val routingContextIdentifier = ComponentContextIdentifier<RoutingContext>()

internal fun <RenderIn : Tag> RenderIn.startRoutingInternal(
    component: AdvancedComponent<*,*>,
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
    component: AdvancedComponent<*,*>,
    cb : WithRouting<RenderIn>.()->Unit
){
    if(component.context[routingContextIdentifier] == null) throw IllegalStateException("Cannot start routing outside of a routing context.")
    doRouting(component, cb)
}

internal fun <RenderIn : Tag> RenderIn.doRouting(
    component: AdvancedComponent<*,*>,
    cb : WithRouting<RenderIn>.()->Unit
){
    component.run {
        //Run in render block for efficiency + to permanently capture routing context
        renderWithNewComponent { component ->
            val routing = WithRouting(component, this)
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
}

class UrlInfo(pathInfo : String?, queryString : String?){
    val pathInfo = pathInfo ?: ""
    val queryString = queryString ?: ""
}