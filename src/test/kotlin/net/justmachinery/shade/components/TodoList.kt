package net.justmachinery.shade.components

import kotlinx.css.FontWeight
import kotlinx.css.fontWeight
import kotlinx.html.*
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.PropsType
import net.justmachinery.shade.newBackgroundColorOnRerender
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.state.observable
import net.justmachinery.shade.utility.key
import net.justmachinery.shade.utility.withStyle

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

            //The boundInput is semantically equivalent to this:
            input {
                value = newTaskName.value
                onValueInput {
                    newTaskName.set(it)
                }
                type = InputType.text
            }
            //Note that in HTML, the "value" attribute normally only sets the "value" when the input is first created.
            //Shade will however manually change it on update for consistency.
            //A boundInput will be more efficient about changes, but directly using inputs should also work.

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