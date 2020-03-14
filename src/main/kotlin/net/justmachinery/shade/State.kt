package net.justmachinery.shade

import com.google.common.collect.Sets
import net.justmachinery.shade.component.AdvancedComponent
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KProperty

fun <T> react(value: T) = ObservableValue(value)
fun <T> observable(value: T) = ObservableValue(value)
fun <T> computed(lazy : Boolean = true, block: () -> T) = ComputedValue(block, lazy)
fun reaction(block: () -> Unit) = Reaction(block)
fun <T> action(block: () -> T) = runChangeBatch(false, block)


class Atom {
    internal val observers : MutableSet<ReactiveObserver> = Collections.newSetFromMap(ConcurrentHashMap())

    fun isObserved() = observers.isNotEmpty()
    fun reportObserved() {
        observeBlock.get()?.add(this)
    }
    fun reportChanged() {
        when(val batch = changeBatch.get()){
            null -> {
                runChangeBatch(false) {
                    (changeBatch.get() as ChangeBatch.Batch).changes.add(this)
                }
            }
            ChangeBatch.Rendering -> {
                throw IllegalStateException("Cannot change state inside render")
            }
            is ChangeBatch.Batch -> {
                batch.changes.add(this)
            }
        }
    }
}

sealed class ReactiveObserver {
    internal abstract val observing: MutableSet<Atom>

    internal fun <T> runRecordingDependencies(run : ()->T) : T {
        val previousObserveBlock = observeBlock.get()
        val newState = mutableSetOf<Atom>()
        observeBlock.set(newState)

        try {
            return run()
        } finally {
            observeBlock.set(previousObserveBlock)

            observing.removeAll { dependency ->
                if (dependency !in newState) {
                    dependency.observers.remove(this)
                    true
                } else {
                    false
                }
            }

            newState.forEach { dependency ->
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


private val changeBatch = ThreadLocal<ChangeBatch>()
private sealed class ChangeBatch {
    object Rendering : ChangeBatch()
    data class Batch(val changes : MutableSet<Atom>) : ChangeBatch()
}
private val observeBlock = ThreadLocal<MutableSet<Atom>>()





internal fun runRenderNoChangesAllowed(block : ()->Unit){
    val previousBatch = changeBatch.get()
    changeBatch.set(ChangeBatch.Rendering)
    try {
        block()
    } finally {
        changeBatch.set(previousBatch)
    }
}


internal fun <T> runChangeBatch(
    /**
     * If true, then allows changes even while rendering
     */
    force : Boolean,
    block: () -> T
): T {
    val isRendering = when(changeBatch.get()){
        null -> { false }
        ChangeBatch.Rendering -> {
            if(!force){
                throw IllegalStateException("Can't make changes inside a render block!")
            }
            true
        }
        else -> { return block() }
    }

    val newBatch = Sets.newIdentityHashSet<Atom>()
    changeBatch.set(ChangeBatch.Batch(newBatch))
    try {
        val returnValue = block()
        if (newBatch.isNotEmpty()) {
            val renders = Sets.newIdentityHashSet<Render>()

            while(newBatch.isNotEmpty()){
                //1. Find all potentially dirtied nodes
                val dirtied = findAllPotentiallyDirtyNodes(newBatch.asSequence())
                newBatch.clear()

                //2. Topologically sort them
                val sorted = topologicalSort(dirtied)

                //3. Re-evaluate them in that order, checking that their dependencies Actually Changed
                //First, all computed values recompute
                sorted.observers.asSequence().filterIsInstance(ComputedValue::class.java).forEach {
                    val changed = if(sorted.staleDependencyCount[it]!! > 0){
                        it.computeAndCheckChange()
                    } else {
                        false
                    }
                    if(!changed){
                        it.observers.forEach { subObs ->
                            sorted.staleDependencyCount.compute(subObs) { _, value -> value!! - 1 }
                        }
                    }
                }
                //Next, all actions trigger
                sorted.observers.asSequence().filterIsInstance(Reaction::class.java).forEach {
                    if(sorted.staleDependencyCount[it]!! > 0){
                        it.run()
                    }
                }
                //Defer all renders until the end
                renders.addAll(sorted.observers.filterIsInstance(Render::class.java).filter { sorted.staleDependencyCount[it]!! > 0 })
                //Loop in case actions triggered more changes
            }
            //Now we can process renders
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
        return returnValue
    } finally {
        if(isRendering){
            changeBatch.set(ChangeBatch.Rendering)
        } else {
            changeBatch.remove()
        }
    }
}

private data class DirtyNodeData(var isTemporaryMarked : Boolean, var isRootDirty : Boolean)
private fun findAllPotentiallyDirtyNodes(changed : Sequence<Atom>) : MutableMap<ReactiveObserver, DirtyNodeData> {
    val dirtied = IdentityHashMap<ReactiveObserver, DirtyNodeData>()
    var first = true
    var unvisited = changed.flatMap { it.observers.asSequence() }.toList()
    while(true){
        val nextUnvisited = mutableListOf<ReactiveObserver>()
        unvisited.forEach { observer ->
            if(dirtied.put(observer, DirtyNodeData(false, isRootDirty = first)) == null){
                if(observer is ComputedValue<*>){
                    nextUnvisited.addAll(observer.observers)
                }
            }
        }
        if(nextUnvisited.isEmpty()){ break }
        unvisited = nextUnvisited
        first = false
    }
    return dirtied
}

private data class ObserverCountAndList(
    val staleDependencyCount : IdentityHashMap<ReactiveObserver, Int>,
    val observers : List<ReactiveObserver>
)
private fun topologicalSort(dirty : MutableMap<ReactiveObserver, DirtyNodeData>) : ObserverCountAndList {
    val sorted = ArrayList<ReactiveObserver>()
    val staleDependencyCount = IdentityHashMap<ReactiveObserver, Int>()

    fun visit(key : ReactiveObserver, data: DirtyNodeData){
        if(data.isTemporaryMarked){
            throw IllegalStateException("Circular loop detected involving $key")
        }
        data.isTemporaryMarked = true
        if(key is ComputedValue<*>){
            key.observers.forEach { obs ->
                dirty[obs]?.let { visit(obs, it) }
                staleDependencyCount.compute(obs) { _, value -> (value ?: 0) + 1}
            }
        }
        dirty.remove(key)
        sorted.add(key)
        staleDependencyCount.compute(key) { _, value -> (value ?: 0) + if(data.isRootDirty) 1 else 0}
    }
    while(dirty.isNotEmpty()){
        val first = dirty.entries.first()
        visit(first.key, first.value)
    }
    return ObserverCountAndList(
        //We put the deepest dependencies first when iterating
        observers = sorted.asReversed(),
        staleDependencyCount = staleDependencyCount
    )
}



class ObservableValue<T>(
    private var _value: T
) {
    private val atom = Atom()

    fun get(): T {
        atom.reportObserved()
        return _value
    }

    fun set(value: T) {
        if (value != this._value) {
            this._value = value
            atom.reportChanged()
        }
    }

    operator fun getValue(thisRef: Any?, property: KProperty<*>): T =
        get()

    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        set(value)
    }

    var value: T
        get() = get()
        set(value) = set(value)

    fun isObserved() = atom.isObserved()
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

internal class Render(internal var component : AdvancedComponent<*,*>?) : ReactiveObserver() {
    override val observing = mutableSetOf<Atom>()

    override fun toString() = "Render(${component})"
}

class Reaction(private val cb: () -> Unit) : ReactiveObserver() {
    override val observing = mutableSetOf<Atom>()

    init {
        run()
    }

    fun run() {
        runRecordingDependencies {
            cb()
        }
    }

    override fun toString() = "Reaction($cb)"
}
