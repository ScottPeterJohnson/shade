import {SocketScopeNames} from "./constants";
import {evaluateScript, makeEvalScope} from "./eval";
import {AddedTargetInfo, EventHandler, TargetInfo} from "./directives";

interface EventPrevious {
    eventName: string,
    listener: EventListener
    target: HTMLElement
}

export let suppressEventFiring = {suppress: false};

const eventPrevious = Symbol()
interface HasPrevious extends HTMLElement {
    [eventPrevious]?: EventPrevious
}
export function setupEventHandler(directive : EventHandler, info : AddedTargetInfo){
    removePreviouslyInstalled(info.element)
    const prefix = directive.prefix ? `${directive.prefix};\n` : ""
    const data = directive.data ? `,JSON.stringify(${directive.data})` : ""
    const suffix = directive.suffix ? `;\n${directive.suffix}` : ""
    const script = `${prefix}${SocketScopeNames.sendMessage}(${directive.callbackId}${data})${suffix}`
    const listener : EventListener = function(this : EventListener, e : Event){
        if(suppressEventFiring.suppress){ return }
        const scope = makeEvalScope({
            event: e,
            e: e,
            it: e.target
        })
        evaluateScript(undefined, scope, script)
    }
    info.target.addEventListener(directive.eventName, listener);
    (info.element as HasPrevious)[eventPrevious] = {
        eventName: directive.eventName,
        listener: listener,
        target: info.target
    };
}

export function removeEventHandler(directive : EventHandler, info : TargetInfo){
    removePreviouslyInstalled(info.element)
}

function removePreviouslyInstalled(element : HTMLElement){
    const previous = (element as HasPrevious)[eventPrevious]
    if(previous){
        previous.target.removeEventListener(previous.eventName, previous.listener)
    }
}