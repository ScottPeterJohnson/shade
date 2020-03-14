package net.justmachinery.shade.component

import java.lang.reflect.ParameterizedType
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass

abstract class PropsType<P : PropsType<P, T>, T : AdvancedComponent<P, *>> {
    @Suppress("UNCHECKED_CAST")
    val type : KClass<T>
        get() = propsClassToComponentClassMap.getOrPut<KClass<*>, KClass<*>>(this::class){
        ((this::class.java.genericSuperclass as ParameterizedType).actualTypeArguments[1] as Class<*>).kotlin
    } as KClass<T>
}
private val propsClassToComponentClassMap = ConcurrentHashMap<KClass<*>, KClass<*>>()