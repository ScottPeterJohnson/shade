(function(){
    function reconcile(original : Node, newer : Node) : Node {
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
                patchChildren(original, null, original.childNodes, newer.childNodes);
                return original;
            }
        } else {
            return newer;
        }
    }
    interface ChildNodeListLike {
        length : number;
        [index: number] : Node
    }


    type NodeOrComponent = (Node|Node[]);
    function collapseComponentChildren(list : ChildNodeListLike, excludeEnds : Boolean) : NodeOrComponent[] {
        const result : NodeOrComponent[] = [];
        for(let i=0;i<list.length;i++){
            const child = list[i];
            if((!excludeEnds || (i>0 && i<list.length-1)) && child instanceof HTMLElement && child.tagName == "SCRIPT" && child.getAttribute("type") === "shade" && child.getAttribute("data-shade-keep") == null){
                const component : Node[] = [];
                const endId = child.id + "e";
                while(i < list.length){
                    const subChild = list[i];
                    component.push(subChild);
                    if(subChild instanceof HTMLElement && subChild.tagName == "SCRIPT" && subChild.id == endId){
                        break
                    }
                    i++;
                }
                result.push(component);
            } else {
                result.push(child)
            }
        }
        return result;
    }
    function collectKeysMap(childList : NodeOrComponent[], excludeEnds : Boolean) : {[key:string] : NodeOrComponent} {
        const keys : {[key:string] : NodeOrComponent} = {};
        for(let i=0;i<childList.length;i++){
            if(excludeEnds && (i===0||i===childList.length-1)){
                continue
            }
            const child = childList[i];
            const target = Array.isArray(child) ? child[0] : child;
            if(target instanceof HTMLElement){
                const key = target.getAttribute("data-key");
                if(key != null){
                    keys[key] = child;
                }
            }
        }
        return keys;
    }

    function patchChildren(
        dom : HTMLElement,
        appendStart : HTMLElement|null,
        domChildren : ChildNodeListLike,
        replacementChildren : ChildNodeListLike
    ){
        const final = reconcileChildren(domChildren, replacementChildren, false);
        const endOfPatchRange = domChildren.length > 0 ? domChildren[domChildren.length-1].nextSibling : null;

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

    function toArray<T>(t : T|T[]) : T[] {
        return Array.isArray(t) ? t : [t];
    }
    function fromArray<T>(t : T|T[]) : T {
        return Array.isArray(t) ? t[0] : t;
    }

    function reconcileChildren(
        domChildren : ChildNodeListLike,
        replacementChildren : ChildNodeListLike,
        excludeEndsFromComponentCollapse : Boolean
    ) : Node[] {
        const originals = collapseComponentChildren(domChildren, excludeEndsFromComponentCollapse);
        const replacements = collapseComponentChildren(replacementChildren, excludeEndsFromComponentCollapse);
        const originalKeys = collectKeysMap(originals, excludeEndsFromComponentCollapse);

        let originalIndex = 0;
        let replacementIndex = 0;

        const finalChildren : Node[] = [];

        while(originalIndex < originals.length || replacementIndex < replacements.length){
            const atCursor = originals[originalIndex];
            const newer = replacements[replacementIndex];
            if(!atCursor && newer){
                finalChildren.push(...toArray(newer));
            } else if (atCursor && !newer) {
                //Implicit remove
            } else {
                const newerFirst = fromArray(newer);

                let original : NodeOrComponent = atCursor;
                let originalFirst = fromArray(original);

                const newerKey = newerFirst instanceof HTMLElement ? newerFirst.getAttribute("data-key") : null;

                if(newerKey != null){
                    if(originalKeys[newerKey]){
                        original = originalKeys[newerKey];
                        originalFirst = fromArray(original);
                    }
                }
                const originalKey = originalFirst instanceof HTMLElement ? originalFirst.getAttribute("data-key") : null;

                let add : Node[];

                if(originalFirst instanceof HTMLElement &&
                    newerFirst instanceof HTMLElement &&
                    originalFirst.tagName == "SCRIPT" &&
                    newerFirst.tagName == "SCRIPT" &&
                    originalFirst.id == newerFirst.id &&
                    newerFirst.getAttribute("data-shade-keep") != null
                ){
                    //Short-circuit with implicit equal
                    add = toArray(original);
                } else {
                    if(originalKey != newerKey){
                        add = toArray(newer);
                    } else {
                        const originalIsComponent = Array.isArray(original);
                        const newerIsComponent = Array.isArray(newer);
                        if(originalIsComponent && newerIsComponent){
                            if(originalFirst instanceof HTMLElement && newerFirst instanceof HTMLElement && originalFirst.id == newerFirst.id){
                                add = reconcileChildren(<Node[]>original, <Node[]>newer, true)
                            } else {
                                add = toArray(newer);
                            }
                        } else if(originalIsComponent != newerIsComponent){
                            add = toArray(newer);
                        } else {
                            add = [reconcile(<Node>original, <Node>newer)]
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

    function r(targetId : number, html : string){
        const target = document.getElementById("shade"+targetId);
        if(!target){ return }
        const htmlDom = document.createElement('div');
        htmlDom.innerHTML = html;

        const included = [];
        let current = target.nextSibling;
        while(current != null && (!(current instanceof HTMLElement) || current.id != "shade" + targetId + "e")){
            included.push(current);
            current = current.nextSibling;
        }


        patchChildren(target.parentElement!!, target, included, htmlDom.childNodes);
        runElementScripts(target.parentElement!!);
    }

    function runElementScripts(base : HTMLElement){
        base.querySelectorAll("[data-shade-element-js]").forEach((value)=>{
            const oldJs : string|undefined = (value as any).shadeElementJs;
            const newJs = value.getAttribute("data-shade-element-js")!;
            if(newJs != oldJs){
                // noinspection JSUnusedLocalSymbols
                const it = value;
                try {
                    eval(newJs);
                    (value as any).shadeElementJs = newJs;
                } catch(e){
                    sendIfError(e, undefined, newJs)
                }
            }
        })
    }

    let socketReady = false;
    const socketReadyQueue : string[] = [];
    let socket : WebSocket;

    function connectSocket(){
        socket = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + ((window as any).shadeHost || window.location.host) + (window as any).shadeEndpoint);
        socket.onopen = function() {
            const id = (window as any).shadeId;
            console.log("Connected with ID " + id);
            localStorage.removeItem("shade_error_reload");
            socket.send(id);
            socketReady = true;
            while (socketReadyQueue.length > 0) {
                sendMessage(socketReadyQueue.shift()!, null);
            }
        };

        socket.onmessage = function(event) {
            const data = (event.data as string);
            const splitIndex = data.indexOf('|');
            const tag = data.substring(0, splitIndex);
            const script = data.substring(splitIndex+1, data.length);
            try {
                eval(script);
            } catch(e){
                sendIfError(e, tag, event.data.substring(0, 256));
            }
        };
        let errorTriggered = false;
        function errorReload(){
            if(errorTriggered){ return; }
            errorTriggered = true;
            const lastReload = localStorage.getItem("shade_error_reload");
            if(lastReload){
                errorDisplay("This web page could not connect to its server. Please reload or try again later.");
                localStorage.removeItem("shade_last_error_reload");
            } else {
                localStorage.setItem("shade_error_reload", "true");
                location.reload(true);
            }
        }
        socket.onclose = function(evt) {
            console.log(`Socket closed: ${evt.reason}, ${evt.wasClean}`);
            socketReady = false;
            if (evt.wasClean){
                //connectSocket()
            } else {
                errorReload();
            }
        };
        socket.onerror = function(evt) {
            console.log(`Socket closed: ${evt}`);
            socketReady = false;
            errorReload();
        };
    }

    function sendMessage(id : string, msg : string|undefined|null) {
        const finalMsg = (msg !== undefined && msg !== null) ? id + "|" + msg : id + "|";
        if (socketReady) {
            socket.send(finalMsg);
        } else {
            socketReadyQueue.push(finalMsg);
        }
    }

    function sendIfError(error : object, tag?: string, evalText ?: string){
        const data = error instanceof Error ? {
            name: error.name,
            jsMessage: error.message,
            stack : error.stack,
            eval: evalText,
            tag: tag
        } : {
            name: "Unknown",
            jsMessage: "Unknown error: " + error,
            stack: "",
            eval: evalText,
            tag: tag
        };
        socket.send(`E${tag == undefined ? "" : tag}|` + JSON.stringify(data));
    }

    function errorDisplay(content : string){
        const container = document.createElement("div");
        container.innerHTML = "<div id='shadeModal' style='position: fixed;z-index: 999999999;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgba(0,0,0,0.4);'><div style='background-color: #fff;margin: 15% auto;padding: 20px;border: 1px solid #888;width: 80%;'><span id='shadeClose' style='float: right;font-size: 28px;font-weight: bold;cursor: pointer;'>&times;</span><p>" + content  + "</p></div></div></div>";
        document.body.appendChild(container);
        document.getElementById("shadeClose")!.addEventListener('click', function(){
            const m = document.getElementById('shadeModal')!;
            m.parentNode!.removeChild(m);
        });
    }

    if(!(window as any).shade){
        if(!window.WebSocket){
            errorDisplay("Your web browser doesn't support this page, and it may not function correctly as a result. Upgrade your web browser.");
            return;
        }
        connectSocket();

        setInterval(()=>{
            if(socketReady){
                socket.send("")
            }
        }, 60*1000);

        (window as any).shade = sendMessage;

        window.addEventListener('error', function(event: ErrorEvent){
            sendIfError(event.error);
        });
        window.addEventListener('unhandledrejection', function(event : PromiseRejectionEvent){
            sendIfError(event.reason);
        });

        window.addEventListener('DOMContentLoaded', function(){
            runElementScripts(document.documentElement);
        });
    }
})();