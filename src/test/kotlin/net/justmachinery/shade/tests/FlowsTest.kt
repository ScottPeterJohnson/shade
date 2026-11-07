package net.justmachinery.shade.tests

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.cancel
import net.justmachinery.shade.state.reaction
import net.justmachinery.shade.state.toObservable
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

@OptIn(ExperimentalCoroutinesApi::class)
class FlowsTest {
    @Test
    fun `a flow's observable holds the initial value until the flow emits, then each new value`() = runTest {
        val flow = MutableSharedFlow<Int>()
        val observable = flow.toObservable(backgroundScope, initial = 0)
        val seen = mutableListOf<Int>()
        val r = reaction { seen.add(observable.get()) }
        runCurrent()

        flow.emit(1)
        flow.emit(1)
        flow.emit(2)
        runCurrent()

        assertEquals(listOf(0, 1, 2), seen, "an emitted value equal to the current one is not a change")
        r.dispose()
    }

    @Test
    fun `the observable stops following the flow when its scope ends`() = runTest {
        val flow = MutableSharedFlow<Int>()
        val scope = CoroutineScope(coroutineContext + Job())
        val observable = flow.toObservable(scope, initial = 0)
        runCurrent()
        flow.emit(1)
        runCurrent()

        scope.cancel()
        flow.emit(2)
        runCurrent()

        assertEquals(1, observable.value)
    }
}
