package net.justmachinery.shade.component

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.html.Tag
import mu.KLogging
import net.justmachinery.shade.components.ComponentHelpers
import net.justmachinery.shade.render.ComponentAdd
import net.justmachinery.shade.render.ComponentRenderState
import net.justmachinery.shade.render.currentlyRendering
import net.justmachinery.shade.routing.base.ComponentRouting
import net.justmachinery.shade.state.*
import kotlin.coroutines.CoroutineContext

/**
 * Like [Component], but allows specifying the type of tag to render in, and passes in props non-magically.
 * This is exposed in case you need that.
 */
abstract class AdvancedComponent<PropType : Any, RenderIn : Tag>(fullProps : ComponentInitData<PropType>) : CoroutineScope, EventHandlers, ComponentRouting, ComponentAdd, ComponentHelpers, ComponentBase {
    companion object : KLogging()

    private var propsAtom : Atom? = null
    internal var _props : PropType? = null
        private set
    internal fun initializeProps(value : PropType){ _props = value }
    internal fun updateProps(value : PropType){
        _props = value
        synchronized(this) {
            propsAtom?.let {
                runChangeBatch(ChangeBatchChangePolicy.FORCE_ALLOWED) {
                    it.reportChanged()
                }
            }
        }
    }

    val props: PropType
        get() {
            val props = _props
            if (props == null) {
                throw IllegalStateException("""
                    Illegal props access, probably from a constructor or on init, e.g. "val foo = props.bar". This is not allowed 
                    because props may change on subsequent rerenders, while the component remains. Try a lazy getter instead,
                    e.g. "val foo get() = props.bar", or "val x by computed { ... }". If you want to initialize mutable state from props, use a rivObservable.
                """.trimIndent())
            }
            if((observeBlock.get()?.observer as? Render)?.component != this){ //Note the render function implicitly depends on props
                synchronized(this){
                    if(propsAtom == null){ propsAtom = Atom() }
                    propsAtom!!
                }.reportObserved()
            }
            return props
        }
    val client = fullProps.client
    internal val baseContext = fullProps.context
    internal val key = fullProps.key
    internal val renderIn = fullProps.renderIn
    internal val treeDepth = fullProps.treeDepth

    //This is just state moved to another file for clarity
    internal val renderState = ComponentRenderState(client.nextComponentId())
    @Suppress("LeakingThis")
    internal val renderDependencies = Render(this)

    internal val supervisorJob = SupervisorJob(parent = fullProps.client.supervisor)
    override val coroutineContext: CoroutineContext get() = realComponentThis().supervisorJob

    internal var reactions : MutableList<Reaction>? = null

    /**
     * Main function to implement. This will be called whenever any observable state used in it changes.
     */
    abstract fun RenderIn.render()

    //Lifecycle functions.
    open fun MountingContext.mounted(){}
    open fun unmounted(){}

    override fun thisComponent() = this
    override fun realComponentThis() = currentlyRendering.get() ?: this
}

class MountingContext(private val component: AdvancedComponent<*,*>) {
    /**
     * Setup a reaction attached to this component, which will run once immediately
     * and whenever its dependencies change thereafter until this component is unmounted.
     * (This only makes sense to do on mount, hence the scoped context)
     */
    fun react(cb: ()->Unit){
        val reactions = component.reactions ?: run {
            component.reactions = mutableListOf()
            component.reactions!!
        }
        reactions.add(Reaction(cb))
    }
}