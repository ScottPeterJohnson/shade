package net.justmachinery.shade.component

import java.lang.reflect.ParameterizedType
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass

/**
 * Implementing PropsType allows for more elegant add() calls
 */
abstract class PropsType<P : PropsType<P, T>, T : AdvancedComponent<P, *>> {
    @Suppress("UNCHECKED_CAST")
    val type : KClass<T>
        get() = propsClassToComponentClassMap.getOrPut<KClass<*>, KClass<*>>(this::class){
            when(val it = (this::class.java.genericSuperclass as ParameterizedType).actualTypeArguments[1]){
                is Class<*> -> it.kotlin
                is ParameterizedType -> (it.rawType as Class<*>).kotlin
                else -> throw IllegalStateException("Unrecognized type $it")
            }
    } as KClass<T>
}
private val propsClassToComponentClassMap = ConcurrentHashMap<KClass<*>, KClass<*>>()