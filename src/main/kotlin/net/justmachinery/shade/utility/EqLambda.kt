package net.justmachinery.shade.utility

import org.apache.commons.lang3.builder.HashCodeBuilder
import java.lang.reflect.AccessibleObject

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
        val fields = javaClass.declaredFields
        AccessibleObject.setAccessible(fields, true)
        fields.forEach { field ->
            val leftValue = field.get(this)
            val rightValue = field.get(other)
            if(leftValue != rightValue){
                return false
            }
        }
        return true
    }

    override fun hashCode(): Int {
        val hash = HashCodeBuilder()
        hash.append(javaClass)
        val fields = javaClass.declaredFields
        AccessibleObject.setAccessible(fields, true)
        fields.forEach { field ->
            hash.append(field.get(this))
        }
        return hash.build()
    }
}