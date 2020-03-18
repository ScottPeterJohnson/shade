package net.justmachinery.shade.component

import kotlinx.html.Tag
import net.justmachinery.shade.Client
import net.justmachinery.shade.ShadeContext
import kotlin.reflect.KClass


class ComponentInitData<T : Any>(
    val client : Client,
    val props : T,
    val key : String? = null,
    val renderIn : KClass<out Tag>,
    val treeDepth : Int,
    val context: ShadeContext
)

/**
 * This threadlocal implicitly passes props when constructing, for API convenience
 */
internal val componentPassProps = ThreadLocal<ComponentInitData<*>?>()