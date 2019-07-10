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
                    const attribute = dom.attributes[i].name;
                    dom.setAttribute(attribute, other.getAttribute(attribute));
                }
                reconcileChildren(dom, dom.childNodes, other.childNodes);
                return dom;
            }
        }
        else {
            return other;
        }
    }
    function reconcileChildren(dom, domChildren, otherChildren) {
        const origDom = Array.from(domChildren);
        const origOther = Array.from(otherChildren);
        let domIndex = 0;
        let otherIndex = 0;
        while (domIndex < origDom.length || otherIndex < origOther.length) {
            const domChild = origDom[domIndex];
            const otherChild = origOther[otherIndex];
            if (!domChild && otherChild) {
                dom.appendChild(otherChild);
            }
            else if (domChild && !otherChild) {
                dom.removeChild(domChild);
            }
            else {
                if (domChild instanceof HTMLElement &&
                    otherChild instanceof HTMLElement &&
                    domChild.tagName == "script" &&
                    otherChild.tagName == "script" &&
                    domChild.id == otherChild.id &&
                    otherChild.getAttribute("data-shade-keep") != null) {
                    const endId = domChild.id + "-end";
                    while (domIndex < origDom.length) {
                        let skipDom = origDom[domIndex];
                        if (skipDom instanceof HTMLElement && skipDom.tagName == "script" && skipDom.id == endId) {
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
        reconcileChildren(target.parentElement, included, htmlDom.childNodes);
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
                eval(event.data);
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
            const finalMsg = msg ? id + "|" + msg : "" + id;
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
    }
})();
