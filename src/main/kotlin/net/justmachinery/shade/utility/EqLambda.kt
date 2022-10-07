package net.justmachinery.shade.utility

import com.google.common.cache.CacheBuilder
import com.google.common.cache.CacheLoader
import org.apache.commons.lang3.builder.HashCodeBuilder
import java.lang.reflect.AccessibleObject
import java.lang.reflect.Field

fun <T : Function<*>> eqL(cb : T) = EqLambda(cb)
val <T : Function<*>> T.eqL get() = EqLambda(this)
/**
 * A lambda wrapper with equality based on code site (generated class) and captured variables.
 */
class EqLambda<T : Function<*>>(val raw : T){
    override fun toString() = "EqLambda($raw)"
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as EqLambda<*>

        //Note: the Apache EqualsBuilder.reflectionEquals ignores fields with $, like all lambda fields, so can't be used.
        val fields = fieldCache[raw.javaClass]
        fields.forEach { field ->
            val leftValue = field.get(raw)
            val rightValue = field.get(other.raw)
            if(leftValue != rightValue){
                return false
            }
        }
        return true
    }

    override fun hashCode(): Int {
        val hash = HashCodeBuilder()
        hash.append(javaClass)
        val fields = fieldCache[raw.javaClass]
        fields.forEach { field ->
            hash.append(field.get(this))
        }
        return hash.build()
    }
}
private val fieldCache = CacheBuilder.newBuilder()
    .weakKeys()
    .build(object : CacheLoader<Class<*>, Array<Field>>() {
        override fun load(key: Class<*>): Array<Field> {
            val fields = key.declaredFields
            AccessibleObject.setAccessible(fields, true)
            return fields
        }
    })