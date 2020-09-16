package net.justmachinery.shade.components

import kotlinx.html.*
import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.render.ComponentAdd
import net.justmachinery.shade.utility.GetSet
import net.justmachinery.shade.utility.eql
import kotlin.reflect.KClass

interface ComponentHelpers : ComponentAdd {
    fun HtmlBlockTag.boundInput(bound : GetSet<String>, cb: INPUT.()->Unit){
        boundInput(bound, {it}, {it}, cb)
    }
    fun <T> HtmlBlockTag.boundInput(
        bound: GetSet<T>,
        toString: (T) -> String,
        fromString: (String) -> T,
        cb: INPUT.() -> Unit
    ){
        @Suppress("UNCHECKED_CAST")
        add(
            BoundInput::class as KClass<out AdvancedComponent<BoundTag.Props<T, INPUT>, HtmlBlockTag>>, BoundTag.Props(
                bound = bound,
                cb = cb.eql,
                toString = toString.eql,
                fromString = fromString.eql
            ))
    }

    fun HtmlBlockTag.boundTextArea(bound : GetSet<String>, cb: TEXTAREA.()->Unit){
        boundTextArea(bound, {it}, {it}, cb)
    }
    fun <T> HtmlBlockTag.boundTextArea(
        bound: GetSet<T>,
        toString: (T) -> String,
        fromString: (String) -> T,
        cb: TEXTAREA.() -> Unit
    ){
        @Suppress("UNCHECKED_CAST")
        add(
            BoundTextArea::class as KClass<out AdvancedComponent<BoundTag.Props<T, TEXTAREA>, HtmlBlockTag>>, BoundTag.Props(
                bound = bound,
                cb = cb.eql,
                toString = toString.eql,
                fromString = fromString.eql
            ))
    }

    fun HtmlBlockTag.boundSelect(bound : GetSet<String>, cb: SELECT.()->Unit){
        boundSelect(bound, {it}, {it}, cb)
    }
    fun <T> HtmlBlockTag.boundSelect(
        bound: GetSet<T>,
        toString: (T) -> String,
        fromString: (String) -> T,
        cb: SELECT.() -> Unit
    ){
        @Suppress("UNCHECKED_CAST")
        add(
            BoundSelect::class as KClass<out AdvancedComponent<BoundTag.Props<T, SELECT>, HtmlBlockTag>>, BoundTag.Props(
                bound = bound,
                cb = cb.eql,
                toString = toString.eql,
                fromString = fromString.eql
            ))
    }


    fun HtmlBlockTag.intInput(bound : GetSet<Int>, cb: INPUT.()->Unit){
        boundInput(
            bound = bound,
            fromString = { it.toIntOrNull() ?: 0 },
            toString = { it.toString() }
        ){
            type = InputType.number
            cb()
        }
    }

    fun HtmlBlockTag.boundCheckbox(bound : GetSet<Boolean>, cb: INPUT.()->Unit){
        add(BoundCheckbox.Props(bound, cb.eql))
    }
}