"use strict";
(function () {
    function reconcile(original, newer) {
        if (original instanceof HTMLElement && newer instanceof HTMLElement) {
            if (original.tagName != newer.tagName) {
                return newer;
            }
            else {
                for (let i = 0; i < original.attributes.length; i++) {
                    const attribute = original.attributes[i].name;
                    if (!newer.hasAttribute(attribute)) {
                        original.removeAttribute(attribute);
                    }
                }
                for (let i = 0; i < newer.attributes.length; i++) {
                    const attribute = newer.attributes[i].name;
                    original.setAttribute(attribute, newer.getAttribute(attribute));
                }
                patchChildren(original, null, original.childNodes, newer.childNodes);
                return original;
            }
        }
        else {
            return newer;
        }
    }
    function collapseComponentChildren(list, excludeEnds) {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const child = list[i];
            if ((!excludeEnds || (i > 0 && i < list.length - 1)) && child instanceof HTMLElement && child.tagName == "SCRIPT" && child.getAttribute("type") === "shade" && child.getAttribute("data-shade-keep") == null) {
                const component = [];
                const endId = child.id + "-end";
                while (i < list.length) {
                    const subChild = list[i];
                    component.push(subChild);
                    if (subChild instanceof HTMLElement && subChild.tagName == "SCRIPT" && subChild.id == endId) {
                        break;
                    }
                    i++;
                }
                result.push(component);
            }
            else {
                result.push(child);
            }
        }
        return result;
    }
    function collectKeysMap(childList, excludeEnds) {
        const keys = {};
        for (let i = 0; i < childList.length; i++) {
            if (excludeEnds && (i === 0 || i === childList.length - 1)) {
                continue;
            }
            const child = childList[i];
            const target = Array.isArray(child) ? child[0] : child;
            if (target instanceof HTMLElement) {
                const key = target.getAttribute("data-key");
                if (key != null) {
                    keys[key] = child;
                }
            }
        }
        return keys;
    }
    function patchChildren(dom, appendStart, domChildren, replacementChildren) {
        const final = reconcileChildren(domChildren, replacementChildren, false);
        const endOfPatchRange = domChildren.length > 0 ? domChildren[domChildren.length - 1].nextSibling : null;
        let current = appendStart ? appendStart : "start";
        function afterCurrent() {
            if (current == "start") {
                return dom.firstChild ? dom.firstChild : "end";
            }
            else if (current == "end") {
                return "end";
            }
            else {
                return current.nextSibling ? current.nextSibling : "end";
            }
        }
        for (const child of final) {
            let next = afterCurrent();
            if (next !== child) {
                dom.insertBefore(child, next === "end" ? null : next);
            }
            current = child;
        }
        current = afterCurrent();
        while (current != "end" && current != endOfPatchRange) {
            const child = current;
            current = afterCurrent();
            dom.removeChild(child);
        }
    }
    function toArray(t) {
        return Array.isArray(t) ? t : [t];
    }
    function fromArray(t) {
        return Array.isArray(t) ? t[0] : t;
    }
    function reconcileChildren(domChildren, replacementChildren, excludeEndsFromComponentCollapse) {
        const originals = collapseComponentChildren(domChildren, excludeEndsFromComponentCollapse);
        const replacements = collapseComponentChildren(replacementChildren, excludeEndsFromComponentCollapse);
        const originalKeys = collectKeysMap(originals, excludeEndsFromComponentCollapse);
        let originalIndex = 0;
        let replacementIndex = 0;
        const finalChildren = [];
        while (originalIndex < originals.length || replacementIndex < replacements.length) {
            const atCursor = originals[originalIndex];
            const newer = replacements[replacementIndex];
            if (!atCursor && newer) {
                finalChildren.push(...toArray(newer));
            }
            else if (atCursor && !newer) {
                //Implicit remove
            }
            else {
                const newerFirst = fromArray(newer);
                let original = atCursor;
                let originalFirst = fromArray(original);
                const newerKey = newerFirst instanceof HTMLElement ? newerFirst.getAttribute("data-key") : null;
                if (newerKey != null) {
                    if (originalKeys[newerKey]) {
                        original = originalKeys[newerKey];
                        originalFirst = fromArray(original);
                    }
                }
                const originalKey = originalFirst instanceof HTMLElement ? originalFirst.getAttribute("data-key") : null;
                let add;
                if (originalFirst instanceof HTMLElement &&
                    newerFirst instanceof HTMLElement &&
                    originalFirst.tagName == "SCRIPT" &&
                    newerFirst.tagName == "SCRIPT" &&
                    originalFirst.id == newerFirst.id &&
                    newerFirst.getAttribute("data-shade-keep") != null) {
                    //Short-circuit with implicit equal
                    add = toArray(original);
                }
                else {
                    if (originalKey != newerKey) {
                        add = toArray(newer);
                    }
                    else {
                        const originalIsComponent = Array.isArray(original);
                        const newerIsComponent = Array.isArray(newer);
                        if (originalIsComponent && newerIsComponent) {
                            if (originalFirst instanceof HTMLElement && newerFirst instanceof HTMLElement && originalFirst.id == newerFirst.id) {
                                add = reconcileChildren(original, newer, true);
                            }
                            else {
                                add = toArray(newer);
                            }
                        }
                        else if (originalIsComponent != newerIsComponent) {
                            add = toArray(newer);
                        }
                        else {
                            add = [reconcile(original, newer)];
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
    function r(targetId, base64) {
        const target = document.getElementById(targetId);
        if (!target) {
            return;
        }
        const html = atob(base64);
        const htmlDom = document.createElement('div');
        htmlDom.innerHTML = html;
        const included = [];
        let current = target.nextSibling;
        while (current != null && (!(current instanceof HTMLElement) || current.id != targetId + "-end")) {
            included.push(current);
            current = current.nextSibling;
        }
        patchChildren(target.parentElement, target, included, htmlDom.childNodes);
    }
    if (!window.shade) {
        let socketReady = false;
        const socketReadyQueue = [];
        let socket;
        function connectSocket() {
            socket = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + window.shadeEndpoint);
            socket.onopen = function () {
                const id = window.shadeId;
                console.log("Connected with ID " + id);
                socket.send(id);
                socketReady = true;
                while (socketReadyQueue.length > 0) {
                    sendMessage(socketReadyQueue.shift(), null);
                }
            };
            socket.onmessage = function (event) {
                const data = event.data;
                const splitIndex = data.indexOf('|');
                const tag = data.substring(0, splitIndex);
                const script = data.substring(splitIndex + 1, data.length);
                try {
                    eval(script);
                }
                catch (e) {
                    sendIfError(e, tag, event.data.substring(0, 256));
                }
            };
            socket.onclose = function (evt) {
                console.log(`Socket closed: ${evt.reason}, ${evt.wasClean}`);
                socketReady = false;
                if (evt.wasClean) {
                    //connectSocket()
                }
                else {
                    location.reload(true);
                }
            };
            socket.onerror = function (evt) {
                console.log(`Socket closed: ${evt}`);
                socketReady = false;
                location.reload(true);
            };
        }
        function sendMessage(id, msg) {
            const finalMsg = (msg !== undefined && msg !== null) ? id + "|" + msg : id + "|";
            if (socketReady) {
                socket.send(finalMsg);
            }
            else {
                socketReadyQueue.push(finalMsg);
            }
        }
        function sendIfError(error, tag, evalText) {
            const data = error instanceof Error ? {
                name: error.name,
                jsMessage: error.message,
                stack: error.stack,
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
        connectSocket();
        setInterval(() => {
            if (socketReady) {
                socket.send("");
            }
        }, 60 * 1000);
        window.shade = sendMessage;
        window.addEventListener('error', function (event) {
            sendIfError(event.error);
        });
        window.addEventListener('unhandledrejection', function (event) {
            sendIfError(event.reason);
        });
    }
})();
