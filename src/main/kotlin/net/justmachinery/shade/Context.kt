package net.justmachinery.shade

import java.util.concurrent.atomic.AtomicInteger

internal val contextInRenderingThread = ThreadLocal<ComponentContext>()
internal val emptyContext = ComponentContext(parent = null)

internal inline fun <T> withComponentContext(context : ComponentContext, cb : ()->T) : T {
    val oldContext = contextInRenderingThread.get()
    try {
        contextInRenderingThread.set(context)
        return cb()
    } finally {
        contextInRenderingThread.set(oldContext)
    }
}

class ComponentContextValue<T>(val identifier : ComponentContextIdentifier<T>, val value : T)


class ComponentContext(
    private val parent : ComponentContext?,
    private val backing : MutableMap<ComponentContextIdentifier<*>, Any?> = HashMap(0)
) {
    @Suppress("UNCHECKED_CAST")
    operator fun <K> get(key : ComponentContextIdentifier<K>) : K? {
        return backing[key]  as K? ?: parent?.get(key)
    }

    internal fun <K> put(key : ComponentContextIdentifier<K>, value : K){
        backing[key] = value
    }

    internal inline fun <ReturnType> add(
        values : Array<out ComponentContextValue<*>>,
        cb : ()->ReturnType
    ) : ReturnType {
        return withComponentContext(
            context = ComponentContext(
                parent = this,
                backing = values.asSequence().map { Pair(it.identifier, it.value) }.toMap(HashMap(values.size))
            ),
            cb = cb
        )
    }
}

class ComponentContextIdentifier<T> {
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
        other as ComponentContextIdentifier<*>
        if (identifier != other.identifier) return false
        return true
    }

    fun with(value : T) : ComponentContextValue<T> = ComponentContextValue(this, value)
}