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
    cb();
    target.onchange = oldOnChange;
    _events__WEBPACK_IMPORTED_MODULE_2__.suppressEventFiring.suppress = false;
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
    let input = document.querySelector("[" + _constants__WEBPACK_IMPORTED_MODULE_0__.AttributeNames.Bound + "=\"" + boundId + "\"]");
    let seen = input.boundSeen || (input.boundSeen = 0);
    if (input && seen <= serverSeen) {
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
                return new ComponentStart(id.substr(_constants__WEBPACK_IMPORTED_MODULE_0__.componentIdPrefix.length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.ComponentEnd:
                return new ComponentEnd(id.substr(5, id.length - _constants__WEBPACK_IMPORTED_MODULE_0__.componentIdPrefix.length - _constants__WEBPACK_IMPORTED_MODULE_0__.componentIdEndSuffix.length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__.DirectiveType.ComponentKeep:
                return new Keep(id.substr(_constants__WEBPACK_IMPORTED_MODULE_0__.componentIdPrefix.length));
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
    const final = Object.assign(Object.assign({}, baseScope), scope);
    const base = [];
    for (let key of Object.getOwnPropertyNames(final)) {
        base.push(`var ${key}=final.${key};`);
    }
    const baseScript = base.join("\n") + "\n";
    return function (script) {
        eval("(function(){\n" + baseScript + script + "\n})()");
    }.bind({});
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
            localStorage.removeItem("shade_last_error_reload");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUNoQkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ05zRDtBQUNkO0FBQ007QUFDRTtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHFEQUFZO0FBQ3BCO0FBQ0E7QUFDQSxRQUFRLHNEQUFhO0FBQ3JCLFFBQVEsMkRBQWlCO0FBQ3pCLFlBQVksNkRBQWdCO0FBQzVCLFNBQVM7QUFDVDtBQUNBLFlBQVksb0RBQVc7QUFDdkIsU0FBUztBQUNUO0FBQ0EsWUFBWSxvREFBVztBQUN2QixTQUFTO0FBQ1Q7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NoYWRlLy4vc3JjL2FwcGx5anMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvYXR0cmlidXRlcy50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9ib3VuZC50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvZGlyZWN0aXZlcy50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvZXZhbC50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9ldmVudHMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvcmVjb25jaWxlLnRzIiwid2VicGFjazovL3NoYWRlLy4vc3JjL3NvY2tldC50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy91dGlsaXR5LnRzIiwid2VicGFjazovL3NoYWRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NoYWRlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zaGFkZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NoYWRlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvc2hhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5jb25zdCBzY3JpcHRQcmV2aW91cyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgY29uc3Qgb2xkID0gaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXTtcbiAgICBpZiAoIWRpcmVjdGl2ZS5vbmx5T25DcmVhdGUgfHwgIW9sZCB8fCBvbGQuanMgIT0gZGlyZWN0aXZlLmpzIHx8IG9sZC50YXJnZXQgIT0gaW5mby50YXJnZXQpIHtcbiAgICAgICAgaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXSA9IHtcbiAgICAgICAgICAgIGpzOiBkaXJlY3RpdmUuanMsXG4gICAgICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGl0ID0gaW5mby50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBpdFxuICAgICAgICB9KTtcbiAgICAgICAgZXZhbHVhdGVTY3JpcHQodW5kZWZpbmVkLCBzY29wZSwgZGlyZWN0aXZlLmpzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBhc1NoYWRlRGlyZWN0aXZlLCBTZXRBdHRyaWJ1dGUgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllciB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgc3VwcHJlc3NFdmVudEZpcmluZyB9IGZyb20gXCIuL2V2ZW50c1wiO1xuLy9XZSBuZWVkIHNvbWUgd2F5IG9mIHN0b3JpbmcgdGhlIG9yaWdpbmFsIHZhbHVlcyBvZiBhbiBhdHRyaWJ1dGUgYmVmb3JlIGFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgd2FzIGFwcGxpZWQsXG4vL2luIGNhc2UgdGhhdCBkaXJlY3RpdmUgaXMgcmVtb3ZlZCBpbiBhbiB1cGRhdGUgdGhhdCBkb2VzIG5vdCByZXNldCBhbiBlbGVtZW50J3MgYXR0cmlidXRlcy5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZShlbGVtZW50KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxNYXAgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAob3JpZ2luYWxNYXApIHtcbiAgICAgICAgZGVsZXRlIGVsZW1lbnRbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdO1xuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChlbGVtZW50KTtcbiAgICB9XG59XG5mdW5jdGlvbiBub3RlT3JpZ2luYWxBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSkge1xuICAgIGxldCBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAoIW9yaWdpbmFscykge1xuICAgICAgICBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIShuYW1lIGluIG9yaWdpbmFscykpIHtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuY29uc3QgaXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmUgPSBgWyR7QXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZX09JHtEaXJlY3RpdmVUeXBlLlNldEF0dHJpYnV0ZX1dYDtcbmNvbnN0IGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dJHtpc1NldEF0dHJpYnV0ZURpcmVjdGl2ZX1gO1xuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlRGlyZWN0aXZlcyh0YXJnZXQpIHtcbiAgICAvL0ZpcnN0LCBmaW5kIGFsbCBTZXRBdHRyaWJ1dGUgZGlyZWN0aXZlcyB0aGF0IGFwcGx5IHRvIHRhcmdldFxuICAgIGNvbnN0IGFwcGxpY2FibGUgPSBBcnJheS5mcm9tKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlKSk7XG4gICAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICBpZiAoIWN1cnJlbnQgfHwgIWN1cnJlbnQubWF0Y2hlcyhgc2NyaXB0W3R5cGU9JHtzY3JpcHRUeXBlU2lnbmlmaWVyfV1bJHtBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlfV1gKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICAvL05leHQsIGdyb3VwIHRoZW0gYnkgdGhlIGF0dHJpYnV0ZSB0aGV5IGFwcGx5IHRvXG4gICAgY29uc3QgYnlBdHRyaWJ1dGVOYW1lID0ge307XG4gICAgZm9yIChsZXQgZWwgb2YgYXBwbGljYWJsZSkge1xuICAgICAgICBjb25zdCBhc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWwpO1xuICAgICAgICBpZiAoYXNEaXJlY3RpdmUgJiYgYXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGxldCBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXTtcbiAgICAgICAgICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyYXkucHVzaChhc0RpcmVjdGl2ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9Ob3csIGFwcGx5IG9ubHkgdGhlIGxhc3QgZGlyZWN0aXZlIGZvciBldmVyeSBhdHRyaWJ1dGVcbiAgICBmb3IgKGxldCBhdHRyaWJ1dGUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYnlBdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gYnlBdHRyaWJ1dGVOYW1lW2F0dHJpYnV0ZV07XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJlY3RpdmVzW2RpcmVjdGl2ZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIG5vdGVPcmlnaW5hbEF0dHJpYnV0ZSh0YXJnZXQsIGxhc3QubmFtZSk7XG4gICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUodGFyZ2V0LCBsYXN0Lm5hbWUsIGxhc3QudmFsdWUpO1xuICAgIH1cbiAgICAvL0ZpbmFsbHksIHJlc3RvcmUgdGhlIG9yaWdpbmFsIHZhbHVlcyBmb3IgYW55IGF0dHJpYnV0ZXMgdGhhdCBubyBsb25nZXIgaGF2ZSBkaXJlY3RpdmVzXG4gICAgY29uc3Qgb3JpZ2luYWxzID0gdGFyZ2V0W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSB8fCB7fTtcbiAgICBmb3IgKGxldCBvcmlnaW5hbCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvcmlnaW5hbHMpKSB7XG4gICAgICAgIGlmICghYnlBdHRyaWJ1dGVOYW1lW29yaWdpbmFsXSkge1xuICAgICAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQsIG9yaWdpbmFsLCBvcmlnaW5hbHNbb3JpZ2luYWxdKTtcbiAgICAgICAgICAgIGRlbGV0ZSBvcmlnaW5hbHNbb3JpZ2luYWxdO1xuICAgICAgICB9XG4gICAgfVxufVxubGV0IHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgPSBuZXcgU2V0KCk7XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKGNiKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGZvciAobGV0IHRhcmdldCBvZiB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyA9IG5ldyBTZXQoKTtcbiAgICB9XG59XG5jb25zdCBzZXRBdHRyaWJ1dGVUYXJnZXQgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGluZm8pIHtcbiAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChpbmZvLnRhcmdldCk7XG4gICAgaW5mby5lbGVtZW50W3NldEF0dHJpYnV0ZVRhcmdldF0gPSBpbmZvLnRhcmdldDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGVsZW1lbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBlbGVtZW50W3NldEF0dHJpYnV0ZVRhcmdldF07XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZCh0YXJnZXQpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUF0dHJpYnV0ZVZhbHVlKHRhcmdldCwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmIChuYW1lID09IFwidmFsdWVcIiB8fCBuYW1lID09IFwiY2hlY2tlZFwiKSkge1xuICAgICAgICAvL1RoZXNlIHNwZWNpYWwgdmFsdWVzIGhhdmUgZWZmZWN0cyBvbmx5IG9uIHRoZSBcImluaXRpYWxcIiBpbnNlcnRpb24gb2YgYSBET00gb2JqZWN0O1xuICAgICAgICAvL2ZvciBjb25zaXN0ZW5jeSB3ZSBhbHdheXMgYXBwbHkgdGhlc2UgZWZmZWN0c1xuICAgICAgICBpZiAobmFtZSA9PSBcInZhbHVlXCIgJiYgdGFyZ2V0LnZhbHVlICE9IHZhbHVlKSB7XG4gICAgICAgICAgICBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQudmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwID8gdmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmFtZSA9PSBcImNoZWNrZWRcIiAmJiB0YXJnZXQuY2hlY2tlZCAhPSAodmFsdWUgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHN1cHByZXNzQ2hhbmdlTGlzdGVuZXJzKHRhcmdldCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRhcmdldC5jaGVja2VkID0gdmFsdWUgIT0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc3VwcHJlc3NDaGFuZ2VMaXN0ZW5lcnModGFyZ2V0LCBjYikge1xuICAgIHN1cHByZXNzRXZlbnRGaXJpbmcuc3VwcHJlc3MgPSB0cnVlO1xuICAgIGNvbnN0IG9sZE9uQ2hhbmdlID0gdGFyZ2V0Lm9uY2hhbmdlO1xuICAgIHRhcmdldC5vbmNoYW5nZSA9IG51bGw7XG4gICAgY2IoKTtcbiAgICB0YXJnZXQub25jaGFuZ2UgPSBvbGRPbkNoYW5nZTtcbiAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gZmFsc2U7XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJvdW5kSW5wdXQoYm91bmRJZCwgc2VydmVyU2VlbiwgdmFsdWUsIHNldHRlcikge1xuICAgIGxldCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbXCIgKyBBdHRyaWJ1dGVOYW1lcy5Cb3VuZCArIFwiPVxcXCJcIiArIGJvdW5kSWQgKyBcIlxcXCJdXCIpO1xuICAgIGxldCBzZWVuID0gaW5wdXQuYm91bmRTZWVuIHx8IChpbnB1dC5ib3VuZFNlZW4gPSAwKTtcbiAgICBpZiAoaW5wdXQgJiYgc2VlbiA8PSBzZXJ2ZXJTZWVuKSB7XG4gICAgICAgIHNldHRlcihpbnB1dCwgdmFsdWUpO1xuICAgIH1cbn1cbiIsIi8vQ2hhbmdlcyBoZXJlIHNob3VsZCBiZSBtaXJyb3JlZCBpbiBDbGllbnRDb25zdGFudHMua3RcbmV4cG9ydCB2YXIgRGlyZWN0aXZlVHlwZTtcbihmdW5jdGlvbiAoRGlyZWN0aXZlVHlwZSkge1xuICAgIERpcmVjdGl2ZVR5cGVbXCJBcHBseUpzXCJdID0gXCJqXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIlNldEF0dHJpYnV0ZVwiXSA9IFwiYVwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJFdmVudEhhbmRsZXJcIl0gPSBcImVcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50U3RhcnRcIl0gPSBcInNcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50RW5kXCJdID0gXCJmXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudEtlZXBcIl0gPSBcImtcIjtcbn0pKERpcmVjdGl2ZVR5cGUgfHwgKERpcmVjdGl2ZVR5cGUgPSB7fSkpO1xuZXhwb3J0IHZhciBBdHRyaWJ1dGVOYW1lcztcbihmdW5jdGlvbiAoQXR0cmlidXRlTmFtZXMpIHtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkRpcmVjdGl2ZVR5cGVcIl0gPSBcImRhdGEtc1wiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiVGFyZ2V0U2libGluZ0RpcmVjdGl2ZVwiXSA9IFwiZGF0YS1mXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJBcHBseUpzU2NyaXB0XCJdID0gXCJkYXRhLXRcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkFwcGx5SnNSdW5PcHRpb25cIl0gPSBcImRhdGEtclwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiU2V0QXR0cmlidXRlTmFtZVwiXSA9IFwiZGF0YS1hXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJTZXRBdHRyaWJ1dGVWYWx1ZVwiXSA9IFwiZGF0YS12XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJLZXlcIl0gPSBcImRhdGEta1wiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnROYW1lXCJdID0gXCJkYXRhLWVcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50Q2FsbGJhY2tJZFwiXSA9IFwiZGF0YS1pXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudFByZWZpeFwiXSA9IFwiZGF0YS1wXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudFN1ZmZpeFwiXSA9IFwiZGF0YS14XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudERhdGFcIl0gPSBcImRhdGEtZFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQm91bmRcIl0gPSBcImRhdGEtYlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQ2hlY2tib3hcIl0gPSBcImRhdGEtY1wiO1xufSkoQXR0cmlidXRlTmFtZXMgfHwgKEF0dHJpYnV0ZU5hbWVzID0ge30pKTtcbmV4cG9ydCBjb25zdCBzY3JpcHRUeXBlU2lnbmlmaWVyID0gXCJzaGFkZVwiO1xuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkUHJlZml4ID0gXCJzaGFkZVwiO1xuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkRW5kU3VmZml4ID0gXCJlXCI7XG5leHBvcnQgY29uc3QgbWVzc2FnZVRhZ1NlcGFyYXRvciA9IFwifFwiO1xuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdFcnJvclByZWZpeCA9IFwiRVwiO1xuZXhwb3J0IHZhciBTb2NrZXRTY29wZU5hbWVzO1xuKGZ1bmN0aW9uIChTb2NrZXRTY29wZU5hbWVzKSB7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInJlY29uY2lsZVwiXSA9IFwiclwiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJ1cGRhdGVCb3VuZElucHV0XCJdID0gXCJiXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInNlbmRNZXNzYWdlXCJdID0gXCJzXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInNlbmRJZkVycm9yXCJdID0gXCJxXCI7XG59KShTb2NrZXRTY29wZU5hbWVzIHx8IChTb2NrZXRTY29wZU5hbWVzID0ge30pKTtcbiIsImltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBjb21wb25lbnRJZEVuZFN1ZmZpeCwgY29tcG9uZW50SWRQcmVmaXgsIERpcmVjdGl2ZVR5cGUsIHNjcmlwdFR5cGVTaWduaWZpZXIgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHsgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlIH0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuaW1wb3J0IHsgcnVuRWxlbWVudFNjcmlwdCB9IGZyb20gXCIuL2FwcGx5anNcIjtcbmltcG9ydCB7IHJlbW92ZUV2ZW50SGFuZGxlciwgc2V0dXBFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9ldmVudHNcIjtcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRTdGFydCB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFbmQge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgS2VlcCB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTZXRBdHRyaWJ1dGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXBwbHlKcyB7XG4gICAgY29uc3RydWN0b3IoanMsIG9ubHlPbkNyZWF0ZSkge1xuICAgICAgICB0aGlzLmpzID0ganM7XG4gICAgICAgIHRoaXMub25seU9uQ3JlYXRlID0gb25seU9uQ3JlYXRlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBFdmVudEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZSwgY2FsbGJhY2tJZCwgcHJlZml4LCBzdWZmaXgsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tJZCA9IGNhbGxiYWNrSWQ7XG4gICAgICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgICAgICB0aGlzLnN1ZmZpeCA9IHN1ZmZpeDtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCkge1xuICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGNoaWxkLnRhZ05hbWUgPT0gXCJTQ1JJUFRcIiAmJiBjaGlsZC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpID09PSBzY3JpcHRUeXBlU2lnbmlmaWVyKSB7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZVR5cGUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIGNvbnN0IGlkID0gY2hpbGQuaWQ7XG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aXZlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkFwcGx5SnM6XG4gICAgICAgICAgICAgICAgY29uc3QgcnVuT3B0aW9uID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNSdW5PcHRpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5BcHBseUpzU2NyaXB0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFwcGx5SnMoc2NyaXB0LCBydW5PcHRpb24gPT09IFwiMVwiKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRTdGFydDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudFN0YXJ0KGlkLnN1YnN0cihjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRFbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRFbmQoaWQuc3Vic3RyKDUsIGlkLmxlbmd0aCAtIGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCAtIGNvbXBvbmVudElkRW5kU3VmZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkNvbXBvbmVudEtlZXA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBLZWVwKGlkLnN1YnN0cihjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGU6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuRXZlbnRIYW5kbGVyOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gK2NoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudENhbGxiYWNrSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFByZWZpeCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VmZml4ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50U3VmZml4KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudEhhbmRsZXIobmFtZSwgaWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRBbGxEaXJlY3RpdmVzKGJhc2UpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChiYXNlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVTY3JpcHRUYXJnZXQoc2NyaXB0KSB7XG4gICAgaWYgKHNjcmlwdC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZSkpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IHNjcmlwdDtcbiAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmxldCBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xubGV0IHJlbW92ZWREaXJlY3RpdmVzID0gW107XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdEaXJlY3RpdmVzKGNiKSB7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFuZ2VkIG9mIGNoYW5nZWREaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICAgICAgb25BZGRlZE9yVXBkYXRlZChjaGFuZ2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IHJlbW92ZWQgb2YgcmVtb3ZlZERpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgICAgICBvblJlbW92ZWQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xuICAgICAgICAgICAgcmVtb3ZlZERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyoqXG4gKiBDaGVja3MgYW4gZWxlbWVudCBhbmQgYWxsIGl0cyBjaGlsZHJlbiB0aGF0IGhhdmUganVzdCBiZWVuIGFkZGVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZUFkZChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENoZWNrcyBhbmQgcmVjb3JkcyB3aGV0aGVyIGFuIGVsZW1lbnQgdGhhdCBjaGFuZ2VkIGlzIGEgc2NyaXB0IGRpcmVjdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVDaGFuZ2UoZWxlbWVudCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWxlbWVudCk7XG4gICAgaWYgKGRpcmVjdGl2ZSkge1xuICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50IH0pO1xuICAgIH1cbn1cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiByZW1vdmVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZVJlbW92ZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENhbGxlZCBhZnRlciB0aGUgZGlyZWN0aXZlIGNvbnRhaW5lZCBpbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KGluZm8uZWxlbWVudCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICAgICAgY29uc3QgYWRkSW5mbyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgaW5mbyksIHsgdGFyZ2V0IH0pO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGFkZEluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpIHtcbiAgICAgICAgICAgIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBhZGRJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgYWRkSW5mbyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdGFyZ2V0IGZvciAke2luZm8uZWxlbWVudC5vdXRlckhUTUx9YCk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25SZW1vdmVkKGluZm8pIHtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoaW5mby5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEV2ZW50SGFuZGxlcikge1xuICAgICAgICByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZXJyb3JEaXNwbGF5KGNvbnRlbnQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgKyBcIjwvcD48L2Rpdj48L2Rpdj48L2Rpdj5cIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaGFkZUNsb3NlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKTtcbiAgICAgICAgbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG0pO1xuICAgIH0pO1xufVxuIiwiaW1wb3J0IHsgc2VuZElmRXJyb3IsIHNlbmRNZXNzYWdlIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyByZWNvbmNpbGUgfSBmcm9tIFwiLi9yZWNvbmNpbGVcIjtcbmltcG9ydCB7IHVwZGF0ZUJvdW5kSW5wdXQgfSBmcm9tIFwiLi9ib3VuZFwiO1xuaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlU2NyaXB0KHRhZywgc2NvcGUsIHNjcmlwdCkge1xuICAgIHRyeSB7XG4gICAgICAgIHNjb3BlKHNjcmlwdCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHNlbmRJZkVycm9yKGUsIHRhZywgc2NyaXB0LnN1YnN0cmluZygwLCAyNTYpKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbWFrZUV2YWxTY29wZShzY29wZSkge1xuICAgIGNvbnN0IGZpbmFsID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBiYXNlU2NvcGUpLCBzY29wZSk7XG4gICAgY29uc3QgYmFzZSA9IFtdO1xuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhmaW5hbCkpIHtcbiAgICAgICAgYmFzZS5wdXNoKGB2YXIgJHtrZXl9PWZpbmFsLiR7a2V5fTtgKTtcbiAgICB9XG4gICAgY29uc3QgYmFzZVNjcmlwdCA9IGJhc2Uuam9pbihcIlxcblwiKSArIFwiXFxuXCI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgICAgZXZhbChcIihmdW5jdGlvbigpe1xcblwiICsgYmFzZVNjcmlwdCArIHNjcmlwdCArIFwiXFxufSkoKVwiKTtcbiAgICB9LmJpbmQoe30pO1xufVxuZXhwb3J0IGNvbnN0IGJhc2VTY29wZSA9IHtcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5yZWNvbmNpbGVdOiByZWNvbmNpbGUsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMudXBkYXRlQm91bmRJbnB1dF06IHVwZGF0ZUJvdW5kSW5wdXQsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZE1lc3NhZ2VdOiBzZW5kTWVzc2FnZSxcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5zZW5kSWZFcnJvcl06IHNlbmRJZkVycm9yXG59O1xuIiwiaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5leHBvcnQgbGV0IHN1cHByZXNzRXZlbnRGaXJpbmcgPSB7IHN1cHByZXNzOiBmYWxzZSB9O1xuY29uc3QgZXZlbnRQcmV2aW91cyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbykge1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KTtcbiAgICBjb25zdCBwcmVmaXggPSBkaXJlY3RpdmUucHJlZml4ID8gYCR7ZGlyZWN0aXZlLnByZWZpeH07XFxuYCA6IFwiXCI7XG4gICAgY29uc3QgZGF0YSA9IGRpcmVjdGl2ZS5kYXRhID8gYCxKU09OLnN0cmluZ2lmeSgke2RpcmVjdGl2ZS5kYXRhfSlgIDogXCJcIjtcbiAgICBjb25zdCBzdWZmaXggPSBkaXJlY3RpdmUuc3VmZml4ID8gYDtcXG4ke2RpcmVjdGl2ZS5zdWZmaXh9YCA6IFwiXCI7XG4gICAgY29uc3Qgc2NyaXB0ID0gYCR7cHJlZml4fSR7U29ja2V0U2NvcGVOYW1lcy5zZW5kTWVzc2FnZX0oJHtkaXJlY3RpdmUuY2FsbGJhY2tJZH0ke2RhdGF9KSR7c3VmZml4fWA7XG4gICAgY29uc3QgbGlzdGVuZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc3VwcHJlc3NFdmVudEZpcmluZy5zdXBwcmVzcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBldmVudDogZSxcbiAgICAgICAgICAgIGU6IGUsXG4gICAgICAgICAgICBpdDogZS50YXJnZXRcbiAgICAgICAgfSk7XG4gICAgICAgIGV2YWx1YXRlU2NyaXB0KHVuZGVmaW5lZCwgc2NvcGUsIHNjcmlwdCk7XG4gICAgfTtcbiAgICBpbmZvLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGRpcmVjdGl2ZS5ldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICBpbmZvLmVsZW1lbnRbZXZlbnRQcmV2aW91c10gPSB7XG4gICAgICAgIGV2ZW50TmFtZTogZGlyZWN0aXZlLmV2ZW50TmFtZSxcbiAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpO1xufVxuZnVuY3Rpb24gcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChlbGVtZW50KSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSBlbGVtZW50W2V2ZW50UHJldmlvdXNdO1xuICAgIGlmIChwcmV2aW91cykge1xuICAgICAgICBwcmV2aW91cy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihwcmV2aW91cy5ldmVudE5hbWUsIHByZXZpb3VzLmxpc3RlbmVyKTtcbiAgICB9XG59XG4iLCIvL1JlY29uY2lsZSBhIHRhcmdldElkIHdpdGggSFRNTFxuaW1wb3J0IHsgYXNTaGFkZURpcmVjdGl2ZSwgY2hhbmdpbmdEaXJlY3RpdmVzLCBjaGVja0RpcmVjdGl2ZUFkZCwgY2hlY2tEaXJlY3RpdmVDaGFuZ2UsIGNoZWNrRGlyZWN0aXZlUmVtb3ZlLCBDb21wb25lbnRFbmQsIENvbXBvbmVudFN0YXJ0LCBLZWVwLCB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBjb21wb25lbnRJZFByZWZpeCB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgYXBwbHlBdHRyaWJ1dGVWYWx1ZSwgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmV4cG9ydCBmdW5jdGlvbiByZWNvbmNpbGUodGFyZ2V0SWQsIGh0bWwpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb21wb25lbnRJZFByZWZpeCArIHRhcmdldElkKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgY29uc3QgaHRtbERvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50LnRhZ05hbWUpO1xuICAgICAgICBodG1sRG9tLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuICAgICAgICB3aGlsZSAoY3VycmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjdXJyZW50KTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50RW5kICYmIGN1cnJlbnREaXJlY3RpdmUuaWQgPT0gXCJcIiArIHRhcmdldElkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmNsdWRlZC5wdXNoKGN1cnJlbnQpO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcGF0Y2hDaGlsZHJlbihwYXJlbnQsIHRhcmdldCwgaW5jbHVkZWQsIGh0bWxEb20uY2hpbGROb2Rlcyk7XG4gICAgfSk7XG59XG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0RGlyZWN0aXZlLCBzdGFydCwgY2hpbGRyZW4sIGVuZCkge1xuICAgICAgICB0aGlzLnN0YXJ0RGlyZWN0aXZlID0gc3RhcnREaXJlY3RpdmU7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG4gICAgYXNOb2RlcygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLnN0YXJ0LCAuLi50aGlzLmNoaWxkcmVuLCB0aGlzLmVuZF07XG4gICAgfVxuICAgIGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydERpcmVjdGl2ZS5pZDtcbiAgICB9XG59XG5mdW5jdGlvbiBhc05vZGVzKHRhcmdldCkge1xuICAgIHJldHVybiB0YXJnZXQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyB0YXJnZXQuYXNOb2RlcygpIDogW3RhcmdldF07XG59XG5mdW5jdGlvbiByZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpIHtcbiAgICBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBuZXdlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmIChvcmlnaW5hbC50YWdOYW1lICE9IG5ld2VyLnRhZ05hbWUpIHtcbiAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5ld2VyKTtcbiAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIHJldHVybiBuZXdlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yaWdpbmFsLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBvcmlnaW5hbC5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBhcHBseUF0dHJpYnV0ZVZhbHVlKG9yaWdpbmFsLCBhdHRyaWJ1dGUsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld2VyLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBuZXdlci5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkZXJBdHRyID0gb3JpZ2luYWwuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3ZXJBdHRyID0gbmV3ZXIuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKG9sZGVyQXR0ciAhPSBuZXdlckF0dHIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZShvcmlnaW5hbCwgYXR0cmlidXRlLCBuZXdlckF0dHIpO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2Uob3JpZ2luYWwpO1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQ2hhbmdlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGNoQ2hpbGRyZW4ob3JpZ2luYWwsIG51bGwsIG9yaWdpbmFsLmNoaWxkTm9kZXMsIG5ld2VyLmNoaWxkTm9kZXMpO1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgVGV4dCAmJiBuZXdlciBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsLnRleHRDb250ZW50ID09IG5ld2VyLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXdlcjtcbiAgICB9XG59XG5mdW5jdGlvbiBwYXRjaENoaWxkcmVuKGRvbSwgYXBwZW5kU3RhcnQsIGRvbUNoaWxkcmVuLCByZXBsYWNlbWVudENoaWxkcmVuKSB7XG4gICAgY29uc3QgZmluYWwgPSByZWNvbmNpbGVDaGlsZHJlbihkb20sIGRvbUNoaWxkcmVuLCByZXBsYWNlbWVudENoaWxkcmVuKTtcbiAgICBsZXQgZW5kT2ZQYXRjaFJhbmdlO1xuICAgIGlmIChkb21DaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGRvbUNoaWxkcmVuW2RvbUNoaWxkcmVuLmxlbmd0aCAtIDFdLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICBlbHNlIGlmIChhcHBlbmRTdGFydCkge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBhcHBlbmRTdGFydC5uZXh0U2libGluZztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IG51bGw7XG4gICAgfVxuICAgIGxldCBjdXJyZW50ID0gYXBwZW5kU3RhcnQgPyBhcHBlbmRTdGFydCA6IFwic3RhcnRcIjtcbiAgICBmdW5jdGlvbiBhZnRlckN1cnJlbnQoKSB7XG4gICAgICAgIGlmIChjdXJyZW50ID09IFwic3RhcnRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGRvbS5maXJzdENoaWxkID8gZG9tLmZpcnN0Q2hpbGQgOiBcImVuZFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN1cnJlbnQgPT0gXCJlbmRcIikge1xuICAgICAgICAgICAgcmV0dXJuIFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudC5uZXh0U2libGluZyA/IGN1cnJlbnQubmV4dFNpYmxpbmcgOiBcImVuZFwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZmluYWwpIHtcbiAgICAgICAgbGV0IG5leHQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICAgICAgaWYgKG5leHQgIT09IGNoaWxkKSB7XG4gICAgICAgICAgICBkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0ID09PSBcImVuZFwiID8gbnVsbCA6IG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjaGlsZDtcbiAgICB9XG4gICAgY3VycmVudCA9IGFmdGVyQ3VycmVudCgpO1xuICAgIHdoaWxlIChjdXJyZW50ICE9IFwiZW5kXCIgJiYgY3VycmVudCAhPSBlbmRPZlBhdGNoUmFuZ2UpIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjdXJyZW50O1xuICAgICAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDaGlsZChjaGlsZCk7XG4gICAgfVxufVxuZnVuY3Rpb24gcmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbikge1xuICAgIHZhciBfYTtcbiAgICBjb25zdCBvcmlnaW5hbHMgPSBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKGRvbUNoaWxkcmVuKTtcbiAgICBjb25zdCByZXBsYWNlbWVudHMgPSBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKHJlcGxhY2VtZW50Q2hpbGRyZW4pO1xuICAgIGNvbnN0IG9yaWdpbmFsS2V5cyA9IGNvbGxlY3RLZXlzTWFwKG9yaWdpbmFscyk7XG4gICAgbGV0IG9yaWdpbmFsSW5kZXggPSAwO1xuICAgIGxldCByZXBsYWNlbWVudEluZGV4ID0gMDtcbiAgICBjb25zdCBmaW5hbENoaWxkcmVuID0gW107XG4gICAgd2hpbGUgKG9yaWdpbmFsSW5kZXggPCBvcmlnaW5hbHMubGVuZ3RoIHx8IHJlcGxhY2VtZW50SW5kZXggPCByZXBsYWNlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBvcmlnaW5hbCA9IG9yaWdpbmFsc1tvcmlnaW5hbEluZGV4XTtcbiAgICAgICAgY29uc3QgbmV3ZXIgPSByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRJbmRleF07XG4gICAgICAgIGlmIChvcmlnaW5hbCAmJiAhbmV3ZXIpIHtcbiAgICAgICAgICAgIC8qIEltcGxpY2l0IHJlbW92ZSAqL1xuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgLy9UZXh0IG5vZGVzIGhhdmUgbm8gaW50ZXJlc3RpbmcgaWRlbnRpdHkgb3IgY2hpbGRyZW4gdG8gcHJlc2VydmUsIGFuZCB0aGVcbiAgICAgICAgICAgIC8vS290bGluIHNpZGUgY2FuJ3QgdHJhY2sgdGhlbSBmb3IgcG9zaXRpb24gbWF0Y2hpbmcsIHNvIHdlIGp1c3Qgc2tpcCBvdmVyIHRoZW1cbiAgICAgICAgICAgIC8vaW4gY29tcGFyaXNvbnMgYW5kIGFkZCB0aGUgbmV3ZXIgdGV4dCBhbHdheXMuXG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3ZXIgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpO1xuICAgICAgICAgICAgcmVwbGFjZW1lbnRJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy9UaGUgc2VydmVyIGRvZXMgbm90IHRyYWNrIHRoZSBwb3NpdGlvbiBvZiBtb3N0IGRpcmVjdGl2ZXMsIGV4Y2VwdCBrZWVwLCBzbyB0aGV5IGFyZSBzcGVjaWFsbHkgaGFuZGxlZFxuICAgICAgICAgICAgLy9mb3IgbWF0Y2hpbmdcbiAgICAgICAgICAgIGNvbnN0IG5ld2VyRGlyZWN0aXZlID0gbmV3ZXIgaW5zdGFuY2VvZiBDb21wb25lbnQgPyBudWxsIDogYXNTaGFkZURpcmVjdGl2ZShuZXdlcik7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbElzRGlyZWN0aXZlID0gb3JpZ2luYWwgaW5zdGFuY2VvZiBOb2RlICYmIGFzU2hhZGVEaXJlY3RpdmUob3JpZ2luYWwpICE9IG51bGw7XG4gICAgICAgICAgICBpZiAobmV3ZXIgaW5zdGFuY2VvZiBOb2RlICYmIG5ld2VyRGlyZWN0aXZlICE9IG51bGwgJiYgIShuZXdlckRpcmVjdGl2ZSBpbnN0YW5jZW9mIEtlZXApKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsSXNEaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxDaGlsZHJlbi5wdXNoKHJlY29uY2lsZU5vZGVzKG9yaWdpbmFsLCBuZXdlcikpO1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpO1xuICAgICAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChuZXdlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsSXNEaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShvcmlnaW5hbCk7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbmV3ZXJLZXkgPSBnZXRLZXkobmV3ZXIpO1xuICAgICAgICAgICAgaWYgKG5ld2VyS2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvL1dlJ2xsIGRpcmVjdGx5IG1hdGNoIHRvIHRoZSBvcmlnaW5hbCBieSBrZXksIGlnbm9yaW5nIHdoYXQncyB1c3VhbGx5IGF0IHRoaXMgcG9zaXRpb25cbiAgICAgICAgICAgICAgICBvcmlnaW5hbCA9IChfYSA9IG9yaWdpbmFsS2V5c1tuZXdlcktleV0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBhZGQgPSBbXTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVzZU5ld2VyKCkge1xuICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMobmV3ZXIpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3JpZ2luYWwgJiYgb3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQgJiYgbmV3ZXJEaXJlY3RpdmUgaW5zdGFuY2VvZiBLZWVwICYmIChuZXdlckRpcmVjdGl2ZS5pZCA9PSBvcmlnaW5hbC5pZCgpIHx8IG5ld2VyS2V5KSkge1xuICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMob3JpZ2luYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcmlnaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld2VyIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQgJiYgb3JpZ2luYWwuaWQoKSA9PSBuZXdlci5pZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBvcmlnaW5hbC5jaGlsZHJlbiwgbmV3ZXIuY2hpbGRyZW4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5lbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtyZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaCguLi5hZGQpO1xuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICAgICAgcmVwbGFjZW1lbnRJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vQWxsIHJlbWFpbmluZyBrZXlzIGluIHRoZSBtYXAgd2lsbCBub3QgaGF2ZSBiZWVuIHVzZWQuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxLZXlzKSkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbHMgPSBvcmlnaW5hbEtleXNba2V5XTtcbiAgICAgICAgZm9yIChsZXQgb3JpZ2luYWwgb2Ygb3JpZ2luYWxzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIGFzTm9kZXMob3JpZ2luYWwpKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpbmFsQ2hpbGRyZW47XG59XG5mdW5jdGlvbiBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKGxpc3QpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBsaXN0W2ldO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGNoaWxkKTtcbiAgICAgICAgbGV0IGVuZCA9IG51bGw7XG4gICAgICAgIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRTdGFydCkge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gW107XG4gICAgICAgICAgICB3aGlsZSAoaSA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViQ2hpbGQgPSBsaXN0W2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKHN1YkNoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRBc0RpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjaGlsZEFzRGlyZWN0aXZlLmlkID09IGRpcmVjdGl2ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzdWJDaGlsZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQucHVzaChzdWJDaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiTWlzc2luZyBlbmQgdGFnIGZvciBjb21wb25lbnQgXCIgKyBkaXJlY3RpdmUuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IENvbXBvbmVudChkaXJlY3RpdmUsIGNoaWxkLCBjb21wb25lbnQsIGVuZCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb2xsZWN0S2V5c01hcChjaGlsZExpc3QpIHtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZExpc3RbaV07XG4gICAgICAgIGNvbnN0IGtleSA9IGdldEtleShjaGlsZCk7XG4gICAgICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IGxpc3QgPSBrZXlzW2tleV07XG4gICAgICAgICAgICBpZiAoIWxpc3QpIHtcbiAgICAgICAgICAgICAgICBsaXN0ID0ga2V5c1trZXldID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuZnVuY3Rpb24gZ2V0S2V5KGNoaWxkKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gY2hpbGQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyBjaGlsZC5zdGFydCA6IGNoaWxkO1xuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBrZXkgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLktleSk7XG4gICAgICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbiIsImltcG9ydCB7IGVycm9yRGlzcGxheSB9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQgeyBtZXNzYWdlVGFnRXJyb3JQcmVmaXgsIG1lc3NhZ2VUYWdTZXBhcmF0b3IgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IHdoZW5Eb2N1bWVudFJlYWR5IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xubGV0IHNvY2tldFJlYWR5ID0gZmFsc2U7XG5jb25zdCBzb2NrZXRSZWFkeVF1ZXVlID0gW107XG5sZXQgc29ja2V0O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RTb2NrZXQoKSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTCh3aW5kb3cuc2hhZGVFbmRwb2ludCwgd2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgIGlmICh3aW5kb3cuc2hhZGVIb3N0KSB7XG4gICAgICAgIHVybC5ob3N0ID0gd2luZG93LnNoYWRlSG9zdDtcbiAgICB9XG4gICAgdXJsLnByb3RvY29sID0gKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IFwid3NzOi8vXCIgOiBcIndzOi8vXCIpO1xuICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsLmhyZWYpO1xuICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGlkID0gd2luZG93LnNoYWRlSWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkIHdpdGggSUQgXCIgKyBpZCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIpO1xuICAgICAgICBzb2NrZXQuc2VuZChpZCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUgKHNvY2tldFJlYWR5UXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2VuZE1lc3NhZ2Uoc29ja2V0UmVhZHlRdWV1ZS5zaGlmdCgpLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YTtcbiAgICAgICAgY29uc3Qgc3BsaXRJbmRleCA9IGRhdGEuaW5kZXhPZihtZXNzYWdlVGFnU2VwYXJhdG9yKTtcbiAgICAgICAgY29uc3QgdGFnID0gZGF0YS5zdWJzdHJpbmcoMCwgc3BsaXRJbmRleCk7XG4gICAgICAgIGNvbnN0IHNjcmlwdCA9IGRhdGEuc3Vic3RyaW5nKHNwbGl0SW5kZXggKyAxLCBkYXRhLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7fSk7XG4gICAgICAgIHdoZW5Eb2N1bWVudFJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2YWx1YXRlU2NyaXB0KHRhZywgc2NvcGUsIHNjcmlwdCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgbGV0IGVycm9yVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gZXJyb3JSZWxvYWQoKSB7XG4gICAgICAgIGlmIChlcnJvclRyaWdnZXJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVycm9yVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgbGFzdFJlbG9hZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIpO1xuICAgICAgICBpZiAobGFzdFJlbG9hZCkge1xuICAgICAgICAgICAgZXJyb3JEaXNwbGF5KFwiVGhpcyB3ZWIgcGFnZSBjb3VsZCBub3QgY29ubmVjdCB0byBpdHMgc2VydmVyLiBQbGVhc2UgcmVsb2FkIG9yIHRyeSBhZ2FpbiBsYXRlci5cIik7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInNoYWRlX2xhc3RfZXJyb3JfcmVsb2FkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dC5yZWFzb259LCAke2V2dC53YXNDbGVhbn1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKGV2dC53YXNDbGVhbikge1xuICAgICAgICAgICAgLy9jb25uZWN0U29ja2V0KClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgU29ja2V0IGNsb3NlZDogJHtldnR9YCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gZmFsc2U7XG4gICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgfTtcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoXCJcIik7XG4gICAgICAgIH1cbiAgICB9LCA2MCAqIDEwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRNZXNzYWdlKGlkLCBtc2cpIHtcbiAgICBjb25zdCBmaW5hbE1zZyA9IChtc2cgIT09IHVuZGVmaW5lZCAmJiBtc2cgIT09IG51bGwpID8gaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yICsgbXNnIDogaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yO1xuICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICBzb2NrZXQuc2VuZChmaW5hbE1zZyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzb2NrZXRSZWFkeVF1ZXVlLnB1c2goZmluYWxNc2cpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZW5kSWZFcnJvcihlcnJvciwgdGFnLCBldmFsVGV4dCkge1xuICAgIGNvbnN0IGRhdGEgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8ge1xuICAgICAgICBuYW1lOiBlcnJvci5uYW1lLFxuICAgICAgICBqc01lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfSA6IHtcbiAgICAgICAgbmFtZTogXCJVbmtub3duXCIsXG4gICAgICAgIGpzTWVzc2FnZTogXCJVbmtub3duIGVycm9yOiBcIiArIGVycm9yLFxuICAgICAgICBzdGFjazogXCJcIixcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfTtcbiAgICBzb2NrZXQuc2VuZChgJHttZXNzYWdlVGFnRXJyb3JQcmVmaXh9JHt0YWcgPT0gdW5kZWZpbmVkID8gXCJcIiA6IHRhZ30ke21lc3NhZ2VUYWdTZXBhcmF0b3J9YCArIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yQWxsUGx1c1RhcmdldCh0YXJnZXQsIHNlbGVjdG9yKSB7XG4gICAgY29uc3QgYmVsb3cgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgaWYgKHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gW3RhcmdldCwgLi4uYmVsb3ddO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYmVsb3cpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiB3aGVuRG9jdW1lbnRSZWFkeShmbikge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJpbnRlcmFjdGl2ZVwiKSB7XG4gICAgICAgIGZuKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmbik7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBjb25uZWN0U29ja2V0LCBzZW5kSWZFcnJvciB9IGZyb20gXCIuL3NvY2tldFwiO1xuaW1wb3J0IHsgZXJyb3JEaXNwbGF5IH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgeyB3aGVuRG9jdW1lbnRSZWFkeSB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7IGFkZEFsbERpcmVjdGl2ZXMgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pZiAoIXdpbmRvdy5zaGFkZSkge1xuICAgIHdpbmRvdy5zaGFkZSA9IHt9O1xuICAgIGlmICghd2luZG93LldlYlNvY2tldCkge1xuICAgICAgICBlcnJvckRpc3BsYXkoXCJZb3VyIHdlYiBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHBhZ2UsIGFuZCBpdCBtYXkgbm90IGZ1bmN0aW9uIGNvcnJlY3RseSBhcyBhIHJlc3VsdC4gVXBncmFkZSB5b3VyIHdlYiBicm93c2VyLlwiKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbm5lY3RTb2NrZXQoKTtcbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWRkQWxsRGlyZWN0aXZlcyhkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZW5kSWZFcnJvcihldmVudC5lcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZW5kSWZFcnJvcihldmVudC5yZWFzb24pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=