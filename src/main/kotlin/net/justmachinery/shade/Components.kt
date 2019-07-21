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

    private fun eventCallbackString(
        prefix : String = "",
        suffix : String = "",
        data : String = "",
        cb : suspend ()->Unit
    ): String {
        val (id, js) = context.eventCallbackString(prefix = prefix, suffix = suffix, data = data, cb = { cb() })
        renderState.lastRenderCallbackIds.add(id)
        return js
    }
    private fun eventCallbackStringReturning(
        prefix : String = "",
        suffix : String = "",
        data : String = "",
        cb : suspend (String?)->Unit
    ): String {
        val (id, js) = context.eventCallbackString(prefix = prefix, suffix = suffix, data = data, cb = cb)
        renderState.lastRenderCallbackIds.add(id)
        return js
    }
    private fun inputValueCallback(prefix : String, suffix : String, cb : suspend (String)->Unit) : String {
        @Suppress("BadExpressionStatementJS", "JSDeprecatedSymbols", "JSUnresolvedVariable")
        return eventCallbackStringReturning(prefix = prefix, suffix = suffix, data = "event.srcElement.value"){
            cb(Gson().fromJson(it!!, String::class.java))
        }
    }

    //TODO: Improve this with reified <> once Kotlin allows generic arguments to have defaults
    fun <Props : Any, RenderIn : Tag> RenderIn.add(component : KClass<out Component<Props, RenderIn>>, props : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(this@Component, this, component, this::class, props, key)

    //Event CB helpers
    fun CommonAttributeGroupFacade.onAbort(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onAbort = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onBlur(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onBlur = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlay(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onCanPlay = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlayThrough(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onCanPlayThrough = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onChange(prefix : String = "", suffix : String = "", cb : suspend (String)->Unit) { onChange = inputValueCallback(prefix = prefix, suffix = suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onClick(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onClick = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onContextMenu(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onContextMenu = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDoubleClick(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDoubleClick = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDrag(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDrag = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnd(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragEnd = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnter(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragEnter = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragLeave(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragLeave = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragOver(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragOver = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragStart(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragStart = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDrop(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDrop = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDurationChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDurationChange = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onEmptied(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onEmptied = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onEnded(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onEnded = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onError(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onError = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFocus(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFocus = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusIn(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFocusIn = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusOut(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFocusOut = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFormChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFormChange = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFormInput(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFormInput = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onInput(prefix : String = "", suffix : String = "", cb : suspend (String)->Unit) { onInput = inputValueCallback(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onInvalid(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onInvalid = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyDown(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onKeyDown = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyPress(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onKeyPress = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyUp(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onKeyUp = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoad(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoad = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedData(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoadedData = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedMetaData(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoadedMetaData = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadStart(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoadStart = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseDown(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseDown = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseMove(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseMove = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOut(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseOut = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOver(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseOver = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseUp(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseUp = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseWheel(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseWheel = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onPause(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onPause = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onPlay(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onPlay = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onPlaying(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onPlaying = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onProgress(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onProgress = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onRateChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onRateChange = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onReadyStateChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onReadyStateChange = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onScroll(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onScroll = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSearch(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSearch = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeked(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSeeked = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeking(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSeeking = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSelect(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSelect = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onShow(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onShow = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onStalled(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onStalled = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSubmit(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSubmit = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSuspend(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSuspend = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTimeUpdate(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTimeUpdate = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchCancel(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchCancel = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchEnd(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchEnd = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchMove(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchMove = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchStart(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchStart = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onVolumeChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onVolumeChange = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onWaiting(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onWaiting = eventCallbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onWheel(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onWheel = eventCallbackString(prefix, suffix, cb = cb) }
}

//This allows for components to be unmounted and garbage collected while still retaining references in state
internal data class ComponentReference(var component : Component<*,*>?)


