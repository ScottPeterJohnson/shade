"use strict";
(function () {
    function reconcile(dom, other) {
        if (dom instanceof HTMLElement && other instanceof HTMLElement) {
            if (dom.tagName != other.tagName) {
                return other;
            }
            else {
                for (let i = 0; i < dom.attributes.length; i++) {
                    const attribute = dom.attributes[i].name;
                    if (!other.hasAttribute(attribute)) {
                        dom.removeAttribute(attribute);
                    }
                }
                for (let i = 0; i < other.attributes.length; i++) {
                    const attribute = other.attributes[i].name;
                    dom.setAttribute(attribute, other.getAttribute(attribute));
                }
                reconcileChildren(dom, null, dom.childNodes, other.childNodes);
                return dom;
            }
        }
        else {
            return other;
        }
    }
    function reconcileChildren(dom, initialAppendAfter, domChildren, otherChildren) {
        const origDom = Array.from(domChildren);
        const origOther = Array.from(otherChildren);
        let domIndex = 0;
        let otherIndex = 0;
        let domAppendAfter = initialAppendAfter;
        while (domIndex < origDom.length || otherIndex < origOther.length) {
            const domChild = origDom[domIndex];
            const otherChild = origOther[otherIndex];
            if (!domChild && otherChild) {
                if (domAppendAfter === null) {
                    dom.appendChild(otherChild);
                }
                else {
                    dom.insertBefore(otherChild, domAppendAfter.nextSibling);
                }
                domAppendAfter = otherChild;
            }
            else if (domChild && !otherChild) {
                dom.removeChild(domChild);
            }
            else {
                if (domChild instanceof HTMLElement &&
                    otherChild instanceof HTMLElement &&
                    domChild.tagName == "SCRIPT" &&
                    otherChild.tagName == "SCRIPT" &&
                    domChild.id == otherChild.id &&
                    otherChild.getAttribute("data-shade-keep") != null) {
                    const endId = domChild.id + "-end";
                    while (domIndex < origDom.length) {
                        let skipDom = origDom[domIndex];
                        if (skipDom instanceof HTMLElement && skipDom.tagName == "SCRIPT" && skipDom.id == endId) {
                            domAppendAfter = skipDom;
                            break;
                        }
                        domIndex += 1;
                    }
                }
                else {
                    const reconciled = reconcile(domChild, otherChild);
                    if (reconciled != domChild) {
                        dom.replaceChild(reconciled, domChild);
                    }
                    domAppendAfter = reconciled;
                }
            }
            domIndex += 1;
            otherIndex += 1;
        }
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
        reconcileChildren(target.parentElement, target, included, htmlDom.childNodes);
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
                    socket.send(`E${tag}|` + JSON.stringify({
                        eval: event.data.substring(0, 256),
                        name: e.name,
                        jsMessage: e.message,
                        stack: e.stack
                    }));
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
            const finalMsg = msg ? id + "|" + msg : id + "|";
            if (socketReady) {
                socket.send(finalMsg);
            }
            else {
                socketReadyQueue.push(finalMsg);
            }
        }
        connectSocket();
        setInterval(() => {
            if (socketReady) {
                socket.send("");
            }
        }, 60 * 1000);
        window.shade = sendMessage;
        window.addEventListener('error', function (event) {
            const error = event.error;
            if (error && error instanceof Error) {
                socket.send(`E|` + JSON.stringify({
                    name: error.name,
                    jsMessage: error.message,
                    stack: error.stack
                }));
            }
        });
    }
})();
