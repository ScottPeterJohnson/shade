package net.justmachinery.shade.tests

import net.justmachinery.shade.utility.mergeMut
import net.justmachinery.shade.utility.zipAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ZipAllTest {
    @Test
    fun `zipAll pads the shorter side with nulls`() {
        assertEquals(
            listOf(1 to "a", 2 to null, 3 to null),
            sequenceOf(1, 2, 3).zipAll(sequenceOf("a")).toList()
        )
        assertEquals(
            listOf(1 to "a", null to "b"),
            sequenceOf(1).zipAll(sequenceOf("a", "b")).toList()
        )
        assertEquals(emptyList<Pair<Int?, String?>>(), emptySequence<Int>().zipAll(emptySequence<String>()).toList())
    }
}

/**
 * [mergeMut] is how routing folds a new URL into the observables it has already handed out, so it has to
 * distinguish "kept", "added" and "gone" rather than just replacing the map.
 */
class MergeMutTest {
    @Test
    fun `every existing key is visited, whether or not the new sequence has it`() {
        val map = mutableMapOf("kept" to 1, "gone" to 2)
        val seen = mutableListOf<Triple<String, Int?, Int?>>()

        map.mergeMut(sequenceOf("kept" to 10, "added" to 30)) { key, existing, new ->
            seen.add(Triple(key, existing, new))
            new ?: existing
        }

        assertEquals(
            setOf(
                Triple("kept", 1, 10),
                Triple("gone", 2, null),
                Triple("added", null, 30)
            ),
            seen.toSet()
        )
        assertEquals(mapOf("kept" to 10, "gone" to 2, "added" to 30), map)
    }

    @Test
    fun `returning null drops the entry`() {
        val map = mutableMapOf("kept" to 1, "gone" to 2)

        map.mergeMut(sequenceOf("kept" to 10)) { _, _, new -> new }

        assertEquals(mapOf("kept" to 10), map, "an existing entry the callback returns null for should be removed")
    }

    @Test
    fun `a new entry the callback rejects is never added`() {
        val map = mutableMapOf<String, Int>()

        map.mergeMut(sequenceOf("unwanted" to 5)) { _, _, _ -> null }

        assertEquals(emptyMap<String, Int>(), map)
    }
}
