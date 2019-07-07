package net.justmachinery.shade

import kotlin.reflect.KProperty

class ClientObservableState<T>(private val context : ClientContext, private var initial : T) {
    private val dependentComponents = mutableSetOf<Component<*>>()

    var value : T
        get() {
            if(context.isRenderingThread()){
                context.getCurrentlyRenderingComponent()?.let {
                    dependentComponents.add(it)
                }
            }
            return initial
        }
        set(v) {
            if(context.isRenderingThread()){
                throw IllegalStateException("State cannot be set from inside render")
            }
            context.setComponentsDirty(dependentComponents)
            initial = v
        }
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T {
        return value
    }
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        this.value = value
    }

    override fun toString() = value.toString()
    override fun equals(other: Any?) = if(other is ClientObservableState<*>){
        value == other.value
    } else {
        value == other
    }
    override fun hashCode() = value.hashCode()
}
