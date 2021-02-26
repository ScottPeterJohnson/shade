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
            Object(_attributes__WEBPACK_IMPORTED_MODULE_2__["onAttributesSetFromSource"])(original);
            if (changed) {
                Object(_directives__WEBPACK_IMPORTED_MODULE_0__["checkDirectiveChange"])(original);
            }
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
    const originals = collapseComponentChildren(domChildren);
    const replacements = collapseComponentChildren(replacementChildren);
    const originalKeys = collectKeysMap(originals);
    let originalIndex = 0;
    let replacementIndex = 0;
    const finalChildren = [];
    const keyUsed = new Set();
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
        else {
            const newerKey = getKey(newer);
            if (newerKey != null) {
                keyUsed.add(newerKey);
                original = originalKeys[newerKey];
                //We'll match this unkeyed original again on something without a key
                originalIndex -= 1;
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
            if (original && original instanceof Component && newerDirective instanceof _directives__WEBPACK_IMPORTED_MODULE_0__["Keep"] && newerDirective.id == original.id()) {
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
    for (const key of Object.getOwnPropertyNames(originalKeys)) {
        if (!keyUsed.has(key)) {
            const original = originalKeys[key];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcGx5anMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F0dHJpYnV0ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JvdW5kLnRzIiwid2VicGFjazovLy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RpcmVjdGl2ZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Vycm9ycy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZhbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzLnRzIiwid2VicGFjazovLy8uL3NyYy9yZWNvbmNpbGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYWRlLnRzIiwid2VicGFjazovLy8uL3NyYy9zb2NrZXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2hhZGUtYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvc2hhZGUudHNcIik7XG4iLCJpbXBvcnQgeyBldmFsdWF0ZVNjcmlwdCwgbWFrZUV2YWxTY29wZSB9IGZyb20gXCIuL2V2YWxcIjtcbmNvbnN0IHNjcmlwdFByZXZpb3VzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gcnVuRWxlbWVudFNjcmlwdChkaXJlY3RpdmUsIGluZm8pIHtcbiAgICBjb25zdCBvbGQgPSBpbmZvLmVsZW1lbnRbc2NyaXB0UHJldmlvdXNdO1xuICAgIGlmICghZGlyZWN0aXZlLm9ubHlPbkNyZWF0ZSB8fCAhb2xkIHx8IG9sZC5qcyAhPSBkaXJlY3RpdmUuanMgfHwgb2xkLnRhcmdldCAhPSBpbmZvLnRhcmdldCkge1xuICAgICAgICBpbmZvLmVsZW1lbnRbc2NyaXB0UHJldmlvdXNdID0ge1xuICAgICAgICAgICAganM6IGRpcmVjdGl2ZS5qcyxcbiAgICAgICAgICAgIHRhcmdldDogaW5mby50YXJnZXRcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXQgPSBpbmZvLnRhcmdldDtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHtcbiAgICAgICAgICAgIGl0XG4gICAgICAgIH0pO1xuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBkaXJlY3RpdmUuanMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGFzU2hhZGVEaXJlY3RpdmUsIFNldEF0dHJpYnV0ZSB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBEaXJlY3RpdmVUeXBlLCBzY3JpcHRUeXBlU2lnbmlmaWVyIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG4vL1dlIG5lZWQgc29tZSB3YXkgb2Ygc3RvcmluZyB0aGUgb3JpZ2luYWwgdmFsdWVzIG9mIGFuIGF0dHJpYnV0ZSBiZWZvcmUgYW4gYXR0cmlidXRlIGRpcmVjdGl2ZSB3YXMgYXBwbGllZCxcbi8vaW4gY2FzZSB0aGF0IGRpcmVjdGl2ZSBpcyByZW1vdmVkIGluIGFuIHVwZGF0ZSB0aGF0IGRvZXMgbm90IHJlc2V0IGFuIGVsZW1lbnQncyBhdHRyaWJ1dGVzLlxuY29uc3QgYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXMgPSBTeW1ib2woKTtcbmV4cG9ydCBmdW5jdGlvbiBvbkF0dHJpYnV0ZXNTZXRGcm9tU291cmNlKGVsZW1lbnQpIHtcbiAgICBkZWxldGUgZWxlbWVudFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc107XG59XG5mdW5jdGlvbiBub3RlT3JpZ2luYWxBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSkge1xuICAgIGxldCBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZiAoIW9yaWdpbmFscykge1xuICAgICAgICBvcmlnaW5hbHMgPSBlbGVtZW50W2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIShuYW1lIGluIG9yaWdpbmFscykpIHtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuY29uc3QgaXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmUgPSBgWyR7QXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZX09JHtEaXJlY3RpdmVUeXBlLlNldEF0dHJpYnV0ZX1dYDtcbmNvbnN0IGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dJHtpc1NldEF0dHJpYnV0ZURpcmVjdGl2ZX1gO1xuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlRGlyZWN0aXZlcyh0YXJnZXQpIHtcbiAgICAvL0ZpcnN0LCBmaW5kIGFsbCBTZXRBdHRyaWJ1dGUgZGlyZWN0aXZlcyB0aGF0IGFwcGx5IHRvIHRhcmdldFxuICAgIGNvbnN0IGFwcGxpY2FibGUgPSBBcnJheS5mcm9tKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKGJhc2VRdWVyeUlzU2V0QXR0cmlidXRlRGlyZWN0aXZlKSk7XG4gICAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICBpZiAoIWN1cnJlbnQgfHwgIWN1cnJlbnQubWF0Y2hlcyhgc2NyaXB0W3R5cGU9JHtzY3JpcHRUeXBlU2lnbmlmaWVyfV1bJHtBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlfV1gKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICAvL05leHQsIGdyb3VwIHRoZW0gYnkgdGhlIGF0dHJpYnV0ZSB0aGV5IGFwcGx5IHRvXG4gICAgY29uc3QgYnlBdHRyaWJ1dGVOYW1lID0ge307XG4gICAgZm9yIChsZXQgZWwgb2YgYXBwbGljYWJsZSkge1xuICAgICAgICBjb25zdCBhc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWwpO1xuICAgICAgICBpZiAoYXNEaXJlY3RpdmUgJiYgYXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGxldCBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXTtcbiAgICAgICAgICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyYXkucHVzaChhc0RpcmVjdGl2ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9Ob3csIGFwcGx5IG9ubHkgdGhlIGxhc3QgZGlyZWN0aXZlIGZvciBldmVyeSBhdHRyaWJ1dGVcbiAgICBmb3IgKGxldCBhdHRyaWJ1dGUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYnlBdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gYnlBdHRyaWJ1dGVOYW1lW2F0dHJpYnV0ZV07XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJlY3RpdmVzW2RpcmVjdGl2ZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIG5vdGVPcmlnaW5hbEF0dHJpYnV0ZSh0YXJnZXQsIGxhc3QubmFtZSk7XG4gICAgICAgIGFwcGx5KHRhcmdldCwgbGFzdC5uYW1lLCBsYXN0LnZhbHVlKTtcbiAgICB9XG4gICAgLy9GaW5hbGx5LCByZXN0b3JlIHRoZSBvcmlnaW5hbCB2YWx1ZXMgZm9yIGFueSBhdHRyaWJ1dGVzIHRoYXQgbm8gbG9uZ2VyIGhhdmUgZGlyZWN0aXZlc1xuICAgIGNvbnN0IG9yaWdpbmFscyA9IHRhcmdldFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10gfHwge307XG4gICAgZm9yIChsZXQgb3JpZ2luYWwgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxzKSkge1xuICAgICAgICBpZiAoIWJ5QXR0cmlidXRlTmFtZVtvcmlnaW5hbF0pIHtcbiAgICAgICAgICAgIGFwcGx5KHRhcmdldCwgb3JpZ2luYWwsIG9yaWdpbmFsc1tvcmlnaW5hbF0pO1xuICAgICAgICAgICAgZGVsZXRlIG9yaWdpbmFsc1tvcmlnaW5hbF07XG4gICAgICAgIH1cbiAgICB9XG59XG5sZXQgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyA9IG5ldyBTZXQoKTtcbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2luZ0F0dHJpYnV0ZURpcmVjdGl2ZXMoY2IpIHtcbiAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgZm9yIChsZXQgdGFyZ2V0IG9mIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzID0gbmV3IFNldCgpO1xuICAgIH1cbn1cbmNvbnN0IHNldEF0dHJpYnV0ZVRhcmdldCA9IFN5bWJvbCgpO1xuZXhwb3J0IGZ1bmN0aW9uIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVDaGFuZ2UoaW5mbykge1xuICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKGluZm8udGFyZ2V0KTtcbiAgICBpbmZvLmVsZW1lbnRbc2V0QXR0cmlidXRlVGFyZ2V0XSA9IGluZm8udGFyZ2V0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoZWxlbWVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGVsZW1lbnRbc2V0QXR0cmlidXRlVGFyZ2V0XTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKHRhcmdldCk7XG4gICAgfVxufVxuZnVuY3Rpb24gYXBwbHkodGFyZ2V0LCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJvdW5kSW5wdXQoYm91bmRJZCwgc2VydmVyU2VlbiwgdmFsdWUsIHNldHRlcikge1xuICAgIGxldCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbXCIgKyBBdHRyaWJ1dGVOYW1lcy5Cb3VuZCArIFwiPVxcXCJcIiArIGJvdW5kSWQgKyBcIlxcXCJdXCIpO1xuICAgIGxldCBzZWVuID0gaW5wdXQuYm91bmRTZWVuIHx8IChpbnB1dC5ib3VuZFNlZW4gPSAwKTtcbiAgICBpZiAoaW5wdXQgJiYgc2VlbiA8PSBzZXJ2ZXJTZWVuKSB7XG4gICAgICAgIHNldHRlcihpbnB1dCwgdmFsdWUpO1xuICAgIH1cbn1cbiIsIi8vQ2hhbmdlcyBoZXJlIHNob3VsZCBiZSBtaXJyb3JlZCBpbiBDbGllbnRDb25zdGFudHMua3RcbmV4cG9ydCB2YXIgRGlyZWN0aXZlVHlwZTtcbihmdW5jdGlvbiAoRGlyZWN0aXZlVHlwZSkge1xuICAgIERpcmVjdGl2ZVR5cGVbXCJBcHBseUpzXCJdID0gXCJqXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIlNldEF0dHJpYnV0ZVwiXSA9IFwiYVwiO1xuICAgIERpcmVjdGl2ZVR5cGVbXCJFdmVudEhhbmRsZXJcIl0gPSBcImVcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50U3RhcnRcIl0gPSBcInNcIjtcbiAgICBEaXJlY3RpdmVUeXBlW1wiQ29tcG9uZW50RW5kXCJdID0gXCJmXCI7XG4gICAgRGlyZWN0aXZlVHlwZVtcIkNvbXBvbmVudEtlZXBcIl0gPSBcImtcIjtcbn0pKERpcmVjdGl2ZVR5cGUgfHwgKERpcmVjdGl2ZVR5cGUgPSB7fSkpO1xuZXhwb3J0IHZhciBBdHRyaWJ1dGVOYW1lcztcbihmdW5jdGlvbiAoQXR0cmlidXRlTmFtZXMpIHtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkRpcmVjdGl2ZVR5cGVcIl0gPSBcImRhdGEtc1wiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiVGFyZ2V0U2libGluZ0RpcmVjdGl2ZVwiXSA9IFwiZGF0YS1mXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJBcHBseUpzU2NyaXB0XCJdID0gXCJkYXRhLXRcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkFwcGx5SnNSdW5PcHRpb25cIl0gPSBcImRhdGEtclwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiU2V0QXR0cmlidXRlTmFtZVwiXSA9IFwiZGF0YS1hXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJTZXRBdHRyaWJ1dGVWYWx1ZVwiXSA9IFwiZGF0YS12XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJLZXlcIl0gPSBcImRhdGEta1wiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiRXZlbnROYW1lXCJdID0gXCJkYXRhLWVcIjtcbiAgICBBdHRyaWJ1dGVOYW1lc1tcIkV2ZW50Q2FsbGJhY2tJZFwiXSA9IFwiZGF0YS1pXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudFByZWZpeFwiXSA9IFwiZGF0YS1wXCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudFN1ZmZpeFwiXSA9IFwiZGF0YS14XCI7XG4gICAgQXR0cmlidXRlTmFtZXNbXCJFdmVudERhdGFcIl0gPSBcImRhdGEtZFwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQm91bmRcIl0gPSBcImRhdGEtYlwiO1xuICAgIEF0dHJpYnV0ZU5hbWVzW1wiQ2hlY2tib3hcIl0gPSBcImRhdGEtY1wiO1xufSkoQXR0cmlidXRlTmFtZXMgfHwgKEF0dHJpYnV0ZU5hbWVzID0ge30pKTtcbmV4cG9ydCBjb25zdCBzY3JpcHRUeXBlU2lnbmlmaWVyID0gXCJzaGFkZVwiO1xuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkUHJlZml4ID0gXCJzaGFkZVwiO1xuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkRW5kU3VmZml4ID0gXCJlXCI7XG5leHBvcnQgY29uc3QgbWVzc2FnZVRhZ1NlcGFyYXRvciA9IFwifFwiO1xuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdFcnJvclByZWZpeCA9IFwiRVwiO1xuZXhwb3J0IHZhciBTb2NrZXRTY29wZU5hbWVzO1xuKGZ1bmN0aW9uIChTb2NrZXRTY29wZU5hbWVzKSB7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInJlY29uY2lsZVwiXSA9IFwiclwiO1xuICAgIFNvY2tldFNjb3BlTmFtZXNbXCJ1cGRhdGVCb3VuZElucHV0XCJdID0gXCJiXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInNlbmRNZXNzYWdlXCJdID0gXCJzXCI7XG4gICAgU29ja2V0U2NvcGVOYW1lc1tcInNlbmRJZkVycm9yXCJdID0gXCJxXCI7XG59KShTb2NrZXRTY29wZU5hbWVzIHx8IChTb2NrZXRTY29wZU5hbWVzID0ge30pKTtcbiIsImltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBjb21wb25lbnRJZEVuZFN1ZmZpeCwgY29tcG9uZW50SWRQcmVmaXgsIERpcmVjdGl2ZVR5cGUsIHNjcmlwdFR5cGVTaWduaWZpZXIgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0IH0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHsgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlIH0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuaW1wb3J0IHsgcnVuRWxlbWVudFNjcmlwdCB9IGZyb20gXCIuL2FwcGx5anNcIjtcbmltcG9ydCB7IHJlbW92ZUV2ZW50SGFuZGxlciwgc2V0dXBFdmVudEhhbmRsZXIgfSBmcm9tIFwiLi9ldmVudHNcIjtcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRTdGFydCB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFbmQge1xuICAgIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgS2VlcCB7XG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTZXRBdHRyaWJ1dGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXBwbHlKcyB7XG4gICAgY29uc3RydWN0b3IoanMsIG9ubHlPbkNyZWF0ZSkge1xuICAgICAgICB0aGlzLmpzID0ganM7XG4gICAgICAgIHRoaXMub25seU9uQ3JlYXRlID0gb25seU9uQ3JlYXRlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBFdmVudEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZSwgY2FsbGJhY2tJZCwgcHJlZml4LCBzdWZmaXgsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tJZCA9IGNhbGxiYWNrSWQ7XG4gICAgICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgICAgICB0aGlzLnN1ZmZpeCA9IHN1ZmZpeDtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCkge1xuICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGNoaWxkLnRhZ05hbWUgPT0gXCJTQ1JJUFRcIiAmJiBjaGlsZC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpID09PSBzY3JpcHRUeXBlU2lnbmlmaWVyKSB7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZVR5cGUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIGNvbnN0IGlkID0gY2hpbGQuaWQ7XG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aXZlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkFwcGx5SnM6XG4gICAgICAgICAgICAgICAgY29uc3QgcnVuT3B0aW9uID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNSdW5PcHRpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5BcHBseUpzU2NyaXB0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFwcGx5SnMoc2NyaXB0LCBydW5PcHRpb24gPT09IFwiMVwiKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRTdGFydDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudFN0YXJ0KGlkLnN1YnN0cihjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRFbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRFbmQoaWQuc3Vic3RyKDUsIGlkLmxlbmd0aCAtIGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCAtIGNvbXBvbmVudElkRW5kU3VmZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkNvbXBvbmVudEtlZXA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBLZWVwKGlkLnN1YnN0cihjb21wb25lbnRJZFByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGU6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuRXZlbnRIYW5kbGVyOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gK2NoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudENhbGxiYWNrSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFByZWZpeCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VmZml4ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50U3VmZml4KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudEhhbmRsZXIobmFtZSwgaWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRBbGxEaXJlY3RpdmVzKGJhc2UpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChiYXNlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVTY3JpcHRUYXJnZXQoc2NyaXB0KSB7XG4gICAgaWYgKHNjcmlwdC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZSkpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IHNjcmlwdDtcbiAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmxldCBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xubGV0IHJlbW92ZWREaXJlY3RpdmVzID0gW107XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdEaXJlY3RpdmVzKGNiKSB7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFuZ2VkIG9mIGNoYW5nZWREaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICAgICAgb25BZGRlZE9yVXBkYXRlZChjaGFuZ2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IHJlbW92ZWQgb2YgcmVtb3ZlZERpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgICAgICBvblJlbW92ZWQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcyA9IFtdO1xuICAgICAgICAgICAgcmVtb3ZlZERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyoqXG4gKiBDaGVja3MgYW4gZWxlbWVudCBhbmQgYWxsIGl0cyBjaGlsZHJlbiB0aGF0IGhhdmUganVzdCBiZWVuIGFkZGVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZUFkZChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENoZWNrcyBhbmQgcmVjb3JkcyB3aGV0aGVyIGFuIGVsZW1lbnQgdGhhdCBjaGFuZ2VkIGlzIGEgc2NyaXB0IGRpcmVjdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVDaGFuZ2UoZWxlbWVudCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWxlbWVudCk7XG4gICAgaWYgKGRpcmVjdGl2ZSkge1xuICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50IH0pO1xuICAgIH1cbn1cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiByZW1vdmVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZVJlbW92ZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBmb3IgKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmIChzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcy5wdXNoKHsgZGlyZWN0aXZlLCBlbGVtZW50OiBzY3JpcHQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIENhbGxlZCBhZnRlciB0aGUgZGlyZWN0aXZlIGNvbnRhaW5lZCBpbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KGluZm8uZWxlbWVudCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICAgICAgY29uc3QgYWRkSW5mbyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgaW5mbyksIHsgdGFyZ2V0IH0pO1xuICAgICAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGFkZEluZm8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpIHtcbiAgICAgICAgICAgIHJ1bkVsZW1lbnRTY3JpcHQoZGlyZWN0aXZlLCBhZGRJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldHVwRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgYWRkSW5mbyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdGFyZ2V0IGZvciAke2luZm8uZWxlbWVudC5vdXRlckhUTUx9YCk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25SZW1vdmVkKGluZm8pIHtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICBpZiAoZGlyZWN0aXZlIGluc3RhbmNlb2YgU2V0QXR0cmlidXRlKSB7XG4gICAgICAgIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoaW5mby5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEV2ZW50SGFuZGxlcikge1xuICAgICAgICByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZXJyb3JEaXNwbGF5KGNvbnRlbnQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgKyBcIjwvcD48L2Rpdj48L2Rpdj48L2Rpdj5cIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaGFkZUNsb3NlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKTtcbiAgICAgICAgbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG0pO1xuICAgIH0pO1xufVxuIiwiaW1wb3J0IHsgc2VuZElmRXJyb3IsIHNlbmRNZXNzYWdlIH0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQgeyByZWNvbmNpbGUgfSBmcm9tIFwiLi9yZWNvbmNpbGVcIjtcbmltcG9ydCB7IHVwZGF0ZUJvdW5kSW5wdXQgfSBmcm9tIFwiLi9ib3VuZFwiO1xuaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlU2NyaXB0KHRhZywgc2NvcGUsIHNjcmlwdCkge1xuICAgIHRyeSB7XG4gICAgICAgIHNjb3BlKHNjcmlwdCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHNlbmRJZkVycm9yKGUsIHRhZywgc2NyaXB0LnN1YnN0cmluZygwLCAyNTYpKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbWFrZUV2YWxTY29wZShzY29wZSkge1xuICAgIGNvbnN0IGZpbmFsID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBiYXNlU2NvcGUpLCBzY29wZSk7XG4gICAgY29uc3QgYmFzZSA9IFtdO1xuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhmaW5hbCkpIHtcbiAgICAgICAgYmFzZS5wdXNoKGB2YXIgJHtrZXl9PWZpbmFsLiR7a2V5fTtgKTtcbiAgICB9XG4gICAgY29uc3QgYmFzZVNjcmlwdCA9IGJhc2Uuam9pbihcIlxcblwiKSArIFwiXFxuXCI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgICAgZXZhbChcIihmdW5jdGlvbigpe1xcblwiICsgYmFzZVNjcmlwdCArIHNjcmlwdCArIFwiXFxufSkoKVwiKTtcbiAgICB9LmJpbmQoe30pO1xufVxuZXhwb3J0IGNvbnN0IGJhc2VTY29wZSA9IHtcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5yZWNvbmNpbGVdOiByZWNvbmNpbGUsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMudXBkYXRlQm91bmRJbnB1dF06IHVwZGF0ZUJvdW5kSW5wdXQsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZE1lc3NhZ2VdOiBzZW5kTWVzc2FnZSxcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5zZW5kSWZFcnJvcl06IHNlbmRJZkVycm9yXG59O1xuIiwiaW1wb3J0IHsgU29ja2V0U2NvcGVOYW1lcyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGUgfSBmcm9tIFwiLi9ldmFsXCI7XG5jb25zdCBldmVudFByZXZpb3VzID0gU3ltYm9sKCk7XG5leHBvcnQgZnVuY3Rpb24gc2V0dXBFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpO1xuICAgIGNvbnN0IHByZWZpeCA9IGRpcmVjdGl2ZS5wcmVmaXggPyBgJHtkaXJlY3RpdmUucHJlZml4fTtcXG5gIDogXCJcIjtcbiAgICBjb25zdCBkYXRhID0gZGlyZWN0aXZlLmRhdGEgPyBgLEpTT04uc3RyaW5naWZ5KCR7ZGlyZWN0aXZlLmRhdGF9KWAgOiBcIlwiO1xuICAgIGNvbnN0IHN1ZmZpeCA9IGRpcmVjdGl2ZS5zdWZmaXggPyBgO1xcbiR7ZGlyZWN0aXZlLnN1ZmZpeH1gIDogXCJcIjtcbiAgICBjb25zdCBzY3JpcHQgPSBgJHtwcmVmaXh9JHtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlfSgke2RpcmVjdGl2ZS5jYWxsYmFja0lkfSR7ZGF0YX0pJHtzdWZmaXh9YDtcbiAgICBjb25zdCBsaXN0ZW5lciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBldmVudDogZSxcbiAgICAgICAgICAgIGU6IGUsXG4gICAgICAgICAgICBpdDogZS50YXJnZXRcbiAgICAgICAgfSk7XG4gICAgICAgIGV2YWx1YXRlU2NyaXB0KHVuZGVmaW5lZCwgc2NvcGUsIHNjcmlwdCk7XG4gICAgfTtcbiAgICBpbmZvLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGRpcmVjdGl2ZS5ldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICBpbmZvLmVsZW1lbnRbZXZlbnRQcmV2aW91c10gPSB7XG4gICAgICAgIGV2ZW50TmFtZTogZGlyZWN0aXZlLmV2ZW50TmFtZSxcbiAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKSB7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpO1xufVxuZnVuY3Rpb24gcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChlbGVtZW50KSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSBlbGVtZW50W2V2ZW50UHJldmlvdXNdO1xuICAgIGlmIChwcmV2aW91cykge1xuICAgICAgICBwcmV2aW91cy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihwcmV2aW91cy5ldmVudE5hbWUsIHByZXZpb3VzLmxpc3RlbmVyKTtcbiAgICB9XG59XG4iLCIvL1JlY29uY2lsZSBhIHRhcmdldElkIHdpdGggSFRNTFxuaW1wb3J0IHsgYXNTaGFkZURpcmVjdGl2ZSwgY2hhbmdpbmdEaXJlY3RpdmVzLCBjaGVja0RpcmVjdGl2ZUFkZCwgY2hlY2tEaXJlY3RpdmVDaGFuZ2UsIGNoZWNrRGlyZWN0aXZlUmVtb3ZlLCBDb21wb25lbnRFbmQsIENvbXBvbmVudFN0YXJ0LCBLZWVwLCB9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZU5hbWVzLCBjb21wb25lbnRJZFByZWZpeCB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmV4cG9ydCBmdW5jdGlvbiByZWNvbmNpbGUodGFyZ2V0SWQsIGh0bWwpIHtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb21wb25lbnRJZFByZWZpeCArIHRhcmdldElkKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgY29uc3QgaHRtbERvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocGFyZW50LnRhZ05hbWUpO1xuICAgICAgICBodG1sRG9tLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuICAgICAgICB3aGlsZSAoY3VycmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjdXJyZW50KTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50RW5kICYmIGN1cnJlbnREaXJlY3RpdmUuaWQgPT0gXCJcIiArIHRhcmdldElkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmNsdWRlZC5wdXNoKGN1cnJlbnQpO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcGF0Y2hDaGlsZHJlbihwYXJlbnQsIHRhcmdldCwgaW5jbHVkZWQsIGh0bWxEb20uY2hpbGROb2Rlcyk7XG4gICAgfSk7XG59XG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0RGlyZWN0aXZlLCBzdGFydCwgY2hpbGRyZW4sIGVuZCkge1xuICAgICAgICB0aGlzLnN0YXJ0RGlyZWN0aXZlID0gc3RhcnREaXJlY3RpdmU7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG4gICAgYXNOb2RlcygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLnN0YXJ0LCAuLi50aGlzLmNoaWxkcmVuLCB0aGlzLmVuZF07XG4gICAgfVxuICAgIGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydERpcmVjdGl2ZS5pZDtcbiAgICB9XG59XG5mdW5jdGlvbiBhc05vZGVzKHRhcmdldCkge1xuICAgIHJldHVybiB0YXJnZXQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyB0YXJnZXQuYXNOb2RlcygpIDogW3RhcmdldF07XG59XG5mdW5jdGlvbiByZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpIHtcbiAgICBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBuZXdlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmIChvcmlnaW5hbC50YWdOYW1lICE9IG5ld2VyLnRhZ05hbWUpIHtcbiAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5ld2VyKTtcbiAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIHJldHVybiBuZXdlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yaWdpbmFsLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBvcmlnaW5hbC5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdlci5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbmV3ZXIuYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZGVyQXR0ciA9IG9yaWdpbmFsLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld2VyQXR0ciA9IG5ld2VyLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIGlmIChvbGRlckF0dHIgIT0gbmV3ZXJBdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIG5ld2VyQXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2Uob3JpZ2luYWwpO1xuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUNoYW5nZShvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKG9yaWdpbmFsLCBudWxsLCBvcmlnaW5hbC5jaGlsZE5vZGVzLCBuZXdlci5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4oZG9tLCBhcHBlbmRTdGFydCwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pIHtcbiAgICBjb25zdCBmaW5hbCA9IHJlY29uY2lsZUNoaWxkcmVuKGRvbSwgZG9tQ2hpbGRyZW4sIHJlcGxhY2VtZW50Q2hpbGRyZW4pO1xuICAgIGxldCBlbmRPZlBhdGNoUmFuZ2U7XG4gICAgaWYgKGRvbUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gZG9tQ2hpbGRyZW5bZG9tQ2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFwcGVuZFN0YXJ0KSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGFwcGVuZFN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gbnVsbDtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnQgPSBhcHBlbmRTdGFydCA/IGFwcGVuZFN0YXJ0IDogXCJzdGFydFwiO1xuICAgIGZ1bmN0aW9uIGFmdGVyQ3VycmVudCgpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQgPT0gXCJzdGFydFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9tLmZpcnN0Q2hpbGQgPyBkb20uZmlyc3RDaGlsZCA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3VycmVudCA9PSBcImVuZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJlbmRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Lm5leHRTaWJsaW5nID8gY3VycmVudC5uZXh0U2libGluZyA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBmaW5hbCkge1xuICAgICAgICBsZXQgbmV4dCA9IGFmdGVyQ3VycmVudCgpO1xuICAgICAgICBpZiAobmV4dCAhPT0gY2hpbGQpIHtcbiAgICAgICAgICAgIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQgPT09IFwiZW5kXCIgPyBudWxsIDogbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGNoaWxkO1xuICAgIH1cbiAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgd2hpbGUgKGN1cnJlbnQgIT0gXCJlbmRcIiAmJiBjdXJyZW50ICE9IGVuZE9mUGF0Y2hSYW5nZSkge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGN1cnJlbnQ7XG4gICAgICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICAgICAgZG9tLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZWNvbmNpbGVDaGlsZHJlbihkb20sIGRvbUNoaWxkcmVuLCByZXBsYWNlbWVudENoaWxkcmVuKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihkb21DaGlsZHJlbik7XG4gICAgY29uc3QgcmVwbGFjZW1lbnRzID0gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihyZXBsYWNlbWVudENoaWxkcmVuKTtcbiAgICBjb25zdCBvcmlnaW5hbEtleXMgPSBjb2xsZWN0S2V5c01hcChvcmlnaW5hbHMpO1xuICAgIGxldCBvcmlnaW5hbEluZGV4ID0gMDtcbiAgICBsZXQgcmVwbGFjZW1lbnRJbmRleCA9IDA7XG4gICAgY29uc3QgZmluYWxDaGlsZHJlbiA9IFtdO1xuICAgIGNvbnN0IGtleVVzZWQgPSBuZXcgU2V0KCk7XG4gICAgd2hpbGUgKG9yaWdpbmFsSW5kZXggPCBvcmlnaW5hbHMubGVuZ3RoIHx8IHJlcGxhY2VtZW50SW5kZXggPCByZXBsYWNlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBvcmlnaW5hbCA9IG9yaWdpbmFsc1tvcmlnaW5hbEluZGV4XTtcbiAgICAgICAgY29uc3QgbmV3ZXIgPSByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRJbmRleF07XG4gICAgICAgIC8vU2tpcCBhbnkga2V5ZWQgb3JpZ2luYWxzOyB0aGV5IHdpbGwgYmUgbG9va2VkIHVwIGJ5IGtleVxuICAgICAgICBpZiAob3JpZ2luYWwgJiYgZ2V0S2V5KG9yaWdpbmFsKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3JpZ2luYWwgJiYgIW5ld2VyKSB7XG4gICAgICAgICAgICAvKiBJbXBsaWNpdCByZW1vdmUgKi9cbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpIHtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld2VyS2V5ID0gZ2V0S2V5KG5ld2VyKTtcbiAgICAgICAgICAgIGlmIChuZXdlcktleSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAga2V5VXNlZC5hZGQobmV3ZXJLZXkpO1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gb3JpZ2luYWxLZXlzW25ld2VyS2V5XTtcbiAgICAgICAgICAgICAgICAvL1dlJ2xsIG1hdGNoIHRoaXMgdW5rZXllZCBvcmlnaW5hbCBhZ2FpbiBvbiBzb21ldGhpbmcgd2l0aG91dCBhIGtleVxuICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBhZGQgPSBbXTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVzZU5ld2VyKCkge1xuICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMobmV3ZXIpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXdlckRpcmVjdGl2ZSA9IG5ld2VyIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gbnVsbCA6IGFzU2hhZGVEaXJlY3RpdmUobmV3ZXIpO1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsICYmIG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCAmJiBuZXdlckRpcmVjdGl2ZS5pZCA9PSBvcmlnaW5hbC5pZCgpKSB7XG4gICAgICAgICAgICAgICAgYWRkID0gYXNOb2RlcyhvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9yaWdpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3ZXIgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCAmJiBvcmlnaW5hbC5pZCgpID09IG5ld2VyLmlkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZWNvbmNpbGVDaGlsZHJlbihkb20sIG9yaWdpbmFsLmNoaWxkcmVuLCBuZXdlci5jaGlsZHJlbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLmVuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkID0gW3JlY29uY2lsZU5vZGVzKG9yaWdpbmFsLCBuZXdlcildO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxDaGlsZHJlbi5wdXNoKC4uLmFkZCk7XG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxLZXlzKSkge1xuICAgICAgICBpZiAoIWtleVVzZWQuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0gb3JpZ2luYWxLZXlzW2tleV07XG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIGFzTm9kZXMob3JpZ2luYWwpKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpbmFsQ2hpbGRyZW47XG59XG5mdW5jdGlvbiBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKGxpc3QpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBsaXN0W2ldO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGNoaWxkKTtcbiAgICAgICAgbGV0IGVuZCA9IG51bGw7XG4gICAgICAgIGlmIChkaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRTdGFydCkge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gW107XG4gICAgICAgICAgICB3aGlsZSAoaSA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViQ2hpbGQgPSBsaXN0W2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKHN1YkNoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRBc0RpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjaGlsZEFzRGlyZWN0aXZlLmlkID09IGRpcmVjdGl2ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzdWJDaGlsZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQucHVzaChzdWJDaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiTWlzc2luZyBlbmQgdGFnIGZvciBjb21wb25lbnQgXCIgKyBkaXJlY3RpdmUuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IENvbXBvbmVudChkaXJlY3RpdmUsIGNoaWxkLCBjb21wb25lbnQsIGVuZCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb2xsZWN0S2V5c01hcChjaGlsZExpc3QpIHtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZExpc3RbaV07XG4gICAgICAgIGNvbnN0IGtleSA9IGdldEtleShjaGlsZCk7XG4gICAgICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAga2V5c1trZXldID0gY2hpbGQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5mdW5jdGlvbiBnZXRLZXkoY2hpbGQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBjaGlsZCBpbnN0YW5jZW9mIENvbXBvbmVudCA/IGNoaWxkLnN0YXJ0IDogY2hpbGQ7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuS2V5KTtcbiAgICAgICAgaWYgKGtleSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IHsgY29ubmVjdFNvY2tldCwgc2VuZElmRXJyb3IgfSBmcm9tIFwiLi9zb2NrZXRcIjtcbmltcG9ydCB7IGVycm9yRGlzcGxheSB9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHsgd2hlbkRvY3VtZW50UmVhZHkgfSBmcm9tIFwiLi91dGlsaXR5XCI7XG5pbXBvcnQgeyBhZGRBbGxEaXJlY3RpdmVzIH0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaWYgKCF3aW5kb3cuc2hhZGUpIHtcbiAgICB3aW5kb3cuc2hhZGUgPSB7fTtcbiAgICBpZiAoIXdpbmRvdy5XZWJTb2NrZXQpIHtcbiAgICAgICAgZXJyb3JEaXNwbGF5KFwiWW91ciB3ZWIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhpcyBwYWdlLCBhbmQgaXQgbWF5IG5vdCBmdW5jdGlvbiBjb3JyZWN0bHkgYXMgYSByZXN1bHQuIFVwZ3JhZGUgeW91ciB3ZWIgYnJvd3Nlci5cIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25uZWN0U29ja2V0KCk7XG4gICAgICAgIHdoZW5Eb2N1bWVudFJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFkZEFsbERpcmVjdGl2ZXMoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VuZElmRXJyb3IoZXZlbnQuZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgc2VuZElmRXJyb3IoZXZlbnQucmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgZXJyb3JEaXNwbGF5IH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgeyBldmFsdWF0ZVNjcmlwdCwgbWFrZUV2YWxTY29wZSB9IGZyb20gXCIuL2V2YWxcIjtcbmltcG9ydCB7IG1lc3NhZ2VUYWdFcnJvclByZWZpeCwgbWVzc2FnZVRhZ1NlcGFyYXRvciB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgd2hlbkRvY3VtZW50UmVhZHkgfSBmcm9tIFwiLi91dGlsaXR5XCI7XG5sZXQgc29ja2V0UmVhZHkgPSBmYWxzZTtcbmNvbnN0IHNvY2tldFJlYWR5UXVldWUgPSBbXTtcbmxldCBzb2NrZXQ7XG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdFNvY2tldCgpIHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHdpbmRvdy5zaGFkZUVuZHBvaW50LCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgaWYgKHdpbmRvdy5zaGFkZUhvc3QpIHtcbiAgICAgICAgdXJsLmhvc3QgPSB3aW5kb3cuc2hhZGVIb3N0O1xuICAgIH1cbiAgICB1cmwucHJvdG9jb2wgPSAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gXCJ3c3M6Ly9cIiA6IFwid3M6Ly9cIik7XG4gICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwuaHJlZik7XG4gICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgaWQgPSB3aW5kb3cuc2hhZGVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWQgd2l0aCBJRCBcIiArIGlkKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIHNvY2tldC5zZW5kKGlkKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoc29ja2V0UmVhZHlRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZW5kTWVzc2FnZShzb2NrZXRSZWFkeVF1ZXVlLnNoaWZ0KCksIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhO1xuICAgICAgICBjb25zdCBzcGxpdEluZGV4ID0gZGF0YS5pbmRleE9mKG1lc3NhZ2VUYWdTZXBhcmF0b3IpO1xuICAgICAgICBjb25zdCB0YWcgPSBkYXRhLnN1YnN0cmluZygwLCBzcGxpdEluZGV4KTtcbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZGF0YS5zdWJzdHJpbmcoc3BsaXRJbmRleCArIDEsIGRhdGEubGVuZ3RoKTtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHt9KTtcbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZhbHVhdGVTY3JpcHQodGFnLCBzY29wZSwgc2NyaXB0KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBsZXQgZXJyb3JUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICBmdW5jdGlvbiBlcnJvclJlbG9hZCgpIHtcbiAgICAgICAgaWYgKGVycm9yVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3JUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsYXN0UmVsb2FkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIGlmIChsYXN0UmVsb2FkKSB7XG4gICAgICAgICAgICBlcnJvckRpc3BsYXkoXCJUaGlzIHdlYiBwYWdlIGNvdWxkIG5vdCBjb25uZWN0IHRvIGl0cyBzZXJ2ZXIuIFBsZWFzZSByZWxvYWQgb3IgdHJ5IGFnYWluIGxhdGVyLlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hhZGVfbGFzdF9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dC5yZWFzb259LCAke2V2dC53YXNDbGVhbn1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKGV2dC53YXNDbGVhbikge1xuICAgICAgICAgICAgLy9jb25uZWN0U29ja2V0KClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgU29ja2V0IGNsb3NlZDogJHtldnR9YCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gZmFsc2U7XG4gICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgfTtcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoXCJcIik7XG4gICAgICAgIH1cbiAgICB9LCA2MCAqIDEwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRNZXNzYWdlKGlkLCBtc2cpIHtcbiAgICBjb25zdCBmaW5hbE1zZyA9IChtc2cgIT09IHVuZGVmaW5lZCAmJiBtc2cgIT09IG51bGwpID8gaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yICsgbXNnIDogaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yO1xuICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICBzb2NrZXQuc2VuZChmaW5hbE1zZyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzb2NrZXRSZWFkeVF1ZXVlLnB1c2goZmluYWxNc2cpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZW5kSWZFcnJvcihlcnJvciwgdGFnLCBldmFsVGV4dCkge1xuICAgIGNvbnN0IGRhdGEgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8ge1xuICAgICAgICBuYW1lOiBlcnJvci5uYW1lLFxuICAgICAgICBqc01lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfSA6IHtcbiAgICAgICAgbmFtZTogXCJVbmtub3duXCIsXG4gICAgICAgIGpzTWVzc2FnZTogXCJVbmtub3duIGVycm9yOiBcIiArIGVycm9yLFxuICAgICAgICBzdGFjazogXCJcIixcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfTtcbiAgICBzb2NrZXQuc2VuZChgJHttZXNzYWdlVGFnRXJyb3JQcmVmaXh9JHt0YWcgPT0gdW5kZWZpbmVkID8gXCJcIiA6IHRhZ30ke21lc3NhZ2VUYWdTZXBhcmF0b3J9YCArIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yQWxsUGx1c1RhcmdldCh0YXJnZXQsIHNlbGVjdG9yKSB7XG4gICAgY29uc3QgYmVsb3cgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgaWYgKHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gW3RhcmdldCwgLi4uYmVsb3ddO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYmVsb3cpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiB3aGVuRG9jdW1lbnRSZWFkeShmbikge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJpbnRlcmFjdGl2ZVwiKSB7XG4gICAgICAgIGZuKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmbik7XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==