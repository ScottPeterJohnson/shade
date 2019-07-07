package net.justmachinery.shade.render

import kotlinx.html.HtmlBlockTag
import kotlinx.html.Tag
import kotlinx.html.TagConsumer
import net.justmachinery.shade.Component
import java.util.*


internal data class RenderTreeLocation(
    val parent : RenderTreeLocation?,
    val tagName : String,
    val children : MutableList<RenderTreeChild> = mutableListOf()
)

internal sealed class RenderTreeChild {
    data class TagChild(val child : RenderTreeLocation) : RenderTreeChild()
    data class ComponentChild(val index : Int, val component : Component<*>) : RenderTreeChild()
}

internal data class RenderTreeLocationFrame(
    var oldRenderTreeLocation: RenderTreeLocation?,
    var newRenderTreeLocation : RenderTreeLocation,
    var renderTreeChildIndex : Int = 0
)

internal fun HtmlBlockTag.updateRenderTree(
    renderState: ComponentRenderState, cb : HtmlBlockTag.()->Unit
){
    val oldRenderTree = renderState.renderTreeRoot

    val newRoot = RenderTreeLocation(null, tagName)
    renderState.renderTreeRoot = newRoot

    val frame = RenderTreeLocationFrame(
        oldRenderTreeLocation = oldRenderTree,
        newRenderTreeLocation = newRoot
    )

    renderState.location = frame

    renderTreeTagRecorder(this, renderState).run { cb() }

    if(oldRenderTree != null){
        unmountDiffInRenderTrees(oldRenderTree, newRoot)
    }

    renderState.location = null
}


internal fun renderTreeTagRecorder(parentTag : HtmlBlockTag, renderState: ComponentRenderState) : HtmlBlockTag {
    val frameStack = Stack<RenderTreeLocationFrame>()
    frameStack.push(renderState.location!!)
    return object : HtmlBlockTag {
        override val attributes get() = parentTag.attributes
        override val attributesEntries get() = parentTag.attributesEntries
        override val consumer = object : TagConsumer<Any?> by parentTag.consumer {
            override fun onTagStart(tag: Tag) {
                val oldFrame = frameStack.peek()
                val child = RenderTreeLocation(
                    parent = oldFrame.newRenderTreeLocation,
                    tagName = tag.tagName
                )
                val oldLocation = oldFrame.oldRenderTreeLocation?.children?.getOrNull(oldFrame.renderTreeChildIndex)
                frameStack.push(RenderTreeLocationFrame(
                    oldRenderTreeLocation =
                        if(oldLocation != null && oldLocation is RenderTreeChild.TagChild && oldLocation.child.tagName == tag.tagName)
                            oldLocation.child
                        else
                            null,
                    newRenderTreeLocation = child
                ))
                oldFrame.renderTreeChildIndex += 1

                parentTag.consumer.onTagStart(tag)
            }
            override fun onTagEnd(tag: Tag) {
                val endingFrame = frameStack.pop()
                //The tree should only include nodes with component leaves, as that's what we care about.
                endingFrame.newRenderTreeLocation.let {
                    if(it.children.isNotEmpty()){
                        frameStack.peek()?.newRenderTreeLocation?.children?.add(RenderTreeChild.TagChild(it))
                    }
                }

                parentTag.consumer.onTagEnd(tag)
            }
        }
        override val emptyTag: Boolean get() = parentTag.emptyTag
        override val inlineTag: Boolean get() = parentTag.inlineTag
        override val namespace: String? get() = parentTag.namespace
        override val tagName: String get() = parentTag.tagName
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
                    is RenderTreeChild.ComponentChild -> oldChild.component.unmounted()
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
            is RenderTreeChild.ComponentChild -> it.component.unmounted()
        }
    }
}