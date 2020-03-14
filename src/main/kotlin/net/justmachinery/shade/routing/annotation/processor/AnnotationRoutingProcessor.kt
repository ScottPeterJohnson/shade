package net.justmachinery.shade.routing.annotation.processor

import com.squareup.kotlinpoet.*
import net.justmachinery.shade.routing.annotation.*
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



@SupportedSourceVersion(SourceVersion.RELEASE_11)
@SupportedAnnotationTypes(
    "net.justmachinery.shade.routing.annotation.processor.GenerateRouting"
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
        val notFoundHandlers = mutableListOf<NotFoundHandler>()

        fields.forEach { field ->
            val fieldClazz = field.asType().extractPathContentType()
            if(fieldClazz != null){
                val result = buildRoutingData(fieldClazz)
                paths.add(
                    PathRouteData(
                        data = result,
                        name = field.simpleName.toString()
                    )
                )
            }
            if(field.asType().isRoutingPage()){
                val queryParamSpec = field.asType().extractQueryParameterSpecFromPageType()
                pages.add(PageData(
                    name = field.simpleName.toString(),
                    queryParameters = queryParamSpec?.let { extractQueryParameters(it) } ?: emptyList()
                ))
            }
            if(field.asType().isQueryParameter()){
                queryParameters.add(
                    QueryParameterData(
                        name = field.simpleName.toString(),
                        type = field.asType().extractQueryParameterType()!!
                    )
                )
            }
            if(field.asType().isNotFound()){
                notFoundHandlers.add(
                    NotFoundHandler(
                        field.simpleName.toString()
                    )
                )
            }
        }
        return RouteData(
            className = ClassName.bestGuess(element.toString()),
            pages = pages,
            paths = paths,
            queryParameters = queryParameters,
            notFoundHandlers = notFoundHandlers
        )
    }

    private fun extractQueryParameters(target : Element) : List<QueryParameterData> {
        val parameters = mutableListOf<QueryParameterData>()
        val fields = ElementFilter.fieldsIn(target.enclosedElements)
        fields.forEach { field ->
            if(field.asType().isQueryParameter()){
                parameters.add(
                    QueryParameterData(
                        name = field.simpleName.toString(),
                        type = field.asType().extractQueryParameterType()!!
                    )
                )
            }
        }
        return parameters
    }

    private fun TypeMirror.isNotFound() : Boolean {
        return this.findSuperclass(NotFound::class) != null
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