//Reconcile a targetId with HTML
import {
    asShadeDirective,
    changingDirectives,
    checkDirectiveAdd,
    checkDirectiveChange,
    checkDirectiveRemove,
    ComponentEnd,
    ComponentStart,
    Keep,
} from "./directives";
import {AttributeNames, componentIdPrefix} from "./constants";
import {onAttributesSetFromSource} from "./attributes";

export function reconcile(targetId : number, html : string){
    changingDirectives(()=>{
        const target = document.getElementById(componentIdPrefix+targetId);
        if(!target){ return }
        const parent = target.parentElement!!
        const htmlDom = document.createElement(parent.tagName);
        htmlDom.innerHTML = html;


        const included = [];
        let current = target.nextSibling;
        while(current != null){
            const currentDirective = asShadeDirective(current)
            if(currentDirective instanceof ComponentEnd && currentDirective.id == ""+targetId){
                break;
            }
            included.push(current);
            current = current.nextSibling;
        }

        patchChildren(parent, target, included, htmlDom.childNodes);
    });
}




interface ChildNodeListLike {
    length : number;
    [index: number] : Node
}

class Component {
    constructor(
        private startDirective : ComponentStart,
        public start : Node,
        public children : Node[],
        public end : Node
    ){}

    asNodes(){
        return [this.start, ...this.children, this.end]
    }

    id(){
        return this.startDirective.id
    }
}
type NodeOrComponent = (Node|Component);
function asNodes(target : NodeOrComponent){
    return target instanceof Component ? target.asNodes() : [target]
}


function reconcileNodes(original : Node, newer : Node) : Node {
    if(original instanceof HTMLElement && newer instanceof HTMLElement){
        if(original.tagName != newer.tagName){
            checkDirectiveAdd(newer);
            checkDirectiveRemove(original);
            return newer;
        } else {
            let changed = false
            for(let i=0;i<original.attributes.length;i++){
                const attribute = original.attributes[i].name;
                if(!newer.hasAttribute(attribute)){
                    original.removeAttribute(attribute);
                    changed = true;
                }
            }
            for(let i=0;i<newer.attributes.length;i++){
                const attribute = newer.attributes[i].name;
                const olderAttr = original.getAttribute(attribute);
                const newerAttr = newer.getAttribute(attribute)!
                if(olderAttr != newerAttr){
                    original.setAttribute(attribute, newerAttr);
                    changed = true;
                }
            }
            onAttributesSetFromSource(original);
            if(changed){
                checkDirectiveChange(original);
            }
            patchChildren(original, null, original.childNodes, newer.childNodes);
            return original;
        }
    } else {
        return newer;
    }
}

function patchChildren(
    dom : HTMLElement,
    appendStart : HTMLElement|null,
    domChildren : ChildNodeListLike,
    replacementChildren : ChildNodeListLike
){
    const final = reconcileChildren(dom, domChildren, replacementChildren);
    let endOfPatchRange : Node|null;
    if(domChildren.length > 0) {
        endOfPatchRange = domChildren[domChildren.length - 1].nextSibling;
    } else if (appendStart){
        endOfPatchRange = appendStart.nextSibling;
    } else {
        endOfPatchRange = null;
    }

    let current : Node|"start"|"end" = appendStart ? appendStart : "start";
    function afterCurrent() : Node|"end" {
        if(current == "start"){
            return dom.firstChild ? dom.firstChild : "end";
        } else if(current == "end"){
            return "end";
        } else {
            return current.nextSibling ? current.nextSibling : "end";
        }
    }
    for(const child of final){
        let next = afterCurrent();
        if(next !== child){
            dom.insertBefore(child, next === "end" ? null : next);
        }
        current = child;
    }
    current = afterCurrent();
    while(current != "end" && current != endOfPatchRange){
        const child = current;
        current = afterCurrent();
        dom.removeChild(child);
    }
}


function reconcileChildren(
    dom : HTMLElement,
    domChildren : ChildNodeListLike,
    replacementChildren : ChildNodeListLike
) : Node[] {
    const originals = collapseComponentChildren(domChildren);
    const replacements = collapseComponentChildren(replacementChildren);
    const originalKeys = collectKeysMap(originals);

    let originalIndex = 0;
    let replacementIndex = 0;

    const finalChildren : Node[] = [];

    const keyUsed = new Set<string>()
    while(originalIndex < originals.length || replacementIndex < replacements.length){
        let original : NodeOrComponent|undefined = originals[originalIndex];
        const newer : NodeOrComponent|undefined = replacements[replacementIndex];
        //Skip any keyed originals; they will be looked up by key
        if(original && getKey(original) != null){
            originalIndex += 1;
        } else if(original && !newer) {
            /* Implicit remove */
            for(let node of asNodes(original)){
                checkDirectiveRemove(node);
            }
            originalIndex += 1;
        } else {
            const newerKey = getKey(newer);
            if(newerKey != null){
                keyUsed.add(newerKey);
                original = originalKeys[newerKey];
                //We'll match this unkeyed original again on something without a key
                originalIndex -= 1;
            }

            let add : Node[] = [];

            function useNewer(){
                add = asNodes(newer!);
                for(let node of add){
                    checkDirectiveAdd(node);
                }
                if(original){
                    for(let node of asNodes(original)){
                        checkDirectiveRemove(node);
                    }
                }
            }

            const newerDirective = newer instanceof Component ? null : asShadeDirective(newer)
            if(original && original instanceof Component && newerDirective instanceof Keep && newerDirective.id == original.id()){
                add = asNodes(original);
            } else {
                if(!original){
                    useNewer();
                } else {
                    if(newer instanceof Component){
                        if(original instanceof Component && original.id() == newer.id()){
                            add = [
                                original.start,
                                ...reconcileChildren(dom, original.children, newer.children),
                                original.end
                            ]
                        } else {
                            useNewer();
                        }
                    } else if(original instanceof Component){
                        useNewer()
                    } else {
                        add = [reconcileNodes(original, newer)]
                    }
                }
            }
            finalChildren.push(...add);
            originalIndex += 1;
            replacementIndex += 1;
        }
    }

    for(const key of Object.getOwnPropertyNames(originalKeys)){
        if(!keyUsed.has(key)){
            const original = originalKeys[key];
            for(let node of asNodes(original)){
                checkDirectiveRemove(node);
            }
        }
    }

    return finalChildren;
}

function collapseComponentChildren(list : ChildNodeListLike) : NodeOrComponent[] {
    const result : NodeOrComponent[] = [];
    for(let i=0;i<list.length;i++){
        const child = list[i];
        const directive = asShadeDirective(child)
        let end : Node|null = null
        if(directive instanceof ComponentStart){
            i++
            const component : Node[] = [];
            while(i < list.length){
                const subChild = list[i];
                const childAsDirective = asShadeDirective(subChild)
                if(childAsDirective instanceof ComponentEnd && childAsDirective.id == directive.id){
                    end = subChild
                    break
                } else {
                    component.push(subChild);
                }
                i++;
            }
            if(end == null){
                throw Error("Missing end tag for component " + directive.id)
            }
            result.push(new Component(directive, child, component, end));
        } else {
            result.push(child)
        }
    }
    return result;
}

function collectKeysMap(childList : NodeOrComponent[]) : {[key:string] : NodeOrComponent} {
    const keys : {[key:string] : NodeOrComponent} = {};
    for(let i=0;i<childList.length;i++){
        const child = childList[i];
        const key = getKey(child)
        if(key != null){
            keys[key] = child;
        }
    }
    return keys;
}

function getKey(child : NodeOrComponent){
    const target = child instanceof Component ? child.start : child;
    if(target instanceof HTMLElement){
        const key = target.getAttribute(AttributeNames.Key);
        if(key != null){
            return key
        }
    }
    return null
}