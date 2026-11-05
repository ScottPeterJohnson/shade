package net.justmachinery.shade.state

import java.util.*
import java.util.concurrent.ConcurrentHashMap

class Atom {
    internal val observers : MutableSet<ReactiveObserver> =
        Collections.newSetFromMap(ConcurrentHashMap())

    fun isObserved() = observers.isNotEmpty()
    fun reportObserved() {
        observeBlock.get()?.let { it.observer.recordObserved(it, this) }
    }
    fun reportChanged() {
        ChangeBatch.addToOrStart(this)
    }
}