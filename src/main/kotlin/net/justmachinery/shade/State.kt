package net.justmachinery.shade

import kotlin.reflect.KProperty

class ClientObservableState<T>(private val context : ClientContext, private var initial : T) {
    private val dependentComponents = mutableSetOf<ComponentReference>()

    var value : T
        get() {
            if(context.isRenderingThread()){
                context.getCurrentlyRenderingComponent()?.let {
                    dependentComponents.add(it.ref)
                }
            }
            return initial
        }
        set(v) {
            check(!context.isRenderingThread()) { "State cannot be set from inside render" }
            initial = v

            val dirty = mutableListOf<AdvancedComponent<*,*>>()
            val removed = mutableListOf<ComponentReference>()
            dependentComponents.forEach {
                val comp = it.component
                if(comp == null){
                    removed.add(it)
                } else {
                    dirty.add(comp)
                }
            }
            dependentComponents.removeAll(removed)
            context.setComponentsDirty(dirty)
        }
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T {
        return value
    }
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        this.value = value
    }

    override fun toString() = value.toString()
}

abstract class StateContainer(val context : ClientContext) {
    fun <T> observable(initial : T) = ClientObservableState(context, initial)
}