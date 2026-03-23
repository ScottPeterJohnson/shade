package net.justmachinery.shade.state

import com.google.common.collect.Sets
import kotlinx.coroutines.CoroutineName
import kotlinx.coroutines.ThreadContextElement
import java.io.Closeable
import java.util.*
import kotlin.coroutines.CoroutineContext

internal val changeBatch = ThreadLocal<ChangeBatch>()

internal class ChangeBatch(
    var changePolicy : ChangeBatchChangePolicy,
    val changes : MutableSet<Atom>
){
    companion object {
        internal fun addToOrStart(atom : Atom){
            val batch = changeBatch.get()
            when {
                batch == null -> {
                    runChangeBatch(ChangeBatchChangePolicy.ALLOWED) {
                        changeBatch.get().changes.add(atom)
                    }
                }
                batch.changePolicy == ChangeBatchChangePolicy.DISALLOWED -> {
                    throw IllegalStateException("Cannot change state inside render")
                }
                else -> {
                    batch.changes.add(atom)
                }
            }
        }
    }
}

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
                endChangeBatch(batch)
            } finally {
                changeBatch.remove()
            }
        }
    }
}


private data class DirtyData(var maxDepth : Int, var dependencyChanged : Boolean = false)
private fun endChangeBatch(batch : ChangeBatch){
    val changes = batch.changes
    if (changes.isNotEmpty()) {
        val handlers = mutableMapOf<ReactiveObserver.DirtyHandlerFactory, ReactiveObserver.DirtyHandler>()

        while(changes.isNotEmpty()){ //A dirty reaction may have triggered additional changes in this change block, so we may need to loop.
            //Find all potentially dirtied nodes
            val dirty = IdentityHashMap<ReactiveObserver, DirtyData>(changes.size * 2)
            fun register(it : ReactiveObserver, depth : Int){
                var recurse = false
                dirty.compute(it){ _, data ->
                    if(data == null){
                        recurse = true
                        DirtyData(maxDepth = depth, dependencyChanged = depth == 0)
                    } else {
                        recurse = depth > data.maxDepth //Only need to update max depths if this is a deeper path
                        data.maxDepth = data.maxDepth.coerceAtLeast(depth)
                        data.dependencyChanged = data.dependencyChanged || depth == 0
                        data
                    }
                }
                if (recurse && it is ReactiveObserver.WithDependents){
                    it.observers.forEach { sub ->
                        register(sub, depth + 1)
                    }
                }
            }
            for (change in changes) {
                for (it in change.observers) {
                    register(it, 0)
                }
            }
            changes.clear()

            //Sort into depth buckets
            val byDepth = mutableMapOf<Int, MutableMap<ReactiveObserver, DirtyData>>()
            for((obs, data) in dirty){
                byDepth.getOrPut(data.maxDepth) { mutableMapOf() }[obs] = data
            }

            var depth = 0
            while(byDepth.containsKey(depth)){
                val atDepth = byDepth[depth]!!
                for((obs, data) in atDepth){
                    if(!data.dependencyChanged){
                        continue
                    }
                    val handler = handlers.getOrPut(obs.dirtyHandlerFactory){ obs.dirtyHandlerFactory.create() }
                    val changed = handler.handleDirty(obs)
                    if(changed && obs is ReactiveObserver.WithDependents){
                        obs.observers.forEach { subObs ->
                            dirty[subObs]?.dependencyChanged = true
                        }
                    }
                }
                depth += 1
            }
            //Loop in case actions triggered more changes
        }
        //End batch
        for (it in handlers) {
            it.value.endBatch()
        }

    }
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