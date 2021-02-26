package net.justmachinery.shade.component

import kotlinx.html.Tag
import net.justmachinery.shade.AttributeNames
import net.justmachinery.shade.DirectiveType
import net.justmachinery.shade.ERROR_HANDLER_IDENTIFIER
import net.justmachinery.shade.currentContext
import net.justmachinery.shade.render.scriptDirective
import net.justmachinery.shade.render.shade
import net.justmachinery.shade.render.toRenderTreeTagLocation
import net.justmachinery.shade.utility.Json
import net.justmachinery.shade.utility.gson

interface EventHandlers : ComponentBase {
    //Event CB helpers
    fun Tag.addEventCallback(
        eventName : String,
        prefix : String? = null,
        suffix : String? = null,
        data : String? = null,
        cb : suspend (Json?)->Unit
    ) {
        //We want to use the same callback ID for callbacks that are attached to the same event listener on the same
        //DOM path in this component; this makes dealing with time delays where a client sends a valid event but Shade
        //updates much easier.
        val cons = consumer.shade
        val pos = cons.recorder!!.frameStack.peek().newRenderTreeLocation.toRenderTreeTagLocation()

        val realThis = realComponentThis()
        val old = realThis.renderState.renderTreePathToCallbackId[pos to eventName]

        val id = realThis.client.eventCallbackId(
            forceId = old,
            errorHandler = currentContext()[ERROR_HANDLER_IDENTIFIER],
            cb = cb
        )
        if(old == null){
            realThis.renderState.renderTreePathToCallbackId[pos to eventName] = id
        }
        realThis.renderState.lastRenderCallbackIds.add(id)

        scriptDirective(DirectiveType.EventHandler, data = listOfNotNull(
            prefix?.let { AttributeNames.EventPrefix to it },
            suffix?.let { AttributeNames.EventSuffix to it },
            data?.let { AttributeNames.EventData to it },
            AttributeNames.EventName to eventName,
            AttributeNames.EventCallbackId to id.toString()
        ))
    }



    fun Tag.onValueChange(
        prefix: String? = null,
        suffix: String? = null,
        cb: suspend (String) -> Unit
    ) {
        addEventCallback(
            eventName = "change",
            prefix = prefix,
            suffix = suffix,
            data = "it.value",
            cb = { cb(gson.fromJson(it!!.raw, String::class.java)) }
        )
    }

    fun Tag.onValueInput(
        prefix: String? = null,
        suffix: String? = null,
        cb: suspend (String) -> Unit
    ) {
        addEventCallback(
            eventName = "input",
            prefix = prefix,
            suffix = suffix,
            data = "it.value",
            cb = { cb(gson.fromJson(it!!.raw, String::class.java)) }
        )
    }

    //fun .*\.(on[^(]+)\(.*
    //fun Tag.$1(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { $1 = callbackString(eventName = "$1", prefix = prefix, suffix = suffix, data = data, cb = cb) }

    fun Tag.onAbort(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "abort", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onBlur(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "blur", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onCanPlay(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "canplay", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onCanPlayThrough(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "canplaythrough", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onChange(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "change", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onClick(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "click", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onContextMenu(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "contextmenu", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDoubleClick(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "doubleclick", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDrag(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "drag", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDragEnd(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "dragend", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDragEnter(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "dragenter", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDragLeave(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "dragleave", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDragOver(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "dragover", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDragStart(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "dragstart", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDrop(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "drop", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onDurationChange(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "durationchange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onEmptied(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "emptied", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onEnded(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "ended", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onError(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "error", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onFocus(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "focus", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onFocusIn(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "focusin", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onFocusOut(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "focusout", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onFormChange(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "formchange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onFormInput(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "forminput", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onInput(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "input", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onInvalid(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "invalid", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onKeyDown(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "keydown", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onKeyPress(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "keypress", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onKeyUp(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "keyup", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onLoad(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "load", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onLoadedData(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "loadeddata", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onLoadedMetaData(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "loadedmetadata", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onLoadStart(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "loadstart", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onMouseDown(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "mousedown", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onMouseMove(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "mousemove", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onMouseOut(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "mouseout", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onMouseOver(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "mouseover", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onMouseUp(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "mouseup", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onMouseWheel(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "mousewheel", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onPause(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "pause", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onPlay(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "play", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onPlaying(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "playing", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onProgress(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "progress", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onRateChange(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "ratechange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onReadyStateChange(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "readystatechange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onScroll(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "scroll", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onSearch(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "search", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onSeeked(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "seeked", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onSeeking(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "seeking", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onSelect(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "select", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onShow(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "show", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onStalled(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "stalled", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onSubmit(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "submit", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onSuspend(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "suspend", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onTimeUpdate(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "timeupdate", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onTouchCancel(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "touchcancel", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onTouchEnd(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "touchend", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onTouchMove(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "touchmove", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onTouchStart(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "touchstart", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onVolumeChange(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "volumechange", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onWaiting(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "waiting", prefix = prefix, suffix = suffix, data = data, cb = cb) }
    fun Tag.onWheel(prefix : String? = null, suffix : String? = null, data : String? = null, cb : suspend (Json?)->Unit) { addEventCallback(eventName = "wheel", prefix = prefix, suffix = suffix, data = data, cb = cb) }
}