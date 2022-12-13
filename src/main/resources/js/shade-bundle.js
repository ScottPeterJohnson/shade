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
        //Skip any keyed originals; they will be looked up by key
        if (original && getKey(original) != null) {
            originalIndex += 1;
        }
        else if (original && !newer) {
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
                if (original) {
                    //We'll match this unkeyed original again on something without a key
                    originalIndex -= 1;
                }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGUtYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUF1RDtBQUN2RDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isb0RBQWE7QUFDbkM7QUFDQSxTQUFTO0FBQ1QsUUFBUSxxREFBYztBQUN0QjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDZjhEO0FBQ21CO0FBQ2xDO0FBQy9DO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLG9FQUE0QixDQUFDLEdBQUcsa0VBQTBCLENBQUM7QUFDL0Ysd0RBQXdELDJEQUFtQixDQUFDLEdBQUcsd0JBQXdCO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCwyREFBbUIsQ0FBQyxJQUFJLDZFQUFxQyxDQUFDO0FBQ3RIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLDZEQUFnQjtBQUM1QyxrREFBa0QscURBQVk7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksaUVBQTRCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxpRUFBNEI7QUFDaEM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuSDZDO0FBQ3RDO0FBQ1AsNkNBQTZDLDREQUFvQjtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUEE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxzQ0FBc0M7QUFDaEM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLHdDQUF3QztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyw0Q0FBNEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEM2RTtBQUNuRTtBQUNnRTtBQUMxRTtBQUNvQjtBQUMxRDtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLG9HQUFvRywyREFBbUI7QUFDdkgsaURBQWlELG9FQUE0QjtBQUM3RTtBQUNBO0FBQ0EsaUJBQWlCLDZEQUFxQjtBQUN0QyxxREFBcUQsdUVBQStCO0FBQ3BGLGtEQUFrRCxvRUFBNEI7QUFDOUU7QUFDQSxpQkFBaUIsb0VBQTRCO0FBQzdDLG9EQUFvRCxnRUFBd0I7QUFDNUUsaUJBQWlCLGtFQUEwQjtBQUMzQyxpRUFBaUUsZ0VBQXdCLEdBQUcsbUVBQTJCO0FBQ3ZILGlCQUFpQixtRUFBMkI7QUFDNUMsMENBQTBDLGdFQUF3QjtBQUNsRSxpQkFBaUIsa0VBQTBCO0FBQzNDLGdEQUFnRCx1RUFBK0I7QUFDL0UsaURBQWlELHdFQUFnQztBQUNqRjtBQUNBO0FBQ0EsaUJBQWlCLGtFQUEwQjtBQUMzQyxnREFBZ0QsZ0VBQXdCO0FBQ3hFLCtDQUErQyxzRUFBOEI7QUFDN0Usa0RBQWtELGtFQUEwQjtBQUM1RSxrREFBa0Qsa0VBQTBCO0FBQzVFLGdEQUFnRCxnRUFBd0I7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ087QUFDUCw0QkFBNEIsNkVBQXFDO0FBQ2pFO0FBQ0EsNkNBQTZDLDZFQUFxQztBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsSUFBSSx3RUFBMkI7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsMkJBQTJCLG9FQUEwQix5QkFBeUIsMkRBQW1CLENBQUM7QUFDbEc7QUFDQTtBQUNBLHlDQUF5Qyw0QkFBNEI7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQSxpQ0FBaUMsb0JBQW9CO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsMkJBQTJCLG9FQUEwQix5QkFBeUIsMkRBQW1CLENBQUM7QUFDbEc7QUFDQTtBQUNBLHlDQUF5Qyw0QkFBNEI7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxXQUFXLFFBQVE7QUFDekU7QUFDQSxZQUFZLHlFQUE0QjtBQUN4QztBQUNBO0FBQ0EsWUFBWSwwREFBZ0I7QUFDNUI7QUFDQTtBQUNBLFlBQVksMERBQWlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLDRDQUE0Qyx1QkFBdUI7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEseUVBQTRCO0FBQ3BDO0FBQ0E7QUFDQSxRQUFRLDJEQUFrQjtBQUMxQjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUM5S087QUFDUDtBQUNBLHVFQUF1RSxtQkFBbUIsUUFBUSxPQUFPLFlBQVksYUFBYSxlQUFlLGtDQUFrQyxxQ0FBcUMsaUJBQWlCLGNBQWMsdUJBQXVCLFdBQVcsNENBQTRDLGdCQUFnQixrQkFBa0IsZ0JBQWdCLFNBQVM7QUFDaFk7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1JvRDtBQUNaO0FBQ0c7QUFDSTtBQUN4QztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxvREFBVztBQUNuQjtBQUNBO0FBQ087QUFDUCxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBLHlCQUF5QixJQUFJLFNBQVMsS0FBSztBQUMzQztBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsZ0NBQWdDO0FBQzFELEtBQUssUUFBUTtBQUNiO0FBQ087QUFDUCxLQUFLLGtFQUEwQixHQUFHLGlEQUFTO0FBQzNDLEtBQUsseUVBQWlDLEdBQUcsb0RBQWdCO0FBQ3pELEtBQUssb0VBQTRCLEdBQUcsZ0RBQVc7QUFDL0MsS0FBSyxvRUFBNEIsR0FBRyxnREFBVztBQUMvQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVCK0M7QUFDUTtBQUNoRCw0QkFBNEI7QUFDbkM7QUFDTztBQUNQO0FBQ0EseUNBQXlDLGtCQUFrQjtBQUMzRCxxREFBcUQsZUFBZTtBQUNwRSx3Q0FBd0MsSUFBSSxpQkFBaUI7QUFDN0Qsc0JBQXNCLE9BQU8sRUFBRSxvRUFBNEIsQ0FBQyxHQUFHLHFCQUFxQixFQUFFLEtBQUssR0FBRyxPQUFPO0FBQ3JHO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG9EQUFhO0FBQ25DO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxRQUFRLHFEQUFjO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BDQTtBQUN3SztBQUN4RztBQUNjO0FBQ3ZFO0FBQ1AsSUFBSSwrREFBa0I7QUFDdEIsK0NBQStDLHlEQUFpQjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsNkRBQWdCO0FBQ3JELDRDQUE0QyxxREFBWTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSw4REFBaUI7QUFDN0IsWUFBWSxpRUFBb0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0NBQWdDO0FBQzVEO0FBQ0E7QUFDQSxvQkFBb0IsZ0VBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLDRCQUE0Qiw2QkFBNkI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsZ0VBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHNFQUF5QjtBQUN6QyxnQkFBZ0IsaUVBQW9CO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsaUVBQW9CO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUVBQXVFLDZEQUFnQjtBQUN2RixvRUFBb0UsNkRBQWdCO0FBQ3BGLCtGQUErRiw2Q0FBSTtBQUNuRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsOERBQWlCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsaUVBQW9CO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw4REFBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGlFQUFvQjtBQUM1QztBQUNBO0FBQ0E7QUFDQSx1RkFBdUYsNkNBQUk7QUFDM0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsaUVBQW9CO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGlCQUFpQjtBQUNyQztBQUNBLDBCQUEwQiw2REFBZ0I7QUFDMUM7QUFDQSxpQ0FBaUMsdURBQWM7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsNkRBQWdCO0FBQ3pELGdEQUFnRCxxREFBWTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isc0JBQXNCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QywwREFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1U3dDO0FBQ2U7QUFDa0I7QUFDM0I7QUFDOUM7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsMkRBQW1CO0FBQzNEO0FBQ0E7QUFDQSxzQkFBc0Isb0RBQWEsR0FBRztBQUN0QyxRQUFRLDJEQUFpQjtBQUN6QixZQUFZLHFEQUFjO0FBQzFCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHFEQUFZO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsV0FBVyxJQUFJLGFBQWE7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLElBQUk7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQLGdFQUFnRSwyREFBbUIsY0FBYywyREFBbUI7QUFDcEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkRBQXFCLENBQUMsRUFBRSw0QkFBNEIsRUFBRSwyREFBbUIsQ0FBQztBQUM3Rjs7Ozs7Ozs7Ozs7Ozs7OztBQy9GTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDaEJBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOc0Q7QUFDZDtBQUNNO0FBQ0U7QUFDaEQ7QUFDQTtBQUNBO0FBQ0EsUUFBUSxxREFBWTtBQUNwQjtBQUNBO0FBQ0EsUUFBUSxzREFBYTtBQUNyQixRQUFRLDJEQUFpQjtBQUN6QixZQUFZLDZEQUFnQjtBQUM1QixTQUFTO0FBQ1Q7QUFDQSxZQUFZLG9EQUFXO0FBQ3ZCLFNBQVM7QUFDVDtBQUNBLFlBQVksb0RBQVc7QUFDdkIsU0FBUztBQUNUO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9hcHBseWpzLnRzIiwid2VicGFjazovL3NoYWRlLy4vc3JjL2F0dHJpYnV0ZXMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvYm91bmQudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3NoYWRlLy4vc3JjL2RpcmVjdGl2ZXMudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvZXJyb3JzLnRzIiwid2VicGFjazovL3NoYWRlLy4vc3JjL2V2YWwudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvZXZlbnRzLnRzIiwid2VicGFjazovL3NoYWRlLy4vc3JjL3JlY29uY2lsZS50cyIsIndlYnBhY2s6Ly9zaGFkZS8uL3NyYy9zb2NrZXQudHMiLCJ3ZWJwYWNrOi8vc2hhZGUvLi9zcmMvdXRpbGl0eS50cyIsIndlYnBhY2s6Ly9zaGFkZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zaGFkZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc2hhZGUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zaGFkZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3NoYWRlLy4vc3JjL3NoYWRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlIH0gZnJvbSBcIi4vZXZhbFwiO1xuY29uc3Qgc2NyaXB0UHJldmlvdXMgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBydW5FbGVtZW50U2NyaXB0KGRpcmVjdGl2ZSwgaW5mbykge1xuICAgIGNvbnN0IG9sZCA9IGluZm8uZWxlbWVudFtzY3JpcHRQcmV2aW91c107XG4gICAgaWYgKCFkaXJlY3RpdmUub25seU9uQ3JlYXRlIHx8ICFvbGQgfHwgb2xkLmpzICE9IGRpcmVjdGl2ZS5qcyB8fCBvbGQudGFyZ2V0ICE9IGluZm8udGFyZ2V0KSB7XG4gICAgICAgIGluZm8uZWxlbWVudFtzY3JpcHRQcmV2aW91c10gPSB7XG4gICAgICAgICAgICBqczogZGlyZWN0aXZlLmpzLFxuICAgICAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpdCA9IGluZm8udGFyZ2V0O1xuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe1xuICAgICAgICAgICAgaXRcbiAgICAgICAgfSk7XG4gICAgICAgIGV2YWx1YXRlU2NyaXB0KHVuZGVmaW5lZCwgc2NvcGUsIGRpcmVjdGl2ZS5qcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgYXNTaGFkZURpcmVjdGl2ZSwgU2V0QXR0cmlidXRlIH0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaW1wb3J0IHsgQXR0cmlidXRlTmFtZXMsIERpcmVjdGl2ZVR5cGUsIHNjcmlwdFR5cGVTaWduaWZpZXIgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IHN1cHByZXNzRXZlbnRGaXJpbmcgfSBmcm9tIFwiLi9ldmVudHNcIjtcbi8vV2UgbmVlZCBzb21lIHdheSBvZiBzdG9yaW5nIHRoZSBvcmlnaW5hbCB2YWx1ZXMgb2YgYW4gYXR0cmlidXRlIGJlZm9yZSBhbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHdhcyBhcHBsaWVkLFxuLy9pbiBjYXNlIHRoYXQgZGlyZWN0aXZlIGlzIHJlbW92ZWQgaW4gYW4gdXBkYXRlIHRoYXQgZG9lcyBub3QgcmVzZXQgYW4gZWxlbWVudCdzIGF0dHJpYnV0ZXMuXG5jb25zdCBhdHRyaWJ1dGVPcmlnaW5hbFZhbHVlcyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UoZWxlbWVudCkge1xuICAgIGNvbnN0IG9yaWdpbmFsTWFwID0gZWxlbWVudFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc107XG4gICAgaWYgKG9yaWdpbmFsTWFwKSB7XG4gICAgICAgIGRlbGV0ZSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQoZWxlbWVudCk7XG4gICAgfVxufVxuZnVuY3Rpb24gbm90ZU9yaWdpbmFsQXR0cmlidXRlKGVsZW1lbnQsIG5hbWUpIHtcbiAgICBsZXQgb3JpZ2luYWxzID0gZWxlbWVudFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc107XG4gICAgaWYgKCFvcmlnaW5hbHMpIHtcbiAgICAgICAgb3JpZ2luYWxzID0gZWxlbWVudFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10gPSB7fTtcbiAgICB9XG4gICAgaWYgKCEobmFtZSBpbiBvcmlnaW5hbHMpKSB7XG4gICAgICAgIG9yaWdpbmFsc1tuYW1lXSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbn1cbmNvbnN0IGlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYFske0F0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGV9PSR7RGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGV9XWA7XG5jb25zdCBiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSA9IGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XSR7aXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmV9YDtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0KSB7XG4gICAgLy9GaXJzdCwgZmluZCBhbGwgU2V0QXR0cmlidXRlIGRpcmVjdGl2ZXMgdGhhdCBhcHBseSB0byB0YXJnZXRcbiAgICBjb25zdCBhcHBsaWNhYmxlID0gQXJyYXkuZnJvbSh0YXJnZXQucXVlcnlTZWxlY3RvckFsbChiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSkpO1xuICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0O1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgaWYgKCFjdXJyZW50IHx8ICFjdXJyZW50Lm1hdGNoZXMoYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dWyR7QXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZX1dYCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGFwcGxpY2FibGUucHVzaChjdXJyZW50KTtcbiAgICB9XG4gICAgLy9OZXh0LCBncm91cCB0aGVtIGJ5IHRoZSBhdHRyaWJ1dGUgdGhleSBhcHBseSB0b1xuICAgIGNvbnN0IGJ5QXR0cmlidXRlTmFtZSA9IHt9O1xuICAgIGZvciAobGV0IGVsIG9mIGFwcGxpY2FibGUpIHtcbiAgICAgICAgY29uc3QgYXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsKTtcbiAgICAgICAgaWYgKGFzRGlyZWN0aXZlICYmIGFzRGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBsZXQgYXJyYXkgPSBieUF0dHJpYnV0ZU5hbWVbYXNEaXJlY3RpdmUubmFtZV07XG4gICAgICAgICAgICBpZiAoIWFycmF5KSB7XG4gICAgICAgICAgICAgICAgYXJyYXkgPSBieUF0dHJpYnV0ZU5hbWVbYXNEaXJlY3RpdmUubmFtZV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFycmF5LnB1c2goYXNEaXJlY3RpdmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vTm93LCBhcHBseSBvbmx5IHRoZSBsYXN0IGRpcmVjdGl2ZSBmb3IgZXZlcnkgYXR0cmlidXRlXG4gICAgZm9yIChsZXQgYXR0cmlidXRlIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJ5QXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlcyA9IGJ5QXR0cmlidXRlTmFtZVthdHRyaWJ1dGVdO1xuICAgICAgICBjb25zdCBsYXN0ID0gZGlyZWN0aXZlc1tkaXJlY3RpdmVzLmxlbmd0aCAtIDFdO1xuICAgICAgICBub3RlT3JpZ2luYWxBdHRyaWJ1dGUodGFyZ2V0LCBsYXN0Lm5hbWUpO1xuICAgICAgICBhcHBseUF0dHJpYnV0ZVZhbHVlKHRhcmdldCwgbGFzdC5uYW1lLCBsYXN0LnZhbHVlKTtcbiAgICB9XG4gICAgLy9GaW5hbGx5LCByZXN0b3JlIHRoZSBvcmlnaW5hbCB2YWx1ZXMgZm9yIGFueSBhdHRyaWJ1dGVzIHRoYXQgbm8gbG9uZ2VyIGhhdmUgZGlyZWN0aXZlc1xuICAgIGNvbnN0IG9yaWdpbmFscyA9IHRhcmdldFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10gfHwge307XG4gICAgZm9yIChsZXQgb3JpZ2luYWwgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxzKSkge1xuICAgICAgICBpZiAoIWJ5QXR0cmlidXRlTmFtZVtvcmlnaW5hbF0pIHtcbiAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUodGFyZ2V0LCBvcmlnaW5hbCwgb3JpZ2luYWxzW29yaWdpbmFsXSk7XG4gICAgICAgICAgICBkZWxldGUgb3JpZ2luYWxzW29yaWdpbmFsXTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmxldCB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzID0gbmV3IFNldCgpO1xuZXhwb3J0IGZ1bmN0aW9uIGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcyhjYikge1xuICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBmb3IgKGxldCB0YXJnZXQgb2YgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcykge1xuICAgICAgICAgICAgdXBkYXRlQXR0cmlidXRlRGlyZWN0aXZlcyh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgPSBuZXcgU2V0KCk7XG4gICAgfVxufVxuY29uc3Qgc2V0QXR0cmlidXRlVGFyZ2V0ID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZShpbmZvKSB7XG4gICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQoaW5mby50YXJnZXQpO1xuICAgIGluZm8uZWxlbWVudFtzZXRBdHRyaWJ1dGVUYXJnZXRdID0gaW5mby50YXJnZXQ7XG59XG5leHBvcnQgZnVuY3Rpb24gbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZVJlbW92ZShlbGVtZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZWxlbWVudFtzZXRBdHRyaWJ1dGVUYXJnZXRdO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQodGFyZ2V0KTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gYXBwbHlBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQsIG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiAobmFtZSA9PSBcInZhbHVlXCIgfHwgbmFtZSA9PSBcImNoZWNrZWRcIikpIHtcbiAgICAgICAgLy9UaGVzZSBzcGVjaWFsIHZhbHVlcyBoYXZlIGVmZmVjdHMgb25seSBvbiB0aGUgXCJpbml0aWFsXCIgaW5zZXJ0aW9uIG9mIGEgRE9NIG9iamVjdDtcbiAgICAgICAgLy9mb3IgY29uc2lzdGVuY3kgd2UgYWx3YXlzIGFwcGx5IHRoZXNlIGVmZmVjdHNcbiAgICAgICAgaWYgKG5hbWUgPT0gXCJ2YWx1ZVwiICYmIHRhcmdldC52YWx1ZSAhPSB2YWx1ZSkge1xuICAgICAgICAgICAgc3VwcHJlc3NDaGFuZ2VMaXN0ZW5lcnModGFyZ2V0LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHZvaWQgMCA/IHZhbHVlIDogXCJcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5hbWUgPT0gXCJjaGVja2VkXCIgJiYgdGFyZ2V0LmNoZWNrZWQgIT0gKHZhbHVlICE9IG51bGwpKSB7XG4gICAgICAgICAgICBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuY2hlY2tlZCA9IHZhbHVlICE9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHN1cHByZXNzQ2hhbmdlTGlzdGVuZXJzKHRhcmdldCwgY2IpIHtcbiAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gdHJ1ZTtcbiAgICBjb25zdCBvbGRPbkNoYW5nZSA9IHRhcmdldC5vbmNoYW5nZTtcbiAgICB0YXJnZXQub25jaGFuZ2UgPSBudWxsO1xuICAgIGNiKCk7XG4gICAgdGFyZ2V0Lm9uY2hhbmdlID0gb2xkT25DaGFuZ2U7XG4gICAgc3VwcHJlc3NFdmVudEZpcmluZy5zdXBwcmVzcyA9IGZhbHNlO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCb3VuZElucHV0KGJvdW5kSWQsIHNlcnZlclNlZW4sIHZhbHVlLCBzZXR0ZXIpIHtcbiAgICBsZXQgaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW1wiICsgQXR0cmlidXRlTmFtZXMuQm91bmQgKyBcIj1cXFwiXCIgKyBib3VuZElkICsgXCJcXFwiXVwiKTtcbiAgICBsZXQgc2VlbiA9IGlucHV0LmJvdW5kU2VlbiB8fCAoaW5wdXQuYm91bmRTZWVuID0gMCk7XG4gICAgaWYgKGlucHV0ICYmIHNlZW4gPD0gc2VydmVyU2Vlbikge1xuICAgICAgICBzZXR0ZXIoaW5wdXQsIHZhbHVlKTtcbiAgICB9XG59XG4iLCIvL0NoYW5nZXMgaGVyZSBzaG91bGQgYmUgbWlycm9yZWQgaW4gQ2xpZW50Q29uc3RhbnRzLmt0XG5leHBvcnQgdmFyIERpcmVjdGl2ZVR5cGU7XG4oZnVuY3Rpb24gKERpcmVjdGl2ZVR5cGUpIHtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQXBwbHlKc1wiXSA9IFwialwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJTZXRBdHRyaWJ1dGVcIl0gPSBcImFcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiRXZlbnRIYW5kbGVyXCJdID0gXCJlXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudFN0YXJ0XCJdID0gXCJzXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudEVuZFwiXSA9IFwiZlwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJDb21wb25lbnRLZWVwXCJdID0gXCJrXCI7XG59KShEaXJlY3RpdmVUeXBlIHx8IChEaXJlY3RpdmVUeXBlID0ge30pKTtcbmV4cG9ydCB2YXIgQXR0cmlidXRlTmFtZXM7XG4oZnVuY3Rpb24gKEF0dHJpYnV0ZU5hbWVzKSB7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJEaXJlY3RpdmVUeXBlXCJdID0gXCJkYXRhLXNcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIlRhcmdldFNpYmxpbmdEaXJlY3RpdmVcIl0gPSBcImRhdGEtZlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQXBwbHlKc1NjcmlwdFwiXSA9IFwiZGF0YS10XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJBcHBseUpzUnVuT3B0aW9uXCJdID0gXCJkYXRhLXJcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIlNldEF0dHJpYnV0ZU5hbWVcIl0gPSBcImRhdGEtYVwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiU2V0QXR0cmlidXRlVmFsdWVcIl0gPSBcImRhdGEtdlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiS2V5XCJdID0gXCJkYXRhLWtcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50TmFtZVwiXSA9IFwiZGF0YS1lXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudENhbGxiYWNrSWRcIl0gPSBcImRhdGEtaVwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnRQcmVmaXhcIl0gPSBcImRhdGEtcFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnRTdWZmaXhcIl0gPSBcImRhdGEteFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnREYXRhXCJdID0gXCJkYXRhLWRcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkJvdW5kXCJdID0gXCJkYXRhLWJcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkNoZWNrYm94XCJdID0gXCJkYXRhLWNcIjtcbn0pKEF0dHJpYnV0ZU5hbWVzIHx8IChBdHRyaWJ1dGVOYW1lcyA9IHt9KSk7XG5leHBvcnQgY29uc3Qgc2NyaXB0VHlwZVNpZ25pZmllciA9IFwic2hhZGVcIjtcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZFByZWZpeCA9IFwic2hhZGVcIjtcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZEVuZFN1ZmZpeCA9IFwiZVwiO1xuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdTZXBhcmF0b3IgPSBcInxcIjtcbmV4cG9ydCBjb25zdCBtZXNzYWdlVGFnRXJyb3JQcmVmaXggPSBcIkVcIjtcbmV4cG9ydCB2YXIgU29ja2V0U2NvcGVOYW1lcztcbihmdW5jdGlvbiAoU29ja2V0U2NvcGVOYW1lcykge1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJyZWNvbmNpbGVcIl0gPSBcInJcIjtcbiAgICBTb2NrZXRTY29wZU5hbWVzW1widXBkYXRlQm91bmRJbnB1dFwiXSA9IFwiYlwiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJzZW5kTWVzc2FnZVwiXSA9IFwic1wiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJzZW5kSWZFcnJvclwiXSA9IFwicVwiO1xufSkoU29ja2V0U2NvcGVOYW1lcyB8fCAoU29ja2V0U2NvcGVOYW1lcyA9IHt9KSk7XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRFbmRTdWZmaXgsIGNvbXBvbmVudElkUHJlZml4LCBEaXJlY3RpdmVUeXBlLCBzY3JpcHRUeXBlU2lnbmlmaWVyIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBxdWVyeVNlbGVjdG9yQWxsUGx1c1RhcmdldCB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7IGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcywgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZSwgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZVJlbW92ZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmltcG9ydCB7IHJ1bkVsZW1lbnRTY3JpcHQgfSBmcm9tIFwiLi9hcHBseWpzXCI7XG5pbXBvcnQgeyByZW1vdmVFdmVudEhhbmRsZXIsIHNldHVwRXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZXZlbnRzXCI7XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhcnQge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RW5kIHtcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEtlZXAge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU2V0QXR0cmlidXRlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEFwcGx5SnMge1xuICAgIGNvbnN0cnVjdG9yKGpzLCBvbmx5T25DcmVhdGUpIHtcbiAgICAgICAgdGhpcy5qcyA9IGpzO1xuICAgICAgICB0aGlzLm9ubHlPbkNyZWF0ZSA9IG9ubHlPbkNyZWF0ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihldmVudE5hbWUsIGNhbGxiYWNrSWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmNhbGxiYWNrSWQgPSBjYWxsYmFja0lkO1xuICAgICAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICAgICAgdGhpcy5zdWZmaXggPSBzdWZmaXg7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGFzU2hhZGVEaXJlY3RpdmUoY2hpbGQpIHtcbiAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBjaGlsZC50YWdOYW1lID09IFwiU0NSSVBUXCIgJiYgY2hpbGQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSA9PT0gc2NyaXB0VHlwZVNpZ25pZmllcikge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBjb25zdCBpZCA9IGNoaWxkLmlkO1xuICAgICAgICBzd2l0Y2ggKGRpcmVjdGl2ZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5BcHBseUpzOlxuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bk9wdGlvbiA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5BcHBseUpzUnVuT3B0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuQXBwbHlKc1NjcmlwdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBcHBseUpzKHNjcmlwdCwgcnVuT3B0aW9uID09PSBcIjFcIik7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50U3RhcnQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRTdGFydChpZC5zdWJzdHIoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50RW5kOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50RW5kKGlkLnN1YnN0cig1LCBpZC5sZW5ndGggLSBjb21wb25lbnRJZFByZWZpeC5sZW5ndGggLSBjb21wb25lbnRJZEVuZFN1ZmZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRLZWVwOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgS2VlcChpZC5zdWJzdHIoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuU2V0QXR0cmlidXRlOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkV2ZW50SGFuZGxlcjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnROYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9ICtjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRDYWxsYmFja0lkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmaXggPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRQcmVmaXgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1ZmZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFN1ZmZpeCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXZlbnRIYW5kbGVyKG5hbWUsIGlkLCBwcmVmaXgsIHN1ZmZpeCwgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkQWxsRGlyZWN0aXZlcyhiYXNlKSB7XG4gICAgY2hhbmdpbmdEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQoYmFzZSk7XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KHNjcmlwdCkge1xuICAgIGlmIChzY3JpcHQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKSB7XG4gICAgICAgIGxldCB0YXJnZXQgPSBzY3JpcHQ7XG4gICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0Lmhhc0F0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlKSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBzY3JpcHQucGFyZW50RWxlbWVudDtcbiAgICB9XG59XG5sZXQgY2hhbmdlZERpcmVjdGl2ZXMgPSBbXTtcbmxldCByZW1vdmVkRGlyZWN0aXZlcyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIGNoYW5naW5nRGlyZWN0aXZlcyhjYikge1xuICAgIGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcygoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhbmdlZCBvZiBjaGFuZ2VkRGlyZWN0aXZlcykge1xuICAgICAgICAgICAgICAgIG9uQWRkZWRPclVwZGF0ZWQoY2hhbmdlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCByZW1vdmVkIG9mIHJlbW92ZWREaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICAgICAgb25SZW1vdmVkKHJlbW92ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhbmdlZERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgICAgIHJlbW92ZWREaXJlY3RpdmVzID0gW107XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiBhZGRlZCBmb3Igc2hhZGUgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVBZGQoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgZm9yIChsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGVsZW1lbnQsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKHNjcmlwdCk7XG4gICAgICAgICAgICBpZiAoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlZERpcmVjdGl2ZXMucHVzaCh7IGRpcmVjdGl2ZSwgZWxlbWVudDogc2NyaXB0IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBDaGVja3MgYW5kIHJlY29yZHMgd2hldGhlciBhbiBlbGVtZW50IHRoYXQgY2hhbmdlZCBpcyBhIHNjcmlwdCBkaXJlY3RpdmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRGlyZWN0aXZlQ2hhbmdlKGVsZW1lbnQpIHtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsZW1lbnQpO1xuICAgIGlmIChkaXJlY3RpdmUpIHtcbiAgICAgICAgY2hhbmdlZERpcmVjdGl2ZXMucHVzaCh7IGRpcmVjdGl2ZSwgZWxlbWVudCB9KTtcbiAgICB9XG59XG4vKipcbiAqIENoZWNrcyBhbiBlbGVtZW50IGFuZCBhbGwgaXRzIGNoaWxkcmVuIHRoYXQgaGF2ZSBqdXN0IGJlZW4gcmVtb3ZlZCBmb3Igc2hhZGUgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVSZW1vdmUoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgZm9yIChsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGVsZW1lbnQsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKHNjcmlwdCk7XG4gICAgICAgICAgICBpZiAoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZERpcmVjdGl2ZXMucHVzaCh7IGRpcmVjdGl2ZSwgZWxlbWVudDogc2NyaXB0IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBDYWxsZWQgYWZ0ZXIgdGhlIGRpcmVjdGl2ZSBjb250YWluZWQgaW4gZWxlbWVudCBpcyBhZGRlZCB0byB0YXJnZXQuXG4gKi9cbmZ1bmN0aW9uIG9uQWRkZWRPclVwZGF0ZWQoaW5mbykge1xuICAgIGNvbnN0IHRhcmdldCA9IGRldGVybWluZVNjcmlwdFRhcmdldChpbmZvLmVsZW1lbnQpO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmU7XG4gICAgICAgIGNvbnN0IGFkZEluZm8gPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGluZm8pLCB7IHRhcmdldCB9KTtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIFNldEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZShhZGRJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBBcHBseUpzKSB7XG4gICAgICAgICAgICBydW5FbGVtZW50U2NyaXB0KGRpcmVjdGl2ZSwgYWRkSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgRXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUsIGFkZEluZm8pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBVbmtub3duIHRhcmdldCBmb3IgJHtpbmZvLmVsZW1lbnQub3V0ZXJIVE1MfWApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9uUmVtb3ZlZChpbmZvKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmU7XG4gICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIFNldEF0dHJpYnV0ZSkge1xuICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGluZm8uZWxlbWVudCk7XG4gICAgfVxuICAgIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbyk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGVycm9yRGlzcGxheShjb250ZW50KSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCI8ZGl2IGlkPSdzaGFkZU1vZGFsJyBzdHlsZT0ncG9zaXRpb246IGZpeGVkO3otaW5kZXg6IDk5OTk5OTk5OTtsZWZ0OiAwO3RvcDogMDt3aWR0aDogMTAwJTtoZWlnaHQ6IDEwMCU7b3ZlcmZsb3c6IGF1dG87YmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDAsMCwwLjQpOyc+PGRpdiBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjogI2ZmZjttYXJnaW46IDE1JSBhdXRvO3BhZGRpbmc6IDIwcHg7Ym9yZGVyOiAxcHggc29saWQgIzg4ODt3aWR0aDogODAlOyc+PHNwYW4gaWQ9J3NoYWRlQ2xvc2UnIHN0eWxlPSdmbG9hdDogcmlnaHQ7Zm9udC1zaXplOiAyOHB4O2ZvbnQtd2VpZ2h0OiBib2xkO2N1cnNvcjogcG9pbnRlcjsnPiZ0aW1lczs8L3NwYW4+PHA+XCIgKyBjb250ZW50ICsgXCI8L3A+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhZGVDbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGFkZU1vZGFsJyk7XG4gICAgICAgIG0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtKTtcbiAgICB9KTtcbn1cbiIsImltcG9ydCB7IHNlbmRJZkVycm9yLCBzZW5kTWVzc2FnZSB9IGZyb20gXCIuL3NvY2tldFwiO1xuaW1wb3J0IHsgcmVjb25jaWxlIH0gZnJvbSBcIi4vcmVjb25jaWxlXCI7XG5pbXBvcnQgeyB1cGRhdGVCb3VuZElucHV0IH0gZnJvbSBcIi4vYm91bmRcIjtcbmltcG9ydCB7IFNvY2tldFNjb3BlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZVNjcmlwdCh0YWcsIHNjb3BlLCBzY3JpcHQpIHtcbiAgICB0cnkge1xuICAgICAgICBzY29wZShzY3JpcHQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBzZW5kSWZFcnJvcihlLCB0YWcsIHNjcmlwdC5zdWJzdHJpbmcoMCwgMjU2KSk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VFdmFsU2NvcGUoc2NvcGUpIHtcbiAgICBjb25zdCBmaW5hbCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgYmFzZVNjb3BlKSwgc2NvcGUpO1xuICAgIGNvbnN0IGJhc2UgPSBbXTtcbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZmluYWwpKSB7XG4gICAgICAgIGJhc2UucHVzaChgdmFyICR7a2V5fT1maW5hbC4ke2tleX07YCk7XG4gICAgfVxuICAgIGNvbnN0IGJhc2VTY3JpcHQgPSBiYXNlLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiO1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICAgIGV2YWwoXCIoZnVuY3Rpb24oKXtcXG5cIiArIGJhc2VTY3JpcHQgKyBzY3JpcHQgKyBcIlxcbn0pKClcIik7XG4gICAgfS5iaW5kKHt9KTtcbn1cbmV4cG9ydCBjb25zdCBiYXNlU2NvcGUgPSB7XG4gICAgW1NvY2tldFNjb3BlTmFtZXMucmVjb25jaWxlXTogcmVjb25jaWxlLFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnVwZGF0ZUJvdW5kSW5wdXRdOiB1cGRhdGVCb3VuZElucHV0LFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlXTogc2VuZE1lc3NhZ2UsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZElmRXJyb3JdOiBzZW5kSWZFcnJvclxufTtcbiIsImltcG9ydCB7IFNvY2tldFNjb3BlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGV2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlIH0gZnJvbSBcIi4vZXZhbFwiO1xuZXhwb3J0IGxldCBzdXBwcmVzc0V2ZW50RmlyaW5nID0geyBzdXBwcmVzczogZmFsc2UgfTtcbmNvbnN0IGV2ZW50UHJldmlvdXMgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUsIGluZm8pIHtcbiAgICByZW1vdmVQcmV2aW91c2x5SW5zdGFsbGVkKGluZm8uZWxlbWVudCk7XG4gICAgY29uc3QgcHJlZml4ID0gZGlyZWN0aXZlLnByZWZpeCA/IGAke2RpcmVjdGl2ZS5wcmVmaXh9O1xcbmAgOiBcIlwiO1xuICAgIGNvbnN0IGRhdGEgPSBkaXJlY3RpdmUuZGF0YSA/IGAsSlNPTi5zdHJpbmdpZnkoJHtkaXJlY3RpdmUuZGF0YX0pYCA6IFwiXCI7XG4gICAgY29uc3Qgc3VmZml4ID0gZGlyZWN0aXZlLnN1ZmZpeCA/IGA7XFxuJHtkaXJlY3RpdmUuc3VmZml4fWAgOiBcIlwiO1xuICAgIGNvbnN0IHNjcmlwdCA9IGAke3ByZWZpeH0ke1NvY2tldFNjb3BlTmFtZXMuc2VuZE1lc3NhZ2V9KCR7ZGlyZWN0aXZlLmNhbGxiYWNrSWR9JHtkYXRhfSkke3N1ZmZpeH1gO1xuICAgIGNvbnN0IGxpc3RlbmVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHN1cHByZXNzRXZlbnRGaXJpbmcuc3VwcHJlc3MpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe1xuICAgICAgICAgICAgZXZlbnQ6IGUsXG4gICAgICAgICAgICBlOiBlLFxuICAgICAgICAgICAgaXQ6IGUudGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBzY3JpcHQpO1xuICAgIH07XG4gICAgaW5mby50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihkaXJlY3RpdmUuZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgaW5mby5lbGVtZW50W2V2ZW50UHJldmlvdXNdID0ge1xuICAgICAgICBldmVudE5hbWU6IGRpcmVjdGl2ZS5ldmVudE5hbWUsXG4gICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbykge1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoZWxlbWVudCkge1xuICAgIGNvbnN0IHByZXZpb3VzID0gZWxlbWVudFtldmVudFByZXZpb3VzXTtcbiAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgcHJldmlvdXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJldmlvdXMuZXZlbnROYW1lLCBwcmV2aW91cy5saXN0ZW5lcik7XG4gICAgfVxufVxuIiwiLy9SZWNvbmNpbGUgYSB0YXJnZXRJZCB3aXRoIEhUTUxcbmltcG9ydCB7IGFzU2hhZGVEaXJlY3RpdmUsIGNoYW5naW5nRGlyZWN0aXZlcywgY2hlY2tEaXJlY3RpdmVBZGQsIGNoZWNrRGlyZWN0aXZlQ2hhbmdlLCBjaGVja0RpcmVjdGl2ZVJlbW92ZSwgQ29tcG9uZW50RW5kLCBDb21wb25lbnRTdGFydCwgS2VlcCwgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRQcmVmaXggfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGFwcGx5QXR0cmlidXRlVmFsdWUsIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UgfSBmcm9tIFwiLi9hdHRyaWJ1dGVzXCI7XG5leHBvcnQgZnVuY3Rpb24gcmVjb25jaWxlKHRhcmdldElkLCBodG1sKSB7XG4gICAgY2hhbmdpbmdEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29tcG9uZW50SWRQcmVmaXggKyB0YXJnZXRJZCk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGh0bWxEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHBhcmVudC50YWdOYW1lKTtcbiAgICAgICAgaHRtbERvbS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBjb25zdCBpbmNsdWRlZCA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudCA9IHRhcmdldC5uZXh0U2libGluZztcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY3VycmVudCk7XG4gICAgICAgICAgICBpZiAoY3VycmVudERpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjdXJyZW50RGlyZWN0aXZlLmlkID09IFwiXCIgKyB0YXJnZXRJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaChjdXJyZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIHBhdGNoQ2hpbGRyZW4ocGFyZW50LCB0YXJnZXQsIGluY2x1ZGVkLCBodG1sRG9tLmNoaWxkTm9kZXMpO1xuICAgIH0pO1xufVxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydERpcmVjdGl2ZSwgc3RhcnQsIGNoaWxkcmVuLCBlbmQpIHtcbiAgICAgICAgdGhpcy5zdGFydERpcmVjdGl2ZSA9IHN0YXJ0RGlyZWN0aXZlO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgfVxuICAgIGFzTm9kZXMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5zdGFydCwgLi4udGhpcy5jaGlsZHJlbiwgdGhpcy5lbmRdO1xuICAgIH1cbiAgICBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnREaXJlY3RpdmUuaWQ7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNOb2Rlcyh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGFyZ2V0IGluc3RhbmNlb2YgQ29tcG9uZW50ID8gdGFyZ2V0LmFzTm9kZXMoKSA6IFt0YXJnZXRdO1xufVxuZnVuY3Rpb24gcmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKSB7XG4gICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAob3JpZ2luYWwudGFnTmFtZSAhPSBuZXdlci50YWdOYW1lKSB7XG4gICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChuZXdlcik7XG4gICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShvcmlnaW5hbCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmlnaW5hbC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gb3JpZ2luYWwuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmICghbmV3ZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZShvcmlnaW5hbCwgYXR0cmlidXRlLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdlci5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbmV3ZXIuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZGVyQXR0ciA9IG9yaWdpbmFsLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld2VyQXR0ciA9IG5ld2VyLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGlmIChvbGRlckF0dHIgIT0gbmV3ZXJBdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUob3JpZ2luYWwsIGF0dHJpYnV0ZSwgbmV3ZXJBdHRyKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICBvbkF0dHJpYnV0ZXNTZXRGcm9tU291cmNlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUNoYW5nZShvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKG9yaWdpbmFsLCBudWxsLCBvcmlnaW5hbC5jaGlsZE5vZGVzLCBuZXdlci5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIFRleHQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgIGlmIChvcmlnaW5hbC50ZXh0Q29udGVudCA9PSBuZXdlci50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgfVxufVxuZnVuY3Rpb24gcGF0Y2hDaGlsZHJlbihkb20sIGFwcGVuZFN0YXJ0LCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbikge1xuICAgIGNvbnN0IGZpbmFsID0gcmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbik7XG4gICAgbGV0IGVuZE9mUGF0Y2hSYW5nZTtcbiAgICBpZiAoZG9tQ2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBkb21DaGlsZHJlbltkb21DaGlsZHJlbi5sZW5ndGggLSAxXS5uZXh0U2libGluZztcbiAgICB9XG4gICAgZWxzZSBpZiAoYXBwZW5kU3RhcnQpIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gYXBwZW5kU3RhcnQubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBudWxsO1xuICAgIH1cbiAgICBsZXQgY3VycmVudCA9IGFwcGVuZFN0YXJ0ID8gYXBwZW5kU3RhcnQgOiBcInN0YXJ0XCI7XG4gICAgZnVuY3Rpb24gYWZ0ZXJDdXJyZW50KCkge1xuICAgICAgICBpZiAoY3VycmVudCA9PSBcInN0YXJ0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBkb20uZmlyc3RDaGlsZCA/IGRvbS5maXJzdENoaWxkIDogXCJlbmRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdXJyZW50ID09IFwiZW5kXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcImVuZFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQubmV4dFNpYmxpbmcgPyBjdXJyZW50Lm5leHRTaWJsaW5nIDogXCJlbmRcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZpbmFsKSB7XG4gICAgICAgIGxldCBuZXh0ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGlmIChuZXh0ICE9PSBjaGlsZCkge1xuICAgICAgICAgICAgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgbmV4dCA9PT0gXCJlbmRcIiA/IG51bGwgOiBuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY2hpbGQ7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICB3aGlsZSAoY3VycmVudCAhPSBcImVuZFwiICYmIGN1cnJlbnQgIT0gZW5kT2ZQYXRjaFJhbmdlKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY3VycmVudDtcbiAgICAgICAgY3VycmVudCA9IGFmdGVyQ3VycmVudCgpO1xuICAgICAgICBkb20ucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlY29uY2lsZUNoaWxkcmVuKGRvbSwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3Qgb3JpZ2luYWxzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihkb21DaGlsZHJlbik7XG4gICAgY29uc3QgcmVwbGFjZW1lbnRzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihyZXBsYWNlbWVudENoaWxkcmVuKTtcbiAgICBjb25zdCBvcmlnaW5hbEtleXMgPSBjb2xsZWN0S2V5c01hcChvcmlnaW5hbHMpO1xuICAgIGxldCBvcmlnaW5hbEluZGV4ID0gMDtcbiAgICBsZXQgcmVwbGFjZW1lbnRJbmRleCA9IDA7XG4gICAgY29uc3QgZmluYWxDaGlsZHJlbiA9IFtdO1xuICAgIHdoaWxlIChvcmlnaW5hbEluZGV4IDwgb3JpZ2luYWxzLmxlbmd0aCB8fCByZXBsYWNlbWVudEluZGV4IDwgcmVwbGFjZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBsZXQgb3JpZ2luYWwgPSBvcmlnaW5hbHNbb3JpZ2luYWxJbmRleF07XG4gICAgICAgIGNvbnN0IG5ld2VyID0gcmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50SW5kZXhdO1xuICAgICAgICAvL1NraXAgYW55IGtleWVkIG9yaWdpbmFsczsgdGhleSB3aWxsIGJlIGxvb2tlZCB1cCBieSBrZXlcbiAgICAgICAgaWYgKG9yaWdpbmFsICYmIGdldEtleShvcmlnaW5hbCkgIT0gbnVsbCkge1xuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsICYmICFuZXdlcikge1xuICAgICAgICAgICAgLyogSW1wbGljaXQgcmVtb3ZlICovXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIGFzTm9kZXMob3JpZ2luYWwpKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICAvL1RleHQgbm9kZXMgaGF2ZSBubyBpbnRlcmVzdGluZyBpZGVudGl0eSBvciBjaGlsZHJlbiB0byBwcmVzZXJ2ZSwgYW5kIHRoZVxuICAgICAgICAgICAgLy9Lb3RsaW4gc2lkZSBjYW4ndCB0cmFjayB0aGVtIGZvciBwb3NpdGlvbiBtYXRjaGluZywgc28gd2UganVzdCBza2lwIG92ZXIgdGhlbVxuICAgICAgICAgICAgLy9pbiBjb21wYXJpc29ucyBhbmQgYWRkIHRoZSBuZXdlciB0ZXh0IGFsd2F5cy5cbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuZXdlciBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaChuZXdlcik7XG4gICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvL1RoZSBzZXJ2ZXIgZG9lcyBub3QgdHJhY2sgdGhlIHBvc2l0aW9uIG9mIG1vc3QgZGlyZWN0aXZlcywgZXhjZXB0IGtlZXAsIHNvIHRoZXkgYXJlIHNwZWNpYWxseSBoYW5kbGVkXG4gICAgICAgICAgICAvL2ZvciBtYXRjaGluZ1xuICAgICAgICAgICAgY29uc3QgbmV3ZXJEaXJlY3RpdmUgPSBuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCA/IG51bGwgOiBhc1NoYWRlRGlyZWN0aXZlKG5ld2VyKTtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSXNEaXJlY3RpdmUgPSBvcmlnaW5hbCBpbnN0YW5jZW9mIE5vZGUgJiYgYXNTaGFkZURpcmVjdGl2ZShvcmlnaW5hbCkgIT0gbnVsbDtcbiAgICAgICAgICAgIGlmIChuZXdlciBpbnN0YW5jZW9mIE5vZGUgJiYgbmV3ZXJEaXJlY3RpdmUgIT0gbnVsbCAmJiAhKG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxJc0RpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gocmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKSk7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaChuZXdlcik7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5ld2VyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRJbmRleCArPSAxO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob3JpZ2luYWxJc0RpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXdlcktleSA9IGdldEtleShuZXdlcik7XG4gICAgICAgICAgICBpZiAobmV3ZXJLZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAvL1dlJ2xsIG1hdGNoIHRoaXMgdW5rZXllZCBvcmlnaW5hbCBhZ2FpbiBvbiBzb21ldGhpbmcgd2l0aG91dCBhIGtleVxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gKF9hID0gb3JpZ2luYWxLZXlzW25ld2VyS2V5XSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGFkZCA9IFtdO1xuICAgICAgICAgICAgZnVuY3Rpb24gdXNlTmV3ZXIoKSB7XG4gICAgICAgICAgICAgICAgYWRkID0gYXNOb2RlcyhuZXdlcik7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhZGQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIGFzTm9kZXMob3JpZ2luYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcmlnaW5hbCAmJiBvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCAmJiBuZXdlckRpcmVjdGl2ZSBpbnN0YW5jZW9mIEtlZXAgJiYgKG5ld2VyRGlyZWN0aXZlLmlkID09IG9yaWdpbmFsLmlkKCkgfHwgbmV3ZXJLZXkpKSB7XG4gICAgICAgICAgICAgICAgYWRkID0gYXNOb2RlcyhvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9yaWdpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3ZXIgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCAmJiBvcmlnaW5hbC5pZCgpID09IG5ld2VyLmlkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZWNvbmNpbGVDaGlsZHJlbihkb20sIG9yaWdpbmFsLmNoaWxkcmVuLCBuZXdlci5jaGlsZHJlbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLmVuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkID0gW3JlY29uY2lsZU5vZGVzKG9yaWdpbmFsLCBuZXdlcildO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxDaGlsZHJlbi5wdXNoKC4uLmFkZCk7XG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9BbGwgcmVtYWluaW5nIGtleXMgaW4gdGhlIG1hcCB3aWxsIG5vdCBoYXZlIGJlZW4gdXNlZC5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvcmlnaW5hbEtleXMpKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFscyA9IG9yaWdpbmFsS2V5c1trZXldO1xuICAgICAgICBmb3IgKGxldCBvcmlnaW5hbCBvZiBvcmlnaW5hbHMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpIHtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmluYWxDaGlsZHJlbjtcbn1cbmZ1bmN0aW9uIGNvbGxhcHNlQ29tcG9uZW50Q2hpbGRyZW4obGlzdCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGxpc3RbaV07XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY2hpbGQpO1xuICAgICAgICBsZXQgZW5kID0gbnVsbDtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudFN0YXJ0KSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJDaGlsZCA9IGxpc3RbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRBc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc3ViQ2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZEFzRGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50RW5kICYmIGNoaWxkQXNEaXJlY3RpdmUuaWQgPT0gZGlyZWN0aXZlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN1YkNoaWxkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wdXNoKHN1YkNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVuZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJNaXNzaW5nIGVuZCB0YWcgZm9yIGNvbXBvbmVudCBcIiArIGRpcmVjdGl2ZS5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQucHVzaChuZXcgQ29tcG9uZW50KGRpcmVjdGl2ZSwgY2hpbGQsIGNvbXBvbmVudCwgZW5kKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNvbGxlY3RLZXlzTWFwKGNoaWxkTGlzdCkge1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkTGlzdFtpXTtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0S2V5KGNoaWxkKTtcbiAgICAgICAgaWYgKGtleSAhPSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgbGlzdCA9IGtleXNba2V5XTtcbiAgICAgICAgICAgIGlmICghbGlzdCkge1xuICAgICAgICAgICAgICAgIGxpc3QgPSBrZXlzW2tleV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5mdW5jdGlvbiBnZXRLZXkoY2hpbGQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBjaGlsZCBpbnN0YW5jZW9mIENvbXBvbmVudCA/IGNoaWxkLnN0YXJ0IDogY2hpbGQ7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuS2V5KTtcbiAgICAgICAgaWYgKGtleSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IHsgZXJyb3JEaXNwbGF5IH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgeyBldmFsdWF0ZVNjcmlwdCwgbWFrZUV2YWxTY29wZSB9IGZyb20gXCIuL2V2YWxcIjtcbmltcG9ydCB7IG1lc3NhZ2VUYWdFcnJvclByZWZpeCwgbWVzc2FnZVRhZ1NlcGFyYXRvciB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgd2hlbkRvY3VtZW50UmVhZHkgfSBmcm9tIFwiLi91dGlsaXR5XCI7XG5sZXQgc29ja2V0UmVhZHkgPSBmYWxzZTtcbmNvbnN0IHNvY2tldFJlYWR5UXVldWUgPSBbXTtcbmxldCBzb2NrZXQ7XG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdFNvY2tldCgpIHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHdpbmRvdy5zaGFkZUVuZHBvaW50LCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgaWYgKHdpbmRvdy5zaGFkZUhvc3QpIHtcbiAgICAgICAgdXJsLmhvc3QgPSB3aW5kb3cuc2hhZGVIb3N0O1xuICAgIH1cbiAgICB1cmwucHJvdG9jb2wgPSAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gXCJ3c3M6Ly9cIiA6IFwid3M6Ly9cIik7XG4gICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwuaHJlZik7XG4gICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgaWQgPSB3aW5kb3cuc2hhZGVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWQgd2l0aCBJRCBcIiArIGlkKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIHNvY2tldC5zZW5kKGlkKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoc29ja2V0UmVhZHlRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZW5kTWVzc2FnZShzb2NrZXRSZWFkeVF1ZXVlLnNoaWZ0KCksIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhO1xuICAgICAgICBjb25zdCBzcGxpdEluZGV4ID0gZGF0YS5pbmRleE9mKG1lc3NhZ2VUYWdTZXBhcmF0b3IpO1xuICAgICAgICBjb25zdCB0YWcgPSBkYXRhLnN1YnN0cmluZygwLCBzcGxpdEluZGV4KTtcbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZGF0YS5zdWJzdHJpbmcoc3BsaXRJbmRleCArIDEsIGRhdGEubGVuZ3RoKTtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHt9KTtcbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZhbHVhdGVTY3JpcHQodGFnLCBzY29wZSwgc2NyaXB0KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBsZXQgZXJyb3JUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICBmdW5jdGlvbiBlcnJvclJlbG9hZCgpIHtcbiAgICAgICAgaWYgKGVycm9yVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3JUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsYXN0UmVsb2FkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIGlmIChsYXN0UmVsb2FkKSB7XG4gICAgICAgICAgICBlcnJvckRpc3BsYXkoXCJUaGlzIHdlYiBwYWdlIGNvdWxkIG5vdCBjb25uZWN0IHRvIGl0cyBzZXJ2ZXIuIFBsZWFzZSByZWxvYWQgb3IgdHJ5IGFnYWluIGxhdGVyLlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hhZGVfbGFzdF9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFNvY2tldCBjbG9zZWQ6ICR7ZXZ0LnJlYXNvbn0sICR7ZXZ0Lndhc0NsZWFufWApO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuICAgICAgICBpZiAoZXZ0Lndhc0NsZWFuKSB7XG4gICAgICAgICAgICAvL2Nvbm5lY3RTb2NrZXQoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dH1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICB9O1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChcIlwiKTtcbiAgICAgICAgfVxuICAgIH0sIDYwICogMTAwMCk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2VuZE1lc3NhZ2UoaWQsIG1zZykge1xuICAgIGNvbnN0IGZpbmFsTXNnID0gKG1zZyAhPT0gdW5kZWZpbmVkICYmIG1zZyAhPT0gbnVsbCkgPyBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3IgKyBtc2cgOiBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3I7XG4gICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgIHNvY2tldC5zZW5kKGZpbmFsTXNnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNvY2tldFJlYWR5UXVldWUucHVzaChmaW5hbE1zZyk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRJZkVycm9yKGVycm9yLCB0YWcsIGV2YWxUZXh0KSB7XG4gICAgY29uc3QgZGF0YSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyB7XG4gICAgICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgICAgIGpzTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9IDoge1xuICAgICAgICBuYW1lOiBcIlVua25vd25cIixcbiAgICAgICAganNNZXNzYWdlOiBcIlVua25vd24gZXJyb3I6IFwiICsgZXJyb3IsXG4gICAgICAgIHN0YWNrOiBcIlwiLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9O1xuICAgIHNvY2tldC5zZW5kKGAke21lc3NhZ2VUYWdFcnJvclByZWZpeH0ke3RhZyA9PSB1bmRlZmluZWQgPyBcIlwiIDogdGFnfSR7bWVzc2FnZVRhZ1NlcGFyYXRvcn1gICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KHRhcmdldCwgc2VsZWN0b3IpIHtcbiAgICBjb25zdCBiZWxvdyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICBpZiAodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbdGFyZ2V0LCAuLi5iZWxvd107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShiZWxvdyk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5Eb2N1bWVudFJlYWR5KGZuKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImludGVyYWN0aXZlXCIpIHtcbiAgICAgICAgZm4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZuKTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGNvbm5lY3RTb2NrZXQsIHNlbmRJZkVycm9yIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyBlcnJvckRpc3BsYXkgfSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7IHdoZW5Eb2N1bWVudFJlYWR5IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHsgYWRkQWxsRGlyZWN0aXZlcyB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmlmICghd2luZG93LnNoYWRlKSB7XG4gICAgd2luZG93LnNoYWRlID0ge307XG4gICAgaWYgKCF3aW5kb3cuV2ViU29ja2V0KSB7XG4gICAgICAgIGVycm9yRGlzcGxheShcIllvdXIgd2ViIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHRoaXMgcGFnZSwgYW5kIGl0IG1heSBub3QgZnVuY3Rpb24gY29ycmVjdGx5IGFzIGEgcmVzdWx0LiBVcGdyYWRlIHlvdXIgd2ViIGJyb3dzZXIuXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29ubmVjdFNvY2tldCgpO1xuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhZGRBbGxEaXJlY3RpdmVzKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LmVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LnJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==