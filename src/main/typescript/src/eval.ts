import {sendIfError, sendMessage} from "./socket";
import {reconcile} from "./reconcile";
import {updateBoundInput} from "./bound";
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
    const names = Object.getOwnPropertyNames(final)
    const values = names.map((name) => (final as any)[name])
    return function (script : string) {
        const compiled = new Function(...names, "script", script)
        compiled(...values, script)
    }
}

export const baseScope = {
    [SocketScopeNames.reconcile]:reconcile,
    [SocketScopeNames.updateBoundInput]:updateBoundInput,
    [SocketScopeNames.sendMessage]:sendMessage,
    [SocketScopeNames.sendIfError]:sendIfError
}
