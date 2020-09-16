package net.justmachinery.shade.utility

import kotlin.reflect.KMutableProperty0
import kotlin.reflect.KProperty0

interface Get<T> {
    companion object {
        fun <T> of(cb : ()->T) : Get<T> = LambdaGetter(EqLambda(cb))
    }
    fun get() : T
}

private data class LambdaGetter<T>(val lambda: EqLambda<()->T>) : Get<T> {
    override fun get() = lambda.raw()
}

interface Set<T> {
    companion object {
        fun <T> of(cb : (T)->Unit) : Set<T> = LambdaSetter(EqLambda(cb))
    }
    fun set(value : T)
}
private data class LambdaSetter<T>(val lambda: EqLambda<(T)->Unit>) : Set<T> {
    override fun set(value: T) {
        lambda.raw(value)
    }
}

interface GetSet<T> : Get<T>, Set<T> {
    companion object {
        fun <T> of(getter : ()->T, setter : (T)->Unit) : GetSet<T> = LambdaGetterSetter(EqLambda(getter), EqLambda(setter))
    }
}

private data class LambdaGetterSetter<T>(val getter : EqLambda<()->T>, val setter : EqLambda<(T)->Unit>) : GetSet<T> {
    override fun get() = getter.raw()
    override fun set(value: T) {
        setter.raw(value)
    }
}

val <T> KProperty0<T>.get : Get<T> get() = PropertyGetter(this)
private data class PropertyGetter<T>(val property : KProperty0<T>) : Get<T> {
    override fun get() = property.get()
}

val <T> KMutableProperty0<T>.getSet : GetSet<T> get() = MutablePropertyGetter(this)
private data class MutablePropertyGetter<T>(val property : KMutableProperty0<T>) : GetSet<T> {
    override fun get() = property.get()
    override fun set(value: T) {
        property.set(value)
    }
}