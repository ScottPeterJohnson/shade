package net.justmachinery.shade.state

import com.google.common.collect.Sets
import kotlinx.coroutines.CoroutineName
import kotlinx.coroutines.ThreadContextElement
import java.io.Closeable
import java.util.*
import kotlin.coroutines.CoroutineContext

internal val changeBatch = ThreadLocal<ChangeBatch>()

internal class ChangeBatch(
    var changePolicy: ChangeBatchChangePolicy,
    val changes : MutableSet<Atom>
)

internal enum class ChangeBatchChangePolicy {
    DISALLOWED,
    ALLOWED,
    FORCE_ALLOWED
}

internal fun <T> runChangeBatch(
    changePolicy: ChangeBatchChangePolicy,
    block: () -> T
): T {
    startChangeBatch(changePolicy).use {
        return block()
    }
}

internal fun startChangeBatch(changePolicy: ChangeBatchChangePolicy) : StartChangeBatchResult {
    val existing = changeBatch.get()
    return if(existing != null){
        val existingChangePolicy = existing.changePolicy
        if(changePolicy == ChangeBatchChangePolicy.ALLOWED && existingChangePolicy == ChangeBatchChangePolicy.DISALLOWED){
            throw IllegalStateException("Can't make changes inside a render block!")
        }
        existing.changePolicy = changePolicy
        StartChangeBatchResult.Existing(existing, existingChangePolicy)
    } else {
        val newBatch = ChangeBatch(
            changePolicy = changePolicy,
            changes = Sets.newIdentityHashSet()
        )
        changeBatch.set(newBatch)
        StartChangeBatchResult.New(newBatch)
    }
}

internal sealed class StartChangeBatchResult : Closeable {
    data class Existing(private val batch: ChangeBatch, private val oldPolicy: ChangeBatchChangePolicy) : StartChangeBatchResult() {
        override fun close() {
            batch.changePolicy = oldPolicy
        }
    }

    data class New(val batch: ChangeBatch) : StartChangeBatchResult() {
        override fun close() {
            try {
                val changes = batch.changes
                if (changes.isNotEmpty()) {
                    val renders =
                        Sets.newIdentityHashSet<Render>()

                    while(changes.isNotEmpty()){
                        //1. Find all potentially dirtied nodes
                        val dirtied =
                            findAllPotentiallyDirtyNodes(changes.asSequence())
                        changes.clear()

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
            } finally {
                changeBatch.remove()
            }
        }
    }
}

private data class DirtyNodeData(var isTemporaryMarked : Boolean, var isRootDirty : Boolean)

private fun findAllPotentiallyDirtyNodes(changed : Sequence<Atom>) : MutableMap<ReactiveObserver, DirtyNodeData> {
    val dirtied =
        IdentityHashMap<ReactiveObserver, DirtyNodeData>()
    var first = true
    var unvisited = changed.flatMap { it.observers.asSequence() }.toList()
    while(true){
        val nextUnvisited = mutableListOf<ReactiveObserver>()
        unvisited.forEach { observer ->
            if(dirtied.put(observer,
                    DirtyNodeData(false, isRootDirty = first)
                ) == null){
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
    val sorted =
        ArrayList<ReactiveObserver>()
    val staleDependencyCount =
        IdentityHashMap<ReactiveObserver, Int>()

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


val batchChangesUntilSuspend : ThreadContextElement<*> = BatchChangesUntilSuspend()
internal class BatchChangesUntilSuspend : ThreadContextElement<StartChangeBatchResult> {
    companion object Key : CoroutineContext.Key<CoroutineName>

    override val key: CoroutineContext.Key<*>
        get() = Key

    override fun restoreThreadContext(context: CoroutineContext, oldState: StartChangeBatchResult) {
        oldState.close()
    }

    override fun updateThreadContext(context: CoroutineContext) : StartChangeBatchResult {
        return startChangeBatch(ChangeBatchChangePolicy.FORCE_ALLOWED)
    }
}