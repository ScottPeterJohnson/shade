package net.justmachinery.shade.state

import net.justmachinery.futility.GetSet
import kotlin.reflect.KProperty

typealias RivObs<T> = RivObservableValue<T>
class RivObservableValue<T>(
    private val generate: ()->T
) : GetSet<T> {
    private var computed : Reaction? = null
    private var _value : T? = null
    private var hasSetValue = false
    private val atom = Atom()

    private fun initializeComputed(){
        if(computed == null){
            synchronized(this){
                if(computed == null){
                    computed = Reaction {
                        if(!hasSetValue || computed != null){
                            _value = generate()
                            if(computed != null){
                                atom.reportChanged()
                            }
                        } else {
                            generate()
                        }
                    }
                }
            }
        }
    }

    override fun get(): T {
        atom.reportObserved()
        initializeComputed()
        @Suppress("UNCHECKED_CAST")
        return _value as T
    }
    override fun set(value: T) {
        if (value != this._value) {
            this._value = value
            hasSetValue = true
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

