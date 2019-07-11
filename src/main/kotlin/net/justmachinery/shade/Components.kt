package net.justmachinery.shade

import kotlinx.html.*
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.addComponent
import org.intellij.lang.annotations.Language
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
abstract class Component<PropType : Any, RenderIn : Tag>(fullProps : Props<PropType>) {
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
    fun FlowOrInteractiveOrPhrasingContent.captureInput(cb : INPUT.()->Unit) = renderCaptureInput(context, cb)
    fun <T> observable(initial : T) = ClientObservableState(context, initial)
    fun callbackString(
        @Language("JavaScript 1.8") prefix : String = "",
        @Language("JavaScript 1.8") suffix : String = "",
        cb : suspend ()->Unit
    ): String {
        val (id, js) = context.callbackString(prefix, suffix, cb)
        renderState.lastRenderCallbackIds.add(id)
        return js
    }

    fun <Props : Any, RenderIn : Tag> RenderIn.add(component : KClass<out Component<Props, RenderIn>>, props : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(this@Component, this, component, this::class, props, key)

    //Event CB helpers
    fun CommonAttributeGroupFacade.onAbort(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onAbort = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onBlur(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onBlur = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlay(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onCanPlay = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlayThrough(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onCanPlayThrough = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onChange = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onClick(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onClick = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onContextMenu(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onContextMenu = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDoubleClick(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDoubleClick = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDrag(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDrag = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnd(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragEnd = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnter(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragEnter = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragLeave(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragLeave = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragOver(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragOver = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDragStart(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDragStart = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDrop(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDrop = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onDurationChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onDurationChange = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onEmptied(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onEmptied = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onEnded(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onEnded = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onError(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onError = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFocus(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFocus = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusIn(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFocusIn = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusOut(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFocusOut = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFormChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFormChange = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onFormInput(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onFormInput = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onInput(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onInput = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onInvalid(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onInvalid = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyDown(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onKeyDown = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyPress(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onKeyPress = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyUp(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onKeyUp = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoad(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoad = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedData(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoadedData = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedMetaData(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoadedMetaData = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadStart(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onLoadStart = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseDown(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseDown = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseMove(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseMove = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOut(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseOut = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOver(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseOver = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseUp(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseUp = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseWheel(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onMouseWheel = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onPause(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onPause = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onPlay(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onPlay = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onPlaying(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onPlaying = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onProgress(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onProgress = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onRateChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onRateChange = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onReadyStateChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onReadyStateChange = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onScroll(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onScroll = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSearch(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSearch = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeked(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSeeked = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeking(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSeeking = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSelect(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSelect = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onShow(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onShow = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onStalled(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onStalled = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSubmit(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSubmit = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onSuspend(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onSuspend = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTimeUpdate(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTimeUpdate = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchCancel(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchCancel = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchEnd(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchEnd = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchMove(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchMove = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchStart(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onTouchStart = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onVolumeChange(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onVolumeChange = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onWaiting(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onWaiting = callbackString(prefix, suffix, cb = cb) }
    fun CommonAttributeGroupFacade.onWheel(prefix : String = "", suffix : String = "", cb : suspend ()->Unit) { onWheel = callbackString(prefix, suffix, cb = cb) }
}

//This allows for components to be unmounted and garbage collected while still retaining references in state
internal data class ComponentReference(var component : Component<*,*>?)


