export function querySelectorAllPlusTarget(target : Element, selector : string): Element[] {
    const below = target.querySelectorAll(selector)
    if(target.matches(selector)){
        return [target, ...below]
    } else {
        return Array.from(below)
    }
}

export function whenDocumentReady(fn : ()=>void) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        fn()
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
