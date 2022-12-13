import {AddedTargetInfo, asShadeDirective, SetAttribute} from "./directives";
import {AttributeNames, DirectiveType, scriptTypeSignifier} from "./constants";
import {suppressEventFiring} from "./events";


//We need some way of storing the original values of an attribute before an attribute directive was applied,
//in case that directive is removed in an update that does not reset an element's attributes.

const attributeOriginalValues = Symbol()
interface OriginalAttributeValueDom extends HTMLElement {
    [attributeOriginalValues]? : AttributeOriginalMap
}
interface AttributeOriginalMap {
    [name: string]:string|null
}

export function onAttributesSetFromSource(element : HTMLElement){
    const originalMap = (element as OriginalAttributeValueDom)[attributeOriginalValues]
    if(originalMap){
        delete (element as OriginalAttributeValueDom)[attributeOriginalValues];
        targetsWithChangedAttributeDirectives.add(element);
    }
}
function noteOriginalAttribute(element : HTMLElement, name : string){
    let originals = (element as OriginalAttributeValueDom)[attributeOriginalValues];
    if(!originals){
        originals = (element as OriginalAttributeValueDom)[attributeOriginalValues] = {};
    }
    if(!(name in originals)){
        originals[name] = element.getAttribute(name);
    }
}


const isSetAttributeDirective = `[${AttributeNames.DirectiveType}=${DirectiveType.SetAttribute}]`;
const baseQueryIsSetAttributeDirective = `script[type=${scriptTypeSignifier}]${isSetAttributeDirective}`;
function updateAttributeDirectives(target : HTMLElement){
    //First, find all SetAttribute directives that apply to target
    const applicable = Array.from(target.querySelectorAll(baseQueryIsSetAttributeDirective));
    let current : HTMLElement|null = target
    while(true){
        current = current.nextElementSibling as HTMLElement;
        if(!current || !current.matches(`script[type=${scriptTypeSignifier}][${AttributeNames.TargetSiblingDirective}]`)){
            break
        }
        applicable.push(current);
    }
    //Next, group them by the attribute they apply to
    const byAttributeName : {[name: string]:SetAttribute[]} = {}
    for(let el of applicable){
        const asDirective = asShadeDirective(el);
        if(asDirective && asDirective instanceof SetAttribute){
            let array = byAttributeName[asDirective.name];
            if(!array){
                array = byAttributeName[asDirective.name] = [];
            }
            array.push(asDirective)
        }
    }
    //Now, apply only the last directive for every attribute
    for(let attribute of Object.getOwnPropertyNames(byAttributeName)){
        const directives = byAttributeName[attribute];
        const last = directives[directives.length - 1]!!

        noteOriginalAttribute(target, last.name);
        applyAttributeValue(target, last.name, last.value);
    }

    //Finally, restore the original values for any attributes that no longer have directives
    const originals = (target as OriginalAttributeValueDom)[attributeOriginalValues] || {};
    for(let original of Object.getOwnPropertyNames(originals)){
        if(!byAttributeName[original]){
            applyAttributeValue(target, original, originals[original]);
            delete originals[original];
        }
    }
}


let targetsWithChangedAttributeDirectives : Set<HTMLElement> = new Set();
export function changingAttributeDirectives(cb : ()=>void){
    try {
        cb()
    } finally {
        for(let target of targetsWithChangedAttributeDirectives){
            updateAttributeDirectives(target)
        }
        targetsWithChangedAttributeDirectives = new Set();
    }
}

const setAttributeTarget = Symbol();
interface SetAttributeDom {
    [setAttributeTarget]?: HTMLElement
}
export function noteAttributeDirectiveChange(info : AddedTargetInfo){
    targetsWithChangedAttributeDirectives.add(info.target);
    (<SetAttributeDom>info.element)[setAttributeTarget] = info.target
}
export function noteAttributeDirectiveRemove(element : HTMLElement){
    const target = (<SetAttributeDom>element)[setAttributeTarget]
    if(target){
        targetsWithChangedAttributeDirectives.add(target);
    }
}

export function applyAttributeValue(target : HTMLElement, name : string, value : string|null){
    if(value == null){
        target.removeAttribute(name);
    } else {
        target.setAttribute(name, value)
    }
    if(target instanceof HTMLInputElement && (name == "value" || name == "checked")){
        //These special values have effects only on the "initial" insertion of a DOM object;
        //for consistency we always apply these effects
        if(name == "value" && target.value != value){
            suppressChangeListeners(target, ()=>{
                target.value = value ?? ""
            })
        } else if(name == "checked" && target.checked != (value != null)){
            suppressChangeListeners(target, ()=>{
                target.checked = value != null
            })
        }
    }
}

function suppressChangeListeners(target : HTMLInputElement, cb : ()=>void){
    suppressEventFiring.suppress = true
    const oldOnChange = target.onchange
    target.onchange = null
    cb()
    target.onchange = oldOnChange
    suppressEventFiring.suppress = false
}