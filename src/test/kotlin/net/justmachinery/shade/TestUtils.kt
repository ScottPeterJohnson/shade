package net.justmachinery.shade

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.LoggerContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory

fun setupTestLogging(){
    val lc = LoggerFactory.getILoggerFactory() as LoggerContext
    val root = lc.getLogger(Logger.ROOT_LOGGER_NAME)
    root.level = Level.INFO
    lc.getLogger("net.justmachinery").level = Level.TRACE
}