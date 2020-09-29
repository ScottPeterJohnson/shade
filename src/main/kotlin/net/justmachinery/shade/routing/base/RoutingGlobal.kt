package net.justmachinery.shade.routing.base

import net.justmachinery.shade.Client
import net.justmachinery.shade.GlobalClientStateIdentifier
import net.justmachinery.shade.utility.gson

val routingGlobalClientStateIdentifier = GlobalClientStateIdentifier<RoutingGlobalClientState>()

data class RoutingGlobalClientState(
    val pathData: PathData
)

internal fun Client.ensureGlobalRouting(urlTransform: (ExternalUrlInfo) -> InternalUrlInfo) = getOrPutGlobalState(routingGlobalClientStateIdentifier){
    installRoutingHandler(this, urlTransform)
}


private fun installRoutingHandler(client: Client, urlTransform: (ExternalUrlInfo) -> InternalUrlInfo) : RoutingGlobalClientState {
    val pathData = PathData()
    client.runRepeatableExpressionWithTemplate({
        "window.addEventListener('popstate', (event)=>{ window.shade($it, JSON.stringify({path:''+document.location.pathname, query:''+document.location.search}))})"
    }){
        it?.let {
            val newUrl = gson.fromJson(it.raw, PathAndQueryParam::class.java)
            val newInfo = urlTransform(
                UrlInfo.of(
                    newUrl.path,
                    newUrl.query.removePrefix("?")
                )
            )
            pathData.update(newInfo)
        }
    }
    return RoutingGlobalClientState(pathData)
}
private class PathAndQueryParam(val path : String, val query : String)