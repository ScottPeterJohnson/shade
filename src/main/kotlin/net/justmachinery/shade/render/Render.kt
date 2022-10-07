package net.justmachinery.shade.render

import com.google.common.cache.CacheBuilder
import com.google.common.cache.CacheLoader
import com.google.common.collect.BiMap
import com.google.common.collect.HashBiMap
import com.google.common.collect.Sets
import kotlinx.html.HTML
import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import net.justmachinery.futility.withValue
import net.justmachinery.shade.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.doMount
import net.justmachinery.shade.state.ChangeBatchChangePolicy
import net.justmachinery.shade.state.runChangeBatch
import net.justmachinery.shade.utility.gson
import java.io.ByteArrayOutputStream
import java.lang.reflect.Constructor
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
            val tag = tagConstructorCache[renderIn.java]
                .newInstance(emptyMap<String,String>(), consumer) as Tag?
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
private val tagConstructorCache = CacheBuilder.newBuilder().build(object : CacheLoader<Class<*>, Constructor<*>>() {
    override fun load(key: Class<*>): Constructor<*> {
        val constructor = key.getDeclaredConstructor(Map::class.java, TagConsumer::class.java)
        constructor.isAccessible = true
        return constructor
    }

})

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
            component.renderDependencies.runRecordingDependencies {
                withShadeContext(component.baseContext){
                    component.handlingErrors(ContextErrorSource.RENDER) {
                        currentlyRendering.withValue(component) {
                            component.run {
                                render()
                            }
                        }
                    }
                }
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

