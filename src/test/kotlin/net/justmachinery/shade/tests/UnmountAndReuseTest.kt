package net.justmachinery.shade.tests

import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.div
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.concurrent.atomic.AtomicInteger

private class ClickableChild : Component<Unit>() {
    val clicks = AtomicInteger(0)
    override fun HtmlBlockTag.render() {
        button {
            onClick { clicks.incrementAndGet() }
            +"child"
        }
    }
}

private class ClickableParent : Component<Unit>() {
    var showChild by obs(true)
    override fun HtmlBlockTag.render() {
        div {
            if (showChild) {
                add(ClickableChild::class)
            }
        }
    }
}

private class Row : Component<String>() {
    override fun HtmlBlockTag.render() {
        div { +"row $props" }
    }
}

private class RowList : Component<Unit>() {
    var showHeader by obs(false)
    override fun HtmlBlockTag.render() {
        div {
            if (showHeader) {
                add(Row::class, "header")
            }
            add(Row::class, "item", key = "item")
        }
    }
}

class UnmountAndReuseTest {
    @Test
    fun `an unmounted component's callbacks are removed`() {
        val test = ShadeTest().render { it.add(ClickableParent::class, Unit) }
        val parent = test.component(ClickableParent::class.java)
        val child = test.component(ClickableChild::class.java)
        val click = callbackIdFor(test.html, "click")

        test.awaitRerender(parent) { parent.showChild = false }
        test.sendResponse(click)
        Thread.sleep(200)

        assertEquals(0, child.clicks.get(), "a click on an unmounted component should not run its handler")
        assertFalse(test.disconnected.get())
    }

    @Test
    fun `an unkeyed component added before a keyed one does not take the keyed one's place`() {
        val test = ShadeTest().render { it.add(RowList::class, Unit) }
        val list = test.component(RowList::class.java)
        val item = test.components(Row::class.java).single()

        val html = test.awaitRerender(list) { list.showHeader = true }

        val rows = test.components(Row::class.java)
        assertEquals(2, rows.size, "the header should be a new component")
        assertFalse(item.supervisorJob.isCancelled, "the keyed row should be kept")
        assertEquals("item", item._props)
        assertTrue(html.contains("data-k=\"item\" data-s=\"k\""), "the keyed row should be kept as is: $html")
        assertEquals(1, Regex("row header").findAll(html).count(), html)
    }

    @Test
    fun `runExpression completes with null when the result is undefined`() {
        val test = ShadeTest().render { it.div { +"page" } }
        test.clearSent()
        val result = test.client.runExpression("undefined")
        val id = test.callbackIdOf(test.messageContaining("var result = undefined"))

        //JSON.stringify(undefined) is undefined, so the client sends no data at all
        test.sendResponse(id, "")

        val json = runBlocking { withTimeout(5000) { result.await() } }
        assertEquals("null", json.raw)
    }
}
