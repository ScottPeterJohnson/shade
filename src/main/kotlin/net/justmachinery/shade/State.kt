package net.justmachinery.shade

import kotlin.reflect.KProperty

class ClientState<T>(private val context : ShadeContext, private var initial : T) {
    private val dependentComponents = mutableSetOf<Component<*>>()
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T {
        context.currentlyRenderingComponent?.let {
            dependentComponents.add(it)
        }
        return initial
    }
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        if(context.currentlyRenderingComponent != null){
            throw IllegalStateException("State cannot be set from inside render")
        }
        context.needReRender.addAll(dependentComponents)
        initial = value
        context.triggerReRender()
    }
}
