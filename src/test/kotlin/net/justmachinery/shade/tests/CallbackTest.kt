package net.justmachinery.shade.tests

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.html.HtmlBlockTag
import kotlinx.html.button
import kotlinx.html.div
import net.justmachinery.futility.Json
import net.justmachinery.shade.GlobalClientStateIdentifier
import net.justmachinery.shade.JavascriptException
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.state.obs
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Duration
import java.util.*
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

private class ClickCounter : Component<Unit>() {
    var clicks by obs(0)
    var showExtra by obs(true)

    override fun HtmlBlockTag.render() {
        div {
            button {
                onClick { clicks += 1 }
                +"clicks $clicks"
            }
            if (showExtra) {
                button {
                    onDoubleClick { clicks += 100 }
                    +"extra"
                }
            }
        }
    }
}

class EventCallbackTest {
    @Test
    fun `a client event runs its callback and rerenders the component`() {
        val test = ShadeTest().render { it.add(ClickCounter::class, Unit) }
        val counter = test.component(ClickCounter::class.java)
        val click = callbackIdFor(test.html, "click")

        val html = test.awaitRerender(counter) { test.sendResponse(click) }

        assertEquals(1, counter.clicks)
        assertTrue(html.contains("clicks 1"), html)
    }

    @Test
    fun `an event handler keeps its callback id across rerenders`() {
        val test = ShadeTest().render { it.add(ClickCounter::class, Unit) }
        val counter = test.component(ClickCounter::class.java)
        val click = callbackIdFor(test.html, "click")

        val html = test.awaitRerender(counter) { counter.clicks = 5 }

        assertEquals(
            click, callbackIdFor(html, "click"),
            "the same handler at the same place should keep its id, so that events already in flight still land"
        )
    }

    @Test
    fun `an event that arrives against a reused callback id still runs`() {
        val test = ShadeTest().render { it.add(ClickCounter::class, Unit) }
        val counter = test.component(ClickCounter::class.java)
        val click = callbackIdFor(test.html, "click")

        //The component rerenders for an unrelated reason, then a click from the old page state arrives
        test.awaitRerender(counter) { counter.clicks = 5 }
        test.awaitRerender(counter) { test.sendResponse(click) }

        assertEquals(6, counter.clicks)
        assertFalse(test.disconnected.get())
    }

    @Test
    fun `a callback whose handler is no longer rendered expires without dropping the connection`() {
        val test = ShadeTest().render { it.add(ClickCounter::class, Unit) }
        val counter = test.component(ClickCounter::class.java)
        val doubleClick = callbackIdFor(test.html, "doubleclick")

        test.awaitRerender(counter) { counter.showExtra = false }
        test.sendResponse(doubleClick)
        Thread.sleep(100)

        assertEquals(0, counter.clicks, "the removed handler must not run")
        assertFalse(test.disconnected.get(), "an event for a handler that has since disappeared is not a protocol error")
    }
}

private class SlowClicks : Component<Unit>() {
    val started = Collections.synchronizedList(mutableListOf<Int>())
    val finished = Collections.synchronizedList(mutableListOf<Int>())
    val next = AtomicInteger(0)
    val release = CountDownLatch(1)

    override fun HtmlBlockTag.render() {
        div {
            button {
                onClick {
                    val id = next.incrementAndGet()
                    started.add(id)
                    if (id == 1) {
                        release.await(5, TimeUnit.SECONDS)
                    }
                    finished.add(id)
                }
                +"go"
            }
        }
    }
}

class EventLockTest {
    @Test
    fun `event callbacks run one at a time, in the order they arrived`() {
        val test = ShadeTest().render { it.add(SlowClicks::class, Unit) }
        val component = test.component(SlowClicks::class.java)
        val click = callbackIdFor(test.html, "click")

        test.sendResponse(click)
        waitFor(description = "first event to start") { component.started.size == 1 }

        test.sendResponse(click)
        test.sendResponse(click)
        Thread.sleep(100)
        assertEquals(
            listOf(1), component.started.toList(),
            "later events must wait rather than run concurrently with the one in progress"
        )

        component.release.countDown()
        waitFor(description = "queued events to run") { component.finished.size == 3 }

        assertEquals(listOf(1, 2, 3), component.started.toList())
        assertEquals(listOf(1, 2, 3), component.finished.toList())
    }
}

class RunExpressionTest {
    private class Setup {
        val test = ShadeTest().render { it.div { +"page" } }
        lateinit var result : CompletableDeferred<Json>

        fun run(js : String) : Long {
            test.clearSent()
            result = test.client.runExpression(js)
            val message = test.messageContaining(js)
            return test.callbackIdOf(message)
        }
    }

    @Test
    fun `runExpression sends the script and completes with the client's result`() {
        val setup = Setup()
        val id = setup.run("1 + 1")

        assertTrue(
            setup.test.scripts().any { it.contains("var result = 1 + 1;") && it.contains("s($id, JSON.stringify(result))") },
            "expected a script that evaluates the expression and sends the result back: ${setup.test.scripts()}"
        )

        setup.test.sendResponse(id, "2")

        val json = runBlocking { withTimeout(5000) { setup.result.await() } }
        assertEquals("2", json.raw)
    }

    @Test
    fun `a javascript error completes runExpression exceptionally`() {
        val setup = Setup()
        val id = setup.run("nope()")

        setup.test.sendError(id, name = "ReferenceError", message = "nope is not defined")

        val thrown = assertThrows<JavascriptException> {
            runBlocking { withTimeout(5000) { setup.result.await() } }
        }
        assertEquals("ReferenceError", thrown.details.name)
        assertEquals("nope is not defined", thrown.details.jsMessage)
        assertTrue(setup.test.uncaughtJavascript.isEmpty(), "an error the caller awaits is not an uncaught error")
    }

    @Test
    fun `a javascript error outside any callback is reported to the root handler`() {
        val test = ShadeTest().render { it.div { +"page" } }

        test.sendGlobalError(name = "TypeError", message = "x is undefined")

        waitFor(description = "the error to be reported") { test.uncaughtJavascript.isNotEmpty() }
        assertEquals("x is undefined", test.uncaughtJavascript.single().details.jsMessage)
        assertFalse(test.disconnected.get())
    }
}

class QueuedScriptTest {
    @Test
    fun `scripts sent before the websocket connects are queued and flushed on connect`() {
        val test = ShadeTest().renderOnly { it.add(ClickCounter::class, Unit) }

        test.client.executeScript("early();")
        assertTrue(test.scripts().isEmpty(), "nothing can be sent before a websocket is attached")

        test.connect()

        assertTrue(test.scripts().any { it == "early();" }, "queued scripts should be flushed on connect: ${test.scripts()}")
    }

    @Test
    fun `a client that never connects is discarded after the acceptable delay`() {
        val test = ShadeTest(connectionDelay = Duration.ofMillis(100))
        test.renderOnly { it.div { +"page" } }
        assertEquals(1, test.root.allClients().size)

        waitFor(description = "the client to be discarded") { test.root.allClients().isEmpty() }
    }
}

class GlobalClientStateTest {
    @Test
    fun `global state is stored per client and only computed once`() {
        val test = ShadeTest().render { it.div { +"page" } }
        val identifier = GlobalClientStateIdentifier<String>()
        val computed = AtomicInteger(0)

        assertEquals(null, test.client.getGlobalState(identifier))

        val first = test.client.getOrPutGlobalState(identifier) { computed.incrementAndGet(); "value" }
        val second = test.client.getOrPutGlobalState(identifier) { computed.incrementAndGet(); "other" }

        assertEquals("value", first)
        assertEquals("value", second)
        assertEquals(1, computed.get())

        test.client.putGlobalState(identifier, "replaced")
        assertEquals("replaced", test.client.getGlobalState(identifier))
    }
}

class DisconnectTest {
    @Test
    fun `disconnecting removes the client and unmounts its components`() {
        val test = ShadeTest().render { it.add(ClickCounter::class, Unit) }
        val counter = test.component(ClickCounter::class.java)

        test.handler.onDisconnect()

        assertTrue(test.root.allClients().isEmpty(), "a disconnected client should not be retained")
        waitFor(description = "components to unmount") { counter.supervisorJob.isCancelled }
    }
}
