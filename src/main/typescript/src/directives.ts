import {AttributeNames, componentIdEndSuffix, componentIdPrefix, DirectiveType, scriptTypeSignifier} from "./constants";
import {querySelectorAllPlusTarget} from "./utility";
import {changingAttributeDirectives, noteAttributeDirectiveChange, noteAttributeDirectiveRemove} from "./attributes";
import {runElementScript} from "./applyjs";
import {removeEventHandler, setupEventHandler} from "./events";

export class ComponentStart {
    constructor(public id : string){}
}
export class ComponentEnd {
    constructor(public id : string){}
}
export class Keep {
    constructor(public id : string){}
}

export class SetAttribute {
    constructor(public name : string, public value : string|null){}
}

export class ApplyJs {
    constructor(public js : string, public onlyOnCreate : boolean){}
}

export class EventHandler {
    constructor(
        public eventName : string,
        public callbackId : number,
        public prefix : string|null,
        public suffix : string|null,
        public data : string|null
    ){}
}
export type Directive = ComponentStart | ComponentEnd | Keep | ApplyJs | SetAttribute | EventHandler
export function asShadeDirective(child : Node) : Directive|null {
    if(child instanceof HTMLElement && child.tagName == "SCRIPT" && child.getAttribute("type") === scriptTypeSignifier){
        const directiveType = child.getAttribute(AttributeNames.DirectiveType)
        const id = child.id
        switch(directiveType){
            case DirectiveType.ApplyJs:
                const runOption = child.getAttribute(AttributeNames.ApplyJsRunOption)
                const script = child.getAttribute(AttributeNames.ApplyJsScript)!!
                return new ApplyJs(script, runOption === "1")
            case DirectiveType.ComponentStart:
                return new ComponentStart(id.substr(componentIdPrefix.length))
            case DirectiveType.ComponentEnd:
                return new ComponentEnd(id.substr(5, id.length - componentIdPrefix.length - componentIdEndSuffix.length))
            case DirectiveType.ComponentKeep:
                return new Keep(id.substr(componentIdPrefix.length))
            case DirectiveType.SetAttribute: {
                const name = child.getAttribute(AttributeNames.SetAttributeName)!!
                const value = child.getAttribute(AttributeNames.SetAttributeValue)
                return new SetAttribute(name, value);
            }
            case DirectiveType.EventHandler: {
                const name = child.getAttribute(AttributeNames.EventName)!!
                const id = +child.getAttribute(AttributeNames.EventCallbackId)!!
                const prefix = child.getAttribute(AttributeNames.EventPrefix)
                const suffix = child.getAttribute(AttributeNames.EventSuffix)
                const data = child.getAttribute(AttributeNames.EventData)
                return new EventHandler(name, id, prefix, suffix, data)
            }
        }
    }
    return null
}

export function addAllDirectives(base : HTMLElement) {
    changingAttributeDirectives(()=>{
        for(let script of querySelectorAllPlusTarget(base, `script[type=${scriptTypeSignifier}]`)){
            const directive = asShadeDirective(script)
            if(script instanceof HTMLElement && directive){
                onAddedOrUpdated({
                    element: script,
                    directive
                });
            }
        }
    })
}

export function determineScriptTarget(script : HTMLElement) : HTMLElement|null {
    if(script.hasAttribute(AttributeNames.TargetSiblingDirective)){
        let target : Element|null = script
        while(target && target.hasAttribute(AttributeNames.TargetSiblingDirective)){
            target = target.previousElementSibling
        }
        return target as (HTMLElement|null)
    } else {
        return script.parentElement!!
    }
}

export interface TargetInfo {
    element : HTMLElement
    directive : Directive
}
export interface AddedTargetInfo extends TargetInfo {
    target : HTMLElement
}
/**
 * Called after the directive contained in element is added to target.
 */
export function onAddedOrUpdated(info : TargetInfo) {
    const target = determineScriptTarget(info.element)
    if(target){
        const directive = info.directive;
        const addInfo = {...info, target}
        if(directive instanceof SetAttribute){
            noteAttributeDirectiveChange(addInfo);
        } else if(directive instanceof ApplyJs){
            runElementScript(directive, addInfo)
        } else if(directive instanceof EventHandler){
            setupEventHandler(directive, addInfo)
        }
    } else {
        console.error(`Unknown target for ${info.element.outerHTML}`)
    }
}
export function onRemoved(info : TargetInfo){
    const directive = info.directive
    if(directive instanceof SetAttribute){
        noteAttributeDirectiveRemove(info.element)
    }
    if(directive instanceof EventHandler){
        removeEventHandler(directive, info)
    }
}