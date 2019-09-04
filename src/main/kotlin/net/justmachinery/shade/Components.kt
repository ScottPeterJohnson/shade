package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.html.*
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.addComponent
import kotlin.reflect.KClass



open class Props<T : Any>(
    val context : ClientContext,
    val props : T,
    val key : String? = null,
    val kClass : KClass<out Component<T, *>>,
    val renderIn : KClass<out Tag>,
    val treeDepth : Int
)

/**
 * A Component renders a chunk of DOM which can attach server-side callbacks on client-side events.
 * It is automatically rerendered when any observable state used in its render function changes.
 * Note that instances of this class MUST have a constructor that accepts the single fullProps parameter.
 */
abstract class Component<PropType : Any, RenderIn : Tag>(fullProps : Props<PropType>) : CoroutineScope by fullProps.context.coroutineScope {
    var props = fullProps.props
    val context = fullProps.context
    val key = fullProps.key
    val kClass = fullProps.kClass
    val renderIn = fullProps.renderIn
    internal val treeDepth = fullProps.treeDepth
    internal val renderState = ComponentRenderState()
    @Suppress("LeakingThis")
    internal val ref = ComponentReference(this)

    /**
     * Main function to implement. This will be called whenever any observable state used in it changes.
     */
    abstract fun RenderIn.render()

    //Lifecycle functions.
    open fun mounted(){}
    open fun unmounted(){}

    internal fun doUnmount(){
        ref.component = null
        unmounted()
    }
    /**
     * Allows a component to catch errors.
     * If true, error has been handled by this component.
     */
    open fun onCatch(throwable: Throwable) : Boolean = false

    //Useful helper functions and aliases
    fun <T> observable(initial : T) = ClientObservableState(context, initial)

    //TODO: Improve this with reified <> once Kotlin allows generic arguments to have defaults
    fun <Props : Any, RenderIn : Tag> RenderIn.add(component : KClass<out Component<Props, RenderIn>>, props : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(this@Component, this, component, this::class, props, key)

    //Event CB helpers

    private fun callbackString(
        prefix : String = "",
        suffix : String = "",
        data : String? = null,
        cb : suspend (Json?)->Unit
    ): String {
        val (id, js) = context.eventCallbackString(prefix = prefix, suffix = suffix, data = data, cb = cb)
        renderState.lastRenderCallbackIds.add(id)
        return js
    }

    fun CommonAttributeGroupFacade.onValueChange(prefix : String = "", suffix : String = "", cb : suspend (String)->Unit) { onChange = callbackString(prefix, suffix, "event.srcElement.value", cb = { cb(Gson().fromJson(it!!.raw, String::class.java)) }) }
    fun CommonAttributeGroupFacade.onValueInput(prefix : String = "", suffix : String = "", cb : suspend (String)->Unit) { onInput = callbackString(prefix, suffix, "event.srcElement.value", cb = { cb(Gson().fromJson(it!!.raw, String::class.java)) }) }

    //fun .*\.(on[^(]+)\(.*
    //fun CommonAttributeGroupFacade.$1(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { $1 = eventCallbackStringReturning(prefix, suffix, data, cb = cb) }

    fun CommonAttributeGroupFacade.onAbort(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onAbort = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onBlur(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onBlur = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlay(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onCanPlay = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlayThrough(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onCanPlayThrough = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onChange = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onClick(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onClick = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onContextMenu(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onContextMenu = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDoubleClick(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDoubleClick = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDrag(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDrag = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnd(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragEnd = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnter(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragEnter = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragLeave(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragLeave = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragOver(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragOver = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragStart(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragStart = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDrop(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDrop = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onDurationChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDurationChange = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onEmptied(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onEmptied = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onEnded(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onEnded = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onError(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onError = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onFocus(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFocus = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusIn(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFocusIn = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusOut(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFocusOut = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onFormChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFormChange = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onFormInput(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFormInput = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onInput(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onInput = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onInvalid(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onInvalid = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyDown(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onKeyDown = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyPress(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onKeyPress = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyUp(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onKeyUp = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoad(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoad = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedData(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoadedData = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedMetaData(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoadedMetaData = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadStart(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoadStart = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseDown(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseDown = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseMove(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseMove = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOut(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseOut = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOver(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseOver = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseUp(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseUp = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseWheel(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseWheel = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onPause(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onPause = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onPlay(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onPlay = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onPlaying(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onPlaying = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onProgress(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onProgress = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onRateChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onRateChange = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onReadyStateChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onReadyStateChange = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onScroll(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onScroll = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onSearch(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSearch = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeked(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSeeked = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeking(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSeeking = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onSelect(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSelect = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onShow(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onShow = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onStalled(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onStalled = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onSubmit(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSubmit = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onSuspend(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSuspend = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onTimeUpdate(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTimeUpdate = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchCancel(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchCancel = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchEnd(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchEnd = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchMove(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchMove = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchStart(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchStart = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onVolumeChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onVolumeChange = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onWaiting(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onWaiting = callbackString(prefix, suffix, data, cb = cb) }
    fun CommonAttributeGroupFacade.onWheel(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onWheel = callbackString(prefix, suffix, data, cb = cb) }
}

//This allows for components to be unmounted and garbage collected while still retaining references in state
internal data class ComponentReference(var component : Component<*,*>?)


