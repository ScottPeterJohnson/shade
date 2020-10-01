import {sendIfError, sendMessage} from "./socket";
import {reconcile} from "./reconcile";
import {updateBoundCheckbox, updateBoundInput} from "./bound";
import {SocketScopeNames} from "./constants";

export function evaluateScript(tag : string|undefined, scope : Scope, script : string){
    try {
        scope(script)
    } catch(e){
        sendIfError(e, tag, script.substring(0, 256));
    }
}

type Scope = (script: string)=>void
export function makeEvalScope(scope : Object) : Scope {
    const final = {...baseScope, ...scope}
    const base = []
    for(let key of Object.getOwnPropertyNames(final)){
        base.push(`var ${key}=final.${key};`)
    }
    const baseScript = base.join("\n") + "\n"
    return function (script : string) {
        eval("(function(){\n" + baseScript + script + "\n})()");
    }
}

export const baseScope = {
    [SocketScopeNames.reconcile]:reconcile,
    [SocketScopeNames.updateBoundInput]:updateBoundInput,
    [SocketScopeNames.updateBoundCheckbox]:updateBoundCheckbox,
    [SocketScopeNames.sendMessage]:sendMessage,
    [SocketScopeNames.sendIfError]:sendIfError
}
