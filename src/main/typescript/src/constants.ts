//Changes here should be mirrored in ClientConstants.kt

export enum DirectiveType {
    ApplyJs = "j",
    SetAttribute = "a",
    EventHandler = "e",
    ComponentStart = "s",
    ComponentEnd = "f",
    ComponentKeep = "k"
}
export enum AttributeNames {
    DirectiveType = "data-s",
    TargetSiblingDirective = "data-f",
    ApplyJsScript = "data-t",
    ApplyJsRunOption = "data-r",
    SetAttributeName = "data-a",
    SetAttributeValue = "data-v",
    Key = "data-k",
    EventName = "data-e",
    EventCallbackId = "data-i",
    EventPrefix = "data-p",
    EventSuffix = "data-x",
    EventData = "data-d",
    Bound = "data-b",
    Checkbox = "data-c"
}

export const scriptTypeSignifier = "shade"
export const componentIdPrefix = "shade"
export const componentIdEndSuffix = "e"

export const messageTagSeparator = "|"
export const messageTagErrorPrefix = "E"

export enum SocketScopeNames {
    reconcile = "r",
    updateBoundInput = "b",
    sendMessage = "s",
    sendIfError = "q"
}