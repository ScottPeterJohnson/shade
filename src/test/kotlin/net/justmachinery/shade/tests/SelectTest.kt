package net.justmachinery.shade.tests

import kotlinx.html.HtmlBlockTag
import net.justmachinery.futility.lambdas.EqLambda
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.components.BoundTag
import net.justmachinery.shade.components.Select
import net.justmachinery.shade.state.obs
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

private class SelectHolder : Component<Unit>() {
    val chosen = obs("b")
    override fun HtmlBlockTag.render() {
        add(Select.Props(selected = chosen, options = listOf("a", "b", "c"), render = EqLambda { it }))
    }
}

class SelectTest {
    private val selectedOption = Regex("<option[^>]*selected[^>]*>([^<]*)</option>")

    @Test
    fun `the chosen option is marked selected in the HTML, and the mark follows the bound value`() {
        val test = ShadeTest().render { it.add(SelectHolder::class, Unit) }
        assertEquals(listOf("b"), selectedOption.findAll(test.html).map { it.groupValues[1] }.toList())

        val holder = test.component(SelectHolder::class.java)
        //The options are rendered inside the bound select's tag, so that is what rerenders
        val html = test.awaitRerender(test.component(BoundTag::class.java)) { holder.chosen.value = "c" }
        assertEquals(listOf("c"), selectedOption.findAll(html).map { it.groupValues[1] }.toList())
    }
}
