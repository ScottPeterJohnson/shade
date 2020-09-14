package net.justmachinery.shade.components

import kotlinx.css.FontWeight
import kotlinx.css.fontWeight
import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.key
import net.justmachinery.shade.newBackgroundColorOnRerender
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.state.observable
import net.justmachinery.shade.withStyle

class TodoListSection : Component<Unit>() {
    //This is the syntax for an observable piece of per-component state.
    //When it's reassigned, this component is marked as dirty and will be redrawn.
    var todo by observable(emptyList<String>())
    //You can also use the non-delegated version if you need direct access to the observable.
    //"obs" is an alias for observable and may be easier to import without conflict
    val newTaskName = obs("")

    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()
            h2 {
                +"List of TODO components"
            }

            div {
                //All standard kotlin logic is supported. Render however makes sense to you.
                todo.forEach {
                    add(TodoComponent::class, it)
                }
            }

            //Here we directly bind the input's value to serverside state.
            //The boundInput helper does a few useful things for us
            boundInput(newTaskName) {
                type = InputType.text
            }

            @Suppress("ConstantConditionIf")
            if(false){
                //Thematically, the boundInput is equivalent to this:
                input {
                    value = newTaskName.value
                    onValueChange {
                        newTaskName.set(it)
                    }
                    type = InputType.text
                }
                //However, this won't actually change what the textbox says if the observable is set to something the
                //user didn't input! This is because in HTML, the value is only set when the input is created.
                //boundInput takes care of this and should be generally preferred.
            }

            button {
                onClick {
                    todo = todo + newTaskName.value
                }
                +"New!"
            }
        }
    }
}


class TodoComponent : Component<String>() {
    override fun HtmlBlockTag.render() {
        div {
            newBackgroundColorOnRerender()
            +"TODO: $props"
        }
    }
}


//This code is used in the README, and is replicated here to make sure it compiles.
class TodoList : Component<TodoList.Props>() {
    data class Props(val userName : String) : PropsType<Props, TodoList>()

    var todoList by observable(listOf<String>())
    var newItem = observable("")
    override fun HtmlBlockTag.render(){
        p {
            +"Hello, "
            span {
                withStyle {
                    fontWeight = FontWeight.bold
                }
                +props.userName
            }
        }
        todoList.forEach { item ->
            div {
                key = item
                +"TODO: "
                +item
            }
        }
        +"Add a new item:"
        boundInput(newItem){
            type = InputType.text
        }
        button {
            onClick {
                todoList = todoList + newItem.value
            }
        }
    }
}