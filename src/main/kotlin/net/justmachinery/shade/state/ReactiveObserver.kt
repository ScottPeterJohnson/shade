package net.justmachinery.shade.state

import com.google.common.collect.Sets
import net.justmachinery.futility.withValue
import net.justmachinery.shade.component.AdvancedComponent
import kotlin.reflect.KProperty


internal val observeBlock = ThreadLocal<ObserveBlock?>()
internal data class ObserveBlock(
    val observer : ReactiveObserver,
    val observed : MutableSet<Atom>
)

fun ignoringChanges(cb : ()->Unit) = observeBlock.withValue(null){ cb() }

abstract class ReactiveObserver {
    protected abstract val observing: MutableSet<Atom>

    fun <T> runRecordingDependencies(run : ()->T) : T {
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

    /**
     * Cleans up this ReactiveObserver, removing it from any atoms it's registered to.
     */
    fun dispose(){
        observing.forEach { it.observers.remove(this) }
        observing.clear()
    }

    /**
     * This is a factory for instances which handle what to actually do with a ReactiveObserver when it is marked dirty in a change batch.
     * One instance is lazily created per change batch. Factories should likely be singletons per class!
     */
    abstract val dirtyHandlerFactory : DirtyHandlerFactory

    abstract class DirtyHandlerFactory {
        abstract fun create() : DirtyHandler
    }
    interface DirtyHandler {
        /**
         * @return If this is WithDependents, return true if this actually changed and its dependents should run. Otherwise irrelevant.
         */
        fun handleDirty(obs : ReactiveObserver) : Boolean
        fun endBatch(){}
    }

    /**
     * For observers who may themselves have dependents observing them which would become dirty on change
     */
    interface WithDependents {
        val observers : Set<ReactiveObserver>
    }
}


class ComputedValue<T>(
    private val compute: () -> T,
    lazy : Boolean = true
) : ReactiveObserver(), ReactiveObserver.WithDependents {
    private val atom = Atom()

    @Volatile private var initialized = false
    @Volatile private var value: T? = null

    override val observers get() : Set<ReactiveObserver> = atom.observers
    override val observing = mutableSetOf<Atom>()

    init {
        if(!lazy){
            blindCompute()
        }
    }

    private fun blindCompute(){
        synchronized(this){
            runRecordingDependencies {
                value = compute()
                initialized = true
            }
        }
    }

    override val dirtyHandlerFactory get() = DirtyHandlerFactory
    object DirtyHandlerFactory : ReactiveObserver.DirtyHandlerFactory(){
        override fun create() = DirtyHandler
    }
    object DirtyHandler : ReactiveObserver.DirtyHandler {
        override fun handleDirty(obs: ReactiveObserver) = (obs as ComputedValue<*>).computeAndCheckChange()
    }

    private fun computeAndCheckChange() : Boolean {
        return synchronized(this){
            runRecordingDependencies {
                val oldValue = value
                value = compute()
                val didChange = !initialized || oldValue != value
                initialized = true
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
            initialized = false
        }
    }

    fun get(): T {
        atom.reportObserved()
        synchronized(this){
            if(!initialized){
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
    override val dirtyHandlerFactory get() = DirtyHandlerFactory
    object DirtyHandlerFactory : ReactiveObserver.DirtyHandlerFactory(){
        override fun create() = DirtyHandler()
    }
    class DirtyHandler : ReactiveObserver.DirtyHandler {
        private val renders = Sets.newIdentityHashSet<Render>()
        override fun handleDirty(obs: ReactiveObserver) : Boolean {
            renders.add(obs as Render)
            return false
        }
        override fun endBatch() {
            if(renders.isNotEmpty()){
                renders.asSequence().mapNotNull {
                    val component = it.component
                    if(component == null){ it.dispose() }
                    component
                }.groupBy { it.client }.forEach { (client, components) ->
                    client.setComponentsDirty(components)
                }
            }
        }
    }
}

class Reaction(private val cb: () -> Unit) : ReactiveObserver() {
    override val observing = mutableSetOf<Atom>()
    override fun toString() = "Reaction($cb)"
    fun run() {
        runRecordingDependencies(cb)
    }

    override val dirtyHandlerFactory get() = DirtyHandlerFactory
    object DirtyHandlerFactory : ReactiveObserver.DirtyHandlerFactory(){
        override fun create() = DirtyHandler
    }
    object DirtyHandler : ReactiveObserver.DirtyHandler {
        override fun handleDirty(obs: ReactiveObserver) : Boolean {
            (obs as Reaction).run()
            return false
        }
    }
}