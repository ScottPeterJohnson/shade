import {evaluateScript, makeEvalScope} from "./eval";
import {AddedTargetInfo, ApplyJs} from "./directives";

interface ScriptPrevious {
    js : string
    target : HTMLElement
}
const scriptPrevious = Symbol()
interface HasScriptPrevious extends HTMLElement {
    [scriptPrevious]? : ScriptPrevious
}

export function runElementScript(directive : ApplyJs, info : AddedTargetInfo){
    const old = (info.element as HasScriptPrevious)[scriptPrevious]
    if(!directive.onlyOnCreate || !old || old.js != directive.js || old.target != info.target){
        (info.element as HasScriptPrevious)[scriptPrevious] = {
            js: directive.js,
            target: info.target
        };
        const it = info.target;
        const scope = makeEvalScope({
            it
        })
        evaluateScript(undefined, scope, directive.js)
    }
}