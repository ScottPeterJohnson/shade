package net.justmachinery.shade.routing

import com.google.gson.Gson
import kotlinx.html.A
import kotlinx.html.HtmlTagMarker
import kotlinx.html.Tag
import net.justmachinery.shade.*


open class RoutingException(message : String) : RuntimeException(message)

data class RoutingComponentContext(
    val pathData: PathData,
    internal var currentPathSegment : Int = 0
){
    fun currentPathFragment() = pathData.segmentAtIndex(currentPathSegment)

    companion object {
        fun get(component: AdvancedComponent<*, *>) = component.context[routingComponentContextIdentifier]
            ?: throw IllegalStateException("Not currently routing")
    }
}
val routingComponentContextIdentifier =
    ComponentContextIdentifier<RoutingComponentContext>()


val routingGlobalClientStateIdentifier = GlobalClientStateIdentifier<RoutingGlobalClientState>()

data class RoutingGlobalClientState(
    val pathData: PathData
)

internal fun <RenderIn : Tag> RenderIn.startRoutingInternal(
    component: AdvancedComponent<*, *>,
    urlInfo: UrlInfo,
    urlTransform : (UrlInfo) -> UrlInfo = { it },
    cb : WithRouting<RenderIn>.()->Unit
) {
    val globalState = component.client.getOrPutGlobalState(routingGlobalClientStateIdentifier){
        installRoutingHandler(component, urlTransform)
    }

    runChangeBatch(force = true) {
        globalState.pathData.update(urlTransform(urlInfo))
    }

    val context = RoutingComponentContext(globalState.pathData)
    component.addContext(routingComponentContextIdentifier, context){
        doRouting(component, cb)
    }
}

private fun installRoutingHandler(component: AdvancedComponent<*,*>, urlTransform: (UrlInfo) -> UrlInfo) : RoutingGlobalClientState {
    val pathData = PathData()
    component.client.runRepeatableExpressionWithTemplate({
        "window.addEventListener('popstate', (event)=>{ window.shade($it, JSON.stringify({path:''+document.location.pathname, query:''+document.location.search}))})"
    }){
        it?.let {
            val newUrl = Gson().fromJson(it.raw, PathAndQueryParam::class.java)
            val newInfo = urlTransform(UrlInfo.of(newUrl.path, newUrl.query.removePrefix("?")))
            pathData.update(newInfo)
        }
    }
    return RoutingGlobalClientState(pathData)
}
private class PathAndQueryParam(val path : String, val query : String)


internal fun <RenderIn : Tag> RenderIn.routeInternal(
    component: AdvancedComponent<*, *>,
    cb : WithRouting<RenderIn>.()->Unit
){
    if(component.context[routingComponentContextIdentifier] == null) throw IllegalStateException("Cannot start routing outside of a routing context.")
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

    private val routingContext = component.context[routingComponentContextIdentifier]!!

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
                identifier = routingComponentContextIdentifier,
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

internal fun routingSetNavigate(component: AdvancedComponent<*, *>, anchor : A, value : FinishedRoute?){
    if(value == null){
        anchor.attributes.remove("href")
        anchor.attributes.remove("onclick")
    } else {
        anchor.href = value.render()
        component.run {
            anchor.onClick(suffix = "event.preventDefault()") {
                value.navigate()
            }
        }
    }
}