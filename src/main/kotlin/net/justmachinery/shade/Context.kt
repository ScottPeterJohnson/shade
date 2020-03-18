package net.justmachinery.shade

import java.util.concurrent.atomic.AtomicInteger

fun currentContext() = contextInRenderingThread.get() ?: ShadeContext.empty
internal val contextInRenderingThread = ThreadLocal<ShadeContext>()

class ShadeContext(
    private val parent : ShadeContext?,
    private val backing : MutableMap<ShadeContextIdentifier<*>, Any?> = HashMap(0)
) {
    companion object {
        val empty = ShadeContext(parent = null)
    }
    @Suppress("UNCHECKED_CAST")
    operator fun <K> get(key : ShadeContextIdentifier<K>) : K? {
        return backing[key]  as K? ?: parent?.get(key)
    }

    internal fun <K> put(key : ShadeContextIdentifier<K>, value : K){
        backing[key] = value
    }

    internal inline fun <ReturnType> add(
        values : Array<out ShadeContextValue<*>>,
        cb : ()->ReturnType
    ) : ReturnType {
        return withShadeContext(
            context = ShadeContext(
                parent = this,
                backing = values.asSequence().map { Pair(it.identifier, it.value) }.toMap(HashMap(values.size))
            ),
            cb = cb
        )
    }
}

internal inline fun <T> withShadeContext(context : ShadeContext, cb : ()->T) : T {
    val oldContext = contextInRenderingThread.get()
    try {
        contextInRenderingThread.set(context)
        return cb()
    } finally {
        contextInRenderingThread.set(oldContext)
    }
}

class ShadeContextValue<T>(val identifier : ShadeContextIdentifier<T>, val value : T)




class ShadeContextIdentifier<T> {
    companion object {
        private val nextIdentifier = AtomicInteger(0)
    }

    private val identifier = nextIdentifier.getAndIncrement()
    override fun hashCode(): Int {
        return identifier
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as ShadeContextIdentifier<*>
        if (identifier != other.identifier) return false
        return true
    }

    fun with(value : T) : ShadeContextValue<T> = ShadeContextValue(this, value)
}