package net.justmachinery.shade

import java.lang.ref.WeakReference
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

    internal fun runRecordingDependencies(run : ()->Unit) {
        val previousObserveBlock = observeBlock.get()
        val newState = mutableSetOf<Atom>()
        observeBlock.set(newState)

        try {
            run()
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

    val newBatch = mutableSetOf<Atom>()
    changeBatch.set(ChangeBatch.Batch(newBatch))
    try {
        val returnValue = block()
        if (newBatch.isNotEmpty()) {
            val renders = mutableSetOf<Render>()

            while(true){
                var observers = newBatch.asSequence().flatMap { it.observers.asSequence() }
                if(observers.iterator().hasNext()){
                    val actions = mutableSetOf<Reaction>()
                    while(true) {
                        renders.addAll(observers.filterIsInstance(Render::class.java))
                        actions.addAll(observers.filterIsInstance(Reaction::class.java))
                        val newComputedValues = observers.filterIsInstance(ComputedValue::class.java)
                        val anyComputed = newComputedValues.any { !it.isDirty() }
                        if(!anyComputed){ break }
                        newComputedValues.forEach { it.markDirty() }
                        observers = newComputedValues.flatMap { it.observers.asSequence() }
                    }

                    if(actions.isNotEmpty()){
                        newBatch.clear()
                        actions.forEach { action ->
                            action.runRecordingDependencies(action::run)
                        }
                        continue
                    }
                }
                break
            }

            if(renders.isNotEmpty()){
                renders.asSequence().mapNotNull {
                    val component = it.comp.get()
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
}

class ComputedValue<T>(
    private val computed: () -> T,
    lazy : Boolean = true
) : ReactiveObserver() {
    private val atom = Atom()

    @Volatile private var dirty = true
    @Volatile private var value: T? = null

    val observers get() = atom.observers
    override val observing = mutableSetOf<Atom>()

    init {
        if(!lazy){
            computeInternal()
        }
    }

    fun isDirty() = dirty
    fun markDirty(){
        synchronized(this){
            dirty = true
            value = null
        }
    }

    private fun doComputeInternal() {
        value = computed()
        dirty = false
    }

    private fun computeInternal(){
        synchronized(this){
            this.runRecordingDependencies(this::doComputeInternal)
        }
    }

    fun get(): T {
        atom.reportObserved()

        if(dirty){
            synchronized(this){
                if(dirty){
                    computeInternal()
                }
            }
        }
        @Suppress("UNCHECKED_CAST")
        return value as T
    }
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T = get()
}

internal class Render(component : AdvancedComponent<*, *>) : ReactiveObserver() {
    internal val comp = WeakReference(component)
    override val observing = mutableSetOf<Atom>()
}

class Reaction(private val cb: () -> Unit) : ReactiveObserver() {
    override val observing = mutableSetOf<Atom>()

    init {
        runRecordingDependencies(this::run)
    }

    internal fun run() {
        cb()
    }
}
