package net.justmachinery.shade.render

import kotlinx.html.HtmlBlockTag
import kotlinx.html.div
import kotlinx.html.id
import kotlinx.html.stream.appendHTML
import net.justmachinery.shade.Component
import net.justmachinery.shade.ComponentProps
import java.io.ByteArrayOutputStream
import java.util.*
import kotlin.reflect.KClass

internal data class ComponentRenderState(
    val componentId : UUID = UUID.randomUUID(),
    var renderTreeRoot : RenderTreeLocation? = null,
    var location : RenderTreeLocationFrame? = null
)

internal fun Component<*>.renderInternal(tag : HtmlBlockTag){
    val oldRendering = context.currentlyRenderingComponent
    context.currentlyRenderingComponent = this
    tag.div {
        try {
            id = renderState.componentId.toString()
            updateRenderTree(renderState){
                this.render()
            }
        } finally {
            context.currentlyRenderingComponent = oldRendering
        }
    }

}

internal fun Component<*>.updateRender(){
    val html = ByteArrayOutputStream().let { baos ->
        baos.writer().buffered().use {
            it.appendHTML().div {
                renderInternal(this)
            }
        }
        baos.toByteArray()
    }
    val base64 = Base64.getEncoder().encode(html).toString(Charsets.UTF_8)
    context.executeScript("r(\"${renderState.componentId}\",\"$base64\");")
}



internal fun <T : Any> addComponent(
    parent : Component<*>,
    block : HtmlBlockTag,
    component : KClass<out Component<T>>,
    props : T,
    key : String? = null
){
    val comp = getOrConstructComponent(parent, component, props, key)
    comp.run {
        renderInternal(block)
    }
    comp.afterMount()

    parent.renderState.location?.let { it.renderTreeChildIndex += 1 }
}

private fun <T : Any> getOrConstructComponent(
    parent : Component<*>,
    component : KClass<out Component<T>>,
    props : T,
    key : String? = null
) : Component<T> {
    parent.renderState.location?.let {
        val oldComponent = it.oldRenderTreeLocation?.children?.getOrNull(it.renderTreeChildIndex)
        if(oldComponent is RenderTreeChild.ComponentChild && oldComponent.component.kClass == component){
            @Suppress("UNCHECKED_CAST")
            oldComponent.component as Component<T>
            oldComponent.component.props = props
            return oldComponent.component
        }
    }
    return component.java.getDeclaredConstructor(ComponentProps::class.java).newInstance(
        ComponentProps(
            context = parent.context,
            props = props,
            key = key,
            kClass = component
        )
    )
}