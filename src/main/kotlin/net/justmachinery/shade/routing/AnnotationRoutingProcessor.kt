package net.justmachinery.shade.routing

import com.squareup.kotlinpoet.*
import kotlinx.html.Tag
import net.justmachinery.shade.AdvancedComponent
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

        val pages = mutableListOf<String>()
        val paths = mutableListOf<PathRouteData>()

        fields.forEach { field ->
            val fieldClazz = field.asType().extractRoutingType()
            if(fieldClazz != null){
                val result = buildRoutingData(fieldClazz)
                paths.add(PathRouteData(data = result, name = field.simpleName.toString()))
            }
            if(field.asType().isRoutingPage()){
                pages.add(field.simpleName.toString())
            }
        }
        return RouteData(
            className = ClassName.bestGuess(element.toString()),
            pages = pages,
            paths = paths
        )
    }


    private fun TypeMirror.isRoutingPage() : Boolean {
        val clazz = (this as? DeclaredType) ?: return false
        return clazz.toString() == RoutedPage::class.qualifiedName
    }
    private fun TypeMirror.extractRoutingType() : Element? {
        val clazz = (this as? DeclaredType) ?: return null
        return if(processingEnv.typeUtils.erasure(clazz).toString() == RoutedPath::class.qualifiedName){
            (clazz.typeArguments[0] as DeclaredType).asElement()
        } else {
            null
        }
    }
}

private data class RouteData(val className: ClassName, val pages : List<String>, val paths : List<PathRouteData>)
private data class PathRouteData(val data : RouteData, val name : String)

private class AnnotationRoutingEmitter(val routeData: RouteData) {
    val builder = FileSpec.builder("net.justmachinery.shade.generated.routing", routeData.className.simpleName + "Routing")
    fun write(outputDirectory : File){
        outputRouteBuilderFunction()

        outputRouterCallbackInterface(routeData, true)
        flushAddedClasses()

        outputRoutingBuilderClasses(routeData)
        flushAddedClasses()

        builder.build().writeTo(outputDirectory)
    }

    private fun outputRouteBuilderFunction(){
        builder.addFunction(FunSpec.builder("build")
            .receiver(routeData.className)
            .addStatement("return %T(RouteBeingBuilt(segment = appendBasePath), this)", routeData.builderClassName())
            .build())
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


        data.pages.forEach {
            type.addFunction(FunSpec.builder(it)
                .addModifiers(KModifier.ABSTRACT)
                .receiver(TypeVariableName("RenderIn"))
                .build())
        }

        data.paths.forEach {
            outputRouterCallbackInterface(it.data, false)
            type.addFunction(FunSpec.builder(it.name)
                .addModifiers(KModifier.ABSTRACT)
                .returns(it.data.routerClassName().parameterizedBy(renderIn))
                .build())
        }

        outputDispatchFunction(data, type, topLevel)

        reversedAddClasses[typeName] = type.build()
    }


    private fun outputDispatchFunction(data : RouteData, type : TypeSpec.Builder, topLevel: Boolean){
        val renderIn = TypeVariableName.invoke("RenderIn")
        val func = FunSpec.builder("dispatch")
            .addParameter("component", AdvancedComponent::class.parameterizedBy(STAR, STAR))
            .addParameter("withRouting", WithRouting::class.parameterizedBy(renderIn))
            .apply { if(topLevel) addModifiers(KModifier.OVERRIDE) else addParameter("spec", data.className)}

        func.beginControlFlow("component.run")
        func.beginControlFlow("withRouting.run")

        data.pages.forEach {
            func.beginControlFlow("match(spec.$it)")
            func.addStatement("$it()")
            func.endControlFlow()
        }
        data.paths.forEach {
            val name = it.name
            func.addStatement("val next = spec.$name")
            func.beginControlFlow("match(next)")
            func.beginControlFlow("route")
                func.addStatement("val instance = $name()")
                func.addStatement("instance.dispatch(component, this, next.contents)")
            func.endControlFlow()
            func.endControlFlow()
        }

        func.endControlFlow()
        func.endControlFlow()
        type.addFunction(func.build())
    }

    private fun ClassName.parameterizedBy(vararg args : TypeName) = ParameterizedTypeName.run { this@parameterizedBy.parameterizedBy(*args) }
    private fun KClass<*>.parameterizedBy(vararg args : TypeName) = this.asClassName().parameterizedBy(*args)

    //We traverse depth first, but output breadth first for a cleaner generated file
    private val reversedAddClasses = LinkedHashMap<ClassName, TypeSpec>()
    private fun flushAddedClasses() {
        reversedAddClasses.values.reversed().forEach { builder.addType(it) }
        reversedAddClasses.clear()
    }

    private fun RouteData.routerClassName() = suffixClassName("Router")
    private fun RouteData.builderClassName() = suffixClassName("Builder")
    private fun RouteData.suffixClassName(suffix : String) = ClassName(builder.packageName, this.className.simpleName + suffix)

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
            routeMethod.returns(resultName)
            routeMethod.addStatement("val next = spec.${subPath.name}")
            routeMethod.addStatement("return %T(routeBeingBuilt.withAddedPath(next.path), next.contents)", resultName)
            clazz.addFunction(routeMethod.build())
        }

        routeData.pages.forEach { page ->
            val pageMethod = FunSpec.builder(page)
            pageMethod.returns(FinishedRoute::class.asTypeName())
            pageMethod.addStatement("val next = spec.${page}")
            pageMethod.addStatement("return %T(routeBeingBuilt.withAddedPath(next.path))", FinishedRoute::class)
            clazz.addFunction(pageMethod.build())
        }

        reversedAddClasses[name] = clazz.build()

        return name
    }

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
}