package net.justmachinery.shade.tests

import kotlinx.html.*
import net.justmachinery.shade.DirectiveType
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.computed
import net.justmachinery.shade.state.obs
import net.justmachinery.shade.utility.applyJs
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.concurrent.atomic.AtomicInteger

private data class ChildProps(val label : String)

private class PropsChild : Component<ChildProps>() {
    val renders = AtomicInteger(0)
    override fun HtmlBlockTag.render() {
        renders.incrementAndGet()
        div { +"child ${props.label}" }
    }
}

private class PropsParent : Component<Unit>() {
    var label by obs("a")
    var unrelated by obs(0)
    override fun HtmlBlockTag.render() {
        div {
            p { +"parent $unrelated" }
            add(PropsChild::class, ChildProps(label))
        }
    }
}

class ComponentReuseTest {
    private fun setup() : Triple<ShadeTest, PropsParent, PropsChild> {
        val test = ShadeTest().render { it.add(PropsParent::class, Unit) }
        return Triple(test, test.component(PropsParent::class.java), test.component(PropsChild::class.java))
    }

    @Test
    fun `a child whose props are unchanged is kept rather than rerendered`() {
        val (test, parent, child) = setup()
        assertEquals(1, child.renders.get())

        val html = test.awaitRerender(parent) { parent.unrelated = 1 }

        assertTrue(html.contains("parent 1"), "the parent should have rerendered: $html")
        assertEquals(1, child.renders.get(), "the child's props did not change, so it should not have rerendered")
        assertTrue(
            html.contains("data-s=\"${DirectiveType.ComponentKeep.raw}\""),
            "the parent should tell the client to keep the child's existing DOM: $html"
        )
        assertFalse(html.contains("child a"), "a kept child's markup is not resent: $html")
    }

    @Test
    fun `a child whose props change is rerendered in place`() {
        val (test, parent, child) = setup()

        val html = test.awaitRerender(parent) { parent.label = "b" }

        assertEquals(2, child.renders.get())
        assertTrue(html.contains("child b"), "the child should have been rerendered inside its parent: $html")
        assertEquals(0, test.reconciles(child).size, "a child rerendered by its parent does not send its own update")
    }

    @Test
    fun `a component rerenders itself when its own state changes, without its parent`() {
        val test = ShadeTest().render { it.add(SelfRerenderParent::class, Unit) }
        val parent = test.component(SelfRerenderParent::class.java)
        val child = test.component(SelfRerenderChild::class.java)

        val html = test.awaitRerender(child) { child.count = 7 }

        assertTrue(html.contains("count 7"), "the child should send its own update: $html")
        assertEquals(0, test.reconciles(parent).size, "the parent does not depend on the child's state")
    }
}

private class SelfRerenderChild : Component<Unit>() {
    var count by obs(0)
    override fun HtmlBlockTag.render() {
        div { +"count $count" }
    }
}

private class SelfRerenderParent : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div { add(SelfRerenderChild::class, Unit) }
    }
}

private class PropsComputedChild : Component<ChildProps>() {
    val shouted by computed { props.label.uppercase() }
    override fun HtmlBlockTag.render() {
        div { +"shouted $shouted" }
    }
}

private class PropsComputedParent : Component<Unit>() {
    var label by obs("a")
    override fun HtmlBlockTag.render() {
        div { add(PropsComputedChild::class, ChildProps(label)) }
    }
}

class PropsAsDependencyTest {
    @Test
    fun `a computed over props updates when the parent passes new ones`() {
        val test = ShadeTest().render { it.add(PropsComputedParent::class, Unit) }
        val parent = test.component(PropsComputedParent::class.java)
        val child = test.component(PropsComputedChild::class.java)
        assertTrue(test.html.contains("shouted A"))

        val html = test.awaitRerender(child) { parent.label = "b" }

        assertEquals("B", child.shouted)
        assertTrue(html.contains("shouted B"), "the computed should have been recomputed from the new props: $html")
    }
}

private class DirectiveComponent : Component<Unit>() {
    override fun HtmlBlockTag.render() {
        div {
            +"content"
            //Set after content has been emitted, so the attribute can no longer be written inline
            id = "late"
        }
        div {
            applyJs("it.dataset.ran = 'yes'")
        }
        input {
            applyJs("it.focus()")
        }
    }
}

class DirectiveEmissionTest {
    private val html by lazy {
        ShadeTest().render { it.add(DirectiveComponent::class, Unit) }.html
    }

    @Test
    fun `an attribute set after a tag's content is emitted becomes a SetAttribute directive`() {
        assertTrue(
            html.contains("data-s=\"${DirectiveType.SetAttribute.raw}\" data-a=\"id\" data-v=\"late\""),
            "expected a SetAttribute directive carrying the late id: $html"
        )
    }

    @Test
    fun `applyJs on a normal tag becomes a directive inside it`() {
        assertTrue(
            html.contains("<script type=\"shade\" data-s=\"${DirectiveType.ApplyJs.raw}\""),
            "expected an ApplyJs directive: $html"
        )
        val directive = html.indexOf("data-t=\"it.dataset.ran")
        val closing = html.indexOf("</div>", directive)
        assertTrue(directive in 0..<closing, "the directive should sit inside the div it applies to: $html")
    }

    @Test
    fun `applyJs on a childless tag becomes a sibling directive that points back at it`() {
        val input = html.indexOf("<input")
        val directive = html.indexOf("data-t=\"it.focus()")
        assertTrue(input in 0..<directive, "an input cannot contain the directive, so it must follow it: $html")

        val directiveTag = html.substring(html.lastIndexOf("<script", directive), html.indexOf(">", directive))
        assertTrue(
            directiveTag.contains("data-f=\"\""),
            "a directive that follows its target must be marked as targeting a sibling: $directiveTag"
        )
    }
}

class RootRenderTest {
    @Test
    fun `the rendered page carries the client id and the shade endpoint`() {
        val test = ShadeTest().renderOnly { it.div { +"hello" } }

        assertTrue(test.html.startsWith("<!doctype html>"), test.html.take(60))
        assertTrue(test.html.contains("window.shadeId = \"${test.client.clientId}\";"))
        assertTrue(test.html.contains("window.shadeEndpoint = \"/shade\";"))
        assertTrue(test.html.contains("hello"))
    }

    @Test
    fun `a component's markup is bracketed by start and end directives so the client can find it`() {
        val test = ShadeTest().render { it.add(SelfRerenderChild::class, Unit) }
        val child = test.component(SelfRerenderChild::class.java)
        val id = child.renderState.componentId

        assertTrue(
            test.html.contains("id=\"shade$id\" data-s=\"${DirectiveType.ComponentStart.raw}\""),
            "expected a start directive for the component: ${test.html}"
        )
        assertTrue(
            test.html.contains("id=\"shade${id}e\" data-s=\"${DirectiveType.ComponentEnd.raw}\""),
            "expected an end directive for the component: ${test.html}"
        )
    }
}
