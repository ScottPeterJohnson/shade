package net.justmachinery.shade.tests

import net.justmachinery.shade.state.observable
import net.justmachinery.shade.state.reaction
import net.justmachinery.shade.state.rivObservable
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 * A "reactive initial value" observable regenerates itself whenever the state its generator read changes,
 * but can be set directly in between. It is what a component should use for mutable state derived from props.
 */
class RivObservableTest {
    @Test
    fun `a manually set value survives until a dependency of the generator changes`() {
        val source = observable("a")
        val riv = rivObservable { source.value }
        val seen = mutableListOf<String>()
        val r = reaction { seen.add(riv.get()) }
        assertEquals(listOf("a"), seen)

        riv.set("edited")
        assertEquals(listOf("a", "edited"), seen)
        assertEquals("edited", riv.get(), "a manually set value should be kept while the generator's inputs are unchanged")

        r.dispose()
    }

    @Test
    fun `a manually set value is discarded when a dependency of the generator changes`() {
        val source = observable("a")
        val riv = rivObservable { source.value }
        val seen = mutableListOf<String>()
        val r = reaction { seen.add(riv.get()) }

        riv.set("edited")
        source.set("b")

        assertEquals("b", riv.get(), "regenerating must discard the manually set value")
        assertEquals(listOf("a", "edited", "b"), seen)
        r.dispose()
    }

    @Test
    fun `an unobserved riv observable regenerates on the first read after a dependency changes`() {
        val source = observable("a")
        val riv = rivObservable { source.value }

        assertEquals("a", riv.get())
        riv.set("edited")
        assertEquals("edited", riv.get())

        source.set("b")

        assertEquals("b", riv.get(), "the first read after a dependency change must already see the regenerated value")
    }

    @Test
    fun `the generator is only rerun when its own dependencies change`() {
        val source = observable(1)
        var generated = 0
        val riv = rivObservable { generated += 1; source.value }
        val r = reaction { riv.get() }
        assertEquals(1, generated)

        riv.set(50)
        riv.set(51)
        assertEquals(1, generated, "setting the value directly should not rerun the generator")

        source.set(2)
        assertEquals(2, generated)
        assertEquals(2, riv.get())
        r.dispose()
    }
}
