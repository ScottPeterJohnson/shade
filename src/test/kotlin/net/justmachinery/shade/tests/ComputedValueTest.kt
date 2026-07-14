package net.justmachinery.shade.tests

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import net.justmachinery.shade.ShadeRoot
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.computed
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.state.observable
import net.justmachinery.shade.state.reaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.concurrent.atomic.AtomicInteger

class ComputedValueTest {
    @Test
    fun `an unobserved computed does not recompute on dependency change, but stays correct on read`() {
        val source = observable(1)
        var computes = 0
        val doubled = computed { computes += 1; source.value * 2 }

        assertEquals(2, doubled.get())
        assertEquals(1, computes)

        source.set(5)
        assertEquals(1, computes, "nothing observes the computed, so a dependency change should not recompute it")

        assertEquals(10, doubled.get(), "a later read must still see the new dependency value")
        assertEquals(2, computes)

        source.set(7)
        assertEquals(2, computes)
        assertEquals(14, doubled.get())
    }

    @Test
    fun `an observed computed recomputes and notifies its observers`() {
        val source = observable(1)
        val doubled = computed { source.value * 2 }
        var seen = -1
        val r = reaction { seen = doubled.get() }
        assertEquals(2, seen)
        source.set(3)
        assertEquals(6, seen)
        r.dispose()
    }
}

private val leakStore = observable(0)
private val leakComputes = AtomicInteger(0)

private class LeakChild : Component<Unit>() {
    val derived by computed { leakComputes.incrementAndGet(); leakStore.value * 2 }
    override fun HtmlBlockTag.render() {
        div { +"derived=$derived" }
    }
}

private class LeakParent : Component<Unit>() {
    var showChild by obs(true)
    override fun HtmlBlockTag.render() {
        div { if (showChild) add(LeakChild::class, Unit) }
    }
}

class ComputedComponentLeakTest {
    @Test
    fun `a computed on an unmounted component stops recomputing when outliving state changes`() {
        var parent : LeakParent? = null
        var child : LeakChild? = null
        val root = ShadeRoot(endpoint = "/shade", afterConstructComponent = {
            when (it) {
                is LeakParent -> parent = it
                is LeakChild -> child = it
            }
        })
        root.render { body { it.add(LeakParent::class, Unit) } }

        parent!!.showChild = false
        waitFor(description = "child unmount") { child!!.supervisorJob.isCancelled }

        val baseline = leakComputes.get()
        repeat(3) { leakStore.set(leakStore.get() + 1) }
        assertEquals(baseline, leakComputes.get(), "the unmounted component's computed must not keep recomputing")
    }
}
