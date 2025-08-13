package net.justmachinery.shade.routing.annotation.processor

import com.google.devtools.ksp.getAllSuperTypes
import com.google.devtools.ksp.processing.Resolver
import com.google.devtools.ksp.processing.SymbolProcessor
import com.google.devtools.ksp.processing.SymbolProcessorEnvironment
import com.google.devtools.ksp.processing.SymbolProcessorProvider
import com.google.devtools.ksp.symbol.KSAnnotated
import com.google.devtools.ksp.symbol.KSClassDeclaration
import com.google.devtools.ksp.symbol.KSNode
import com.google.devtools.ksp.symbol.KSType
import com.squareup.kotlinpoet.TypeName
import com.squareup.kotlinpoet.ksp.toClassName
import net.justmachinery.shade.routing.annotation.NotFound
import net.justmachinery.shade.routing.annotation.QueryParam
import net.justmachinery.shade.routing.annotation.RoutedPage
import net.justmachinery.shade.routing.annotation.RoutedPath


class AnnotationRoutingProcessorProvider : SymbolProcessorProvider {
    override fun create(environment: SymbolProcessorEnvironment) = AnnotationRoutingProcessor(environment)
}

class AnnotationRoutingProcessor(
    private val environment: SymbolProcessorEnvironment
) : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        WithResolver(resolver).process()
        return emptyList()
    }

    inner class WithResolver(private val resolver : Resolver){
        val routedPath = resolver.getClassDeclarationByName(resolver.getKSNameFromString(RoutedPath::class.qualifiedName!!))!!.asStarProjectedType()
        val routedPage = resolver.getClassDeclarationByName(resolver.getKSNameFromString(RoutedPage::class.qualifiedName!!))!!.asStarProjectedType()
        val queryParam = resolver.getClassDeclarationByName(resolver.getKSNameFromString(QueryParam::class.qualifiedName!!))!!.asStarProjectedType()
        val notFound = resolver.getClassDeclarationByName(resolver.getKSNameFromString(NotFound::class.qualifiedName!!))!!.asStarProjectedType()

        fun process(){
            val routings = resolver.getSymbolsWithAnnotation(GenerateRouting::class.java.canonicalName).filterIsInstance(KSClassDeclaration::class.java)

            val data = routings.map { element ->
                buildRoutingData(element)
            }

            data.forEach { route ->
                AnnotationRoutingEmitter(environment, route).write()
            }
        }


        private fun buildRoutingData(
            element : KSClassDeclaration
        ) : RouteData {
            val pages = mutableListOf<PageData>()
            val paths = mutableListOf<PathRouteData>()
            val queryParameters = mutableListOf<QueryParameterData>()
            val notFoundHandlers = mutableListOf<NotFoundHandler>()

            for (property in element.getAllProperties()) {
                val type = property.type.resolve()
                if (routedPath.isAssignableFrom(type)) {
                    val subRouter = type.arguments[0].type!!.resolve()
                    if(subRouter.declaration !is KSClassDeclaration){
                        environment.logger.error("Must be a concrete class", property)
                        continue
                    }
                    val result = buildRoutingData(subRouter.declaration as KSClassDeclaration)
                    paths.add(PathRouteData(result, property.simpleName.asString()))
                } else if (routedPage.isAssignableFrom(type)) {
                    val queryParamSpec = type.arguments[0].type!!.resolve()
                    pages.add(
                        PageData(
                            name = property.simpleName.asString(),
                            queryParameters = extractQueryParameters(queryParamSpec, property)
                        )
                    )
                } else if (notFound.isAssignableFrom(type)) {
                    notFoundHandlers.add(
                        NotFoundHandler(
                            property.simpleName.asString()
                        )
                    )
                } else if (queryParam.isAssignableFrom(type)){
                    val paramType = extractQueryParameter(type, property)
                    if(paramType != null){
                        queryParameters.add(QueryParameterData(
                            name = property.simpleName.asString(),
                            type = paramType
                        ))
                    }
                }
            }
            return RouteData(
                originatingFile = element.containingFile!!,
                className = element.toClassName(),
                pages = pages,
                paths = paths,
                queryParameters = queryParameters,
                notFoundHandlers = notFoundHandlers
            )
        }


        private fun extractQueryParameter(type : KSType, reportNode : KSNode) : TypeName? {
            val decl = (type.declaration as? KSClassDeclaration)
            if(decl == null){
                environment.logger.error("Must be a concrete class", reportNode)
                return null
            }
            val superType = decl.getAllSuperTypes().firstOrNull { it.declaration.qualifiedName?.asString() == QueryParam::class.qualifiedName}
            if(superType == null){
                environment.logger.error("Must extend only QueryParam ($decl, $superType)", reportNode)
                return null
            }
            val singleArgument = superType.arguments.singleOrNull()?.type?.resolve()?.declaration as? KSClassDeclaration
            if(singleArgument == null){
                environment.logger.error("Must pass concrete type to QueryParam", reportNode)
                return null
            }
            return singleArgument.toClassName()
        }

        private fun extractQueryParameters(target : KSType, reportNode: KSNode) : List<QueryParameterData> {
            val decl = (target.declaration as? KSClassDeclaration)
            if(decl == null){
                environment.logger.error("Must be a concrete class", reportNode)
                return emptyList()
            }

            val parameters = mutableListOf<QueryParameterData>()
            for(property in decl.getAllProperties()){
                val propertyType = property.type.resolve()
                if(queryParam.isAssignableFrom(propertyType)){
                    val param = extractQueryParameter(propertyType, property)
                    if(param != null){
                        parameters.add(QueryParameterData(
                            name = property.simpleName.asString(),
                            type = param
                        ))
                    }
                }
            }
            return parameters
        }
    }

}