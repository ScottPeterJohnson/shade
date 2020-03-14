package net.justmachinery.shade.component

import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.html.*
import mu.KLogging
import net.justmachinery.shade.*
import net.justmachinery.shade.Render
import net.justmachinery.shade.render.*
import net.justmachinery.shade.routing.annotation.FinishedRoute
import net.justmachinery.shade.routing.annotation.Router
import net.justmachinery.shade.routing.annotation.routingSetNavigate
import net.justmachinery.shade.routing.base.*
import net.justmachinery.shade.routing.base.routeInternal
import net.justmachinery.shade.routing.base.startRoutingInternal
import java.lang.reflect.ParameterizedType
import java.util.concurrent.ConcurrentHashMap
import kotlin.coroutines.CoroutineContext
import kotlin.reflect.KClass

/**
 * A Component renders a chunk of DOM which can attach server-side callbacks on client-side events.
 * It is automatically rerendered when any observable state used in its render function changes.
 * Instances of this class MUST have a no-argument constructor.
 */
@Suppress("UNCHECKED_CAST")
abstract class Component<PropType : Any> :
    AdvancedComponent<PropType, HtmlBlockTag>(componentPassProps.get() as ComponentInitData<PropType>) {}

@Suppress("UNCHECKED_CAST")
/**
 * Like [Component], but allows specifying the type of tag to render in.
 */
abstract class ComponentInTag<PropType : Any, RenderIn : Tag> :
    AdvancedComponent<PropType, RenderIn>(componentPassProps.get() as ComponentInitData<PropType>) {}