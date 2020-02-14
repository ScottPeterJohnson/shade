package net.justmachinery.shade

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.LoggerContext
import kotlinx.css.Color
import kotlinx.css.backgroundColor
import kotlinx.html.DIV
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*

fun setupTestLogging(){
    val lc = LoggerFactory.getILoggerFactory() as LoggerContext
    val root = lc.getLogger(Logger.ROOT_LOGGER_NAME)
    root.level = Level.INFO
    lc.getLogger("net.justmachinery").level = Level.TRACE
}

//Helper function just displays a new background color to make it easy to tell what causes a rerender.
fun DIV.newBackgroundColorOnRerender(){
    fun gen() = Random().nextInt(255).toString(16).padStart(2, '0')

    withStyle {
        backgroundColor = Color("#${gen()}${gen()}${gen()}40")
    }
}