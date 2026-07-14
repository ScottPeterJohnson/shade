package net.justmachinery.shade.tests

import net.justmachinery.shade.state.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class ObservableTest {
    @Test
    fun `setting an observable to an equal value does not notify observers`() {
        val source = observable("a")
        var runs = 0
        val r = reaction { source.get(); runs += 1 }
        assertEquals(1, runs)

        source.set("a")
        assertEquals(1, runs, "an equal value is not a change")

        source.set("b")
        assertEquals(2, runs)
        r.dispose()
    }

    @Test
    fun `an observable is only observed while something depends on it`() {
        val source = observable(0)
        assertFalse(source.isObserved())

        val r = reaction { source.get() }
        assertTrue(source.isObserved())

        r.dispose()
        assertFalse(source.isObserved(), "disposing the last observer should unsubscribe it from the observable")
    }
}

class ReactionTest {
    @Test
    fun `a reaction runs immediately and again whenever a dependency changes`() {
        val source = observable(1)
        val seen = mutableListOf<Int>()
        val r = reaction { seen.add(source.get()) }

        source.set(2)
        source.set(3)
        r.dispose()
        source.set(4)

        assertEquals(listOf(1, 2, 3), seen, "a disposed reaction must not run again")
    }

    @Test
    fun `dependencies are re-recorded on every run, so a branch not taken is not observed`() {
        val useLeft = observable(true)
        val left = observable("l")
        val right = observable("r")
        var runs = 0
        val r = reaction {
            runs += 1
            if (useLeft.get()) left.get() else right.get()
        }
        assertEquals(1, runs)

        right.set("r2")
        assertEquals(1, runs, "the right branch was not taken, so it should not be a dependency")

        left.set("l2")
        assertEquals(2, runs)

        useLeft.set(false)
        assertEquals(3, runs)

        left.set("l3")
        assertEquals(3, runs, "the left branch is no longer taken, so it should have been dropped as a dependency")

        right.set("r3")
        assertEquals(4, runs)
        r.dispose()
    }

    @Test
    fun `ignoringChanges reads a value without depending on it`() {
        val tracked = observable(0)
        val untracked = observable(0)
        var runs = 0
        val r = reaction {
            runs += 1
            tracked.get()
            ignoringChanges { untracked.get() }
        }
        assertEquals(1, runs)

        untracked.set(1)
        assertEquals(1, runs, "a value read inside ignoringChanges is not a dependency")

        tracked.set(1)
        assertEquals(2, runs)
        r.dispose()
    }

    @Test
    fun `changes made by a reaction are processed in the same batch`() {
        val source = observable(1)
        val derived = observable(0)
        val seen = mutableListOf<Int>()

        val writer = reaction { derived.set(source.get() * 10) }
        val reader = reaction { seen.add(derived.get()) }
        assertEquals(listOf(10), seen)

        source.set(2)
        assertEquals(listOf(10, 20), seen, "a change made by one reaction must still reach reactions observing it")

        writer.dispose()
        reader.dispose()
    }
}

class ChangeBatchTest {
    @Test
    fun `an action batches its changes so observers run once`() {
        val first = observable(1)
        val second = observable(2)
        var runs = 0
        var sum = 0
        val r = reaction {
            runs += 1
            sum = first.get() + second.get()
        }
        assertEquals(1, runs)

        action {
            first.set(10)
            second.set(20)
        }

        assertEquals(2, runs, "both changes should be delivered in a single batch")
        assertEquals(30, sum)
        r.dispose()
    }

    @Test
    fun `an observer of two computeds over one source sees consistent values and runs once`() {
        val source = observable(1)
        val doubled = computed { source.value * 2 }
        val tripled = computed { source.value * 3 }
        var runs = 0
        val seen = mutableListOf<Pair<Int, Int>>()
        val r = reaction {
            runs += 1
            seen.add(doubled.get() to tripled.get())
        }
        assertEquals(1, runs)

        source.set(2)

        assertEquals(2, runs, "the reaction should run once for the change, not once per computed")
        assertEquals(4 to 6, seen.last(), "both computeds must be up to date before their observer runs")
        r.dispose()
    }

    @Test
    fun `an observer of both a source and a computed over it does not see a stale computed`() {
        val source = observable(1)
        val doubled = computed { source.value * 2 }
        val seen = mutableListOf<Pair<Int, Int>>()
        val r = reaction { seen.add(source.get() to doubled.get()) }

        source.set(5)

        assertEquals(2, seen.size, "the reaction should run once for the change")
        assertEquals(5 to 10, seen.last(), "the computed must be recomputed before its dependent runs")
        r.dispose()
    }

    @Test
    fun `a computed whose value does not change does not notify its observers`() {
        val source = observable(1)
        val isPositive = computed { source.value > 0 }
        var runs = 0
        val r = reaction { isPositive.get(); runs += 1 }
        assertEquals(1, runs)

        source.set(2)
        assertEquals(1, runs, "the computed still evaluates to true, so its observers have nothing to do")

        source.set(-1)
        assertEquals(2, runs)
        r.dispose()
    }

    @Test
    fun `state cannot be changed inside a render`() {
        val source = observable(0)
        val error = assertThrows<IllegalStateException> {
            runChangeBatch(ChangeBatchChangePolicy.DISALLOWED) {
                source.set(1)
            }
        }
        assertTrue(
            error.message!!.contains("Cannot change state inside render"),
            "unexpected message: ${error.message}"
        )
    }
}
