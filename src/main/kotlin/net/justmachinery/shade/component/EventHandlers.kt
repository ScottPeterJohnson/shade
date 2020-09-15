package net.justmachinery.shade.component

import com.google.gson.Gson
import kotlinx.html.*
import net.justmachinery.shade.ERROR_HANDLER_IDENTIFIER
import net.justmachinery.shade.currentContext
import net.justmachinery.shade.render.RenderTreeRecorderConsumer
import net.justmachinery.shade.render.toRenderTreeTagLocation
import net.justmachinery.shade.utility.Json

interface EventHandlers : ComponentBase {
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
            errorHandler = currentContext()[ERROR_HANDLER_IDENTIFIER],
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
            data = "it.value",
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
            data = "it.value",
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