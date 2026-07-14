package net.justmachinery.shade.tests

import kotlinx.html.HtmlBlockTag
import kotlinx.html.p
import net.justmachinery.shade.component.Component
import net.justmachinery.shade.routing.base.PathData
import net.justmachinery.shade.routing.base.UrlInfo
import net.justmachinery.shade.state.reaction
import net.justmachinery.shade.utility.gson
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class PathDataTest {
    @Test
    fun `path segments and query params become observable and update in place`() {
        val data = PathData()
        val first = data.segmentAtIndex(0)
        val id = data.getParam("id")
        assertNull(first.get(), "nothing has been routed yet")

        data.update(UrlInfo.of("/users/4", "id=4"))

        assertEquals("users", first.get())
        assertEquals("4", data.segmentAtIndex(1).get())
        assertEquals("4", id.get(), "the same observable should be reused, so existing observers see the update")
    }

    @Test
    fun `an observed param that disappears from the url becomes null`() {
        val data = PathData()
        val id = data.getParam("id")
        val seen = mutableListOf<String?>()
        val r = reaction { seen.add(id.get()) }

        data.update(UrlInfo.of("/users", "id=4"))
        data.update(UrlInfo.of("/users", ""))

        assertEquals(listOf(null, "4", null), seen, "an observer must be told when its param goes away")
        r.dispose()
    }

    @Test
    fun `every update bumps the update identifier`() {
        val data = PathData()
        val before = data.updateIdentifier.get()

        data.update(UrlInfo.of("/a", ""))
        data.update(UrlInfo.of("/a", ""))

        assertEquals(before + 2, data.updateIdentifier.get())
    }
}

class UrlInfoPathTest {
    @Test
    fun `a path prefix can be removed and added back`() {
        val full = UrlInfo.of("/app/users/4", "id=4")

        val internal = full.removePathPrefix("/app")
        assertEquals(listOf("users", "4"), internal.pathSegments.toList())

        val external = internal.addPathPrefix("/app")
        assertEquals(listOf("app", "users", "4"), external.pathSegments.toList())
        assertEquals("/app/users/4?id=4", external.render())
    }

    @Test
    fun `a prefix is only removed when it matches a whole segment`() {
        val url = UrlInfo.of("/application/users", "")

        assertEquals(
            listOf("application", "users"), url.removePathPrefix("/app").pathSegments.toList(),
            "/app is not a path prefix of /application"
        )
    }

    @Test
    fun `render omits the question mark when there is no query`() {
        assertEquals("/users", UrlInfo.of("/users", "").render())
    }
}

private class RoutedPage : Component<UrlInfo>() {
    override fun HtmlBlockTag.render() {
        startRouting(props, { it.removePathPrefix("/app") }) {
            match("users") {
                route {
                    matchRoot { p { +"user index" } }
                    match("new") { p { +"new user" } }
                    notFound { p { +"no such user page" } }
                }
            }
            matchRoot { p { +"home" } }
            notFound { p { +"not found" } }
        }
    }
}

class RoutingDslTest {
    private fun render(path : String, query : String = "") =
        ShadeTest().render { it.add(RoutedPage::class, UrlInfo.of(path, query)) }

    @Test
    fun `the root path matches matchRoot`() {
        render("/app").assertShows("home")
    }

    @Test
    fun `a named segment matches, and routing continues into it`() {
        render("/app/users").assertShows("user index")
        render("/app/users/new").assertShows("new user")
    }

    @Test
    fun `an unmatched segment falls to the nearest notFound handler`() {
        render("/app/nothing").assertShows("not found")
        render("/app/users/nothing").assertShows("no such user page")
    }

    @Test
    fun `navigating on the client rerenders the matched route`() {
        val test = render("/app")
        test.assertShows("home")

        //Shade installs a popstate listener on the client; a reply to it is how a navigation gets reported
        val popstate = test.callbackIdOf(test.messageContaining("popstate"))
        test.sendResponse(popstate, gson.toJson(mapOf("path" to "/app/users/new", "query" to "")))

        test.assertShows("new user")
    }
}
