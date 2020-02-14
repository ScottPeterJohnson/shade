package net.justmachinery.shade.components

import kotlinx.css.FontWeight
import kotlinx.css.fontWeight
import kotlinx.html.*
import net.justmachinery.shade.*

class TodoListSection : Component<Unit>() {
    //This is the syntax for an observable piece of per-component state.
    //When it's reassigned, this component is marked as dirty and will be redrawn.
    var todo by observable(emptyList<String>())
    var newTaskName : String = ""

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

            input {
                type = InputType.text
                //Here we directly one-way bind the input's value to serverside state.
                onValueChange {
                    newTaskName = it
                }
            }
            button {
                onClick {
                    todo = todo + newTaskName
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
    var newItem by observable("")
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
        input(type = InputType.text){
            onValueChange {
                newItem = it
            }
        }
        button {
            onClick {
                todoList = todoList + newItem
            }
        }
    }
}