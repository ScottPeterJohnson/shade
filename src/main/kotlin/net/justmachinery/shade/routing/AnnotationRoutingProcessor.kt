package net.justmachinery.shade.routing

import com.squareup.kotlinpoet.*
import kotlinx.html.Tag
import net.justmachinery.shade.AdvancedComponent
import net.justmachinery.shade.ObservableValue
import java.io.File
import javax.annotation.processing.*
import javax.lang.model.SourceVersion
import javax.lang.model.element.Element
import javax.lang.model.element.TypeElement
import javax.lang.model.type.DeclaredType
import javax.lang.model.type.TypeMirror
import javax.lang.model.util.ElementFilter
import javax.tools.Diagnostic
import kotlin.reflect.KClass
import kotlin.reflect.jvm.internal.impl.builtins.jvm.JavaToKotlinClassMap
import kotlin.reflect.jvm.internal.impl.name.FqName


const val KAPT_KOTLIN_GENERATED_OPTION_NAME = "kapt.kotlin.generated"

/**
 * Apply this annotation to a RoutingSpec to generate a RouteBuilder accessible via .builder() and a Router interface
 * that can be dispatched to.
 */
@Target(
    AnnotationTarget.CLASS
)
@Retention(AnnotationRetention.SOURCE)
annotation class GenerateRouting

@SupportedSourceVersion(SourceVersion.RELEASE_11)
@SupportedAnnotationTypes(
    "net.justmachinery.shade.routing.GenerateRouting"
)
@SupportedOptions(KAPT_KOTLIN_GENERATED_OPTION_NAME)
class AnnotationRoutingProcessor : AbstractProcessor() {
    override fun process(annotations: MutableSet<out TypeElement>?, roundEnv: RoundEnvironment): Boolean {
        val baseRoutes = roundEnv.getElementsAnnotatedWith(GenerateRouting::class.java)

        val kaptKotlinGeneratedDir = File(processingEnv.options[KAPT_KOTLIN_GENERATED_OPTION_NAME] ?: run {
            processingEnv.messager.printMessage(Diagnostic.Kind.ERROR, "Can't find the target directory for generated Kotlin files.")
            return false
        })

        val data = baseRoutes.map { element ->
            buildRoutingData(element)
        }

        data.forEach { route ->
            AnnotationRoutingEmitter(route).write(kaptKotlinGeneratedDir)
        }

        return true
    }

    private fun buildRoutingData(
        element : Element
    ) : RouteData {
        val fields = ElementFilter.fieldsIn(element.enclosedElements)

        val pages = mutableListOf<PageData>()
        val paths = mutableListOf<PathRouteData>()
        val queryParameters = mutableListOf<QueryParameterData>()

        fields.forEach { field ->
            val fieldClazz = field.asType().extractPathContentType()
            if(fieldClazz != null){
                val result = buildRoutingData(fieldClazz)
                paths.add(PathRouteData(data = result, name = field.simpleName.toString()))
            }
            if(field.asType().isRoutingPage()){
                val queryParamSpec = field.asType().extractQueryParameterSpecFromPageType()
                pages.add(PageData(
                    name = field.simpleName.toString(),
                    queryParameters = queryParamSpec ?.let { extractQueryParameters(it) } ?: emptyList()
                ))
            }
            if(field.asType().isQueryParameter()){
                queryParameters.add(QueryParameterData(
                    name = field.simpleName.toString(),
                    type = field.asType().extractQueryParameterType()!!
                ))
            }
        }
        return RouteData(
            className = ClassName.bestGuess(element.toString()),
            pages = pages,
            paths = paths,
            queryParameters = queryParameters
        )
    }

    private fun extractQueryParameters(target : Element) : List<QueryParameterData> {
        val parameters = mutableListOf<QueryParameterData>()
        val fields = ElementFilter.fieldsIn(target.enclosedElements)
        fields.forEach { field ->
            if(field.asType().isQueryParameter()){
                parameters.add(QueryParameterData(
                    name = field.simpleName.toString(),
                    type = field.asType().extractQueryParameterType()!!
                ))
            }
        }
        return parameters
    }

    private fun TypeMirror.isQueryParameter() : Boolean {
        return this.findSuperclass(QueryParam::class) != null
    }
    private fun TypeMirror.extractQueryParameterType() : TypeName? {
        return this.findSuperclass(QueryParam::class)?.let {
            var result = (it.typeArguments[0] as DeclaredType).asTypeName()
            if(this.findSuperclass(OptionalParam::class) != null){
                result = result.copy(nullable = true)
            }
            result.javaToKotlinType()
        }
    }

    private fun TypeMirror.isRoutingPage() : Boolean {
        return this.findSuperclass(RoutedPage::class) != null
    }
    private fun TypeMirror.extractQueryParameterSpecFromPageType() : Element? {
        return this.findSuperclass(RoutedPage::class)?.let { (it.typeArguments[0] as DeclaredType).asElement() }
    }
    private fun TypeMirror.extractPathContentType() : Element? {
        return this.findSuperclass(RoutedPath::class)?.let { (it.typeArguments[0] as DeclaredType).asElement() }
    }
    private fun TypeMirror.findSuperclass(target : KClass<*>) : DeclaredType? {
        val clazz = (this as? DeclaredType) ?: return null
        val targetAsType = target.typeElement().erasure()
        return if(typeUtils.isSameType(clazz.erasure(), targetAsType)){
            clazz
        } else {
            typeUtils.directSupertypes(clazz).asSequence().mapNotNull { it.findSuperclass(target) }.firstOrNull()
        }
    }

    private val typeUtils get() = processingEnv.typeUtils
    private fun KClass<*>.typeElement() = processingEnv.elementUtils.getTypeElement(qualifiedName).asType()
    private fun TypeMirror.erasure() = typeUtils.erasure(this)

    //TODO: might possibly need to read the metadata and do stupid things to get the right Kotlin types
    /*private fun metadata(element : Element){
        val metadata = element.getAnnotation(Metadata::class.java)
        val header = KotlinClassHeader(
            kind = metadata.kind,
            metadataVersion = metadata.metadataVersion,
            bytecodeVersion = metadata.bytecodeVersion,
            data1 = metadata.data1,
            data2 = metadata.data2,
            extraString = metadata.extraString,
            packageName = metadata.packageName,
            extraInt = metadata.extraInt
        )
        val meta = KotlinClassMetadata.read(header)!! as KotlinClassMetadata.Class
        ClassName.bestGuess(meta.toKmClass().name)
        meta.toKmClass().name
        meta.toKmClass().properties.forEach { property ->
            property.name
            property.returnType
        }
    }*/

    //For now this seems to work:
    private fun TypeName.javaToKotlinType(): TypeName {
        return when (this) {
            is ParameterizedTypeName -> {
                ParameterizedTypeName.run {
                    (rawType.javaToKotlinType() as ClassName).parameterizedBy(
                        *(typeArguments.map { it.javaToKotlinType() }.toTypedArray())
                    )
                }
            }
            is WildcardTypeName -> {
                outTypes[0].javaToKotlinType()
            }
            else -> {
                val className = JavaToKotlinClassMap.INSTANCE.mapJavaToKotlin(FqName(toString()))?.asSingleFqName()?.asString()
                return if (className == null) {
                    this
                } else {
                    ClassName.bestGuess(className)
                }
            }
        }
    }
}

private data class RouteData(
    val className: ClassName,
    val pages : List<PageData>,
    val paths : List<PathRouteData>,
    val queryParameters : List<QueryParameterData>
)
private data class PathRouteData(val data : RouteData, val name : String)
private data class PageData(val name : String, val queryParameters : List<QueryParameterData>)
private data class QueryParameterData(val name : String, val type: TypeName)

private class AnnotationRoutingEmitter(val routeData: RouteData) {
    val builder = FileSpec.builder("net.justmachinery.shade.generated.routing", routeData.className.simpleName + "Routing")
    fun write(outputDirectory : File){

        outputRouterCallbackInterface(routeData, true)
        flushAddedClasses()

        outputRouteBuilderFunction()
        outputRoutingBuilderClasses(routeData)
        flushAddedClasses()

        builder.build().writeTo(outputDirectory)
    }

    private fun outputRouterCallbackInterface(data: RouteData, topLevel : Boolean){
        val typeName = data.routerClassName()

        if(reversedAddClasses.containsKey(typeName)){ return }

        val type = TypeSpec.classBuilder(typeName)
        val renderIn = TypeVariableName("RenderIn", Tag::class)

        type.addTypeVariable(renderIn)
        type.addModifiers(KModifier.ABSTRACT)

        if(topLevel){
            type.primaryConstructor(FunSpec.constructorBuilder()
                .addPropertyParameter(type, "spec", data.className).build())
            type.superclass(Router::class.parameterizedBy(renderIn))
        }


        data.pages.forEach { pageData ->
            val func = FunSpec.builder(pageData.name)
                .addModifiers(KModifier.ABSTRACT)
                .receiver(TypeVariableName("RenderIn"))
            if(pageData.queryParameters.isNotEmpty()){
                val holder = outputQueryParamsHolder(type, data.paramClassName(pageData.name), pageData.queryParameters)
                func.addParameter("params", holder)
            }
            type.addFunction(func.build())
        }

        data.paths.forEach { pathData ->
            outputRouterCallbackInterface(pathData.data, false)
            val func = FunSpec.builder(pathData.name)
                .addModifiers(KModifier.ABSTRACT)
                .returns(pathData.data.routerClassName().parameterizedBy(renderIn))
            if(pathData.data.queryParameters.isNotEmpty()){
                val holder = outputQueryParamsHolder(type, data.paramClassName(pathData.name), pathData.data.queryParameters)
                func.addParameter("params", holder)
            }
            type.addFunction(func.build())
        }

        outputDispatchFunction(data, type, topLevel)

        reversedAddClasses[typeName] = type.build()
    }


    private fun outputQueryParamsHolder(
        addTo : TypeSpec.Builder,
        name : ClassName,
        params : List<QueryParameterData>
    ) : ClassName {
        val spec = TypeSpec.classBuilder(name)
        val constructor = FunSpec.constructorBuilder()

        params.forEach { param ->
            constructor.addParameter(param.name, ObservableValue::class.parameterizedBy(String::class.asTypeName().copy(nullable = true)))
            constructor.addParameter(param.name + "_spec", QueryParam::class.parameterizedBy(param.type))
            spec.addProperty(
                PropertySpec.builder(param.name, param.type)
                    .delegate("%M(lazy = false){ ${param.name}_spec.tryParse(${param.name}.value) }", MemberName("net.justmachinery.shade", "computed"))
                    .build())
            Unit
        }

        spec.primaryConstructor(constructor.build())

        addTo.addType(spec.build())

        return name
    }


    private fun outputDispatchFunction(data : RouteData, type : TypeSpec.Builder, topLevel: Boolean){
        val renderIn = TypeVariableName.invoke("RenderIn")
        val func = FunSpec.builder("dispatch")
            .addParameter("component", AdvancedComponent::class.parameterizedBy(STAR, STAR))
            .addParameter("withRouting", WithRouting::class.parameterizedBy(renderIn))
            .apply { if(topLevel) addModifiers(KModifier.OVERRIDE) else addParameter("spec", data.className)}

        func.beginControlFlow("component.run")
        func.beginControlFlow("withRouting.run")

        data.pages.forEach { pageData ->
            func.beginControlFlow("run")
            func.addStatement("val specPage = spec.${pageData.name}")
            pageData.queryParameters.forEach {
                func.addStatement("val ${it.name} = getParam(specPage.contents.${it.name}.name)")
            }
            func.beginControlFlow("match(specPage)")
            if(pageData.queryParameters.isNotEmpty()){
                val params = pageData.queryParameters.joinToString(", "){
                    "${it.name}, specPage.contents.${it.name}"
                }
                func.addStatement("${pageData.name}(%T($params))", data.paramClassName(pageData.name))
            } else {
                func.addStatement("${pageData.name}()")
            }
            func.endControlFlow()
            func.endControlFlow()
        }
        data.paths.forEach { pathData ->
            val name = pathData.name
            func.beginControlFlow("run")
            func.addStatement("val specNext = spec.$name")
            pathData.data.queryParameters.forEach {
                func.addStatement("val ${it.name} = getParam(specNext.contents.${it.name}.name)")
            }
            func.beginControlFlow("match(specNext)")
            func.beginControlFlow("route")
                if(pathData.data.queryParameters.isNotEmpty()){
                    val params = pathData.data.queryParameters.joinToString(", "){
                        "${it.name}, specNext.contents.${it.name}"
                    }
                    func.addStatement("val instance = ${name}(%T($params))", data.paramClassName(pathData.name))
                } else {
                    func.addStatement("val instance = $name()")
                }
                func.addStatement("instance.dispatch(component, this, specNext.contents)")
            func.endControlFlow()
            func.endControlFlow()
            func.endControlFlow()
        }

        func.endControlFlow()
        func.endControlFlow()
        type.addFunction(func.build())
    }




    private fun outputRouteBuilderFunction(){
        val funSpec = FunSpec.builder("build")
        constructRouteBuilderFunction(
            funSpec = funSpec,
            createSpec = "this",
            resultType = routeData.builderClassName(),
            params = routeData.queryParameters,
            parameterTemplate = { "RouteBeingBuilt.fromBase(appendBasePath, $it), spec" },
            alwaysCreateSpec = true
        )
        funSpec.receiver(routeData.className)
        builder.addFunction(funSpec.build())
    }

    private fun constructRouteBuilderFunction(
        funSpec : FunSpec.Builder,
        resultType : TypeName,
        createSpec : String,
        params : List<QueryParameterData>,
        parameterTemplate : (String)->String,
        alwaysCreateSpec : Boolean
    ) {
        funSpec.returns(resultType)

        if(alwaysCreateSpec || params.isNotEmpty()){
            funSpec.addStatement("val spec = $createSpec")
        }

        val queryParamMap = if(params.isEmpty()) "emptyMap()" else {
            val serializedQueryParams = params.joinToString(", ") { "spec.${it.name}.name to spec.${it.name}.serialize(${it.name})" }
            "mapOf($serializedQueryParams)"
        }

        params.forEach {
            val spec = ParameterSpec.builder(it.name, it.type)
            if(it.type.isNullable){
                spec.defaultValue("null")
            }
            funSpec.addParameter(spec.build())
        }

        funSpec.addStatement("return %T(${parameterTemplate(queryParamMap)})", resultType)
    }

    private fun outputRoutingBuilderClasses(
        routeData: RouteData
    ) : TypeName {
        val name = routeData.builderClassName()
        val clazz = TypeSpec.classBuilder(name)

        clazz.primaryConstructor(FunSpec.constructorBuilder()
            .addPropertyParameter(clazz, "routeBeingBuilt", RouteBeingBuilt::class.asTypeName())
            .addPropertyParameter(clazz, "spec", routeData.className)
            .build())

        routeData.paths.forEach { subPath ->
            val resultName = outputRoutingBuilderClasses(subPath.data)

            val routeMethod = FunSpec.builder(subPath.name)
            routeMethod.addStatement("val next = spec.${subPath.name}")
            constructRouteBuilderFunction(
                funSpec = routeMethod,
                resultType = resultName,
                createSpec = "next.contents",
                params = subPath.data.queryParameters,
                parameterTemplate = { "routeBeingBuilt.next(next.path, $it), spec" },
                alwaysCreateSpec = true
            )
            clazz.addFunction(routeMethod.build())
        }

        routeData.pages.forEach { page ->
            val pageMethod = FunSpec.builder(page.name)
            pageMethod.addStatement("val next = spec.${page.name}")
            constructRouteBuilderFunction(
                funSpec = pageMethod,
                createSpec = "next.contents",
                params = page.queryParameters,
                resultType = FinishedRoute::class.asTypeName(),
                parameterTemplate = { "routeBeingBuilt.next(next.path, $it)" },
                alwaysCreateSpec = false
            )
            clazz.addFunction(pageMethod.build())
        }

        reversedAddClasses[name] = clazz.build()

        return name
    }

    //Utils

    private fun FunSpec.Builder.addPropertyParameter(clazz : TypeSpec.Builder, name : String, type : TypeName) : FunSpec.Builder {
        this.addParameter(name, type)
        clazz.addProperty(
            PropertySpec.builder(
                name,
                type
            ).initializer(name).addModifiers(KModifier.PRIVATE).build()
        )
        return this
    }

    private fun ClassName.parameterizedBy(vararg args : TypeName) = ParameterizedTypeName.run { this@parameterizedBy.parameterizedBy(*args) }
    private fun KClass<*>.parameterizedBy(vararg args : TypeName) = this.asClassName().parameterizedBy(*args)

    //We traverse depth first, but output breadth first for a cleaner generated file
    private val reversedAddClasses = LinkedHashMap<ClassName, TypeSpec>()
    private fun flushAddedClasses() {
        reversedAddClasses.values.reversed().forEach { builder.addType(it) }
        reversedAddClasses.clear()
    }


    private fun RouteData.paramClassName(node : String) = routerClassName().nestedClass(node.capitalize() + "Params")
    private fun RouteData.routerClassName() = suffixClassName("Router")
    private fun RouteData.builderClassName() = suffixClassName("Builder")
    private fun RouteData.suffixClassName(suffix : String) = ClassName(builder.packageName, this.className.simpleName + suffix)
}