package net.justmachinery.shade.state

import net.justmachinery.futility.GetSet
import net.justmachinery.futility.Maybe
import kotlin.reflect.KProperty

typealias RivObs<T> = RivObservableValue<T>

/**
 * Reactive Initial Value observable value- resets to the value of generate() when dependencies change, otherwise can be set.
 */
class RivObservableValue<T>(
    private val generate: ()->T
) : GetSet<T> {
    private var computed = ComputedValue({
        manualValue = Maybe.Nothing()
        generate()
    })
    private var manualValue : Maybe<T> = Maybe.Nothing()
    private val atom = Atom()


    override fun get(): T {
        atom.reportObserved()
        return manualValue.or(computed.get())
    }
    override fun set(value: T) {
        computed.get() //We need this initialized and ready to change in the future.
        manualValue = Maybe.Just(value)
        atom.reportChanged()
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

