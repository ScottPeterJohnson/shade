package net.justmachinery.shade.routing.annotation.processor

import com.squareup.kotlinpoet.*
import kotlinx.html.Tag
import net.justmachinery.futility.ErrorOr
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.routing.annotation.*
import net.justmachinery.shade.routing.base.WithRouting
import net.justmachinery.shade.state.ObservableValue
import java.io.File
import kotlin.reflect.KClass


internal class AnnotationRoutingEmitter(val routeData: RouteData) {
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

        data.notFoundHandlers.forEach { notFound ->
            val func = FunSpec.builder(notFound.name)
                .addModifiers(KModifier.ABSTRACT)
                .receiver(TypeVariableName("RenderIn"))
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
        val paramsHolder = TypeSpec.classBuilder(name)

        val supportName = name.nestedClass("Support")
        val support = TypeSpec.classBuilder(supportName)
        val supportConstructor = FunSpec.constructorBuilder()
        support.addSuperinterface(ParamsHolderSupport::class)


        val computed = MemberName("net.justmachinery.shade.state", "computed")
        params.forEach { param ->
            supportConstructor.addParameter(param.name, ObservableValue::class.parameterizedBy(String::class.asTypeName().copy(nullable = true)))
            supportConstructor.addParameter(param.name + "_spec", QueryParam::class.parameterizedBy(param.type))
            support.addProperty(
                PropertySpec.builder(param.name, ErrorOr::class.asTypeName().parameterizedBy(param.type))
                    .delegate("%M { ${param.name}_spec.tryParse(${param.name}.value) }", computed)
                    .build()
            )
            paramsHolder.addProperty(
                PropertySpec.builder(param.name, param.type)
                    .getter(FunSpec.getterBuilder().addCode("return support.${param.name}.unwrap()").build())
                    .build()
            )
        }
        support.addProperty(PropertySpec.builder("allValid", Boolean::class)
            .addModifiers(KModifier.OVERRIDE)
            .delegate("%M { ${params.joinToString(" && "){ "this." + it.name + ".isResult()" } } }", computed)
            .build())

        support.primaryConstructor(supportConstructor.build())
        paramsHolder.primaryConstructor(FunSpec.constructorBuilder()
            .addPropertyParameter(paramsHolder, "support", supportName)
            .build())

        paramsHolder.addType(support.build())
        addTo.addType(paramsHolder.build())

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
            if(pageData.queryParameters.isNotEmpty()){
                val params = pageData.queryParameters.joinToString(", "){
                    "getParam(specPage.contents.${it.name}.name), specPage.contents.${it.name}"
                }
                func.addStatement("val support = %T($params)", data.paramClassName(pageData.name).nestedClass("Support"))
                func.beginControlFlow("match(specPage, support)")
                func.addStatement("${pageData.name}(%T(support))", data.paramClassName(pageData.name))
            } else {
                func.beginControlFlow("match(specPage)")
                func.addStatement("${pageData.name}()")
            }
            func.endControlFlow()
            func.endControlFlow()
        }
        data.paths.forEach { pathData ->
            val name = pathData.name
            func.beginControlFlow("run")
            func.addStatement("val specNext = spec.$name")
            if(pathData.data.queryParameters.isNotEmpty()){
                val params = pathData.data.queryParameters.joinToString(", "){
                    "getParam(specNext.contents.${it.name}.name), specNext.contents.${it.name}"
                }
                func.addStatement("val support = %T($params)", data.paramClassName(name).nestedClass("Support"))
                func.beginControlFlow("match(specNext, support)")
                func.beginControlFlow("route")
                func.addStatement("val instance = ${name}(%T(support))", data.paramClassName(name))
            } else {
                func.beginControlFlow("match(specNext)")
                func.beginControlFlow("route")
                func.addStatement("val instance = $name()")
            }
            func.addStatement("instance.dispatch(component, this, specNext.contents)")
            func.endControlFlow()
            func.endControlFlow()
            func.endControlFlow()
        }

        if(data.notFoundHandlers.isNotEmpty()){
            func.beginControlFlow("notFound")
            data.notFoundHandlers.forEach { notFound ->
                func.addStatement("this.${notFound.name}()")
            }
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
            parameterTemplate = { "RouteBeingBuilt.begin(spec, $it), spec" },
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