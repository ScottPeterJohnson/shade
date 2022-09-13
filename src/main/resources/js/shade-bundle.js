/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/shade.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/applyjs.ts":
/*!************************!*\
  !*** ./src/applyjs.ts ***!
  \************************/
/*! exports provided: runElementScript */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "runElementScript", function() { return runElementScript; });
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
        const scope = Object(_eval__WEBPACK_IMPORTED_MODULE_0__["makeEvalScope"])({
            it
        });
        Object(_eval__WEBPACK_IMPORTED_MODULE_0__["evaluateScript"])(undefined, scope, directive.js);
    }
}


/***/ }),

/***/ "./src/attributes.ts":
/*!***************************!*\
  !*** ./src/attributes.ts ***!
  \***************************/
/*! exports provided: onAttributesSetFromSource, changingAttributeDirectives, noteAttributeDirectiveChange, noteAttributeDirectiveRemove */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onAttributesSetFromSource", function() { return onAttributesSetFromSource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "changingAttributeDirectives", function() { return changingAttributeDirectives; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteAttributeDirectiveChange", function() { return noteAttributeDirectiveChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteAttributeDirectiveRemove", function() { return noteAttributeDirectiveRemove; });
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./directives */ "./src/directives.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");


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
const isSetAttributeDirective = `[${_constants__WEBPACK_IMPORTED_MODULE_1__["AttributeNames"].DirectiveType}=${_constants__WEBPACK_IMPORTED_MODULE_1__["DirectiveType"].SetAttribute}]`;
const baseQueryIsSetAttributeDirective = `script[type=${_constants__WEBPACK_IMPORTED_MODULE_1__["scriptTypeSignifier"]}]${isSetAttributeDirective}`;
function updateAttributeDirectives(target) {
    //First, find all SetAttribute directives that apply to target
    const applicable = Array.from(target.querySelectorAll(baseQueryIsSetAttributeDirective));
    let current = target;
    while (true) {
        current = current.nextElementSibling;
        if (!current || !current.matches(`script[type=${_constants__WEBPACK_IMPORTED_MODULE_1__["scriptTypeSignifier"]}][${_constants__WEBPACK_IMPORTED_MODULE_1__["AttributeNames"].TargetSiblingDirective}]`)) {
            break;
        }
        applicable.push(current);
    }
    //Next, group them by the attribute they apply to
    const byAttributeName = {};
    for (let el of applicable) {
        const asDirective = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(el);
        if (asDirective && asDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["SetAttribute"]) {
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
        apply(target, last.name, last.value);
    }
    //Finally, restore the original values for any attributes that no longer have directives
    const originals = target[attributeOriginalValues] || {};
    for (let original of Object.getOwnPropertyNames(originals)) {
        if (!byAttributeName[original]) {
            apply(target, original, originals[original]);
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
function apply(target, name, value) {
    if (value == null) {
        target.removeAttribute(name);
    }
    else {
        target.setAttribute(name, value);
    }
}


/***/ }),

/***/ "./src/bound.ts":
/*!**********************!*\
  !*** ./src/bound.ts ***!
  \**********************/
/*! exports provided: updateBoundInput */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateBoundInput", function() { return updateBoundInput; });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");

function updateBoundInput(boundId, serverSeen, value, setter) {
    let input = document.querySelector("[" + _constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].Bound + "=\"" + boundId + "\"]");
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
/*! exports provided: DirectiveType, AttributeNames, scriptTypeSignifier, componentIdPrefix, componentIdEndSuffix, messageTagSeparator, messageTagErrorPrefix, SocketScopeNames */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DirectiveType", function() { return DirectiveType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AttributeNames", function() { return AttributeNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scriptTypeSignifier", function() { return scriptTypeSignifier; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "componentIdPrefix", function() { return componentIdPrefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "componentIdEndSuffix", function() { return componentIdEndSuffix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "messageTagSeparator", function() { return messageTagSeparator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "messageTagErrorPrefix", function() { return messageTagErrorPrefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SocketScopeNames", function() { return SocketScopeNames; });
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
/*! exports provided: ComponentStart, ComponentEnd, Keep, SetAttribute, ApplyJs, EventHandler, asShadeDirective, addAllDirectives, determineScriptTarget, changingDirectives, checkDirectiveAdd, checkDirectiveChange, checkDirectiveRemove */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentStart", function() { return ComponentStart; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentEnd", function() { return ComponentEnd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Keep", function() { return Keep; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SetAttribute", function() { return SetAttribute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ApplyJs", function() { return ApplyJs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EventHandler", function() { return EventHandler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asShadeDirective", function() { return asShadeDirective; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addAllDirectives", function() { return addAllDirectives; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determineScriptTarget", function() { return determineScriptTarget; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "changingDirectives", function() { return changingDirectives; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkDirectiveAdd", function() { return checkDirectiveAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkDirectiveChange", function() { return checkDirectiveChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkDirectiveRemove", function() { return checkDirectiveRemove; });
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
    if (child instanceof HTMLElement && child.tagName == "SCRIPT" && child.getAttribute("type") === _constants__WEBPACK_IMPORTED_MODULE_0__["scriptTypeSignifier"]) {
        const directiveType = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].DirectiveType);
        const id = child.id;
        switch (directiveType) {
            case _constants__WEBPACK_IMPORTED_MODULE_0__["DirectiveType"].ApplyJs:
                const runOption = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].ApplyJsRunOption);
                const script = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].ApplyJsScript);
                return new ApplyJs(script, runOption === "1");
            case _constants__WEBPACK_IMPORTED_MODULE_0__["DirectiveType"].ComponentStart:
                return new ComponentStart(id.substr(_constants__WEBPACK_IMPORTED_MODULE_0__["componentIdPrefix"].length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__["DirectiveType"].ComponentEnd:
                return new ComponentEnd(id.substr(5, id.length - _constants__WEBPACK_IMPORTED_MODULE_0__["componentIdPrefix"].length - _constants__WEBPACK_IMPORTED_MODULE_0__["componentIdEndSuffix"].length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__["DirectiveType"].ComponentKeep:
                return new Keep(id.substr(_constants__WEBPACK_IMPORTED_MODULE_0__["componentIdPrefix"].length));
            case _constants__WEBPACK_IMPORTED_MODULE_0__["DirectiveType"].SetAttribute: {
                const name = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].SetAttributeName);
                const value = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].SetAttributeValue);
                return new SetAttribute(name, value);
            }
            case _constants__WEBPACK_IMPORTED_MODULE_0__["DirectiveType"].EventHandler: {
                const name = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].EventName);
                const id = +child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].EventCallbackId);
                const prefix = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].EventPrefix);
                const suffix = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].EventSuffix);
                const data = child.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].EventData);
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
    if (script.hasAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].TargetSiblingDirective)) {
        let target = script;
        while (target && target.hasAttribute(_constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].TargetSiblingDirective)) {
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
    Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["changingAttributeDirectives"])(() => {
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
        for (let script of Object(_utility__WEBPACK_IMPORTED_MODULE_1__["querySelectorAllPlusTarget"])(element, `script[type=${_constants__WEBPACK_IMPORTED_MODULE_0__["scriptTypeSignifier"]}]`)) {
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
        for (let script of Object(_utility__WEBPACK_IMPORTED_MODULE_1__["querySelectorAllPlusTarget"])(element, `script[type=${_constants__WEBPACK_IMPORTED_MODULE_0__["scriptTypeSignifier"]}]`)) {
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
            Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["noteAttributeDirectiveChange"])(addInfo);
        }
        else if (directive instanceof ApplyJs) {
            Object(_applyjs__WEBPACK_IMPORTED_MODULE_3__["runElementScript"])(directive, addInfo);
        }
        else if (directive instanceof EventHandler) {
            Object(_events__WEBPACK_IMPORTED_MODULE_4__["setupEventHandler"])(directive, addInfo);
        }
    }
    else {
        console.error(`Unknown target for ${info.element.outerHTML}`);
    }
}
function onRemoved(info) {
    const directive = info.directive;
    if (directive instanceof SetAttribute) {
        Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["noteAttributeDirectiveRemove"])(info.element);
    }
    if (directive instanceof EventHandler) {
        Object(_events__WEBPACK_IMPORTED_MODULE_4__["removeEventHandler"])(directive, info);
    }
}


/***/ }),

/***/ "./src/errors.ts":
/*!***********************!*\
  !*** ./src/errors.ts ***!
  \***********************/
/*! exports provided: errorDisplay */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorDisplay", function() { return errorDisplay; });
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
/*! exports provided: evaluateScript, makeEvalScope, baseScope */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "evaluateScript", function() { return evaluateScript; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeEvalScope", function() { return makeEvalScope; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "baseScope", function() { return baseScope; });
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket */ "./src/socket.ts");
/* harmony import */ var _reconcile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reconcile */ "./src/reconcile.ts");
/* harmony import */ var _bound__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bound */ "./src/bound.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");




function evaluateScript(tag, scope, script) {
    try {
        scope(script);
    }
    catch (e) {
        Object(_socket__WEBPACK_IMPORTED_MODULE_0__["sendIfError"])(e, tag, script.substring(0, 256));
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
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].reconcile]: _reconcile__WEBPACK_IMPORTED_MODULE_1__["reconcile"],
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].updateBoundInput]: _bound__WEBPACK_IMPORTED_MODULE_2__["updateBoundInput"],
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].sendMessage]: _socket__WEBPACK_IMPORTED_MODULE_0__["sendMessage"],
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].sendIfError]: _socket__WEBPACK_IMPORTED_MODULE_0__["sendIfError"]
};


/***/ }),

/***/ "./src/events.ts":
/*!***********************!*\
  !*** ./src/events.ts ***!
  \***********************/
/*! exports provided: setupEventHandler, removeEventHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupEventHandler", function() { return setupEventHandler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeEventHandler", function() { return removeEventHandler; });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _eval__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./eval */ "./src/eval.ts");


const eventPrevious = Symbol();
function setupEventHandler(directive, info) {
    removePreviouslyInstalled(info.element);
    const prefix = directive.prefix ? `${directive.prefix};\n` : "";
    const data = directive.data ? `,JSON.stringify(${directive.data})` : "";
    const suffix = directive.suffix ? `;\n${directive.suffix}` : "";
    const script = `${prefix}${_constants__WEBPACK_IMPORTED_MODULE_0__["SocketScopeNames"].sendMessage}(${directive.callbackId}${data})${suffix}`;
    const listener = function (e) {
        const scope = Object(_eval__WEBPACK_IMPORTED_MODULE_1__["makeEvalScope"])({
            event: e,
            e: e,
            it: e.target
        });
        Object(_eval__WEBPACK_IMPORTED_MODULE_1__["evaluateScript"])(undefined, scope, script);
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
/*! exports provided: reconcile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reconcile", function() { return reconcile; });
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./directives */ "./src/directives.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _attributes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./attributes */ "./src/attributes.ts");
//Reconcile a targetId with HTML



function reconcile(targetId, html) {
    Object(_directives__WEBPACK_IMPORTED_MODULE_0__["changingDirectives"])(() => {
        const target = document.getElementById(_constants__WEBPACK_IMPORTED_MODULE_1__["componentIdPrefix"] + targetId);
        if (!target) {
            return;
        }
        const parent = target.parentElement;
        const htmlDom = document.createElement(parent.tagName);
        htmlDom.innerHTML = html;
        const included = [];
        let current = target.nextSibling;
        while (current != null) {
            const currentDirective = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(current);
            if (currentDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["ComponentEnd"] && currentDirective.id == "" + targetId) {
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
            Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveAdd"])(newer);
            Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveRemove"])(original);
            return newer;
        }
        else {
            let changed = false;
            for (let i = 0; i < original.attributes.length; i++) {
                const attribute = original.attributes[i].name;
                if (!newer.hasAttribute(attribute)) {
                    original.removeAttribute(attribute);
                    changed = true;
                }
            }
            for (let i = 0; i < newer.attributes.length; i++) {
                const attribute = newer.attributes[i].name;
                const olderAttr = original.getAttribute(attribute);
                const newerAttr = newer.getAttribute(attribute);
                if (olderAttr != newerAttr) {
                    original.setAttribute(attribute, newerAttr);
                    changed = true;
                }
            }
            if (changed) {
                Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["onAttributesSetFromSource"])(original);
                Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveChange"])(original);
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
                Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveRemove"])(node);
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
                    Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveAdd"])(node);
                }
                if (original) {
                    for (let node of asNodes(original)) {
                        Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveRemove"])(node);
                    }
                }
            }
            const newerDirective = newer instanceof Component ? null : Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(newer);
            if (original && original instanceof Component && newerDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["Keep"] && (newerDirective.id == original.id() || newerKey)) {
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
                Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveRemove"])(node);
            }
        }
    }
    return finalChildren;
}
function collapseComponentChildren(list) {
    const result = [];
    for (let i = 0; i < list.length; i++) {
        const child = list[i];
        const directive = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(child);
        let end = null;
        if (directive instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["ComponentStart"]) {
            i++;
            const component = [];
            while (i < list.length) {
                const subChild = list[i];
                const childAsDirective = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(subChild);
                if (childAsDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["ComponentEnd"] && childAsDirective.id == directive.id) {
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
        const key = target.getAttribute(_constants__WEBPACK_IMPORTED_MODULE_1__["AttributeNames"].Key);
        if (key != null) {
            return key;
        }
    }
    return null;
}


/***/ }),

/***/ "./src/shade.ts":
/*!**********************!*\
  !*** ./src/shade.ts ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket */ "./src/socket.ts");
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./errors */ "./src/errors.ts");
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utility */ "./src/utility.ts");
/* harmony import */ var _directives__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./directives */ "./src/directives.ts");




if (!window.shade) {
    window.shade = {};
    if (!window.WebSocket) {
        Object(_errors__WEBPACK_IMPORTED_MODULE_1__["errorDisplay"])("Your web browser doesn't support this page, and it may not function correctly as a result. Upgrade your web browser.");
    }
    else {
        Object(_socket__WEBPACK_IMPORTED_MODULE_0__["connectSocket"])();
        Object(_utility__WEBPACK_IMPORTED_MODULE_2__["whenDocumentReady"])(function () {
            Object(_directives__WEBPACK_IMPORTED_MODULE_3__["addAllDirectives"])(document.documentElement);
        });
        window.addEventListener('error', function (event) {
            Object(_socket__WEBPACK_IMPORTED_MODULE_0__["sendIfError"])(event.error);
        });
        window.addEventListener('unhandledrejection', function (event) {
            Object(_socket__WEBPACK_IMPORTED_MODULE_0__["sendIfError"])(event.reason);
        });
    }
}


/***/ }),

/***/ "./src/socket.ts":
/*!***********************!*\
  !*** ./src/socket.ts ***!
  \***********************/
/*! exports provided: connectSocket, sendMessage, sendIfError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connectSocket", function() { return connectSocket; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendMessage", function() { return sendMessage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendIfError", function() { return sendIfError; });
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
        const splitIndex = data.indexOf(_constants__WEBPACK_IMPORTED_MODULE_2__["messageTagSeparator"]);
        const tag = data.substring(0, splitIndex);
        const script = data.substring(splitIndex + 1, data.length);
        const scope = Object(_eval__WEBPACK_IMPORTED_MODULE_1__["makeEvalScope"])({});
        Object(_utility__WEBPACK_IMPORTED_MODULE_3__["whenDocumentReady"])(function () {
            Object(_eval__WEBPACK_IMPORTED_MODULE_1__["evaluateScript"])(tag, scope, script);
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
            Object(_errors__WEBPACK_IMPORTED_MODULE_0__["errorDisplay"])("This web page could not connect to its server. Please reload or try again later.");
            localStorage.removeItem("shade_last_error_reload");
        }
        else {
            localStorage.setItem("shade_error_reload", "true");
            location.reload(true);
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
    const finalMsg = (msg !== undefined && msg !== null) ? id + _constants__WEBPACK_IMPORTED_MODULE_2__["messageTagSeparator"] + msg : id + _constants__WEBPACK_IMPORTED_MODULE_2__["messageTagSeparator"];
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
    socket.send(`${_constants__WEBPACK_IMPORTED_MODULE_2__["messageTagErrorPrefix"]}${tag == undefined ? "" : tag}${_constants__WEBPACK_IMPORTED_MODULE_2__["messageTagSeparator"]}` + JSON.stringify(data));
}


/***/ }),

/***/ "./src/utility.ts":
/*!************************!*\
  !*** ./src/utility.ts ***!
  \************************/
/*! exports provided: querySelectorAllPlusTarget, whenDocumentReady */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "querySelectorAllPlusTarget", function() { return querySelectorAllPlusTarget; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "whenDocumentReady", function() { return whenDocumentReady; });
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

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcGx5anMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F0dHJpYnV0ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JvdW5kLnRzIiwid2VicGFjazovLy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RpcmVjdGl2ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Vycm9ycy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZhbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzLnRzIiwid2VicGFjazovLy8uL3NyYy9yZWNvbmNpbGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYWRlLnRzIiwid2VicGFjazovLy8uL3NyYy9zb2NrZXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7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QUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsZ0VBQXFCLENBQUMsRUFBRSw0QkFBNEIsRUFBRSw4REFBbUIsQ0FBQztBQUM3Rjs7Ozs7Ozs7Ozs7OztBQy9GQTtBQUFBO0FBQUE7QUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNoYWRlLWJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3NoYWRlLnRzXCIpO1xuIiwiaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5jb25zdCBzY3JpcHRQcmV2aW91cyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgY29uc3Qgb2xkID0gaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXTtcbiAgICBpZiAoIWRpcmVjdGl2ZS5vbmx5T25DcmVhdGUgfHwgIW9sZCB8fCBvbGQuanMgIT0gZGlyZWN0aXZlLmpzIHx8IG9sZC50YXJnZXQgIT0gaW5mby50YXJnZXQpIHtcbiAgICAgICAgaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXSA9IHtcbiAgICAgICAgICAgIGpzOiBkaXJlY3RpdmUuanMsXG4gICAgICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGl0ID0gaW5mby50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBpdFxuICAgICAgICB9KTtcbiAgICAgICAgZXZhbHVhdGVTY3JpcHQodW5kZWZpbmVkLCBzY29wZSwgZGlyZWN0aXZlLmpzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBhc1NoYWRlRGlyZWN0aXZlLCBTZXRBdHRyaWJ1dGUgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllciB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuLy9XZSBuZWVkIHNvbWUgd2F5IG9mIHN0b3JpbmcgdGhlIG9yaWdpbmFsIHZhbHVlcyBvZiBhbiBhdHRyaWJ1dGUgYmVmb3JlIGFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgd2FzIGFwcGxpZWQsXG4vL2luIGNhc2UgdGhhdCBkaXJlY3RpdmUgaXMgcmVtb3ZlZCBpbiBhbiB1cGRhdGUgdGhhdCBkb2VzIG5vdCByZXNldCBhbiBlbGVtZW50J3MgYXR0cmlidXRlcy5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZShlbGVtZW50KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxNYXAgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAob3JpZ2luYWxNYXApIHtcbiAgICAgICAgZGVsZXRlIGVsZW1lbnRbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdO1xuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChlbGVtZW50KTtcbiAgICB9XG59XG5mdW5jdGlvbiBub3RlT3JpZ2luYWxBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSkge1xuICAgIGxldCBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAoIW9yaWdpbmFscykge1xuICAgICAgICBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIShuYW1lIGluIG9yaWdpbmFscykpIHtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuY29uc3QgaXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmUgPSBgWyR7QXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZX09JHtEaXJlY3RpdmVUeXBlLlNldEF0dHJpYnV0ZX1dYDtcbmNvbnN0IGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dJHtpc1NldEF0dHJpYnV0ZURpcmVjdGl2ZX1gO1xuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlRGlyZWN0aXZlcyh0YXJnZXQpIHtcbiAgICAvL0ZpcnN0LCBmaW5kIGFsbCBTZXRBdHRyaWJ1dGUgZGlyZWN0aXZlcyB0aGF0IGFwcGx5IHRvIHRhcmdldFxuICAgIGNvbnN0IGFwcGxpY2FibGUgPSBBcnJheS5mcm9tKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlKSk7XG4gICAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICBpZiAoIWN1cnJlbnQgfHwgIWN1cnJlbnQubWF0Y2hlcyhgc2NyaXB0W3R5cGU9JHtzY3JpcHRUeXBlU2lnbmlmaWVyfV1bJHtBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlfV1gKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICAvL05leHQsIGdyb3VwIHRoZW0gYnkgdGhlIGF0dHJpYnV0ZSB0aGV5IGFwcGx5IHRvXG4gICAgY29uc3QgYnlBdHRyaWJ1dGVOYW1lID0ge307XG4gICAgZm9yIChsZXQgZWwgb2YgYXBwbGljYWJsZSkge1xuICAgICAgICBjb25zdCBhc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWwpO1xuICAgICAgICBpZiAoYXNEaXJlY3RpdmUgJiYgYXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGxldCBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXTtcbiAgICAgICAgICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyYXkucHVzaChhc0RpcmVjdGl2ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9Ob3csIGFwcGx5IG9ubHkgdGhlIGxhc3QgZGlyZWN0aXZlIGZvciBldmVyeSBhdHRyaWJ1dGVcbiAgICBmb3IgKGxldCBhdHRyaWJ1dGUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYnlBdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gYnlBdHRyaWJ1dGVOYW1lW2F0dHJpYnV0ZV07XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJlY3RpdmVzW2RpcmVjdGl2ZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIG5vdGVPcmlnaW5hbEF0dHJpYnV0ZSh0YXJnZXQsIGxhc3QubmFtZSk7XG4gICAgICAgIGFwcGx5KHRhcmdldCwgbGFzdC5uYW1lLCBsYXN0LnZhbHVlKTtcbiAgICB9XG4gICAgLy9GaW5hbGx5LCByZXN0b3JlIHRoZSBvcmlnaW5hbCB2YWx1ZXMgZm9yIGFueSBhdHRyaWJ1dGVzIHRoYXQgbm8gbG9uZ2VyIGhhdmUgZGlyZWN0aXZlc1xuICAgIGNvbnN0IG9yaWdpbmFscyA9IHRhcmdldFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10gfHwge307XG4gICAgZm9yIChsZXQgb3JpZ2luYWwgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxzKSkge1xuICAgICAgICBpZiAoIWJ5QXR0cmlidXRlTmFtZVtvcmlnaW5hbF0pIHtcbiAgICAgICAgICAgIGFwcGx5KHRhcmdldCwgb3JpZ2luYWwsIG9yaWdpbmFsc1tvcmlnaW5hbF0pO1xuICAgICAgICAgICAgZGVsZXRlIG9yaWdpbmFsc1tvcmlnaW5hbF07XG4gICAgICAgIH1cbiAgICB9XG59XG5sZXQgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyA9IG5ldyBTZXQoKTtcbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2luZ0F0dHJpYnV0ZURpcmVjdGl2ZXMoY2IpIHtcbiAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgZm9yIChsZXQgdGFyZ2V0IG9mIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzID0gbmV3IFNldCgpO1xuICAgIH1cbn1cbmNvbnN0IHNldEF0dHJpYnV0ZVRhcmdldCA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVDaGFuZ2UoaW5mbykge1xuICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKGluZm8udGFyZ2V0KTtcbiAgICBpbmZvLmVsZW1lbnRbc2V0QXR0cmlidXRlVGFyZ2V0XSA9IGluZm8udGFyZ2V0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoZWxlbWVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGVsZW1lbnRbc2V0QXR0cmlidXRlVGFyZ2V0XTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKHRhcmdldCk7XG4gICAgfVxufVxuZnVuY3Rpb24gYXBwbHkodGFyZ2V0LCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJvdW5kSW5wdXQoYm91bmRJZCwgc2VydmVyU2VlbiwgdmFsdWUsIHNldHRlcikge1xuICAgIGxldCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbXCIgKyBBdHRyaWJ1dGVOYW1lcy5Cb3VuZCArIFwiPVxcXCJcIiArIGJvdW5kSWQgKyBcIlxcXCJdXCIpO1xuICAgIGxldCBzZWVuID0gaW5wdXQuYm91bmRTZWVuIHx8IChpbnB1dC5ib3VuZFNlZW4gPSAwKTtcbiAgICBpZiAoaW5wdXQgJiYgc2VlbiA8PSBzZXJ2ZXJTZWVuKSB7XG4gICAgICAgIHNldHRlcihpbnB1dCwgdmFsdWUpO1xuICAgIH1cbn1cbiIsIi8vQ2hhbmdlcyBoZXJlIHNob3VsZCBiZSBtaXJyb3JlZCBpbiBDbGllbnRDb25zdGFudHMua3RcbmV4cG9ydCB2YXIgRGlyZWN0aXZlVHlwZTtcbihmdW5jdGlvbiAoRGlyZWN0aXZlVHlwZSkge1xuICAgIERpcmVjdGl2ZVR5cGVbXCJBcHBseUpzXCJdID0gXCJqXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIlNldEF0dHJpYnV0ZVwiXSA9IFwiYVwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJFdmVudEhhbmRsZXJcIl0gPSBcImVcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50U3RhcnRcIl0gPSBcInNcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50RW5kXCJdID0gXCJmXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudEtlZXBcIl0gPSBcImtcIjtcbn0pKERpcmVjdGl2ZVR5cGUgfHwgKERpcmVjdGl2ZVR5cGUgPSB7fSkpO1xuZXhwb3J0IHZhciBBdHRyaWJ1dGVOYW1lcztcbihmdW5jdGlvbiAoQXR0cmlidXRlTmFtZXMpIHtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkRpcmVjdGl2ZVR5cGVcIl0gPSBcImRhdGEtc1wiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiVGFyZ2V0U2libGluZ0RpcmVjdGl2ZVwiXSA9IFwiZGF0YS1mXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJBcHBseUpzU2NyaXB0XCJdID0gXCJkYXRhLXRcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkFwcGx5SnNSdW5PcHRpb25cIl0gPSBcImRhdGEtclwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiU2V0QXR0cmlidXRlTmFtZVwiXSA9IFwiZGF0YS1hXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJTZXRBdHRyaWJ1dGVWYWx1ZVwiXSA9IFwiZGF0YS12XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJLZXlcIl0gPSBcImRhdGEta1wiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnROYW1lXCJdID0gXCJkYXRhLWVcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50Q2FsbGJhY2tJZFwiXSA9IFwiZGF0YS1pXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudFByZWZpeFwiXSA9IFwiZGF0YS1wXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudFN1ZmZpeFwiXSA9IFwiZGF0YS14XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudERhdGFcIl0gPSBcImRhdGEtZFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQm91bmRcIl0gPSBcImRhdGEtYlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQ2hlY2tib3hcIl0gPSBcImRhdGEtY1wiO1xufSkoQXR0cmlidXRlTmFtZXMgfHwgKEF0dHJpYnV0ZU5hbWVzID0ge30pKTtcbmV4cG9ydCBjb25zdCBzY3JpcHRUeXBlU2lnbmlmaWVyID0gXCJzaGFkZVwiO1xuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkUHJlZml4ID0gXCJzaGFkZVwiO1xuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkRW5kU3VmZml4ID0gXCJlXCI7XG5leHBvcnQgY29uc3QgbWVzc2FnZVRhZ1NlcGFyYXRvciA9IFwifFwiO1xuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdFcnJvclByZWZpeCA9IFwiRVwiO1xuZXhwb3J0IHZhciBTb2NrZXRTY29wZU5hbWVzO1xuKGZ1bmN0aW9uIChTb2NrZXRTY29wZU5hbWVzKSB7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInJlY29uY2lsZVwiXSA9IFwiclwiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJ1cGRhdGVCb3VuZElucHV0XCJdID0gXCJiXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInNlbmRNZXNzYWdlXCJdID0gXCJzXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInNlbmRJZkVycm9yXCJdID0gXCJxXCI7XG59KShTb2NrZXRTY29wZU5hbWVzIHx8IChTb2NrZXRTY29wZU5hbWVzID0ge30pKTtcbiIsImltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBjb21wb25lbnRJZEVuZFN1ZmZpeCwgY29tcG9uZW50SWRQcmVmaXgsIERpcmVjdGl2ZVR5cGUsIHNjcmlwdFR5cGVTaWduaWZpZXIgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHsgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlIH0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuaW1wb3J0IHsgcnVuRWxlbWVudFNjcmlwdCB9IGZyb20gXCIuL2FwcGx5anNcIjtcbmltcG9ydCB7IHJlbW92ZUV2ZW50SGFuZGxlciwgc2V0dXBFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9ldmVudHNcIjtcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRTdGFydCB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFbmQge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgS2VlcCB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTZXRBdHRyaWJ1dGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXBwbHlKcyB7XG4gICAgY29uc3RydWN0b3IoanMsIG9ubHlPbkNyZWF0ZSkge1xuICAgICAgICB0aGlzLmpzID0ganM7XG4gICAgICAgIHRoaXMub25seU9uQ3JlYXRlID0gb25seU9uQ3JlYXRlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBFdmVudEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZSwgY2FsbGJhY2tJZCwgcHJlZml4LCBzdWZmaXgsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tJZCA9IGNhbGxiYWNrSWQ7XG4gICAgICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgICAgICB0aGlzLnN1ZmZpeCA9IHN1ZmZpeDtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCkge1xuICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGNoaWxkLnRhZ05hbWUgPT0gXCJTQ1JJUFRcIiAmJiBjaGlsZC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpID09PSBzY3JpcHRUeXBlU2lnbmlmaWVyKSB7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZVR5cGUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIGNvbnN0IGlkID0gY2hpbGQuaWQ7XG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aXZlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkFwcGx5SnM6XG4gICAgICAgICAgICAgICAgY29uc3QgcnVuT3B0aW9uID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNSdW5PcHRpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5BcHBseUpzU2NyaXB0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFwcGx5SnMoc2NyaXB0LCBydW5PcHRpb24gPT09IFwiMVwiKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRTdGFydDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudFN0YXJ0KGlkLnN1YnN0cihjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRFbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRFbmQoaWQuc3Vic3RyKDUsIGlkLmxlbmd0aCAtIGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCAtIGNvbXBvbmVudElkRW5kU3VmZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkNvbXBvbmVudEtlZXA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBLZWVwKGlkLnN1YnN0cihjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGU6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuRXZlbnRIYW5kbGVyOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gK2NoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudENhbGxiYWNrSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFByZWZpeCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VmZml4ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50U3VmZml4KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudEhhbmRsZXIobmFtZSwgaWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRBbGxEaXJlY3RpdmVzKGJhc2UpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChiYXNlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVTY3JpcHRUYXJnZXQoc2NyaXB0KSB7XG4gICAgaWYgKHNjcmlwdC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZSkpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IHNjcmlwdDtcbiAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmxldCBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xubGV0IHJlbW92ZWREaXJlY3RpdmVzID0gW107XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdEaXJlY3RpdmVzKGNiKSB7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFuZ2VkIG9mIGNoYW5nZWREaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICAgICAgb25BZGRlZE9yVXBkYXRlZChjaGFuZ2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IHJlbW92ZWQgb2YgcmVtb3ZlZERpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgICAgICBvblJlbW92ZWQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xuICAgICAgICAgICAgcmVtb3ZlZERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyoqXG4gKiBDaGVja3MgYW4gZWxlbWVudCBhbmQgYWxsIGl0cyBjaGlsZHJlbiB0aGF0IGhhdmUganVzdCBiZWVuIGFkZGVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZUFkZChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENoZWNrcyBhbmQgcmVjb3JkcyB3aGV0aGVyIGFuIGVsZW1lbnQgdGhhdCBjaGFuZ2VkIGlzIGEgc2NyaXB0IGRpcmVjdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVDaGFuZ2UoZWxlbWVudCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWxlbWVudCk7XG4gICAgaWYgKGRpcmVjdGl2ZSkge1xuICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50IH0pO1xuICAgIH1cbn1cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiByZW1vdmVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZVJlbW92ZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENhbGxlZCBhZnRlciB0aGUgZGlyZWN0aXZlIGNvbnRhaW5lZCBpbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KGluZm8uZWxlbWVudCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICAgICAgY29uc3QgYWRkSW5mbyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgaW5mbyksIHsgdGFyZ2V0IH0pO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGFkZEluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpIHtcbiAgICAgICAgICAgIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBhZGRJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgYWRkSW5mbyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdGFyZ2V0IGZvciAke2luZm8uZWxlbWVudC5vdXRlckhUTUx9YCk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25SZW1vdmVkKGluZm8pIHtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoaW5mby5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEV2ZW50SGFuZGxlcikge1xuICAgICAgICByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZXJyb3JEaXNwbGF5KGNvbnRlbnQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgKyBcIjwvcD48L2Rpdj48L2Rpdj48L2Rpdj5cIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaGFkZUNsb3NlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKTtcbiAgICAgICAgbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG0pO1xuICAgIH0pO1xufVxuIiwiaW1wb3J0IHsgc2VuZElmRXJyb3IsIHNlbmRNZXNzYWdlIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyByZWNvbmNpbGUgfSBmcm9tIFwiLi9yZWNvbmNpbGVcIjtcbmltcG9ydCB7IHVwZGF0ZUJvdW5kSW5wdXQgfSBmcm9tIFwiLi9ib3VuZFwiO1xuaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlU2NyaXB0KHRhZywgc2NvcGUsIHNjcmlwdCkge1xuICAgIHRyeSB7XG4gICAgICAgIHNjb3BlKHNjcmlwdCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHNlbmRJZkVycm9yKGUsIHRhZywgc2NyaXB0LnN1YnN0cmluZygwLCAyNTYpKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbWFrZUV2YWxTY29wZShzY29wZSkge1xuICAgIGNvbnN0IGZpbmFsID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBiYXNlU2NvcGUpLCBzY29wZSk7XG4gICAgY29uc3QgYmFzZSA9IFtdO1xuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhmaW5hbCkpIHtcbiAgICAgICAgYmFzZS5wdXNoKGB2YXIgJHtrZXl9PWZpbmFsLiR7a2V5fTtgKTtcbiAgICB9XG4gICAgY29uc3QgYmFzZVNjcmlwdCA9IGJhc2Uuam9pbihcIlxcblwiKSArIFwiXFxuXCI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgICAgZXZhbChcIihmdW5jdGlvbigpe1xcblwiICsgYmFzZVNjcmlwdCArIHNjcmlwdCArIFwiXFxufSkoKVwiKTtcbiAgICB9LmJpbmQoe30pO1xufVxuZXhwb3J0IGNvbnN0IGJhc2VTY29wZSA9IHtcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5yZWNvbmNpbGVdOiByZWNvbmNpbGUsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMudXBkYXRlQm91bmRJbnB1dF06IHVwZGF0ZUJvdW5kSW5wdXQsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZE1lc3NhZ2VdOiBzZW5kTWVzc2FnZSxcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5zZW5kSWZFcnJvcl06IHNlbmRJZkVycm9yXG59O1xuIiwiaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5jb25zdCBldmVudFByZXZpb3VzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gc2V0dXBFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpO1xuICAgIGNvbnN0IHByZWZpeCA9IGRpcmVjdGl2ZS5wcmVmaXggPyBgJHtkaXJlY3RpdmUucHJlZml4fTtcXG5gIDogXCJcIjtcbiAgICBjb25zdCBkYXRhID0gZGlyZWN0aXZlLmRhdGEgPyBgLEpTT04uc3RyaW5naWZ5KCR7ZGlyZWN0aXZlLmRhdGF9KWAgOiBcIlwiO1xuICAgIGNvbnN0IHN1ZmZpeCA9IGRpcmVjdGl2ZS5zdWZmaXggPyBgO1xcbiR7ZGlyZWN0aXZlLnN1ZmZpeH1gIDogXCJcIjtcbiAgICBjb25zdCBzY3JpcHQgPSBgJHtwcmVmaXh9JHtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlfSgke2RpcmVjdGl2ZS5jYWxsYmFja0lkfSR7ZGF0YX0pJHtzdWZmaXh9YDtcbiAgICBjb25zdCBsaXN0ZW5lciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBldmVudDogZSxcbiAgICAgICAgICAgIGU6IGUsXG4gICAgICAgICAgICBpdDogZS50YXJnZXRcbiAgICAgICAgfSk7XG4gICAgICAgIGV2YWx1YXRlU2NyaXB0KHVuZGVmaW5lZCwgc2NvcGUsIHNjcmlwdCk7XG4gICAgfTtcbiAgICBpbmZvLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGRpcmVjdGl2ZS5ldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICBpbmZvLmVsZW1lbnRbZXZlbnRQcmV2aW91c10gPSB7XG4gICAgICAgIGV2ZW50TmFtZTogZGlyZWN0aXZlLmV2ZW50TmFtZSxcbiAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpO1xufVxuZnVuY3Rpb24gcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChlbGVtZW50KSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSBlbGVtZW50W2V2ZW50UHJldmlvdXNdO1xuICAgIGlmIChwcmV2aW91cykge1xuICAgICAgICBwcmV2aW91cy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihwcmV2aW91cy5ldmVudE5hbWUsIHByZXZpb3VzLmxpc3RlbmVyKTtcbiAgICB9XG59XG4iLCIvL1JlY29uY2lsZSBhIHRhcmdldElkIHdpdGggSFRNTFxuaW1wb3J0IHsgYXNTaGFkZURpcmVjdGl2ZSwgY2hhbmdpbmdEaXJlY3RpdmVzLCBjaGVja0RpcmVjdGl2ZUFkZCwgY2hlY2tEaXJlY3RpdmVDaGFuZ2UsIGNoZWNrRGlyZWN0aXZlUmVtb3ZlLCBDb21wb25lbnRFbmQsIENvbXBvbmVudFN0YXJ0LCBLZWVwLCB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBjb21wb25lbnRJZFByZWZpeCB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmV4cG9ydCBmdW5jdGlvbiByZWNvbmNpbGUodGFyZ2V0SWQsIGh0bWwpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb21wb25lbnRJZFByZWZpeCArIHRhcmdldElkKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgY29uc3QgaHRtbERvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50LnRhZ05hbWUpO1xuICAgICAgICBodG1sRG9tLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuICAgICAgICB3aGlsZSAoY3VycmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjdXJyZW50KTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50RW5kICYmIGN1cnJlbnREaXJlY3RpdmUuaWQgPT0gXCJcIiArIHRhcmdldElkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmNsdWRlZC5wdXNoKGN1cnJlbnQpO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcGF0Y2hDaGlsZHJlbihwYXJlbnQsIHRhcmdldCwgaW5jbHVkZWQsIGh0bWxEb20uY2hpbGROb2Rlcyk7XG4gICAgfSk7XG59XG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0RGlyZWN0aXZlLCBzdGFydCwgY2hpbGRyZW4sIGVuZCkge1xuICAgICAgICB0aGlzLnN0YXJ0RGlyZWN0aXZlID0gc3RhcnREaXJlY3RpdmU7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG4gICAgYXNOb2RlcygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLnN0YXJ0LCAuLi50aGlzLmNoaWxkcmVuLCB0aGlzLmVuZF07XG4gICAgfVxuICAgIGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydERpcmVjdGl2ZS5pZDtcbiAgICB9XG59XG5mdW5jdGlvbiBhc05vZGVzKHRhcmdldCkge1xuICAgIHJldHVybiB0YXJnZXQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyB0YXJnZXQuYXNOb2RlcygpIDogW3RhcmdldF07XG59XG5mdW5jdGlvbiByZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpIHtcbiAgICBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBuZXdlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmIChvcmlnaW5hbC50YWdOYW1lICE9IG5ld2VyLnRhZ05hbWUpIHtcbiAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5ld2VyKTtcbiAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIHJldHVybiBuZXdlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yaWdpbmFsLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBvcmlnaW5hbC5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdlci5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbmV3ZXIuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZGVyQXR0ciA9IG9yaWdpbmFsLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld2VyQXR0ciA9IG5ld2VyLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGlmIChvbGRlckF0dHIgIT0gbmV3ZXJBdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIG5ld2VyQXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZShvcmlnaW5hbCk7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVDaGFuZ2Uob3JpZ2luYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0Y2hDaGlsZHJlbihvcmlnaW5hbCwgbnVsbCwgb3JpZ2luYWwuY2hpbGROb2RlcywgbmV3ZXIuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBUZXh0ICYmIG5ld2VyIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICBpZiAob3JpZ2luYWwudGV4dENvbnRlbnQgPT0gbmV3ZXIudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXdlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4oZG9tLCBhcHBlbmRTdGFydCwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pIHtcbiAgICBjb25zdCBmaW5hbCA9IHJlY29uY2lsZUNoaWxkcmVuKGRvbSwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pO1xuICAgIGxldCBlbmRPZlBhdGNoUmFuZ2U7XG4gICAgaWYgKGRvbUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gZG9tQ2hpbGRyZW5bZG9tQ2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFwcGVuZFN0YXJ0KSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGFwcGVuZFN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gbnVsbDtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnQgPSBhcHBlbmRTdGFydCA/IGFwcGVuZFN0YXJ0IDogXCJzdGFydFwiO1xuICAgIGZ1bmN0aW9uIGFmdGVyQ3VycmVudCgpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQgPT0gXCJzdGFydFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9tLmZpcnN0Q2hpbGQgPyBkb20uZmlyc3RDaGlsZCA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3VycmVudCA9PSBcImVuZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJlbmRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Lm5leHRTaWJsaW5nID8gY3VycmVudC5uZXh0U2libGluZyA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmaW5hbCkge1xuICAgICAgICBsZXQgbmV4dCA9IGFmdGVyQ3VycmVudCgpO1xuICAgICAgICBpZiAobmV4dCAhPT0gY2hpbGQpIHtcbiAgICAgICAgICAgIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQgPT09IFwiZW5kXCIgPyBudWxsIDogbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGNoaWxkO1xuICAgIH1cbiAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgd2hpbGUgKGN1cnJlbnQgIT0gXCJlbmRcIiAmJiBjdXJyZW50ICE9IGVuZE9mUGF0Y2hSYW5nZSkge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGN1cnJlbnQ7XG4gICAgICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICAgICAgZG9tLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZWNvbmNpbGVDaGlsZHJlbihkb20sIGRvbUNoaWxkcmVuLCByZXBsYWNlbWVudENoaWxkcmVuKSB7XG4gICAgdmFyIF9hO1xuICAgIGNvbnN0IG9yaWdpbmFscyA9IGNvbGxhcHNlQ29tcG9uZW50Q2hpbGRyZW4oZG9tQ2hpbGRyZW4pO1xuICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IGNvbGxhcHNlQ29tcG9uZW50Q2hpbGRyZW4ocmVwbGFjZW1lbnRDaGlsZHJlbik7XG4gICAgY29uc3Qgb3JpZ2luYWxLZXlzID0gY29sbGVjdEtleXNNYXAob3JpZ2luYWxzKTtcbiAgICBsZXQgb3JpZ2luYWxJbmRleCA9IDA7XG4gICAgbGV0IHJlcGxhY2VtZW50SW5kZXggPSAwO1xuICAgIGNvbnN0IGZpbmFsQ2hpbGRyZW4gPSBbXTtcbiAgICB3aGlsZSAob3JpZ2luYWxJbmRleCA8IG9yaWdpbmFscy5sZW5ndGggfHwgcmVwbGFjZW1lbnRJbmRleCA8IHJlcGxhY2VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IG9yaWdpbmFsID0gb3JpZ2luYWxzW29yaWdpbmFsSW5kZXhdO1xuICAgICAgICBjb25zdCBuZXdlciA9IHJlcGxhY2VtZW50c1tyZXBsYWNlbWVudEluZGV4XTtcbiAgICAgICAgLy9Ta2lwIGFueSBrZXllZCBvcmlnaW5hbHM7IHRoZXkgd2lsbCBiZSBsb29rZWQgdXAgYnkga2V5XG4gICAgICAgIGlmIChvcmlnaW5hbCAmJiBnZXRLZXkob3JpZ2luYWwpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcmlnaW5hbCAmJiAhbmV3ZXIpIHtcbiAgICAgICAgICAgIC8qIEltcGxpY2l0IHJlbW92ZSAqL1xuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgLy9UZXh0IG5vZGVzIGhhdmUgbm8gaW50ZXJlc3RpbmcgaWRlbnRpdHkgb3IgY2hpbGRyZW4gdG8gcHJlc2VydmUsIGFuZCB0aGVcbiAgICAgICAgICAgIC8vS290bGluIHNpZGUgY2FuJ3QgdHJhY2sgdGhlbSBmb3IgcG9zaXRpb24gbWF0Y2hpbmcsIHNvIHdlIGp1c3Qgc2tpcCBvdmVyIHRoZW1cbiAgICAgICAgICAgIC8vaW4gY29tcGFyaXNvbnMgYW5kIGFkZCB0aGUgbmV3ZXIgdGV4dCBhbHdheXMuXG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3ZXIgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpO1xuICAgICAgICAgICAgcmVwbGFjZW1lbnRJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbmV3ZXJLZXkgPSBnZXRLZXkobmV3ZXIpO1xuICAgICAgICAgICAgaWYgKG5ld2VyS2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9XZSdsbCBtYXRjaCB0aGlzIHVua2V5ZWQgb3JpZ2luYWwgYWdhaW4gb24gc29tZXRoaW5nIHdpdGhvdXQgYSBrZXlcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcmlnaW5hbCA9IChfYSA9IG9yaWdpbmFsS2V5c1tuZXdlcktleV0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBhZGQgPSBbXTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVzZU5ld2VyKCkge1xuICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMobmV3ZXIpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXdlckRpcmVjdGl2ZSA9IG5ld2VyIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gbnVsbCA6IGFzU2hhZGVEaXJlY3RpdmUobmV3ZXIpO1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsICYmIG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCAmJiAobmV3ZXJEaXJlY3RpdmUuaWQgPT0gb3JpZ2luYWwuaWQoKSB8fCBuZXdlcktleSkpIHtcbiAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghb3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG9yaWdpbmFsLmlkKCkgPT0gbmV3ZXIuaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlY29uY2lsZUNoaWxkcmVuKGRvbSwgb3JpZ2luYWwuY2hpbGRyZW4sIG5ld2VyLmNoaWxkcmVuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBbcmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2goLi4uYWRkKTtcbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL0FsbCByZW1haW5pbmcga2V5cyBpbiB0aGUgbWFwIHdpbGwgbm90IGhhdmUgYmVlbiB1c2VkLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9yaWdpbmFsS2V5cykpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxzID0gb3JpZ2luYWxLZXlzW2tleV07XG4gICAgICAgIGZvciAobGV0IG9yaWdpbmFsIG9mIG9yaWdpbmFscykge1xuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaW5hbENoaWxkcmVuO1xufVxuZnVuY3Rpb24gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihsaXN0KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCk7XG4gICAgICAgIGxldCBlbmQgPSBudWxsO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50U3RhcnQpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YkNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEFzRGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShzdWJDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkQXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRFbmQgJiYgY2hpbGRBc0RpcmVjdGl2ZS5pZCA9PSBkaXJlY3RpdmUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ViQ2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnB1c2goc3ViQ2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIk1pc3NpbmcgZW5kIHRhZyBmb3IgY29tcG9uZW50IFwiICsgZGlyZWN0aXZlLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBDb21wb25lbnQoZGlyZWN0aXZlLCBjaGlsZCwgY29tcG9uZW50LCBlbmQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29sbGVjdEtleXNNYXAoY2hpbGRMaXN0KSB7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRMaXN0W2ldO1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRLZXkoY2hpbGQpO1xuICAgICAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBsaXN0ID0ga2V5c1trZXldO1xuICAgICAgICAgICAgaWYgKCFsaXN0KSB7XG4gICAgICAgICAgICAgICAgbGlzdCA9IGtleXNba2V5XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cbmZ1bmN0aW9uIGdldEtleShjaGlsZCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGNoaWxkIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gY2hpbGQuc3RhcnQgOiBjaGlsZDtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5LZXkpO1xuICAgICAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG4iLCJpbXBvcnQgeyBjb25uZWN0U29ja2V0LCBzZW5kSWZFcnJvciB9IGZyb20gXCIuL3NvY2tldFwiO1xuaW1wb3J0IHsgZXJyb3JEaXNwbGF5IH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgeyB3aGVuRG9jdW1lbnRSZWFkeSB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7IGFkZEFsbERpcmVjdGl2ZXMgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pZiAoIXdpbmRvdy5zaGFkZSkge1xuICAgIHdpbmRvdy5zaGFkZSA9IHt9O1xuICAgIGlmICghd2luZG93LldlYlNvY2tldCkge1xuICAgICAgICBlcnJvckRpc3BsYXkoXCJZb3VyIHdlYiBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHBhZ2UsIGFuZCBpdCBtYXkgbm90IGZ1bmN0aW9uIGNvcnJlY3RseSBhcyBhIHJlc3VsdC4gVXBncmFkZSB5b3VyIHdlYiBicm93c2VyLlwiKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbm5lY3RTb2NrZXQoKTtcbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYWRkQWxsRGlyZWN0aXZlcyhkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZW5kSWZFcnJvcihldmVudC5lcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBzZW5kSWZFcnJvcihldmVudC5yZWFzb24pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBlcnJvckRpc3BsYXkgfSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7IGV2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlIH0gZnJvbSBcIi4vZXZhbFwiO1xuaW1wb3J0IHsgbWVzc2FnZVRhZ0Vycm9yUHJlZml4LCBtZXNzYWdlVGFnU2VwYXJhdG9yIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyB3aGVuRG9jdW1lbnRSZWFkeSB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmxldCBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuY29uc3Qgc29ja2V0UmVhZHlRdWV1ZSA9IFtdO1xubGV0IHNvY2tldDtcbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0U29ja2V0KCkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwod2luZG93LnNoYWRlRW5kcG9pbnQsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICBpZiAod2luZG93LnNoYWRlSG9zdCkge1xuICAgICAgICB1cmwuaG9zdCA9IHdpbmRvdy5zaGFkZUhvc3Q7XG4gICAgfVxuICAgIHVybC5wcm90b2NvbCA9ICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgPyBcIndzczovL1wiIDogXCJ3czovL1wiKTtcbiAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybC5ocmVmKTtcbiAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBpZCA9IHdpbmRvdy5zaGFkZUlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZCB3aXRoIElEIFwiICsgaWQpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgc29ja2V0LnNlbmQoaWQpO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IHRydWU7XG4gICAgICAgIHdoaWxlIChzb2NrZXRSZWFkeVF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlKHNvY2tldFJlYWR5UXVldWUuc2hpZnQoKSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgICAgIGNvbnN0IHNwbGl0SW5kZXggPSBkYXRhLmluZGV4T2YobWVzc2FnZVRhZ1NlcGFyYXRvcik7XG4gICAgICAgIGNvbnN0IHRhZyA9IGRhdGEuc3Vic3RyaW5nKDAsIHNwbGl0SW5kZXgpO1xuICAgICAgICBjb25zdCBzY3JpcHQgPSBkYXRhLnN1YnN0cmluZyhzcGxpdEluZGV4ICsgMSwgZGF0YS5sZW5ndGgpO1xuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe30pO1xuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmFsdWF0ZVNjcmlwdCh0YWcsIHNjb3BlLCBzY3JpcHQpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGxldCBlcnJvclRyaWdnZXJlZCA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIGVycm9yUmVsb2FkKCkge1xuICAgICAgICBpZiAoZXJyb3JUcmlnZ2VyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlcnJvclRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IGxhc3RSZWxvYWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgaWYgKGxhc3RSZWxvYWQpIHtcbiAgICAgICAgICAgIGVycm9yRGlzcGxheShcIlRoaXMgd2ViIHBhZ2UgY291bGQgbm90IGNvbm5lY3QgdG8gaXRzIHNlcnZlci4gUGxlYXNlIHJlbG9hZCBvciB0cnkgYWdhaW4gbGF0ZXIuXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9sYXN0X2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFNvY2tldCBjbG9zZWQ6ICR7ZXZ0LnJlYXNvbn0sICR7ZXZ0Lndhc0NsZWFufWApO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuICAgICAgICBpZiAoZXZ0Lndhc0NsZWFuKSB7XG4gICAgICAgICAgICAvL2Nvbm5lY3RTb2NrZXQoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dH1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICB9O1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChcIlwiKTtcbiAgICAgICAgfVxuICAgIH0sIDYwICogMTAwMCk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2VuZE1lc3NhZ2UoaWQsIG1zZykge1xuICAgIGNvbnN0IGZpbmFsTXNnID0gKG1zZyAhPT0gdW5kZWZpbmVkICYmIG1zZyAhPT0gbnVsbCkgPyBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3IgKyBtc2cgOiBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3I7XG4gICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgIHNvY2tldC5zZW5kKGZpbmFsTXNnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNvY2tldFJlYWR5UXVldWUucHVzaChmaW5hbE1zZyk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRJZkVycm9yKGVycm9yLCB0YWcsIGV2YWxUZXh0KSB7XG4gICAgY29uc3QgZGF0YSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyB7XG4gICAgICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgICAgIGpzTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9IDoge1xuICAgICAgICBuYW1lOiBcIlVua25vd25cIixcbiAgICAgICAganNNZXNzYWdlOiBcIlVua25vd24gZXJyb3I6IFwiICsgZXJyb3IsXG4gICAgICAgIHN0YWNrOiBcIlwiLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9O1xuICAgIHNvY2tldC5zZW5kKGAke21lc3NhZ2VUYWdFcnJvclByZWZpeH0ke3RhZyA9PSB1bmRlZmluZWQgPyBcIlwiIDogdGFnfSR7bWVzc2FnZVRhZ1NlcGFyYXRvcn1gICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KHRhcmdldCwgc2VsZWN0b3IpIHtcbiAgICBjb25zdCBiZWxvdyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICBpZiAodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbdGFyZ2V0LCAuLi5iZWxvd107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShiZWxvdyk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5Eb2N1bWVudFJlYWR5KGZuKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImludGVyYWN0aXZlXCIpIHtcbiAgICAgICAgZm4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZuKTtcbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9