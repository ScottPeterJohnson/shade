//Reconcile a targetId with HTML
import {
    asShadeDirective,
    ComponentEnd,
    ComponentStart,
    determineScriptTarget,
    Keep,
    onAddedOrUpdated,
    onRemoved
} from "./directives";
import {AttributeNames, componentIdPrefix} from "./constants";
import {changingAttributeDirectives, onAttributesSetFromSource} from "./attributes";

export function reconcile(targetId : number, html : string){
    changingAttributeDirectives(()=>{
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
            return newer;
        } else {
            for(let i=0;i<original.attributes.length;i++){
                const attribute = original.attributes[i].name;
                if(!newer.hasAttribute(attribute)){
                    original.removeAttribute(attribute);
                }
            }
            for(let i=0;i<newer.attributes.length;i++){
                const attribute = newer.attributes[i].name;
                original.setAttribute(attribute, newer.getAttribute(attribute)!);
            }
            onAttributesSetFromSource(original);
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
        notifyAddedOrUpdated(child);
        current = child;
    }
    current = afterCurrent();
    while(current != "end" && current != endOfPatchRange){
        const child = current;
        current = afterCurrent();
        notifyRemoved(child);
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

    const keyUsed = new Set<NodeOrComponent>()
    const keyUnused = new Set<NodeOrComponent>()
    while(originalIndex < originals.length || replacementIndex < replacements.length){
        const atCursor = originals[originalIndex];
        const newer = replacements[replacementIndex];
        if(!atCursor && newer){
            finalChildren.push(...(asNodes(newer)));
        } else if (atCursor && !newer) {
            /* Implicit remove */
        } else {
            let original : NodeOrComponent = atCursor;

            const newerKey = getKey(newer);

            if(newerKey != null){
                const originalByKey = originalKeys[newerKey];
                if(originalByKey && original !== originalByKey){
                    keyUsed.add(originalByKey);
                    keyUnused.add(original);
                    original = originalByKey;
                }
            }
            const originalKey = getKey(original)

            let add : Node[] = [];

            const newerDirective = newer instanceof Component ? null : asShadeDirective(newer)
            if(original instanceof Component && newerDirective instanceof Keep && newerDirective.id == original.id()){
                add = asNodes(original);
            } else {
                if(originalKey != newerKey){
                    add = asNodes(newer);
                } else {
                    if(newer instanceof Component){
                        if(original instanceof Component && original.id() == newer.id()){
                            add = [
                                original.start,
                                ...reconcileChildren(dom, original.children, newer.children),
                                original.end
                            ]
                        } else {
                            add = asNodes(newer);
                        }
                    } else if(original instanceof Component){
                        add = asNodes(newer);
                    } else {
                        add = [reconcileNodes(original, newer)]
                    }
                }
            }
            finalChildren.push(...add);
        }
        originalIndex += 1;
        replacementIndex += 1;
    }
    return finalChildren;
}

function notifyAddedOrUpdated(node: Node){
    for(let child of node.childNodes){
        notifyAddedOrUpdated(child);
    }
    if(node instanceof HTMLElement){
        const directive = asShadeDirective(node)
        if(directive){
            onAddedOrUpdated({
                element: node,
                directive
            });
        }
    }
}
function notifyRemoved(node : Node){
    for(let child of node.childNodes){
        notifyRemoved(child);
    }
    const directive = asShadeDirective(node);
    if(node instanceof HTMLElement && directive){
        const target = determineScriptTarget(node)
        if(target){
            onRemoved({
                element: node,
                directive
            });
        }
    }
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