package net.justmachinery.shade.components

import kotlinx.html.HtmlBlockTag
import kotlinx.html.OPTION
import kotlinx.html.SELECT
import kotlinx.html.option
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.ComponentInTag
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.state.ObservableValue
import net.justmachinery.shade.utility.EqLambda

class Select<T> : Component<Select.Props<T>>() {
    data class Props<T>(
        val selected : ObservableValue<T>,
        val options : List<T>,
        val render : (T)->String,
        val customize : EqLambda<SELECT.()->Unit> = EqLambda {},
        val customizeOption : EqLambda<OPTION.(T)->Unit> = EqLambda {},
    ) : PropsType<Props<T>, Select<T>>()

    override fun HtmlBlockTag.render() {
        boundSelect(
            bound = props.selected,
            fromString = { props.options[it.toInt()] },
            toString = { props.options.indexOf(it).toString() }
        ){
            props.customize.raw(this)
            props.options.forEachIndexed { index, value ->
                add(SelectOption.Props(props.render, props.customizeOption, value, index))
            }
        }
    }
}

internal class SelectOption<T> : ComponentInTag<SelectOption.Props<T>, SELECT>(){
    data class Props<T>(
        val render : (T)->String,
        val customize : EqLambda<OPTION.(T)->Unit>,
        val value : T,
        val index : Int
    ) : PropsType<Props<T>, SelectOption<T>>()
    override fun SELECT.render() {
        option {
            value = props.index.toString()
            +props.render(props.value)
            props.customize.raw(this, props.value)
        }
    }
}