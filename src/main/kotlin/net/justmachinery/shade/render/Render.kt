package net.justmachinery.shade.render

import com.google.common.collect.BiMap
import com.google.common.collect.HashBiMap
import com.google.common.collect.Sets
import kotlinx.html.HTML
import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import net.justmachinery.shade.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.doMount
import net.justmachinery.shade.state.ChangeBatchChangePolicy
import net.justmachinery.shade.state.runChangeBatch
import net.justmachinery.shade.utility.applyWrappers
import net.justmachinery.shade.utility.gson
import net.justmachinery.shade.utility.withValue
import java.io.ByteArrayOutputStream
import java.util.*

private val threadRenderingBatch = ThreadLocal<RenderBatch>()
internal val currentlyRendering = ThreadLocal<AdvancedComponent<*,*>>()

private data class RenderBatch(
    val dontRerender : MutableSet<AdvancedComponent<*,*>> = Collections.newSetFromMap(WeakHashMap()),
    val mountedComponents : MutableList<AdvancedComponent<*,*>> = mutableListOf()
)

internal fun markDontRerender(component: AdvancedComponent<*, *>){
    val batch = threadRenderingBatch.get()
    batch?.dontRerender?.add(component)
}

private fun runRenderBatch(cb : ()->Unit){
    val existingBatch = threadRenderingBatch.get()
    if(existingBatch != null){
        cb()
    } else {
        val newBatch = RenderBatch()
        threadRenderingBatch.set(newBatch)
        //Note that the change batch by default disallows changes, but may have a few crop up anyway (e.g. due to errors in render)
        runChangeBatch(ChangeBatchChangePolicy.DISALLOWED){
            try {
                cb()
            } finally {
                threadRenderingBatch.remove()
                if(newBatch.mountedComponents.isNotEmpty()){
                    runChangeBatch(ChangeBatchChangePolicy.FORCE_ALLOWED){
                        newBatch.mountedComponents.forEach {
                            it.doMount()
                        }
                    }
                }
            }
        }
    }
}
internal fun addMounted(component : AdvancedComponent<*,*>){
    val batch = threadRenderingBatch.get() ?: throw IllegalStateException("Cannot add component outside render batch: $component")
    batch.mountedComponents.add(component)
}


internal data class ComponentRenderState(
    val componentId : Int,
    //Root of this component's render tree; it's children etc.
    var renderTreeRoot : RenderTreeLocation? = null,
    //This component's location within the broader render stack
    var location : RenderTreeLocationFrame? = null,
    //Stores callback IDs associated with this component, allowing cleanup on rerender
    var lastRenderCallbackIds : SortedSet<Long> = sortedSetOf(),
    //Allows for callback ID reuse for the same event in the same place in the render tree, which allows for delay compensation
    var renderTreePathToCallbackId : BiMap<Pair<RenderTreeTagLocation, String>, Long> = HashBiMap.create(0)
)
internal fun ShadeRootComponent.renderRoot(tag : HTML){
    runRenderBatch {
        renderInternal(this, tag, false)
    }
}

internal fun rerender(client: Client, components : List<AdvancedComponent<*,*> >){
    runRenderBatch {
        components.forEach {
            if(!threadRenderingBatch.get().dontRerender.contains(it)){
                client.swallowExceptions(message = { "While rerendering $it" }) {
                    it.updateRender()
                }
            }
        }
    }
}

private fun <RenderIn : Tag> AdvancedComponent<*, RenderIn>.updateRender(){
    val html = ByteArrayOutputStream().let { baos ->
        baos.writer().buffered().use {
            val consumer = shadeToWriter(it)
            val tag = renderIn.java.getDeclaredConstructor(Map::class.java, TagConsumer::class.java)
                .also { it.isAccessible = true }
                .newInstance(emptyMap<String,String>(), consumer)
            consumer.shade.containerTag = tag
            @Suppress("UNCHECKED_CAST")
            renderInternal(this, tag as RenderIn, addMarkers = false)
            consumer.finalize()
        }
        baos.toString(Charsets.UTF_8)
    }


    val escapedHtml = gson.toJson(html)
    client.executeScript("${SocketScopeNames.reconcile.raw}(${renderState.componentId},$escapedHtml);")
}

internal fun <RenderIn : Tag> renderInternal(
    component: AdvancedComponent<*, RenderIn>,
    tag : RenderIn,
    addMarkers : Boolean
){
    val renderState = component.renderState
    val oldRenderCallbackIds = renderState.lastRenderCallbackIds
    renderState.lastRenderCallbackIds = TreeSet()
    markDontRerender(component)
    if(addMarkers) {
        tag.scriptDirective(
            type = DirectiveType.ComponentStart,
            id = componentIdPrefix + renderState.componentId.toString(),
            key = component.key
        )
    }

    try {
        tag.updateRenderTree(renderState) {
            applyWrappers(listOf(
                { component.renderDependencies.runRecordingDependencies(it) },
                { withShadeContext(component.baseContext, it) },
                { component.handlingErrors(ContextErrorSource.RENDER, it) },
                { currentlyRendering.withValue(component, it) }
            )){
                component.run { render() }
            }
        }
    } finally {
        if(addMarkers) {
            tag.scriptDirective(
                type = DirectiveType.ComponentEnd,
                id = componentIdPrefix + renderState.componentId.toString() + componentIdEndSuffix
            )
        }

        Sets.difference(oldRenderCallbackIds, renderState.lastRenderCallbackIds).forEach {
            component.client.removeCallback(it)
            renderState.renderTreePathToCallbackId.inverse().remove(it)
        }
    }
}

