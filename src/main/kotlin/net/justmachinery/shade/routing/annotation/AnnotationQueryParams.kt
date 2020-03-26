package net.justmachinery.shade.routing.annotation

import net.justmachinery.shade.ErrorOr
import net.justmachinery.shade.routing.base.RoutingException

interface QueryParamSpec {
    fun param(name : String) = StringParam(name)
    fun stringParam(name : String) = StringParam(name)
    fun longParam(name : String) = LongParam(name)
    fun intParam(name : String) = IntParam(name)
    fun floatParam(name : String) = FloatParam(name)
    fun doubleParam(name : String) = DoubleParam(name)
    fun booleanParam(name : String) = BooleanParam(name)
}

object NoQueryParameters : QueryParamSpec

interface QueryParam<T> {
    val name : String
    /**
     * Parse a [T] from string (not URL quoted)
     */
    fun parse(value : String) : T

    /**
     * Return a string representation of [T] (URL quoting not necessary)
     */
    fun serialize(value : T) : String

    fun optional() = OptionalParam(this)

    fun tryParse(value : String?) : ErrorOr<T> {
        return if(value == null){
            if(this is OptionalParam<T>){
                @Suppress("UNCHECKED_CAST")
                ErrorOr.Result(null as T)
            } else {
                ErrorOr.Error(
                    QueryParamNotFoundException(
                        name
                    )
                )
            }
        } else {
            try {
                ErrorOr.Result(parse(value))
            } catch(t : Throwable){
                ErrorOr.Error<T>(
                    QueryParamParseException(
                        name,
                        value
                    ).apply { addSuppressed(t) })
            }
        }
    }
}

open class QueryParamException(message : String) : RoutingException(message)
class QueryParamNotFoundException(val name : String) : QueryParamException("Param not found: $name")
class QueryParamParseException(val name : String, val value : String) : QueryParamException("Could not parse param $name from \"$value\"")

class OptionalParam<T>(private val wrapped : QueryParam<T>) :
    QueryParam<T> {
    override val name = wrapped.name
    override fun parse(value: String) = wrapped.parse(value)
    override fun serialize(value: T) = wrapped.serialize(value)
}

class StringParam(override val name: String) :
    QueryParam<String> {
    override fun parse(value: String) = value
    override fun serialize(value: String) = value
}

class LongParam(override val name: String) :
    QueryParam<Long> {
    override fun parse(value: String) = value.toLong()
    override fun serialize(value: Long) = value.toString()
}

class IntParam(override val name: String) :
    QueryParam<Int> {
    override fun parse(value: String) = value.toInt()
    override fun serialize(value: Int) = value.toString()
}

class FloatParam(override val name: String) :
    QueryParam<Float> {
    override fun parse(value: String) = value.toFloat()
    override fun serialize(value: Float) = value.toString()
}

class DoubleParam(override val name: String) :
    QueryParam<Double> {
    override fun parse(value: String) = value.toDouble()
    override fun serialize(value: Double) = value.toString()
}

class BooleanParam(override val name: String) :
    QueryParam<Boolean> {
    override fun parse(value: String) = value.toBoolean()
    override fun serialize(value: Boolean) = value.toString()
}


interface ParamsHolderSupport {
    val allValid : Boolean
}