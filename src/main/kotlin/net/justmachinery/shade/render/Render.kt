package net.justmachinery.shade.render

import kotlinx.html.HTML
import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import net.justmachinery.futility.withValue
import net.justmachinery.shade.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.component.doMount
import net.justmachinery.shade.state.ChangeBatchChangePolicy
import net.justmachinery.shade.state.runChangeBatch
import net.justmachinery.shade.utility.JsStringWriter
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
    var renderTreePathToCallbackId : CallbackIdByRenderTreePath = CallbackIdByRenderTreePath()
)

//A minimal bidirectional map from (render tree path, event name) to callback ID
internal class CallbackIdByRenderTreePath {
    private val forward = HashMap<Pair<RenderTreeTagLocation, String>, Long>(0)
    private val reverse = HashMap<Long, Pair<RenderTreeTagLocation, String>>(0)
    operator fun get(key : Pair<RenderTreeTagLocation, String>) : Long? = forward[key]
    operator fun set(key : Pair<RenderTreeTagLocation, String>, id : Long){
        forward[key] = id
        reverse[id] = key
    }
    fun removeById(id : Long){
        reverse.remove(id)?.let { forward.remove(it) }
    }
}
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
    client.executeScript {
        append(SocketScopeNames.reconcile.raw)
        append("(")
        append(renderState.componentId)
        append(",\"")
        val consumer = shadeToWriter(JsStringWriter(this))
        val tag = tagConstructorCache[renderIn.java]
            .newInstance(emptyMap<String,String>(), consumer) as Tag?
        consumer.shade.containerTag = tag
        @Suppress("UNCHECKED_CAST")
        renderInternal(this@updateRender, tag as RenderIn, addMarkers = false)
        consumer.finalize()
        append("\");")
    }
}
private val tagConstructorCache = object : ClassValue<Constructor<*>>() {
    override fun computeValue(type: Class<*>): Constructor<*> {
        val constructor = type.getDeclaredConstructor(Map::class.java, TagConsumer::class.java)
        constructor.isAccessible = true
        return constructor
    }
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

        oldRenderCallbackIds.forEach {
            if(!renderState.lastRenderCallbackIds.contains(it)){
                component.client.removeCallback(it)
                renderState.renderTreePathToCallbackId.removeById(it)
            }
        }
    }
}

