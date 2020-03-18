package net.justmachinery.shade

import net.justmachinery.shade.component.AdvancedComponent
import net.justmachinery.shade.state.ChangeBatchChangePolicy
import net.justmachinery.shade.state.runChangeBatch

data class ContextErrorHandler(
    private val previous : ContextErrorHandler?,
    private val handle : ComponentErrorHandlingContext.()->Boolean
) {
    fun handleException(
        context : ComponentErrorHandlingContext,
        client : Client
    ) : Boolean {
        return runChangeBatch(ChangeBatchChangePolicy.FORCE_ALLOWED) {
            client.swallowExceptions({ "While handling $context" }) {
                var handler: ContextErrorHandler? = this
                while (handler != null) {
                    if (handler.handle(context)) {
                        break
                    } else {
                        handler = handler.previous
                    }
                }
                handler != null
            } ?: false
        }
    }
}

val ERROR_HANDLER_IDENTIFIER = ShadeContextIdentifier<ContextErrorHandler>()

enum class ContextErrorSource {
    MOUNTING,
    UNMOUNTING,
    JAVASCRIPT,
    CALLBACK,
    RENDER
}

data class ComponentErrorHandlingContext(
    val source : ContextErrorSource,
    //The component may be available in RENDER/MOUNTING/UNMOUNTING contexts
    val component : AdvancedComponent<*, *>?,
    val throwable : Throwable
)

internal fun <T> AdvancedComponent<*,*>.handleExceptions(source: ContextErrorSource, cb : ()->T) : T? {
    val handler = currentContext()[ERROR_HANDLER_IDENTIFIER]
    return try {
        cb()
    } catch(t : Throwable){
        val ehc = ComponentErrorHandlingContext(source, this, t)
        if(handler == null || !handler.handleException(ehc, client)){
            client.swallowException({ "In context $ehc" }, t)
        }
        null
    }
}

fun <T> AdvancedComponent<*,*>.onErrors(onError: ComponentErrorHandlingContext.()->Boolean, cb: ()->T) : T? {
    val currentContext = currentContext()
    return addContext(ERROR_HANDLER_IDENTIFIER.with(ContextErrorHandler(previous = currentContext[ERROR_HANDLER_IDENTIFIER], handle = onError))
    ){
        handleExceptions(ContextErrorSource.RENDER){
            cb()
        }
    }
}
