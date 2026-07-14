package net.justmachinery.shade.tests

import net.justmachinery.shade.routing.base.BasicUrlInfo
import net.justmachinery.shade.routing.base.UrlInfo
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class UrlInfoTest {
    @Test
    fun `parses UTF-8 percent encoding in paths and query strings`() {
        val info = UrlInfo.of("/caf%C3%A9/b%2Bc", "q=caf%C3%A9&plus=a%2Bb&space=a+b&flag")
        assertEquals(listOf("café", "b+c"), info.pathSegments.toList())
        assertEquals(
            listOf("q" to "café", "plus" to "a+b", "space" to "a b", "flag" to ""),
            info.queryParams.toList()
        )
    }

    @Test
    fun `formats query strings as UTF-8`() {
        val info = BasicUrlInfo(
            pathSegments = sequenceOf("x"),
            queryParams = sequenceOf("q" to "café", "s" to "a b")
        )
        assertEquals("q=caf%C3%A9&s=a+b", info.queryString)
    }

    @Test
    fun `query round trips through format and parse`() {
        val original = listOf("q" to "café", "plus" to "a+b", "space" to "a b")
        val formatted = BasicUrlInfo(emptySequence(), original.asSequence()).queryString
        assertEquals(original, UrlInfo.of("", formatted).queryParams.toList())
    }
}
