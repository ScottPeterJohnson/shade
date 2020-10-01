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
    delete element[attributeOriginalValues];
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
/*! exports provided: updateBoundInput, updateBoundCheckbox */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateBoundInput", function() { return updateBoundInput; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateBoundCheckbox", function() { return updateBoundCheckbox; });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");

function updateBoundInput(boundId, serverSeen, value) {
    let input = document.querySelector("[" + _constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].Bound + "=\"" + boundId + "\"]");
    let seen = input.boundSeen || (input.boundSeen = 0);
    if (input && seen <= serverSeen) {
        input.value = value;
    }
}
function updateBoundCheckbox(boundId, serverSeen, value) {
    let checked = value === 1;
    let input = document.querySelector("[" + _constants__WEBPACK_IMPORTED_MODULE_0__["AttributeNames"].Checkbox + "=\"" + boundId + "\"]");
    let seen = input.boundSeen || (input.boundSeen = 0);
    if (input && seen <= serverSeen) {
        input.checked = checked;
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
    SocketScopeNames["updateBoundCheckbox"] = "c";
    SocketScopeNames["sendMessage"] = "s";
    SocketScopeNames["sendIfError"] = "q";
})(SocketScopeNames || (SocketScopeNames = {}));


/***/ }),

/***/ "./src/directives.ts":
/*!***************************!*\
  !*** ./src/directives.ts ***!
  \***************************/
/*! exports provided: ComponentStart, ComponentEnd, Keep, SetAttribute, ApplyJs, EventHandler, asShadeDirective, addAllDirectives, determineScriptTarget, onAddedOrUpdated, onRemoved */
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onAddedOrUpdated", function() { return onAddedOrUpdated; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onRemoved", function() { return onRemoved; });
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
    Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["changingAttributeDirectives"])(() => {
        for (let script of Object(_utility__WEBPACK_IMPORTED_MODULE_1__["querySelectorAllPlusTarget"])(base, `script[type=${_constants__WEBPACK_IMPORTED_MODULE_0__["scriptTypeSignifier"]}]`)) {
            const directive = asShadeDirective(script);
            if (script instanceof HTMLElement && directive) {
                onAddedOrUpdated({
                    element: script,
                    directive
                });
            }
        }
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
    };
}
const baseScope = {
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].reconcile]: _reconcile__WEBPACK_IMPORTED_MODULE_1__["reconcile"],
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].updateBoundInput]: _bound__WEBPACK_IMPORTED_MODULE_2__["updateBoundInput"],
    [_constants__WEBPACK_IMPORTED_MODULE_3__["SocketScopeNames"].updateBoundCheckbox]: _bound__WEBPACK_IMPORTED_MODULE_2__["updateBoundCheckbox"],
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
    Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["changingAttributeDirectives"])(() => {
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
            Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["onAttributesSetFromSource"])(original);
            patchChildren(original, null, original.childNodes, newer.childNodes);
            return original;
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
        notifyAddedOrUpdated(child);
        current = child;
    }
    current = afterCurrent();
    while (current != "end" && current != endOfPatchRange) {
        const child = current;
        current = afterCurrent();
        notifyRemoved(child);
        dom.removeChild(child);
    }
}
function reconcileChildren(dom, domChildren, replacementChildren) {
    const originals = collapseComponentChildren(domChildren);
    const replacements = collapseComponentChildren(replacementChildren);
    const originalKeys = collectKeysMap(originals);
    let originalIndex = 0;
    let replacementIndex = 0;
    const finalChildren = [];
    const keyUsed = new Set();
    const keyUnused = new Set();
    while (originalIndex < originals.length || replacementIndex < replacements.length) {
        const atCursor = originals[originalIndex];
        const newer = replacements[replacementIndex];
        if (!atCursor && newer) {
            finalChildren.push(...(asNodes(newer)));
        }
        else if (atCursor && !newer) {
            /* Implicit remove */
        }
        else {
            let original = atCursor;
            const newerKey = getKey(newer);
            if (newerKey != null) {
                const originalByKey = originalKeys[newerKey];
                if (originalByKey && original !== originalByKey) {
                    keyUsed.add(originalByKey);
                    keyUnused.add(original);
                    original = originalByKey;
                }
            }
            const originalKey = getKey(original);
            let add = [];
            const newerDirective = newer instanceof Component ? null : Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(newer);
            if (original instanceof Component && newerDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["Keep"] && newerDirective.id == original.id()) {
                add = asNodes(original);
            }
            else {
                if (originalKey != newerKey) {
                    add = asNodes(newer);
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
                            add = asNodes(newer);
                        }
                    }
                    else if (original instanceof Component) {
                        add = asNodes(newer);
                    }
                    else {
                        add = [reconcileNodes(original, newer)];
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
function notifyAddedOrUpdated(node) {
    for (let child of node.childNodes) {
        notifyAddedOrUpdated(child);
    }
    if (node instanceof HTMLElement) {
        const directive = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(node);
        if (directive) {
            Object(_directives__WEBPACK_IMPORTED_MODULE_0__["onAddedOrUpdated"])({
                element: node,
                directive
            });
        }
    }
}
function notifyRemoved(node) {
    for (let child of node.childNodes) {
        notifyRemoved(child);
    }
    const directive = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["asShadeDirective"])(node);
    if (node instanceof HTMLElement && directive) {
        const target = Object(_directives__WEBPACK_IMPORTED_MODULE_0__["determineScriptTarget"])(node);
        if (target) {
            Object(_directives__WEBPACK_IMPORTED_MODULE_0__["onRemoved"])({
                element: node,
                directive
            });
        }
    }
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
            keys[key] = child;
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
    socket = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + (window.shadeHost || window.location.host) + window.shadeEndpoint);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcGx5anMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F0dHJpYnV0ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JvdW5kLnRzIiwid2VicGFjazovLy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RpcmVjdGl2ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Vycm9ycy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZhbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzLnRzIiwid2VicGFjazovLy8uL3NyYy9yZWNvbmNpbGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYWRlLnRzIiwid2VicGFjazovLy8uL3NyYy9zb2NrZXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsOERBQW1CO0FBQzNEO0FBQ0E7QUFDQSxzQkFBc0IsMkRBQWEsR0FBRztBQUN0QyxRQUFRLGtFQUFpQjtBQUN6QixZQUFZLDREQUFjO0FBQzFCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDREQUFZO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsV0FBVyxJQUFJLGFBQWE7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLElBQUk7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQLGdFQUFnRSw4REFBbUIsY0FBYyw4REFBbUI7QUFDcEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsZ0VBQXFCLENBQUMsRUFBRSw0QkFBNEIsRUFBRSw4REFBbUIsQ0FBQztBQUM3Rjs7Ozs7Ozs7Ozs7OztBQzFGQTtBQUFBO0FBQUE7QUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNoYWRlLWJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3NoYWRlLnRzXCIpO1xuIiwiaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5jb25zdCBzY3JpcHRQcmV2aW91cyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgY29uc3Qgb2xkID0gaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXTtcbiAgICBpZiAoIWRpcmVjdGl2ZS5vbmx5T25DcmVhdGUgfHwgIW9sZCB8fCBvbGQuanMgIT0gZGlyZWN0aXZlLmpzIHx8IG9sZC50YXJnZXQgIT0gaW5mby50YXJnZXQpIHtcbiAgICAgICAgaW5mby5lbGVtZW50W3NjcmlwdFByZXZpb3VzXSA9IHtcbiAgICAgICAgICAgIGpzOiBkaXJlY3RpdmUuanMsXG4gICAgICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGl0ID0gaW5mby50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBpdFxuICAgICAgICB9KTtcbiAgICAgICAgZXZhbHVhdGVTY3JpcHQodW5kZWZpbmVkLCBzY29wZSwgZGlyZWN0aXZlLmpzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBhc1NoYWRlRGlyZWN0aXZlLCBTZXRBdHRyaWJ1dGUgfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllciB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuLy9XZSBuZWVkIHNvbWUgd2F5IG9mIHN0b3JpbmcgdGhlIG9yaWdpbmFsIHZhbHVlcyBvZiBhbiBhdHRyaWJ1dGUgYmVmb3JlIGFuIGF0dHJpYnV0ZSBkaXJlY3RpdmUgd2FzIGFwcGxpZWQsXG4vL2luIGNhc2UgdGhhdCBkaXJlY3RpdmUgaXMgcmVtb3ZlZCBpbiBhbiB1cGRhdGUgdGhhdCBkb2VzIG5vdCByZXNldCBhbiBlbGVtZW50J3MgYXR0cmlidXRlcy5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZShlbGVtZW50KSB7XG4gICAgZGVsZXRlIGVsZW1lbnRbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdO1xufVxuZnVuY3Rpb24gbm90ZU9yaWdpbmFsQXR0cmlidXRlKGVsZW1lbnQsIG5hbWUpIHtcbiAgICBsZXQgb3JpZ2luYWxzID0gZWxlbWVudFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc107XG4gICAgaWYgKCFvcmlnaW5hbHMpIHtcbiAgICAgICAgb3JpZ2luYWxzID0gZWxlbWVudFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10gPSB7fTtcbiAgICB9XG4gICAgaWYgKCEobmFtZSBpbiBvcmlnaW5hbHMpKSB7XG4gICAgICAgIG9yaWdpbmFsc1tuYW1lXSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbn1cbmNvbnN0IGlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYFske0F0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGV9PSR7RGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGV9XWA7XG5jb25zdCBiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSA9IGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XSR7aXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmV9YDtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0KSB7XG4gICAgLy9GaXJzdCwgZmluZCBhbGwgU2V0QXR0cmlidXRlIGRpcmVjdGl2ZXMgdGhhdCBhcHBseSB0byB0YXJnZXRcbiAgICBjb25zdCBhcHBsaWNhYmxlID0gQXJyYXkuZnJvbSh0YXJnZXQucXVlcnlTZWxlY3RvckFsbChiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSkpO1xuICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0O1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgaWYgKCFjdXJyZW50IHx8ICFjdXJyZW50Lm1hdGNoZXMoYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dWyR7QXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZX1dYCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGFwcGxpY2FibGUucHVzaChjdXJyZW50KTtcbiAgICB9XG4gICAgLy9OZXh0LCBncm91cCB0aGVtIGJ5IHRoZSBhdHRyaWJ1dGUgdGhleSBhcHBseSB0b1xuICAgIGNvbnN0IGJ5QXR0cmlidXRlTmFtZSA9IHt9O1xuICAgIGZvciAobGV0IGVsIG9mIGFwcGxpY2FibGUpIHtcbiAgICAgICAgY29uc3QgYXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsKTtcbiAgICAgICAgaWYgKGFzRGlyZWN0aXZlICYmIGFzRGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBsZXQgYXJyYXkgPSBieUF0dHJpYnV0ZU5hbWVbYXNEaXJlY3RpdmUubmFtZV07XG4gICAgICAgICAgICBpZiAoIWFycmF5KSB7XG4gICAgICAgICAgICAgICAgYXJyYXkgPSBieUF0dHJpYnV0ZU5hbWVbYXNEaXJlY3RpdmUubmFtZV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFycmF5LnB1c2goYXNEaXJlY3RpdmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vTm93LCBhcHBseSBvbmx5IHRoZSBsYXN0IGRpcmVjdGl2ZSBmb3IgZXZlcnkgYXR0cmlidXRlXG4gICAgZm9yIChsZXQgYXR0cmlidXRlIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJ5QXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlcyA9IGJ5QXR0cmlidXRlTmFtZVthdHRyaWJ1dGVdO1xuICAgICAgICBjb25zdCBsYXN0ID0gZGlyZWN0aXZlc1tkaXJlY3RpdmVzLmxlbmd0aCAtIDFdO1xuICAgICAgICBub3RlT3JpZ2luYWxBdHRyaWJ1dGUodGFyZ2V0LCBsYXN0Lm5hbWUpO1xuICAgICAgICBhcHBseSh0YXJnZXQsIGxhc3QubmFtZSwgbGFzdC52YWx1ZSk7XG4gICAgfVxuICAgIC8vRmluYWxseSwgcmVzdG9yZSB0aGUgb3JpZ2luYWwgdmFsdWVzIGZvciBhbnkgYXR0cmlidXRlcyB0aGF0IG5vIGxvbmdlciBoYXZlIGRpcmVjdGl2ZXNcbiAgICBjb25zdCBvcmlnaW5hbHMgPSB0YXJnZXRbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdIHx8IHt9O1xuICAgIGZvciAobGV0IG9yaWdpbmFsIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9yaWdpbmFscykpIHtcbiAgICAgICAgaWYgKCFieUF0dHJpYnV0ZU5hbWVbb3JpZ2luYWxdKSB7XG4gICAgICAgICAgICBhcHBseSh0YXJnZXQsIG9yaWdpbmFsLCBvcmlnaW5hbHNbb3JpZ2luYWxdKTtcbiAgICAgICAgICAgIGRlbGV0ZSBvcmlnaW5hbHNbb3JpZ2luYWxdO1xuICAgICAgICB9XG4gICAgfVxufVxubGV0IHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgPSBuZXcgU2V0KCk7XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKGNiKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGZvciAobGV0IHRhcmdldCBvZiB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyA9IG5ldyBTZXQoKTtcbiAgICB9XG59XG5jb25zdCBzZXRBdHRyaWJ1dGVUYXJnZXQgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGluZm8pIHtcbiAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChpbmZvLnRhcmdldCk7XG4gICAgaW5mby5lbGVtZW50W3NldEF0dHJpYnV0ZVRhcmdldF0gPSBpbmZvLnRhcmdldDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGVsZW1lbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBlbGVtZW50W3NldEF0dHJpYnV0ZVRhcmdldF07XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZCh0YXJnZXQpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFwcGx5KHRhcmdldCwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCb3VuZElucHV0KGJvdW5kSWQsIHNlcnZlclNlZW4sIHZhbHVlKSB7XG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltcIiArIEF0dHJpYnV0ZU5hbWVzLkJvdW5kICsgXCI9XFxcIlwiICsgYm91bmRJZCArIFwiXFxcIl1cIik7XG4gICAgbGV0IHNlZW4gPSBpbnB1dC5ib3VuZFNlZW4gfHwgKGlucHV0LmJvdW5kU2VlbiA9IDApO1xuICAgIGlmIChpbnB1dCAmJiBzZWVuIDw9IHNlcnZlclNlZW4pIHtcbiAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQm91bmRDaGVja2JveChib3VuZElkLCBzZXJ2ZXJTZWVuLCB2YWx1ZSkge1xuICAgIGxldCBjaGVja2VkID0gdmFsdWUgPT09IDE7XG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltcIiArIEF0dHJpYnV0ZU5hbWVzLkNoZWNrYm94ICsgXCI9XFxcIlwiICsgYm91bmRJZCArIFwiXFxcIl1cIik7XG4gICAgbGV0IHNlZW4gPSBpbnB1dC5ib3VuZFNlZW4gfHwgKGlucHV0LmJvdW5kU2VlbiA9IDApO1xuICAgIGlmIChpbnB1dCAmJiBzZWVuIDw9IHNlcnZlclNlZW4pIHtcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IGNoZWNrZWQ7XG4gICAgfVxufVxuIiwiLy9DaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIG1pcnJvcmVkIGluIENsaWVudENvbnN0YW50cy5rdFxuZXhwb3J0IHZhciBEaXJlY3RpdmVUeXBlO1xuKGZ1bmN0aW9uIChEaXJlY3RpdmVUeXBlKSB7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkFwcGx5SnNcIl0gPSBcImpcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiU2V0QXR0cmlidXRlXCJdID0gXCJhXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkV2ZW50SGFuZGxlclwiXSA9IFwiZVwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJDb21wb25lbnRTdGFydFwiXSA9IFwic1wiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJDb21wb25lbnRFbmRcIl0gPSBcImZcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50S2VlcFwiXSA9IFwia1wiO1xufSkoRGlyZWN0aXZlVHlwZSB8fCAoRGlyZWN0aXZlVHlwZSA9IHt9KSk7XG5leHBvcnQgdmFyIEF0dHJpYnV0ZU5hbWVzO1xuKGZ1bmN0aW9uIChBdHRyaWJ1dGVOYW1lcykge1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRGlyZWN0aXZlVHlwZVwiXSA9IFwiZGF0YS1zXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJUYXJnZXRTaWJsaW5nRGlyZWN0aXZlXCJdID0gXCJkYXRhLWZcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkFwcGx5SnNTY3JpcHRcIl0gPSBcImRhdGEtdFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQXBwbHlKc1J1bk9wdGlvblwiXSA9IFwiZGF0YS1yXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJTZXRBdHRyaWJ1dGVOYW1lXCJdID0gXCJkYXRhLWFcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIlNldEF0dHJpYnV0ZVZhbHVlXCJdID0gXCJkYXRhLXZcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIktleVwiXSA9IFwiZGF0YS1rXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudE5hbWVcIl0gPSBcImRhdGEtZVwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnRDYWxsYmFja0lkXCJdID0gXCJkYXRhLWlcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50UHJlZml4XCJdID0gXCJkYXRhLXBcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50U3VmZml4XCJdID0gXCJkYXRhLXhcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50RGF0YVwiXSA9IFwiZGF0YS1kXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJCb3VuZFwiXSA9IFwiZGF0YS1iXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJDaGVja2JveFwiXSA9IFwiZGF0YS1jXCI7XG59KShBdHRyaWJ1dGVOYW1lcyB8fCAoQXR0cmlidXRlTmFtZXMgPSB7fSkpO1xuZXhwb3J0IGNvbnN0IHNjcmlwdFR5cGVTaWduaWZpZXIgPSBcInNoYWRlXCI7XG5leHBvcnQgY29uc3QgY29tcG9uZW50SWRQcmVmaXggPSBcInNoYWRlXCI7XG5leHBvcnQgY29uc3QgY29tcG9uZW50SWRFbmRTdWZmaXggPSBcImVcIjtcbmV4cG9ydCBjb25zdCBtZXNzYWdlVGFnU2VwYXJhdG9yID0gXCJ8XCI7XG5leHBvcnQgY29uc3QgbWVzc2FnZVRhZ0Vycm9yUHJlZml4ID0gXCJFXCI7XG5leHBvcnQgdmFyIFNvY2tldFNjb3BlTmFtZXM7XG4oZnVuY3Rpb24gKFNvY2tldFNjb3BlTmFtZXMpIHtcbiAgICBTb2NrZXRTY29wZU5hbWVzW1wicmVjb25jaWxlXCJdID0gXCJyXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInVwZGF0ZUJvdW5kSW5wdXRcIl0gPSBcImJcIjtcbiAgICBTb2NrZXRTY29wZU5hbWVzW1widXBkYXRlQm91bmRDaGVja2JveFwiXSA9IFwiY1wiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJzZW5kTWVzc2FnZVwiXSA9IFwic1wiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJzZW5kSWZFcnJvclwiXSA9IFwicVwiO1xufSkoU29ja2V0U2NvcGVOYW1lcyB8fCAoU29ja2V0U2NvcGVOYW1lcyA9IHt9KSk7XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRFbmRTdWZmaXgsIGNvbXBvbmVudElkUHJlZml4LCBEaXJlY3RpdmVUeXBlLCBzY3JpcHRUeXBlU2lnbmlmaWVyIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBxdWVyeVNlbGVjdG9yQWxsUGx1c1RhcmdldCB9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7IGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcywgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZSwgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZVJlbW92ZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmltcG9ydCB7IHJ1bkVsZW1lbnRTY3JpcHQgfSBmcm9tIFwiLi9hcHBseWpzXCI7XG5pbXBvcnQgeyByZW1vdmVFdmVudEhhbmRsZXIsIHNldHVwRXZlbnRIYW5kbGVyIH0gZnJvbSBcIi4vZXZlbnRzXCI7XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhcnQge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RW5kIHtcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEtlZXAge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU2V0QXR0cmlidXRlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEFwcGx5SnMge1xuICAgIGNvbnN0cnVjdG9yKGpzLCBvbmx5T25DcmVhdGUpIHtcbiAgICAgICAgdGhpcy5qcyA9IGpzO1xuICAgICAgICB0aGlzLm9ubHlPbkNyZWF0ZSA9IG9ubHlPbkNyZWF0ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihldmVudE5hbWUsIGNhbGxiYWNrSWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmNhbGxiYWNrSWQgPSBjYWxsYmFja0lkO1xuICAgICAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICAgICAgdGhpcy5zdWZmaXggPSBzdWZmaXg7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGFzU2hhZGVEaXJlY3RpdmUoY2hpbGQpIHtcbiAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBjaGlsZC50YWdOYW1lID09IFwiU0NSSVBUXCIgJiYgY2hpbGQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSA9PT0gc2NyaXB0VHlwZVNpZ25pZmllcikge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBjb25zdCBpZCA9IGNoaWxkLmlkO1xuICAgICAgICBzd2l0Y2ggKGRpcmVjdGl2ZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5BcHBseUpzOlxuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bk9wdGlvbiA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5BcHBseUpzUnVuT3B0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuQXBwbHlKc1NjcmlwdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBcHBseUpzKHNjcmlwdCwgcnVuT3B0aW9uID09PSBcIjFcIik7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50U3RhcnQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRTdGFydChpZC5zdWJzdHIoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50RW5kOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50RW5kKGlkLnN1YnN0cig1LCBpZC5sZW5ndGggLSBjb21wb25lbnRJZFByZWZpeC5sZW5ndGggLSBjb21wb25lbnRJZEVuZFN1ZmZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRLZWVwOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgS2VlcChpZC5zdWJzdHIoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuU2V0QXR0cmlidXRlOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkV2ZW50SGFuZGxlcjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnROYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9ICtjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRDYWxsYmFja0lkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmaXggPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRQcmVmaXgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1ZmZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFN1ZmZpeCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXZlbnRIYW5kbGVyKG5hbWUsIGlkLCBwcmVmaXgsIHN1ZmZpeCwgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkQWxsRGlyZWN0aXZlcyhiYXNlKSB7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgZm9yIChsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGJhc2UsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKHNjcmlwdCk7XG4gICAgICAgICAgICBpZiAoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgb25BZGRlZE9yVXBkYXRlZCh7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHNjcmlwdCxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVTY3JpcHRUYXJnZXQoc2NyaXB0KSB7XG4gICAgaWYgKHNjcmlwdC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZSkpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IHNjcmlwdDtcbiAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbi8qKlxuICogQ2FsbGVkIGFmdGVyIHRoZSBkaXJlY3RpdmUgY29udGFpbmVkIGluIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGFyZ2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KGluZm8uZWxlbWVudCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICAgICAgY29uc3QgYWRkSW5mbyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgaW5mbyksIHsgdGFyZ2V0IH0pO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGFkZEluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpIHtcbiAgICAgICAgICAgIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBhZGRJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgYWRkSW5mbyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdGFyZ2V0IGZvciAke2luZm8uZWxlbWVudC5vdXRlckhUTUx9YCk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIG9uUmVtb3ZlZChpbmZvKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmU7XG4gICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIFNldEF0dHJpYnV0ZSkge1xuICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGluZm8uZWxlbWVudCk7XG4gICAgfVxuICAgIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbyk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGVycm9yRGlzcGxheShjb250ZW50KSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCI8ZGl2IGlkPSdzaGFkZU1vZGFsJyBzdHlsZT0ncG9zaXRpb246IGZpeGVkO3otaW5kZXg6IDk5OTk5OTk5OTtsZWZ0OiAwO3RvcDogMDt3aWR0aDogMTAwJTtoZWlnaHQ6IDEwMCU7b3ZlcmZsb3c6IGF1dG87YmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDAsMCwwLjQpOyc+PGRpdiBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjogI2ZmZjttYXJnaW46IDE1JSBhdXRvO3BhZGRpbmc6IDIwcHg7Ym9yZGVyOiAxcHggc29saWQgIzg4ODt3aWR0aDogODAlOyc+PHNwYW4gaWQ9J3NoYWRlQ2xvc2UnIHN0eWxlPSdmbG9hdDogcmlnaHQ7Zm9udC1zaXplOiAyOHB4O2ZvbnQtd2VpZ2h0OiBib2xkO2N1cnNvcjogcG9pbnRlcjsnPiZ0aW1lczs8L3NwYW4+PHA+XCIgKyBjb250ZW50ICsgXCI8L3A+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhZGVDbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGFkZU1vZGFsJyk7XG4gICAgICAgIG0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtKTtcbiAgICB9KTtcbn1cbiIsImltcG9ydCB7IHNlbmRJZkVycm9yLCBzZW5kTWVzc2FnZSB9IGZyb20gXCIuL3NvY2tldFwiO1xuaW1wb3J0IHsgcmVjb25jaWxlIH0gZnJvbSBcIi4vcmVjb25jaWxlXCI7XG5pbXBvcnQgeyB1cGRhdGVCb3VuZENoZWNrYm94LCB1cGRhdGVCb3VuZElucHV0IH0gZnJvbSBcIi4vYm91bmRcIjtcbmltcG9ydCB7IFNvY2tldFNjb3BlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZVNjcmlwdCh0YWcsIHNjb3BlLCBzY3JpcHQpIHtcbiAgICB0cnkge1xuICAgICAgICBzY29wZShzY3JpcHQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBzZW5kSWZFcnJvcihlLCB0YWcsIHNjcmlwdC5zdWJzdHJpbmcoMCwgMjU2KSk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VFdmFsU2NvcGUoc2NvcGUpIHtcbiAgICBjb25zdCBmaW5hbCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgYmFzZVNjb3BlKSwgc2NvcGUpO1xuICAgIGNvbnN0IGJhc2UgPSBbXTtcbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZmluYWwpKSB7XG4gICAgICAgIGJhc2UucHVzaChgdmFyICR7a2V5fT1maW5hbC4ke2tleX07YCk7XG4gICAgfVxuICAgIGNvbnN0IGJhc2VTY3JpcHQgPSBiYXNlLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiO1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICAgIGV2YWwoXCIoZnVuY3Rpb24oKXtcXG5cIiArIGJhc2VTY3JpcHQgKyBzY3JpcHQgKyBcIlxcbn0pKClcIik7XG4gICAgfTtcbn1cbmV4cG9ydCBjb25zdCBiYXNlU2NvcGUgPSB7XG4gICAgW1NvY2tldFNjb3BlTmFtZXMucmVjb25jaWxlXTogcmVjb25jaWxlLFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnVwZGF0ZUJvdW5kSW5wdXRdOiB1cGRhdGVCb3VuZElucHV0LFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnVwZGF0ZUJvdW5kQ2hlY2tib3hdOiB1cGRhdGVCb3VuZENoZWNrYm94LFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlXTogc2VuZE1lc3NhZ2UsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZElmRXJyb3JdOiBzZW5kSWZFcnJvclxufTtcbiIsImltcG9ydCB7IFNvY2tldFNjb3BlTmFtZXMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGV2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlIH0gZnJvbSBcIi4vZXZhbFwiO1xuY29uc3QgZXZlbnRQcmV2aW91cyA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbykge1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KTtcbiAgICBjb25zdCBwcmVmaXggPSBkaXJlY3RpdmUucHJlZml4ID8gYCR7ZGlyZWN0aXZlLnByZWZpeH07XFxuYCA6IFwiXCI7XG4gICAgY29uc3QgZGF0YSA9IGRpcmVjdGl2ZS5kYXRhID8gYCxKU09OLnN0cmluZ2lmeSgke2RpcmVjdGl2ZS5kYXRhfSlgIDogXCJcIjtcbiAgICBjb25zdCBzdWZmaXggPSBkaXJlY3RpdmUuc3VmZml4ID8gYDtcXG4ke2RpcmVjdGl2ZS5zdWZmaXh9YCA6IFwiXCI7XG4gICAgY29uc3Qgc2NyaXB0ID0gYCR7cHJlZml4fSR7U29ja2V0U2NvcGVOYW1lcy5zZW5kTWVzc2FnZX0oJHtkaXJlY3RpdmUuY2FsbGJhY2tJZH0ke2RhdGF9KSR7c3VmZml4fWA7XG4gICAgY29uc3QgbGlzdGVuZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe1xuICAgICAgICAgICAgZXZlbnQ6IGUsXG4gICAgICAgICAgICBlOiBlLFxuICAgICAgICAgICAgaXQ6IGUudGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBzY3JpcHQpO1xuICAgIH07XG4gICAgaW5mby50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihkaXJlY3RpdmUuZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgaW5mby5lbGVtZW50W2V2ZW50UHJldmlvdXNdID0ge1xuICAgICAgICBldmVudE5hbWU6IGRpcmVjdGl2ZS5ldmVudE5hbWUsXG4gICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbykge1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoZWxlbWVudCkge1xuICAgIGNvbnN0IHByZXZpb3VzID0gZWxlbWVudFtldmVudFByZXZpb3VzXTtcbiAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgcHJldmlvdXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJldmlvdXMuZXZlbnROYW1lLCBwcmV2aW91cy5saXN0ZW5lcik7XG4gICAgfVxufVxuIiwiLy9SZWNvbmNpbGUgYSB0YXJnZXRJZCB3aXRoIEhUTUxcbmltcG9ydCB7IGFzU2hhZGVEaXJlY3RpdmUsIENvbXBvbmVudEVuZCwgQ29tcG9uZW50U3RhcnQsIGRldGVybWluZVNjcmlwdFRhcmdldCwgS2VlcCwgb25BZGRlZE9yVXBkYXRlZCwgb25SZW1vdmVkIH0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaW1wb3J0IHsgQXR0cmlidXRlTmFtZXMsIGNvbXBvbmVudElkUHJlZml4IH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBjaGFuZ2luZ0F0dHJpYnV0ZURpcmVjdGl2ZXMsIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UgfSBmcm9tIFwiLi9hdHRyaWJ1dGVzXCI7XG5leHBvcnQgZnVuY3Rpb24gcmVjb25jaWxlKHRhcmdldElkLCBodG1sKSB7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29tcG9uZW50SWRQcmVmaXggKyB0YXJnZXRJZCk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGh0bWxEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHBhcmVudC50YWdOYW1lKTtcbiAgICAgICAgaHRtbERvbS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBjb25zdCBpbmNsdWRlZCA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudCA9IHRhcmdldC5uZXh0U2libGluZztcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY3VycmVudCk7XG4gICAgICAgICAgICBpZiAoY3VycmVudERpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjdXJyZW50RGlyZWN0aXZlLmlkID09IFwiXCIgKyB0YXJnZXRJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaChjdXJyZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIHBhdGNoQ2hpbGRyZW4ocGFyZW50LCB0YXJnZXQsIGluY2x1ZGVkLCBodG1sRG9tLmNoaWxkTm9kZXMpO1xuICAgIH0pO1xufVxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydERpcmVjdGl2ZSwgc3RhcnQsIGNoaWxkcmVuLCBlbmQpIHtcbiAgICAgICAgdGhpcy5zdGFydERpcmVjdGl2ZSA9IHN0YXJ0RGlyZWN0aXZlO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgfVxuICAgIGFzTm9kZXMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5zdGFydCwgLi4udGhpcy5jaGlsZHJlbiwgdGhpcy5lbmRdO1xuICAgIH1cbiAgICBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnREaXJlY3RpdmUuaWQ7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNOb2Rlcyh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGFyZ2V0IGluc3RhbmNlb2YgQ29tcG9uZW50ID8gdGFyZ2V0LmFzTm9kZXMoKSA6IFt0YXJnZXRdO1xufVxuZnVuY3Rpb24gcmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKSB7XG4gICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAob3JpZ2luYWwudGFnTmFtZSAhPSBuZXdlci50YWdOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yaWdpbmFsLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBvcmlnaW5hbC5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld2VyLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBuZXdlci5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWwuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgbmV3ZXIuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZShvcmlnaW5hbCk7XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKG9yaWdpbmFsLCBudWxsLCBvcmlnaW5hbC5jaGlsZE5vZGVzLCBuZXdlci5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4oZG9tLCBhcHBlbmRTdGFydCwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pIHtcbiAgICBjb25zdCBmaW5hbCA9IHJlY29uY2lsZUNoaWxkcmVuKGRvbSwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pO1xuICAgIGxldCBlbmRPZlBhdGNoUmFuZ2U7XG4gICAgaWYgKGRvbUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gZG9tQ2hpbGRyZW5bZG9tQ2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFwcGVuZFN0YXJ0KSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGFwcGVuZFN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gbnVsbDtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnQgPSBhcHBlbmRTdGFydCA/IGFwcGVuZFN0YXJ0IDogXCJzdGFydFwiO1xuICAgIGZ1bmN0aW9uIGFmdGVyQ3VycmVudCgpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQgPT0gXCJzdGFydFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9tLmZpcnN0Q2hpbGQgPyBkb20uZmlyc3RDaGlsZCA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3VycmVudCA9PSBcImVuZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJlbmRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Lm5leHRTaWJsaW5nID8gY3VycmVudC5uZXh0U2libGluZyA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmaW5hbCkge1xuICAgICAgICBsZXQgbmV4dCA9IGFmdGVyQ3VycmVudCgpO1xuICAgICAgICBpZiAobmV4dCAhPT0gY2hpbGQpIHtcbiAgICAgICAgICAgIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQgPT09IFwiZW5kXCIgPyBudWxsIDogbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbm90aWZ5QWRkZWRPclVwZGF0ZWQoY2hpbGQpO1xuICAgICAgICBjdXJyZW50ID0gY2hpbGQ7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICB3aGlsZSAoY3VycmVudCAhPSBcImVuZFwiICYmIGN1cnJlbnQgIT0gZW5kT2ZQYXRjaFJhbmdlKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY3VycmVudDtcbiAgICAgICAgY3VycmVudCA9IGFmdGVyQ3VycmVudCgpO1xuICAgICAgICBub3RpZnlSZW1vdmVkKGNoaWxkKTtcbiAgICAgICAgZG9tLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZWNvbmNpbGVDaGlsZHJlbihkb20sIGRvbUNoaWxkcmVuLCByZXBsYWNlbWVudENoaWxkcmVuKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihkb21DaGlsZHJlbik7XG4gICAgY29uc3QgcmVwbGFjZW1lbnRzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihyZXBsYWNlbWVudENoaWxkcmVuKTtcbiAgICBjb25zdCBvcmlnaW5hbEtleXMgPSBjb2xsZWN0S2V5c01hcChvcmlnaW5hbHMpO1xuICAgIGxldCBvcmlnaW5hbEluZGV4ID0gMDtcbiAgICBsZXQgcmVwbGFjZW1lbnRJbmRleCA9IDA7XG4gICAgY29uc3QgZmluYWxDaGlsZHJlbiA9IFtdO1xuICAgIGNvbnN0IGtleVVzZWQgPSBuZXcgU2V0KCk7XG4gICAgY29uc3Qga2V5VW51c2VkID0gbmV3IFNldCgpO1xuICAgIHdoaWxlIChvcmlnaW5hbEluZGV4IDwgb3JpZ2luYWxzLmxlbmd0aCB8fCByZXBsYWNlbWVudEluZGV4IDwgcmVwbGFjZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhdEN1cnNvciA9IG9yaWdpbmFsc1tvcmlnaW5hbEluZGV4XTtcbiAgICAgICAgY29uc3QgbmV3ZXIgPSByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRJbmRleF07XG4gICAgICAgIGlmICghYXRDdXJzb3IgJiYgbmV3ZXIpIHtcbiAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaCguLi4oYXNOb2RlcyhuZXdlcikpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhdEN1cnNvciAmJiAhbmV3ZXIpIHtcbiAgICAgICAgICAgIC8qIEltcGxpY2l0IHJlbW92ZSAqL1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IG9yaWdpbmFsID0gYXRDdXJzb3I7XG4gICAgICAgICAgICBjb25zdCBuZXdlcktleSA9IGdldEtleShuZXdlcik7XG4gICAgICAgICAgICBpZiAobmV3ZXJLZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQnlLZXkgPSBvcmlnaW5hbEtleXNbbmV3ZXJLZXldO1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbEJ5S2V5ICYmIG9yaWdpbmFsICE9PSBvcmlnaW5hbEJ5S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGtleVVzZWQuYWRkKG9yaWdpbmFsQnlLZXkpO1xuICAgICAgICAgICAgICAgICAgICBrZXlVbnVzZWQuYWRkKG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwgPSBvcmlnaW5hbEJ5S2V5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsS2V5ID0gZ2V0S2V5KG9yaWdpbmFsKTtcbiAgICAgICAgICAgIGxldCBhZGQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IG5ld2VyRGlyZWN0aXZlID0gbmV3ZXIgaW5zdGFuY2VvZiBDb21wb25lbnQgPyBudWxsIDogYXNTaGFkZURpcmVjdGl2ZShuZXdlcik7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQgJiYgbmV3ZXJEaXJlY3RpdmUgaW5zdGFuY2VvZiBLZWVwICYmIG5ld2VyRGlyZWN0aXZlLmlkID09IG9yaWdpbmFsLmlkKCkpIHtcbiAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbEtleSAhPSBuZXdlcktleSkge1xuICAgICAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG5ld2VyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG9yaWdpbmFsLmlkKCkgPT0gbmV3ZXIuaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlY29uY2lsZUNoaWxkcmVuKGRvbSwgb3JpZ2luYWwuY2hpbGRyZW4sIG5ld2VyLmNoaWxkcmVuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMobmV3ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG5ld2VyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtyZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaCguLi5hZGQpO1xuICAgICAgICB9XG4gICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gZmluYWxDaGlsZHJlbjtcbn1cbmZ1bmN0aW9uIG5vdGlmeUFkZGVkT3JVcGRhdGVkKG5vZGUpIHtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiBub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgbm90aWZ5QWRkZWRPclVwZGF0ZWQoY2hpbGQpO1xuICAgIH1cbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUobm9kZSk7XG4gICAgICAgIGlmIChkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgIG9uQWRkZWRPclVwZGF0ZWQoe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG5vZGUsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIG5vdGlmeVJlbW92ZWQobm9kZSkge1xuICAgIGZvciAobGV0IGNoaWxkIG9mIG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICBub3RpZnlSZW1vdmVkKGNoaWxkKTtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShub2RlKTtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGRpcmVjdGl2ZSkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkZXRlcm1pbmVTY3JpcHRUYXJnZXQobm9kZSk7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIG9uUmVtb3ZlZCh7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogbm9kZSxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihsaXN0KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCk7XG4gICAgICAgIGxldCBlbmQgPSBudWxsO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50U3RhcnQpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YkNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEFzRGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShzdWJDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkQXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRFbmQgJiYgY2hpbGRBc0RpcmVjdGl2ZS5pZCA9PSBkaXJlY3RpdmUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ViQ2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnB1c2goc3ViQ2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIk1pc3NpbmcgZW5kIHRhZyBmb3IgY29tcG9uZW50IFwiICsgZGlyZWN0aXZlLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBDb21wb25lbnQoZGlyZWN0aXZlLCBjaGlsZCwgY29tcG9uZW50LCBlbmQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29sbGVjdEtleXNNYXAoY2hpbGRMaXN0KSB7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRMaXN0W2ldO1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRLZXkoY2hpbGQpO1xuICAgICAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleXNba2V5XSA9IGNoaWxkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuZnVuY3Rpb24gZ2V0S2V5KGNoaWxkKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gY2hpbGQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyBjaGlsZC5zdGFydCA6IGNoaWxkO1xuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBrZXkgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLktleSk7XG4gICAgICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbiIsImltcG9ydCB7IGNvbm5lY3RTb2NrZXQsIHNlbmRJZkVycm9yIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyBlcnJvckRpc3BsYXkgfSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7IHdoZW5Eb2N1bWVudFJlYWR5IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHsgYWRkQWxsRGlyZWN0aXZlcyB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmlmICghd2luZG93LnNoYWRlKSB7XG4gICAgd2luZG93LnNoYWRlID0ge307XG4gICAgaWYgKCF3aW5kb3cuV2ViU29ja2V0KSB7XG4gICAgICAgIGVycm9yRGlzcGxheShcIllvdXIgd2ViIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHRoaXMgcGFnZSwgYW5kIGl0IG1heSBub3QgZnVuY3Rpb24gY29ycmVjdGx5IGFzIGEgcmVzdWx0LiBVcGdyYWRlIHlvdXIgd2ViIGJyb3dzZXIuXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29ubmVjdFNvY2tldCgpO1xuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhZGRBbGxEaXJlY3RpdmVzKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LmVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LnJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGVycm9yRGlzcGxheSB9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQgeyBtZXNzYWdlVGFnRXJyb3JQcmVmaXgsIG1lc3NhZ2VUYWdTZXBhcmF0b3IgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IHdoZW5Eb2N1bWVudFJlYWR5IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xubGV0IHNvY2tldFJlYWR5ID0gZmFsc2U7XG5jb25zdCBzb2NrZXRSZWFkeVF1ZXVlID0gW107XG5sZXQgc29ja2V0O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RTb2NrZXQoKSB7XG4gICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCgod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gXCJ3c3M6Ly9cIiA6IFwid3M6Ly9cIikgKyAod2luZG93LnNoYWRlSG9zdCB8fCB3aW5kb3cubG9jYXRpb24uaG9zdCkgKyB3aW5kb3cuc2hhZGVFbmRwb2ludCk7XG4gICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgaWQgPSB3aW5kb3cuc2hhZGVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWQgd2l0aCBJRCBcIiArIGlkKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIHNvY2tldC5zZW5kKGlkKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoc29ja2V0UmVhZHlRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZW5kTWVzc2FnZShzb2NrZXRSZWFkeVF1ZXVlLnNoaWZ0KCksIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhO1xuICAgICAgICBjb25zdCBzcGxpdEluZGV4ID0gZGF0YS5pbmRleE9mKG1lc3NhZ2VUYWdTZXBhcmF0b3IpO1xuICAgICAgICBjb25zdCB0YWcgPSBkYXRhLnN1YnN0cmluZygwLCBzcGxpdEluZGV4KTtcbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZGF0YS5zdWJzdHJpbmcoc3BsaXRJbmRleCArIDEsIGRhdGEubGVuZ3RoKTtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHt9KTtcbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZhbHVhdGVTY3JpcHQodGFnLCBzY29wZSwgc2NyaXB0KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBsZXQgZXJyb3JUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICBmdW5jdGlvbiBlcnJvclJlbG9hZCgpIHtcbiAgICAgICAgaWYgKGVycm9yVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3JUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsYXN0UmVsb2FkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIGlmIChsYXN0UmVsb2FkKSB7XG4gICAgICAgICAgICBlcnJvckRpc3BsYXkoXCJUaGlzIHdlYiBwYWdlIGNvdWxkIG5vdCBjb25uZWN0IHRvIGl0cyBzZXJ2ZXIuIFBsZWFzZSByZWxvYWQgb3IgdHJ5IGFnYWluIGxhdGVyLlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hhZGVfbGFzdF9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dC5yZWFzb259LCAke2V2dC53YXNDbGVhbn1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKGV2dC53YXNDbGVhbikge1xuICAgICAgICAgICAgLy9jb25uZWN0U29ja2V0KClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgU29ja2V0IGNsb3NlZDogJHtldnR9YCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gZmFsc2U7XG4gICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgfTtcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoXCJcIik7XG4gICAgICAgIH1cbiAgICB9LCA2MCAqIDEwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRNZXNzYWdlKGlkLCBtc2cpIHtcbiAgICBjb25zdCBmaW5hbE1zZyA9IChtc2cgIT09IHVuZGVmaW5lZCAmJiBtc2cgIT09IG51bGwpID8gaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yICsgbXNnIDogaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yO1xuICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICBzb2NrZXQuc2VuZChmaW5hbE1zZyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzb2NrZXRSZWFkeVF1ZXVlLnB1c2goZmluYWxNc2cpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZW5kSWZFcnJvcihlcnJvciwgdGFnLCBldmFsVGV4dCkge1xuICAgIGNvbnN0IGRhdGEgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8ge1xuICAgICAgICBuYW1lOiBlcnJvci5uYW1lLFxuICAgICAgICBqc01lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfSA6IHtcbiAgICAgICAgbmFtZTogXCJVbmtub3duXCIsXG4gICAgICAgIGpzTWVzc2FnZTogXCJVbmtub3duIGVycm9yOiBcIiArIGVycm9yLFxuICAgICAgICBzdGFjazogXCJcIixcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfTtcbiAgICBzb2NrZXQuc2VuZChgJHttZXNzYWdlVGFnRXJyb3JQcmVmaXh9JHt0YWcgPT0gdW5kZWZpbmVkID8gXCJcIiA6IHRhZ30ke21lc3NhZ2VUYWdTZXBhcmF0b3J9YCArIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yQWxsUGx1c1RhcmdldCh0YXJnZXQsIHNlbGVjdG9yKSB7XG4gICAgY29uc3QgYmVsb3cgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgaWYgKHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gW3RhcmdldCwgLi4uYmVsb3ddO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYmVsb3cpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiB3aGVuRG9jdW1lbnRSZWFkeShmbikge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJpbnRlcmFjdGl2ZVwiKSB7XG4gICAgICAgIGZuKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmbik7XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==