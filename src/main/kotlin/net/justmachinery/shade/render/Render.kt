package net.justmachinery.shade.render

import kotlinx.html.SCRIPT
import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import kotlinx.html.stream.appendHTML
import kotlinx.html.visit
import net.justmachinery.shade.Component
import net.justmachinery.shade.Props
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.reflect.KClass

internal data class ComponentRenderState(
    val componentId : UUID = UUID.randomUUID(),
    var renderTreeRoot : RenderTreeLocation? = null,
    var location : RenderTreeLocationFrame? = null,
    val lastRenderCallbackIds : MutableList<Long> = mutableListOf()
)

internal fun <RenderIn : Tag> Component<*, RenderIn>.renderInternal(tag : RenderIn, addMarkers : Boolean){
    renderState.lastRenderCallbackIds.forEach {
        context.removeCallback(it)
    }
    context.hasReRendered?.add(this)
    renderState.lastRenderCallbackIds.clear()
    context.withComponentRendering(this){
        if(addMarkers) SCRIPT(mapOf(
            "type" to "shade",
            "id" to renderState.componentId.toString()
        ), tag.consumer).visit {}
        tag.run {
            updateRenderTree(renderState){
                try {
                    this.render()
                } catch(t : Throwable){
                    if(!this@renderInternal.onCatch(t)){
                        throw t
                    }
                }
            }
        }
        if(addMarkers) SCRIPT(mapOf(
            "type" to "shade",
            "id" to renderState.componentId.toString() + "-end"
        ), tag.consumer).visit {}
    }
}

internal fun <RenderIn : Tag> Component<*, RenderIn>.updateRender(clazz : KClass<out RenderIn>){
    val html = ByteArrayOutputStream().let { baos ->
        baos.writer().buffered().use {
            val consumer = it.appendHTML(prettyPrint = false)
            val tag = clazz.java.getDeclaredConstructor(Map::class.java, TagConsumer::class.java).also { it.isAccessible = true }.newInstance(emptyMap<String,String>(), consumer)
            renderInternal(tag, addMarkers = false)
            consumer.finalize()
        }
        baos.toByteArray()
    }
    val base64 = Base64.getEncoder().encode(html).toString(Charsets.UTF_8)
    context.executeScript("r(\"${renderState.componentId}\",\"$base64\");")
}



fun <T : Any, RenderIn : Tag> addComponent(
    parent : Component<*, *>,
    block : RenderIn,
    component : KClass<out Component<T, RenderIn>>,
    renderIn : KClass<out Tag>,
    props : T,
    key : String? = null
){
    val (renderType, comp) = getOrConstructComponent(parent, component, renderIn, props, key)
    when(renderType){
        GetComponentResult.NEW, GetComponentResult.EXISTING_RERENDER -> {
            comp.run {
                renderInternal(block, addMarkers = true)
            }
            if(renderType == GetComponentResult.NEW){
                comp.mounted()
            }
        }
        GetComponentResult.EXISTING_KEEP -> {
            SCRIPT(mapOf(
                "type" to "shade",
                "id" to comp.renderState.componentId.toString(),
                "data-shade-keep" to "true"
            ), block.consumer).visit {}
        }
    }

    parent.renderState.location?.let {
        it.newRenderTreeLocation.children.add(RenderTreeChild.ComponentChild(it.renderTreeChildIndex, comp))
        it.renderTreeChildIndex += 1
    }
}

private enum class GetComponentResult {
    NEW,
    EXISTING_RERENDER,
    EXISTING_KEEP
}

private fun <T : Any, RenderIn : Tag> getOrConstructComponent(
    parent : Component<*, *>,
    component : KClass<out Component<T, RenderIn>>,
    renderIn : KClass<out Tag>,
    props : T,
    key : String? = null
) : Pair<GetComponentResult, Component<T, RenderIn>> {
    parent.renderState.location?.let {
        val oldComponent = it.oldRenderTreeLocation?.children?.getOrNull(it.renderTreeChildIndex)
        if(oldComponent is RenderTreeChild.ComponentChild && oldComponent.component.kClass == component){
            @Suppress("UNCHECKED_CAST")
            (oldComponent.component as Component<T, RenderIn>)
            return if(oldComponent.component.props == props){
                GetComponentResult.EXISTING_KEEP to oldComponent.component
            } else {
                oldComponent.component.props = props
                GetComponentResult.EXISTING_RERENDER to oldComponent.component
            }
        }
    }
    return GetComponentResult.NEW to component.java.getDeclaredConstructor(Props::class.java).also { it.isAccessible = true }.newInstance(
        Props(
            context = parent.context,
            props = props,
            key = key,
            kClass = component,
            renderIn = renderIn,
            treeDepth = parent.treeDepth + 1
        )
    )
}