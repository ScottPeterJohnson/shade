package net.justmachinery.shade.tests

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import net.justmachinery.shade.ShadeRoot
import net.justmachinery.shade.SocketScopeNames
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList

class KeyedReorderTest {
    private class ReorderChild : Component<Int>() {
        var localState by obs(0)
        override fun HtmlBlockTag.render() {
            div { +"child $props state=$localState" }
        }
    }

    private class ReorderParent : Component<Unit>() {
        var order by obs(listOf(1, 2, 3))
        override fun HtmlBlockTag.render() {
            div {
                order.forEach { n ->
                    add(ReorderChild::class, n, key = n.toString())
                }
            }
        }
    }

    private class Setup {
        val children = CopyOnWriteArrayList<ReorderChild>()
        var parent : ReorderParent? = null
        val sent : MutableList<String> = Collections.synchronizedList(mutableListOf())
        val root = ShadeRoot(endpoint = "/shade", afterConstructComponent = {
            when (it) {
                is ReorderParent -> parent = it
                is ReorderChild -> children.add(it)
            }
        })

        init {
            root.render { body { it.add(ReorderParent::class, Unit) } }
            val client = root.allClients().single()
            val handler = root.handler(send = { sent.add(it) }, disconnect = {})
            handler.onMessage(client.clientId.toString())
        }
    }

    @Test
    fun `reordering keyed components keeps them alive and rerenderable`() {
        val setup = Setup()
        assertEquals(3, setup.children.size)

        setup.parent!!.order = listOf(3, 2, 1)
        waitFor(description = "parent rerender") {
            setup.sent.any { it.contains("${SocketScopeNames.reconcile.raw}(${setup.parent!!.renderState.componentId},") }
        }

        assertEquals(3, setup.children.size, "reorder should reuse components, not construct new ones")
        setup.children.forEach {
            assertFalse(it.supervisorJob.isCancelled, "moved component ${it._props} should not be unmounted")
        }

        //A component that moved position must still be able to rerender from its own state
        setup.sent.clear()
        val moved = setup.children.first { it._props == 3 }
        moved.localState = 99
        waitFor(description = "moved child rerender") {
            setup.sent.any { it.contains("${SocketScopeNames.reconcile.raw}(${moved.renderState.componentId},") }
        }
        assertTrue(setup.sent.any { it.contains("state=99") })
    }

    @Test
    fun `keyed components removed from the list still unmount`() {
        val setup = Setup()
        setup.parent!!.order = listOf(2)
        waitFor(description = "removed children unmount") {
            setup.children.filter { it._props != 2 }.all { it.supervisorJob.isCancelled }
        }
        assertFalse(setup.children.first { it._props == 2 }.supervisorJob.isCancelled)
    }
}
