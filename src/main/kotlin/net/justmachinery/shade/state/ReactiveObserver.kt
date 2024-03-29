package net.justmachinery.shade.state

import net.justmachinery.futility.withValue
import net.justmachinery.shade.component.AdvancedComponent
import kotlin.reflect.KProperty


internal val observeBlock = ThreadLocal<ObserveBlock?>()
internal data class ObserveBlock(
    val observer : ReactiveObserver,
    val observed : MutableSet<Atom>
)

fun ignoringChanges(cb : ()->Unit) = observeBlock.withValue(null){ cb() }

sealed class ReactiveObserver {
    internal abstract val observing: MutableSet<Atom>

    internal fun <T> runRecordingDependencies(run : ()->T) : T {
        val newState = ObserveBlock(observer = this, observed = mutableSetOf())
        try {
            observeBlock.withValue(newState) {
                return run()
            }
        } finally {
            observing.removeAll { dependency ->
                if (dependency !in newState.observed) {
                    dependency.observers.remove(this)
                    true
                } else {
                    false
                }
            }

            newState.observed.forEach { dependency ->
                if (observing.add(dependency)) {
                    dependency.observers.add(this)
                }
            }
        }
    }

    internal fun dispose(){
        observing.forEach { it.observers.remove(this) }
        observing.clear()
    }
}

class ComputedValue<T>(
    private val compute: () -> T,
    lazy : Boolean = true
) : ReactiveObserver() {
    private val atom = Atom()

    @Volatile private var dirty = true
    @Volatile private var value: T? = null

    val observers get() = atom.observers
    override val observing = mutableSetOf<Atom>()

    init {
        if(!lazy){
            blindCompute()
        }
    }

    private fun blindCompute(){
        synchronized(this){
            this.runRecordingDependencies {
                value = compute()
                dirty = false
            }
        }
    }

    internal fun computeAndCheckChange() : Boolean {
        return synchronized(this){
            runRecordingDependencies {
                val oldValue = value
                value = compute()
                val didChange = dirty || oldValue != value
                dirty = false
                didChange
            }
        }
    }

    private fun computeAndNotify() {
        if(computeAndCheckChange()){
            atom.reportChanged()
        }
    }

    fun recompute(){
        computeAndNotify()
    }

    fun compact(){
        synchronized(this){
            value = null
            dirty = true
        }
    }

    fun get(): T {
        atom.reportObserved()
        synchronized(this){
            if(dirty){
                blindCompute()
            }
            @Suppress("UNCHECKED_CAST")
            return value as T
        }
    }
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T = get()

    override fun toString() = "ComputedValue(${compute.javaClass})"
}

internal class Render(internal var component : AdvancedComponent<*, *>?) : ReactiveObserver() {
    override val observing = mutableSetOf<Atom>()

    override fun toString() = "Render(${component})"
}

class Reaction(private val cb: () -> Unit) : ReactiveObserver() {
    override val observing = mutableSetOf<Atom>()

    init {
        run()
    }

    fun run() {
        runRecordingDependencies(cb)
    }

    override fun toString() = "Reaction($cb)"
}