package net.justmachinery.shade

import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.html.*
import mu.KLogging
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.RenderTreeRecorderConsumer
import net.justmachinery.shade.render.addComponent
import net.justmachinery.shade.render.toRenderTreeTagLocation
import net.justmachinery.shade.routing.*
import java.lang.reflect.ParameterizedType
import java.util.concurrent.ConcurrentHashMap
import kotlin.coroutines.CoroutineContext
import kotlin.reflect.KClass


class ComponentInitData<T : Any>(
    val client : Client,
    val props : T,
    val key : String? = null,
    val renderIn : KClass<out Tag>,
    val treeDepth : Int,
    val context: ComponentContext
)

internal val componentPassProps = ThreadLocal<Any?>()

abstract class PropsType<P : PropsType<P, T>, T : AdvancedComponent<P, *>> {
    @Suppress("UNCHECKED_CAST")
    val type : KClass<T> get() = propsClassToComponentClassMap.getOrPut<KClass<*>, KClass<*>>(this::class){
        ((this::class.java.genericSuperclass as ParameterizedType).actualTypeArguments[1] as Class<*>).kotlin
    } as KClass<T>
}
private val propsClassToComponentClassMap = ConcurrentHashMap<KClass<*>, KClass<*>>()

/**
 * A Component renders a chunk of DOM which can attach server-side callbacks on client-side events.
 * It is automatically rerendered when any observable state used in its render function changes.
 * Instances of this class MUST have a no-argument constructor.
 */
@Suppress("UNCHECKED_CAST")
abstract class Component<PropType : Any> :
    AdvancedComponent<PropType, HtmlBlockTag>(componentPassProps.get() as ComponentInitData<PropType>) {}

@Suppress("UNCHECKED_CAST")
/**
 * Like [Component], but allows specifying the type of tag to render in.
 */
abstract class ComponentInTag<PropType : Any, RenderIn : Tag> :
    AdvancedComponent<PropType, RenderIn>(componentPassProps.get() as ComponentInitData<PropType>) {}

typealias RenderFunction<RenderIn> = RenderIn.()->Unit
class FunctionComponent<RenderIn : Tag>(fullProps : ComponentInitData<Props<RenderIn>>) : AdvancedComponent<FunctionComponent.Props<RenderIn>, RenderIn>(fullProps){
    data class Props<RenderIn : Tag>(val cb : RenderIn.(FunctionComponent<RenderIn>)->Unit, val parent : AdvancedComponent<*,*>)
    override fun RenderIn.render() {
        val parent = props.parent
        val cb = props.cb
        try {
            parent.renderState.renderingFunction = this@FunctionComponent
            cb(this@FunctionComponent)
        } finally {
            parent.renderState.renderingFunction = null
        }
    }
}


/**
 * Like [Component], but allows specifying the type of tag to render in, and passes in props non-magically.
 * This is exposed in case you need that.
 */
abstract class AdvancedComponent<PropType : Any, RenderIn : Tag>(fullProps : ComponentInitData<PropType>) : CoroutineScope {
    companion object : KLogging()

    var _props : PropType? = null
    var props
        get() = _props ?: throw IllegalStateException("""
            Illegal props access, probably from a constructor, e.g. "val foo = props.bar". This is not allowed 
            because props may change on subsequent rerenders, while the component remains. Try a lazy getter instead,
            e.g. "val foo get() = props.bar"
        """.trimIndent())
        internal set(value) { _props = value }
    val client = fullProps.client
    val context = fullProps.context
    internal val key = fullProps.key
    internal val renderIn = fullProps.renderIn
    internal val treeDepth = fullProps.treeDepth

    //This is just state moved to another file for clarity
    internal val renderState = ComponentRenderState(client.nextComponentId())
    @Suppress("LeakingThis")
    internal val renderDependencies = Render(this)

    /**
     * Main function to implement. This will be called whenever any observable state used in it changes.
     */
    abstract fun RenderIn.render()

    //Lifecycle functions.
    open fun mounted(){}
    open fun unmounted(){}

    /**
     * Allows a component to catch errors generated during render, mount, or unmount.
     * If true, error has been handled by this component and will not be logged by Shade.
     * If false, render errors will propagate upwards through the component tree.
     * Note that a partial render will still complete for this component.
     */
    open fun onCatch(exception: ComponentException) : Boolean = false


    private val supervisorJob = SupervisorJob(parent = fullProps.client.supervisor)
    override val coroutineContext: CoroutineContext get() = supervisorJob

    internal fun RenderIn.doRender(){
        maybeHandleExceptions(message = { "While rendering" }){
            render()
        }
    }
    internal fun doMount(){
        client.swallowExceptions {
            maybeHandleExceptions(message = { "While mounting" }){
                mounted()
            }
        }
    }
    internal fun doUnmount(){
        renderDependencies.dispose()
        supervisorJob.cancel()
        client.swallowExceptions {
            maybeHandleExceptions(message = { "While unmounting" }){
                unmounted()
            }
        }
    }

    private fun <T> maybeHandleExceptions(message : ()->String, cb : ()->T) : T? {
        return try {
            cb()
        } catch(t : Throwable){
            val msg = try {
                message()
            } catch(t2 : Throwable){
                t.addSuppressed(t2)
                "(Unable to generate additional context message)"
            }
            val err = ComponentException(component = this, message = msg, cause = t)
            if (!onCatch(err)) {
                throw t
            }
            null
        }
    }

    //This allows for the render() function to work despite there being no ergonomic way to have both a fresh RenderIn tag and
    //a fresh component receiver for the passed-in function.
    private fun realComponentThis() = this.renderState.renderingFunction ?: this

    //Routing functions
    fun <RenderIn : Tag> RenderIn.dispatch(router : Router<RenderIn>) {
        route {
            router.dispatch(realComponentThis(), this@route)
        }
    }
    fun <RenderIn : Tag> RenderIn.startDispatching(urlInfo: UrlInfo, router : Router<RenderIn>)  {
        startRouting(urlInfo) {
            router.dispatch(realComponentThis(), this@startRouting)
        }
    }
    fun <RenderIn : Tag> RenderIn.startRouting(urlInfo: UrlInfo, cb : WithRouting<RenderIn>.()->Unit) = startRoutingInternal(realComponentThis(), urlInfo, cb)
    fun <RenderIn : Tag> RenderIn.route(cb : WithRouting<RenderIn>.()->Unit) = routeInternal(realComponentThis(), cb)


    //Useful helper functions and aliases
    fun <R,T> addContext(identifier: ComponentContextIdentifier<R>, value : R, cb : ()->T) = context.add(arrayOf(ComponentContextValue(identifier, value)), cb)
    fun <T> addContext(vararg values : ComponentContextValue<*>, cb: ()->T) = context.add(values, cb)

    fun <Props : PropsType<Props, T>, T : AdvancedComponent<Props, RenderIn>, RenderIn : Tag> RenderIn.add(pr : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(
            parent = realComponentThis(),
            block = this,
            component = pr.type,
            renderIn = this::class,
            props = pr,
            key = key
        )

    fun <RenderIn : Tag> RenderIn.add(component : KClass<out AdvancedComponent<Unit, RenderIn>>, key : String? = null) = add(component, Unit, key)
    fun <Props : Any, RenderIn : Tag> RenderIn.add(component : KClass<out AdvancedComponent<Props, RenderIn>>, props : Props, key : String? = null) =
        @Suppress("UNCHECKED_CAST")
        addComponent(
            parent = realComponentThis(),
            block = this,
            component = component,
            renderIn = this::class,
            props = props,
            key = key
        )

    /**
     * Renders a new block as if it were an anonymous subcomponent; i.e. it alone will rerender if its dependencies
     * change.
     * Note that the component context captured from the render function passed in will be wrong, but is hackily fixed
     * for shade functions like e.g. onChange.
     */
    fun <RenderIn : Tag> RenderIn.render(cb : RenderFunction<RenderIn>){
        @Suppress("UNCHECKED_CAST")
        add(
            FunctionComponent::class as KClass<FunctionComponent<RenderIn>>,
            FunctionComponent.Props(cb = { cb() }, parent = this@AdvancedComponent)
        )
    }

    /**
     * As [render] but not eliding the new component context
     */
    fun <RenderIn : Tag> RenderIn.renderWithNewComponent(cb : RenderIn.(FunctionComponent<RenderIn>)->Unit){
        @Suppress("UNCHECKED_CAST")
        add(
            FunctionComponent::class as KClass<FunctionComponent<RenderIn>>,
            FunctionComponent.Props(cb = cb, parent = this@AdvancedComponent)
        )
    }

    //Event CB helpers
    private fun CommonAttributeGroupFacade.callbackString(
        eventName : String,
        prefix : String,
        suffix : String,
        data : String?,
        cb : suspend (Json?)->Unit
    ): String {
        //We want to use the same callback ID for callbacks that are attached to the same event listener on the same
        //DOM path in this component; this makes dealing with time delays where a client sends a valid event but Shade
        //updates much easier.
        val cons = consumer as RenderTreeRecorderConsumer
        val pos = cons.frameStack.peek().newRenderTreeLocation.toRenderTreeTagLocation()

        val realThis = realComponentThis()
        val old = realThis.renderState.renderTreePathToCallbackId[pos to eventName]

        val (id, js) = realThis.client.eventCallbackStringInternal(
            prefix = prefix,
            suffix = suffix,
            data = data,
            forceId = old,
            cb = cb
        )
        if(old == null){
            realThis.renderState.renderTreePathToCallbackId[pos to eventName] = id
        }
        realThis.renderState.lastRenderCallbackIds.add(id)
        return js
    }


    fun CommonAttributeGroupFacade.onValueChange(
        prefix: String = "",
        suffix: String = "",
        cb: suspend (String) -> Unit
    ) {
        onChange = callbackString(
            eventName = "onChange",
            prefix = prefix,
            suffix = suffix,
            data = "event.srcElement.value",
            cb = { cb(Gson().fromJson(it!!.raw, String::class.java)) }
        )
    }

    fun CommonAttributeGroupFacade.onValueInput(
        prefix: String = "",
        suffix: String = "",
        cb: suspend (String) -> Unit
    ) {
        onInput = callbackString(
            eventName = "onInput",
            prefix = prefix,
            suffix = suffix,
            data = "event.srcElement.value",
            cb = { cb(Gson().fromJson(it!!.raw, String::class.java)) }
        )
    }

    //fun .*\.(on[^(]+)\(.*
    //fun CommonAttributeGroupFacade.$1(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { $1 = callbackString(eventName = "$1", prefix = prefix, suffix = suffix, data = data, cb = cb) }

    fun CommonAttributeGroupFacade.onAbort(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onAbort = callbackString(eventName = "onAbort", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onBlur(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onBlur = callbackString(eventName = "onBlur", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlay(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onCanPlay = callbackString(eventName = "onCanPlay", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onCanPlayThrough(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onCanPlayThrough = callbackString(eventName = "onCanPlayThrough", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onChange = callbackString(eventName = "onChange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onClick(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onClick = callbackString(eventName = "onClick", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onContextMenu(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onContextMenu = callbackString(eventName = "onContextMenu", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDoubleClick(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDoubleClick = callbackString(eventName = "onDoubleClick", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDrag(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDrag = callbackString(eventName = "onDrag", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnd(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragEnd = callbackString(eventName = "onDragEnd", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragEnter(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragEnter = callbackString(eventName = "onDragEnter", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragLeave(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragLeave = callbackString(eventName = "onDragLeave", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragOver(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragOver = callbackString(eventName = "onDragOver", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDragStart(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDragStart = callbackString(eventName = "onDragStart", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDrop(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDrop = callbackString(eventName = "onDrop", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onDurationChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onDurationChange = callbackString(eventName = "onDurationChange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onEmptied(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onEmptied = callbackString(eventName = "onEmptied", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onEnded(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onEnded = callbackString(eventName = "onEnded", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onError(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onError = callbackString(eventName = "onError", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onFocus(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFocus = callbackString(eventName = "onFocus", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusIn(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFocusIn = callbackString(eventName = "onFocusIn", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onFocusOut(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFocusOut = callbackString(eventName = "onFocusOut", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onFormChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFormChange = callbackString(eventName = "onFormChange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onFormInput(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onFormInput = callbackString(eventName = "onFormInput", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onInput(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onInput = callbackString(eventName = "onInput", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onInvalid(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onInvalid = callbackString(eventName = "onInvalid", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyDown(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onKeyDown = callbackString(eventName = "onKeyDown", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyPress(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onKeyPress = callbackString(eventName = "onKeyPress", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onKeyUp(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onKeyUp = callbackString(eventName = "onKeyUp", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoad(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoad = callbackString(eventName = "onLoad", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedData(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoadedData = callbackString(eventName = "onLoadedData", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadedMetaData(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoadedMetaData = callbackString(eventName = "onLoadedMetaData", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onLoadStart(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onLoadStart = callbackString(eventName = "onLoadStart", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseDown(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseDown = callbackString(eventName = "onMouseDown", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseMove(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseMove = callbackString(eventName = "onMouseMove", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOut(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseOut = callbackString(eventName = "onMouseOut", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseOver(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseOver = callbackString(eventName = "onMouseOver", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseUp(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseUp = callbackString(eventName = "onMouseUp", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onMouseWheel(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onMouseWheel = callbackString(eventName = "onMouseWheel", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onPause(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onPause = callbackString(eventName = "onPause", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onPlay(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onPlay = callbackString(eventName = "onPlay", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onPlaying(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onPlaying = callbackString(eventName = "onPlaying", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onProgress(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onProgress = callbackString(eventName = "onProgress", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onRateChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onRateChange = callbackString(eventName = "onRateChange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onReadyStateChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onReadyStateChange = callbackString(eventName = "onReadyStateChange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onScroll(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onScroll = callbackString(eventName = "onScroll", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onSearch(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSearch = callbackString(eventName = "onSearch", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeked(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSeeked = callbackString(eventName = "onSeeked", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onSeeking(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSeeking = callbackString(eventName = "onSeeking", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onSelect(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSelect = callbackString(eventName = "onSelect", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onShow(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onShow = callbackString(eventName = "onShow", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onStalled(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onStalled = callbackString(eventName = "onStalled", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onSubmit(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSubmit = callbackString(eventName = "onSubmit", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onSuspend(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onSuspend = callbackString(eventName = "onSuspend", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onTimeUpdate(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTimeUpdate = callbackString(eventName = "onTimeUpdate", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchCancel(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchCancel = callbackString(eventName = "onTouchCancel", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchEnd(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchEnd = callbackString(eventName = "onTouchEnd", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchMove(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchMove = callbackString(eventName = "onTouchMove", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onTouchStart(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onTouchStart = callbackString(eventName = "onTouchStart", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onVolumeChange(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onVolumeChange = callbackString(eventName = "onVolumeChange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onWaiting(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onWaiting = callbackString(eventName = "onWaiting", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun CommonAttributeGroupFacade.onWheel(prefix : String = "", suffix : String = "", data : String? = null, cb : suspend (Json?)->Unit) { onWheel = callbackString(eventName = "onWheel", prefix = prefix, suffix = suffix, data = data, cb = cb) }
}


class ComponentException(
    val component : AdvancedComponent<*,*>,
    message : String,
    cause : Throwable
) : RuntimeException(message, cause)