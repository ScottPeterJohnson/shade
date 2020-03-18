package net.justmachinery.shade.component

import kotlinx.html.*

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