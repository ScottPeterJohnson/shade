package net.justmachinery.shade.state

import net.justmachinery.futility.GetSet
import kotlin.reflect.KProperty

typealias Obs<T> = ObservableValue<T>
class ObservableValue<T>(
    internal var _value: T
) : GetSet<T> {
    private val atom = Atom()

    override fun get(): T {
        atom.reportObserved()
        return _value
    }

    override fun set(value: T) {
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

