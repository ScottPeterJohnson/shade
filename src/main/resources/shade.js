"use strict";
(function () {
    function reconcile(dom, other) {
        if (dom instanceof HTMLElement && other instanceof HTMLElement) {
            if (dom.tagName != other.tagName) {
                return other;
            }
            else {
                for (const attribute in dom.attributes) {
                    if (!other.hasAttribute(attribute)) {
                        dom.removeAttribute(attribute);
                    }
                }
                for (const attribute in other.attributes) {
                    dom.setAttribute(attribute, other.getAttribute(attribute));
                }
                reconcileChildren(dom, other);
                return dom;
            }
        }
        else {
            return other;
        }
    }
    function reconcileChildren(dom, other) {
        const maxChild = Math.max(dom.childNodes.length, other.childNodes.length);
        const origDom = Array.from(dom.childNodes);
        const origOther = Array.from(other.childNodes);
        for (let i = 0; i < maxChild; i++) {
            const domChild = origDom[i];
            const otherChild = origOther[i];
            if (!domChild && otherChild) {
                dom.appendChild(otherChild);
            }
            else if (domChild && !otherChild) {
                dom.removeChild(domChild);
            }
            else {
                const reconciled = reconcile(domChild, otherChild);
                if (reconciled != domChild) {
                    dom.replaceChild(reconciled, domChild);
                }
            }
        }
    }
    function r(targetId, base64) {
        const target = document.getElementById(targetId);
        if (!target) {
            return;
        }
        const html = atob(base64);
        const htmlDom = new DOMParser().parseFromString(html, 'text/html');
        reconcileChildren(target, htmlDom);
    }
    if (!window.shade) {
        let socketReady = false;
        const socketReadyQueue = [];
        let socket;
        function connectSocket() {
            socket = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + window.shadeEndpoint);
            socket.onopen = function () {
                socket.send(window.shadeId);
                socketReady = true;
                while (socketReadyQueue.length > 0) {
                    sendMessage(socketReadyQueue.shift(), null);
                }
            };
            socket.onmessage = function (event) {
                eval(event.data);
            };
            socket.onclose = function (evt) {
                socketReady = false;
                if (evt.wasClean) {
                    connectSocket();
                }
                else {
                    location.reload(true);
                }
            };
            socket.onerror = function (evt) {
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
        window.shade = sendMessage;
    }
})();
