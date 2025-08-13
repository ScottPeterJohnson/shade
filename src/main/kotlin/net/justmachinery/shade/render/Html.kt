package net.justmachinery.shade.render

import kotlinx.html.*
import kotlinx.html.consumers.onFinalize
import kotlinx.html.consumers.onFinalizeMap
import kotlinx.html.org.w3c.dom.events.Event
import kotlinx.html.stream.HTMLStreamBuilder
import net.justmachinery.shade.AttributeNames
import net.justmachinery.shade.DirectiveType
import net.justmachinery.shade.scriptTypeSignifier
import java.io.Writer
import java.util.*

fun shadeToWriter(writer : Writer): TagConsumer<Unit> {
    return HTMLStreamBuilder(writer, prettyPrint = false, xhtmlCompatible = false)
        .onFinalize { _, _ ->
            writer.close()
        }
        .onFinalizeMap { _, _ -> Unit }
        .let { ShadeConsumer(it) }
}

fun shadeToString(): TagConsumer<String> {
    return HTMLStreamBuilder(StringBuilder(32768), prettyPrint = false, xhtmlCompatible = false)
        .onFinalizeMap { sb, _ -> sb.toString() }
        .let { ShadeConsumer(it) }
}

private val childlessElements = setOf(
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
    "script",
    "style",
    "textarea",
    "title"
)
internal val <T> TagConsumer<T>.shade get() = this as? ShadeConsumer<T>
    ?: throw IllegalStateException("Tag consumer $this is not a ShadeConsumer; most likely you aren't using a shade kotlinx HTML builder")
internal fun Tag.scriptDirective(
    type : DirectiveType,
    id : String? = null,
    key : String? = null,
    data : List<Pair<AttributeNames, String>> = emptyList()
){
    val attributes = scriptDirectiveAttributes(type, id, key, data)
    consumer.shade.emitDirective(this, attributes)
}
private fun scriptDirectiveAttributes(
    type : DirectiveType,
    id : String? = null,
    key : String? = null,
    data : List<Pair<AttributeNames, String>> = emptyList()) : Map<String,String> {
    val base = listOfNotNull(
        "type" to scriptTypeSignifier,
        id?.let { "id" to it },
        key?.let { AttributeNames.Key.raw to it },
        AttributeNames.DirectiveType.raw to type.raw
    )
    val added = data.map { it.first.raw to it.second }
    return (base + added).toMap()
}

internal class ShadeConsumer<T>(private val downstream : TagConsumer<T>) : TagConsumer<T> {
    class TagStackEntry(val tag: Tag){
        val deferredDirectives = mutableListOf<Map<String,String>>()
    }
    private val tagStack = Stack<TagStackEntry>()

    internal var recorder : RenderTreeRecorder? = null

    /**
     * Collects attributes of a tag before emitting downstream
     */
    private var delayed : Tag? = null

    /**
     * The implicit tag being rendered into
     */
    internal var containerTag : Tag? = null

    internal fun emitDirective(tag : Tag, attributes : Map<String,String>){
        if(childlessElements.contains(tag.tagName)){
            if(tag != containerTag){
                tagStack.peek().deferredDirectives.add(attributes)
            } else {
                SCRIPT(attributes + mapOf(AttributeNames.TargetSiblingDirective.raw to ""), this).visit {}
            }
        } else {
            SCRIPT(attributes, this).visit {}
        }
    }

    override fun onTagStart(tag: Tag) {
        tagStack.add(TagStackEntry(tag))
        recorder?.onTagStart(tag)
        processDelayedTag()
        delayed = tag
    }

    override fun onTagAttributeChange(tag : Tag, attribute: String, value: String?) {
        if (delayed == null || delayed != tag) {
            if(tag != containerTag){
                requireTagStackTop(tag)
            }
            tag.scriptDirective(
                type = DirectiveType.SetAttribute,
                data = listOfNotNull(
                    AttributeNames.SetAttributeName to attribute,
                    value?.let { AttributeNames.SetAttributeValue to it }
                )
            )
        }
    }



    override fun onTagEnd(tag: Tag) {
        requireTagStackTop(tag)
        val tagEntry = tagStack.pop()
        recorder?.onTagEnd(tag)
        processDelayedTag()
        downstream.onTagEnd(tag)
        tagEntry.deferredDirectives.forEach {
            SCRIPT(it + mapOf(AttributeNames.TargetSiblingDirective.raw to ""), this).visit {}
        }
    }

    private fun requireTagStackTop(toBe : Tag){
        require(tagStack.peek().tag == toBe){ "Improper use of $toBe in tree: ${tagStack.joinToString(", ")}, ${tagStack.peek()}" }
    }


    private fun processDelayedTag() {
        delayed?.let { tag ->
            delayed = null
            downstream.onTagStart(tag)
        }
    }

    override fun onTagEvent(tag: Tag, event: String, value: (Event) -> Unit) {
        throw IllegalStateException("Tag events are unused")
    }
    override fun onTagContent(content: CharSequence) {
        processDelayedTag()
        downstream.onTagContent(content)
    }
    override fun onTagContentEntity(entity: Entities) {
        processDelayedTag()
        downstream.onTagContentEntity(entity)
    }
    override fun onTagComment(content: CharSequence) {
        processDelayedTag()
        downstream.onTagComment(content)
    }
    override fun finalize(): T {
        processDelayedTag()
        return downstream.finalize()
    }
    override fun onTagContentUnsafe(block: Unsafe.() -> Unit) {
        processDelayedTag()
        return downstream.onTagContentUnsafe(block)
    }
}