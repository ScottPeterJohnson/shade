package net.justmachinery.shade.render

import com.google.common.collect.BiMap
import com.google.common.collect.HashBiMap
import com.google.common.collect.Sets
import kotlinx.html.SCRIPT
import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import kotlinx.html.stream.appendHTML
import kotlinx.html.visit
import net.justmachinery.shade.*
import org.apache.commons.text.StringEscapeUtils
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.reflect.KClass

internal data class ComponentRenderState(
    val componentId : Int,
    //Root of this component's render tree; it's children etc.
    var renderTreeRoot : RenderTreeLocation? = null,
    //This component's location within the broader render stack
    var location : RenderTreeLocationFrame? = null,
    //Stores callback IDs associated with this component, allowing cleanup on rerender
    var lastRenderCallbackIds : SortedSet<Long> = sortedSetOf(),
    //Allows for callback ID reuse for the same event in the same place in the render tree, which allows for delay compensation
    var renderTreePathToCallbackId : BiMap<Pair<RenderTreeTagLocation, String>, Long> = HashBiMap.create(0),
    //Temporary storage is necessary due to Kotlin's current lack of functions with two receivers,
    //as a hacky workaround.
    var renderingFunction : FunctionComponent<*>? = null
)

internal fun <RenderIn : Tag> AdvancedComponent<*, RenderIn>.renderInternal(tag : RenderIn, addMarkers : Boolean){
    val oldRenderCallbackIds = renderState.lastRenderCallbackIds
    renderState.lastRenderCallbackIds = TreeSet()
    client.markDontRerender(this)
    if(addMarkers) SCRIPT(listOfNotNull(
        "type" to "shade",
        "id" to "shade"+renderState.componentId.toString(),
        this.key?.let { "data-key" to it }
    ).toMap(), tag.consumer).visit {}

    try {
        withComponentContext(context){
            tag.run {
                updateRenderTree(renderState) {
                    this@renderInternal.renderDependencies.runRecordingDependencies {
                        runRenderNoChangesAllowed {
                            this.doRender()
                        }
                    }
                }
            }
        }
    } finally {
        if(addMarkers) SCRIPT(mapOf(
            "type" to "shade",
            "id" to "shade"+renderState.componentId.toString() + "e"
        ), tag.consumer).visit {}

        Sets.difference(oldRenderCallbackIds, renderState.lastRenderCallbackIds).forEach {
            client.removeCallback(it)
            renderState.renderTreePathToCallbackId.inverse().remove(it)
        }
    }
}

internal fun <RenderIn : Tag> AdvancedComponent<*, RenderIn>.updateRender(clazz : KClass<out RenderIn>){
    val html = ByteArrayOutputStream().let { baos ->
        baos.writer().buffered().use {
            val consumer = it.appendHTML(prettyPrint = false)
            val tag = clazz.java.getDeclaredConstructor(Map::class.java, TagConsumer::class.java).also { it.isAccessible = true }.newInstance(emptyMap<String,String>(), consumer)
            renderInternal(tag, addMarkers = false)
            consumer.finalize()
        }
        baos.toString(Charsets.UTF_8)
    }

    val escapedHtml = StringEscapeUtils.escapeEcmaScript(html)
    client.executeScript("r(${renderState.componentId},\"$escapedHtml\");")
}



fun <T : Any, RenderIn : Tag> addComponent(
    parent : AdvancedComponent<*, *>,
    block : RenderIn,
    component : KClass<out AdvancedComponent<T, RenderIn>>,
    renderIn : KClass<out Tag>,
    props : T,
    key : String? = null
){
    val (renderType, comp) = getOrConstructComponent(parent, component, renderIn, props, key)
    when(renderType){
        GetComponentResult.NEW, GetComponentResult.EXISTING_RERENDER -> {
            comp.renderInternal(block, addMarkers = true)
            if(renderType == GetComponentResult.NEW){
                comp.doMount()
            }
        }
        GetComponentResult.EXISTING_KEEP -> {
            SCRIPT(listOfNotNull(
                "type" to "shade",
                "id" to "shade"+comp.renderState.componentId.toString(),
                "data-shade-keep" to "true",
                comp.key?.let { "data-key" to it }
            ).toMap(), block.consumer).visit {}
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
    parent : AdvancedComponent<*, *>,
    component : KClass<out AdvancedComponent<T, RenderIn>>,
    renderIn : KClass<out Tag>,
    props : T,
    key : String? = null
) : Pair<GetComponentResult, AdvancedComponent<T, RenderIn>> {
    parent.renderState.location?.let { frame ->
        val oldComponent = if(key != null){
            frame.oldRenderTreeLocation?.children?.firstOrNull { it is RenderTreeChild.ComponentChild && it.component.key == key }
        } else {
            frame.oldRenderTreeLocation?.children?.getOrNull(frame.renderTreeChildIndex)
        }
        if(oldComponent is RenderTreeChild.ComponentChild && oldComponent.component::class == component){
            @Suppress("UNCHECKED_CAST")
            (oldComponent.component as AdvancedComponent<T, RenderIn>)
            return if(oldComponent.component.props == props){
                GetComponentResult.EXISTING_KEEP to oldComponent.component
            } else {
                oldComponent.component.props = props
                GetComponentResult.EXISTING_RERENDER to oldComponent.component
            }
        }
    }
    return GetComponentResult.NEW to parent.client.root.constructComponent(
        component,
        ComponentInitData(
            client = parent.client,
            props = props,
            key = key,
            renderIn = renderIn,
            treeDepth = parent.treeDepth + 1,
            context = contextInRenderingThread.get()!!
        )
    )
}