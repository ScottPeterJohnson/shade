var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
(function() {
  "use strict";
  function errorDisplay(content) {
    const container = document.createElement("div");
    container.innerHTML = "<div id='shadeModal' style='position: fixed;z-index: 999999999;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgba(0,0,0,0.4);'><div style='background-color: #fff;margin: 15% auto;padding: 20px;border: 1px solid #888;width: 80%;'><span id='shadeClose' style='float: right;font-size: 28px;font-weight: bold;cursor: pointer;'>&times;</span><p>" + content + "</p></div></div></div>";
    document.body.appendChild(container);
    document.getElementById("shadeClose").addEventListener("click", function() {
      const m = document.getElementById("shadeModal");
      m.parentNode.removeChild(m);
    });
  }
  var DirectiveType = /* @__PURE__ */ ((DirectiveType2) => {
    DirectiveType2["ApplyJs"] = "j";
    DirectiveType2["SetAttribute"] = "a";
    DirectiveType2["EventHandler"] = "e";
    DirectiveType2["ComponentStart"] = "s";
    DirectiveType2["ComponentEnd"] = "f";
    DirectiveType2["ComponentKeep"] = "k";
    return DirectiveType2;
  })(DirectiveType || {});
  var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
    AttributeNames2["DirectiveType"] = "data-s";
    AttributeNames2["TargetSiblingDirective"] = "data-f";
    AttributeNames2["ApplyJsScript"] = "data-t";
    AttributeNames2["ApplyJsRunOption"] = "data-r";
    AttributeNames2["SetAttributeName"] = "data-a";
    AttributeNames2["SetAttributeValue"] = "data-v";
    AttributeNames2["Key"] = "data-k";
    AttributeNames2["EventName"] = "data-e";
    AttributeNames2["EventCallbackId"] = "data-i";
    AttributeNames2["EventPrefix"] = "data-p";
    AttributeNames2["EventSuffix"] = "data-x";
    AttributeNames2["EventData"] = "data-d";
    AttributeNames2["Bound"] = "data-b";
    AttributeNames2["Checkbox"] = "data-c";
    return AttributeNames2;
  })(AttributeNames || {});
  const scriptTypeSignifier = "shade";
  const componentIdPrefix = "shade";
  const componentIdEndSuffix = "e";
  const messageTagSeparator = "|";
  const messageTagErrorPrefix = "E";
  var SocketScopeNames = /* @__PURE__ */ ((SocketScopeNames2) => {
    SocketScopeNames2["reconcile"] = "r";
    SocketScopeNames2["updateBoundInput"] = "b";
    SocketScopeNames2["sendMessage"] = "s";
    SocketScopeNames2["sendIfError"] = "q";
    return SocketScopeNames2;
  })(SocketScopeNames || {});
  function querySelectorAllPlusTarget(target, selector) {
    const below = target.querySelectorAll(selector);
    if (target.matches(selector)) {
      return [target, ...below];
    } else {
      return Array.from(below);
    }
  }
  function whenDocumentReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }
  let suppressEventFiring = { suppress: false };
  const eventPrevious = Symbol();
  function setupEventHandler(directive, info) {
    removePreviouslyInstalled(info.element);
    const prefix = directive.prefix ? `${directive.prefix};
` : "";
    const data = directive.data ? `,JSON.stringify(${directive.data})` : "";
    const suffix = directive.suffix ? `;
${directive.suffix}` : "";
    const script = `${prefix}${SocketScopeNames.sendMessage}(${directive.callbackId}${data})${suffix}`;
    const listener = function(e) {
      if (suppressEventFiring.suppress) {
        return;
      }
      const scope = makeEvalScope({
        event: e,
        e,
        it: e.target
      });
      evaluateScript(void 0, scope, script);
    };
    info.target.addEventListener(directive.eventName, listener);
    info.element[eventPrevious] = {
      eventName: directive.eventName,
      listener,
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
  const isSetAttributeDirective = `[${AttributeNames.DirectiveType}=${DirectiveType.SetAttribute}]`;
  const baseQueryIsSetAttributeDirective = `script[type=${scriptTypeSignifier}]${isSetAttributeDirective}`;
  function updateAttributeDirectives(target) {
    const applicable = Array.from(target.querySelectorAll(baseQueryIsSetAttributeDirective));
    let current = target;
    while (true) {
      current = current.nextElementSibling;
      if (!current || !current.matches(`script[type=${scriptTypeSignifier}][${AttributeNames.TargetSiblingDirective}]`)) {
        break;
      }
      applicable.push(current);
    }
    const byAttributeName = {};
    for (let el of applicable) {
      const asDirective = asShadeDirective(el);
      if (asDirective && asDirective instanceof SetAttribute) {
        let array = byAttributeName[asDirective.name];
        if (!array) {
          array = byAttributeName[asDirective.name] = [];
        }
        array.push(asDirective);
      }
    }
    for (let attribute of Object.getOwnPropertyNames(byAttributeName)) {
      const directives = byAttributeName[attribute];
      const last = directives[directives.length - 1];
      noteOriginalAttribute(target, last.name);
      applyAttributeValue(target, last.name, last.value);
    }
    const originals = target[attributeOriginalValues] || {};
    for (let original of Object.getOwnPropertyNames(originals)) {
      if (!byAttributeName[original]) {
        applyAttributeValue(target, original, originals[original]);
        delete originals[original];
      }
    }
  }
  let targetsWithChangedAttributeDirectives = /* @__PURE__ */ new Set();
  function changingAttributeDirectives(cb) {
    try {
      cb();
    } finally {
      for (let target of targetsWithChangedAttributeDirectives) {
        updateAttributeDirectives(target);
      }
      targetsWithChangedAttributeDirectives = /* @__PURE__ */ new Set();
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
    } else {
      target.setAttribute(name, value);
    }
    if (target instanceof HTMLInputElement && (name == "value" || name == "checked")) {
      if (name == "value" && target.value != value) {
        suppressChangeListeners(target, () => {
          target.value = value != null ? value : "";
        });
      } else if (name == "checked" && target.checked != (value != null)) {
        suppressChangeListeners(target, () => {
          target.checked = value != null;
        });
      }
    }
    if (target instanceof HTMLOptionElement && name == "selected" && target.selected != (value != null)) {
      target.selected = value != null;
    }
  }
  function suppressChangeListeners(target, cb) {
    suppressEventFiring.suppress = true;
    const oldOnChange = target.onchange;
    target.onchange = null;
    try {
      cb();
    } finally {
      target.onchange = oldOnChange;
      suppressEventFiring.suppress = false;
    }
  }
  const scriptPrevious = Symbol();
  function runElementScript(directive, info) {
    const old = info.element[scriptPrevious];
    if (!directive.onlyOnCreate || !old || old.js != directive.js || old.target != info.target) {
      info.element[scriptPrevious] = {
        js: directive.js,
        target: info.target
      };
      const it = info.target;
      const scope = makeEvalScope({
        it
      });
      evaluateScript(void 0, scope, directive.js);
    }
  }
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
    if (child instanceof HTMLElement && child.tagName == "SCRIPT" && child.getAttribute("type") === scriptTypeSignifier) {
      const directiveType = child.getAttribute(AttributeNames.DirectiveType);
      const id = child.id;
      switch (directiveType) {
        case DirectiveType.ApplyJs:
          const runOption = child.getAttribute(AttributeNames.ApplyJsRunOption);
          const script = child.getAttribute(AttributeNames.ApplyJsScript);
          return new ApplyJs(script, runOption === "1");
        case DirectiveType.ComponentStart:
          return new ComponentStart(id.substring(componentIdPrefix.length));
        case DirectiveType.ComponentEnd:
          return new ComponentEnd(id.substring(componentIdPrefix.length, id.length - componentIdEndSuffix.length));
        case DirectiveType.ComponentKeep:
          return new Keep(id.substring(componentIdPrefix.length));
        case DirectiveType.SetAttribute: {
          const name = child.getAttribute(AttributeNames.SetAttributeName);
          const value = child.getAttribute(AttributeNames.SetAttributeValue);
          return new SetAttribute(name, value);
        }
        case DirectiveType.EventHandler: {
          const name = child.getAttribute(AttributeNames.EventName);
          const id2 = +child.getAttribute(AttributeNames.EventCallbackId);
          const prefix = child.getAttribute(AttributeNames.EventPrefix);
          const suffix = child.getAttribute(AttributeNames.EventSuffix);
          const data = child.getAttribute(AttributeNames.EventData);
          return new EventHandler(name, id2, prefix, suffix, data);
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
    if (script.hasAttribute(AttributeNames.TargetSiblingDirective)) {
      let target = script;
      while (target && target.hasAttribute(AttributeNames.TargetSiblingDirective)) {
        target = target.previousElementSibling;
      }
      return target;
    } else {
      return script.parentElement;
    }
  }
  let changedDirectives = [];
  let removedDirectives = [];
  function changingDirectives(cb) {
    changingAttributeDirectives(() => {
      try {
        cb();
      } finally {
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
  function checkDirectiveAdd(element) {
    if (element instanceof HTMLElement) {
      for (let script of querySelectorAllPlusTarget(element, `script[type=${scriptTypeSignifier}]`)) {
        const directive = asShadeDirective(script);
        if (script instanceof HTMLElement && directive) {
          changedDirectives.push({ directive, element: script });
        }
      }
    }
  }
  function checkDirectiveChange(element) {
    const directive = asShadeDirective(element);
    if (directive) {
      changedDirectives.push({ directive, element });
    }
  }
  function checkDirectiveRemove(element) {
    if (element instanceof HTMLElement) {
      for (let script of querySelectorAllPlusTarget(element, `script[type=${scriptTypeSignifier}]`)) {
        const directive = asShadeDirective(script);
        if (script instanceof HTMLElement && directive) {
          removedDirectives.push({ directive, element: script });
        }
      }
    }
  }
  function onAddedOrUpdated(info) {
    const target = determineScriptTarget(info.element);
    if (target) {
      const directive = info.directive;
      const addInfo = __spreadProps(__spreadValues({}, info), { target });
      if (directive instanceof SetAttribute) {
        noteAttributeDirectiveChange(addInfo);
      } else if (directive instanceof ApplyJs) {
        runElementScript(directive, addInfo);
      } else if (directive instanceof EventHandler) {
        setupEventHandler(directive, addInfo);
      }
    } else {
      console.error(`Unknown target for ${info.element.outerHTML}`);
    }
  }
  function onRemoved(info) {
    const directive = info.directive;
    if (directive instanceof SetAttribute) {
      noteAttributeDirectiveRemove(info.element);
    }
    if (directive instanceof EventHandler) {
      removeEventHandler(directive, info);
    }
  }
  function reconcile(targetId, html) {
    changingDirectives(() => {
      const target = document.getElementById(componentIdPrefix + targetId);
      if (!target) {
        return;
      }
      const parent = target.parentElement;
      const htmlDom = document.createElement(parent.tagName);
      htmlDom.innerHTML = html;
      const included = [];
      let current = target.nextSibling;
      while (current != null) {
        const currentDirective = asShadeDirective(current);
        if (currentDirective instanceof ComponentEnd && currentDirective.id == "" + targetId) {
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
        checkDirectiveAdd(newer);
        checkDirectiveRemove(original);
        return newer;
      } else {
        let changed = false;
        for (const attribute of original.getAttributeNames()) {
          if (!newer.hasAttribute(attribute)) {
            applyAttributeValue(original, attribute, null);
            changed = true;
          }
        }
        for (let i = 0; i < newer.attributes.length; i++) {
          const attribute = newer.attributes[i].name;
          const olderAttr = original.getAttribute(attribute);
          const newerAttr = newer.getAttribute(attribute);
          if (olderAttr != newerAttr) {
            applyAttributeValue(original, attribute, newerAttr);
            changed = true;
          }
        }
        if (changed) {
          onAttributesSetFromSource(original);
          checkDirectiveChange(original);
        }
        patchChildren(original, null, original.childNodes, newer.childNodes);
        return original;
      }
    } else if (original instanceof Text && newer instanceof Text) {
      if (original.textContent == newer.textContent) {
        return original;
      } else {
        return newer;
      }
    } else {
      return newer;
    }
  }
  function patchChildren(dom, appendStart, domChildren, replacementChildren) {
    const final = reconcileChildren(dom, domChildren, replacementChildren);
    let endOfPatchRange;
    if (domChildren.length > 0) {
      endOfPatchRange = domChildren[domChildren.length - 1].nextSibling;
    } else if (appendStart) {
      endOfPatchRange = appendStart.nextSibling;
    } else {
      endOfPatchRange = null;
    }
    let current = appendStart ? appendStart : "start";
    function afterCurrent() {
      if (current == "start") {
        return dom.firstChild ? dom.firstChild : "end";
      } else if (current == "end") {
        return "end";
      } else {
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
        for (let node of asNodes(original)) {
          checkDirectiveRemove(node);
        }
        originalIndex += 1;
      } else if (original instanceof Text) {
        originalIndex += 1;
      } else if (newer instanceof Text) {
        finalChildren.push(newer);
        replacementIndex += 1;
      } else {
        let useNewer = function() {
          add = asNodes(newer);
          for (let node of add) {
            checkDirectiveAdd(node);
          }
          if (original) {
            for (let node of asNodes(original)) {
              checkDirectiveRemove(node);
            }
          }
        };
        const newerDirective = newer instanceof Component ? null : asShadeDirective(newer);
        const originalIsDirective = original instanceof Node && asShadeDirective(original) != null;
        if (newer instanceof Node && newerDirective != null && !(newerDirective instanceof Keep)) {
          if (originalIsDirective) {
            finalChildren.push(reconcileNodes(original, newer));
            originalIndex += 1;
          } else {
            finalChildren.push(newer);
            checkDirectiveAdd(newer);
          }
          replacementIndex += 1;
          continue;
        } else if (originalIsDirective) {
          checkDirectiveRemove(original);
          originalIndex += 1;
          continue;
        }
        const newerKey = getKey(newer);
        if (newerKey != null) {
          original = (_a = originalKeys[newerKey]) == null ? void 0 : _a.pop();
        } else if (original && getKey(original) != null) {
          original = void 0;
        }
        let add = [];
        if (original && original instanceof Component && newerDirective instanceof Keep && (newerDirective.id == original.id() || newerKey)) {
          add = asNodes(original);
        } else {
          if (!original) {
            useNewer();
          } else {
            if (newer instanceof Component) {
              if (original instanceof Component && original.id() == newer.id()) {
                add = [
                  original.start,
                  ...reconcileChildren(dom, original.children, newer.children),
                  original.end
                ];
              } else {
                useNewer();
              }
            } else if (original instanceof Component) {
              useNewer();
            } else {
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
      const originals2 = originalKeys[key];
      for (let original of originals2) {
        for (let node of asNodes(original)) {
          checkDirectiveRemove(node);
        }
      }
    }
    return finalChildren;
  }
  function collapseComponentChildren(list) {
    const result = [];
    for (let i = 0; i < list.length; i++) {
      const child = list[i];
      const directive = asShadeDirective(child);
      let end = null;
      if (directive instanceof ComponentStart) {
        i++;
        const component = [];
        while (i < list.length) {
          const subChild = list[i];
          const childAsDirective = asShadeDirective(subChild);
          if (childAsDirective instanceof ComponentEnd && childAsDirective.id == directive.id) {
            end = subChild;
            break;
          } else {
            component.push(subChild);
          }
          i++;
        }
        if (end == null) {
          throw Error("Missing end tag for component " + directive.id);
        }
        result.push(new Component(directive, child, component, end));
      } else {
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
      const key = target.getAttribute(AttributeNames.Key);
      if (key != null) {
        return key;
      }
    }
    return null;
  }
  function updateBoundInput(boundId, serverSeen, value, setter) {
    const input = document.querySelector("[" + AttributeNames.Bound + '="' + boundId + '"]');
    if (!input) {
      return;
    }
    let seen = input.boundSeen || (input.boundSeen = 0);
    if (input && seen <= serverSeen) {
      setter(input, value);
    }
  }
  function evaluateScript(tag, scope, script) {
    try {
      scope(script);
    } catch (e) {
      sendIfError(e, tag, script.substring(0, 256));
    }
  }
  function makeEvalScope(scope) {
    const final = __spreadValues(__spreadValues({}, baseScope), scope);
    const names = Object.getOwnPropertyNames(final);
    const values = names.map((name) => final[name]);
    return function(script) {
      const compiled = new Function(...names, `return (function(){
${script}
})()`);
      return compiled(...values);
    };
  }
  const baseScope = {
    [SocketScopeNames.reconcile]: reconcile,
    [SocketScopeNames.updateBoundInput]: updateBoundInput,
    [SocketScopeNames.sendMessage]: sendMessage,
    [SocketScopeNames.sendIfError]: sendIfError
  };
  let socketReady = false;
  const socketReadyQueue = [];
  let socket;
  function connectSocket() {
    const url = new URL(window.shadeEndpoint, window.location.href);
    if (window.shadeHost) {
      url.host = window.shadeHost;
    }
    url.protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    socket = new WebSocket(url.href);
    socket.onopen = function() {
      const id = window.shadeId;
      console.log("Connected with ID " + id);
      localStorage.removeItem("shade_error_reload");
      socket.send(id);
      socketReady = true;
      while (socketReadyQueue.length > 0) {
        socket.send(socketReadyQueue.shift());
      }
    };
    socket.onmessage = function(event) {
      const data = event.data;
      const splitIndex = data.indexOf(messageTagSeparator);
      const tag = data.substring(0, splitIndex);
      const script = data.substring(splitIndex + 1, data.length);
      const scope = makeEvalScope({});
      whenDocumentReady(function() {
        evaluateScript(tag, scope, script);
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
        errorDisplay("This web page could not connect to its server. Please reload or try again later.");
        localStorage.removeItem("shade_error_reload");
      } else {
        localStorage.setItem("shade_error_reload", "true");
        location.reload();
      }
    }
    socket.onclose = function(evt) {
      console.log(`Socket closed: ${evt.reason}, ${evt.wasClean}`);
      socketReady = false;
      if (evt.wasClean) ;
      else {
        errorReload();
      }
    };
    socket.onerror = function(evt) {
      console.log(`Socket closed: ${evt}`);
      socketReady = false;
      errorReload();
    };
    setInterval(() => {
      if (socketReady) {
        socket.send("");
      }
    }, 60 * 1e3);
  }
  function sendMessage(id, msg) {
    const finalMsg = msg !== void 0 && msg !== null ? id + messageTagSeparator + msg : id + messageTagSeparator;
    sendOrQueue(finalMsg);
  }
  function sendOrQueue(finalMsg) {
    if (socketReady) {
      socket.send(finalMsg);
    } else {
      socketReadyQueue.push(finalMsg);
    }
  }
  function sendIfError(error, tag, evalText) {
    const data = error instanceof Error ? {
      name: error.name,
      jsMessage: error.message,
      stack: error.stack,
      eval: evalText,
      tag
    } : {
      name: "Unknown",
      jsMessage: "Unknown error: " + error,
      stack: "",
      eval: evalText,
      tag
    };
    sendOrQueue(`${messageTagErrorPrefix}${tag == void 0 ? "" : tag}${messageTagSeparator}` + JSON.stringify(data));
  }
  if (!window.shade) {
    window.shade = {};
    if (!window.WebSocket) {
      errorDisplay("Your web browser doesn't support this page, and it may not function correctly as a result. Upgrade your web browser.");
    } else {
      connectSocket();
      whenDocumentReady(function() {
        addAllDirectives(document.documentElement);
      });
      window.addEventListener("error", function(event) {
        sendIfError(event.error);
      });
      window.addEventListener("unhandledrejection", function(event) {
        sendIfError(event.reason);
      });
    }
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGUtYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi90eXBlc2NyaXB0L3NyYy9lcnJvcnMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9jb25zdGFudHMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy91dGlsaXR5LnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvYXR0cmlidXRlcy50cyIsIi4uLy4uL3R5cGVzY3JpcHQvc3JjL2FwcGx5anMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9kaXJlY3RpdmVzLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvcmVjb25jaWxlLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvYm91bmQudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9ldmFsLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvc29ja2V0LnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvc2hhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGVycm9yRGlzcGxheShjb250ZW50IDogc3RyaW5nKXtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgICsgXCI8L3A+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhZGVDbG9zZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKSE7XG4gICAgICAgIG0ucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQobSk7XG4gICAgfSk7XG59IiwiLy9DaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIG1pcnJvcmVkIGluIENsaWVudENvbnN0YW50cy5rdFxuXG5leHBvcnQgZW51bSBEaXJlY3RpdmVUeXBlIHtcbiAgICBBcHBseUpzID0gXCJqXCIsXG4gICAgU2V0QXR0cmlidXRlID0gXCJhXCIsXG4gICAgRXZlbnRIYW5kbGVyID0gXCJlXCIsXG4gICAgQ29tcG9uZW50U3RhcnQgPSBcInNcIixcbiAgICBDb21wb25lbnRFbmQgPSBcImZcIixcbiAgICBDb21wb25lbnRLZWVwID0gXCJrXCJcbn1cbmV4cG9ydCBlbnVtIEF0dHJpYnV0ZU5hbWVzIHtcbiAgICBEaXJlY3RpdmVUeXBlID0gXCJkYXRhLXNcIixcbiAgICBUYXJnZXRTaWJsaW5nRGlyZWN0aXZlID0gXCJkYXRhLWZcIixcbiAgICBBcHBseUpzU2NyaXB0ID0gXCJkYXRhLXRcIixcbiAgICBBcHBseUpzUnVuT3B0aW9uID0gXCJkYXRhLXJcIixcbiAgICBTZXRBdHRyaWJ1dGVOYW1lID0gXCJkYXRhLWFcIixcbiAgICBTZXRBdHRyaWJ1dGVWYWx1ZSA9IFwiZGF0YS12XCIsXG4gICAgS2V5ID0gXCJkYXRhLWtcIixcbiAgICBFdmVudE5hbWUgPSBcImRhdGEtZVwiLFxuICAgIEV2ZW50Q2FsbGJhY2tJZCA9IFwiZGF0YS1pXCIsXG4gICAgRXZlbnRQcmVmaXggPSBcImRhdGEtcFwiLFxuICAgIEV2ZW50U3VmZml4ID0gXCJkYXRhLXhcIixcbiAgICBFdmVudERhdGEgPSBcImRhdGEtZFwiLFxuICAgIEJvdW5kID0gXCJkYXRhLWJcIixcbiAgICBDaGVja2JveCA9IFwiZGF0YS1jXCJcbn1cblxuZXhwb3J0IGNvbnN0IHNjcmlwdFR5cGVTaWduaWZpZXIgPSBcInNoYWRlXCJcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZFByZWZpeCA9IFwic2hhZGVcIlxuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkRW5kU3VmZml4ID0gXCJlXCJcblxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdTZXBhcmF0b3IgPSBcInxcIlxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdFcnJvclByZWZpeCA9IFwiRVwiXG5cbmV4cG9ydCBlbnVtIFNvY2tldFNjb3BlTmFtZXMge1xuICAgIHJlY29uY2lsZSA9IFwiclwiLFxuICAgIHVwZGF0ZUJvdW5kSW5wdXQgPSBcImJcIixcbiAgICBzZW5kTWVzc2FnZSA9IFwic1wiLFxuICAgIHNlbmRJZkVycm9yID0gXCJxXCJcbn0iLCJleHBvcnQgZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQodGFyZ2V0IDogRWxlbWVudCwgc2VsZWN0b3IgOiBzdHJpbmcpOiBFbGVtZW50W10ge1xuICAgIGNvbnN0IGJlbG93ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgaWYodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKXtcbiAgICAgICAgcmV0dXJuIFt0YXJnZXQsIC4uLmJlbG93XVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJlbG93KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5Eb2N1bWVudFJlYWR5KGZuIDogKCk9PnZvaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiaW50ZXJhY3RpdmVcIikge1xuICAgICAgICBmbigpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZm4pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7U29ja2V0U2NvcGVOYW1lc30gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge2V2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQge0FkZGVkVGFyZ2V0SW5mbywgRXZlbnRIYW5kbGVyLCBUYXJnZXRJbmZvfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5cbmludGVyZmFjZSBFdmVudFByZXZpb3VzIHtcbiAgICBldmVudE5hbWU6IHN0cmluZyxcbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lclxuICAgIHRhcmdldDogSFRNTEVsZW1lbnRcbn1cblxuZXhwb3J0IGxldCBzdXBwcmVzc0V2ZW50RmlyaW5nID0ge3N1cHByZXNzOiBmYWxzZX07XG5cbmNvbnN0IGV2ZW50UHJldmlvdXMgPSBTeW1ib2woKVxuaW50ZXJmYWNlIEhhc1ByZXZpb3VzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIFtldmVudFByZXZpb3VzXT86IEV2ZW50UHJldmlvdXNcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUgOiBFdmVudEhhbmRsZXIsIGluZm8gOiBBZGRlZFRhcmdldEluZm8pe1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KVxuICAgIGNvbnN0IHByZWZpeCA9IGRpcmVjdGl2ZS5wcmVmaXggPyBgJHtkaXJlY3RpdmUucHJlZml4fTtcXG5gIDogXCJcIlxuICAgIGNvbnN0IGRhdGEgPSBkaXJlY3RpdmUuZGF0YSA/IGAsSlNPTi5zdHJpbmdpZnkoJHtkaXJlY3RpdmUuZGF0YX0pYCA6IFwiXCJcbiAgICBjb25zdCBzdWZmaXggPSBkaXJlY3RpdmUuc3VmZml4ID8gYDtcXG4ke2RpcmVjdGl2ZS5zdWZmaXh9YCA6IFwiXCJcbiAgICBjb25zdCBzY3JpcHQgPSBgJHtwcmVmaXh9JHtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlfSgke2RpcmVjdGl2ZS5jYWxsYmFja0lkfSR7ZGF0YX0pJHtzdWZmaXh9YFxuICAgIGNvbnN0IGxpc3RlbmVyIDogRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHRoaXMgOiBFdmVudExpc3RlbmVyLCBlIDogRXZlbnQpe1xuICAgICAgICBpZihzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzKXsgcmV0dXJuIH1cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHtcbiAgICAgICAgICAgIGV2ZW50OiBlLFxuICAgICAgICAgICAgZTogZSxcbiAgICAgICAgICAgIGl0OiBlLnRhcmdldFxuICAgICAgICB9KVxuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBzY3JpcHQpXG4gICAgfVxuICAgIGluZm8udGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZGlyZWN0aXZlLmV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIChpbmZvLmVsZW1lbnQgYXMgSGFzUHJldmlvdXMpW2V2ZW50UHJldmlvdXNdID0ge1xuICAgICAgICBldmVudE5hbWU6IGRpcmVjdGl2ZS5ldmVudE5hbWUsXG4gICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlIDogRXZlbnRIYW5kbGVyLCBpbmZvIDogVGFyZ2V0SW5mbyl7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBwcmV2aW91cyA9IChlbGVtZW50IGFzIEhhc1ByZXZpb3VzKVtldmVudFByZXZpb3VzXVxuICAgIGlmKHByZXZpb3VzKXtcbiAgICAgICAgcHJldmlvdXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJldmlvdXMuZXZlbnROYW1lLCBwcmV2aW91cy5saXN0ZW5lcilcbiAgICB9XG59IiwiaW1wb3J0IHtBZGRlZFRhcmdldEluZm8sIGFzU2hhZGVEaXJlY3RpdmUsIFNldEF0dHJpYnV0ZX0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllcn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge3N1cHByZXNzRXZlbnRGaXJpbmd9IGZyb20gXCIuL2V2ZW50c1wiO1xuXG5cbi8vV2UgbmVlZCBzb21lIHdheSBvZiBzdG9yaW5nIHRoZSBvcmlnaW5hbCB2YWx1ZXMgb2YgYW4gYXR0cmlidXRlIGJlZm9yZSBhbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHdhcyBhcHBsaWVkLFxuLy9pbiBjYXNlIHRoYXQgZGlyZWN0aXZlIGlzIHJlbW92ZWQgaW4gYW4gdXBkYXRlIHRoYXQgZG9lcyBub3QgcmVzZXQgYW4gZWxlbWVudCdzIGF0dHJpYnV0ZXMuXG5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKClcbmludGVyZmFjZSBPcmlnaW5hbEF0dHJpYnV0ZVZhbHVlRG9tIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10/IDogQXR0cmlidXRlT3JpZ2luYWxNYXBcbn1cbmludGVyZmFjZSBBdHRyaWJ1dGVPcmlnaW5hbE1hcCB7XG4gICAgW25hbWU6IHN0cmluZ106c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBvcmlnaW5hbE1hcCA9IChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXVxuICAgIGlmKG9yaWdpbmFsTWFwKXtcbiAgICAgICAgZGVsZXRlIChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQoZWxlbWVudCk7XG4gICAgfVxufVxuZnVuY3Rpb24gbm90ZU9yaWdpbmFsQXR0cmlidXRlKGVsZW1lbnQgOiBIVE1MRWxlbWVudCwgbmFtZSA6IHN0cmluZyl7XG4gICAgbGV0IG9yaWdpbmFscyA9IChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZighb3JpZ2luYWxzKXtcbiAgICAgICAgb3JpZ2luYWxzID0gKGVsZW1lbnQgYXMgT3JpZ2luYWxBdHRyaWJ1dGVWYWx1ZURvbSlbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdID0ge307XG4gICAgfVxuICAgIGlmKCEobmFtZSBpbiBvcmlnaW5hbHMpKXtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuXG5cbmNvbnN0IGlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYFske0F0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGV9PSR7RGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGV9XWA7XG5jb25zdCBiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSA9IGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XSR7aXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmV9YDtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0IDogSFRNTEVsZW1lbnQpe1xuICAgIC8vRmlyc3QsIGZpbmQgYWxsIFNldEF0dHJpYnV0ZSBkaXJlY3RpdmVzIHRoYXQgYXBwbHkgdG8gdGFyZ2V0XG4gICAgY29uc3QgYXBwbGljYWJsZSA9IEFycmF5LmZyb20odGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoYmFzZVF1ZXJ5SXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmUpKTtcbiAgICBsZXQgY3VycmVudCA6IEhUTUxFbGVtZW50fG51bGwgPSB0YXJnZXRcbiAgICB3aGlsZSh0cnVlKXtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZighY3VycmVudCB8fCAhY3VycmVudC5tYXRjaGVzKGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XVske0F0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmV9XWApKXtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICAvL05leHQsIGdyb3VwIHRoZW0gYnkgdGhlIGF0dHJpYnV0ZSB0aGV5IGFwcGx5IHRvXG4gICAgY29uc3QgYnlBdHRyaWJ1dGVOYW1lIDoge1tuYW1lOiBzdHJpbmddOlNldEF0dHJpYnV0ZVtdfSA9IHt9XG4gICAgZm9yKGxldCBlbCBvZiBhcHBsaWNhYmxlKXtcbiAgICAgICAgY29uc3QgYXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsKTtcbiAgICAgICAgaWYoYXNEaXJlY3RpdmUgJiYgYXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpe1xuICAgICAgICAgICAgbGV0IGFycmF5ID0gYnlBdHRyaWJ1dGVOYW1lW2FzRGlyZWN0aXZlLm5hbWVdO1xuICAgICAgICAgICAgaWYoIWFycmF5KXtcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyYXkucHVzaChhc0RpcmVjdGl2ZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL05vdywgYXBwbHkgb25seSB0aGUgbGFzdCBkaXJlY3RpdmUgZm9yIGV2ZXJ5IGF0dHJpYnV0ZVxuICAgIGZvcihsZXQgYXR0cmlidXRlIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJ5QXR0cmlidXRlTmFtZSkpe1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gYnlBdHRyaWJ1dGVOYW1lW2F0dHJpYnV0ZV07XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJlY3RpdmVzW2RpcmVjdGl2ZXMubGVuZ3RoIC0gMV0hIVxuXG4gICAgICAgIG5vdGVPcmlnaW5hbEF0dHJpYnV0ZSh0YXJnZXQsIGxhc3QubmFtZSk7XG4gICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUodGFyZ2V0LCBsYXN0Lm5hbWUsIGxhc3QudmFsdWUpO1xuICAgIH1cblxuICAgIC8vRmluYWxseSwgcmVzdG9yZSB0aGUgb3JpZ2luYWwgdmFsdWVzIGZvciBhbnkgYXR0cmlidXRlcyB0aGF0IG5vIGxvbmdlciBoYXZlIGRpcmVjdGl2ZXNcbiAgICBjb25zdCBvcmlnaW5hbHMgPSAodGFyZ2V0IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSB8fCB7fTtcbiAgICBmb3IobGV0IG9yaWdpbmFsIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9yaWdpbmFscykpe1xuICAgICAgICBpZighYnlBdHRyaWJ1dGVOYW1lW29yaWdpbmFsXSl7XG4gICAgICAgICAgICBhcHBseUF0dHJpYnV0ZVZhbHVlKHRhcmdldCwgb3JpZ2luYWwsIG9yaWdpbmFsc1tvcmlnaW5hbF0pO1xuICAgICAgICAgICAgZGVsZXRlIG9yaWdpbmFsc1tvcmlnaW5hbF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxubGV0IHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgOiBTZXQ8SFRNTEVsZW1lbnQ+ID0gbmV3IFNldCgpO1xuZXhwb3J0IGZ1bmN0aW9uIGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcyhjYiA6ICgpPT52b2lkKXtcbiAgICB0cnkge1xuICAgICAgICBjYigpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZm9yKGxldCB0YXJnZXQgb2YgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyl7XG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzKHRhcmdldClcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzID0gbmV3IFNldCgpO1xuICAgIH1cbn1cblxuY29uc3Qgc2V0QXR0cmlidXRlVGFyZ2V0ID0gU3ltYm9sKCk7XG5pbnRlcmZhY2UgU2V0QXR0cmlidXRlRG9tIHtcbiAgICBbc2V0QXR0cmlidXRlVGFyZ2V0XT86IEhUTUxFbGVtZW50XG59XG5leHBvcnQgZnVuY3Rpb24gbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZShpbmZvIDogQWRkZWRUYXJnZXRJbmZvKXtcbiAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChpbmZvLnRhcmdldCk7XG4gICAgKDxTZXRBdHRyaWJ1dGVEb20+aW5mby5lbGVtZW50KVtzZXRBdHRyaWJ1dGVUYXJnZXRdID0gaW5mby50YXJnZXRcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGVsZW1lbnQgOiBIVE1MRWxlbWVudCl7XG4gICAgY29uc3QgdGFyZ2V0ID0gKDxTZXRBdHRyaWJ1dGVEb20+ZWxlbWVudClbc2V0QXR0cmlidXRlVGFyZ2V0XVxuICAgIGlmKHRhcmdldCl7XG4gICAgICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKHRhcmdldCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQgOiBIVE1MRWxlbWVudCwgbmFtZSA6IHN0cmluZywgdmFsdWUgOiBzdHJpbmd8bnVsbCl7XG4gICAgaWYodmFsdWUgPT0gbnVsbCl7XG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSlcbiAgICB9XG4gICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiAobmFtZSA9PSBcInZhbHVlXCIgfHwgbmFtZSA9PSBcImNoZWNrZWRcIikpe1xuICAgICAgICAvL1RoZXNlIHNwZWNpYWwgdmFsdWVzIGhhdmUgZWZmZWN0cyBvbmx5IG9uIHRoZSBcImluaXRpYWxcIiBpbnNlcnRpb24gb2YgYSBET00gb2JqZWN0O1xuICAgICAgICAvL2ZvciBjb25zaXN0ZW5jeSB3ZSBhbHdheXMgYXBwbHkgdGhlc2UgZWZmZWN0c1xuICAgICAgICBpZihuYW1lID09IFwidmFsdWVcIiAmJiB0YXJnZXQudmFsdWUgIT0gdmFsdWUpe1xuICAgICAgICAgICAgc3VwcHJlc3NDaGFuZ2VMaXN0ZW5lcnModGFyZ2V0LCAoKT0+e1xuICAgICAgICAgICAgICAgIHRhcmdldC52YWx1ZSA9IHZhbHVlID8/IFwiXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZihuYW1lID09IFwiY2hlY2tlZFwiICYmIHRhcmdldC5jaGVja2VkICE9ICh2YWx1ZSAhPSBudWxsKSl7XG4gICAgICAgICAgICBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQsICgpPT57XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNoZWNrZWQgPSB2YWx1ZSAhPSBudWxsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxPcHRpb25FbGVtZW50ICYmIG5hbWUgPT0gXCJzZWxlY3RlZFwiICYmIHRhcmdldC5zZWxlY3RlZCAhPSAodmFsdWUgIT0gbnVsbCkpe1xuICAgICAgICB0YXJnZXQuc2VsZWN0ZWQgPSB2YWx1ZSAhPSBudWxsXG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQgOiBIVE1MSW5wdXRFbGVtZW50LCBjYiA6ICgpPT52b2lkKXtcbiAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gdHJ1ZVxuICAgIGNvbnN0IG9sZE9uQ2hhbmdlID0gdGFyZ2V0Lm9uY2hhbmdlXG4gICAgdGFyZ2V0Lm9uY2hhbmdlID0gbnVsbFxuICAgIHRyeSB7XG4gICAgICAgIGNiKClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICB0YXJnZXQub25jaGFuZ2UgPSBvbGRPbkNoYW5nZVxuICAgICAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gZmFsc2VcbiAgICB9XG59IiwiaW1wb3J0IHtldmFsdWF0ZVNjcmlwdCwgbWFrZUV2YWxTY29wZX0gZnJvbSBcIi4vZXZhbFwiO1xuaW1wb3J0IHtBZGRlZFRhcmdldEluZm8sIEFwcGx5SnN9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcblxuaW50ZXJmYWNlIFNjcmlwdFByZXZpb3VzIHtcbiAgICBqcyA6IHN0cmluZ1xuICAgIHRhcmdldCA6IEhUTUxFbGVtZW50XG59XG5jb25zdCBzY3JpcHRQcmV2aW91cyA9IFN5bWJvbCgpXG5pbnRlcmZhY2UgSGFzU2NyaXB0UHJldmlvdXMgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgW3NjcmlwdFByZXZpb3VzXT8gOiBTY3JpcHRQcmV2aW91c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuRWxlbWVudFNjcmlwdChkaXJlY3RpdmUgOiBBcHBseUpzLCBpbmZvIDogQWRkZWRUYXJnZXRJbmZvKXtcbiAgICBjb25zdCBvbGQgPSAoaW5mby5lbGVtZW50IGFzIEhhc1NjcmlwdFByZXZpb3VzKVtzY3JpcHRQcmV2aW91c11cbiAgICBpZighZGlyZWN0aXZlLm9ubHlPbkNyZWF0ZSB8fCAhb2xkIHx8IG9sZC5qcyAhPSBkaXJlY3RpdmUuanMgfHwgb2xkLnRhcmdldCAhPSBpbmZvLnRhcmdldCl7XG4gICAgICAgIChpbmZvLmVsZW1lbnQgYXMgSGFzU2NyaXB0UHJldmlvdXMpW3NjcmlwdFByZXZpb3VzXSA9IHtcbiAgICAgICAgICAgIGpzOiBkaXJlY3RpdmUuanMsXG4gICAgICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGl0ID0gaW5mby50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBpdFxuICAgICAgICB9KVxuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBkaXJlY3RpdmUuanMpXG4gICAgfVxufSIsImltcG9ydCB7QXR0cmlidXRlTmFtZXMsIGNvbXBvbmVudElkRW5kU3VmZml4LCBjb21wb25lbnRJZFByZWZpeCwgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllcn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge3F1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0fSBmcm9tIFwiLi91dGlsaXR5XCI7XG5pbXBvcnQge2NoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcywgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZSwgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZVJlbW92ZX0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuaW1wb3J0IHtydW5FbGVtZW50U2NyaXB0fSBmcm9tIFwiLi9hcHBseWpzXCI7XG5pbXBvcnQge3JlbW92ZUV2ZW50SGFuZGxlciwgc2V0dXBFdmVudEhhbmRsZXJ9IGZyb20gXCIuL2V2ZW50c1wiO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhcnQge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpZCA6IHN0cmluZyl7fVxufVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEVuZCB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGlkIDogc3RyaW5nKXt9XG59XG5leHBvcnQgY2xhc3MgS2VlcCB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGlkIDogc3RyaW5nKXt9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRBdHRyaWJ1dGUge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lIDogc3RyaW5nLCBwdWJsaWMgdmFsdWUgOiBzdHJpbmd8bnVsbCl7fVxufVxuXG5leHBvcnQgY2xhc3MgQXBwbHlKcyB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGpzIDogc3RyaW5nLCBwdWJsaWMgb25seU9uQ3JlYXRlIDogYm9vbGVhbil7fVxufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIGV2ZW50TmFtZSA6IHN0cmluZyxcbiAgICAgICAgcHVibGljIGNhbGxiYWNrSWQgOiBudW1iZXIsXG4gICAgICAgIHB1YmxpYyBwcmVmaXggOiBzdHJpbmd8bnVsbCxcbiAgICAgICAgcHVibGljIHN1ZmZpeCA6IHN0cmluZ3xudWxsLFxuICAgICAgICBwdWJsaWMgZGF0YSA6IHN0cmluZ3xudWxsXG4gICAgKXt9XG59XG5leHBvcnQgdHlwZSBEaXJlY3RpdmUgPSBDb21wb25lbnRTdGFydCB8IENvbXBvbmVudEVuZCB8IEtlZXAgfCBBcHBseUpzIHwgU2V0QXR0cmlidXRlIHwgRXZlbnRIYW5kbGVyXG5leHBvcnQgZnVuY3Rpb24gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCA6IE5vZGUpIDogRGlyZWN0aXZlfG51bGwge1xuICAgIGlmKGNoaWxkIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgY2hpbGQudGFnTmFtZSA9PSBcIlNDUklQVFwiICYmIGNoaWxkLmdldEF0dHJpYnV0ZShcInR5cGVcIikgPT09IHNjcmlwdFR5cGVTaWduaWZpZXIpe1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGUpXG4gICAgICAgIGNvbnN0IGlkID0gY2hpbGQuaWRcbiAgICAgICAgc3dpdGNoKGRpcmVjdGl2ZVR5cGUpe1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkFwcGx5SnM6XG4gICAgICAgICAgICAgICAgY29uc3QgcnVuT3B0aW9uID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNSdW5PcHRpb24pXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NyaXB0ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNTY3JpcHQpISFcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFwcGx5SnMoc2NyaXB0LCBydW5PcHRpb24gPT09IFwiMVwiKVxuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkNvbXBvbmVudFN0YXJ0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50U3RhcnQoaWQuc3Vic3RyaW5nKGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCkpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50RW5kOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50RW5kKGlkLnN1YnN0cmluZyhjb21wb25lbnRJZFByZWZpeC5sZW5ndGgsIGlkLmxlbmd0aCAtIGNvbXBvbmVudElkRW5kU3VmZml4Lmxlbmd0aCkpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50S2VlcDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEtlZXAoaWQuc3Vic3RyaW5nKGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCkpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuU2V0QXR0cmlidXRlOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVOYW1lKSEhXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuU2V0QXR0cmlidXRlVmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkV2ZW50SGFuZGxlcjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnROYW1lKSEhXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSArY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50Q2FsbGJhY2tJZCkhIVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFByZWZpeClcbiAgICAgICAgICAgICAgICBjb25zdCBzdWZmaXggPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRTdWZmaXgpXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudERhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudEhhbmRsZXIobmFtZSwgaWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRBbGxEaXJlY3RpdmVzKGJhc2UgOiBIVE1MRWxlbWVudCkge1xuICAgIGNoYW5naW5nRGlyZWN0aXZlcygoKT0+e1xuICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChiYXNlKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZVNjcmlwdFRhcmdldChzY3JpcHQgOiBIVE1MRWxlbWVudCkgOiBIVE1MRWxlbWVudHxudWxsIHtcbiAgICBpZihzY3JpcHQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKXtcbiAgICAgICAgbGV0IHRhcmdldCA6IEVsZW1lbnR8bnVsbCA9IHNjcmlwdFxuICAgICAgICB3aGlsZSh0YXJnZXQgJiYgdGFyZ2V0Lmhhc0F0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlKSl7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQgYXMgKEhUTUxFbGVtZW50fG51bGwpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50ISFcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFyZ2V0SW5mbyB7XG4gICAgZWxlbWVudCA6IEhUTUxFbGVtZW50XG4gICAgZGlyZWN0aXZlIDogRGlyZWN0aXZlXG59XG5leHBvcnQgaW50ZXJmYWNlIEFkZGVkVGFyZ2V0SW5mbyBleHRlbmRzIFRhcmdldEluZm8ge1xuICAgIHRhcmdldCA6IEhUTUxFbGVtZW50XG59XG5cbmxldCBjaGFuZ2VkRGlyZWN0aXZlcyA6IFRhcmdldEluZm9bXSA9IFtdO1xubGV0IHJlbW92ZWREaXJlY3RpdmVzIDogVGFyZ2V0SW5mb1tdID0gW107XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdEaXJlY3RpdmVzKGNiIDogKCk9PnZvaWQpe1xuICAgIGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcygoKT0+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2IoKVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgZm9yKGxldCBjaGFuZ2VkIG9mIGNoYW5nZWREaXJlY3RpdmVzKXtcbiAgICAgICAgICAgICAgICBvbkFkZGVkT3JVcGRhdGVkKGNoYW5nZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKGxldCByZW1vdmVkIG9mIHJlbW92ZWREaXJlY3RpdmVzKXtcbiAgICAgICAgICAgICAgICBvblJlbW92ZWQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYW5nZWREaXJlY3RpdmVzID0gW107XG4gICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcyA9IFtdO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiBhZGRlZCBmb3Igc2hhZGUgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVBZGQoZWxlbWVudCA6IE5vZGUpe1xuICAgIGlmKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgIGZvcihsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGVsZW1lbnQsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKXtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KVxuICAgICAgICAgICAgaWYoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKXtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHtkaXJlY3RpdmUsIGVsZW1lbnQ6IHNjcmlwdH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBhbmQgcmVjb3JkcyB3aGV0aGVyIGFuIGVsZW1lbnQgdGhhdCBjaGFuZ2VkIGlzIGEgc2NyaXB0IGRpcmVjdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVDaGFuZ2UoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsZW1lbnQpXG4gICAgaWYoZGlyZWN0aXZlKXtcbiAgICAgICAgY2hhbmdlZERpcmVjdGl2ZXMucHVzaCh7ZGlyZWN0aXZlLCBlbGVtZW50fSk7XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBhbiBlbGVtZW50IGFuZCBhbGwgaXRzIGNoaWxkcmVuIHRoYXQgaGF2ZSBqdXN0IGJlZW4gcmVtb3ZlZCBmb3Igc2hhZGUgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVSZW1vdmUoZWxlbWVudCA6IE5vZGUpe1xuICAgIGlmKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgIGZvcihsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGVsZW1lbnQsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKXtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KVxuICAgICAgICAgICAgaWYoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKXtcbiAgICAgICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcy5wdXNoKHtkaXJlY3RpdmUsIGVsZW1lbnQ6IHNjcmlwdH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENhbGxlZCBhZnRlciB0aGUgZGlyZWN0aXZlIGNvbnRhaW5lZCBpbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvIDogVGFyZ2V0SW5mbykge1xuICAgIGNvbnN0IHRhcmdldCA9IGRldGVybWluZVNjcmlwdFRhcmdldChpbmZvLmVsZW1lbnQpXG4gICAgaWYodGFyZ2V0KXtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmU7XG4gICAgICAgIGNvbnN0IGFkZEluZm8gPSB7Li4uaW5mbywgdGFyZ2V0fVxuICAgICAgICBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpe1xuICAgICAgICAgICAgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZShhZGRJbmZvKTtcbiAgICAgICAgfSBlbHNlIGlmKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpe1xuICAgICAgICAgICAgcnVuRWxlbWVudFNjcmlwdChkaXJlY3RpdmUsIGFkZEluZm8pXG4gICAgICAgIH0gZWxzZSBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpe1xuICAgICAgICAgICAgc2V0dXBFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBhZGRJbmZvKVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgVW5rbm93biB0YXJnZXQgZm9yICR7aW5mby5lbGVtZW50Lm91dGVySFRNTH1gKVxuICAgIH1cbn1cbmZ1bmN0aW9uIG9uUmVtb3ZlZChpbmZvIDogVGFyZ2V0SW5mbyl7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmVcbiAgICBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpe1xuICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGluZm8uZWxlbWVudClcbiAgICB9XG4gICAgaWYoZGlyZWN0aXZlIGluc3RhbmNlb2YgRXZlbnRIYW5kbGVyKXtcbiAgICAgICAgcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbylcbiAgICB9XG59IiwiLy9SZWNvbmNpbGUgYSB0YXJnZXRJZCB3aXRoIEhUTUxcbmltcG9ydCB7XG4gICAgYXNTaGFkZURpcmVjdGl2ZSxcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMsXG4gICAgY2hlY2tEaXJlY3RpdmVBZGQsXG4gICAgY2hlY2tEaXJlY3RpdmVDaGFuZ2UsXG4gICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUsXG4gICAgQ29tcG9uZW50RW5kLFxuICAgIENvbXBvbmVudFN0YXJ0LFxuICAgIEtlZXAsXG59IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmltcG9ydCB7QXR0cmlidXRlTmFtZXMsIGNvbXBvbmVudElkUHJlZml4fSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7YXBwbHlBdHRyaWJ1dGVWYWx1ZSwgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZX0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVjb25jaWxlKHRhcmdldElkIDogbnVtYmVyLCBodG1sIDogc3RyaW5nKXtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCk9PntcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29tcG9uZW50SWRQcmVmaXgrdGFyZ2V0SWQpO1xuICAgICAgICBpZighdGFyZ2V0KXsgcmV0dXJuIH1cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQhIVxuICAgICAgICBjb25zdCBodG1sRG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChwYXJlbnQudGFnTmFtZSk7XG4gICAgICAgIGh0bWxEb20uaW5uZXJIVE1MID0gaHRtbDtcblxuXG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuICAgICAgICB3aGlsZShjdXJyZW50ICE9IG51bGwpe1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY3VycmVudClcbiAgICAgICAgICAgIGlmKGN1cnJlbnREaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRFbmQgJiYgY3VycmVudERpcmVjdGl2ZS5pZCA9PSBcIlwiK3RhcmdldElkKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluY2x1ZGVkLnB1c2goY3VycmVudCk7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0U2libGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGNoQ2hpbGRyZW4ocGFyZW50LCB0YXJnZXQsIGluY2x1ZGVkLCBodG1sRG9tLmNoaWxkTm9kZXMpO1xuICAgIH0pO1xufVxuXG5cblxuXG5pbnRlcmZhY2UgQ2hpbGROb2RlTGlzdExpa2Uge1xuICAgIGxlbmd0aCA6IG51bWJlcjtcbiAgICBbaW5kZXg6IG51bWJlcl0gOiBOb2RlXG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgc3RhcnREaXJlY3RpdmUgOiBDb21wb25lbnRTdGFydCxcbiAgICAgICAgcHVibGljIHN0YXJ0IDogTm9kZSxcbiAgICAgICAgcHVibGljIGNoaWxkcmVuIDogTm9kZVtdLFxuICAgICAgICBwdWJsaWMgZW5kIDogTm9kZVxuICAgICl7fVxuXG4gICAgYXNOb2Rlcygpe1xuICAgICAgICByZXR1cm4gW3RoaXMuc3RhcnQsIC4uLnRoaXMuY2hpbGRyZW4sIHRoaXMuZW5kXVxuICAgIH1cblxuICAgIGlkKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0RGlyZWN0aXZlLmlkXG4gICAgfVxufVxudHlwZSBOb2RlT3JDb21wb25lbnQgPSAoTm9kZXxDb21wb25lbnQpO1xuZnVuY3Rpb24gYXNOb2Rlcyh0YXJnZXQgOiBOb2RlT3JDb21wb25lbnQpe1xuICAgIHJldHVybiB0YXJnZXQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyB0YXJnZXQuYXNOb2RlcygpIDogW3RhcmdldF1cbn1cblxuXG5mdW5jdGlvbiByZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCA6IE5vZGUsIG5ld2VyIDogTm9kZSkgOiBOb2RlIHtcbiAgICBpZihvcmlnaW5hbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIG5ld2VyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuICAgICAgICBpZihvcmlnaW5hbC50YWdOYW1lICE9IG5ld2VyLnRhZ05hbWUpe1xuICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQobmV3ZXIpO1xuICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUob3JpZ2luYWwpO1xuICAgICAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZVxuICAgICAgICAgICAgZm9yKGNvbnN0IGF0dHJpYnV0ZSBvZiBvcmlnaW5hbC5nZXRBdHRyaWJ1dGVOYW1lcygpKXtcbiAgICAgICAgICAgICAgICBpZighbmV3ZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpe1xuICAgICAgICAgICAgICAgICAgICBhcHBseUF0dHJpYnV0ZVZhbHVlKG9yaWdpbmFsLCBhdHRyaWJ1dGUsIG51bGwpXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8bmV3ZXIuYXR0cmlidXRlcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBuZXdlci5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkZXJBdHRyID0gb3JpZ2luYWwuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3ZXJBdHRyID0gbmV3ZXIuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkhXG4gICAgICAgICAgICAgICAgaWYob2xkZXJBdHRyICE9IG5ld2VyQXR0cil7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUob3JpZ2luYWwsIGF0dHJpYnV0ZSwgbmV3ZXJBdHRyKVxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihjaGFuZ2VkKXtcbiAgICAgICAgICAgICAgICBvbkF0dHJpYnV0ZXNTZXRGcm9tU291cmNlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUNoYW5nZShvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKG9yaWdpbmFsLCBudWxsLCBvcmlnaW5hbC5jaGlsZE5vZGVzLCBuZXdlci5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBUZXh0ICYmIG5ld2VyIGluc3RhbmNlb2YgVGV4dCl7XG4gICAgICAgIGlmKG9yaWdpbmFsLnRleHRDb250ZW50ID09IG5ld2VyLnRleHRDb250ZW50KXtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXdlcjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXdlcjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4oXG4gICAgZG9tIDogSFRNTEVsZW1lbnQsXG4gICAgYXBwZW5kU3RhcnQgOiBIVE1MRWxlbWVudHxudWxsLFxuICAgIGRvbUNoaWxkcmVuIDogQ2hpbGROb2RlTGlzdExpa2UsXG4gICAgcmVwbGFjZW1lbnRDaGlsZHJlbiA6IENoaWxkTm9kZUxpc3RMaWtlXG4pe1xuICAgIGNvbnN0IGZpbmFsID0gcmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbik7XG4gICAgbGV0IGVuZE9mUGF0Y2hSYW5nZSA6IE5vZGV8bnVsbDtcbiAgICBpZihkb21DaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGRvbUNoaWxkcmVuW2RvbUNoaWxkcmVuLmxlbmd0aCAtIDFdLm5leHRTaWJsaW5nO1xuICAgIH0gZWxzZSBpZiAoYXBwZW5kU3RhcnQpe1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBhcHBlbmRTdGFydC5uZXh0U2libGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBudWxsO1xuICAgIH1cblxuICAgIGxldCBjdXJyZW50IDogTm9kZXxcInN0YXJ0XCJ8XCJlbmRcIiA9IGFwcGVuZFN0YXJ0ID8gYXBwZW5kU3RhcnQgOiBcInN0YXJ0XCI7XG4gICAgZnVuY3Rpb24gYWZ0ZXJDdXJyZW50KCkgOiBOb2RlfFwiZW5kXCIge1xuICAgICAgICBpZihjdXJyZW50ID09IFwic3RhcnRcIil7XG4gICAgICAgICAgICByZXR1cm4gZG9tLmZpcnN0Q2hpbGQgPyBkb20uZmlyc3RDaGlsZCA6IFwiZW5kXCI7XG4gICAgICAgIH0gZWxzZSBpZihjdXJyZW50ID09IFwiZW5kXCIpe1xuICAgICAgICAgICAgcmV0dXJuIFwiZW5kXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudC5uZXh0U2libGluZyA/IGN1cnJlbnQubmV4dFNpYmxpbmcgOiBcImVuZFwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcihjb25zdCBjaGlsZCBvZiBmaW5hbCl7XG4gICAgICAgIGxldCBuZXh0ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGlmKG5leHQgIT09IGNoaWxkKXtcbiAgICAgICAgICAgIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQgPT09IFwiZW5kXCIgPyBudWxsIDogbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGNoaWxkO1xuICAgIH1cbiAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgd2hpbGUoY3VycmVudCAhPSBcImVuZFwiICYmIGN1cnJlbnQgIT0gZW5kT2ZQYXRjaFJhbmdlKXtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjdXJyZW50O1xuICAgICAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDaGlsZChjaGlsZCk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIHJlY29uY2lsZUNoaWxkcmVuKFxuICAgIGRvbSA6IEhUTUxFbGVtZW50LFxuICAgIGRvbUNoaWxkcmVuIDogQ2hpbGROb2RlTGlzdExpa2UsXG4gICAgcmVwbGFjZW1lbnRDaGlsZHJlbiA6IENoaWxkTm9kZUxpc3RMaWtlXG4pIDogTm9kZVtdIHtcbiAgICBjb25zdCBvcmlnaW5hbHMgPSBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKGRvbUNoaWxkcmVuKTtcbiAgICBjb25zdCByZXBsYWNlbWVudHMgPSBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKHJlcGxhY2VtZW50Q2hpbGRyZW4pO1xuICAgIGNvbnN0IG9yaWdpbmFsS2V5cyA9IGNvbGxlY3RLZXlzTWFwKG9yaWdpbmFscyk7XG5cbiAgICBsZXQgb3JpZ2luYWxJbmRleCA9IDA7XG4gICAgbGV0IHJlcGxhY2VtZW50SW5kZXggPSAwO1xuXG4gICAgY29uc3QgZmluYWxDaGlsZHJlbiA6IE5vZGVbXSA9IFtdO1xuXG4gICAgd2hpbGUob3JpZ2luYWxJbmRleCA8IG9yaWdpbmFscy5sZW5ndGggfHwgcmVwbGFjZW1lbnRJbmRleCA8IHJlcGxhY2VtZW50cy5sZW5ndGgpe1xuICAgICAgICBsZXQgb3JpZ2luYWwgOiBOb2RlT3JDb21wb25lbnR8dW5kZWZpbmVkID0gb3JpZ2luYWxzW29yaWdpbmFsSW5kZXhdO1xuICAgICAgICBjb25zdCBuZXdlciA6IE5vZGVPckNvbXBvbmVudHx1bmRlZmluZWQgPSByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRJbmRleF07XG4gICAgICAgIGlmKG9yaWdpbmFsICYmICFuZXdlcikge1xuICAgICAgICAgICAgLyogSW1wbGljaXQgcmVtb3ZlICovXG4gICAgICAgICAgICBmb3IobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpe1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgLy9UZXh0IG5vZGVzIGhhdmUgbm8gaW50ZXJlc3RpbmcgaWRlbnRpdHkgb3IgY2hpbGRyZW4gdG8gcHJlc2VydmUsIGFuZCB0aGVcbiAgICAgICAgICAgIC8vS290bGluIHNpZGUgY2FuJ3QgdHJhY2sgdGhlbSBmb3IgcG9zaXRpb24gbWF0Y2hpbmcsIHNvIHdlIGp1c3Qgc2tpcCBvdmVyIHRoZW1cbiAgICAgICAgICAgIC8vaW4gY29tcGFyaXNvbnMgYW5kIGFkZCB0aGUgbmV3ZXIgdGV4dCBhbHdheXMuXG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAobmV3ZXIgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpXG4gICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL1RoZSBzZXJ2ZXIgZG9lcyBub3QgdHJhY2sgdGhlIHBvc2l0aW9uIG9mIG1vc3QgZGlyZWN0aXZlcywgZXhjZXB0IGtlZXAsIHNvIHRoZXkgYXJlIHNwZWNpYWxseSBoYW5kbGVkXG4gICAgICAgICAgICAvL2ZvciBtYXRjaGluZ1xuICAgICAgICAgICAgY29uc3QgbmV3ZXJEaXJlY3RpdmUgPSBuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCA/IG51bGwgOiBhc1NoYWRlRGlyZWN0aXZlKG5ld2VyKVxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxJc0RpcmVjdGl2ZSA9IG9yaWdpbmFsIGluc3RhbmNlb2YgTm9kZSAmJiBhc1NoYWRlRGlyZWN0aXZlKG9yaWdpbmFsKSAhPSBudWxsXG4gICAgICAgICAgICBpZihuZXdlciBpbnN0YW5jZW9mIE5vZGUgJiYgbmV3ZXJEaXJlY3RpdmUgIT0gbnVsbCAmJiAhKG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCkpe1xuICAgICAgICAgICAgICAgIGlmKG9yaWdpbmFsSXNEaXJlY3RpdmUpe1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gocmVjb25jaWxlTm9kZXMob3JpZ2luYWwgYXMgTm9kZSwgbmV3ZXIpKVxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5ld2VyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcmlnaW5hbElzRGlyZWN0aXZlKXtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShvcmlnaW5hbCBhcyBOb2RlKVxuICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld2VyS2V5ID0gZ2V0S2V5KG5ld2VyKTtcbiAgICAgICAgICAgIGlmKG5ld2VyS2V5ICE9IG51bGwpe1xuICAgICAgICAgICAgICAgIC8vV2UnbGwgZGlyZWN0bHkgbWF0Y2ggdG8gdGhlIG9yaWdpbmFsIGJ5IGtleSwgaWdub3Jpbmcgd2hhdCdzIHVzdWFsbHkgYXQgdGhpcyBwb3NpdGlvblxuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gb3JpZ2luYWxLZXlzW25ld2VyS2V5XT8ucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYob3JpZ2luYWwgJiYgZ2V0S2V5KG9yaWdpbmFsKSAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAvL0Ega2V5ZWQgb3JpZ2luYWwgaXMgb25seSBtYXRjaGVkIGJ5IGl0cyBrZXk7IGlmIG5vdGhpbmcgY2xhaW1zIGl0LCBpdCdzIHJlbW92ZWQgd2l0aCB0aGUgb3RoZXIgdW51c2VkIGtleXMgYmVsb3dcbiAgICAgICAgICAgICAgICBvcmlnaW5hbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGFkZCA6IE5vZGVbXSA9IFtdO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB1c2VOZXdlcigpe1xuICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMobmV3ZXIhKTtcbiAgICAgICAgICAgICAgICBmb3IobGV0IG5vZGUgb2YgYWRkKXtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG9yaWdpbmFsKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBub2RlIG9mIGFzTm9kZXMob3JpZ2luYWwpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmKG9yaWdpbmFsICYmIG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCAmJiAobmV3ZXJEaXJlY3RpdmUuaWQgPT0gb3JpZ2luYWwuaWQoKSB8fCBuZXdlcktleSkpe1xuICAgICAgICAgICAgICAgIGFkZCA9IGFzTm9kZXMob3JpZ2luYWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZighb3JpZ2luYWwpe1xuICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5ld2VyIGluc3RhbmNlb2YgQ29tcG9uZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50ICYmIG9yaWdpbmFsLmlkKCkgPT0gbmV3ZXIuaWQoKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBvcmlnaW5hbC5jaGlsZHJlbiwgbmV3ZXIuY2hpbGRyZW4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbC5lbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZihvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBbcmVjb25jaWxlTm9kZXMob3JpZ2luYWwsIG5ld2VyKV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaCguLi5hZGQpO1xuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICAgICAgcmVwbGFjZW1lbnRJbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9BbGwgcmVtYWluaW5nIGtleXMgaW4gdGhlIG1hcCB3aWxsIG5vdCBoYXZlIGJlZW4gdXNlZC5cbiAgICBmb3IoY29uc3Qga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9yaWdpbmFsS2V5cykpe1xuICAgICAgICBjb25zdCBvcmlnaW5hbHMgPSBvcmlnaW5hbEtleXNba2V5XTtcbiAgICAgICAgZm9yKGxldCBvcmlnaW5hbCBvZiBvcmlnaW5hbHMpe1xuICAgICAgICAgICAgZm9yKGxldCBub2RlIG9mIGFzTm9kZXMob3JpZ2luYWwpKXtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaW5hbENoaWxkcmVuO1xufVxuXG5mdW5jdGlvbiBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKGxpc3QgOiBDaGlsZE5vZGVMaXN0TGlrZSkgOiBOb2RlT3JDb21wb25lbnRbXSB7XG4gICAgY29uc3QgcmVzdWx0IDogTm9kZU9yQ29tcG9uZW50W10gPSBbXTtcbiAgICBmb3IobGV0IGk9MDtpPGxpc3QubGVuZ3RoO2krKyl7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjaGlsZClcbiAgICAgICAgbGV0IGVuZCA6IE5vZGV8bnVsbCA9IG51bGxcbiAgICAgICAgaWYoZGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50U3RhcnQpe1xuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgOiBOb2RlW10gPSBbXTtcbiAgICAgICAgICAgIHdoaWxlKGkgPCBsaXN0Lmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViQ2hpbGQgPSBsaXN0W2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKHN1YkNoaWxkKVxuICAgICAgICAgICAgICAgIGlmKGNoaWxkQXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRFbmQgJiYgY2hpbGRBc0RpcmVjdGl2ZS5pZCA9PSBkaXJlY3RpdmUuaWQpe1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzdWJDaGlsZFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wdXNoKHN1YkNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZW5kID09IG51bGwpe1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiTWlzc2luZyBlbmQgdGFnIGZvciBjb21wb25lbnQgXCIgKyBkaXJlY3RpdmUuaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQucHVzaChuZXcgQ29tcG9uZW50KGRpcmVjdGl2ZSwgY2hpbGQsIGNvbXBvbmVudCwgZW5kKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjaGlsZClcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0S2V5c01hcChjaGlsZExpc3QgOiBOb2RlT3JDb21wb25lbnRbXSkgOiB7W2tleTpzdHJpbmddIDogQXJyYXk8Tm9kZU9yQ29tcG9uZW50Pn0ge1xuICAgIGNvbnN0IGtleXMgOiB7W2tleTpzdHJpbmddIDogQXJyYXk8Tm9kZU9yQ29tcG9uZW50Pn0gPSB7fTtcbiAgICBmb3IobGV0IGk9MDtpPGNoaWxkTGlzdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZExpc3RbaV1cbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0S2V5KGNoaWxkKVxuICAgICAgICBpZihrZXkgIT0gbnVsbCl7XG4gICAgICAgICAgICBsZXQgbGlzdCA9IGtleXNba2V5XVxuICAgICAgICAgICAgaWYoIWxpc3Qpe1xuICAgICAgICAgICAgICAgIGxpc3QgPSBrZXlzW2tleV0gPSBbXVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBnZXRLZXkoY2hpbGQgOiBOb2RlT3JDb21wb25lbnQpe1xuICAgIGNvbnN0IHRhcmdldCA9IGNoaWxkIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gY2hpbGQuc3RhcnQgOiBjaGlsZDtcbiAgICBpZih0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgIGNvbnN0IGtleSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuS2V5KTtcbiAgICAgICAgaWYoa2V5ICE9IG51bGwpe1xuICAgICAgICAgICAgcmV0dXJuIGtleVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG59IiwiaW1wb3J0IHtBdHRyaWJ1dGVOYW1lc30gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCb3VuZElucHV0KGJvdW5kSWQgOiBudW1iZXIsIHNlcnZlclNlZW4gOiBudW1iZXIsIHZhbHVlIDogYW55LCBzZXR0ZXIgOiAoaXQgOiBIVE1MRWxlbWVudCwgdmFsdWU6IGFueSk9PnZvaWQpe1xuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltcIisgQXR0cmlidXRlTmFtZXMuQm91bmQgK1wiPVxcXCJcIiArIGJvdW5kSWQgKyBcIlxcXCJdXCIpIGFzIEhUTUxFbGVtZW50fG51bGxcbiAgICBpZighaW5wdXQpeyByZXR1cm4gfVxuICAgIGxldCBzZWVuID0gKGlucHV0IGFzIGFueSkuYm91bmRTZWVuIHx8ICgoaW5wdXQgYXMgYW55KS5ib3VuZFNlZW49MClcbiAgICBpZihpbnB1dCAmJiBzZWVuIDw9IHNlcnZlclNlZW4pIHtcbiAgICAgICAgc2V0dGVyKGlucHV0LCB2YWx1ZSlcbiAgICB9XG59IiwiaW1wb3J0IHtzZW5kSWZFcnJvciwgc2VuZE1lc3NhZ2V9IGZyb20gXCIuL3NvY2tldFwiO1xuaW1wb3J0IHtyZWNvbmNpbGV9IGZyb20gXCIuL3JlY29uY2lsZVwiO1xuaW1wb3J0IHt1cGRhdGVCb3VuZElucHV0fSBmcm9tIFwiLi9ib3VuZFwiO1xuaW1wb3J0IHtTb2NrZXRTY29wZU5hbWVzfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlU2NyaXB0KHRhZyA6IHN0cmluZ3x1bmRlZmluZWQsIHNjb3BlIDogU2NvcGUsIHNjcmlwdCA6IHN0cmluZyl7XG4gICAgdHJ5IHtcbiAgICAgICAgc2NvcGUoc2NyaXB0KVxuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHNlbmRJZkVycm9yKGUsIHRhZywgc2NyaXB0LnN1YnN0cmluZygwLCAyNTYpKTtcbiAgICB9XG59XG5cbnR5cGUgU2NvcGUgPSAoc2NyaXB0OiBzdHJpbmcpPT52b2lkXG5leHBvcnQgZnVuY3Rpb24gbWFrZUV2YWxTY29wZShzY29wZSA6IE9iamVjdCkgOiBTY29wZSB7XG4gICAgY29uc3QgZmluYWwgPSB7Li4uYmFzZVNjb3BlLCAuLi5zY29wZX1cbiAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGZpbmFsKVxuICAgIGNvbnN0IHZhbHVlcyA9IG5hbWVzLm1hcCgobmFtZSkgPT4gKGZpbmFsIGFzIGFueSlbbmFtZV0pXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY3JpcHQgOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY29tcGlsZWQgPSBuZXcgRnVuY3Rpb24oLi4ubmFtZXMsIGByZXR1cm4gKGZ1bmN0aW9uKCl7XFxuJHtzY3JpcHR9XFxufSkoKWApXG4gICAgICAgIHJldHVybiBjb21waWxlZCguLi52YWx1ZXMpXG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgYmFzZVNjb3BlID0ge1xuICAgIFtTb2NrZXRTY29wZU5hbWVzLnJlY29uY2lsZV06cmVjb25jaWxlLFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnVwZGF0ZUJvdW5kSW5wdXRdOnVwZGF0ZUJvdW5kSW5wdXQsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZE1lc3NhZ2VdOnNlbmRNZXNzYWdlLFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnNlbmRJZkVycm9yXTpzZW5kSWZFcnJvclxufVxuIiwiaW1wb3J0IHtlcnJvckRpc3BsYXl9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtldmFsdWF0ZVNjcmlwdCwgbWFrZUV2YWxTY29wZX0gZnJvbSBcIi4vZXZhbFwiO1xuaW1wb3J0IHttZXNzYWdlVGFnRXJyb3JQcmVmaXgsIG1lc3NhZ2VUYWdTZXBhcmF0b3J9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHt3aGVuRG9jdW1lbnRSZWFkeX0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuXG5cbmxldCBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuY29uc3Qgc29ja2V0UmVhZHlRdWV1ZSA6IHN0cmluZ1tdID0gW107XG5sZXQgc29ja2V0IDogV2ViU29ja2V0O1xuXG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdFNvY2tldCgpe1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoKHdpbmRvdyBhcyBhbnkpLnNoYWRlRW5kcG9pbnQsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKVxuICAgIGlmKCh3aW5kb3cgYXMgYW55KS5zaGFkZUhvc3Qpe1xuICAgICAgICB1cmwuaG9zdCA9ICh3aW5kb3cgYXMgYW55KS5zaGFkZUhvc3Q7XG4gICAgfVxuICAgIHVybC5wcm90b2NvbCA9ICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgPyBcIndzczovL1wiIDogXCJ3czovL1wiKTtcbiAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybC5ocmVmKTtcbiAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGlkID0gKHdpbmRvdyBhcyBhbnkpLnNoYWRlSWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkIHdpdGggSUQgXCIgKyBpZCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIpO1xuICAgICAgICBzb2NrZXQuc2VuZChpZCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUgKHNvY2tldFJlYWR5UXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoc29ja2V0UmVhZHlRdWV1ZS5zaGlmdCgpISk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSAoZXZlbnQuZGF0YSBhcyBzdHJpbmcpO1xuICAgICAgICBjb25zdCBzcGxpdEluZGV4ID0gZGF0YS5pbmRleE9mKG1lc3NhZ2VUYWdTZXBhcmF0b3IpO1xuICAgICAgICBjb25zdCB0YWcgPSBkYXRhLnN1YnN0cmluZygwLCBzcGxpdEluZGV4KTtcbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZGF0YS5zdWJzdHJpbmcoc3BsaXRJbmRleCsxLCBkYXRhLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7fSlcbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGV2YWx1YXRlU2NyaXB0KHRhZywgc2NvcGUsIHNjcmlwdClcbiAgICAgICAgfSlcbiAgICB9O1xuICAgIGxldCBlcnJvclRyaWdnZXJlZCA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIGVycm9yUmVsb2FkKCl7XG4gICAgICAgIGlmKGVycm9yVHJpZ2dlcmVkKXsgcmV0dXJuOyB9XG4gICAgICAgIGVycm9yVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgbGFzdFJlbG9hZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIpO1xuICAgICAgICBpZihsYXN0UmVsb2FkKXtcbiAgICAgICAgICAgIGVycm9yRGlzcGxheShcIlRoaXMgd2ViIHBhZ2UgY291bGQgbm90IGNvbm5lY3QgdG8gaXRzIHNlcnZlci4gUGxlYXNlIHJlbG9hZCBvciB0cnkgYWdhaW4gbGF0ZXIuXCIpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgU29ja2V0IGNsb3NlZDogJHtldnQucmVhc29ufSwgJHtldnQud2FzQ2xlYW59YCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gZmFsc2U7XG4gICAgICAgIGlmIChldnQud2FzQ2xlYW4pe1xuICAgICAgICAgICAgLy9jb25uZWN0U29ja2V0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dH1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICB9O1xuXG4gICAgc2V0SW50ZXJ2YWwoKCk9PntcbiAgICAgICAgaWYoc29ja2V0UmVhZHkpe1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoXCJcIilcbiAgICAgICAgfVxuICAgIH0sIDYwKjEwMDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VuZE1lc3NhZ2UoaWQgOiBzdHJpbmcsIG1zZyA6IHN0cmluZ3x1bmRlZmluZWR8bnVsbCkge1xuICAgIGNvbnN0IGZpbmFsTXNnID0gKG1zZyAhPT0gdW5kZWZpbmVkICYmIG1zZyAhPT0gbnVsbCkgPyBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3IgKyBtc2cgOiBpZCArIG1lc3NhZ2VUYWdTZXBhcmF0b3I7XG4gICAgc2VuZE9yUXVldWUoZmluYWxNc2cpO1xufVxuXG5mdW5jdGlvbiBzZW5kT3JRdWV1ZShmaW5hbE1zZyA6IHN0cmluZyl7XG4gICAgaWYgKHNvY2tldFJlYWR5KSB7XG4gICAgICAgIHNvY2tldC5zZW5kKGZpbmFsTXNnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzb2NrZXRSZWFkeVF1ZXVlLnB1c2goZmluYWxNc2cpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRJZkVycm9yKGVycm9yIDogdW5rbm93biwgdGFnPzogc3RyaW5nLCBldmFsVGV4dCA/OiBzdHJpbmcpe1xuICAgIGNvbnN0IGRhdGEgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8ge1xuICAgICAgICBuYW1lOiBlcnJvci5uYW1lLFxuICAgICAgICBqc01lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrIDogZXJyb3Iuc3RhY2ssXG4gICAgICAgIGV2YWw6IGV2YWxUZXh0LFxuICAgICAgICB0YWc6IHRhZ1xuICAgIH0gOiB7XG4gICAgICAgIG5hbWU6IFwiVW5rbm93blwiLFxuICAgICAgICBqc01lc3NhZ2U6IFwiVW5rbm93biBlcnJvcjogXCIgKyBlcnJvcixcbiAgICAgICAgc3RhY2s6IFwiXCIsXG4gICAgICAgIGV2YWw6IGV2YWxUZXh0LFxuICAgICAgICB0YWc6IHRhZ1xuICAgIH07XG4gICAgc2VuZE9yUXVldWUoYCR7bWVzc2FnZVRhZ0Vycm9yUHJlZml4fSR7dGFnID09IHVuZGVmaW5lZCA/IFwiXCIgOiB0YWd9JHttZXNzYWdlVGFnU2VwYXJhdG9yfWAgKyBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbiIsImltcG9ydCB7Y29ubmVjdFNvY2tldCwgc2VuZElmRXJyb3J9IGZyb20gXCIuL3NvY2tldFwiO1xuaW1wb3J0IHtlcnJvckRpc3BsYXl9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHt3aGVuRG9jdW1lbnRSZWFkeX0gZnJvbSBcIi4vdXRpbGl0eVwiO1xuaW1wb3J0IHthZGRBbGxEaXJlY3RpdmVzfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5cbmlmKCEod2luZG93IGFzIGFueSkuc2hhZGUpe1xuICAgICh3aW5kb3cgYXMgYW55KS5zaGFkZSA9IHt9O1xuICAgIGlmKCF3aW5kb3cuV2ViU29ja2V0KXtcbiAgICAgICAgZXJyb3JEaXNwbGF5KFwiWW91ciB3ZWIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhpcyBwYWdlLCBhbmQgaXQgbWF5IG5vdCBmdW5jdGlvbiBjb3JyZWN0bHkgYXMgYSByZXN1bHQuIFVwZ3JhZGUgeW91ciB3ZWIgYnJvd3Nlci5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29ubmVjdFNvY2tldCgpO1xuXG4gICAgICAgIHdoZW5Eb2N1bWVudFJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBhZGRBbGxEaXJlY3RpdmVzKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClcbiAgICAgICAgfSlcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihldmVudDogRXJyb3JFdmVudCl7XG4gICAgICAgICAgICBzZW5kSWZFcnJvcihldmVudC5lcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgZnVuY3Rpb24oZXZlbnQgOiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpe1xuICAgICAgICAgICAgc2VuZElmRXJyb3IoZXZlbnQucmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdLCJuYW1lcyI6WyJEaXJlY3RpdmVUeXBlIiwiQXR0cmlidXRlTmFtZXMiLCJTb2NrZXRTY29wZU5hbWVzIiwiaWQiLCJvcmlnaW5hbHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLFdBQVMsYUFBYSxTQUFpQjtBQUMxQyxVQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsY0FBVSxZQUFZLG9YQUFvWCxVQUFXO0FBQ3JaLGFBQVMsS0FBSyxZQUFZLFNBQVM7QUFDbkMsYUFBUyxlQUFlLFlBQVksRUFBRyxpQkFBaUIsU0FBUyxXQUFVO0FBQ3ZFLFlBQU0sSUFBSSxTQUFTLGVBQWUsWUFBWTtBQUM5QyxRQUFFLFdBQVksWUFBWSxDQUFDO0FBQUEsSUFDL0IsQ0FBQztBQUFBLEVBQ0w7QUNOTyxNQUFLLGtDQUFBQSxtQkFBTDtBQUNIQSxtQkFBQSxTQUFBLElBQVU7QUFDVkEsbUJBQUEsY0FBQSxJQUFlO0FBQ2ZBLG1CQUFBLGNBQUEsSUFBZTtBQUNmQSxtQkFBQSxnQkFBQSxJQUFpQjtBQUNqQkEsbUJBQUEsY0FBQSxJQUFlO0FBQ2ZBLG1CQUFBLGVBQUEsSUFBZ0I7QUFOUixXQUFBQTtBQUFBQSxFQUFBLEdBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBUUwsTUFBSyxtQ0FBQUMsb0JBQUw7QUFDSEEsb0JBQUEsZUFBQSxJQUFnQjtBQUNoQkEsb0JBQUEsd0JBQUEsSUFBeUI7QUFDekJBLG9CQUFBLGVBQUEsSUFBZ0I7QUFDaEJBLG9CQUFBLGtCQUFBLElBQW1CO0FBQ25CQSxvQkFBQSxrQkFBQSxJQUFtQjtBQUNuQkEs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
