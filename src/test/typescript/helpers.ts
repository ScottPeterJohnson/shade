import {addAllDirectives} from "@src/directives";
import {reconcile} from "@src/reconcile";

//Markup helpers mirroring what the Kotlin side emits. See ClientConstants.kt.

export function componentStart(id : number, key? : string){
    return `<script type="shade" id="shade${id}" data-s="s"${keyAttr(key)}></script>`
}
export function componentEnd(id : number){
    return `<script type="shade" id="shade${id}e" data-s="f"></script>`
}
export function keep(id : number, key? : string){
    return `<script type="shade" id="shade${id}" data-s="k"${keyAttr(key)}></script>`
}
export function component(id : number, inner : string, key? : string){
    return componentStart(id, key) + inner + componentEnd(id)
}
export function eventHandler(event : string, callbackId : number, data? : string, targetsSibling = false){
    const dataAttr = data ? ` data-d="${data}"` : ""
    return `<script type="shade" data-s="e"${dataAttr} data-e="${event}" data-i="${callbackId}"${siblingAttr(targetsSibling)}></script>`
}
export function setAttribute(name : string, value : string|null, targetsSibling = false){
    const valueAttr = value === null ? "" : ` data-v="${value}"`
    return `<script type="shade" data-s="a" data-a="${name}"${valueAttr}${siblingAttr(targetsSibling)}></script>`
}
export function applyJs(js : string, onlyOnCreate = false, targetsSibling = false){
    const escaped = js.replace(/"/g, "&quot;")
    return `<script type="shade" data-s="j" data-r="${onlyOnCreate ? 1 : 0}" data-t="${escaped}"${siblingAttr(targetsSibling)}></script>`
}

function keyAttr(key? : string){ return key ? ` data-k="${key}"` : "" }
function siblingAttr(targetsSibling : boolean){ return targetsSibling ? ` data-f=""` : "" }

/** The id of the component every test renders into. */
export const rootId = 1

/** Puts [inner] on the page as the body of the root component, as a first page load would. */
export function render(inner : string){
    document.body.innerHTML = component(rootId, inner)
    addAllDirectives(document.body)
}

/** Sends [inner] as the root component's new markup, as a rerender would. */
export function update(inner : string){
    reconcile(rootId, inner)
}

/** Marks a node so that a later assertion can tell whether reconciliation reused it or replaced it. */
export function mark<T extends Node>(node : T, marker : string) : T {
    (node as any).__marker = marker
    return node
}
export function markerOf(node : Node|null|undefined){
    return node ? (node as any).__marker : undefined
}

export function elements(selector : string){
    return Array.from(document.body.querySelectorAll(selector))
}
export function markers(selector : string){
    return elements(selector).map(markerOf)
}
export function texts(selector : string){
    return elements(selector).map(it => it.textContent)
}
