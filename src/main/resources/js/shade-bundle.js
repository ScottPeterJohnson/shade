/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/applyjs.ts":
/*!************************!*\
  !*** ./src/applyjs.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "runElementScript": () => (/* binding */ runElementScript)
/* harmony export */ });
/* harmony import */ var _eval__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./eval */ "./src/eval.ts");

const scriptPrevious = Symbol();
function runElementScript(directive, info) {
    const old = info.element[scriptPrevious];
    if (!directive.onlyOnCreate || !old || old.js != directive.js || old.target != info.target) {
        info.element[scriptPrevious] = {
            js: directive.js,
            target: info.target
        };
        const it = info.target;
        const scope = (0,_eval__WEBPACK_IMPORTED_MODULE_0__.makeEvalScope)({
            it
        });
        (0,_eval__WEBPACK_IMPORTED_MODULE_0__.evaluateScript)(undefined, scope, directive.js);
    }
}


/***/ }),

/***/ "./src/attributes.ts":
/*!***************************!*\
  !*** ./src/attributes.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "applyAttributeValue": () => (/* binding */ applyAttributeValue),
/* harmony export */   "changingAttributeDirectives": () => (/* binding */ changingAttributeDirectives),
/* harmony export */   "noteAttributeDirectiveChange": () => (/* binding */ noteAttributeDirectiveChange),
/* harmony export */   "noteAttributeDirectiveRemove": () => (/* binding */ noteAttributeDirectiveRemove),
/* harmony export */   "onAttributesSetFromSource": () => (/* binding */ onAttributesSetFromSource)
/* harmony export */ });
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./directives */ "./src/directives.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./events */ "./src/events.ts");



//We need some way of storing the original values of an attribute before an attribute directive was applied,
//in case that directive is removed in an update that does not reset an element's attributes.
const attributeOriginalValues = Symbol();
function onAttributesSetFromSource(element) {
    const originalMap = element[attributeOriginalValues];
    if (originalMap) {
        delete element[attributeOriginalValues];
        targetsWithChangedAttributeDirectives.add(element);
    }
}
function noteOriginalAttribute(element, name) {
    let originals = element[attributeOriginalValues];
    if (!originals) {
        originals = element[attributeOriginalValues] = {};
    }
    if (!(name in originals)) {
        originals[name] = element.getAttribute(name);
    }
}
const isSetAttributeDirective = `[${_constants__WEBPACK_IMPORTED_MODULE_1__.AttributeNames.DirectiveType}=${_constants__WEBPACK_IMPORTED_MODULE_1__.DirectiveType.SetAttribute}]`;
const baseQueryIsSetAttributeDirective = `script[type=${_constants__WEBPACK_IMPORTED_MODULE_1__.scriptTypeSignifier}]${isSetAttributeDirective}`;
function updateAttributeDirectives(target) {
    //First, find all SetAttribute directives that apply to target
    const applicable = Array.from(target.querySelectorAll(baseQueryIsSetAttributeDirective));
    let current = target;
    while (true) {
        current = current.nextElementSibling;
        if (!current || !current.matches(`script[type=${_constants__WEBPACK_IMPORTED_MODULE_1__.scriptTypeSignifier}][${_constants__WEBPACK_IMPORTED_MODULE_1__.AttributeNames.TargetSiblingDirective}]`)) {
            break;
        }
        applicable.push(current);
    }
    //Next, group them by the attribute they apply to
    const byAttributeName = {};
    for (let el of applicable) {
        const asDirective = (0,_directives__WEBPACK_IMPORTED_MODULE_0__.asShadeDirective)(el);
        if (asDirective && asDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__.SetAttribute) {
            let array = byAttributeName[asDirective.name];
            if (!array) {
                array = byAttributeName[asDirective.name] = [];
            }
            array.push(asDirective);
        }
    }
    //Now, apply only the last directive for every attribute
    for (let attribute of Object.getOwnPropertyNames(byAttributeName)) {
        const directives = byAttributeName[attribute];
        const last = directives[directives.length - 1];
        noteOriginalAttribute(target, last.name);
        applyAttributeValue(target, last.name, last.value);
    }
    //Finally, restore the original values for any attributes that no longer have directives
    const originals = target[attributeOriginalValues] || {};
    for (let original of Object.getOwnPropertyNames(originals)) {
        if (!byAttributeName[original]) {
            applyAttributeValue(target, original, originals[original]);
            delete originals[original];
        }
    }
}
let targetsWithChangedAttributeDirectives = new Set();
function changingAttributeDirectives(cb) {
    try {
        cb();
    }
    finally {
        for (let target of targetsWithChangedAttributeDirectives) {
            updateAttributeDirectives(target);
        }
        targetsWithChangedAttributeDirectives = new Set();
    }
}
const setAttributeTarget = Symbol();
function noteAttributeDirectiveChange(info) {
    targetsWithChangedAttributeDirectives.add(info.target);
    info.element[setAttributeTarget] = info.target;
}
function noteAttributeDirectiveRemove(element) {
    const target = element[setAttributeTarget];
    if (target) {
        targetsWithChangedAttributeDirectives.add(target);
    }
}
function applyAttributeValue(target, name, value) {
    if (value == null) {
        target.removeAttribute(name);
    }
    else {
        target.setAttribute(name, value);
    }
    if (target instanceof HTMLInputElement && (name == "value" || name == "checked")) {
        //These special values have effects only on the "initial" insertion of a DOM object;
        //for consistency we always apply these effects
        if (name == "value" && target.value != value) {
            suppressChangeListeners(target, () => {
                target.value = value !== null && value !== void 0 ? value : "";
            });
        }
        else if (name == "checked" && target.checked != (value != null)) {
            suppressChangeListeners(target, () => {
                target.checked = value != null;
            });
        }
    }
}
function suppressChangeListeners(target, cb) {
    _events__WEBPACK_IMPORTED_MODULE_2__.suppressEventFiring.suppress = true;
    const oldOnChange = target.onchange;
    target.onchange = null;
    try {
        cb();
    }
    finally {
        target.onchange = oldOnChange;
        _events__WEBPACK_IMPORTED_MODULE_2__.suppressEventFiring.suppress = false;
    }
}


/***/ }),

/***/ "./src/bound.ts":
/*!**********************!*\
  !*** ./src/bound.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "updateBoundInput": () => (/* binding */ updateBoundInput)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");

function updateBoundInput(boundId, serverSeen, value, setter) {
    var _a;
    const input = document.querySelector("[" + _constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.Bound + "=\"" + boundId + "\"]");
    if (!input) {
        return;
    }
    //boundSeen is NaN if an event handler incremented it before this first server update arrived; there's
    //no confirmed baseline in that case, so accept the server value (its echo of the event will follow).
    const seen = (_a = input.boundSeen) !== null && _a !== void 0 ? _a : (input.boundSeen = 0);
    if (isNaN(seen) || seen <= serverSeen) {
        setter(input, value);
    }
}


/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AttributeNames": () => (/* binding */ AttributeNames),
/* harmony export */   "DirectiveType": () => (/* binding */ DirectiveType),
/* harmony export */   "SocketScopeNames": () => (/* binding */ SocketScopeNames),
/* harmony export */   "componentIdEndSuffix": () => (/* binding */ componentIdEndSuffix),
/* harmony export */   "componentIdPrefix": () => (/* binding */ componentIdPrefix),
/* harmony export */   "messageTagErrorPrefix": () => (/* binding */ messageTagErrorPrefix),
/* harmony export */   "messageTagSeparator": () => (/* binding */ messageTagSeparator),
/* harmony export */   "scriptTypeSignifier": () => (/* binding */ scriptTypeSignifier)
/* harmony export */ });
//Changes here should be mirrored in ClientConstants.kt
var DirectiveType;
(function (DirectiveType) {
    DirectiveType["ApplyJs"] = "j";
    DirectiveType["SetAttribute"] = "a";
    DirectiveType["EventHandler"] = "e";
    DirectiveType["ComponentStart"] = "s";
    DirectiveType["ComponentEnd"] = "f";
    DirectiveType["ComponentKeep"] = "k";
})(DirectiveType || (DirectiveType = {}));
var AttributeNames;
(function (AttributeNames) {
    AttributeNames["DirectiveType"] = "data-s";
    AttributeNames["TargetSiblingDirective"] = "data-f";
    AttributeNames["ApplyJsScript"] = "data-t";
    AttributeNames["ApplyJsRunOption"] = "data-r";
    AttributeNames["SetAttributeName"] = "data-a";
    AttributeNames["SetAttributeValue"] = "data-v";
    AttributeNames["Key"] = "data-k";
    AttributeNames["EventName"] = "data-e";
    AttributeNames["EventCallbackId"] = "data-i";
    AttributeNames["EventPrefix"] = "data-p";
    AttributeNames["EventSuffix"] = "data-x";
    AttributeNames["EventData"] = "data-d";
    AttributeNames["Bound"] = "data-b";
    AttributeNames["Checkbox"] = "data-c";
})(AttributeNames || (AttributeNames = {}));
const scriptTypeSignifier = "shade";
const componentIdPrefix = "shade";
const componentIdEndSuffix = "e";
const messageTagSeparator = "|";
const messageTagErrorPrefix = "E";
var SocketScopeNames;
(function (SocketScopeNames) {
    SocketScopeNames["reconcile"] = "r";
    SocketScopeNames["updateBoundInput"] = "b";
    SocketScopeNames["sendMessage"] = "s";
    SocketScopeNames["sendIfError"] = "q";
})(SocketScopeNames || (SocketScopeNames = {}));


/***/ }),

/***/ "./src/directives.ts":
/*!***************************!*\
  !*** ./src/directives.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ApplyJs": () => (/* binding */ ApplyJs),
/* harmony export */   "ComponentEnd": () => (/* binding */ ComponentEnd),
/* harmony export */   "ComponentStart": () => (/* binding */ ComponentStart),
/* harmony export */   "EventHandler": () => (/* binding */ EventHandler),
/* harmony export */   "Keep": () => (/* binding */ Keep),
/* harmony export */   "SetAttribute": () => (/* binding */ SetAttribute),
/* harmony export */   "addAllDirectives": () => (/* binding */ addAllDirectives),
/* harmony export */   "asShadeDirective": () => (/* binding */ asShadeDirective),
/* harmony export */   "changingDirectives": () => (/* binding */ changingDirectives),
/* harmony export */   "checkDirectiveAdd": () => (/* binding */ checkDirectiveAdd),
/* harmony export */   "checkDirectiveChange": () => (/* binding */ checkDirectiveChange),
/* harmony export */   "checkDirectiveRemove": () => (/* binding */ checkDirectiveRemove),
/* harmony export */   "determineScriptTarget": () => (/* binding */ determineScriptTarget)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utility */ "./src/utility.ts");
/* harmony import */ var _attributes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./attributes */ "./src/attributes.ts");
/* harmony import */ var _applyjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./applyjs */ "./src/applyjs.ts");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./events */ "./src/events.ts");





class ComponentStart {
    constructor(id) {
        this.id = id;
    }
}
class ComponentEnd {
    constructor(id) {
        this.id = id;
    }
}
class Keep {
    constructor(id) {
        this.id = id;
    }
}
class SetAttribute {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
class ApplyJs {
    constructor(js, onlyOnCreate) {
        this.js = js;
        this.onlyOnCreate = onlyOnCreate;
    }
}
class EventHandler {
    constructor(eventName, callbackId, prefix, suffix, data) {
        this.eventName = eventName;
        this.callbackId = callbackId;
        this.prefix = prefix;
        this.suffix = suffix;
        this.data = data;
    }
}
function asShadeDirective(child) {
    if (child instanceof HTMLElement && child.tagName == "SCRIPT" && child.getAttribute("type") === _constants__WEBPACK_IMPORTED_MODULE_0__.scriptTypeSignifier) {
        const directiveType = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.DirectiveType);
        const id = child.id;
        switch (directiveType) {
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.ApplyJs:
                const runOption = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.ApplyJsRunOption);
                const script = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.ApplyJsScript);
                return new ApplyJs(script, runOption === "1");
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.ComponentStart:
                return new ComponentStart(id.substring(_constants__WEBPACK_IMPORTED_MODULE_0__.componentIdPrefix.length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.ComponentEnd:
                return new ComponentEnd(id.substring(_constants__WEBPACK_IMPORTED_MODULE_0__.componentIdPrefix.length, id.length - _constants__WEBPACK_IMPORTED_MODULE_0__.componentIdEndSuffix.length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.ComponentKeep:
                return new Keep(id.substring(_constants__WEBPACK_IMPORTED_MODULE_0__.componentIdPrefix.length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.SetAttribute: {
                const name = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.SetAttributeName);
                const value = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.SetAttributeValue);
                return new SetAttribute(name, value);
            }
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.EventHandler: {
                const name = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.EventName);
                const id = +child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.EventCallbackId);
                const prefix = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.EventPrefix);
                const suffix = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.EventSuffix);
                const data = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.EventData);
                return new EventHandler(name, id, prefix, suffix, data);
            }
        }
    }
    return null;
}
function addAllDirectives(base) {
    changingDirectives(() => {
        checkDirectiveAdd(base);
    });
}
function determineScriptTarget(script) {
    if (script.hasAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.TargetSiblingDirective)) {
        let target = script;
        while (target && target.hasAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.TargetSiblingDirective)) {
            target = target.previousElementSibling;
        }
        return target;
    }
    else {
        return script.parentElement;
    }
}
let changedDirectives = [];
let removedDirectives = [];
function changingDirectives(cb) {
    (0,_attributes__WEBPACK_IMPORTED_MODULE_2__.changingAttributeDirectives)(() => {
        try {
            cb();
        }
        finally {
            for (let changed of changedDirectives) {
                onAddedOrUpdated(changed);
            }
            for (let removed of removedDirectives) {
                onRemoved(removed);
            }
            changedDirectives = [];
            removedDirectives = [];
        }
    });
}
/**
 * Checks an element and all its children that have just been added for shade directives
 */
function checkDirectiveAdd(element) {
    if (element instanceof HTMLElement) {
        for (let script of (0,_utility__WEBPACK_IMPORTED_MODULE_1__.querySelectorAllPlusTarget)(element, `script[type=${_constants__WEBPACK_IMPORTED_MODULE_0__.scriptTypeSignifier}]`)) {
            const directive = asShadeDirective(script);
            if (script instanceof HTMLElement && directive) {
                changedDirectives.push({ directive, element: script });
            }
        }
    }
}
/**
 * Checks and records whether an element that changed is a script directive
 */
function checkDirectiveChange(element) {
    const directive = asShadeDirective(element);
    if (directive) {
        changedDirectives.push({ directive, element });
    }
}
/**
 * Checks an element and all its children that have just been removed for shade directives
 */
function checkDirectiveRemove(element) {
    if (element instanceof HTMLElement) {
        for (let script of (0,_utility__WEBPACK_IMPORTED_MODULE_1__.querySelectorAllPlusTarget)(element, `script[type=${_constants__WEBPACK_IMPORTED_MODULE_0__.scriptTypeSignifier}]`)) {
            const directive = asShadeDirective(script);
            if (script instanceof HTMLElement && directive) {
                removedDirectives.push({ directive, element: script });
            }
        }
    }
}
/**
 * Called after the directive contained in element is added to target.
 */
function onAddedOrUpdated(info) {
    const target = determineScriptTarget(info.element);
    if (target) {
        const directive = info.directive;
        const addInfo = Object.assign(Object.assign({}, info), { target });
        if (directive instanceof SetAttribute) {
            (0,_attributes__WEBPACK_IMPORTED_MODULE_2__.noteAttributeDirectiveChange)(addInfo);
        }
        else if (directive instanceof ApplyJs) {
            (0,_applyjs__WEBPACK_IMPORTED_MODULE_3__.runElementScript)(directive, addInfo);
        }
        else if (directive instanceof EventHandler) {
            (0,_events__WEBPACK_IMPORTED_MODULE_4__.setupEventHandler)(directive, addInfo);
        }
    }
    else {
        console.error(`Unknown target for ${info.element.outerHTML}`);
    }
}
function onRemoved(info) {
    const directive = info.directive;
    if (directive instanceof SetAttribute) {
        (0,_attributes__WEBPACK_IMPORTED_MODULE_2__.noteAttributeDirectiveRemove)(info.element);
    }
    if (directive instanceof EventHandler) {
        (0,_events__WEBPACK_IMPORTED_MODULE_4__.removeEventHandler)(directive, info);
    }
}


/***/ }),

/***/ "./src/errors.ts":
/*!***********************!*\
  !*** ./src/errors.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "errorDisplay": () => (/* binding */ errorDisplay)
/* harmony export */ });
function errorDisplay(content) {
    const container = document.createElement("div");
    container.innerHTML = "<div id='shadeModal' style='position: fixed;z-index: 999999999;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgba(0,0,0,0.4);'><div style='background-color: #fff;margin: 15% auto;padding: 20px;border: 1px solid #888;width: 80%;'><span id='shadeClose' style='float: right;font-size: 28px;font-weight: bold;cursor: pointer;'>&times;</span><p>" + content + "</p></div></div></div>";
    document.body.appendChild(container);
    document.getElementById("shadeClose").addEventListener('click', function () {
        const m = document.getElementById('shadeModal');
        m.parentNode.removeChild(m);
    });
}


/***/ }),

/***/ "./src/eval.ts":
/*!*********************!*\
  !*** ./src/eval.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "baseScope": () => (/* binding */ baseScope),
/* harmony export */   "evaluateScript": () => (/* binding */ evaluateScript),
/* harmony export */   "makeEvalScope": () => (/* binding */ makeEvalScope)
/* harmony export */ });
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket */ "./src/socket.ts");
/* harmony import */ var _reconcile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reconcile */ "./src/reconcile.ts");
/* harmony import */ var _bound__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bound */ "./src/bound.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");




function evaluateScript(tag, scope, script) {
    try {
        scope(script);
    }
    catch (e) {
        (0,_socket__WEBPACK_IMPORTED_MODULE_0__.sendIfError)(e, tag, script.substring(0, 256));
    }
}
function makeEvalScope(scope) {
    //Server-generated scripts see the scope entries as named parameters, plus "script" (the text of the
    //script itself), which error-reporting templates reference. new Function compiles against the global
    //scope, so nothing here depends on local identifiers surviving minification.
    const final = Object.assign(Object.assign({}, baseScope), scope);
    const names = Object.getOwnPropertyNames(final);
    const values = names.map((name) => final[name]);
    return function (script) {
        const compiled = new Function(...names, "script", script);
        compiled(...values, script);
    };
}
const baseScope = {
    [_constants__WEBPACK_IMPORTED_MODULE_3__.SocketScopeNames.reconcile]: _reconcile__WEBPACK_IMPORTED_MODULE_1__.reconcile,
    [_constants__WEBPACK_IMPORTED_MODULE_3__.SocketScopeNames.updateBoundInput]: _bound__WEBPACK_IMPORTED_MODULE_2__.updateBoundInput,
    [_constants__WEBPACK_IMPORTED_MODULE_3__.SocketScopeNames.sendMessage]: _socket__WEBPACK_IMPORTED_MODULE_0__.sendMessage,
    [_constants__WEBPACK_IMPORTED_MODULE_3__.SocketScopeNames.sendIfError]: _socket__WEBPACK_IMPORTED_MODULE_0__.sendIfError
};


/***/ }),

/***/ "./src/events.ts":
/*!***********************!*\
  !*** ./src/events.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeEventHandler": () => (/* binding */ removeEventHandler),
/* harmony export */   "setupEventHandler": () => (/* binding */ setupEventHandler),
/* harmony export */   "suppressEventFiring": () => (/* binding */ suppressEventFiring)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _eval__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./eval */ "./src/eval.ts");


let suppressEventFiring = { suppress: false };
const eventPrevious = Symbol();
function setupEventHandler(directive, info) {
    removePreviouslyInstalled(info.element);
    const prefix = directive.prefix ? `${directive.prefix};\n` : "";
    const data = directive.data ? `,JSON.stringify(${directive.data})` : "";
    const suffix = directive.suffix ? `;\n${directive.suffix}` : "";
    const script = `${prefix}${_constants__WEBPACK_IMPORTED_MODULE_0__.SocketScopeNames.sendMessage}(${directive.callbackId}${data})${suffix}`;
    const listener = function (e) {
        if (suppressEventFiring.suppress) {
            return;
        }
        const scope = (0,_eval__WEBPACK_IMPORTED_MODULE_1__.makeEvalScope)({
            event: e,
            e: e,
            it: e.target
        });
        (0,_eval__WEBPACK_IMPORTED_MODULE_1__.evaluateScript)(undefined, scope, script);
    };
    info.target.addEventListener(directive.eventName, listener);
    info.element[eventPrevious] = {
        eventName: directive.eventName,
        listener: listener,
        target: info.target
    };
}
function removeEventHandler(directive, info) {
    removePreviouslyInstalled(info.element);
}
function removePreviouslyInstalled(element) {
    const previous = element[eventPrevious];
    if (previous) {
        previous.target.removeEventListener(previous.eventName, previous.listener);
    }
}


/***/ }),

/***/ "./src/reconcile.ts":
/*!**************************!*\
  !*** ./src/reconcile.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "reconcile": () => (/* binding */ reconcile)
/* harmony export */ });
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./directives */ "./src/directives.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _attributes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./attributes */ "./src/attributes.ts");
//Reconcile a targetId with HTML



function reconcile(targetId, html) {
    (0,_directives__WEBPACK_IMPORTED_MODULE_0__.changingDirectives)(() => {
        const target = document.getElementById(_constants__WEBPACK_IMPORTED_MODULE_1__.componentIdPrefix + targetId);
        if (!target) {
            return;
        }
        const parent = target.parentElement;
        const htmlDom = document.createElement(parent.tagName);
        htmlDom.innerHTML = html;
        const included = [];
        let current = target.nextSibling;
        while (current != null) {
            const currentDirective = (0,_directives__WEBPACK_IMPORTED_MODULE_0__.asShadeDirective)(current);
            if (currentDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__.ComponentEnd && currentDirective.id == "" + targetId) {
                break;
            }
            included.push(current);
            current = current.nextSibling;
        }
        patchChildren(parent, target, included, htmlDom.childNodes);
    });
}
class Component {
    constructor(startDirective, start, children, end) {
        this.startDirective = startDirective;
        this.start = start;
        this.children = children;
        this.end = end;
    }
    asNodes() {
        return [this.start, ...this.children, this.end];
    }
    id() {
        return this.startDirective.id;
    }
}
function asNodes(target) {
    return target instanceof Component ? target.asNodes() : [target];
}
function reconcileNodes(original, newer) {
    if (original instanceof HTMLElement && newer instanceof HTMLElement) {
        if (original.tagName != newer.tagName) {
            (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveAdd)(newer);
            (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveRemove)(original);
            return newer;
        }
        else {
            let changed = false;
            for (let i = 0; i < original.attributes.length; i++) {
                const attribute = original.attributes[i].name;
                if (!newer.hasAttribute(attribute)) {
                    (0,_attributes__WEBPACK_IMPORTED_MODULE_2__.applyAttributeValue)(original, attribute, null);
                    changed = true;
                }
            }
            for (let i = 0; i < newer.attributes.length; i++) {
                const attribute = newer.attributes[i].name;
                const olderAttr = original.getAttribute(attribute);
                const newerAttr = newer.getAttribute(attribute);
                if (olderAttr != newerAttr) {
                    (0,_attributes__WEBPACK_IMPORTED_MODULE_2__.applyAttributeValue)(original, attribute, newerAttr);
                    changed = true;
                }
            }
            if (changed) {
                (0,_attributes__WEBPACK_IMPORTED_MODULE_2__.onAttributesSetFromSource)(original);
                (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveChange)(original);
            }
            patchChildren(original, null, original.childNodes, newer.childNodes);
            return original;
        }
    }
    else if (original instanceof Text && newer instanceof Text) {
        if (original.textContent == newer.textContent) {
            return original;
        }
        else {
            return newer;
        }
    }
    else {
        return newer;
    }
}
function patchChildren(dom, appendStart, domChildren, replacementChildren) {
    const final = reconcileChildren(dom, domChildren, replacementChildren);
    let endOfPatchRange;
    if (domChildren.length > 0) {
        endOfPatchRange = domChildren[domChildren.length - 1].nextSibling;
    }
    else if (appendStart) {
        endOfPatchRange = appendStart.nextSibling;
    }
    else {
        endOfPatchRange = null;
    }
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
function reconcileChildren(dom, domChildren, replacementChildren) {
    var _a;
    const originals = collapseComponentChildren(domChildren);
    const replacements = collapseComponentChildren(replacementChildren);
    const originalKeys = collectKeysMap(originals);
    let originalIndex = 0;
    let replacementIndex = 0;
    const finalChildren = [];
    while (originalIndex < originals.length || replacementIndex < replacements.length) {
        let original = originals[originalIndex];
        const newer = replacements[replacementIndex];
        if (original && !newer) {
            /* Implicit remove */
            for (let node of asNodes(original)) {
                (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveRemove)(node);
            }
            originalIndex += 1;
        }
        else if (original instanceof Text) {
            //Text nodes have no interesting identity or children to preserve, and the
            //Kotlin side can't track them for position matching, so we just skip over them
            //in comparisons and add the newer text always.
            originalIndex += 1;
        }
        else if (newer instanceof Text) {
            finalChildren.push(newer);
            replacementIndex += 1;
        }
        else {
            //The server does not track the position of most directives, except keep, so they are specially handled
            //for matching
            const newerDirective = newer instanceof Component ? null : (0,_directives__WEBPACK_IMPORTED_MODULE_0__.asShadeDirective)(newer);
            const originalIsDirective = original instanceof Node && (0,_directives__WEBPACK_IMPORTED_MODULE_0__.asShadeDirective)(original) != null;
            if (newer instanceof Node && newerDirective != null && !(newerDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__.Keep)) {
                if (originalIsDirective) {
                    finalChildren.push(reconcileNodes(original, newer));
                    originalIndex += 1;
                }
                else {
                    finalChildren.push(newer);
                    (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveAdd)(newer);
                }
                replacementIndex += 1;
                continue;
            }
            else if (originalIsDirective) {
                (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveRemove)(original);
                originalIndex += 1;
                continue;
            }
            const newerKey = getKey(newer);
            if (newerKey != null) {
                //We'll directly match to the original by key, ignoring what's usually at this position
                original = (_a = originalKeys[newerKey]) === null || _a === void 0 ? void 0 : _a.pop();
            }
            let add = [];
            function useNewer() {
                add = asNodes(newer);
                for (let node of add) {
                    (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveAdd)(node);
                }
                if (original) {
                    for (let node of asNodes(original)) {
                        (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveRemove)(node);
                    }
                }
            }
            if (original && original instanceof Component && newerDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__.Keep && (newerDirective.id == original.id() || newerKey)) {
                add = asNodes(original);
            }
            else {
                if (!original) {
                    useNewer();
                }
                else {
                    if (newer instanceof Component) {
                        if (original instanceof Component && original.id() == newer.id()) {
                            add = [
                                original.start,
                                ...reconcileChildren(dom, original.children, newer.children),
                                original.end
                            ];
                        }
                        else {
                            useNewer();
                        }
                    }
                    else if (original instanceof Component) {
                        useNewer();
                    }
                    else {
                        add = [reconcileNodes(original, newer)];
                    }
                }
            }
            finalChildren.push(...add);
            originalIndex += 1;
            replacementIndex += 1;
        }
    }
    //All remaining keys in the map will not have been used.
    for (const key of Object.getOwnPropertyNames(originalKeys)) {
        const originals = originalKeys[key];
        for (let original of originals) {
            for (let node of asNodes(original)) {
                (0,_directives__WEBPACK_IMPORTED_MODULE_0__.checkDirectiveRemove)(node);
            }
        }
    }
    return finalChildren;
}
function collapseComponentChildren(list) {
    const result = [];
    for (let i = 0; i < list.length; i++) {
        const child = list[i];
        const directive = (0,_directives__WEBPACK_IMPORTED_MODULE_0__.asShadeDirective)(child);
        let end = null;
        if (directive instanceof _directives__WEBPACK_IMPORTED_MODULE_0__.ComponentStart) {
            i++;
            const component = [];
            while (i < list.length) {
                const subChild = list[i];
                const childAsDirective = (0,_directives__WEBPACK_IMPORTED_MODULE_0__.asShadeDirective)(subChild);
                if (childAsDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__.ComponentEnd && childAsDirective.id == directive.id) {
                    end = subChild;
                    break;
                }
                else {
                    component.push(subChild);
                }
                i++;
            }
            if (end == null) {
                throw Error("Missing end tag for component " + directive.id);
            }
            result.push(new Component(directive, child, component, end));
        }
        else {
            result.push(child);
        }
    }
    return result;
}
function collectKeysMap(childList) {
    const keys = {};
    for (let i = 0; i < childList.length; i++) {
        const child = childList[i];
        const key = getKey(child);
        if (key != null) {
            let list = keys[key];
            if (!list) {
                list = keys[key] = [];
            }
            list.push(child);
        }
    }
    return keys;
}
function getKey(child) {
    const target = child instanceof Component ? child.start : child;
    if (target instanceof HTMLElement) {
        const key = target.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_1__.AttributeNames.Key);
        if (key != null) {
            return key;
        }
    }
    return null;
}


/***/ }),

/***/ "./src/socket.ts":
/*!***********************!*\
  !*** ./src/socket.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "connectSocket": () => (/* binding */ connectSocket),
/* harmony export */   "sendIfError": () => (/* binding */ sendIfError),
/* harmony export */   "sendMessage": () => (/* binding */ sendMessage)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors */ "./src/errors.ts");
/* harmony import */ var _eval__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./eval */ "./src/eval.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utility */ "./src/utility.ts");




let socketReady = false;
const socketReadyQueue = [];
let socket;
function connectSocket() {
    const url = new URL(window.shadeEndpoint, window.location.href);
    if (window.shadeHost) {
        url.host = window.shadeHost;
    }
    url.protocol = (window.location.protocol === "https:" ? "wss://" : "ws://");
    socket = new WebSocket(url.href);
    socket.onopen = function () {
        const id = window.shadeId;
        console.log("Connected with ID " + id);
        localStorage.removeItem("shade_error_reload");
        socket.send(id);
        socketReady = true;
        while (socketReadyQueue.length > 0) {
            sendMessage(socketReadyQueue.shift(), null);
        }
    };
    socket.onmessage = function (event) {
        const data = event.data;
        const splitIndex = data.indexOf(_constants__WEBPACK_IMPORTED_MODULE_2__.messageTagSeparator);
        const tag = data.substring(0, splitIndex);
        const script = data.substring(splitIndex + 1, data.length);
        const scope = (0,_eval__WEBPACK_IMPORTED_MODULE_1__.makeEvalScope)({});
        (0,_utility__WEBPACK_IMPORTED_MODULE_3__.whenDocumentReady)(function () {
            (0,_eval__WEBPACK_IMPORTED_MODULE_1__.evaluateScript)(tag, scope, script);
        });
    };
    let errorTriggered = false;
    function errorReload() {
        if (errorTriggered) {
            return;
        }
        errorTriggered = true;
        const lastReload = localStorage.getItem("shade_error_reload");
        if (lastReload) {
            (0,_errors__WEBPACK_IMPORTED_MODULE_0__.errorDisplay)("This web page could not connect to its server. Please reload or try again later.");
            localStorage.removeItem("shade_error_reload");
        }
        else {
            localStorage.setItem("shade_error_reload", "true");
            location.reload();
        }
    }
    socket.onclose = function (evt) {
        console.log(`Socket closed: ${evt.reason}, ${evt.wasClean}`);
        socketReady = false;
        if (evt.wasClean) {
            //connectSocket()
        }
        else {
            errorReload();
        }
    };
    socket.onerror = function (evt) {
        console.log(`Socket closed: ${evt}`);
        socketReady = false;
        errorReload();
    };
    setInterval(() => {
        if (socketReady) {
            socket.send("");
        }
    }, 60 * 1000);
}
function sendMessage(id, msg) {
    const finalMsg = (msg !== undefined && msg !== null) ? id + _constants__WEBPACK_IMPORTED_MODULE_2__.messageTagSeparator + msg : id + _constants__WEBPACK_IMPORTED_MODULE_2__.messageTagSeparator;
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
    socket.send(`${_constants__WEBPACK_IMPORTED_MODULE_2__.messageTagErrorPrefix}${tag == undefined ? "" : tag}${_constants__WEBPACK_IMPORTED_MODULE_2__.messageTagSeparator}` + JSON.stringify(data));
}


/***/ }),

/***/ "./src/utility.ts":
/*!************************!*\
  !*** ./src/utility.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "querySelectorAllPlusTarget": () => (/* binding */ querySelectorAllPlusTarget),
/* harmony export */   "whenDocumentReady": () => (/* binding */ whenDocumentReady)
/* harmony export */ });
function querySelectorAllPlusTarget(target, selector) {
    const below = target.querySelectorAll(selector);
    if (target.matches(selector)) {
        return [target, ...below];
    }
    else {
        return Array.from(below);
    }
}
function whenDocumentReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        fn();
    }
    else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/shade.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket */ "./src/socket.ts");
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./errors */ "./src/errors.ts");
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utility */ "./src/utility.ts");
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./directives */ "./src/directives.ts");




if (!window.shade) {
    window.shade = {};
    if (!window.WebSocket) {
        (0,_errors__WEBPACK_IMPORTED_MODULE_1__.errorDisplay)("Your web browser doesn't support this page, and it may not function correctly as a result. Upgrade your web browser.");
    }
    else {
        (0,_socket__WEBPACK_IMPORTED_MODULE_0__.connectSocket)();
        (0,_utility__WEBPACK_IMPORTED_MODULE_2__.whenDocumentReady)(function () {
            (0,_directives__WEBPACK_IMPORTED_MODULE_3__.addAllDirectives)(document.documentElement);
        });
        window.addEventListener('error', function (event) {
            (0,_socket__WEBPACK_IMPORTED_MODULE_0__.sendIfError)(event.error);
        });
        window.addEventListener('unhandledrejection', function (event) {
            (0,_socket__WEBPACK_IMPORTED_MODULE_0__.sendIfError)(event.reason);
        });
    }
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUNoQkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ05zRDtBQUNkO0FBQ007QUFDRTtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHFEQUFZO0FBQ3BCO0FBQ0E7QUFDQSxRQUFRLHNEQUFhO0FBQ3JCLFFBQVEsMkRBQWlCO0FBQ3pCLFlBQVksNkRBQWdCO0FBQzVCLFNBQVM7QUFDVDtBQUNBLFlBQVksb0RBQVc7QUFDdkIsU0FBUztBQUNUO0FBQ0EsWUFBWSxvREFBVztBQUN2QixTQUFTO0FBQ1Q7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NoYWRlLy4vc3JjL2FwcGx5anMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvYXR0cmlidXRlcy50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9ib3VuZC50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvZGlyZWN0aXZlcy50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvZXZhbC50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9ldmVudHMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvcmVjb25jaWxlLnRzIiwid2VicGFjazovL3NoYWRlLy4vc3JjL3NvY2tldC50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy91dGlsaXR5LnRzIiwid2VicGFjazovL3NoYWRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NoYWRlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zaGFkZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NoYWRlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvc2hhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5jb25zdCBzY3JpcHRQcmV2aW91cyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgY29uc3Qgb2xkID0gaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXTtcbiAgICBpZiAoIWRpcmVjdGl2ZS5vbmx5T25DcmVhdGUgfHwgIW9sZCB8fCBvbGQuanMgIT0gZGlyZWN0aXZlLmpzIHx8IG9sZC50YXJnZXQgIT0gaW5mby50YXJnZXQpIHtcbiAgICAgICAgaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXSA9IHtcbiAgICAgICAgICAgIGpzOiBkaXJlY3RpdmUuanMsXG4gICAgICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGl0ID0gaW5mby50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBpdFxuICAgICAgICB9KTtcbiAgICAgICAgZXZhbHVhdGVTY3JpcHQodW5kZWZpbmVkLCBzY29wZSwgZGlyZWN0aXZlLmpzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBhc1NoYWRlRGlyZWN0aXZlLCBTZXRBdHRyaWJ1dGUgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllciB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgc3VwcHJlc3NFdmVudEZpcmluZyB9IGZyb20gXCIuL2V2ZW50c1wiO1xuLy9XZSBuZWVkIHNvbWUgd2F5IG9mIHN0b3JpbmcgdGhlIG9yaWdpbmFsIHZhbHVlcyBvZiBhbiBhdHRyaWJ1dGUgYmVmb3JlIGFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgd2FzIGFwcGxpZWQsXG4vL2luIGNhc2UgdGhhdCBkaXJlY3RpdmUgaXMgcmVtb3ZlZCBpbiBhbiB1cGRhdGUgdGhhdCBkb2VzIG5vdCByZXNldCBhbiBlbGVtZW50J3MgYXR0cmlidXRlcy5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZShlbGVtZW50KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxNYXAgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAob3JpZ2luYWxNYXApIHtcbiAgICAgICAgZGVsZXRlIGVsZW1lbnRbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdO1xuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChlbGVtZW50KTtcbiAgICB9XG59XG5mdW5jdGlvbiBub3RlT3JpZ2luYWxBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSkge1xuICAgIGxldCBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAoIW9yaWdpbmFscykge1xuICAgICAgICBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIShuYW1lIGluIG9yaWdpbmFscykpIHtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuY29uc3QgaXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmUgPSBgWyR7QXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZX09JHtEaXJlY3RpdmVUeXBlLlNldEF0dHJpYnV0ZX1dYDtcbmNvbnN0IGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dJHtpc1NldEF0dHJpYnV0ZURpcmVjdGl2ZX1gO1xuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlRGlyZWN0aXZlcyh0YXJnZXQpIHtcbiAgICAvL0ZpcnN0LCBmaW5kIGFsbCBTZXRBdHRyaWJ1dGUgZGlyZWN0aXZlcyB0aGF0IGFwcGx5IHRvIHRhcmdldFxuICAgIGNvbnN0IGFwcGxpY2FibGUgPSBBcnJheS5mcm9tKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlKSk7XG4gICAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICBpZiAoIWN1cnJlbnQgfHwgIWN1cnJlbnQubWF0Y2hlcyhgc2NyaXB0W3R5cGU9JHtzY3JpcHRUeXBlU2lnbmlmaWVyfV1bJHtBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlfV1gKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICAvL05leHQsIGdyb3VwIHRoZW0gYnkgdGhlIGF0dHJpYnV0ZSB0aGV5IGFwcGx5IHRvXG4gICAgY29uc3QgYnlBdHRyaWJ1dGVOYW1lID0ge307XG4gICAgZm9yIChsZXQgZWwgb2YgYXBwbGljYWJsZSkge1xuICAgICAgICBjb25zdCBhc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWwpO1xuICAgICAgICBpZiAoYXNEaXJlY3RpdmUgJiYgYXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGxldCBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXTtcbiAgICAgICAgICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyYXkucHVzaChhc0RpcmVjdGl2ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9Ob3csIGFwcGx5IG9ubHkgdGhlIGxhc3QgZGlyZWN0aXZlIGZvciBldmVyeSBhdHRyaWJ1dGVcbiAgICBmb3IgKGxldCBhdHRyaWJ1dGUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYnlBdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gYnlBdHRyaWJ1dGVOYW1lW2F0dHJpYnV0ZV07XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJlY3RpdmVzW2RpcmVjdGl2ZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIG5vdGVPcmlnaW5hbEF0dHJpYnV0ZSh0YXJnZXQsIGxhc3QubmFtZSk7XG4gICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUodGFyZ2V0LCBsYXN0Lm5hbWUsIGxhc3QudmFsdWUpO1xuICAgIH1cbiAgICAvL0ZpbmFsbHksIHJlc3RvcmUgdGhlIG9yaWdpbmFsIHZhbHVlcyBmb3IgYW55IGF0dHJpYnV0ZXMgdGhhdCBubyBsb25nZXIgaGF2ZSBkaXJlY3RpdmVzXG4gICAgY29uc3Qgb3JpZ2luYWxzID0gdGFyZ2V0W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSB8fCB7fTtcbiAgICBmb3IgKGxldCBvcmlnaW5hbCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvcmlnaW5hbHMpKSB7XG4gICAgICAgIGlmICghYnlBdHRyaWJ1dGVOYW1lW29yaWdpbmFsXSkge1xuICAgICAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQsIG9yaWdpbmFsLCBvcmlnaW5hbHNbb3JpZ2luYWxdKTtcbiAgICAgICAgICAgIGRlbGV0ZSBvcmlnaW5hbHNbb3JpZ2luYWxdO1xuICAgICAgICB9XG4gICAgfVxufVxubGV0IHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgPSBuZXcgU2V0KCk7XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKGNiKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGZvciAobGV0IHRhcmdldCBvZiB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyA9IG5ldyBTZXQoKTtcbiAgICB9XG59XG5jb25zdCBzZXRBdHRyaWJ1dGVUYXJnZXQgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGluZm8pIHtcbiAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChpbmZvLnRhcmdldCk7XG4gICAgaW5mby5lbGVtZW50W3NldEF0dHJpYnV0ZVRhcmdldF0gPSBpbmZvLnRhcmdldDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGVsZW1lbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBlbGVtZW50W3NldEF0dHJpYnV0ZVRhcmdldF07XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZCh0YXJnZXQpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUF0dHJpYnV0ZVZhbHVlKHRhcmdldCwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmIChuYW1lID09IFwidmFsdWVcIiB8fCBuYW1lID09IFwiY2hlY2tlZFwiKSkge1xuICAgICAgICAvL1RoZXNlIHNwZWNpYWwgdmFsdWVzIGhhdmUgZWZmZWN0cyBvbmx5IG9uIHRoZSBcImluaXRpYWxcIiBpbnNlcnRpb24gb2YgYSBET00gb2JqZWN0O1xuICAgICAgICAvL2ZvciBjb25zaXN0ZW5jeSB3ZSBhbHdheXMgYXBwbHkgdGhlc2UgZWZmZWN0c1xuICAgICAgICBpZiAobmFtZSA9PSBcInZhbHVlXCIgJiYgdGFyZ2V0LnZhbHVlICE9IHZhbHVlKSB7XG4gICAgICAgICAgICBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQudmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwID8gdmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmFtZSA9PSBcImNoZWNrZWRcIiAmJiB0YXJnZXQuY2hlY2tlZCAhPSAodmFsdWUgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHN1cHByZXNzQ2hhbmdlTGlzdGVuZXJzKHRhcmdldCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRhcmdldC5jaGVja2VkID0gdmFsdWUgIT0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc3VwcHJlc3NDaGFuZ2VMaXN0ZW5lcnModGFyZ2V0LCBjYikge1xuICAgIHN1cHByZXNzRXZlbnRGaXJpbmcuc3VwcHJlc3MgPSB0cnVlO1xuICAgIGNvbnN0IG9sZE9uQ2hhbmdlID0gdGFyZ2V0Lm9uY2hhbmdlO1xuICAgIHRhcmdldC5vbmNoYW5nZSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRhcmdldC5vbmNoYW5nZSA9IG9sZE9uQ2hhbmdlO1xuICAgICAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCb3VuZElucHV0KGJvdW5kSWQsIHNlcnZlclNlZW4sIHZhbHVlLCBzZXR0ZXIpIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW1wiICsgQXR0cmlidXRlTmFtZXMuQm91bmQgKyBcIj1cXFwiXCIgKyBib3VuZElkICsgXCJcXFwiXVwiKTtcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9ib3VuZFNlZW4gaXMgTmFOIGlmIGFuIGV2ZW50IGhhbmRsZXIgaW5jcmVtZW50ZWQgaXQgYmVmb3JlIHRoaXMgZmlyc3Qgc2VydmVyIHVwZGF0ZSBhcnJpdmVkOyB0aGVyZSdzXG4gICAgLy9ubyBjb25maXJtZWQgYmFzZWxpbmUgaW4gdGhhdCBjYXNlLCBzbyBhY2NlcHQgdGhlIHNlcnZlciB2YWx1ZSAoaXRzIGVjaG8gb2YgdGhlIGV2ZW50IHdpbGwgZm9sbG93KS5cbiAgICBjb25zdCBzZWVuID0gKF9hID0gaW5wdXQuYm91bmRTZWVuKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAoaW5wdXQuYm91bmRTZWVuID0gMCk7XG4gICAgaWYgKGlzTmFOKHNlZW4pIHx8IHNlZW4gPD0gc2VydmVyU2Vlbikge1xuICAgICAgICBzZXR0ZXIoaW5wdXQsIHZhbHVlKTtcbiAgICB9XG59XG4iLCIvL0NoYW5nZXMgaGVyZSBzaG91bGQgYmUgbWlycm9yZWQgaW4gQ2xpZW50Q29uc3RhbnRzLmt0XG5leHBvcnQgdmFyIERpcmVjdGl2ZVR5cGU7XG4oZnVuY3Rpb24gKERpcmVjdGl2ZVR5cGUpIHtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQXBwbHlKc1wiXSA9IFwialwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJTZXRBdHRyaWJ1dGVcIl0gPSBcImFcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiRXZlbnRIYW5kbGVyXCJdID0gXCJlXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudFN0YXJ0XCJdID0gXCJzXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudEVuZFwiXSA9IFwiZlwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJDb21wb25lbnRLZWVwXCJdID0gXCJrXCI7XG59KShEaXJlY3RpdmVUeXBlIHx8IChEaXJlY3RpdmVUeXBlID0ge30pKTtcbmV4cG9ydCB2YXIgQXR0cmlidXRlTmFtZXM7XG4oZnVuY3Rpb24gKEF0dHJpYnV0ZU5hbWVzKSB7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJEaXJlY3RpdmVUeXBlXCJdID0gXCJkYXRhLXNcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIlRhcmdldFNpYmxpbmdEaXJlY3RpdmVcIl0gPSBcImRhdGEtZlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQXBwbHlKc1NjcmlwdFwiXSA9IFwiZGF0YS10XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJBcHBseUpzUnVuT3B0aW9uXCJdID0gXCJkYXRhLXJcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIlNldEF0dHJpYnV0ZU5hbWVcIl0gPSBcImRhdGEtYVwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiU2V0QXR0cmlidXRlVmFsdWVcIl0gPSBcImRhdGEtdlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiS2V5XCJdID0gXCJkYXRhLWtcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50TmFtZVwiXSA9IFwiZGF0YS1lXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudENhbGxiYWNrSWRcIl0gPSBcImRhdGEtaVwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnRQcmVmaXhcIl0gPSBcImRhdGEtcFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnRTdWZmaXhcIl0gPSBcImRhdGEteFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnREYXRhXCJdID0gXCJkYXRhLWRcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkJvdW5kXCJdID0gXCJkYXRhLWJcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkNoZWNrYm94XCJdID0gXCJkYXRhLWNcIjtcbn0pKEF0dHJpYnV0ZU5hbWVzIHx8IChBdHRyaWJ1dGVOYW1lcyA9IHt9KSk7XG5leHBvcnQgY29uc3Qgc2NyaXB0VHlwZVNpZ25pZmllciA9IFwic2hhZGVcIjtcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZFByZWZpeCA9IFwic2hhZGVcIjtcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZEVuZFN1ZmZpeCA9IFwiZVwiO1xuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdTZXBhcmF0b3IgPSBcInxcIjtcbmV4cG9ydCBjb25zdCBtZXNzYWdlVGFnRXJyb3JQcmVmaXggPSBcIkVcIjtcbmV4cG9ydCB2YXIgU29ja2V0U2NvcGVOYW1lcztcbihmdW5jdGlvbiAoU29ja2V0U2NvcGVOYW1lcykge1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJyZWNvbmNpbGVcIl0gPSBcInJcIjtcbiAgICBTb2NrZXRTY29wZU5hbWVzW1widXBkYXRlQm91bmRJbnB1dFwiXSA9IFwiYlwiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJzZW5kTWVzc2FnZVwiXSA9IFwic1wiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJzZW5kSWZFcnJvclwiXSA9IFwicVwiO1xufSkoU29ja2V0U2NvcGVOYW1lcyB8fCAoU29ja2V0U2NvcGVOYW1lcyA9IHt9KSk7XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRFbmRTdWZmaXgsIGNvbXBvbmVudElkUHJlZml4LCBEaXJlY3RpdmVUeXBlLCBzY3JpcHRUeXBlU2lnbmlmaWVyIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBxdWVyeVNlbGVjdG9yQWxsUGx1c1RhcmdldCB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7IGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcywgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZSwgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZVJlbW92ZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmltcG9ydCB7IHJ1bkVsZW1lbnRTY3JpcHQgfSBmcm9tIFwiLi9hcHBseWpzXCI7XG5pbXBvcnQgeyByZW1vdmVFdmVudEhhbmRsZXIsIHNldHVwRXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZXZlbnRzXCI7XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhcnQge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RW5kIHtcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEtlZXAge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU2V0QXR0cmlidXRlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEFwcGx5SnMge1xuICAgIGNvbnN0cnVjdG9yKGpzLCBvbmx5T25DcmVhdGUpIHtcbiAgICAgICAgdGhpcy5qcyA9IGpzO1xuICAgICAgICB0aGlzLm9ubHlPbkNyZWF0ZSA9IG9ubHlPbkNyZWF0ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihldmVudE5hbWUsIGNhbGxiYWNrSWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmNhbGxiYWNrSWQgPSBjYWxsYmFja0lkO1xuICAgICAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICAgICAgdGhpcy5zdWZmaXggPSBzdWZmaXg7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGFzU2hhZGVEaXJlY3RpdmUoY2hpbGQpIHtcbiAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBjaGlsZC50YWdOYW1lID09IFwiU0NSSVBUXCIgJiYgY2hpbGQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSA9PT0gc2NyaXB0VHlwZVNpZ25pZmllcikge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBjb25zdCBpZCA9IGNoaWxkLmlkO1xuICAgICAgICBzd2l0Y2ggKGRpcmVjdGl2ZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5BcHBseUpzOlxuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bk9wdGlvbiA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5BcHBseUpzUnVuT3B0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuQXBwbHlKc1NjcmlwdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBcHBseUpzKHNjcmlwdCwgcnVuT3B0aW9uID09PSBcIjFcIik7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50U3RhcnQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRTdGFydChpZC5zdWJzdHJpbmcoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50RW5kOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50RW5kKGlkLnN1YnN0cmluZyhjb21wb25lbnRJZFByZWZpeC5sZW5ndGgsIGlkLmxlbmd0aCAtIGNvbXBvbmVudElkRW5kU3VmZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkNvbXBvbmVudEtlZXA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBLZWVwKGlkLnN1YnN0cmluZyhjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGU6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuRXZlbnRIYW5kbGVyOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gK2NoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudENhbGxiYWNrSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFByZWZpeCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VmZml4ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50U3VmZml4KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudEhhbmRsZXIobmFtZSwgaWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRBbGxEaXJlY3RpdmVzKGJhc2UpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChiYXNlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVTY3JpcHRUYXJnZXQoc2NyaXB0KSB7XG4gICAgaWYgKHNjcmlwdC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZSkpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IHNjcmlwdDtcbiAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmxldCBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xubGV0IHJlbW92ZWREaXJlY3RpdmVzID0gW107XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdEaXJlY3RpdmVzKGNiKSB7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFuZ2VkIG9mIGNoYW5nZWREaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICAgICAgb25BZGRlZE9yVXBkYXRlZChjaGFuZ2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IHJlbW92ZWQgb2YgcmVtb3ZlZERpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgICAgICBvblJlbW92ZWQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xuICAgICAgICAgICAgcmVtb3ZlZERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyoqXG4gKiBDaGVja3MgYW4gZWxlbWVudCBhbmQgYWxsIGl0cyBjaGlsZHJlbiB0aGF0IGhhdmUganVzdCBiZWVuIGFkZGVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZUFkZChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENoZWNrcyBhbmQgcmVjb3JkcyB3aGV0aGVyIGFuIGVsZW1lbnQgdGhhdCBjaGFuZ2VkIGlzIGEgc2NyaXB0IGRpcmVjdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVDaGFuZ2UoZWxlbWVudCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWxlbWVudCk7XG4gICAgaWYgKGRpcmVjdGl2ZSkge1xuICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50IH0pO1xuICAgIH1cbn1cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiByZW1vdmVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZVJlbW92ZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENhbGxlZCBhZnRlciB0aGUgZGlyZWN0aXZlIGNvbnRhaW5lZCBpbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KGluZm8uZWxlbWVudCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICAgICAgY29uc3QgYWRkSW5mbyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgaW5mbyksIHsgdGFyZ2V0IH0pO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGFkZEluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpIHtcbiAgICAgICAgICAgIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBhZGRJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgYWRkSW5mbyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdGFyZ2V0IGZvciAke2luZm8uZWxlbWVudC5vdXRlckhUTUx9YCk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25SZW1vdmVkKGluZm8pIHtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoaW5mby5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEV2ZW50SGFuZGxlcikge1xuICAgICAgICByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZXJyb3JEaXNwbGF5KGNvbnRlbnQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgKyBcIjwvcD48L2Rpdj48L2Rpdj48L2Rpdj5cIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaGFkZUNsb3NlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKTtcbiAgICAgICAgbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG0pO1xuICAgIH0pO1xufVxuIiwiaW1wb3J0IHsgc2VuZElmRXJyb3IsIHNlbmRNZXNzYWdlIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyByZWNvbmNpbGUgfSBmcm9tIFwiLi9yZWNvbmNpbGVcIjtcbmltcG9ydCB7IHVwZGF0ZUJvdW5kSW5wdXQgfSBmcm9tIFwiLi9ib3VuZFwiO1xuaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlU2NyaXB0KHRhZywgc2NvcGUsIHNjcmlwdCkge1xuICAgIHRyeSB7XG4gICAgICAgIHNjb3BlKHNjcmlwdCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHNlbmRJZkVycm9yKGUsIHRhZywgc2NyaXB0LnN1YnN0cmluZygwLCAyNTYpKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbWFrZUV2YWxTY29wZShzY29wZSkge1xuICAgIC8vU2VydmVyLWdlbmVyYXRlZCBzY3JpcHRzIHNlZSB0aGUgc2NvcGUgZW50cmllcyBhcyBuYW1lZCBwYXJhbWV0ZXJzLCBwbHVzIFwic2NyaXB0XCIgKHRoZSB0ZXh0IG9mIHRoZVxuICAgIC8vc2NyaXB0IGl0c2VsZiksIHdoaWNoIGVycm9yLXJlcG9ydGluZyB0ZW1wbGF0ZXMgcmVmZXJlbmNlLiBuZXcgRnVuY3Rpb24gY29tcGlsZXMgYWdhaW5zdCB0aGUgZ2xvYmFsXG4gICAgLy9zY29wZSwgc28gbm90aGluZyBoZXJlIGRlcGVuZHMgb24gbG9jYWwgaWRlbnRpZmllcnMgc3Vydml2aW5nIG1pbmlmaWNhdGlvbi5cbiAgICBjb25zdCBmaW5hbCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgYmFzZVNjb3BlKSwgc2NvcGUpO1xuICAgIGNvbnN0IG5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZmluYWwpO1xuICAgIGNvbnN0IHZhbHVlcyA9IG5hbWVzLm1hcCgobmFtZSkgPT4gZmluYWxbbmFtZV0pO1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gbmV3IEZ1bmN0aW9uKC4uLm5hbWVzLCBcInNjcmlwdFwiLCBzY3JpcHQpO1xuICAgICAgICBjb21waWxlZCguLi52YWx1ZXMsIHNjcmlwdCk7XG4gICAgfTtcbn1cbmV4cG9ydCBjb25zdCBiYXNlU2NvcGUgPSB7XG4gICAgW1NvY2tldFNjb3BlTmFtZXMucmVjb25jaWxlXTogcmVjb25jaWxlLFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnVwZGF0ZUJvdW5kSW5wdXRdOiB1cGRhdGVCb3VuZElucHV0LFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlXTogc2VuZE1lc3NhZ2UsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZElmRXJyb3JdOiBzZW5kSWZFcnJvclxufTtcbiIsImltcG9ydCB7IFNvY2tldFNjb3BlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGV2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlIH0gZnJvbSBcIi4vZXZhbFwiO1xuZXhwb3J0IGxldCBzdXBwcmVzc0V2ZW50RmlyaW5nID0geyBzdXBwcmVzczogZmFsc2UgfTtcbmNvbnN0IGV2ZW50UHJldmlvdXMgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUsIGluZm8pIHtcbiAgICByZW1vdmVQcmV2aW91c2x5SW5zdGFsbGVkKGluZm8uZWxlbWVudCk7XG4gICAgY29uc3QgcHJlZml4ID0gZGlyZWN0aXZlLnByZWZpeCA/IGAke2RpcmVjdGl2ZS5wcmVmaXh9O1xcbmAgOiBcIlwiO1xuICAgIGNvbnN0IGRhdGEgPSBkaXJlY3RpdmUuZGF0YSA/IGAsSlNPTi5zdHJpbmdpZnkoJHtkaXJlY3RpdmUuZGF0YX0pYCA6IFwiXCI7XG4gICAgY29uc3Qgc3VmZml4ID0gZGlyZWN0aXZlLnN1ZmZpeCA/IGA7XFxuJHtkaXJlY3RpdmUuc3VmZml4fWAgOiBcIlwiO1xuICAgIGNvbnN0IHNjcmlwdCA9IGAke3ByZWZpeH0ke1NvY2tldFNjb3BlTmFtZXMuc2VuZE1lc3NhZ2V9KCR7ZGlyZWN0aXZlLmNhbGxiYWNrSWR9JHtkYXRhfSkke3N1ZmZpeH1gO1xuICAgIGNvbnN0IGxpc3RlbmVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHN1cHByZXNzRXZlbnRGaXJpbmcuc3VwcHJlc3MpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe1xuICAgICAgICAgICAgZXZlbnQ6IGUsXG4gICAgICAgICAgICBlOiBlLFxuICAgICAgICAgICAgaXQ6IGUudGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBzY3JpcHQpO1xuICAgIH07XG4gICAgaW5mby50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihkaXJlY3RpdmUuZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgaW5mby5lbGVtZW50W2V2ZW50UHJldmlvdXNdID0ge1xuICAgICAgICBldmVudE5hbWU6IGRpcmVjdGl2ZS5ldmVudE5hbWUsXG4gICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbykge1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoZWxlbWVudCkge1xuICAgIGNvbnN0IHByZXZpb3VzID0gZWxlbWVudFtldmVudFByZXZpb3VzXTtcbiAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgcHJldmlvdXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJldmlvdXMuZXZlbnROYW1lLCBwcmV2aW91cy5saXN0ZW5lcik7XG4gICAgfVxufVxuIiwiLy9SZWNvbmNpbGUgYSB0YXJnZXRJZCB3aXRoIEhUTUxcbmltcG9ydCB7IGFzU2hhZGVEaXJlY3RpdmUsIGNoYW5naW5nRGlyZWN0aXZlcywgY2hlY2tEaXJlY3RpdmVBZGQsIGNoZWNrRGlyZWN0aXZlQ2hhbmdlLCBjaGVja0RpcmVjdGl2ZVJlbW92ZSwgQ29tcG9uZW50RW5kLCBDb21wb25lbnRTdGFydCwgS2VlcCwgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRQcmVmaXggfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGFwcGx5QXR0cmlidXRlVmFsdWUsIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UgfSBmcm9tIFwiLi9hdHRyaWJ1dGVzXCI7XG5leHBvcnQgZnVuY3Rpb24gcmVjb25jaWxlKHRhcmdldElkLCBodG1sKSB7XG4gICAgY2hhbmdpbmdEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29tcG9uZW50SWRQcmVmaXggKyB0YXJnZXRJZCk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGh0bWxEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHBhcmVudC50YWdOYW1lKTtcbiAgICAgICAgaHRtbERvbS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBjb25zdCBpbmNsdWRlZCA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudCA9IHRhcmdldC5uZXh0U2libGluZztcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY3VycmVudCk7XG4gICAgICAgICAgICBpZiAoY3VycmVudERpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjdXJyZW50RGlyZWN0aXZlLmlkID09IFwiXCIgKyB0YXJnZXRJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaChjdXJyZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIHBhdGNoQ2hpbGRyZW4ocGFyZW50LCB0YXJnZXQsIGluY2x1ZGVkLCBodG1sRG9tLmNoaWxkTm9kZXMpO1xuICAgIH0pO1xufVxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydERpcmVjdGl2ZSwgc3RhcnQsIGNoaWxkcmVuLCBlbmQpIHtcbiAgICAgICAgdGhpcy5zdGFydERpcmVjdGl2ZSA9IHN0YXJ0RGlyZWN0aXZlO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgfVxuICAgIGFzTm9kZXMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5zdGFydCwgLi4udGhpcy5jaGlsZHJlbiwgdGhpcy5lbmRdO1xuICAgIH1cbiAgICBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnREaXJlY3RpdmUuaWQ7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNOb2Rlcyh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGFyZ2V0IGluc3RhbmNlb2YgQ29tcG9uZW50ID8gdGFyZ2V0LmFzTm9kZXMoKSA6IFt0YXJnZXRdO1xufVxuZnVuY3Rpb24gcmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKSB7XG4gICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAob3JpZ2luYWwudGFnTmFtZSAhPSBuZXdlci50YWdOYW1lKSB7XG4gICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChuZXdlcik7XG4gICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShvcmlnaW5hbCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmlnaW5hbC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gb3JpZ2luYWwuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmICghbmV3ZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZShvcmlnaW5hbCwgYXR0cmlidXRlLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdlci5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbmV3ZXIuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZGVyQXR0ciA9IG9yaWdpbmFsLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld2VyQXR0ciA9IG5ld2VyLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGlmIChvbGRlckF0dHIgIT0gbmV3ZXJBdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUob3JpZ2luYWwsIGF0dHJpYnV0ZSwgbmV3ZXJBdHRyKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICBvbkF0dHJpYnV0ZXNTZXRGcm9tU291cmNlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUNoYW5nZShvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKG9yaWdpbmFsLCBudWxsLCBvcmlnaW5hbC5jaGlsZE5vZGVzLCBuZXdlci5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIFRleHQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgIGlmIChvcmlnaW5hbC50ZXh0Q29udGVudCA9PSBuZXdlci50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hDaGlsZHJlbihkb20sIGFwcGVuZFN0YXJ0LCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbikge1xuICAgIGNvbnN0IGZpbmFsID0gcmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbik7XG4gICAgbGV0IGVuZE9mUGF0Y2hSYW5nZTtcbiAgICBpZiAoZG9tQ2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBkb21DaGlsZHJlbltkb21DaGlsZHJlbi5sZW5ndGggLSAxXS5uZXh0U2libGluZztcbiAgICB9XG4gICAgZWxzZSBpZiAoYXBwZW5kU3RhcnQpIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gYXBwZW5kU3RhcnQubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBudWxsO1xuICAgIH1cbiAgICBsZXQgY3VycmVudCA9IGFwcGVuZFN0YXJ0ID8gYXBwZW5kU3RhcnQgOiBcInN0YXJ0XCI7XG4gICAgZnVuY3Rpb24gYWZ0ZXJDdXJyZW50KCkge1xuICAgICAgICBpZiAoY3VycmVudCA9PSBcInN0YXJ0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBkb20uZmlyc3RDaGlsZCA/IGRvbS5maXJzdENoaWxkIDogXCJlbmRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdXJyZW50ID09IFwiZW5kXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcImVuZFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQubmV4dFNpYmxpbmcgPyBjdXJyZW50Lm5leHRTaWJsaW5nIDogXCJlbmRcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZpbmFsKSB7XG4gICAgICAgIGxldCBuZXh0ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGlmIChuZXh0ICE9PSBjaGlsZCkge1xuICAgICAgICAgICAgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgbmV4dCA9PT0gXCJlbmRcIiA/IG51bGwgOiBuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY2hpbGQ7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICB3aGlsZSAoY3VycmVudCAhPSBcImVuZFwiICYmIGN1cnJlbnQgIT0gZW5kT2ZQYXRjaFJhbmdlKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY3VycmVudDtcbiAgICAgICAgY3VycmVudCA9IGFmdGVyQ3VycmVudCgpO1xuICAgICAgICBkb20ucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlY29uY2lsZUNoaWxkcmVuKGRvbSwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3Qgb3JpZ2luYWxzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihkb21DaGlsZHJlbik7XG4gICAgY29uc3QgcmVwbGFjZW1lbnRzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihyZXBsYWNlbWVudENoaWxkcmVuKTtcbiAgICBjb25zdCBvcmlnaW5hbEtleXMgPSBjb2xsZWN0S2V5c01hcChvcmlnaW5hbHMpO1xuICAgIGxldCBvcmlnaW5hbEluZGV4ID0gMDtcbiAgICBsZXQgcmVwbGFjZW1lbnRJbmRleCA9IDA7XG4gICAgY29uc3QgZmluYWxDaGlsZHJlbiA9IFtdO1xuICAgIHdoaWxlIChvcmlnaW5hbEluZGV4IDwgb3JpZ2luYWxzLmxlbmd0aCB8fCByZXBsYWNlbWVudEluZGV4IDwgcmVwbGFjZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBsZXQgb3JpZ2luYWwgPSBvcmlnaW5hbHNbb3JpZ2luYWxJbmRleF07XG4gICAgICAgIGNvbnN0IG5ld2VyID0gcmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50SW5kZXhdO1xuICAgICAgICBpZiAob3JpZ2luYWwgJiYgIW5ld2VyKSB7XG4gICAgICAgICAgICAvKiBJbXBsaWNpdCByZW1vdmUgKi9cbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpIHtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgICAgIC8vVGV4dCBub2RlcyBoYXZlIG5vIGludGVyZXN0aW5nIGlkZW50aXR5IG9yIGNoaWxkcmVuIHRvIHByZXNlcnZlLCBhbmQgdGhlXG4gICAgICAgICAgICAvL0tvdGxpbiBzaWRlIGNhbid0IHRyYWNrIHRoZW0gZm9yIHBvc2l0aW9uIG1hdGNoaW5nLCBzbyB3ZSBqdXN0IHNraXAgb3ZlciB0aGVtXG4gICAgICAgICAgICAvL2luIGNvbXBhcmlzb25zIGFuZCBhZGQgdGhlIG5ld2VyIHRleHQgYWx3YXlzLlxuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld2VyIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgZmluYWxDaGlsZHJlbi5wdXNoKG5ld2VyKTtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vVGhlIHNlcnZlciBkb2VzIG5vdCB0cmFjayB0aGUgcG9zaXRpb24gb2YgbW9zdCBkaXJlY3RpdmVzLCBleGNlcHQga2VlcCwgc28gdGhleSBhcmUgc3BlY2lhbGx5IGhhbmRsZWRcbiAgICAgICAgICAgIC8vZm9yIG1hdGNoaW5nXG4gICAgICAgICAgICBjb25zdCBuZXdlckRpcmVjdGl2ZSA9IG5ld2VyIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gbnVsbCA6IGFzU2hhZGVEaXJlY3RpdmUobmV3ZXIpO1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxJc0RpcmVjdGl2ZSA9IG9yaWdpbmFsIGluc3RhbmNlb2YgTm9kZSAmJiBhc1NoYWRlRGlyZWN0aXZlKG9yaWdpbmFsKSAhPSBudWxsO1xuICAgICAgICAgICAgaWYgKG5ld2VyIGluc3RhbmNlb2YgTm9kZSAmJiBuZXdlckRpcmVjdGl2ZSAhPSBudWxsICYmICEobmV3ZXJEaXJlY3RpdmUgaW5zdGFuY2VvZiBLZWVwKSkge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbElzRGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaChyZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxDaGlsZHJlbi5wdXNoKG5ld2VyKTtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQobmV3ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvcmlnaW5hbElzRGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUob3JpZ2luYWwpO1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG5ld2VyS2V5ID0gZ2V0S2V5KG5ld2VyKTtcbiAgICAgICAgICAgIGlmIChuZXdlcktleSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy9XZSdsbCBkaXJlY3RseSBtYXRjaCB0byB0aGUgb3JpZ2luYWwgYnkga2V5LCBpZ25vcmluZyB3aGF0J3MgdXN1YWxseSBhdCB0aGlzIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgb3JpZ2luYWwgPSAoX2EgPSBvcmlnaW5hbEtleXNbbmV3ZXJLZXldKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYWRkID0gW107XG4gICAgICAgICAgICBmdW5jdGlvbiB1c2VOZXdlcigpIHtcbiAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG5ld2VyKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIGFkZCkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsICYmIG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCAmJiAobmV3ZXJEaXJlY3RpdmUuaWQgPT0gb3JpZ2luYWwuaWQoKSB8fCBuZXdlcktleSkpIHtcbiAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghb3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG9yaWdpbmFsLmlkKCkgPT0gbmV3ZXIuaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlY29uY2lsZUNoaWxkcmVuKGRvbSwgb3JpZ2luYWwuY2hpbGRyZW4sIG5ld2VyLmNoaWxkcmVuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBbcmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2goLi4uYWRkKTtcbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL0FsbCByZW1haW5pbmcga2V5cyBpbiB0aGUgbWFwIHdpbGwgbm90IGhhdmUgYmVlbiB1c2VkLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9yaWdpbmFsS2V5cykpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxzID0gb3JpZ2luYWxLZXlzW2tleV07XG4gICAgICAgIGZvciAobGV0IG9yaWdpbmFsIG9mIG9yaWdpbmFscykge1xuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaW5hbENoaWxkcmVuO1xufVxuZnVuY3Rpb24gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihsaXN0KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCk7XG4gICAgICAgIGxldCBlbmQgPSBudWxsO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50U3RhcnQpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YkNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEFzRGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShzdWJDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkQXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRFbmQgJiYgY2hpbGRBc0RpcmVjdGl2ZS5pZCA9PSBkaXJlY3RpdmUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ViQ2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnB1c2goc3ViQ2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIk1pc3NpbmcgZW5kIHRhZyBmb3IgY29tcG9uZW50IFwiICsgZGlyZWN0aXZlLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBDb21wb25lbnQoZGlyZWN0aXZlLCBjaGlsZCwgY29tcG9uZW50LCBlbmQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29sbGVjdEtleXNNYXAoY2hpbGRMaXN0KSB7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRMaXN0W2ldO1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRLZXkoY2hpbGQpO1xuICAgICAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBsaXN0ID0ga2V5c1trZXldO1xuICAgICAgICAgICAgaWYgKCFsaXN0KSB7XG4gICAgICAgICAgICAgICAgbGlzdCA9IGtleXNba2V5XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cbmZ1bmN0aW9uIGdldEtleShjaGlsZCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGNoaWxkIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gY2hpbGQuc3RhcnQgOiBjaGlsZDtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5LZXkpO1xuICAgICAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG4iLCJpbXBvcnQgeyBlcnJvckRpc3BsYXkgfSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7IGV2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlIH0gZnJvbSBcIi4vZXZhbFwiO1xuaW1wb3J0IHsgbWVzc2FnZVRhZ0Vycm9yUHJlZml4LCBtZXNzYWdlVGFnU2VwYXJhdG9yIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyB3aGVuRG9jdW1lbnRSZWFkeSB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmxldCBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuY29uc3Qgc29ja2V0UmVhZHlRdWV1ZSA9IFtdO1xubGV0IHNvY2tldDtcbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0U29ja2V0KCkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwod2luZG93LnNoYWRlRW5kcG9pbnQsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICBpZiAod2luZG93LnNoYWRlSG9zdCkge1xuICAgICAgICB1cmwuaG9zdCA9IHdpbmRvdy5zaGFkZUhvc3Q7XG4gICAgfVxuICAgIHVybC5wcm90b2NvbCA9ICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgPyBcIndzczovL1wiIDogXCJ3czovL1wiKTtcbiAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybC5ocmVmKTtcbiAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBpZCA9IHdpbmRvdy5zaGFkZUlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZCB3aXRoIElEIFwiICsgaWQpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgc29ja2V0LnNlbmQoaWQpO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IHRydWU7XG4gICAgICAgIHdoaWxlIChzb2NrZXRSZWFkeVF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlKHNvY2tldFJlYWR5UXVldWUuc2hpZnQoKSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgICAgIGNvbnN0IHNwbGl0SW5kZXggPSBkYXRhLmluZGV4T2YobWVzc2FnZVRhZ1NlcGFyYXRvcik7XG4gICAgICAgIGNvbnN0IHRhZyA9IGRhdGEuc3Vic3RyaW5nKDAsIHNwbGl0SW5kZXgpO1xuICAgICAgICBjb25zdCBzY3JpcHQgPSBkYXRhLnN1YnN0cmluZyhzcGxpdEluZGV4ICsgMSwgZGF0YS5sZW5ndGgpO1xuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe30pO1xuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmFsdWF0ZVNjcmlwdCh0YWcsIHNjb3BlLCBzY3JpcHQpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGxldCBlcnJvclRyaWdnZXJlZCA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIGVycm9yUmVsb2FkKCkge1xuICAgICAgICBpZiAoZXJyb3JUcmlnZ2VyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlcnJvclRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IGxhc3RSZWxvYWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgaWYgKGxhc3RSZWxvYWQpIHtcbiAgICAgICAgICAgIGVycm9yRGlzcGxheShcIlRoaXMgd2ViIHBhZ2UgY291bGQgbm90IGNvbm5lY3QgdG8gaXRzIHNlcnZlci4gUGxlYXNlIHJlbG9hZCBvciB0cnkgYWdhaW4gbGF0ZXIuXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFNvY2tldCBjbG9zZWQ6ICR7ZXZ0LnJlYXNvbn0sICR7ZXZ0Lndhc0NsZWFufWApO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuICAgICAgICBpZiAoZXZ0Lndhc0NsZWFuKSB7XG4gICAgICAgICAgICAvL2Nvbm5lY3RTb2NrZXQoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dH1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICB9O1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChcIlwiKTtcbiAgICAgICAgfVxuICAgIH0sIDYwICogMTAwMCk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2VuZE1lc3NhZ2UoaWQsIG1zZykge1xuICAgIGNvbnN0IGZpbmFsTXNnID0gKG1zZyAhPT0gdW5kZWZpbmVkICYmIG1zZyAhPT0gbnVsbCkgPyBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3IgKyBtc2cgOiBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3I7XG4gICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgIHNvY2tldC5zZW5kKGZpbmFsTXNnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNvY2tldFJlYWR5UXVldWUucHVzaChmaW5hbE1zZyk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRJZkVycm9yKGVycm9yLCB0YWcsIGV2YWxUZXh0KSB7XG4gICAgY29uc3QgZGF0YSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyB7XG4gICAgICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgICAgIGpzTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9IDoge1xuICAgICAgICBuYW1lOiBcIlVua25vd25cIixcbiAgICAgICAganNNZXNzYWdlOiBcIlVua25vd24gZXJyb3I6IFwiICsgZXJyb3IsXG4gICAgICAgIHN0YWNrOiBcIlwiLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9O1xuICAgIHNvY2tldC5zZW5kKGAke21lc3NhZ2VUYWdFcnJvclByZWZpeH0ke3RhZyA9PSB1bmRlZmluZWQgPyBcIlwiIDogdGFnfSR7bWVzc2FnZVRhZ1NlcGFyYXRvcn1gICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KHRhcmdldCwgc2VsZWN0b3IpIHtcbiAgICBjb25zdCBiZWxvdyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICBpZiAodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbdGFyZ2V0LCAuLi5iZWxvd107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShiZWxvdyk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5Eb2N1bWVudFJlYWR5KGZuKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImludGVyYWN0aXZlXCIpIHtcbiAgICAgICAgZm4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZuKTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGNvbm5lY3RTb2NrZXQsIHNlbmRJZkVycm9yIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyBlcnJvckRpc3BsYXkgfSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7IHdoZW5Eb2N1bWVudFJlYWR5IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHsgYWRkQWxsRGlyZWN0aXZlcyB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmlmICghd2luZG93LnNoYWRlKSB7XG4gICAgd2luZG93LnNoYWRlID0ge307XG4gICAgaWYgKCF3aW5kb3cuV2ViU29ja2V0KSB7XG4gICAgICAgIGVycm9yRGlzcGxheShcIllvdXIgd2ViIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHRoaXMgcGFnZSwgYW5kIGl0IG1heSBub3QgZnVuY3Rpb24gY29ycmVjdGx5IGFzIGEgcmVzdWx0LiBVcGdyYWRlIHlvdXIgd2ViIGJyb3dzZXIuXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29ubmVjdFNvY2tldCgpO1xuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhZGRBbGxEaXJlY3RpdmVzKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LmVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LnJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==