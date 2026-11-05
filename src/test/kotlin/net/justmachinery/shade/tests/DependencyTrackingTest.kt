package net.justmachinery.shade.tests

import net.justmachinery.shade.state.computed
import net.justmachinery.shade.state.observable
import net.justmachinery.shade.state.reaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.concurrent.thread

/**
 * A value read during an observer's run is a dependency from the moment it is read, not only once the run ends,
 * so a change made by another thread while the run is still going is not lost.
 */
class DependencyTrackingTest {
    /**
     * Runs [change] on another thread once [awaitRead] has been called, and returns from [awaitRead] once it is done,
     * or blocked: notifying a computed waits for the computation in progress to finish.
     */
    private class ChangeDuringRun(change : ()->Unit) {
        private val read = CountDownLatch(1)
        private val changed = CountDownLatch(1)
        private val changer = thread {
            read.await()
            change()
            changed.countDown()
        }
        fun awaitRead(){
            read.countDown()
            val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10)
            while(!changed.await(1, TimeUnit.MILLISECONDS) && changer.state != Thread.State.BLOCKED){
                check(System.nanoTime() < deadline)
            }
        }
        fun join() = changer.join()
    }

    @Test
    fun `a reaction reruns when a value it read changes before its run ends`() {
        val source = observable(1)
        val seen = Collections.synchronizedList(mutableListOf<Int>())
        val during = ChangeDuringRun { source.set(2) }
        var first = true

        val r = reaction {
            seen.add(source.get())
            if(first){
                first = false
                during.awaitRead()
            }
        }
        during.join()

        assertEquals(listOf(1, 2), seen)
        r.dispose()
    }

    @Test
    fun `a computed is not left stale by a change made while it computes`() {
        val source = observable(1)
        var first = true
        lateinit var during : ChangeDuringRun
        val doubled = computed {
            val value = source.get() * 2
            if(first){
                first = false
                during.awaitRead()
            }
            value
        }
        during = ChangeDuringRun { source.set(2) }

        doubled.get()
        during.join()

        assertEquals(4, doubled.get())
    }

    @Test
    fun `an observed computed is not left stale by a change made while it computes`() {
        val source = observable(1)
        var first = true
        lateinit var during : ChangeDuringRun
        val doubled = computed {
            val value = source.get() * 2
            if(first){
                first = false
                during.awaitRead()
            }
            value
        }
        during = ChangeDuringRun { source.set(2) }
        val seen = Collections.synchronizedList(mutableListOf<Int>())

        val r = reaction { seen.add(doubled.get()) }
        during.join()

        assertEquals(4, doubled.get())
        assertEquals(4, seen.last(), "the observer of the computed should have run with the new value")
        r.dispose()
    }

    @Test
    fun `a reaction outside a batch reruns when it changes a value it read`() {
        val source = observable(20)
        val seen = mutableListOf<Int>()

        val r = reaction {
            val value = source.get()
            seen.add(value)
            if(value > 10){ source.set(10) }
        }

        assertEquals(listOf(20, 10), seen)
        r.dispose()
    }
}
