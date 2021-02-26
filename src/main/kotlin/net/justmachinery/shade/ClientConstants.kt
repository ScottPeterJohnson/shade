package net.justmachinery.shade

//Changes here should be mirrored in constants.ts

enum class DirectiveType(val raw : String) {
    ApplyJs("j"),
    SetAttribute("a"),
    EventHandler("e"),
    ComponentStart("s"),
    ComponentEnd("f"),
    ComponentKeep("k")
}
enum class AttributeNames(val raw : String) {
    DirectiveType("data-s"),
    TargetSiblingDirective("data-f"),
    ApplyJsScript("data-t"),
    ApplyJsRunOption("data-r"),
    SetAttributeName("data-a"),
    SetAttributeValue("data-v"),
    Key("data-k"),
    EventName("data-e"),
    EventCallbackId("data-i"),
    EventPrefix("data-p"),
    EventSuffix("data-x"),
    EventData("data-d"),
    Bound("data-b"),
    Checkbox("data-c")
}

internal const val scriptTypeSignifier = "shade"
internal const val componentIdPrefix = "shade"
internal const val componentIdEndSuffix = "e"

internal const val messageTagSeparator = "|"
internal const val messageTagErrorPrefix = "E"

internal enum class SocketScopeNames(val raw : String) {
    reconcile("r"),
    updateBoundInput("b"),
    sendMessage("s"),
    sendIfError("q")
}