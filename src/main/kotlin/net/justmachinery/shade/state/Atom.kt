package net.justmachinery.shade.state

import java.util.*
import java.util.concurrent.ConcurrentHashMap

class Atom {
    internal val observers : MutableSet<ReactiveObserver> =
        Collections.newSetFromMap(ConcurrentHashMap())

    fun isObserved() = observers.isNotEmpty()
    fun reportObserved() {
        observeBlock.get()?.add(this)
    }
    fun reportChanged() {
        val batch = changeBatch.get()
        when {
            batch == null -> {
                runChangeBatch(ChangeBatchChangePolicy.ALLOWED) {
                    changeBatch.get().changes.add(
                        this
                    )
                }
            }
            batch.changePolicy == ChangeBatchChangePolicy.DISALLOWED -> {
                throw IllegalStateException("Cannot change state inside render")
            }
            else -> {
                batch.changes.add(this)
            }
        }
    }
}