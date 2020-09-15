package net.justmachinery.shade.component

import kotlinx.html.Tag
import net.justmachinery.shade.Client
import net.justmachinery.shade.ContextErrorSource
import net.justmachinery.shade.ShadeContext
import net.justmachinery.shade.handlingErrors
import net.justmachinery.shade.render.unmountAll
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


internal fun AdvancedComponent<*,*>.doMount(){
    handlingErrors(ContextErrorSource.MOUNTING){
        MountingContext(this).mounted()
    }
}
internal fun AdvancedComponent<*,*>.doUnmount(){
    renderState.renderTreeRoot?.let {
        unmountAll(it)
    }

    client.markDontRerender(this)
    renderDependencies.dispose()
    supervisorJob.cancel()

    reactions?.forEach {
        it.dispose()
    }
    reactions = null

    renderDependencies.component = null

    handlingErrors(ContextErrorSource.UNMOUNTING){
        //Unmount children
        unmounted()
    }
}

/**
 * Essentially this is a code splitting scheme, allowing us to define basic functions of two receivers on a
 * component in multiple files.
 */
interface ComponentBase {
    fun thisComponent() : AdvancedComponent<*,*>
    fun realComponentThis() : AdvancedComponent<*,*>
}