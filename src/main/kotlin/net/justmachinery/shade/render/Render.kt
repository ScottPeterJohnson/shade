package net.justmachinery.shade.render

import com.google.common.collect.BiMap
import com.google.common.collect.HashBiMap
import com.google.common.collect.Sets
import com.google.gson.Gson
import kotlinx.html.*
import kotlinx.html.stream.appendHTML
import net.justmachinery.shade.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.CallbackWrappingComponent
import net.justmachinery.shade.component.doMount
import net.justmachinery.shade.state.ChangeBatchChangePolicy
import net.justmachinery.shade.state.runChangeBatch
import java.io.ByteArrayOutputStream
import java.util.*

private val threadRenderingBatch = ThreadLocal<RenderBatch>()
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
                threadRenderingBatch.set(null)
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
    var renderTreePathToCallbackId : BiMap<Pair<RenderTreeTagLocation, String>, Long> = HashBiMap.create(0),
    //Temporary storage is necessary due to Kotlin's current lack of functions with two receivers,
    //as a hacky workaround.
    var currentComponentOverride : CallbackWrappingComponent<*,*>? = null
)
internal fun ShadeRootComponent.renderRoot(tag : HtmlBlockTag){
    runRenderBatch {
        renderInternal(tag, true)
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
            val consumer = it.appendHTML(prettyPrint = false)
            val tag = renderIn.java.getDeclaredConstructor(Map::class.java, TagConsumer::class.java)
                .also { it.isAccessible = true }
                .newInstance(emptyMap<String,String>(), consumer)
            @Suppress("UNCHECKED_CAST")
            renderInternal(tag as RenderIn, addMarkers = false)
            consumer.finalize()
        }
        baos.toString(Charsets.UTF_8)
    }


    val escapedHtml = Gson().toJson(html)
    client.executeScript("r(${renderState.componentId},$escapedHtml);")
}

internal fun <RenderIn : Tag> AdvancedComponent<*, RenderIn>.renderInternal(tag : RenderIn, addMarkers : Boolean){
    val oldRenderCallbackIds = renderState.lastRenderCallbackIds
    renderState.lastRenderCallbackIds = TreeSet()
    markDontRerender(this)
    if(addMarkers) {
        SCRIPT(listOfNotNull(
            "type" to "shade",
            "id" to "shade"+renderState.componentId.toString(),
            this.key?.let { "data-key" to it }
        ).toMap(), tag.consumer).visit {}
    }

    try {
        withShadeContext(baseContext){
            tag.run {
                updateRenderTree(renderState) {
                    this@renderInternal.renderDependencies.runRecordingDependencies {
                        handlingErrors(ContextErrorSource.RENDER){
                            this.render()
                        }
                    }
                }
                Unit
            }
        }
    } finally {
        if(addMarkers) {
            SCRIPT(mapOf(
                "type" to "shade",
                "id" to "shade"+renderState.componentId.toString() + "e"
            ), tag.consumer).visit {}
        }

        Sets.difference(oldRenderCallbackIds, renderState.lastRenderCallbackIds).forEach {
            client.removeCallback(it)
            renderState.renderTreePathToCallbackId.inverse().remove(it)
        }
    }
}

