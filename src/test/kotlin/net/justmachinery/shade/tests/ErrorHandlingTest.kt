package net.justmachinery.shade.tests

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.p
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.handleErrors
import net.justmachinery.shade.state.observable
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

private class Boom : RuntimeException("render failed")

private class ThrowingChild : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        throw Boom()
    }
}

private class GoodChild : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div { +"good child" }
    }
}

/** Reads props during construction, which Shade forbids because props can change while the component lives. */
private class EarlyPropsChild : Component<String>() {
    private val captured = props
    override fun HtmlBlockTag.render() {
        div { +captured }
    }
}

/** Writes observable state from inside a render, which Shade forbids. */
private class StateWritingChild : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        writtenDuringRender.set(writtenDuringRender.get() + 1)
        div { +"never reached" }
    }

    companion object {
        val writtenDuringRender = observable(0)
    }
}

/** Catches whatever its one child throws, and renders a sibling that should be unaffected. */
private abstract class CatchingParent : Component<Unit>() {
    var handled : Throwable? = null
    abstract fun HtmlBlockTag.addChild()

    override fun HtmlBlockTag.render() {
        div {
            handleErrors({ handled = throwable; true }) {
                addChild()
            }
            add(GoodChild::class, Unit)
        }
    }
}

private class ThrowingParent : CatchingParent() {
    override fun HtmlBlockTag.addChild() { add(ThrowingChild::class, Unit) }
}

private class StateWritingParent : CatchingParent() {
    override fun HtmlBlockTag.addChild() { add(StateWritingChild::class, Unit) }
}

private class EarlyPropsParent : CatchingParent() {
    override fun HtmlBlockTag.addChild() { add(EarlyPropsChild::class, "hello") }
}

private class NestedHandlerParent : Component<Unit>() {
    val sawInOrder = mutableListOf<String>()
    override fun HtmlBlockTag.render() {
        div {
            handleErrors({ sawInOrder.add("outer"); true }) {
                handleErrors({ sawInOrder.add("inner"); false }) {
                    add(ThrowingChild::class, Unit)
                }
                add(GoodChild::class, Unit)
            }
        }
    }
}

private class UnhandledParent : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div {
            p { +"before" }
            add(ThrowingChild::class, Unit)
            add(GoodChild::class, Unit)
        }
    }
}

class ErrorHandlingTest {
    @Test
    fun `an exception thrown in a child's render reaches an enclosing error handler`() {
        val test = ShadeTest().render { it.add(ThrowingParent::class, Unit) }
        val handled = test.component(ThrowingParent::class.java).handled

        assertTrue(handled is Boom, "unexpected throwable: $handled")
        assertTrue(test.html.contains("good child"), "a sibling of the failing component should still render: ${test.html}")
    }

    @Test
    fun `writing observable state during a render is rejected`() {
        val test = ShadeTest().render { it.add(StateWritingParent::class, Unit) }
        val handled = test.component(StateWritingParent::class.java).handled

        assertNotNull(handled, "writing state during a render should raise an error")
        assertTrue(
            handled is IllegalStateException && handled.message!!.contains("Cannot change state inside render"),
            "unexpected throwable: $handled"
        )
    }

    @Test
    fun `reading props during construction is rejected`() {
        val test = ShadeTest().render { it.add(EarlyPropsParent::class, Unit) }
        val handled = test.component(EarlyPropsParent::class.java).handled

        //Components are constructed reflectively, so the real cause is wrapped
        val causes = generateSequence(handled) { it.cause }.toList()
        assertTrue(
            causes.any { it is IllegalStateException && it.message!!.contains("Illegal props access") },
            "expected an illegal props access error, got: $causes"
        )
    }

    @Test
    fun `an error a handler declines falls through to the next handler out`() {
        val test = ShadeTest().render { it.add(NestedHandlerParent::class, Unit) }
        val parent = test.component(NestedHandlerParent::class.java)

        assertEquals(
            listOf("inner", "outer"), parent.sawInOrder.toList(),
            "the inner handler returned false, so the outer one should get a turn"
        )
        assertTrue(test.html.contains("good child"))
    }

    @Test
    fun `an error with no handler is swallowed and does not stop siblings from rendering`() {
        val test = ShadeTest().render { it.add(UnhandledParent::class, Unit) }

        assertTrue(test.html.contains("before"), "content before the failing component should render: ${test.html}")
        assertTrue(test.html.contains("good child"), "the sibling after it should render too: ${test.html}")
    }
}
