package net.justmachinery.shade.tests

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.component.MountingContext
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.state.observable
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.concurrent.atomic.AtomicInteger

/** Observed by every [LifecycleChild]'s react block, to check that reactions are disposed on unmount. */
private val reactionSource = observable(0)
private fun bumpReactionSource() = reactionSource.set(reactionSource.get() + 1)

private class LifecycleChild : Component<Unit>() {
    var count by obs(0)

    val renders = AtomicInteger(0)
    val unmounts = AtomicInteger(0)
    val reactionRuns = AtomicInteger(0)
    @Volatile var rendersBeforeMounted = -1

    override fun MountingContext.mounted() {
        rendersBeforeMounted = renders.get()
        react {
            reactionRuns.incrementAndGet()
            reactionSource.get()
        }
    }

    override fun unmounted() {
        unmounts.incrementAndGet()
    }

    override fun HtmlBlockTag.render() {
        renders.incrementAndGet()
        div { +"count $count" }
    }
}

/** Sits between the parent and the child, so that unmounting can be checked to cascade. */
private class LifecycleWrapper : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div { add(LifecycleChild::class, Unit) }
    }
}

private class LifecycleParent : Component<Unit>() {
    var showChild by obs(true)
    override fun HtmlBlockTag.render() {
        div {
            if (showChild) {
                add(LifecycleWrapper::class, Unit)
            }
        }
    }
}

class LifecycleTest {
    private class Setup {
        val test = ShadeTest().render { it.add(LifecycleParent::class, Unit) }
        val parent = test.component(LifecycleParent::class.java)
        val wrapper = test.component(LifecycleWrapper::class.java)
        val child = test.component(LifecycleChild::class.java)

        fun unmountChild() {
            parent.showChild = false
            waitFor(description = "child unmount") { child.supervisorJob.isCancelled }
        }
    }

    @Test
    fun `mounted runs after the first render, and its reactions run immediately`() {
        val setup = Setup()

        assertEquals(1, setup.child.rendersBeforeMounted, "mounted() should run after the component has rendered once")
        assertEquals(1, setup.child.reactionRuns.get(), "a react block should run once on mount")
    }

    @Test
    fun `a reaction created on mount reruns when its dependencies change`() {
        val setup = Setup()

        bumpReactionSource()

        assertEquals(2, setup.child.reactionRuns.get())
    }

    @Test
    fun `unmounting cascades to children, cancels their coroutines, and calls unmounted`() {
        val setup = Setup()

        setup.unmountChild()

        assertTrue(setup.wrapper.supervisorJob.isCancelled, "unmounting should cascade through the component in between")
        assertFalse(setup.child.supervisorJob.isActive)
        assertEquals(1, setup.child.unmounts.get(), "unmounted() should be called exactly once")
    }

    @Test
    fun `reactions of an unmounted component stop running`() {
        val setup = Setup()
        setup.unmountChild()
        val before = setup.child.reactionRuns.get()

        bumpReactionSource()

        assertEquals(before, setup.child.reactionRuns.get(), "an unmounted component's reactions must be disposed")
    }

    @Test
    fun `an unmounted component does not rerender when the state it rendered changes`() {
        val setup = Setup()
        setup.unmountChild()
        val renders = setup.child.renders.get()
        setup.test.clearSent()

        setup.child.count = 99
        Thread.sleep(100)

        assertEquals(renders, setup.child.renders.get(), "an unmounted component must not rerender")
        assertEquals(0, setup.test.reconciles(setup.child).size, "an unmounted component must not send updates")
    }
}
