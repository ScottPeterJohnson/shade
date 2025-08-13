package net.justmachinery.shade.routing.annotation.processor

import com.google.devtools.ksp.symbol.KSFile
import com.squareup.kotlinpoet.ClassName
import com.squareup.kotlinpoet.TypeName

/**
 * Apply this annotation to a RoutingSpec to generate a RouteBuilder accessible via .builder() and a Router interface
 * that can be dispatched to.
 */
@Target(
    AnnotationTarget.CLASS
)
@Retention(AnnotationRetention.SOURCE)
annotation class GenerateRouting


internal data class RouteData(
    val originatingFile : KSFile,
    val className: ClassName,
    val pages : List<PageData>,
    val paths : List<PathRouteData>,
    val queryParameters : List<QueryParameterData>,
    val notFoundHandlers : List<NotFoundHandler>
)
internal data class PathRouteData(val data : RouteData, val name : String)
internal data class PageData(val name : String, val queryParameters : List<QueryParameterData>)
internal data class QueryParameterData(val name : String, val type: TypeName)
internal data class NotFoundHandler(val name : String)

