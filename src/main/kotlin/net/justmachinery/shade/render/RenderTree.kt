package net.justmachinery.shade.render

import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import net.justmachinery.shade.Component
import java.util.*


internal class RenderTreeLocation(
    val parent : RenderTreeLocation?,
    val tagName : String,
    val children : MutableList<RenderTreeChild> = mutableListOf()
)

internal sealed class RenderTreeChild {
    data class TagChild(val child : RenderTreeLocation) : RenderTreeChild()
    data class ComponentChild(val index : Int, val component : Component<*, *>) : RenderTreeChild()
}

internal class RenderTreeLocationFrame(
    var oldRenderTreeLocation: RenderTreeLocation?,
    var newRenderTreeLocation : RenderTreeLocation,
    var renderTreeChildIndex : Int = 0
)

internal fun <T : Tag> T.updateRenderTree(
    renderState: ComponentRenderState, cb : T.()->Unit
){
    val oldRenderTree = renderState.renderTreeRoot

    val newRoot = RenderTreeLocation(null, "(root)")
    renderState.renderTreeRoot = newRoot

    val frame = RenderTreeLocationFrame(
        oldRenderTreeLocation = oldRenderTree,
        newRenderTreeLocation = newRoot
    )

    renderState.location = frame

    renderTreeTagRecorder(this, renderState){ cb() }

    if(oldRenderTree != null){
        unmountDiffInRenderTrees(oldRenderTree, newRoot)
    }

    renderState.location = null
}


internal fun <T : Tag> renderTreeTagRecorder(parentTag : T, renderState: ComponentRenderState, cb : T.()->Unit) : T {
    val frameStack = Stack<RenderTreeLocationFrame>()
    frameStack.push(renderState.location!!)
    val consumer = parentTag.consumer
    val newConsumer = RenderTreeRecorderConsumer(
        base = if(consumer is RenderTreeRecorderConsumer) consumer.base else consumer,
        frameStack = frameStack,
        renderState = renderState
    )

    val field = parentTag::class.java.getDeclaredField("consumer").also { it.isAccessible = true }
    field.set(parentTag, newConsumer)
    try {
        parentTag.run {
            cb()
        }
    } finally {
        field.set(parentTag, consumer)
    }

    return parentTag
}

internal class RenderTreeRecorderConsumer(
    val base : TagConsumer<*>,
    val frameStack : Stack<RenderTreeLocationFrame>,
    val renderState: ComponentRenderState
) : TagConsumer<Any?> by base {
    override fun onTagStart(tag: Tag) {
        if(tag.tagName != "script" || tag.attributes["type"] != "shade"){
            val oldFrame = frameStack.peek()
            val child = RenderTreeLocation(
                parent = oldFrame.newRenderTreeLocation,
                tagName = tag.tagName
            )
            val oldLocation = oldFrame.oldRenderTreeLocation?.children?.getOrNull(oldFrame.renderTreeChildIndex)

            val newFrame = RenderTreeLocationFrame(
                oldRenderTreeLocation =
                if(oldLocation != null && oldLocation is RenderTreeChild.TagChild && oldLocation.child.tagName == tag.tagName)
                    oldLocation.child
                else
                    null,
                newRenderTreeLocation = child
            )
            frameStack.push(newFrame)
            oldFrame.renderTreeChildIndex += 1

            renderState.location = newFrame
        }

        base.onTagStart(tag)
    }
    override fun onTagEnd(tag: Tag) {
        if(tag.tagName != "script" || tag.attributes["type"] != "shade") {
            val endingFrame = frameStack.pop()
            val parentFrame = frameStack.peek()
            //The tree should only include nodes with component leaves, as that's what we care about.
            endingFrame.newRenderTreeLocation.let {
                if (true || it.children.isNotEmpty()) {
                    parentFrame?.newRenderTreeLocation?.children?.add(RenderTreeChild.TagChild(it))
                }
            }

            renderState.location = parentFrame
        }

        base.onTagEnd(tag)
    }
}

/**
 * Call unmount on any components in oldRoot not present in the same location as newRoot
 */
internal fun unmountDiffInRenderTrees(oldRoot : RenderTreeLocation, newRoot : RenderTreeLocation){
    if(oldRoot.tagName != newRoot.tagName){
        unmountAll(oldRoot)
    } else {
        for(i in 0 until oldRoot.children.size){
            val oldChild = oldRoot.children[i]
            val newChild = newRoot.children.getOrNull(i)
            if(oldChild is RenderTreeChild.TagChild && newChild is RenderTreeChild.TagChild){
                unmountDiffInRenderTrees(oldChild.child, newChild.child)
            } else if (oldChild != newChild){
                when (oldChild) {
                    is RenderTreeChild.ComponentChild -> oldChild.component.doUnmount()
                    is RenderTreeChild.TagChild -> unmountAll(oldChild.child)
                }
            }
        }
    }
}

private fun unmountAll(root : RenderTreeLocation){
    root.children.forEach {
        when (it) {
            is RenderTreeChild.TagChild -> unmountAll(it.child)
            is RenderTreeChild.ComponentChild -> it.component.doUnmount()
        }
    }
}