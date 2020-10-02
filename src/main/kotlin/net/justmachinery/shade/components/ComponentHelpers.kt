package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.render.ComponentAdd
import net.justmachinery.shade.utility.GetSet
import net.justmachinery.shade.utility.eqL
import kotlin.reflect.KClass

interface ComponentHelpers : ComponentAdd {
    fun HtmlBlockTag.boundInput(bound : GetSet<String>, cb: INPUT.()->Unit){
        boundInput(
            bound = bound,
            toString = { it },
            fromString = { it },
            normalize = BoundTag.Normalize.Never,
            cb = cb
        )
    }
    fun <T> HtmlBlockTag.boundInput(
        bound: GetSet<T>,
        toString: (T) -> String,
        fromString: (String) -> T,
        normalize : BoundTag.Normalize = BoundTag.Normalize.OnBlur,
        cb: INPUT.() -> Unit
    ){
        @Suppress("UNCHECKED_CAST")
        add(
            component = BoundInput::class as KClass<out AdvancedComponent<BoundTag.Props<T, INPUT>, HtmlBlockTag>>,
            props = BoundTag.Props(
                bound = bound,
                cb = cb.eqL,
                toString = toString.eqL,
                fromString = fromString.eqL,
                normalize = normalize
            )
        )
    }

    fun HtmlBlockTag.boundTextArea(
        bound: GetSet<String>,
        cb: TEXTAREA.() -> Unit
    ){
        boundTextArea(
            bound = bound,
            toString = { it },
            fromString = { it },
            normalize = BoundTag.Normalize.Never,
            cb = cb
        )
    }
    fun <T> HtmlBlockTag.boundTextArea(
        bound: GetSet<T>,
        toString: (T) -> String,
        fromString: (String) -> T,
        normalize: BoundTag.Normalize = BoundTag.Normalize.OnBlur,
        cb: TEXTAREA.() -> Unit
    ){
        @Suppress("UNCHECKED_CAST")
        add(
            BoundTextArea::class as KClass<out AdvancedComponent<BoundTag.Props<T, TEXTAREA>, HtmlBlockTag>>, BoundTag.Props(
                bound = bound,
                cb = cb.eqL,
                toString = toString.eqL,
                fromString = fromString.eqL,
                normalize = normalize
            ))
    }

    fun HtmlBlockTag.boundSelect(bound : GetSet<String>, cb: SELECT.()->Unit){
        boundSelect(
            bound = bound,
            toString = { it },
            fromString = { it },
            cb = cb
        )
    }
    fun <T> HtmlBlockTag.boundSelect(
        bound: GetSet<T>,
        toString: (T) -> String,
        fromString: (String) -> T,
        normalize: BoundTag.Normalize = BoundTag.Normalize.Never,
        cb: SELECT.() -> Unit
    ){
        @Suppress("UNCHECKED_CAST")
        add(
            BoundSelect::class as KClass<out AdvancedComponent<BoundTag.Props<T, SELECT>, HtmlBlockTag>>, BoundTag.Props(
                bound = bound,
                cb = cb.eqL,
                toString = toString.eqL,
                fromString = fromString.eqL,
                normalize = normalize
            ))
    }


    fun HtmlBlockTag.intInput(
        bound: GetSet<Int>,
        normalize: BoundTag.Normalize = BoundTag.Normalize.OnBlur,
        cb: INPUT.() -> Unit
    ){
        boundInput(
            bound = bound,
            fromString = { it.toIntOrNull() ?: 0 },
            toString = { it.toString() },
            normalize = normalize
        ){
            type = InputType.number
            cb()
        }
    }

    fun HtmlBlockTag.boundCheckbox(bound : GetSet<Boolean>, cb: INPUT.()->Unit){
        add(BoundCheckbox.Props(bound, cb.eqL))
    }
}