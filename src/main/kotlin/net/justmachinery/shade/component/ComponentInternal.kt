package net.justmachinery.shade.component

import kotlinx.html.Tag
import net.justmachinery.shade.Client
import net.justmachinery.shade.ContextErrorSource
import net.justmachinery.shade.ShadeContext
import net.justmachinery.shade.handleExceptions
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
    handleExceptions(ContextErrorSource.MOUNTING){
        mounted()
    }
}
internal fun AdvancedComponent<*,*>.doUnmount(){
    renderState.renderTreeRoot?.let {
        unmountAll(it)
    }

    client.markDontRerender(this)
    renderDependencies.dispose()
    supervisorJob.cancel()

    renderDependencies.component = null

    handleExceptions(ContextErrorSource.UNMOUNTING){
        //Unmount children
        unmounted()
    }
}

//This allows for the render() function to work despite there being no ergonomic way to have both a fresh RenderIn tag and
//a fresh component receiver for the passed-in function.
internal fun <R : Any, P : Tag> AdvancedComponent<R,P>.realComponentThis() = this.renderState.currentComponentOverride ?: this