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
    const applicable = Array.from(target.querySelectorAll(
      `:scope > ${baseQueryIsSetAttributeDirective}:not([${AttributeNames.TargetSiblingDirective}])`
    ));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGUtYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi90eXBlc2NyaXB0L3NyYy9lcnJvcnMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9jb25zdGFudHMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy91dGlsaXR5LnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvYXR0cmlidXRlcy50cyIsIi4uLy4uL3R5cGVzY3JpcHQvc3JjL2FwcGx5anMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9kaXJlY3RpdmVzLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvcmVjb25jaWxlLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvYm91bmQudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9ldmFsLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvc29ja2V0LnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvc2hhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGVycm9yRGlzcGxheShjb250ZW50IDogc3RyaW5nKXtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgICsgXCI8L3A+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhZGVDbG9zZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKSE7XG4gICAgICAgIG0ucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQobSk7XG4gICAgfSk7XG59IiwiLy9DaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIG1pcnJvcmVkIGluIENsaWVudENvbnN0YW50cy5rdFxuXG5leHBvcnQgZW51bSBEaXJlY3RpdmVUeXBlIHtcbiAgICBBcHBseUpzID0gXCJqXCIsXG4gICAgU2V0QXR0cmlidXRlID0gXCJhXCIsXG4gICAgRXZlbnRIYW5kbGVyID0gXCJlXCIsXG4gICAgQ29tcG9uZW50U3RhcnQgPSBcInNcIixcbiAgICBDb21wb25lbnRFbmQgPSBcImZcIixcbiAgICBDb21wb25lbnRLZWVwID0gXCJrXCJcbn1cbmV4cG9ydCBlbnVtIEF0dHJpYnV0ZU5hbWVzIHtcbiAgICBEaXJlY3RpdmVUeXBlID0gXCJkYXRhLXNcIixcbiAgICBUYXJnZXRTaWJsaW5nRGlyZWN0aXZlID0gXCJkYXRhLWZcIixcbiAgICBBcHBseUpzU2NyaXB0ID0gXCJkYXRhLXRcIixcbiAgICBBcHBseUpzUnVuT3B0aW9uID0gXCJkYXRhLXJcIixcbiAgICBTZXRBdHRyaWJ1dGVOYW1lID0gXCJkYXRhLWFcIixcbiAgICBTZXRBdHRyaWJ1dGVWYWx1ZSA9IFwiZGF0YS12XCIsXG4gICAgS2V5ID0gXCJkYXRhLWtcIixcbiAgICBFdmVudE5hbWUgPSBcImRhdGEtZVwiLFxuICAgIEV2ZW50Q2FsbGJhY2tJZCA9IFwiZGF0YS1pXCIsXG4gICAgRXZlbnRQcmVmaXggPSBcImRhdGEtcFwiLFxuICAgIEV2ZW50U3VmZml4ID0gXCJkYXRhLXhcIixcbiAgICBFdmVudERhdGEgPSBcImRhdGEtZFwiLFxuICAgIEJvdW5kID0gXCJkYXRhLWJcIixcbiAgICBDaGVja2JveCA9IFwiZGF0YS1jXCJcbn1cblxuZXhwb3J0IGNvbnN0IHNjcmlwdFR5cGVTaWduaWZpZXIgPSBcInNoYWRlXCJcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZFByZWZpeCA9IFwic2hhZGVcIlxuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkRW5kU3VmZml4ID0gXCJlXCJcblxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdTZXBhcmF0b3IgPSBcInxcIlxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdFcnJvclByZWZpeCA9IFwiRVwiXG5cbmV4cG9ydCBlbnVtIFNvY2tldFNjb3BlTmFtZXMge1xuICAgIHJlY29uY2lsZSA9IFwiclwiLFxuICAgIHVwZGF0ZUJvdW5kSW5wdXQgPSBcImJcIixcbiAgICBzZW5kTWVzc2FnZSA9IFwic1wiLFxuICAgIHNlbmRJZkVycm9yID0gXCJxXCJcbn0iLCJleHBvcnQgZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQodGFyZ2V0IDogRWxlbWVudCwgc2VsZWN0b3IgOiBzdHJpbmcpOiBFbGVtZW50W10ge1xuICAgIGNvbnN0IGJlbG93ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgaWYodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKXtcbiAgICAgICAgcmV0dXJuIFt0YXJnZXQsIC4uLmJlbG93XVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJlbG93KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5Eb2N1bWVudFJlYWR5KGZuIDogKCk9PnZvaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiaW50ZXJhY3RpdmVcIikge1xuICAgICAgICBmbigpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZm4pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7U29ja2V0U2NvcGVOYW1lc30gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge2V2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQge0FkZGVkVGFyZ2V0SW5mbywgRXZlbnRIYW5kbGVyLCBUYXJnZXRJbmZvfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5cbmludGVyZmFjZSBFdmVudFByZXZpb3VzIHtcbiAgICBldmVudE5hbWU6IHN0cmluZyxcbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lclxuICAgIHRhcmdldDogSFRNTEVsZW1lbnRcbn1cblxuZXhwb3J0IGxldCBzdXBwcmVzc0V2ZW50RmlyaW5nID0ge3N1cHByZXNzOiBmYWxzZX07XG5cbmNvbnN0IGV2ZW50UHJldmlvdXMgPSBTeW1ib2woKVxuaW50ZXJmYWNlIEhhc1ByZXZpb3VzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIFtldmVudFByZXZpb3VzXT86IEV2ZW50UHJldmlvdXNcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUgOiBFdmVudEhhbmRsZXIsIGluZm8gOiBBZGRlZFRhcmdldEluZm8pe1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KVxuICAgIGNvbnN0IHByZWZpeCA9IGRpcmVjdGl2ZS5wcmVmaXggPyBgJHtkaXJlY3RpdmUucHJlZml4fTtcXG5gIDogXCJcIlxuICAgIGNvbnN0IGRhdGEgPSBkaXJlY3RpdmUuZGF0YSA/IGAsSlNPTi5zdHJpbmdpZnkoJHtkaXJlY3RpdmUuZGF0YX0pYCA6IFwiXCJcbiAgICBjb25zdCBzdWZmaXggPSBkaXJlY3RpdmUuc3VmZml4ID8gYDtcXG4ke2RpcmVjdGl2ZS5zdWZmaXh9YCA6IFwiXCJcbiAgICBjb25zdCBzY3JpcHQgPSBgJHtwcmVmaXh9JHtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlfSgke2RpcmVjdGl2ZS5jYWxsYmFja0lkfSR7ZGF0YX0pJHtzdWZmaXh9YFxuICAgIGNvbnN0IGxpc3RlbmVyIDogRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHRoaXMgOiBFdmVudExpc3RlbmVyLCBlIDogRXZlbnQpe1xuICAgICAgICBpZihzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzKXsgcmV0dXJuIH1cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHtcbiAgICAgICAgICAgIGV2ZW50OiBlLFxuICAgICAgICAgICAgZTogZSxcbiAgICAgICAgICAgIGl0OiBlLnRhcmdldFxuICAgICAgICB9KVxuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBzY3JpcHQpXG4gICAgfVxuICAgIGluZm8udGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZGlyZWN0aXZlLmV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIChpbmZvLmVsZW1lbnQgYXMgSGFzUHJldmlvdXMpW2V2ZW50UHJldmlvdXNdID0ge1xuICAgICAgICBldmVudE5hbWU6IGRpcmVjdGl2ZS5ldmVudE5hbWUsXG4gICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlIDogRXZlbnRIYW5kbGVyLCBpbmZvIDogVGFyZ2V0SW5mbyl7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBwcmV2aW91cyA9IChlbGVtZW50IGFzIEhhc1ByZXZpb3VzKVtldmVudFByZXZpb3VzXVxuICAgIGlmKHByZXZpb3VzKXtcbiAgICAgICAgcHJldmlvdXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJldmlvdXMuZXZlbnROYW1lLCBwcmV2aW91cy5saXN0ZW5lcilcbiAgICB9XG59IiwiaW1wb3J0IHtBZGRlZFRhcmdldEluZm8sIGFzU2hhZGVEaXJlY3RpdmUsIFNldEF0dHJpYnV0ZX0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllcn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge3N1cHByZXNzRXZlbnRGaXJpbmd9IGZyb20gXCIuL2V2ZW50c1wiO1xuXG5cbi8vV2UgbmVlZCBzb21lIHdheSBvZiBzdG9yaW5nIHRoZSBvcmlnaW5hbCB2YWx1ZXMgb2YgYW4gYXR0cmlidXRlIGJlZm9yZSBhbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHdhcyBhcHBsaWVkLFxuLy9pbiBjYXNlIHRoYXQgZGlyZWN0aXZlIGlzIHJlbW92ZWQgaW4gYW4gdXBkYXRlIHRoYXQgZG9lcyBub3QgcmVzZXQgYW4gZWxlbWVudCdzIGF0dHJpYnV0ZXMuXG5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKClcbmludGVyZmFjZSBPcmlnaW5hbEF0dHJpYnV0ZVZhbHVlRG9tIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10/IDogQXR0cmlidXRlT3JpZ2luYWxNYXBcbn1cbmludGVyZmFjZSBBdHRyaWJ1dGVPcmlnaW5hbE1hcCB7XG4gICAgW25hbWU6IHN0cmluZ106c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBvcmlnaW5hbE1hcCA9IChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXVxuICAgIGlmKG9yaWdpbmFsTWFwKXtcbiAgICAgICAgZGVsZXRlIChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQoZWxlbWVudCk7XG4gICAgfVxufVxuZnVuY3Rpb24gbm90ZU9yaWdpbmFsQXR0cmlidXRlKGVsZW1lbnQgOiBIVE1MRWxlbWVudCwgbmFtZSA6IHN0cmluZyl7XG4gICAgbGV0IG9yaWdpbmFscyA9IChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZighb3JpZ2luYWxzKXtcbiAgICAgICAgb3JpZ2luYWxzID0gKGVsZW1lbnQgYXMgT3JpZ2luYWxBdHRyaWJ1dGVWYWx1ZURvbSlbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdID0ge307XG4gICAgfVxuICAgIGlmKCEobmFtZSBpbiBvcmlnaW5hbHMpKXtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuXG5cbmNvbnN0IGlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYFske0F0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGV9PSR7RGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGV9XWA7XG5jb25zdCBiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSA9IGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XSR7aXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmV9YDtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0IDogSFRNTEVsZW1lbnQpe1xuICAgIC8vRmlyc3QsIGZpbmQgYWxsIFNldEF0dHJpYnV0ZSBkaXJlY3RpdmVzIHRoYXQgYXBwbHkgdG8gdGFyZ2V0OiBpdHMgb3duIGNoaWxkcmVuIChvdGhlciB0aGFuIHRob3NlIHRhcmdldGluZyBhXG4gICAgLy9zaWJsaW5nIG9mIHRoZWlycyksIHRoZW4gdGhlIGRpcmVjdGl2ZXMgZm9sbG93aW5nIGl0IHRoYXQgdGFyZ2V0IGl0IGFzIHRoZWlyIHNpYmxpbmdcbiAgICBjb25zdCBhcHBsaWNhYmxlID0gQXJyYXkuZnJvbSh0YXJnZXQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgYDpzY29wZSA+ICR7YmFzZVF1ZXJ5SXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmV9Om5vdChbJHtBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlfV0pYCkpO1xuICAgIGxldCBjdXJyZW50IDogSFRNTEVsZW1lbnR8bnVsbCA9IHRhcmdldFxuICAgIHdoaWxlKHRydWUpe1xuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmKCFjdXJyZW50IHx8ICFjdXJyZW50Lm1hdGNoZXMoYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dWyR7QXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZX1dYCkpe1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBhcHBsaWNhYmxlLnB1c2goY3VycmVudCk7XG4gICAgfVxuICAgIC8vTmV4dCwgZ3JvdXAgdGhlbSBieSB0aGUgYXR0cmlidXRlIHRoZXkgYXBwbHkgdG9cbiAgICBjb25zdCBieUF0dHJpYnV0ZU5hbWUgOiB7W25hbWU6IHN0cmluZ106U2V0QXR0cmlidXRlW119ID0ge31cbiAgICBmb3IobGV0IGVsIG9mIGFwcGxpY2FibGUpe1xuICAgICAgICBjb25zdCBhc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWwpO1xuICAgICAgICBpZihhc0RpcmVjdGl2ZSAmJiBhc0RpcmVjdGl2ZSBpbnN0YW5jZW9mIFNldEF0dHJpYnV0ZSl7XG4gICAgICAgICAgICBsZXQgYXJyYXkgPSBieUF0dHJpYnV0ZU5hbWVbYXNEaXJlY3RpdmUubmFtZV07XG4gICAgICAgICAgICBpZighYXJyYXkpe1xuICAgICAgICAgICAgICAgIGFycmF5ID0gYnlBdHRyaWJ1dGVOYW1lW2FzRGlyZWN0aXZlLm5hbWVdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcnJheS5wdXNoKGFzRGlyZWN0aXZlKVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vTm93LCBhcHBseSBvbmx5IHRoZSBsYXN0IGRpcmVjdGl2ZSBmb3IgZXZlcnkgYXR0cmlidXRlXG4gICAgZm9yKGxldCBhdHRyaWJ1dGUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYnlBdHRyaWJ1dGVOYW1lKSl7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSBieUF0dHJpYnV0ZU5hbWVbYXR0cmlidXRlXTtcbiAgICAgICAgY29uc3QgbGFzdCA9IGRpcmVjdGl2ZXNbZGlyZWN0aXZlcy5sZW5ndGggLSAxXSEhXG5cbiAgICAgICAgbm90ZU9yaWdpbmFsQXR0cmlidXRlKHRhcmdldCwgbGFzdC5uYW1lKTtcbiAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQsIGxhc3QubmFtZSwgbGFzdC52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy9GaW5hbGx5LCByZXN0b3JlIHRoZSBvcmlnaW5hbCB2YWx1ZXMgZm9yIGFueSBhdHRyaWJ1dGVzIHRoYXQgbm8gbG9uZ2VyIGhhdmUgZGlyZWN0aXZlc1xuICAgIGNvbnN0IG9yaWdpbmFscyA9ICh0YXJnZXQgYXMgT3JpZ2luYWxBdHRyaWJ1dGVWYWx1ZURvbSlbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdIHx8IHt9O1xuICAgIGZvcihsZXQgb3JpZ2luYWwgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxzKSl7XG4gICAgICAgIGlmKCFieUF0dHJpYnV0ZU5hbWVbb3JpZ2luYWxdKXtcbiAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUodGFyZ2V0LCBvcmlnaW5hbCwgb3JpZ2luYWxzW29yaWdpbmFsXSk7XG4gICAgICAgICAgICBkZWxldGUgb3JpZ2luYWxzW29yaWdpbmFsXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5sZXQgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyA6IFNldDxIVE1MRWxlbWVudD4gPSBuZXcgU2V0KCk7XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKGNiIDogKCk9PnZvaWQpe1xuICAgIHRyeSB7XG4gICAgICAgIGNiKClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBmb3IobGV0IHRhcmdldCBvZiB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzKXtcbiAgICAgICAgICAgIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0KVxuICAgICAgICB9XG4gICAgICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgPSBuZXcgU2V0KCk7XG4gICAgfVxufVxuXG5jb25zdCBzZXRBdHRyaWJ1dGVUYXJnZXQgPSBTeW1ib2woKTtcbmludGVyZmFjZSBTZXRBdHRyaWJ1dGVEb20ge1xuICAgIFtzZXRBdHRyaWJ1dGVUYXJnZXRdPzogSFRNTEVsZW1lbnRcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGluZm8gOiBBZGRlZFRhcmdldEluZm8pe1xuICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKGluZm8udGFyZ2V0KTtcbiAgICAoPFNldEF0dHJpYnV0ZURvbT5pbmZvLmVsZW1lbnQpW3NldEF0dHJpYnV0ZVRhcmdldF0gPSBpbmZvLnRhcmdldFxufVxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCB0YXJnZXQgPSAoPFNldEF0dHJpYnV0ZURvbT5lbGVtZW50KVtzZXRBdHRyaWJ1dGVUYXJnZXRdXG4gICAgaWYodGFyZ2V0KXtcbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQodGFyZ2V0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUF0dHJpYnV0ZVZhbHVlKHRhcmdldCA6IEhUTUxFbGVtZW50LCBuYW1lIDogc3RyaW5nLCB2YWx1ZSA6IHN0cmluZ3xudWxsKXtcbiAgICBpZih2YWx1ZSA9PSBudWxsKXtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKVxuICAgIH1cbiAgICBpZih0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmIChuYW1lID09IFwidmFsdWVcIiB8fCBuYW1lID09IFwiY2hlY2tlZFwiKSl7XG4gICAgICAgIC8vVGhlc2Ugc3BlY2lhbCB2YWx1ZXMgaGF2ZSBlZmZlY3RzIG9ubHkgb24gdGhlIFwiaW5pdGlhbFwiIGluc2VydGlvbiBvZiBhIERPTSBvYmplY3Q7XG4gICAgICAgIC8vZm9yIGNvbnNpc3RlbmN5IHdlIGFsd2F5cyBhcHBseSB0aGVzZSBlZmZlY3RzXG4gICAgICAgIGlmKG5hbWUgPT0gXCJ2YWx1ZVwiICYmIHRhcmdldC52YWx1ZSAhPSB2YWx1ZSl7XG4gICAgICAgICAgICBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQsICgpPT57XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnZhbHVlID0gdmFsdWUgPz8gXCJcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmKG5hbWUgPT0gXCJjaGVja2VkXCIgJiYgdGFyZ2V0LmNoZWNrZWQgIT0gKHZhbHVlICE9IG51bGwpKXtcbiAgICAgICAgICAgIHN1cHByZXNzQ2hhbmdlTGlzdGVuZXJzKHRhcmdldCwgKCk9PntcbiAgICAgICAgICAgICAgICB0YXJnZXQuY2hlY2tlZCA9IHZhbHVlICE9IG51bGxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgSFRNTE9wdGlvbkVsZW1lbnQgJiYgbmFtZSA9PSBcInNlbGVjdGVkXCIgJiYgdGFyZ2V0LnNlbGVjdGVkICE9ICh2YWx1ZSAhPSBudWxsKSl7XG4gICAgICAgIHRhcmdldC5zZWxlY3RlZCA9IHZhbHVlICE9IG51bGxcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN1cHByZXNzQ2hhbmdlTGlzdGVuZXJzKHRhcmdldCA6IEhUTUxJbnB1dEVsZW1lbnQsIGNiIDogKCk9PnZvaWQpe1xuICAgIHN1cHByZXNzRXZlbnRGaXJpbmcuc3VwcHJlc3MgPSB0cnVlXG4gICAgY29uc3Qgb2xkT25DaGFuZ2UgPSB0YXJnZXQub25jaGFuZ2VcbiAgICB0YXJnZXQub25jaGFuZ2UgPSBudWxsXG4gICAgdHJ5IHtcbiAgICAgICAgY2IoKVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRhcmdldC5vbmNoYW5nZSA9IG9sZE9uQ2hhbmdlXG4gICAgICAgIHN1cHByZXNzRXZlbnRGaXJpbmcuc3VwcHJlc3MgPSBmYWxzZVxuICAgIH1cbn0iLCJpbXBvcnQge2V2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQge0FkZGVkVGFyZ2V0SW5mbywgQXBwbHlKc30gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuXG5pbnRlcmZhY2UgU2NyaXB0UHJldmlvdXMge1xuICAgIGpzIDogc3RyaW5nXG4gICAgdGFyZ2V0IDogSFRNTEVsZW1lbnRcbn1cbmNvbnN0IHNjcmlwdFByZXZpb3VzID0gU3ltYm9sKClcbmludGVyZmFjZSBIYXNTY3JpcHRQcmV2aW91cyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICBbc2NyaXB0UHJldmlvdXNdPyA6IFNjcmlwdFByZXZpb3VzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5FbGVtZW50U2NyaXB0KGRpcmVjdGl2ZSA6IEFwcGx5SnMsIGluZm8gOiBBZGRlZFRhcmdldEluZm8pe1xuICAgIGNvbnN0IG9sZCA9IChpbmZvLmVsZW1lbnQgYXMgSGFzU2NyaXB0UHJldmlvdXMpW3NjcmlwdFByZXZpb3VzXVxuICAgIGlmKCFkaXJlY3RpdmUub25seU9uQ3JlYXRlIHx8ICFvbGQgfHwgb2xkLmpzICE9IGRpcmVjdGl2ZS5qcyB8fCBvbGQudGFyZ2V0ICE9IGluZm8udGFyZ2V0KXtcbiAgICAgICAgKGluZm8uZWxlbWVudCBhcyBIYXNTY3JpcHRQcmV2aW91cylbc2NyaXB0UHJldmlvdXNdID0ge1xuICAgICAgICAgICAganM6IGRpcmVjdGl2ZS5qcyxcbiAgICAgICAgICAgIHRhcmdldDogaW5mby50YXJnZXRcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaXQgPSBpbmZvLnRhcmdldDtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHtcbiAgICAgICAgICAgIGl0XG4gICAgICAgIH0pXG4gICAgICAgIGV2YWx1YXRlU2NyaXB0KHVuZGVmaW5lZCwgc2NvcGUsIGRpcmVjdGl2ZS5qcylcbiAgICB9XG59IiwiaW1wb3J0IHtBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRFbmRTdWZmaXgsIGNvbXBvbmVudElkUHJlZml4LCBEaXJlY3RpdmVUeXBlLCBzY3JpcHRUeXBlU2lnbmlmaWVyfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7cXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXR9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7Y2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlLCBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlfSBmcm9tIFwiLi9hdHRyaWJ1dGVzXCI7XG5pbXBvcnQge3J1bkVsZW1lbnRTY3JpcHR9IGZyb20gXCIuL2FwcGx5anNcIjtcbmltcG9ydCB7cmVtb3ZlRXZlbnRIYW5kbGVyLCBzZXR1cEV2ZW50SGFuZGxlcn0gZnJvbSBcIi4vZXZlbnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRTdGFydCB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGlkIDogc3RyaW5nKXt9XG59XG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RW5kIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQgOiBzdHJpbmcpe31cbn1cbmV4cG9ydCBjbGFzcyBLZWVwIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQgOiBzdHJpbmcpe31cbn1cblxuZXhwb3J0IGNsYXNzIFNldEF0dHJpYnV0ZSB7XG4gICAgY29uc3RydWN0b3IocHVibGljIG5hbWUgOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZSA6IHN0cmluZ3xudWxsKXt9XG59XG5cbmV4cG9ydCBjbGFzcyBBcHBseUpzIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMganMgOiBzdHJpbmcsIHB1YmxpYyBvbmx5T25DcmVhdGUgOiBib29sZWFuKXt9XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgZXZlbnROYW1lIDogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgY2FsbGJhY2tJZCA6IG51bWJlcixcbiAgICAgICAgcHVibGljIHByZWZpeCA6IHN0cmluZ3xudWxsLFxuICAgICAgICBwdWJsaWMgc3VmZml4IDogc3RyaW5nfG51bGwsXG4gICAgICAgIHB1YmxpYyBkYXRhIDogc3RyaW5nfG51bGxcbiAgICApe31cbn1cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZSA9IENvbXBvbmVudFN0YXJ0IHwgQ29tcG9uZW50RW5kIHwgS2VlcCB8IEFwcGx5SnMgfCBTZXRBdHRyaWJ1dGUgfCBFdmVudEhhbmRsZXJcbmV4cG9ydCBmdW5jdGlvbiBhc1NoYWRlRGlyZWN0aXZlKGNoaWxkIDogTm9kZSkgOiBEaXJlY3RpdmV8bnVsbCB7XG4gICAgaWYoY2hpbGQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBjaGlsZC50YWdOYW1lID09IFwiU0NSSVBUXCIgJiYgY2hpbGQuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSA9PT0gc2NyaXB0VHlwZVNpZ25pZmllcil7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZVR5cGUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRGlyZWN0aXZlVHlwZSlcbiAgICAgICAgY29uc3QgaWQgPSBjaGlsZC5pZFxuICAgICAgICBzd2l0Y2goZGlyZWN0aXZlVHlwZSl7XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQXBwbHlKczpcbiAgICAgICAgICAgICAgICBjb25zdCBydW5PcHRpb24gPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuQXBwbHlKc1J1bk9wdGlvbilcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuQXBwbHlKc1NjcmlwdCkhIVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXBwbHlKcyhzY3JpcHQsIHJ1bk9wdGlvbiA9PT0gXCIxXCIpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50U3RhcnQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRTdGFydChpZC5zdWJzdHJpbmcoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSlcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRFbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRFbmQoaWQuc3Vic3RyaW5nKGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCwgaWQubGVuZ3RoIC0gY29tcG9uZW50SWRFbmRTdWZmaXgubGVuZ3RoKSlcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5Db21wb25lbnRLZWVwOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgS2VlcChpZC5zdWJzdHJpbmcoY29tcG9uZW50SWRQcmVmaXgubGVuZ3RoKSlcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGU6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlNldEF0dHJpYnV0ZU5hbWUpISFcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVWYWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuRXZlbnRIYW5kbGVyOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudE5hbWUpISFcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9ICtjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRDYWxsYmFja0lkKSEhXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50UHJlZml4KVxuICAgICAgICAgICAgICAgIGNvbnN0IHN1ZmZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFN1ZmZpeClcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50RGF0YSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEV2ZW50SGFuZGxlcihuYW1lLCBpZCwgcHJlZml4LCBzdWZmaXgsIGRhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEFsbERpcmVjdGl2ZXMoYmFzZSA6IEhUTUxFbGVtZW50KSB7XG4gICAgY2hhbmdpbmdEaXJlY3RpdmVzKCgpPT57XG4gICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKGJhc2UpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KHNjcmlwdCA6IEhUTUxFbGVtZW50KSA6IEhUTUxFbGVtZW50fG51bGwge1xuICAgIGlmKHNjcmlwdC5oYXNBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuVGFyZ2V0U2libGluZ0RpcmVjdGl2ZSkpe1xuICAgICAgICBsZXQgdGFyZ2V0IDogRWxlbWVudHxudWxsID0gc2NyaXB0XG4gICAgICAgIHdoaWxlKHRhcmdldCAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKXtcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldCBhcyAoSFRNTEVsZW1lbnR8bnVsbClcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NyaXB0LnBhcmVudEVsZW1lbnQhIVxuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXJnZXRJbmZvIHtcbiAgICBlbGVtZW50IDogSFRNTEVsZW1lbnRcbiAgICBkaXJlY3RpdmUgOiBEaXJlY3RpdmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgQWRkZWRUYXJnZXRJbmZvIGV4dGVuZHMgVGFyZ2V0SW5mbyB7XG4gICAgdGFyZ2V0IDogSFRNTEVsZW1lbnRcbn1cblxubGV0IGNoYW5nZWREaXJlY3RpdmVzIDogVGFyZ2V0SW5mb1tdID0gW107XG5sZXQgcmVtb3ZlZERpcmVjdGl2ZXMgOiBUYXJnZXRJbmZvW10gPSBbXTtcbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2luZ0RpcmVjdGl2ZXMoY2IgOiAoKT0+dm9pZCl7XG4gICAgY2hhbmdpbmdBdHRyaWJ1dGVEaXJlY3RpdmVzKCgpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYigpXG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBmb3IobGV0IGNoYW5nZWQgb2YgY2hhbmdlZERpcmVjdGl2ZXMpe1xuICAgICAgICAgICAgICAgIG9uQWRkZWRPclVwZGF0ZWQoY2hhbmdlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IobGV0IHJlbW92ZWQgb2YgcmVtb3ZlZERpcmVjdGl2ZXMpe1xuICAgICAgICAgICAgICAgIG9uUmVtb3ZlZChyZW1vdmVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hhbmdlZERpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgICAgIHJlbW92ZWREaXJlY3RpdmVzID0gW107XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgYW4gZWxlbWVudCBhbmQgYWxsIGl0cyBjaGlsZHJlbiB0aGF0IGhhdmUganVzdCBiZWVuIGFkZGVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZUFkZChlbGVtZW50IDogTm9kZSl7XG4gICAgaWYoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcbiAgICAgICAgZm9yKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpe1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShzY3JpcHQpXG4gICAgICAgICAgICBpZihzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpe1xuICAgICAgICAgICAgICAgIGNoYW5nZWREaXJlY3RpdmVzLnB1c2goe2RpcmVjdGl2ZSwgZWxlbWVudDogc2NyaXB0fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIGFuZCByZWNvcmRzIHdoZXRoZXIgYW4gZWxlbWVudCB0aGF0IGNoYW5nZWQgaXMgYSBzY3JpcHQgZGlyZWN0aXZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZUNoYW5nZShlbGVtZW50IDogSFRNTEVsZW1lbnQpe1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoZWxlbWVudClcbiAgICBpZihkaXJlY3RpdmUpe1xuICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHtkaXJlY3RpdmUsIGVsZW1lbnR9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiByZW1vdmVkIGZvciBzaGFkZSBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RpcmVjdGl2ZVJlbW92ZShlbGVtZW50IDogTm9kZSl7XG4gICAgaWYoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcbiAgICAgICAgZm9yKGxldCBzY3JpcHQgb2YgcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQoZWxlbWVudCwgYHNjcmlwdFt0eXBlPSR7c2NyaXB0VHlwZVNpZ25pZmllcn1dYCkpe1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShzY3JpcHQpXG4gICAgICAgICAgICBpZihzY3JpcHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBkaXJlY3RpdmUpe1xuICAgICAgICAgICAgICAgIHJlbW92ZWREaXJlY3RpdmVzLnB1c2goe2RpcmVjdGl2ZSwgZWxlbWVudDogc2NyaXB0fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2FsbGVkIGFmdGVyIHRoZSBkaXJlY3RpdmUgY29udGFpbmVkIGluIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGFyZ2V0LlxuICovXG5mdW5jdGlvbiBvbkFkZGVkT3JVcGRhdGVkKGluZm8gOiBUYXJnZXRJbmZvKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV0ZXJtaW5lU2NyaXB0VGFyZ2V0KGluZm8uZWxlbWVudClcbiAgICBpZih0YXJnZXQpe1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZTtcbiAgICAgICAgY29uc3QgYWRkSW5mbyA9IHsuLi5pbmZvLCB0YXJnZXR9XG4gICAgICAgIGlmKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIFNldEF0dHJpYnV0ZSl7XG4gICAgICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlQ2hhbmdlKGFkZEluZm8pO1xuICAgICAgICB9IGVsc2UgaWYoZGlyZWN0aXZlIGluc3RhbmNlb2YgQXBwbHlKcyl7XG4gICAgICAgICAgICBydW5FbGVtZW50U2NyaXB0KGRpcmVjdGl2ZSwgYWRkSW5mbylcbiAgICAgICAgfSBlbHNlIGlmKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEV2ZW50SGFuZGxlcil7XG4gICAgICAgICAgICBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUsIGFkZEluZm8pXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBVbmtub3duIHRhcmdldCBmb3IgJHtpbmZvLmVsZW1lbnQub3V0ZXJIVE1MfWApXG4gICAgfVxufVxuZnVuY3Rpb24gb25SZW1vdmVkKGluZm8gOiBUYXJnZXRJbmZvKXtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBpbmZvLmRpcmVjdGl2ZVxuICAgIGlmKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIFNldEF0dHJpYnV0ZSl7XG4gICAgICAgIG5vdGVBdHRyaWJ1dGVEaXJlY3RpdmVSZW1vdmUoaW5mby5lbGVtZW50KVxuICAgIH1cbiAgICBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpe1xuICAgICAgICByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBpbmZvKVxuICAgIH1cbn0iLCIvL1JlY29uY2lsZSBhIHRhcmdldElkIHdpdGggSFRNTFxuaW1wb3J0IHtcbiAgICBhc1NoYWRlRGlyZWN0aXZlLFxuICAgIGNoYW5naW5nRGlyZWN0aXZlcyxcbiAgICBjaGVja0RpcmVjdGl2ZUFkZCxcbiAgICBjaGVja0RpcmVjdGl2ZUNoYW5nZSxcbiAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZSxcbiAgICBDb21wb25lbnRFbmQsXG4gICAgQ29tcG9uZW50U3RhcnQsXG4gICAgS2VlcCxcbn0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVOYW1lcywgY29tcG9uZW50SWRQcmVmaXh9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHthcHBseUF0dHJpYnV0ZVZhbHVlLCBvbkF0dHJpYnV0ZXNTZXRGcm9tU291cmNlfSBmcm9tIFwiLi9hdHRyaWJ1dGVzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvbmNpbGUodGFyZ2V0SWQgOiBudW1iZXIsIGh0bWwgOiBzdHJpbmcpe1xuICAgIGNoYW5naW5nRGlyZWN0aXZlcygoKT0+e1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb21wb25lbnRJZFByZWZpeCt0YXJnZXRJZCk7XG4gICAgICAgIGlmKCF0YXJnZXQpeyByZXR1cm4gfVxuICAgICAgICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudCEhXG4gICAgICAgIGNvbnN0IGh0bWxEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHBhcmVudC50YWdOYW1lKTtcbiAgICAgICAgaHRtbERvbS5pbm5lckhUTUwgPSBodG1sO1xuXG5cbiAgICAgICAgY29uc3QgaW5jbHVkZWQgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0YXJnZXQubmV4dFNpYmxpbmc7XG4gICAgICAgIHdoaWxlKGN1cnJlbnQgIT0gbnVsbCl7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShjdXJyZW50KVxuICAgICAgICAgICAgaWYoY3VycmVudERpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjdXJyZW50RGlyZWN0aXZlLmlkID09IFwiXCIrdGFyZ2V0SWQpe1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaChjdXJyZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgcGF0Y2hDaGlsZHJlbihwYXJlbnQsIHRhcmdldCwgaW5jbHVkZWQsIGh0bWxEb20uY2hpbGROb2Rlcyk7XG4gICAgfSk7XG59XG5cblxuXG5cbmludGVyZmFjZSBDaGlsZE5vZGVMaXN0TGlrZSB7XG4gICAgbGVuZ3RoIDogbnVtYmVyO1xuICAgIFtpbmRleDogbnVtYmVyXSA6IE5vZGVcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBzdGFydERpcmVjdGl2ZSA6IENvbXBvbmVudFN0YXJ0LFxuICAgICAgICBwdWJsaWMgc3RhcnQgOiBOb2RlLFxuICAgICAgICBwdWJsaWMgY2hpbGRyZW4gOiBOb2RlW10sXG4gICAgICAgIHB1YmxpYyBlbmQgOiBOb2RlXG4gICAgKXt9XG5cbiAgICBhc05vZGVzKCl7XG4gICAgICAgIHJldHVybiBbdGhpcy5zdGFydCwgLi4udGhpcy5jaGlsZHJlbiwgdGhpcy5lbmRdXG4gICAgfVxuXG4gICAgaWQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnREaXJlY3RpdmUuaWRcbiAgICB9XG59XG50eXBlIE5vZGVPckNvbXBvbmVudCA9IChOb2RlfENvbXBvbmVudCk7XG5mdW5jdGlvbiBhc05vZGVzKHRhcmdldCA6IE5vZGVPckNvbXBvbmVudCl7XG4gICAgcmV0dXJuIHRhcmdldCBpbnN0YW5jZW9mIENvbXBvbmVudCA/IHRhcmdldC5hc05vZGVzKCkgOiBbdGFyZ2V0XVxufVxuXG5cbmZ1bmN0aW9uIHJlY29uY2lsZU5vZGVzKG9yaWdpbmFsIDogTm9kZSwgbmV3ZXIgOiBOb2RlKSA6IE5vZGUge1xuICAgIGlmKG9yaWdpbmFsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgIGlmKG9yaWdpbmFsLnRhZ05hbWUgIT0gbmV3ZXIudGFnTmFtZSl7XG4gICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChuZXdlcik7XG4gICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShvcmlnaW5hbCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlXG4gICAgICAgICAgICBmb3IoY29uc3QgYXR0cmlidXRlIG9mIG9yaWdpbmFsLmdldEF0dHJpYnV0ZU5hbWVzKCkpe1xuICAgICAgICAgICAgICAgIGlmKCFuZXdlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSl7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUob3JpZ2luYWwsIGF0dHJpYnV0ZSwgbnVsbClcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxuZXdlci5hdHRyaWJ1dGVzLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IG5ld2VyLmF0dHJpYnV0ZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRlckF0dHIgPSBvcmlnaW5hbC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdlckF0dHIgPSBuZXdlci5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSFcbiAgICAgICAgICAgICAgICBpZihvbGRlckF0dHIgIT0gbmV3ZXJBdHRyKXtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHlBdHRyaWJ1dGVWYWx1ZShvcmlnaW5hbCwgYXR0cmlidXRlLCBuZXdlckF0dHIpXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGNoYW5nZWQpe1xuICAgICAgICAgICAgICAgIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2Uob3JpZ2luYWwpO1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQ2hhbmdlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGNoQ2hpbGRyZW4ob3JpZ2luYWwsIG51bGwsIG9yaWdpbmFsLmNoaWxkTm9kZXMsIG5ld2VyLmNoaWxkTm9kZXMpO1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbCBpbnN0YW5jZW9mIFRleHQgJiYgbmV3ZXIgaW5zdGFuY2VvZiBUZXh0KXtcbiAgICAgICAgaWYob3JpZ2luYWwudGV4dENvbnRlbnQgPT0gbmV3ZXIudGV4dENvbnRlbnQpe1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hDaGlsZHJlbihcbiAgICBkb20gOiBIVE1MRWxlbWVudCxcbiAgICBhcHBlbmRTdGFydCA6IEhUTUxFbGVtZW50fG51bGwsXG4gICAgZG9tQ2hpbGRyZW4gOiBDaGlsZE5vZGVMaXN0TGlrZSxcbiAgICByZXBsYWNlbWVudENoaWxkcmVuIDogQ2hpbGROb2RlTGlzdExpa2Vcbil7XG4gICAgY29uc3QgZmluYWwgPSByZWNvbmNpbGVDaGlsZHJlbihkb20sIGRvbUNoaWxkcmVuLCByZXBsYWNlbWVudENoaWxkcmVuKTtcbiAgICBsZXQgZW5kT2ZQYXRjaFJhbmdlIDogTm9kZXxudWxsO1xuICAgIGlmKGRvbUNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZW5kT2ZQYXRjaFJhbmdlID0gZG9tQ2hpbGRyZW5bZG9tQ2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dFNpYmxpbmc7XG4gICAgfSBlbHNlIGlmIChhcHBlbmRTdGFydCl7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGFwcGVuZFN0YXJ0Lm5leHRTaWJsaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnQgOiBOb2RlfFwic3RhcnRcInxcImVuZFwiID0gYXBwZW5kU3RhcnQgPyBhcHBlbmRTdGFydCA6IFwic3RhcnRcIjtcbiAgICBmdW5jdGlvbiBhZnRlckN1cnJlbnQoKSA6IE5vZGV8XCJlbmRcIiB7XG4gICAgICAgIGlmKGN1cnJlbnQgPT0gXCJzdGFydFwiKXtcbiAgICAgICAgICAgIHJldHVybiBkb20uZmlyc3RDaGlsZCA/IGRvbS5maXJzdENoaWxkIDogXCJlbmRcIjtcbiAgICAgICAgfSBlbHNlIGlmKGN1cnJlbnQgPT0gXCJlbmRcIil7XG4gICAgICAgICAgICByZXR1cm4gXCJlbmRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Lm5leHRTaWJsaW5nID8gY3VycmVudC5uZXh0U2libGluZyA6IFwiZW5kXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yKGNvbnN0IGNoaWxkIG9mIGZpbmFsKXtcbiAgICAgICAgbGV0IG5leHQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICAgICAgaWYobmV4dCAhPT0gY2hpbGQpe1xuICAgICAgICAgICAgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgbmV4dCA9PT0gXCJlbmRcIiA/IG51bGwgOiBuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY2hpbGQ7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICB3aGlsZShjdXJyZW50ICE9IFwiZW5kXCIgJiYgY3VycmVudCAhPSBlbmRPZlBhdGNoUmFuZ2Upe1xuICAgICAgICBjb25zdCBjaGlsZCA9IGN1cnJlbnQ7XG4gICAgICAgIGN1cnJlbnQgPSBhZnRlckN1cnJlbnQoKTtcbiAgICAgICAgZG9tLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG59XG5cblxuZnVuY3Rpb24gcmVjb25jaWxlQ2hpbGRyZW4oXG4gICAgZG9tIDogSFRNTEVsZW1lbnQsXG4gICAgZG9tQ2hpbGRyZW4gOiBDaGlsZE5vZGVMaXN0TGlrZSxcbiAgICByZXBsYWNlbWVudENoaWxkcmVuIDogQ2hpbGROb2RlTGlzdExpa2VcbikgOiBOb2RlW10ge1xuICAgIGNvbnN0IG9yaWdpbmFscyA9IGNvbGxhcHNlQ29tcG9uZW50Q2hpbGRyZW4oZG9tQ2hpbGRyZW4pO1xuICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IGNvbGxhcHNlQ29tcG9uZW50Q2hpbGRyZW4ocmVwbGFjZW1lbnRDaGlsZHJlbik7XG4gICAgY29uc3Qgb3JpZ2luYWxLZXlzID0gY29sbGVjdEtleXNNYXAob3JpZ2luYWxzKTtcblxuICAgIGxldCBvcmlnaW5hbEluZGV4ID0gMDtcbiAgICBsZXQgcmVwbGFjZW1lbnRJbmRleCA9IDA7XG5cbiAgICBjb25zdCBmaW5hbENoaWxkcmVuIDogTm9kZVtdID0gW107XG5cbiAgICB3aGlsZShvcmlnaW5hbEluZGV4IDwgb3JpZ2luYWxzLmxlbmd0aCB8fCByZXBsYWNlbWVudEluZGV4IDwgcmVwbGFjZW1lbnRzLmxlbmd0aCl7XG4gICAgICAgIGxldCBvcmlnaW5hbCA6IE5vZGVPckNvbXBvbmVudHx1bmRlZmluZWQgPSBvcmlnaW5hbHNbb3JpZ2luYWxJbmRleF07XG4gICAgICAgIGNvbnN0IG5ld2VyIDogTm9kZU9yQ29tcG9uZW50fHVuZGVmaW5lZCA9IHJlcGxhY2VtZW50c1tyZXBsYWNlbWVudEluZGV4XTtcbiAgICAgICAgaWYob3JpZ2luYWwgJiYgIW5ld2VyKSB7XG4gICAgICAgICAgICAvKiBJbXBsaWNpdCByZW1vdmUgKi9cbiAgICAgICAgICAgIGZvcihsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSl7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICAvL1RleHQgbm9kZXMgaGF2ZSBubyBpbnRlcmVzdGluZyBpZGVudGl0eSBvciBjaGlsZHJlbiB0byBwcmVzZXJ2ZSwgYW5kIHRoZVxuICAgICAgICAgICAgLy9Lb3RsaW4gc2lkZSBjYW4ndCB0cmFjayB0aGVtIGZvciBwb3NpdGlvbiBtYXRjaGluZywgc28gd2UganVzdCBza2lwIG92ZXIgdGhlbVxuICAgICAgICAgICAgLy9pbiBjb21wYXJpc29ucyBhbmQgYWRkIHRoZSBuZXdlciB0ZXh0IGFsd2F5cy5cbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXdlciBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaChuZXdlcilcbiAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vVGhlIHNlcnZlciBkb2VzIG5vdCB0cmFjayB0aGUgcG9zaXRpb24gb2YgbW9zdCBkaXJlY3RpdmVzLCBleGNlcHQga2VlcCwgc28gdGhleSBhcmUgc3BlY2lhbGx5IGhhbmRsZWRcbiAgICAgICAgICAgIC8vZm9yIG1hdGNoaW5nXG4gICAgICAgICAgICBjb25zdCBuZXdlckRpcmVjdGl2ZSA9IG5ld2VyIGluc3RhbmNlb2YgQ29tcG9uZW50ID8gbnVsbCA6IGFzU2hhZGVEaXJlY3RpdmUobmV3ZXIpXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbElzRGlyZWN0aXZlID0gb3JpZ2luYWwgaW5zdGFuY2VvZiBOb2RlICYmIGFzU2hhZGVEaXJlY3RpdmUob3JpZ2luYWwpICE9IG51bGxcbiAgICAgICAgICAgIGlmKG5ld2VyIGluc3RhbmNlb2YgTm9kZSAmJiBuZXdlckRpcmVjdGl2ZSAhPSBudWxsICYmICEobmV3ZXJEaXJlY3RpdmUgaW5zdGFuY2VvZiBLZWVwKSl7XG4gICAgICAgICAgICAgICAgaWYob3JpZ2luYWxJc0RpcmVjdGl2ZSl7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaChyZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCBhcyBOb2RlLCBuZXdlcikpXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsQ2hpbGRyZW4ucHVzaChuZXdlcilcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQobmV3ZXIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9yaWdpbmFsSXNEaXJlY3RpdmUpe1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG9yaWdpbmFsIGFzIE5vZGUpXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbmV3ZXJLZXkgPSBnZXRLZXkobmV3ZXIpO1xuICAgICAgICAgICAgaWYobmV3ZXJLZXkgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgLy9XZSdsbCBkaXJlY3RseSBtYXRjaCB0byB0aGUgb3JpZ2luYWwgYnkga2V5LCBpZ25vcmluZyB3aGF0J3MgdXN1YWxseSBhdCB0aGlzIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgb3JpZ2luYWwgPSBvcmlnaW5hbEtleXNbbmV3ZXJLZXldPy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihvcmlnaW5hbCAmJiBnZXRLZXkob3JpZ2luYWwpICE9IG51bGwpe1xuICAgICAgICAgICAgICAgIC8vQSBrZXllZCBvcmlnaW5hbCBpcyBvbmx5IG1hdGNoZWQgYnkgaXRzIGtleTsgaWYgbm90aGluZyBjbGFpbXMgaXQsIGl0J3MgcmVtb3ZlZCB3aXRoIHRoZSBvdGhlciB1bnVzZWQga2V5cyBiZWxvd1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgYWRkIDogTm9kZVtdID0gW107XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHVzZU5ld2VyKCl7XG4gICAgICAgICAgICAgICAgYWRkID0gYXNOb2RlcyhuZXdlciEpO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgbm9kZSBvZiBhZGQpe1xuICAgICAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYob3JpZ2luYWwpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYob3JpZ2luYWwgJiYgb3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQgJiYgbmV3ZXJEaXJlY3RpdmUgaW5zdGFuY2VvZiBLZWVwICYmIChuZXdlckRpcmVjdGl2ZS5pZCA9PSBvcmlnaW5hbC5pZCgpIHx8IG5ld2VyS2V5KSl7XG4gICAgICAgICAgICAgICAgYWRkID0gYXNOb2RlcyhvcmlnaW5hbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKCFvcmlnaW5hbCl7XG4gICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobmV3ZXIgaW5zdGFuY2VvZiBDb21wb25lbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYob3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQgJiYgb3JpZ2luYWwuaWQoKSA9PSBuZXdlci5pZCgpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZWNvbmNpbGVDaGlsZHJlbihkb20sIG9yaWdpbmFsLmNoaWxkcmVuLCBuZXdlci5jaGlsZHJlbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsLmVuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKG9yaWdpbmFsIGluc3RhbmNlb2YgQ29tcG9uZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZU5ld2VyKClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtyZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCwgbmV3ZXIpXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxDaGlsZHJlbi5wdXNoKC4uLmFkZCk7XG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL0FsbCByZW1haW5pbmcga2V5cyBpbiB0aGUgbWFwIHdpbGwgbm90IGhhdmUgYmVlbiB1c2VkLlxuICAgIGZvcihjb25zdCBrZXkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWxLZXlzKSl7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFscyA9IG9yaWdpbmFsS2V5c1trZXldO1xuICAgICAgICBmb3IobGV0IG9yaWdpbmFsIG9mIG9yaWdpbmFscyl7XG4gICAgICAgICAgICBmb3IobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpe1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbmFsQ2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlQ29tcG9uZW50Q2hpbGRyZW4obGlzdCA6IENoaWxkTm9kZUxpc3RMaWtlKSA6IE5vZGVPckNvbXBvbmVudFtdIHtcbiAgICBjb25zdCByZXN1bHQgOiBOb2RlT3JDb21wb25lbnRbXSA9IFtdO1xuICAgIGZvcihsZXQgaT0wO2k8bGlzdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBsaXN0W2ldO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGNoaWxkKVxuICAgICAgICBsZXQgZW5kIDogTm9kZXxudWxsID0gbnVsbFxuICAgICAgICBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRTdGFydCl7XG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA6IE5vZGVbXSA9IFtdO1xuICAgICAgICAgICAgd2hpbGUoaSA8IGxpc3QubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJDaGlsZCA9IGxpc3RbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRBc0RpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc3ViQ2hpbGQpXG4gICAgICAgICAgICAgICAgaWYoY2hpbGRBc0RpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudEVuZCAmJiBjaGlsZEFzRGlyZWN0aXZlLmlkID09IGRpcmVjdGl2ZS5pZCl7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN1YkNoaWxkXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnB1c2goc3ViQ2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihlbmQgPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJNaXNzaW5nIGVuZCB0YWcgZm9yIGNvbXBvbmVudCBcIiArIGRpcmVjdGl2ZS5pZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBDb21wb25lbnQoZGlyZWN0aXZlLCBjaGlsZCwgY29tcG9uZW50LCBlbmQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkKVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3RLZXlzTWFwKGNoaWxkTGlzdCA6IE5vZGVPckNvbXBvbmVudFtdKSA6IHtba2V5OnN0cmluZ10gOiBBcnJheTxOb2RlT3JDb21wb25lbnQ+fSB7XG4gICAgY29uc3Qga2V5cyA6IHtba2V5OnN0cmluZ10gOiBBcnJheTxOb2RlT3JDb21wb25lbnQ+fSA9IHt9O1xuICAgIGZvcihsZXQgaT0wO2k8Y2hpbGRMaXN0Lmxlbmd0aDtpKyspe1xuICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkTGlzdFtpXVxuICAgICAgICBjb25zdCBrZXkgPSBnZXRLZXkoY2hpbGQpXG4gICAgICAgIGlmKGtleSAhPSBudWxsKXtcbiAgICAgICAgICAgIGxldCBsaXN0ID0ga2V5c1trZXldXG4gICAgICAgICAgICBpZighbGlzdCl7XG4gICAgICAgICAgICAgICAgbGlzdCA9IGtleXNba2V5XSA9IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIGdldEtleShjaGlsZCA6IE5vZGVPckNvbXBvbmVudCl7XG4gICAgY29uc3QgdGFyZ2V0ID0gY2hpbGQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyBjaGlsZC5zdGFydCA6IGNoaWxkO1xuICAgIGlmKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtcbiAgICAgICAgY29uc3Qga2V5ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5LZXkpO1xuICAgICAgICBpZihrZXkgIT0gbnVsbCl7XG4gICAgICAgICAgICByZXR1cm4ga2V5XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbn0iLCJpbXBvcnQge0F0dHJpYnV0ZU5hbWVzfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJvdW5kSW5wdXQoYm91bmRJZCA6IG51bWJlciwgc2VydmVyU2VlbiA6IG51bWJlciwgdmFsdWUgOiBhbnksIHNldHRlciA6IChpdCA6IEhUTUxFbGVtZW50LCB2YWx1ZTogYW55KT0+dm9pZCl7XG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW1wiKyBBdHRyaWJ1dGVOYW1lcy5Cb3VuZCArXCI9XFxcIlwiICsgYm91bmRJZCArIFwiXFxcIl1cIikgYXMgSFRNTEVsZW1lbnR8bnVsbFxuICAgIGlmKCFpbnB1dCl7IHJldHVybiB9XG4gICAgbGV0IHNlZW4gPSAoaW5wdXQgYXMgYW55KS5ib3VuZFNlZW4gfHwgKChpbnB1dCBhcyBhbnkpLmJvdW5kU2Vlbj0wKVxuICAgIGlmKGlucHV0ICYmIHNlZW4gPD0gc2VydmVyU2Vlbikge1xuICAgICAgICBzZXR0ZXIoaW5wdXQsIHZhbHVlKVxuICAgIH1cbn0iLCJpbXBvcnQge3NlbmRJZkVycm9yLCBzZW5kTWVzc2FnZX0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQge3JlY29uY2lsZX0gZnJvbSBcIi4vcmVjb25jaWxlXCI7XG5pbXBvcnQge3VwZGF0ZUJvdW5kSW5wdXR9IGZyb20gXCIuL2JvdW5kXCI7XG5pbXBvcnQge1NvY2tldFNjb3BlTmFtZXN9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVTY3JpcHQodGFnIDogc3RyaW5nfHVuZGVmaW5lZCwgc2NvcGUgOiBTY29wZSwgc2NyaXB0IDogc3RyaW5nKXtcbiAgICB0cnkge1xuICAgICAgICBzY29wZShzY3JpcHQpXG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgc2VuZElmRXJyb3IoZSwgdGFnLCBzY3JpcHQuc3Vic3RyaW5nKDAsIDI1NikpO1xuICAgIH1cbn1cblxudHlwZSBTY29wZSA9IChzY3JpcHQ6IHN0cmluZyk9PnZvaWRcbmV4cG9ydCBmdW5jdGlvbiBtYWtlRXZhbFNjb3BlKHNjb3BlIDogT2JqZWN0KSA6IFNjb3BlIHtcbiAgICBjb25zdCBmaW5hbCA9IHsuLi5iYXNlU2NvcGUsIC4uLnNjb3BlfVxuICAgIGNvbnN0IG5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZmluYWwpXG4gICAgY29uc3QgdmFsdWVzID0gbmFtZXMubWFwKChuYW1lKSA9PiAoZmluYWwgYXMgYW55KVtuYW1lXSlcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjcmlwdCA6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjb21waWxlZCA9IG5ldyBGdW5jdGlvbiguLi5uYW1lcywgYHJldHVybiAoZnVuY3Rpb24oKXtcXG4ke3NjcmlwdH1cXG59KSgpYClcbiAgICAgICAgcmV0dXJuIGNvbXBpbGVkKC4uLnZhbHVlcylcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBiYXNlU2NvcGUgPSB7XG4gICAgW1NvY2tldFNjb3BlTmFtZXMucmVjb25jaWxlXTpyZWNvbmNpbGUsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMudXBkYXRlQm91bmRJbnB1dF06dXBkYXRlQm91bmRJbnB1dCxcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5zZW5kTWVzc2FnZV06c2VuZE1lc3NhZ2UsXG4gICAgW1NvY2tldFNjb3BlTmFtZXMuc2VuZElmRXJyb3JdOnNlbmRJZkVycm9yXG59XG4iLCJpbXBvcnQge2Vycm9yRGlzcGxheX0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge2V2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQge21lc3NhZ2VUYWdFcnJvclByZWZpeCwgbWVzc2FnZVRhZ1NlcGFyYXRvcn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge3doZW5Eb2N1bWVudFJlYWR5fSBmcm9tIFwiLi91dGlsaXR5XCI7XG5cblxubGV0IHNvY2tldFJlYWR5ID0gZmFsc2U7XG5jb25zdCBzb2NrZXRSZWFkeVF1ZXVlIDogc3RyaW5nW10gPSBbXTtcbmxldCBzb2NrZXQgOiBXZWJTb2NrZXQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0U29ja2V0KCl7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTCgod2luZG93IGFzIGFueSkuc2hhZGVFbmRwb2ludCwgd2luZG93LmxvY2F0aW9uLmhyZWYpXG4gICAgaWYoKHdpbmRvdyBhcyBhbnkpLnNoYWRlSG9zdCl7XG4gICAgICAgIHVybC5ob3N0ID0gKHdpbmRvdyBhcyBhbnkpLnNoYWRlSG9zdDtcbiAgICB9XG4gICAgdXJsLnByb3RvY29sID0gKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IFwid3NzOi8vXCIgOiBcIndzOi8vXCIpO1xuICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsLmhyZWYpO1xuICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgaWQgPSAod2luZG93IGFzIGFueSkuc2hhZGVJZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWQgd2l0aCBJRCBcIiArIGlkKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIHNvY2tldC5zZW5kKGlkKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoc29ja2V0UmVhZHlRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChzb2NrZXRSZWFkeVF1ZXVlLnNoaWZ0KCkhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IChldmVudC5kYXRhIGFzIHN0cmluZyk7XG4gICAgICAgIGNvbnN0IHNwbGl0SW5kZXggPSBkYXRhLmluZGV4T2YobWVzc2FnZVRhZ1NlcGFyYXRvcik7XG4gICAgICAgIGNvbnN0IHRhZyA9IGRhdGEuc3Vic3RyaW5nKDAsIHNwbGl0SW5kZXgpO1xuICAgICAgICBjb25zdCBzY3JpcHQgPSBkYXRhLnN1YnN0cmluZyhzcGxpdEluZGV4KzEsIGRhdGEubGVuZ3RoKTtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHt9KVxuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbigpe1xuICAgICAgICAgICAgZXZhbHVhdGVTY3JpcHQodGFnLCBzY29wZSwgc2NyaXB0KVxuICAgICAgICB9KVxuICAgIH07XG4gICAgbGV0IGVycm9yVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gZXJyb3JSZWxvYWQoKXtcbiAgICAgICAgaWYoZXJyb3JUcmlnZ2VyZWQpeyByZXR1cm47IH1cbiAgICAgICAgZXJyb3JUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsYXN0UmVsb2FkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIik7XG4gICAgICAgIGlmKGxhc3RSZWxvYWQpe1xuICAgICAgICAgICAgZXJyb3JEaXNwbGF5KFwiVGhpcyB3ZWIgcGFnZSBjb3VsZCBub3QgY29ubmVjdCB0byBpdHMgc2VydmVyLiBQbGVhc2UgcmVsb2FkIG9yIHRyeSBhZ2FpbiBsYXRlci5cIik7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTb2NrZXQgY2xvc2VkOiAke2V2dC5yZWFzb259LCAke2V2dC53YXNDbGVhbn1gKTtcbiAgICAgICAgc29ja2V0UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKGV2dC53YXNDbGVhbil7XG4gICAgICAgICAgICAvL2Nvbm5lY3RTb2NrZXQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFNvY2tldCBjbG9zZWQ6ICR7ZXZ0fWApO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuICAgICAgICBlcnJvclJlbG9hZCgpO1xuICAgIH07XG5cbiAgICBzZXRJbnRlcnZhbCgoKT0+e1xuICAgICAgICBpZihzb2NrZXRSZWFkeSl7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChcIlwiKVxuICAgICAgICB9XG4gICAgfSwgNjAqMTAwMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZW5kTWVzc2FnZShpZCA6IHN0cmluZywgbXNnIDogc3RyaW5nfHVuZGVmaW5lZHxudWxsKSB7XG4gICAgY29uc3QgZmluYWxNc2cgPSAobXNnICE9PSB1bmRlZmluZWQgJiYgbXNnICE9PSBudWxsKSA/IGlkICsgbWVzc2FnZVRhZ1NlcGFyYXRvciArIG1zZyA6IGlkICsgbWVzc2FnZVRhZ1NlcGFyYXRvcjtcbiAgICBzZW5kT3JRdWV1ZShmaW5hbE1zZyk7XG59XG5cbmZ1bmN0aW9uIHNlbmRPclF1ZXVlKGZpbmFsTXNnIDogc3RyaW5nKXtcbiAgICBpZiAoc29ja2V0UmVhZHkpIHtcbiAgICAgICAgc29ja2V0LnNlbmQoZmluYWxNc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNvY2tldFJlYWR5UXVldWUucHVzaChmaW5hbE1zZyk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VuZElmRXJyb3IoZXJyb3IgOiB1bmtub3duLCB0YWc/OiBzdHJpbmcsIGV2YWxUZXh0ID86IHN0cmluZyl7XG4gICAgY29uc3QgZGF0YSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyB7XG4gICAgICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgICAgIGpzTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgc3RhY2sgOiBlcnJvci5zdGFjayxcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfSA6IHtcbiAgICAgICAgbmFtZTogXCJVbmtub3duXCIsXG4gICAgICAgIGpzTWVzc2FnZTogXCJVbmtub3duIGVycm9yOiBcIiArIGVycm9yLFxuICAgICAgICBzdGFjazogXCJcIixcbiAgICAgICAgZXZhbDogZXZhbFRleHQsXG4gICAgICAgIHRhZzogdGFnXG4gICAgfTtcbiAgICBzZW5kT3JRdWV1ZShgJHttZXNzYWdlVGFnRXJyb3JQcmVmaXh9JHt0YWcgPT0gdW5kZWZpbmVkID8gXCJcIiA6IHRhZ30ke21lc3NhZ2VUYWdTZXBhcmF0b3J9YCArIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuIiwiaW1wb3J0IHtjb25uZWN0U29ja2V0LCBzZW5kSWZFcnJvcn0gZnJvbSBcIi4vc29ja2V0XCI7XG5pbXBvcnQge2Vycm9yRGlzcGxheX0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge3doZW5Eb2N1bWVudFJlYWR5fSBmcm9tIFwiLi91dGlsaXR5XCI7XG5pbXBvcnQge2FkZEFsbERpcmVjdGl2ZXN9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcblxuaWYoISh3aW5kb3cgYXMgYW55KS5zaGFkZSl7XG4gICAgKHdpbmRvdyBhcyBhbnkpLnNoYWRlID0ge307XG4gICAgaWYoIXdpbmRvdy5XZWJTb2NrZXQpe1xuICAgICAgICBlcnJvckRpc3BsYXkoXCJZb3VyIHdlYiBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHBhZ2UsIGFuZCBpdCBtYXkgbm90IGZ1bmN0aW9uIGNvcnJlY3RseSBhcyBhIHJlc3VsdC4gVXBncmFkZSB5b3VyIHdlYiBicm93c2VyLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25uZWN0U29ja2V0KCk7XG5cbiAgICAgICAgd2hlbkRvY3VtZW50UmVhZHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFkZEFsbERpcmVjdGl2ZXMoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVxuICAgICAgICB9KVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKGV2ZW50OiBFcnJvckV2ZW50KXtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LmVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBmdW5jdGlvbihldmVudCA6IFByb21pc2VSZWplY3Rpb25FdmVudCl7XG4gICAgICAgICAgICBzZW5kSWZFcnJvcihldmVudC5yZWFzb24pO1xuICAgICAgICB9KTtcbiAgICB9XG59Il0sIm5hbWVzIjpbIkRpcmVjdGl2ZVR5cGUiLCJBdHRyaWJ1dGVOYW1lcyIsIlNvY2tldFNjb3BlTmFtZXMiLCJpZCIsIm9yaWdpbmFscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sV0FBUyxhQUFhLFNBQWlCO0FBQzFDLFVBQU0sWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM5QyxjQUFVLFlBQVksb1hBQW9YLFVBQVc7QUFDclosYUFBUyxLQUFLLFlBQVksU0FBUztBQUNuQyxhQUFTLGVBQWUsWUFBWSxFQUFHLGlCQUFpQixTQUFTLFdBQVU7QUFDdkUsWUFBTSxJQUFJLFNBQVMsZUFBZSxZQUFZO0FBQzlDLFFBQUUsV0FBWSxZQUFZLENBQUM7QUFBQSxJQUMvQixDQUFDO0FBQUEsRUFDTDtBQ05PLE1BQUssa0NBQUFBLG1CQUFMO0FBQ0hBLG1CQUFBLFNBQUEsSUFBVTtBQUNWQSxtQkFBQSxjQUFBLElBQWU7QUFDZkEsbUJBQUEsY0FBQSxJQUFlO0FBQ2ZBLG1CQUFBLGdCQUFBLElBQWlCO0FBQ2pCQSxtQkFBQSxjQUFBLElBQWU7QUFDZkEs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
