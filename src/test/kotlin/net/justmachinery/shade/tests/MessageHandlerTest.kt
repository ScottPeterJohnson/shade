package net.justmachinery.shade.tests

import net.justmachinery.shade.ShadeInvalidCallbackException
import net.justmachinery.shade.ShadeInvalidMessageException
import net.justmachinery.shade.ShadeRoot
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.concurrent.atomic.AtomicBoolean

class MessageHandlerTest {
    private class Setup {
        val root = ShadeRoot(endpoint = "/shade")
        val disconnected = AtomicBoolean(false)
        val handler = root.handler(send = {}, disconnect = { disconnected.set(true) })

        fun connect() {
            val client = root.createClient()
            handler.onMessage(client.clientId.toString())
        }
    }

    @Test
    fun `a non-UUID handshake disconnects without throwing`() {
        val setup = Setup()
        setup.handler.onMessage("definitely not a uuid")
        assertTrue(setup.disconnected.get())
    }

    @Test
    fun `a message without a tag separator throws`() {
        val setup = Setup()
        setup.connect()
        assertThrows<ShadeInvalidMessageException> {
            setup.handler.onMessage("no separator here")
        }
        assertTrue(setup.disconnected.get())
    }

    @Test
    fun `a non-numeric callback tag disconnects and throws`() {
        val setup = Setup()
        setup.connect()
        assertThrows<ShadeInvalidCallbackException>{
            setup.handler.onMessage("abc|data")
        }
        assertTrue(setup.disconnected.get())
    }

    @Test
    fun `an unknown future callback id disconnects and throws`() {
        val setup = Setup()
        setup.connect()
        assertThrows<ShadeInvalidCallbackException> {
            setup.handler.onMessage("999999|data")
        }
        assertTrue(setup.disconnected.get())
    }

    @Test
    fun `a malformed global error report is logged without dropping the connection`() {
        val setup = Setup()
        setup.connect()
        setup.handler.onMessage("E|this is not json {{{")
        assertFalse(setup.disconnected.get())
    }
}
