package net.justmachinery.shade.state

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

/**
 * An observable holding the latest value of this flow, which is collected in [scope] until it ends (on a component,
 * until it unmounts). It holds [initial] until the flow first emits.
 *
 * Collection starts on [scope]'s dispatcher rather than immediately, so this is safe to call from a component's
 * constructor or render, e.g. `val level by intervalFlow(50.milliseconds) { stats.level }.toObservable(this, 0)`.
 */
fun <T> Flow<T>.toObservable(scope: CoroutineScope, initial: T): ObservableValue<T> {
    val result = observable(initial)
    scope.launch {
        collect { result.value = it }
    }
    return result
}
