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
        sendMessage(socketReadyQueue.shift(), null);
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
    socket.send(`${messageTagErrorPrefix}${tag == void 0 ? "" : tag}${messageTagSeparator}` + JSON.stringify(data));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGUtYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi90eXBlc2NyaXB0L3NyYy9lcnJvcnMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9jb25zdGFudHMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy91dGlsaXR5LnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvYXR0cmlidXRlcy50cyIsIi4uLy4uL3R5cGVzY3JpcHQvc3JjL2FwcGx5anMudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9kaXJlY3RpdmVzLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvcmVjb25jaWxlLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvYm91bmQudHMiLCIuLi8uLi90eXBlc2NyaXB0L3NyYy9ldmFsLnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvc29ja2V0LnRzIiwiLi4vLi4vdHlwZXNjcmlwdC9zcmMvc2hhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGVycm9yRGlzcGxheShjb250ZW50IDogc3RyaW5nKXtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J3NoYWRlTW9kYWwnIHN0eWxlPSdwb3NpdGlvbjogZml4ZWQ7ei1pbmRleDogOTk5OTk5OTk5O2xlZnQ6IDA7dG9wOiAwO3dpZHRoOiAxMDAlO2hlaWdodDogMTAwJTtvdmVyZmxvdzogYXV0bztiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMCwwLDAuNCk7Jz48ZGl2IHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO21hcmdpbjogMTUlIGF1dG87cGFkZGluZzogMjBweDtib3JkZXI6IDFweCBzb2xpZCAjODg4O3dpZHRoOiA4MCU7Jz48c3BhbiBpZD0nc2hhZGVDbG9zZScgc3R5bGU9J2Zsb2F0OiByaWdodDtmb250LXNpemU6IDI4cHg7Zm9udC13ZWlnaHQ6IGJvbGQ7Y3Vyc29yOiBwb2ludGVyOyc+JnRpbWVzOzwvc3Bhbj48cD5cIiArIGNvbnRlbnQgICsgXCI8L3A+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhZGVDbG9zZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBjb25zdCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYWRlTW9kYWwnKSE7XG4gICAgICAgIG0ucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQobSk7XG4gICAgfSk7XG59IiwiLy9DaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIG1pcnJvcmVkIGluIENsaWVudENvbnN0YW50cy5rdFxuXG5leHBvcnQgZW51bSBEaXJlY3RpdmVUeXBlIHtcbiAgICBBcHBseUpzID0gXCJqXCIsXG4gICAgU2V0QXR0cmlidXRlID0gXCJhXCIsXG4gICAgRXZlbnRIYW5kbGVyID0gXCJlXCIsXG4gICAgQ29tcG9uZW50U3RhcnQgPSBcInNcIixcbiAgICBDb21wb25lbnRFbmQgPSBcImZcIixcbiAgICBDb21wb25lbnRLZWVwID0gXCJrXCJcbn1cbmV4cG9ydCBlbnVtIEF0dHJpYnV0ZU5hbWVzIHtcbiAgICBEaXJlY3RpdmVUeXBlID0gXCJkYXRhLXNcIixcbiAgICBUYXJnZXRTaWJsaW5nRGlyZWN0aXZlID0gXCJkYXRhLWZcIixcbiAgICBBcHBseUpzU2NyaXB0ID0gXCJkYXRhLXRcIixcbiAgICBBcHBseUpzUnVuT3B0aW9uID0gXCJkYXRhLXJcIixcbiAgICBTZXRBdHRyaWJ1dGVOYW1lID0gXCJkYXRhLWFcIixcbiAgICBTZXRBdHRyaWJ1dGVWYWx1ZSA9IFwiZGF0YS12XCIsXG4gICAgS2V5ID0gXCJkYXRhLWtcIixcbiAgICBFdmVudE5hbWUgPSBcImRhdGEtZVwiLFxuICAgIEV2ZW50Q2FsbGJhY2tJZCA9IFwiZGF0YS1pXCIsXG4gICAgRXZlbnRQcmVmaXggPSBcImRhdGEtcFwiLFxuICAgIEV2ZW50U3VmZml4ID0gXCJkYXRhLXhcIixcbiAgICBFdmVudERhdGEgPSBcImRhdGEtZFwiLFxuICAgIEJvdW5kID0gXCJkYXRhLWJcIixcbiAgICBDaGVja2JveCA9IFwiZGF0YS1jXCJcbn1cblxuZXhwb3J0IGNvbnN0IHNjcmlwdFR5cGVTaWduaWZpZXIgPSBcInNoYWRlXCJcbmV4cG9ydCBjb25zdCBjb21wb25lbnRJZFByZWZpeCA9IFwic2hhZGVcIlxuZXhwb3J0IGNvbnN0IGNvbXBvbmVudElkRW5kU3VmZml4ID0gXCJlXCJcblxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdTZXBhcmF0b3IgPSBcInxcIlxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VUYWdFcnJvclByZWZpeCA9IFwiRVwiXG5cbmV4cG9ydCBlbnVtIFNvY2tldFNjb3BlTmFtZXMge1xuICAgIHJlY29uY2lsZSA9IFwiclwiLFxuICAgIHVwZGF0ZUJvdW5kSW5wdXQgPSBcImJcIixcbiAgICBzZW5kTWVzc2FnZSA9IFwic1wiLFxuICAgIHNlbmRJZkVycm9yID0gXCJxXCJcbn0iLCJleHBvcnQgZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbFBsdXNUYXJnZXQodGFyZ2V0IDogRWxlbWVudCwgc2VsZWN0b3IgOiBzdHJpbmcpOiBFbGVtZW50W10ge1xuICAgIGNvbnN0IGJlbG93ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgaWYodGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKXtcbiAgICAgICAgcmV0dXJuIFt0YXJnZXQsIC4uLmJlbG93XVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGJlbG93KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5Eb2N1bWVudFJlYWR5KGZuIDogKCk9PnZvaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiaW50ZXJhY3RpdmVcIikge1xuICAgICAgICBmbigpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZm4pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7U29ja2V0U2NvcGVOYW1lc30gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge2V2YWx1YXRlU2NyaXB0LCBtYWtlRXZhbFNjb3BlfSBmcm9tIFwiLi9ldmFsXCI7XG5pbXBvcnQge0FkZGVkVGFyZ2V0SW5mbywgRXZlbnRIYW5kbGVyLCBUYXJnZXRJbmZvfSBmcm9tIFwiLi9kaXJlY3RpdmVzXCI7XG5cbmludGVyZmFjZSBFdmVudFByZXZpb3VzIHtcbiAgICBldmVudE5hbWU6IHN0cmluZyxcbiAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lclxuICAgIHRhcmdldDogSFRNTEVsZW1lbnRcbn1cblxuZXhwb3J0IGxldCBzdXBwcmVzc0V2ZW50RmlyaW5nID0ge3N1cHByZXNzOiBmYWxzZX07XG5cbmNvbnN0IGV2ZW50UHJldmlvdXMgPSBTeW1ib2woKVxuaW50ZXJmYWNlIEhhc1ByZXZpb3VzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIFtldmVudFByZXZpb3VzXT86IEV2ZW50UHJldmlvdXNcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEV2ZW50SGFuZGxlcihkaXJlY3RpdmUgOiBFdmVudEhhbmRsZXIsIGluZm8gOiBBZGRlZFRhcmdldEluZm8pe1xuICAgIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoaW5mby5lbGVtZW50KVxuICAgIGNvbnN0IHByZWZpeCA9IGRpcmVjdGl2ZS5wcmVmaXggPyBgJHtkaXJlY3RpdmUucHJlZml4fTtcXG5gIDogXCJcIlxuICAgIGNvbnN0IGRhdGEgPSBkaXJlY3RpdmUuZGF0YSA/IGAsSlNPTi5zdHJpbmdpZnkoJHtkaXJlY3RpdmUuZGF0YX0pYCA6IFwiXCJcbiAgICBjb25zdCBzdWZmaXggPSBkaXJlY3RpdmUuc3VmZml4ID8gYDtcXG4ke2RpcmVjdGl2ZS5zdWZmaXh9YCA6IFwiXCJcbiAgICBjb25zdCBzY3JpcHQgPSBgJHtwcmVmaXh9JHtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlfSgke2RpcmVjdGl2ZS5jYWxsYmFja0lkfSR7ZGF0YX0pJHtzdWZmaXh9YFxuICAgIGNvbnN0IGxpc3RlbmVyIDogRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHRoaXMgOiBFdmVudExpc3RlbmVyLCBlIDogRXZlbnQpe1xuICAgICAgICBpZihzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzKXsgcmV0dXJuIH1cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBtYWtlRXZhbFNjb3BlKHtcbiAgICAgICAgICAgIGV2ZW50OiBlLFxuICAgICAgICAgICAgZTogZSxcbiAgICAgICAgICAgIGl0OiBlLnRhcmdldFxuICAgICAgICB9KVxuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBzY3JpcHQpXG4gICAgfVxuICAgIGluZm8udGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZGlyZWN0aXZlLmV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIChpbmZvLmVsZW1lbnQgYXMgSGFzUHJldmlvdXMpW2V2ZW50UHJldmlvdXNdID0ge1xuICAgICAgICBldmVudE5hbWU6IGRpcmVjdGl2ZS5ldmVudE5hbWUsXG4gICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldFxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZGlyZWN0aXZlIDogRXZlbnRIYW5kbGVyLCBpbmZvIDogVGFyZ2V0SW5mbyl7XG4gICAgcmVtb3ZlUHJldmlvdXNseUluc3RhbGxlZChpbmZvLmVsZW1lbnQpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzbHlJbnN0YWxsZWQoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBwcmV2aW91cyA9IChlbGVtZW50IGFzIEhhc1ByZXZpb3VzKVtldmVudFByZXZpb3VzXVxuICAgIGlmKHByZXZpb3VzKXtcbiAgICAgICAgcHJldmlvdXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJldmlvdXMuZXZlbnROYW1lLCBwcmV2aW91cy5saXN0ZW5lcilcbiAgICB9XG59IiwiaW1wb3J0IHtBZGRlZFRhcmdldEluZm8sIGFzU2hhZGVEaXJlY3RpdmUsIFNldEF0dHJpYnV0ZX0gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuaW1wb3J0IHtBdHRyaWJ1dGVOYW1lcywgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllcn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge3N1cHByZXNzRXZlbnRGaXJpbmd9IGZyb20gXCIuL2V2ZW50c1wiO1xuXG5cbi8vV2UgbmVlZCBzb21lIHdheSBvZiBzdG9yaW5nIHRoZSBvcmlnaW5hbCB2YWx1ZXMgb2YgYW4gYXR0cmlidXRlIGJlZm9yZSBhbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHdhcyBhcHBsaWVkLFxuLy9pbiBjYXNlIHRoYXQgZGlyZWN0aXZlIGlzIHJlbW92ZWQgaW4gYW4gdXBkYXRlIHRoYXQgZG9lcyBub3QgcmVzZXQgYW4gZWxlbWVudCdzIGF0dHJpYnV0ZXMuXG5cbmNvbnN0IGF0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzID0gU3ltYm9sKClcbmludGVyZmFjZSBPcmlnaW5hbEF0dHJpYnV0ZVZhbHVlRG9tIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIFthdHRyaWJ1dGVPcmlnaW5hbFZhbHVlc10/IDogQXR0cmlidXRlT3JpZ2luYWxNYXBcbn1cbmludGVyZmFjZSBBdHRyaWJ1dGVPcmlnaW5hbE1hcCB7XG4gICAgW25hbWU6IHN0cmluZ106c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9uQXR0cmlidXRlc1NldEZyb21Tb3VyY2UoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBvcmlnaW5hbE1hcCA9IChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXVxuICAgIGlmKG9yaWdpbmFsTWFwKXtcbiAgICAgICAgZGVsZXRlIChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICAgICAgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcy5hZGQoZWxlbWVudCk7XG4gICAgfVxufVxuZnVuY3Rpb24gbm90ZU9yaWdpbmFsQXR0cmlidXRlKGVsZW1lbnQgOiBIVE1MRWxlbWVudCwgbmFtZSA6IHN0cmluZyl7XG4gICAgbGV0IG9yaWdpbmFscyA9IChlbGVtZW50IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXTtcbiAgICBpZighb3JpZ2luYWxzKXtcbiAgICAgICAgb3JpZ2luYWxzID0gKGVsZW1lbnQgYXMgT3JpZ2luYWxBdHRyaWJ1dGVWYWx1ZURvbSlbYXR0cmlidXRlT3JpZ2luYWxWYWx1ZXNdID0ge307XG4gICAgfVxuICAgIGlmKCEobmFtZSBpbiBvcmlnaW5hbHMpKXtcbiAgICAgICAgb3JpZ2luYWxzW25hbWVdID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgfVxufVxuXG5cbmNvbnN0IGlzU2V0QXR0cmlidXRlRGlyZWN0aXZlID0gYFske0F0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGV9PSR7RGlyZWN0aXZlVHlwZS5TZXRBdHRyaWJ1dGV9XWA7XG5jb25zdCBiYXNlUXVlcnlJc1NldEF0dHJpYnV0ZURpcmVjdGl2ZSA9IGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XSR7aXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmV9YDtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZURpcmVjdGl2ZXModGFyZ2V0IDogSFRNTEVsZW1lbnQpe1xuICAgIC8vRmlyc3QsIGZpbmQgYWxsIFNldEF0dHJpYnV0ZSBkaXJlY3RpdmVzIHRoYXQgYXBwbHkgdG8gdGFyZ2V0XG4gICAgY29uc3QgYXBwbGljYWJsZSA9IEFycmF5LmZyb20odGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoYmFzZVF1ZXJ5SXNTZXRBdHRyaWJ1dGVEaXJlY3RpdmUpKTtcbiAgICBsZXQgY3VycmVudCA6IEhUTUxFbGVtZW50fG51bGwgPSB0YXJnZXRcbiAgICB3aGlsZSh0cnVlKXtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZighY3VycmVudCB8fCAhY3VycmVudC5tYXRjaGVzKGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XVske0F0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmV9XWApKXtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICAvL05leHQsIGdyb3VwIHRoZW0gYnkgdGhlIGF0dHJpYnV0ZSB0aGV5IGFwcGx5IHRvXG4gICAgY29uc3QgYnlBdHRyaWJ1dGVOYW1lIDoge1tuYW1lOiBzdHJpbmddOlNldEF0dHJpYnV0ZVtdfSA9IHt9XG4gICAgZm9yKGxldCBlbCBvZiBhcHBsaWNhYmxlKXtcbiAgICAgICAgY29uc3QgYXNEaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsKTtcbiAgICAgICAgaWYoYXNEaXJlY3RpdmUgJiYgYXNEaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpe1xuICAgICAgICAgICAgbGV0IGFycmF5ID0gYnlBdHRyaWJ1dGVOYW1lW2FzRGlyZWN0aXZlLm5hbWVdO1xuICAgICAgICAgICAgaWYoIWFycmF5KXtcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJ5QXR0cmlidXRlTmFtZVthc0RpcmVjdGl2ZS5uYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyYXkucHVzaChhc0RpcmVjdGl2ZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL05vdywgYXBwbHkgb25seSB0aGUgbGFzdCBkaXJlY3RpdmUgZm9yIGV2ZXJ5IGF0dHJpYnV0ZVxuICAgIGZvcihsZXQgYXR0cmlidXRlIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJ5QXR0cmlidXRlTmFtZSkpe1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVzID0gYnlBdHRyaWJ1dGVOYW1lW2F0dHJpYnV0ZV07XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJlY3RpdmVzW2RpcmVjdGl2ZXMubGVuZ3RoIC0gMV0hIVxuXG4gICAgICAgIG5vdGVPcmlnaW5hbEF0dHJpYnV0ZSh0YXJnZXQsIGxhc3QubmFtZSk7XG4gICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUodGFyZ2V0LCBsYXN0Lm5hbWUsIGxhc3QudmFsdWUpO1xuICAgIH1cblxuICAgIC8vRmluYWxseSwgcmVzdG9yZSB0aGUgb3JpZ2luYWwgdmFsdWVzIGZvciBhbnkgYXR0cmlidXRlcyB0aGF0IG5vIGxvbmdlciBoYXZlIGRpcmVjdGl2ZXNcbiAgICBjb25zdCBvcmlnaW5hbHMgPSAodGFyZ2V0IGFzIE9yaWdpbmFsQXR0cmlidXRlVmFsdWVEb20pW2F0dHJpYnV0ZU9yaWdpbmFsVmFsdWVzXSB8fCB7fTtcbiAgICBmb3IobGV0IG9yaWdpbmFsIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9yaWdpbmFscykpe1xuICAgICAgICBpZighYnlBdHRyaWJ1dGVOYW1lW29yaWdpbmFsXSl7XG4gICAgICAgICAgICBhcHBseUF0dHJpYnV0ZVZhbHVlKHRhcmdldCwgb3JpZ2luYWwsIG9yaWdpbmFsc1tvcmlnaW5hbF0pO1xuICAgICAgICAgICAgZGVsZXRlIG9yaWdpbmFsc1tvcmlnaW5hbF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxubGV0IHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMgOiBTZXQ8SFRNTEVsZW1lbnQ+ID0gbmV3IFNldCgpO1xuZXhwb3J0IGZ1bmN0aW9uIGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcyhjYiA6ICgpPT52b2lkKXtcbiAgICB0cnkge1xuICAgICAgICBjYigpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZm9yKGxldCB0YXJnZXQgb2YgdGFyZ2V0c1dpdGhDaGFuZ2VkQXR0cmlidXRlRGlyZWN0aXZlcyl7XG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzKHRhcmdldClcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzID0gbmV3IFNldCgpO1xuICAgIH1cbn1cblxuY29uc3Qgc2V0QXR0cmlidXRlVGFyZ2V0ID0gU3ltYm9sKCk7XG5pbnRlcmZhY2UgU2V0QXR0cmlidXRlRG9tIHtcbiAgICBbc2V0QXR0cmlidXRlVGFyZ2V0XT86IEhUTUxFbGVtZW50XG59XG5leHBvcnQgZnVuY3Rpb24gbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZShpbmZvIDogQWRkZWRUYXJnZXRJbmZvKXtcbiAgICB0YXJnZXRzV2l0aENoYW5nZWRBdHRyaWJ1dGVEaXJlY3RpdmVzLmFkZChpbmZvLnRhcmdldCk7XG4gICAgKDxTZXRBdHRyaWJ1dGVEb20+aW5mby5lbGVtZW50KVtzZXRBdHRyaWJ1dGVUYXJnZXRdID0gaW5mby50YXJnZXRcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGVsZW1lbnQgOiBIVE1MRWxlbWVudCl7XG4gICAgY29uc3QgdGFyZ2V0ID0gKDxTZXRBdHRyaWJ1dGVEb20+ZWxlbWVudClbc2V0QXR0cmlidXRlVGFyZ2V0XVxuICAgIGlmKHRhcmdldCl7XG4gICAgICAgIHRhcmdldHNXaXRoQ2hhbmdlZEF0dHJpYnV0ZURpcmVjdGl2ZXMuYWRkKHRhcmdldCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQgOiBIVE1MRWxlbWVudCwgbmFtZSA6IHN0cmluZywgdmFsdWUgOiBzdHJpbmd8bnVsbCl7XG4gICAgaWYodmFsdWUgPT0gbnVsbCl7XG4gICAgICAgIHRhcmdldC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSlcbiAgICB9XG4gICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiAobmFtZSA9PSBcInZhbHVlXCIgfHwgbmFtZSA9PSBcImNoZWNrZWRcIikpe1xuICAgICAgICAvL1RoZXNlIHNwZWNpYWwgdmFsdWVzIGhhdmUgZWZmZWN0cyBvbmx5IG9uIHRoZSBcImluaXRpYWxcIiBpbnNlcnRpb24gb2YgYSBET00gb2JqZWN0O1xuICAgICAgICAvL2ZvciBjb25zaXN0ZW5jeSB3ZSBhbHdheXMgYXBwbHkgdGhlc2UgZWZmZWN0c1xuICAgICAgICBpZihuYW1lID09IFwidmFsdWVcIiAmJiB0YXJnZXQudmFsdWUgIT0gdmFsdWUpe1xuICAgICAgICAgICAgc3VwcHJlc3NDaGFuZ2VMaXN0ZW5lcnModGFyZ2V0LCAoKT0+e1xuICAgICAgICAgICAgICAgIHRhcmdldC52YWx1ZSA9IHZhbHVlID8/IFwiXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZihuYW1lID09IFwiY2hlY2tlZFwiICYmIHRhcmdldC5jaGVja2VkICE9ICh2YWx1ZSAhPSBudWxsKSl7XG4gICAgICAgICAgICBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQsICgpPT57XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmNoZWNrZWQgPSB2YWx1ZSAhPSBudWxsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdXBwcmVzc0NoYW5nZUxpc3RlbmVycyh0YXJnZXQgOiBIVE1MSW5wdXRFbGVtZW50LCBjYiA6ICgpPT52b2lkKXtcbiAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gdHJ1ZVxuICAgIGNvbnN0IG9sZE9uQ2hhbmdlID0gdGFyZ2V0Lm9uY2hhbmdlXG4gICAgdGFyZ2V0Lm9uY2hhbmdlID0gbnVsbFxuICAgIHRyeSB7XG4gICAgICAgIGNiKClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICB0YXJnZXQub25jaGFuZ2UgPSBvbGRPbkNoYW5nZVxuICAgICAgICBzdXBwcmVzc0V2ZW50RmlyaW5nLnN1cHByZXNzID0gZmFsc2VcbiAgICB9XG59IiwiaW1wb3J0IHtldmFsdWF0ZVNjcmlwdCwgbWFrZUV2YWxTY29wZX0gZnJvbSBcIi4vZXZhbFwiO1xuaW1wb3J0IHtBZGRlZFRhcmdldEluZm8sIEFwcGx5SnN9IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcblxuaW50ZXJmYWNlIFNjcmlwdFByZXZpb3VzIHtcbiAgICBqcyA6IHN0cmluZ1xuICAgIHRhcmdldCA6IEhUTUxFbGVtZW50XG59XG5jb25zdCBzY3JpcHRQcmV2aW91cyA9IFN5bWJvbCgpXG5pbnRlcmZhY2UgSGFzU2NyaXB0UHJldmlvdXMgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgW3NjcmlwdFByZXZpb3VzXT8gOiBTY3JpcHRQcmV2aW91c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuRWxlbWVudFNjcmlwdChkaXJlY3RpdmUgOiBBcHBseUpzLCBpbmZvIDogQWRkZWRUYXJnZXRJbmZvKXtcbiAgICBjb25zdCBvbGQgPSAoaW5mby5lbGVtZW50IGFzIEhhc1NjcmlwdFByZXZpb3VzKVtzY3JpcHRQcmV2aW91c11cbiAgICBpZighZGlyZWN0aXZlLm9ubHlPbkNyZWF0ZSB8fCAhb2xkIHx8IG9sZC5qcyAhPSBkaXJlY3RpdmUuanMgfHwgb2xkLnRhcmdldCAhPSBpbmZvLnRhcmdldCl7XG4gICAgICAgIChpbmZvLmVsZW1lbnQgYXMgSGFzU2NyaXB0UHJldmlvdXMpW3NjcmlwdFByZXZpb3VzXSA9IHtcbiAgICAgICAgICAgIGpzOiBkaXJlY3RpdmUuanMsXG4gICAgICAgICAgICB0YXJnZXQ6IGluZm8udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGl0ID0gaW5mby50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gbWFrZUV2YWxTY29wZSh7XG4gICAgICAgICAgICBpdFxuICAgICAgICB9KVxuICAgICAgICBldmFsdWF0ZVNjcmlwdCh1bmRlZmluZWQsIHNjb3BlLCBkaXJlY3RpdmUuanMpXG4gICAgfVxufSIsImltcG9ydCB7QXR0cmlidXRlTmFtZXMsIGNvbXBvbmVudElkRW5kU3VmZml4LCBjb21wb25lbnRJZFByZWZpeCwgRGlyZWN0aXZlVHlwZSwgc2NyaXB0VHlwZVNpZ25pZmllcn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQge3F1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0fSBmcm9tIFwiLi91dGlsaXR5XCI7XG5pbXBvcnQge2NoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcywgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZSwgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZVJlbW92ZX0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuaW1wb3J0IHtydW5FbGVtZW50U2NyaXB0fSBmcm9tIFwiLi9hcHBseWpzXCI7XG5pbXBvcnQge3JlbW92ZUV2ZW50SGFuZGxlciwgc2V0dXBFdmVudEhhbmRsZXJ9IGZyb20gXCIuL2V2ZW50c1wiO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhcnQge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpZCA6IHN0cmluZyl7fVxufVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEVuZCB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGlkIDogc3RyaW5nKXt9XG59XG5leHBvcnQgY2xhc3MgS2VlcCB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGlkIDogc3RyaW5nKXt9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRBdHRyaWJ1dGUge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lIDogc3RyaW5nLCBwdWJsaWMgdmFsdWUgOiBzdHJpbmd8bnVsbCl7fVxufVxuXG5leHBvcnQgY2xhc3MgQXBwbHlKcyB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGpzIDogc3RyaW5nLCBwdWJsaWMgb25seU9uQ3JlYXRlIDogYm9vbGVhbil7fVxufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIGV2ZW50TmFtZSA6IHN0cmluZyxcbiAgICAgICAgcHVibGljIGNhbGxiYWNrSWQgOiBudW1iZXIsXG4gICAgICAgIHB1YmxpYyBwcmVmaXggOiBzdHJpbmd8bnVsbCxcbiAgICAgICAgcHVibGljIHN1ZmZpeCA6IHN0cmluZ3xudWxsLFxuICAgICAgICBwdWJsaWMgZGF0YSA6IHN0cmluZ3xudWxsXG4gICAgKXt9XG59XG5leHBvcnQgdHlwZSBEaXJlY3RpdmUgPSBDb21wb25lbnRTdGFydCB8IENvbXBvbmVudEVuZCB8IEtlZXAgfCBBcHBseUpzIHwgU2V0QXR0cmlidXRlIHwgRXZlbnRIYW5kbGVyXG5leHBvcnQgZnVuY3Rpb24gYXNTaGFkZURpcmVjdGl2ZShjaGlsZCA6IE5vZGUpIDogRGlyZWN0aXZlfG51bGwge1xuICAgIGlmKGNoaWxkIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgY2hpbGQudGFnTmFtZSA9PSBcIlNDUklQVFwiICYmIGNoaWxkLmdldEF0dHJpYnV0ZShcInR5cGVcIikgPT09IHNjcmlwdFR5cGVTaWduaWZpZXIpe1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkRpcmVjdGl2ZVR5cGUpXG4gICAgICAgIGNvbnN0IGlkID0gY2hpbGQuaWRcbiAgICAgICAgc3dpdGNoKGRpcmVjdGl2ZVR5cGUpe1xuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkFwcGx5SnM6XG4gICAgICAgICAgICAgICAgY29uc3QgcnVuT3B0aW9uID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNSdW5PcHRpb24pXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NyaXB0ID0gY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkFwcGx5SnNTY3JpcHQpISFcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEFwcGx5SnMoc2NyaXB0LCBydW5PcHRpb24gPT09IFwiMVwiKVxuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkNvbXBvbmVudFN0YXJ0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50U3RhcnQoaWQuc3Vic3RyaW5nKGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCkpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50RW5kOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50RW5kKGlkLnN1YnN0cmluZyhjb21wb25lbnRJZFByZWZpeC5sZW5ndGgsIGlkLmxlbmd0aCAtIGNvbXBvbmVudElkRW5kU3VmZml4Lmxlbmd0aCkpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuQ29tcG9uZW50S2VlcDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEtlZXAoaWQuc3Vic3RyaW5nKGNvbXBvbmVudElkUHJlZml4Lmxlbmd0aCkpXG4gICAgICAgICAgICBjYXNlIERpcmVjdGl2ZVR5cGUuU2V0QXR0cmlidXRlOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5TZXRBdHRyaWJ1dGVOYW1lKSEhXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuU2V0QXR0cmlidXRlVmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBEaXJlY3RpdmVUeXBlLkV2ZW50SGFuZGxlcjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnROYW1lKSEhXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSArY2hpbGQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLkV2ZW50Q2FsbGJhY2tJZCkhIVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudFByZWZpeClcbiAgICAgICAgICAgICAgICBjb25zdCBzdWZmaXggPSBjaGlsZC5nZXRBdHRyaWJ1dGUoQXR0cmlidXRlTmFtZXMuRXZlbnRTdWZmaXgpXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNoaWxkLmdldEF0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5FdmVudERhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudEhhbmRsZXIobmFtZSwgaWQsIHByZWZpeCwgc3VmZml4LCBkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRBbGxEaXJlY3RpdmVzKGJhc2UgOiBIVE1MRWxlbWVudCkge1xuICAgIGNoYW5naW5nRGlyZWN0aXZlcygoKT0+e1xuICAgICAgICBjaGVja0RpcmVjdGl2ZUFkZChiYXNlKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZVNjcmlwdFRhcmdldChzY3JpcHQgOiBIVE1MRWxlbWVudCkgOiBIVE1MRWxlbWVudHxudWxsIHtcbiAgICBpZihzY3JpcHQuaGFzQXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLlRhcmdldFNpYmxpbmdEaXJlY3RpdmUpKXtcbiAgICAgICAgbGV0IHRhcmdldCA6IEVsZW1lbnR8bnVsbCA9IHNjcmlwdFxuICAgICAgICB3aGlsZSh0YXJnZXQgJiYgdGFyZ2V0Lmhhc0F0dHJpYnV0ZShBdHRyaWJ1dGVOYW1lcy5UYXJnZXRTaWJsaW5nRGlyZWN0aXZlKSl7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQgYXMgKEhUTUxFbGVtZW50fG51bGwpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwdC5wYXJlbnRFbGVtZW50ISFcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFyZ2V0SW5mbyB7XG4gICAgZWxlbWVudCA6IEhUTUxFbGVtZW50XG4gICAgZGlyZWN0aXZlIDogRGlyZWN0aXZlXG59XG5leHBvcnQgaW50ZXJmYWNlIEFkZGVkVGFyZ2V0SW5mbyBleHRlbmRzIFRhcmdldEluZm8ge1xuICAgIHRhcmdldCA6IEhUTUxFbGVtZW50XG59XG5cbmxldCBjaGFuZ2VkRGlyZWN0aXZlcyA6IFRhcmdldEluZm9bXSA9IFtdO1xubGV0IHJlbW92ZWREaXJlY3RpdmVzIDogVGFyZ2V0SW5mb1tdID0gW107XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdpbmdEaXJlY3RpdmVzKGNiIDogKCk9PnZvaWQpe1xuICAgIGNoYW5naW5nQXR0cmlidXRlRGlyZWN0aXZlcygoKT0+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2IoKVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgZm9yKGxldCBjaGFuZ2VkIG9mIGNoYW5nZWREaXJlY3RpdmVzKXtcbiAgICAgICAgICAgICAgICBvbkFkZGVkT3JVcGRhdGVkKGNoYW5nZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKGxldCByZW1vdmVkIG9mIHJlbW92ZWREaXJlY3RpdmVzKXtcbiAgICAgICAgICAgICAgICBvblJlbW92ZWQocmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNoYW5nZWREaXJlY3RpdmVzID0gW107XG4gICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcyA9IFtdO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGFuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4gdGhhdCBoYXZlIGp1c3QgYmVlbiBhZGRlZCBmb3Igc2hhZGUgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVBZGQoZWxlbWVudCA6IE5vZGUpe1xuICAgIGlmKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgIGZvcihsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGVsZW1lbnQsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKXtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KVxuICAgICAgICAgICAgaWYoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKXtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkRGlyZWN0aXZlcy5wdXNoKHtkaXJlY3RpdmUsIGVsZW1lbnQ6IHNjcmlwdH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBhbmQgcmVjb3JkcyB3aGV0aGVyIGFuIGVsZW1lbnQgdGhhdCBjaGFuZ2VkIGlzIGEgc2NyaXB0IGRpcmVjdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVDaGFuZ2UoZWxlbWVudCA6IEhUTUxFbGVtZW50KXtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSBhc1NoYWRlRGlyZWN0aXZlKGVsZW1lbnQpXG4gICAgaWYoZGlyZWN0aXZlKXtcbiAgICAgICAgY2hhbmdlZERpcmVjdGl2ZXMucHVzaCh7ZGlyZWN0aXZlLCBlbGVtZW50fSk7XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBhbiBlbGVtZW50IGFuZCBhbGwgaXRzIGNoaWxkcmVuIHRoYXQgaGF2ZSBqdXN0IGJlZW4gcmVtb3ZlZCBmb3Igc2hhZGUgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEaXJlY3RpdmVSZW1vdmUoZWxlbWVudCA6IE5vZGUpe1xuICAgIGlmKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7XG4gICAgICAgIGZvcihsZXQgc2NyaXB0IG9mIHF1ZXJ5U2VsZWN0b3JBbGxQbHVzVGFyZ2V0KGVsZW1lbnQsIGBzY3JpcHRbdHlwZT0ke3NjcmlwdFR5cGVTaWduaWZpZXJ9XWApKXtcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoc2NyaXB0KVxuICAgICAgICAgICAgaWYoc2NyaXB0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgZGlyZWN0aXZlKXtcbiAgICAgICAgICAgICAgICByZW1vdmVkRGlyZWN0aXZlcy5wdXNoKHtkaXJlY3RpdmUsIGVsZW1lbnQ6IHNjcmlwdH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENhbGxlZCBhZnRlciB0aGUgZGlyZWN0aXZlIGNvbnRhaW5lZCBpbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25BZGRlZE9yVXBkYXRlZChpbmZvIDogVGFyZ2V0SW5mbykge1xuICAgIGNvbnN0IHRhcmdldCA9IGRldGVybWluZVNjcmlwdFRhcmdldChpbmZvLmVsZW1lbnQpXG4gICAgaWYodGFyZ2V0KXtcbiAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmU7XG4gICAgICAgIGNvbnN0IGFkZEluZm8gPSB7Li4uaW5mbywgdGFyZ2V0fVxuICAgICAgICBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpe1xuICAgICAgICAgICAgbm90ZUF0dHJpYnV0ZURpcmVjdGl2ZUNoYW5nZShhZGRJbmZvKTtcbiAgICAgICAgfSBlbHNlIGlmKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIEFwcGx5SnMpe1xuICAgICAgICAgICAgcnVuRWxlbWVudFNjcmlwdChkaXJlY3RpdmUsIGFkZEluZm8pXG4gICAgICAgIH0gZWxzZSBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBFdmVudEhhbmRsZXIpe1xuICAgICAgICAgICAgc2V0dXBFdmVudEhhbmRsZXIoZGlyZWN0aXZlLCBhZGRJbmZvKVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgVW5rbm93biB0YXJnZXQgZm9yICR7aW5mby5lbGVtZW50Lm91dGVySFRNTH1gKVxuICAgIH1cbn1cbmZ1bmN0aW9uIG9uUmVtb3ZlZChpbmZvIDogVGFyZ2V0SW5mbyl7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gaW5mby5kaXJlY3RpdmVcbiAgICBpZihkaXJlY3RpdmUgaW5zdGFuY2VvZiBTZXRBdHRyaWJ1dGUpe1xuICAgICAgICBub3RlQXR0cmlidXRlRGlyZWN0aXZlUmVtb3ZlKGluZm8uZWxlbWVudClcbiAgICB9XG4gICAgaWYoZGlyZWN0aXZlIGluc3RhbmNlb2YgRXZlbnRIYW5kbGVyKXtcbiAgICAgICAgcmVtb3ZlRXZlbnRIYW5kbGVyKGRpcmVjdGl2ZSwgaW5mbylcbiAgICB9XG59IiwiLy9SZWNvbmNpbGUgYSB0YXJnZXRJZCB3aXRoIEhUTUxcbmltcG9ydCB7XG4gICAgYXNTaGFkZURpcmVjdGl2ZSxcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMsXG4gICAgY2hlY2tEaXJlY3RpdmVBZGQsXG4gICAgY2hlY2tEaXJlY3RpdmVDaGFuZ2UsXG4gICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUsXG4gICAgQ29tcG9uZW50RW5kLFxuICAgIENvbXBvbmVudFN0YXJ0LFxuICAgIEtlZXAsXG59IGZyb20gXCIuL2RpcmVjdGl2ZXNcIjtcbmltcG9ydCB7QXR0cmlidXRlTmFtZXMsIGNvbXBvbmVudElkUHJlZml4fSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7YXBwbHlBdHRyaWJ1dGVWYWx1ZSwgb25BdHRyaWJ1dGVzU2V0RnJvbVNvdXJjZX0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVjb25jaWxlKHRhcmdldElkIDogbnVtYmVyLCBodG1sIDogc3RyaW5nKXtcbiAgICBjaGFuZ2luZ0RpcmVjdGl2ZXMoKCk9PntcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29tcG9uZW50SWRQcmVmaXgrdGFyZ2V0SWQpO1xuICAgICAgICBpZighdGFyZ2V0KXsgcmV0dXJuIH1cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQhIVxuICAgICAgICBjb25zdCBodG1sRG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChwYXJlbnQudGFnTmFtZSk7XG4gICAgICAgIGh0bWxEb20uaW5uZXJIVE1MID0gaHRtbDtcblxuXG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gdGFyZ2V0Lm5leHRTaWJsaW5nO1xuICAgICAgICB3aGlsZShjdXJyZW50ICE9IG51bGwpe1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY3VycmVudClcbiAgICAgICAgICAgIGlmKGN1cnJlbnREaXJlY3RpdmUgaW5zdGFuY2VvZiBDb21wb25lbnRFbmQgJiYgY3VycmVudERpcmVjdGl2ZS5pZCA9PSBcIlwiK3RhcmdldElkKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluY2x1ZGVkLnB1c2goY3VycmVudCk7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0U2libGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGNoQ2hpbGRyZW4ocGFyZW50LCB0YXJnZXQsIGluY2x1ZGVkLCBodG1sRG9tLmNoaWxkTm9kZXMpO1xuICAgIH0pO1xufVxuXG5cblxuXG5pbnRlcmZhY2UgQ2hpbGROb2RlTGlzdExpa2Uge1xuICAgIGxlbmd0aCA6IG51bWJlcjtcbiAgICBbaW5kZXg6IG51bWJlcl0gOiBOb2RlXG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgc3RhcnREaXJlY3RpdmUgOiBDb21wb25lbnRTdGFydCxcbiAgICAgICAgcHVibGljIHN0YXJ0IDogTm9kZSxcbiAgICAgICAgcHVibGljIGNoaWxkcmVuIDogTm9kZVtdLFxuICAgICAgICBwdWJsaWMgZW5kIDogTm9kZVxuICAgICl7fVxuXG4gICAgYXNOb2Rlcygpe1xuICAgICAgICByZXR1cm4gW3RoaXMuc3RhcnQsIC4uLnRoaXMuY2hpbGRyZW4sIHRoaXMuZW5kXVxuICAgIH1cblxuICAgIGlkKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0RGlyZWN0aXZlLmlkXG4gICAgfVxufVxudHlwZSBOb2RlT3JDb21wb25lbnQgPSAoTm9kZXxDb21wb25lbnQpO1xuZnVuY3Rpb24gYXNOb2Rlcyh0YXJnZXQgOiBOb2RlT3JDb21wb25lbnQpe1xuICAgIHJldHVybiB0YXJnZXQgaW5zdGFuY2VvZiBDb21wb25lbnQgPyB0YXJnZXQuYXNOb2RlcygpIDogW3RhcmdldF1cbn1cblxuXG5mdW5jdGlvbiByZWNvbmNpbGVOb2RlcyhvcmlnaW5hbCA6IE5vZGUsIG5ld2VyIDogTm9kZSkgOiBOb2RlIHtcbiAgICBpZihvcmlnaW5hbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIG5ld2VyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuICAgICAgICBpZihvcmlnaW5hbC50YWdOYW1lICE9IG5ld2VyLnRhZ05hbWUpe1xuICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVBZGQobmV3ZXIpO1xuICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUob3JpZ2luYWwpO1xuICAgICAgICAgICAgcmV0dXJuIG5ld2VyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZVxuICAgICAgICAgICAgZm9yKGNvbnN0IGF0dHJpYnV0ZSBvZiBvcmlnaW5hbC5nZXRBdHRyaWJ1dGVOYW1lcygpKXtcbiAgICAgICAgICAgICAgICBpZighbmV3ZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpe1xuICAgICAgICAgICAgICAgICAgICBhcHBseUF0dHJpYnV0ZVZhbHVlKG9yaWdpbmFsLCBhdHRyaWJ1dGUsIG51bGwpXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8bmV3ZXIuYXR0cmlidXRlcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBuZXdlci5hdHRyaWJ1dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkZXJBdHRyID0gb3JpZ2luYWwuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3ZXJBdHRyID0gbmV3ZXIuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkhXG4gICAgICAgICAgICAgICAgaWYob2xkZXJBdHRyICE9IG5ld2VyQXR0cil7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5QXR0cmlidXRlVmFsdWUob3JpZ2luYWwsIGF0dHJpYnV0ZSwgbmV3ZXJBdHRyKVxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihjaGFuZ2VkKXtcbiAgICAgICAgICAgICAgICBvbkF0dHJpYnV0ZXNTZXRGcm9tU291cmNlKG9yaWdpbmFsKTtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZUNoYW5nZShvcmlnaW5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRjaENoaWxkcmVuKG9yaWdpbmFsLCBudWxsLCBvcmlnaW5hbC5jaGlsZE5vZGVzLCBuZXdlci5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWwgaW5zdGFuY2VvZiBUZXh0ICYmIG5ld2VyIGluc3RhbmNlb2YgVGV4dCl7XG4gICAgICAgIGlmKG9yaWdpbmFsLnRleHRDb250ZW50ID09IG5ld2VyLnRleHRDb250ZW50KXtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXdlcjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXdlcjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4oXG4gICAgZG9tIDogSFRNTEVsZW1lbnQsXG4gICAgYXBwZW5kU3RhcnQgOiBIVE1MRWxlbWVudHxudWxsLFxuICAgIGRvbUNoaWxkcmVuIDogQ2hpbGROb2RlTGlzdExpa2UsXG4gICAgcmVwbGFjZW1lbnRDaGlsZHJlbiA6IENoaWxkTm9kZUxpc3RMaWtlXG4pe1xuICAgIGNvbnN0IGZpbmFsID0gcmVjb25jaWxlQ2hpbGRyZW4oZG9tLCBkb21DaGlsZHJlbiwgcmVwbGFjZW1lbnRDaGlsZHJlbik7XG4gICAgbGV0IGVuZE9mUGF0Y2hSYW5nZSA6IE5vZGV8bnVsbDtcbiAgICBpZihkb21DaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVuZE9mUGF0Y2hSYW5nZSA9IGRvbUNoaWxkcmVuW2RvbUNoaWxkcmVuLmxlbmd0aCAtIDFdLm5leHRTaWJsaW5nO1xuICAgIH0gZWxzZSBpZiAoYXBwZW5kU3RhcnQpe1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBhcHBlbmRTdGFydC5uZXh0U2libGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbmRPZlBhdGNoUmFuZ2UgPSBudWxsO1xuICAgIH1cblxuICAgIGxldCBjdXJyZW50IDogTm9kZXxcInN0YXJ0XCJ8XCJlbmRcIiA9IGFwcGVuZFN0YXJ0ID8gYXBwZW5kU3RhcnQgOiBcInN0YXJ0XCI7XG4gICAgZnVuY3Rpb24gYWZ0ZXJDdXJyZW50KCkgOiBOb2RlfFwiZW5kXCIge1xuICAgICAgICBpZihjdXJyZW50ID09IFwic3RhcnRcIil7XG4gICAgICAgICAgICByZXR1cm4gZG9tLmZpcnN0Q2hpbGQgPyBkb20uZmlyc3RDaGlsZCA6IFwiZW5kXCI7XG4gICAgICAgIH0gZWxzZSBpZihjdXJyZW50ID09IFwiZW5kXCIpe1xuICAgICAgICAgICAgcmV0dXJuIFwiZW5kXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudC5uZXh0U2libGluZyA/IGN1cnJlbnQubmV4dFNpYmxpbmcgOiBcImVuZFwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcihjb25zdCBjaGlsZCBvZiBmaW5hbCl7XG4gICAgICAgIGxldCBuZXh0ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGlmKG5leHQgIT09IGNoaWxkKXtcbiAgICAgICAgICAgIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQgPT09IFwiZW5kXCIgPyBudWxsIDogbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGNoaWxkO1xuICAgIH1cbiAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgd2hpbGUoY3VycmVudCAhPSBcImVuZFwiICYmIGN1cnJlbnQgIT0gZW5kT2ZQYXRjaFJhbmdlKXtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjdXJyZW50O1xuICAgICAgICBjdXJyZW50ID0gYWZ0ZXJDdXJyZW50KCk7XG4gICAgICAgIGRvbS5yZW1vdmVDaGlsZChjaGlsZCk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIHJlY29uY2lsZUNoaWxkcmVuKFxuICAgIGRvbSA6IEhUTUxFbGVtZW50LFxuICAgIGRvbUNoaWxkcmVuIDogQ2hpbGROb2RlTGlzdExpa2UsXG4gICAgcmVwbGFjZW1lbnRDaGlsZHJlbiA6IENoaWxkTm9kZUxpc3RMaWtlXG4pIDogTm9kZVtdIHtcbiAgICBjb25zdCBvcmlnaW5hbHMgPSBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKGRvbUNoaWxkcmVuKTtcbiAgICBjb25zdCByZXBsYWNlbWVudHMgPSBjb2xsYXBzZUNvbXBvbmVudENoaWxkcmVuKHJlcGxhY2VtZW50Q2hpbGRyZW4pO1xuICAgIGNvbnN0IG9yaWdpbmFsS2V5cyA9IGNvbGxlY3RLZXlzTWFwKG9yaWdpbmFscyk7XG5cbiAgICBsZXQgb3JpZ2luYWxJbmRleCA9IDA7XG4gICAgbGV0IHJlcGxhY2VtZW50SW5kZXggPSAwO1xuXG4gICAgY29uc3QgZmluYWxDaGlsZHJlbiA6IE5vZGVbXSA9IFtdO1xuXG4gICAgd2hpbGUob3JpZ2luYWxJbmRleCA8IG9yaWdpbmFscy5sZW5ndGggfHwgcmVwbGFjZW1lbnRJbmRleCA8IHJlcGxhY2VtZW50cy5sZW5ndGgpe1xuICAgICAgICBsZXQgb3JpZ2luYWwgOiBOb2RlT3JDb21wb25lbnR8dW5kZWZpbmVkID0gb3JpZ2luYWxzW29yaWdpbmFsSW5kZXhdO1xuICAgICAgICBjb25zdCBuZXdlciA6IE5vZGVPckNvbXBvbmVudHx1bmRlZmluZWQgPSByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRJbmRleF07XG4gICAgICAgIGlmKG9yaWdpbmFsICYmICFuZXdlcikge1xuICAgICAgICAgICAgLyogSW1wbGljaXQgcmVtb3ZlICovXG4gICAgICAgICAgICBmb3IobGV0IG5vZGUgb2YgYXNOb2RlcyhvcmlnaW5hbCkpe1xuICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlUmVtb3ZlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3JpZ2luYWxJbmRleCArPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgVGV4dCkge1xuICAgICAgICAgICAgLy9UZXh0IG5vZGVzIGhhdmUgbm8gaW50ZXJlc3RpbmcgaWRlbnRpdHkgb3IgY2hpbGRyZW4gdG8gcHJlc2VydmUsIGFuZCB0aGVcbiAgICAgICAgICAgIC8vS290bGluIHNpZGUgY2FuJ3QgdHJhY2sgdGhlbSBmb3IgcG9zaXRpb24gbWF0Y2hpbmcsIHNvIHdlIGp1c3Qgc2tpcCBvdmVyIHRoZW1cbiAgICAgICAgICAgIC8vaW4gY29tcGFyaXNvbnMgYW5kIGFkZCB0aGUgbmV3ZXIgdGV4dCBhbHdheXMuXG4gICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAobmV3ZXIgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpXG4gICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL1RoZSBzZXJ2ZXIgZG9lcyBub3QgdHJhY2sgdGhlIHBvc2l0aW9uIG9mIG1vc3QgZGlyZWN0aXZlcywgZXhjZXB0IGtlZXAsIHNvIHRoZXkgYXJlIHNwZWNpYWxseSBoYW5kbGVkXG4gICAgICAgICAgICAvL2ZvciBtYXRjaGluZ1xuICAgICAgICAgICAgY29uc3QgbmV3ZXJEaXJlY3RpdmUgPSBuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCA/IG51bGwgOiBhc1NoYWRlRGlyZWN0aXZlKG5ld2VyKVxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxJc0RpcmVjdGl2ZSA9IG9yaWdpbmFsIGluc3RhbmNlb2YgTm9kZSAmJiBhc1NoYWRlRGlyZWN0aXZlKG9yaWdpbmFsKSAhPSBudWxsXG4gICAgICAgICAgICBpZihuZXdlciBpbnN0YW5jZW9mIE5vZGUgJiYgbmV3ZXJEaXJlY3RpdmUgIT0gbnVsbCAmJiAhKG5ld2VyRGlyZWN0aXZlIGluc3RhbmNlb2YgS2VlcCkpe1xuICAgICAgICAgICAgICAgIGlmKG9yaWdpbmFsSXNEaXJlY3RpdmUpe1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gocmVjb25jaWxlTm9kZXMob3JpZ2luYWwgYXMgTm9kZSwgbmV3ZXIpKVxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2gobmV3ZXIpXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5ld2VyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudEluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcmlnaW5hbElzRGlyZWN0aXZlKXtcbiAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShvcmlnaW5hbCBhcyBOb2RlKVxuICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld2VyS2V5ID0gZ2V0S2V5KG5ld2VyKTtcbiAgICAgICAgICAgIGlmKG5ld2VyS2V5ICE9IG51bGwpe1xuICAgICAgICAgICAgICAgIC8vV2UnbGwgZGlyZWN0bHkgbWF0Y2ggdG8gdGhlIG9yaWdpbmFsIGJ5IGtleSwgaWdub3Jpbmcgd2hhdCdzIHVzdWFsbHkgYXQgdGhpcyBwb3NpdGlvblxuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gb3JpZ2luYWxLZXlzW25ld2VyS2V5XT8ucG9wKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBhZGQgOiBOb2RlW10gPSBbXTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdXNlTmV3ZXIoKXtcbiAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG5ld2VyISk7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBub2RlIG9mIGFkZCl7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGlyZWN0aXZlQWRkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihvcmlnaW5hbCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0RpcmVjdGl2ZVJlbW92ZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBpZihvcmlnaW5hbCAmJiBvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCAmJiBuZXdlckRpcmVjdGl2ZSBpbnN0YW5jZW9mIEtlZXAgJiYgKG5ld2VyRGlyZWN0aXZlLmlkID09IG9yaWdpbmFsLmlkKCkgfHwgbmV3ZXJLZXkpKXtcbiAgICAgICAgICAgICAgICBhZGQgPSBhc05vZGVzKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYoIW9yaWdpbmFsKXtcbiAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZihuZXdlciBpbnN0YW5jZW9mIENvbXBvbmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihvcmlnaW5hbCBpbnN0YW5jZW9mIENvbXBvbmVudCAmJiBvcmlnaW5hbC5pZCgpID09IG5ld2VyLmlkKCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlY29uY2lsZUNoaWxkcmVuKGRvbSwgb3JpZ2luYWwuY2hpbGRyZW4sIG5ld2VyLmNoaWxkcmVuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWwuZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VOZXdlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYob3JpZ2luYWwgaW5zdGFuY2VvZiBDb21wb25lbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlTmV3ZXIoKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkID0gW3JlY29uY2lsZU5vZGVzKG9yaWdpbmFsLCBuZXdlcildXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbENoaWxkcmVuLnB1c2goLi4uYWRkKTtcbiAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggKz0gMTtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50SW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vQWxsIHJlbWFpbmluZyBrZXlzIGluIHRoZSBtYXAgd2lsbCBub3QgaGF2ZSBiZWVuIHVzZWQuXG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvcmlnaW5hbEtleXMpKXtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxzID0gb3JpZ2luYWxLZXlzW2tleV07XG4gICAgICAgIGZvcihsZXQgb3JpZ2luYWwgb2Ygb3JpZ2luYWxzKXtcbiAgICAgICAgICAgIGZvcihsZXQgbm9kZSBvZiBhc05vZGVzKG9yaWdpbmFsKSl7XG4gICAgICAgICAgICAgICAgY2hlY2tEaXJlY3RpdmVSZW1vdmUobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmluYWxDaGlsZHJlbjtcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VDb21wb25lbnRDaGlsZHJlbihsaXN0IDogQ2hpbGROb2RlTGlzdExpa2UpIDogTm9kZU9yQ29tcG9uZW50W10ge1xuICAgIGNvbnN0IHJlc3VsdCA6IE5vZGVPckNvbXBvbmVudFtdID0gW107XG4gICAgZm9yKGxldCBpPTA7aTxsaXN0Lmxlbmd0aDtpKyspe1xuICAgICAgICBjb25zdCBjaGlsZCA9IGxpc3RbaV07XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGFzU2hhZGVEaXJlY3RpdmUoY2hpbGQpXG4gICAgICAgIGxldCBlbmQgOiBOb2RlfG51bGwgPSBudWxsXG4gICAgICAgIGlmKGRpcmVjdGl2ZSBpbnN0YW5jZW9mIENvbXBvbmVudFN0YXJ0KXtcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50IDogTm9kZVtdID0gW107XG4gICAgICAgICAgICB3aGlsZShpIDwgbGlzdC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YkNoaWxkID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEFzRGlyZWN0aXZlID0gYXNTaGFkZURpcmVjdGl2ZShzdWJDaGlsZClcbiAgICAgICAgICAgICAgICBpZihjaGlsZEFzRGlyZWN0aXZlIGluc3RhbmNlb2YgQ29tcG9uZW50RW5kICYmIGNoaWxkQXNEaXJlY3RpdmUuaWQgPT0gZGlyZWN0aXZlLmlkKXtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ViQ2hpbGRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQucHVzaChzdWJDaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGVuZCA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIk1pc3NpbmcgZW5kIHRhZyBmb3IgY29tcG9uZW50IFwiICsgZGlyZWN0aXZlLmlkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IENvbXBvbmVudChkaXJlY3RpdmUsIGNoaWxkLCBjb21wb25lbnQsIGVuZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hpbGQpXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gY29sbGVjdEtleXNNYXAoY2hpbGRMaXN0IDogTm9kZU9yQ29tcG9uZW50W10pIDoge1trZXk6c3RyaW5nXSA6IEFycmF5PE5vZGVPckNvbXBvbmVudD59IHtcbiAgICBjb25zdCBrZXlzIDoge1trZXk6c3RyaW5nXSA6IEFycmF5PE5vZGVPckNvbXBvbmVudD59ID0ge307XG4gICAgZm9yKGxldCBpPTA7aTxjaGlsZExpc3QubGVuZ3RoO2krKyl7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRMaXN0W2ldXG4gICAgICAgIGNvbnN0IGtleSA9IGdldEtleShjaGlsZClcbiAgICAgICAgaWYoa2V5ICE9IG51bGwpe1xuICAgICAgICAgICAgbGV0IGxpc3QgPSBrZXlzW2tleV1cbiAgICAgICAgICAgIGlmKCFsaXN0KXtcbiAgICAgICAgICAgICAgICBsaXN0ID0ga2V5c1trZXldID0gW11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gZ2V0S2V5KGNoaWxkIDogTm9kZU9yQ29tcG9uZW50KXtcbiAgICBjb25zdCB0YXJnZXQgPSBjaGlsZCBpbnN0YW5jZW9mIENvbXBvbmVudCA/IGNoaWxkLnN0YXJ0IDogY2hpbGQ7XG4gICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe1xuICAgICAgICBjb25zdCBrZXkgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKEF0dHJpYnV0ZU5hbWVzLktleSk7XG4gICAgICAgIGlmKGtleSAhPSBudWxsKXtcbiAgICAgICAgICAgIHJldHVybiBrZXlcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxufSIsImltcG9ydCB7QXR0cmlidXRlTmFtZXN9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQm91bmRJbnB1dChib3VuZElkIDogbnVtYmVyLCBzZXJ2ZXJTZWVuIDogbnVtYmVyLCB2YWx1ZSA6IGFueSwgc2V0dGVyIDogKGl0IDogSFRNTEVsZW1lbnQsIHZhbHVlOiBhbnkpPT52b2lkKXtcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbXCIrIEF0dHJpYnV0ZU5hbWVzLkJvdW5kICtcIj1cXFwiXCIgKyBib3VuZElkICsgXCJcXFwiXVwiKSBhcyBIVE1MRWxlbWVudHxudWxsXG4gICAgaWYoIWlucHV0KXsgcmV0dXJuIH1cbiAgICBsZXQgc2VlbiA9IChpbnB1dCBhcyBhbnkpLmJvdW5kU2VlbiB8fCAoKGlucHV0IGFzIGFueSkuYm91bmRTZWVuPTApXG4gICAgaWYoaW5wdXQgJiYgc2VlbiA8PSBzZXJ2ZXJTZWVuKSB7XG4gICAgICAgIHNldHRlcihpbnB1dCwgdmFsdWUpXG4gICAgfVxufSIsImltcG9ydCB7c2VuZElmRXJyb3IsIHNlbmRNZXNzYWdlfSBmcm9tIFwiLi9zb2NrZXRcIjtcbmltcG9ydCB7cmVjb25jaWxlfSBmcm9tIFwiLi9yZWNvbmNpbGVcIjtcbmltcG9ydCB7dXBkYXRlQm91bmRJbnB1dH0gZnJvbSBcIi4vYm91bmRcIjtcbmltcG9ydCB7U29ja2V0U2NvcGVOYW1lc30gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZVNjcmlwdCh0YWcgOiBzdHJpbmd8dW5kZWZpbmVkLCBzY29wZSA6IFNjb3BlLCBzY3JpcHQgOiBzdHJpbmcpe1xuICAgIHRyeSB7XG4gICAgICAgIHNjb3BlKHNjcmlwdClcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICBzZW5kSWZFcnJvcihlLCB0YWcsIHNjcmlwdC5zdWJzdHJpbmcoMCwgMjU2KSk7XG4gICAgfVxufVxuXG50eXBlIFNjb3BlID0gKHNjcmlwdDogc3RyaW5nKT0+dm9pZFxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VFdmFsU2NvcGUoc2NvcGUgOiBPYmplY3QpIDogU2NvcGUge1xuICAgIGNvbnN0IGZpbmFsID0gey4uLmJhc2VTY29wZSwgLi4uc2NvcGV9XG4gICAgY29uc3QgbmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhmaW5hbClcbiAgICBjb25zdCB2YWx1ZXMgPSBuYW1lcy5tYXAoKG5hbWUpID0+IChmaW5hbCBhcyBhbnkpW25hbWVdKVxuICAgIHJldHVybiBmdW5jdGlvbiAoc2NyaXB0IDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gbmV3IEZ1bmN0aW9uKC4uLm5hbWVzLCBgcmV0dXJuIChmdW5jdGlvbigpe1xcbiR7c2NyaXB0fVxcbn0pKClgKVxuICAgICAgICByZXR1cm4gY29tcGlsZWQoLi4udmFsdWVzKVxuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGJhc2VTY29wZSA9IHtcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5yZWNvbmNpbGVdOnJlY29uY2lsZSxcbiAgICBbU29ja2V0U2NvcGVOYW1lcy51cGRhdGVCb3VuZElucHV0XTp1cGRhdGVCb3VuZElucHV0LFxuICAgIFtTb2NrZXRTY29wZU5hbWVzLnNlbmRNZXNzYWdlXTpzZW5kTWVzc2FnZSxcbiAgICBbU29ja2V0U2NvcGVOYW1lcy5zZW5kSWZFcnJvcl06c2VuZElmRXJyb3Jcbn1cbiIsImltcG9ydCB7ZXJyb3JEaXNwbGF5fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7ZXZhbHVhdGVTY3JpcHQsIG1ha2VFdmFsU2NvcGV9IGZyb20gXCIuL2V2YWxcIjtcbmltcG9ydCB7bWVzc2FnZVRhZ0Vycm9yUHJlZml4LCBtZXNzYWdlVGFnU2VwYXJhdG9yfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7d2hlbkRvY3VtZW50UmVhZHl9IGZyb20gXCIuL3V0aWxpdHlcIjtcblxuXG5sZXQgc29ja2V0UmVhZHkgPSBmYWxzZTtcbmNvbnN0IHNvY2tldFJlYWR5UXVldWUgOiBzdHJpbmdbXSA9IFtdO1xubGV0IHNvY2tldCA6IFdlYlNvY2tldDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RTb2NrZXQoKXtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKCh3aW5kb3cgYXMgYW55KS5zaGFkZUVuZHBvaW50LCB3aW5kb3cubG9jYXRpb24uaHJlZilcbiAgICBpZigod2luZG93IGFzIGFueSkuc2hhZGVIb3N0KXtcbiAgICAgICAgdXJsLmhvc3QgPSAod2luZG93IGFzIGFueSkuc2hhZGVIb3N0O1xuICAgIH1cbiAgICB1cmwucHJvdG9jb2wgPSAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gXCJ3c3M6Ly9cIiA6IFwid3M6Ly9cIik7XG4gICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmwuaHJlZik7XG4gICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBpZCA9ICh3aW5kb3cgYXMgYW55KS5zaGFkZUlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZCB3aXRoIElEIFwiICsgaWQpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgc29ja2V0LnNlbmQoaWQpO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IHRydWU7XG4gICAgICAgIHdoaWxlIChzb2NrZXRSZWFkeVF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlKHNvY2tldFJlYWR5UXVldWUuc2hpZnQoKSEsIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjb25zdCBkYXRhID0gKGV2ZW50LmRhdGEgYXMgc3RyaW5nKTtcbiAgICAgICAgY29uc3Qgc3BsaXRJbmRleCA9IGRhdGEuaW5kZXhPZihtZXNzYWdlVGFnU2VwYXJhdG9yKTtcbiAgICAgICAgY29uc3QgdGFnID0gZGF0YS5zdWJzdHJpbmcoMCwgc3BsaXRJbmRleCk7XG4gICAgICAgIGNvbnN0IHNjcmlwdCA9IGRhdGEuc3Vic3RyaW5nKHNwbGl0SW5kZXgrMSwgZGF0YS5sZW5ndGgpO1xuICAgICAgICBjb25zdCBzY29wZSA9IG1ha2VFdmFsU2NvcGUoe30pXG4gICAgICAgIHdoZW5Eb2N1bWVudFJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBldmFsdWF0ZVNjcmlwdCh0YWcsIHNjb3BlLCBzY3JpcHQpXG4gICAgICAgIH0pXG4gICAgfTtcbiAgICBsZXQgZXJyb3JUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICBmdW5jdGlvbiBlcnJvclJlbG9hZCgpe1xuICAgICAgICBpZihlcnJvclRyaWdnZXJlZCl7IHJldHVybjsgfVxuICAgICAgICBlcnJvclRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IGxhc3RSZWxvYWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInNoYWRlX2Vycm9yX3JlbG9hZFwiKTtcbiAgICAgICAgaWYobGFzdFJlbG9hZCl7XG4gICAgICAgICAgICBlcnJvckRpc3BsYXkoXCJUaGlzIHdlYiBwYWdlIGNvdWxkIG5vdCBjb25uZWN0IHRvIGl0cyBzZXJ2ZXIuIFBsZWFzZSByZWxvYWQgb3IgdHJ5IGFnYWluIGxhdGVyLlwiKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hhZGVfZXJyb3JfcmVsb2FkXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJzaGFkZV9lcnJvcl9yZWxvYWRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFNvY2tldCBjbG9zZWQ6ICR7ZXZ0LnJlYXNvbn0sICR7ZXZ0Lndhc0NsZWFufWApO1xuICAgICAgICBzb2NrZXRSZWFkeSA9IGZhbHNlO1xuICAgICAgICBpZiAoZXZ0Lndhc0NsZWFuKXtcbiAgICAgICAgICAgIC8vY29ubmVjdFNvY2tldCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJvclJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgU29ja2V0IGNsb3NlZDogJHtldnR9YCk7XG4gICAgICAgIHNvY2tldFJlYWR5ID0gZmFsc2U7XG4gICAgICAgIGVycm9yUmVsb2FkKCk7XG4gICAgfTtcblxuICAgIHNldEludGVydmFsKCgpPT57XG4gICAgICAgIGlmKHNvY2tldFJlYWR5KXtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKFwiXCIpXG4gICAgICAgIH1cbiAgICB9LCA2MCoxMDAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRNZXNzYWdlKGlkIDogc3RyaW5nLCBtc2cgOiBzdHJpbmd8dW5kZWZpbmVkfG51bGwpIHtcbiAgICBjb25zdCBmaW5hbE1zZyA9IChtc2cgIT09IHVuZGVmaW5lZCAmJiBtc2cgIT09IG51bGwpID8gaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yICsgbXNnIDogaWQgKyBtZXNzYWdlVGFnU2VwYXJhdG9yO1xuICAgIGlmIChzb2NrZXRSZWFkeSkge1xuICAgICAgICBzb2NrZXQuc2VuZChmaW5hbE1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0UmVhZHlRdWV1ZS5wdXNoKGZpbmFsTXNnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZW5kSWZFcnJvcihlcnJvciA6IHVua25vd24sIHRhZz86IHN0cmluZywgZXZhbFRleHQgPzogc3RyaW5nKXtcbiAgICBjb25zdCBkYXRhID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHtcbiAgICAgICAgbmFtZTogZXJyb3IubmFtZSxcbiAgICAgICAganNNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICBzdGFjayA6IGVycm9yLnN0YWNrLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9IDoge1xuICAgICAgICBuYW1lOiBcIlVua25vd25cIixcbiAgICAgICAganNNZXNzYWdlOiBcIlVua25vd24gZXJyb3I6IFwiICsgZXJyb3IsXG4gICAgICAgIHN0YWNrOiBcIlwiLFxuICAgICAgICBldmFsOiBldmFsVGV4dCxcbiAgICAgICAgdGFnOiB0YWdcbiAgICB9O1xuICAgIHNvY2tldC5zZW5kKGAke21lc3NhZ2VUYWdFcnJvclByZWZpeH0ke3RhZyA9PSB1bmRlZmluZWQgPyBcIlwiIDogdGFnfSR7bWVzc2FnZVRhZ1NlcGFyYXRvcn1gICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xufVxuXG4iLCJpbXBvcnQge2Nvbm5lY3RTb2NrZXQsIHNlbmRJZkVycm9yfSBmcm9tIFwiLi9zb2NrZXRcIjtcbmltcG9ydCB7ZXJyb3JEaXNwbGF5fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7d2hlbkRvY3VtZW50UmVhZHl9IGZyb20gXCIuL3V0aWxpdHlcIjtcbmltcG9ydCB7YWRkQWxsRGlyZWN0aXZlc30gZnJvbSBcIi4vZGlyZWN0aXZlc1wiO1xuXG5pZighKHdpbmRvdyBhcyBhbnkpLnNoYWRlKXtcbiAgICAod2luZG93IGFzIGFueSkuc2hhZGUgPSB7fTtcbiAgICBpZighd2luZG93LldlYlNvY2tldCl7XG4gICAgICAgIGVycm9yRGlzcGxheShcIllvdXIgd2ViIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHRoaXMgcGFnZSwgYW5kIGl0IG1heSBub3QgZnVuY3Rpb24gY29ycmVjdGx5IGFzIGEgcmVzdWx0LiBVcGdyYWRlIHlvdXIgd2ViIGJyb3dzZXIuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbm5lY3RTb2NrZXQoKTtcblxuICAgICAgICB3aGVuRG9jdW1lbnRSZWFkeShmdW5jdGlvbigpe1xuICAgICAgICAgICAgYWRkQWxsRGlyZWN0aXZlcyhkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oZXZlbnQ6IEVycm9yRXZlbnQpe1xuICAgICAgICAgICAgc2VuZElmRXJyb3IoZXZlbnQuZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIGZ1bmN0aW9uKGV2ZW50IDogUHJvbWlzZVJlamVjdGlvbkV2ZW50KXtcbiAgICAgICAgICAgIHNlbmRJZkVycm9yKGV2ZW50LnJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXSwibmFtZXMiOlsiRGlyZWN0aXZlVHlwZSIsIkF0dHJpYnV0ZU5hbWVzIiwiU29ja2V0U2NvcGVOYW1lcyIsImlkIiwib3JpZ2luYWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTyxXQUFTLGFBQWEsU0FBaUI7QUFDMUMsVUFBTSxZQUFZLFNBQVMsY0FBYyxLQUFLO0FBQzlDLGNBQVUsWUFBWSxvWEFBb1gsVUFBVztBQUNyWixhQUFTLEtBQUssWUFBWSxTQUFTO0FBQ25DLGFBQVMsZUFBZSxZQUFZLEVBQUcsaUJBQWlCLFNBQVMsV0FBVTtBQUN2RSxZQUFNLElBQUksU0FBUyxlQUFlLFlBQVk7QUFDOUMsUUFBRSxXQUFZLFlBQVksQ0FBQztBQUFBLElBQy9CLENBQUM7QUFBQSxFQUNMO0FDTk8sTUFBSyxrQ0FBQUEsbUJBQUw7QUFDSEEsbUJBQUEsU0FBQSxJQUFVO0FBQ1ZBLG1CQUFBLGNBQUEsSUFBZTtBQUNmQSxtQkFBQSxjQUFBLElBQWU7QUFDZkEsbUJBQUEsZ0JBQUEsSUFBaUI7QUFDakJBLG1CQUFBLGNBQUEsSUFBZTtBQUNmQSxtQkFBQSxlQUFBLElBQWdCO0FBTlIsV0FBQUE7QUFBQUEsRUFBQSxHQUFBLGlCQUFBLENBQUEsQ0FBQTtBQVFMLE1BQUssbUNBQUFDLG9CQUFMO0FBQ0hBLG9CQUFBLGVBQUEsSUFBZ0I7QUFDaEJBLG9CQUFBLHdCQUFBLElBQXlCO0FBQ3pCQSxvQkFBQSxlQUFBLElBQWdCO0FBQ2hCQSxvQkFBQSxrQkFBQSxJQUFtQjtBQUNuQkEsb0JBQUEsa0JBQUEsSUFBbUI7QUFDbkJBLG9CQUFBLG1CQUFBLElBQW9CO0FBQ3BCQSxvQkFBQSxLQUFBLElBQU07QUFDTkEsb0JBQUEsV0FBQSxJQUFZO0FBQ1pBLG9CQUFBLGlCQUFBLElBQWtCO0FBQ2xCQSxvQkFBQSxhQUFBLElBQWM7QUFDZEEsb0JBQUEsYUFBQSxJQUFjO0FBQ2RBLG9CQUFBLFdBQUEsSUFBWTtBQUNaQSxvQkFBQSxPQUFBLElBQVE7QUFDUkEsb0JBQUEsVUFBQSxJQUFXO0FBZEgsV0FBQUE7QUFBQUEsRUFBQSxHQUFBLGtCQUFBLENBQUEsQ0FBQTtBQWlCTCxRQUFNLHNCQUFzQjtBQUM1QixRQUFNLG9CQUFvQjtBQUMxQixRQUFNLHVCQUF1QjtBQUU3QixRQUFNLHNCQUFzQjtBQUM1QixRQUFNLHdCQUF3QjtBQUU5QixNQUFLLHFDQUFBQyxzQkFBTDtBQUNIQSxzQkFBQSxXQUFBLElBQVk7QUFDWkEsc0JBQUEsa0JBQUEsSUFBbUI7QUFDbkJBLHNCQUFBLGFBQUEsSUFBYztBQUNkQSxzQkFBQSxhQUFBLElBQWM7QUFKTixXQUFBQTtBQUFBQSxFQUFBLEdBQUEsb0JBQUEsQ0FBQSxDQUFBO0FDbENMLFdBQVMsMkJBQTJCLFFBQWtCLFVBQThCO0FBQ3ZGLFVBQU0sUUFBUSxPQUFPLGlCQUFpQixRQUFRO0FBQzlDLFFBQUcsT0FBTyxRQUFRLFFBQVEsR0FBRTtBQUN4QixhQUFPLENBQUMsUUFBUSxHQUFHLEtBQUs7QUFBQSxJQUM1QixPQUFPO0FBQ0gsYUFBTyxNQUFNLEtBQUssS0FBSztBQUFBLElBQzNCO0FBQUEsRUFDSjtBQUVPLFdBQVMsa0JBQWtCLElBQWU7QUFDN0MsUUFBSSxTQUFTLGVBQWUsY0FBYyxTQUFTLGVBQWUsZUFBZTtBQUM3RSxTQUFBO0FBQUEsSUFDSixPQUFPO0FBQ0gsZUFBUyxpQkFBaUIsb0JBQW9CLEVBQUU7QUFBQSxJQUNwRDtBQUFBLEVBQ0o7QUNMTyxNQUFJLHNCQUFzQixFQUFDLFVBQVUsTUFBQTtBQUU1QyxRQUFNLGdCQUFnQixPQUFBO0FBSWYsV0FBUyxrQkFBa0IsV0FBMEIsTUFBdUI7QUFDL0UsOEJBQTBCLEtBQUssT0FBTztBQUN0QyxVQUFNLFNBQVMsVUFBVSxTQUFTLEdBQUcsVUFBVSxNQUFNO0FBQUEsSUFBUTtBQUM3RCxVQUFNLE9BQU8sVUFBVSxPQUFPLG1CQUFtQixVQUFVLElBQUksTUFBTTtBQUNyRSxVQUFNLFNBQVMsVUFBVSxTQUFTO0FBQUEsRUFBTSxVQUFVLE1BQU0sS0FBSztBQUM3RCxVQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsaUJBQWlCLFdBQVcsSUFBSSxVQUFVLFVBQVUsR0FBRyxJQUFJLElBQUksTUFBTTtBQUNoRyxVQUFNLFdBQTJCLFNBQStCLEdBQVU7QUFDdEUsVUFBRyxvQkFBb0IsVUFBUztBQUFFO0FBQUEsTUFBTztBQUN6QyxZQUFNLFFBQVEsY0FBYztBQUFBLFFBQ3hCLE9BQU87QUFBQSxRQUNQO0FBQUEsUUFDQSxJQUFJLEVBQUU7QUFBQSxNQUFBLENBQ1Q7QUFDRCxxQkFBZSxRQUFXLE9BQU8sTUFBTTtBQUFBLElBQzNDO0FBQ0EsU0FBSyxPQUFPLGlCQUFpQixVQUFVLFdBQVcsUUFBUTtBQUN6RCxTQUFLLFFBQXdCLGFBQWEsSUFBSTtBQUFBLE1BQzNDLFdBQVcsVUFBVTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSxRQUFRLEtBQUs7QUFBQSxJQUFBO0FBQUEsRUFFckI7QUFFTyxXQUFTLG1CQUFtQixXQUEwQixNQUFrQjtBQUMzRSw4QkFBMEIsS0FBSyxPQUFPO0FBQUEsRUFDMUM7QUFFQSxXQUFTLDBCQUEwQixTQUFzQjtBQUNyRCxVQUFNLFdBQVksUUFBd0IsYUFBYTtBQUN2RCxRQUFHLFVBQVM7QUFDUixlQUFTLE9BQU8sb0JBQW9CLFNBQVMsV0FBVyxTQUFTLFFBQVE7QUFBQSxJQUM3RTtBQUFBLEVBQ0o7QUN4Q0EsUUFBTSwwQkFBMEIsT0FBQTtBQVF6QixXQUFTLDBCQUEwQixTQUFzQjtBQUM1RCxVQUFNLGNBQWUsUUFBc0MsdUJBQXVCO0FBQ2xGLFFBQUcsYUFBWTtBQUNYLGFBQVEsUUFBc0MsdUJBQXVCO0FBQ3JFLDRDQUFzQyxJQUFJLE9BQU87QUFBQSxJQUNyRDtBQUFBLEVBQ0o7QUFDQSxXQUFTLHNCQUFzQixTQUF1QixNQUFjO0FBQ2hFLFFBQUksWUFBYSxRQUFzQyx1QkFBdUI7QUFDOUUsUUFBRyxDQUFDLFdBQVU7QUFDVixrQkFBYSxRQUFzQyx1QkFBdUIsSUFBSSxDQUFBO0FBQUEsSUFDbEY7QUFDQSxRQUFHLEVBQUUsUUFBUSxZQUFXO0FBQ3BCLGdCQUFVLElBQUksSUFBSSxRQUFRLGFBQWEsSUFBSTtBQUFBLElBQy9DO0FBQUEsRUFDSjtBQUdBLFFBQU0sMEJBQTBCLElBQUksZUFBZSxhQUFhLElBQUksY0FBYyxZQUFZO0FBQzlGLFFBQU0sbUNBQW1DLGVBQWUsbUJBQW1CLElBQUksdUJBQXVCO0FBQ3RHLFdBQVMsMEJBQTBCLFFBQXFCO0FBRXBELFVBQU0sYUFBYSxNQUFNLEtBQUssT0FBTyxpQkFBaUIsZ0NBQWdDLENBQUM7QUFDdkYsUUFBSSxVQUE2QjtBQUNqQyxXQUFNLE1BQUs7QUFDUCxnQkFBVSxRQUFRO0FBQ2xCLFVBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxRQUFRLGVBQWUsbUJBQW1CLEtBQUssZUFBZSxzQkFBc0IsR0FBRyxHQUFFO0FBQzdHO0FBQUEsTUFDSjtBQUNBLGlCQUFXLEtBQUssT0FBTztBQUFBLElBQzNCO0FBRUEsVUFBTSxrQkFBb0QsQ0FBQTtBQUMxRCxhQUFRLE1BQU0sWUFBVztBQUNyQixZQUFNLGNBQWMsaUJBQWlCLEVBQUU7QUFDdkMsVUFBRyxlQUFlLHVCQUF1QixjQUFhO0FBQ2xELFlBQUksUUFBUSxnQkFBZ0IsWUFBWSxJQUFJO0FBQzVDLFlBQUcsQ0FBQyxPQUFNO0FBQ04sa0JBQVEsZ0JBQWdCLFlBQVksSUFBSSxJQUFJLENBQUE7QUFBQSxRQUNoRDtBQUNBLGNBQU0sS0FBSyxXQUFXO0FBQUEsTUFDMUI7QUFBQSxJQUNKO0FBRUEsYUFBUSxhQUFhLE9BQU8sb0JBQW9CLGVBQWUsR0FBRTtBQUM3RCxZQUFNLGFBQWEsZ0JBQWdCLFNBQVM7QUFDNUMsWUFBTSxPQUFPLFdBQVcsV0FBVyxTQUFTLENBQUM7QUFFN0MsNEJBQXNCLFFBQVEsS0FBSyxJQUFJO0FBQ3ZDLDBCQUFvQixRQUFRLEtBQUssTUFBTSxLQUFLLEtBQUs7QUFBQSxJQUNyRDtBQUdBLFVBQU0sWUFBYSxPQUFxQyx1QkFBdUIsS0FBSyxDQUFBO0FBQ3BGLGFBQVEsWUFBWSxPQUFPLG9CQUFvQixTQUFTLEdBQUU7QUFDdEQsVUFBRyxDQUFDLGdCQUFnQixRQUFRLEdBQUU7QUFDMUIsNEJBQW9CLFFBQVEsVUFBVSxVQUFVLFFBQVEsQ0FBQztBQUN6RCxlQUFPLFVBQVUsUUFBUTtBQUFBLE1BQzdCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFHQSxNQUFJLDREQUErRCxJQUFBO0FBQzVELFdBQVMsNEJBQTRCLElBQWM7QUFDdEQsUUFBSTtBQUNBLFNBQUE7QUFBQSxJQUNKLFVBQUE7QUFDSSxlQUFRLFVBQVUsdUNBQXNDO0FBQ3BELGtDQUEwQixNQUFNO0FBQUEsTUFDcEM7QUFDQSxrRUFBNEMsSUFBQTtBQUFBLElBQ2hEO0FBQUEsRUFDSjtBQUVBLFFBQU0scUJBQXFCLE9BQUE7QUFJcEIsV0FBUyw2QkFBNkIsTUFBdUI7QUFDaEUsMENBQXNDLElBQUksS0FBSyxNQUFNO0FBQ25DLFNBQUssUUFBUyxrQkFBa0IsSUFBSSxLQUFLO0FBQUEsRUFDL0Q7QUFDTyxXQUFTLDZCQUE2QixTQUFzQjtBQUMvRCxVQUFNLFNBQTJCLFFBQVMsa0JBQWtCO0FBQzVELFFBQUcsUUFBTztBQUNOLDRDQUFzQyxJQUFJLE1BQU07QUFBQSxJQUNwRDtBQUFBLEVBQ0o7QUFFTyxXQUFTLG9CQUFvQixRQUFzQixNQUFlLE9BQW9CO0FBQ3pGLFFBQUcsU0FBUyxNQUFLO0FBQ2IsYUFBTyxnQkFBZ0IsSUFBSTtBQUFBLElBQy9CLE9BQU87QUFDSCxhQUFPLGFBQWEsTUFBTSxLQUFLO0FBQUEsSUFDbkM7QUFDQSxRQUFHLGtCQUFrQixxQkFBcUIsUUFBUSxXQUFXLFFBQVEsWUFBVztBQUc1RSxVQUFHLFFBQVEsV0FBVyxPQUFPLFNBQVMsT0FBTTtBQUN4QyxnQ0FBd0IsUUFBUSxNQUFJO0FBQ2hDLGlCQUFPLFFBQVEsd0JBQVM7QUFBQSxRQUM1QixDQUFDO0FBQUEsTUFDTCxXQUFVLFFBQVEsYUFBYSxPQUFPLFlBQVksU0FBUyxPQUFNO0FBQzdELGdDQUF3QixRQUFRLE1BQUk7QUFDaEMsaUJBQU8sVUFBVSxTQUFTO0FBQUEsUUFDOUIsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFdBQVMsd0JBQXdCLFFBQTJCLElBQWM7QUFDdEUsd0JBQW9CLFdBQVc7QUFDL0IsVUFBTSxjQUFjLE9BQU87QUFDM0IsV0FBTyxXQUFXO0FBQ2xCLFFBQUk7QUFDQSxTQUFBO0FBQUEsSUFDSixVQUFBO0FBQ0ksYUFBTyxXQUFXO0FBQ2xCLDBCQUFvQixXQUFXO0FBQUEsSUFDbkM7QUFBQSxFQUNKO0FDbElBLFFBQU0saUJBQWlCLE9BQUE7QUFLaEIsV0FBUyxpQkFBaUIsV0FBcUIsTUFBdUI7QUFDekUsVUFBTSxNQUFPLEtBQUssUUFBOEIsY0FBYztBQUM5RCxRQUFHLENBQUMsVUFBVSxnQkFBZ0IsQ0FBQyxPQUFPLElBQUksTUFBTSxVQUFVLE1BQU0sSUFBSSxVQUFVLEtBQUssUUFBTztBQUNyRixXQUFLLFFBQThCLGNBQWMsSUFBSTtBQUFBLFFBQ2xELElBQUksVUFBVTtBQUFBLFFBQ2QsUUFBUSxLQUFLO0FBQUEsTUFBQTtBQUVqQixZQUFNLEtBQUssS0FBSztBQUNoQixZQUFNLFFBQVEsY0FBYztBQUFBLFFBQ3hCO0FBQUEsTUFBQSxDQUNIO0FBQ0QscUJBQWUsUUFBVyxPQUFPLFVBQVUsRUFBRTtBQUFBLElBQ2pEO0FBQUEsRUFDSjtBQUFBLEVDbkJPLE1BQU0sZUFBZTtBQUFBLElBQ3hCLFlBQW1CLElBQVk7QUFBWixXQUFBLEtBQUE7QUFBQSxJQUFhO0FBQUEsRUFDcEM7QUFBQSxFQUNPLE1BQU0sYUFBYTtBQUFBLElBQ3RCLFlBQW1CLElBQVk7QUFBWixXQUFBLEtBQUE7QUFBQSxJQUFhO0FBQUEsRUFDcEM7QUFBQSxFQUNPLE1BQU0sS0FBSztBQUFBLElBQ2QsWUFBbUIsSUFBWTtBQUFaLFdBQUEsS0FBQTtBQUFBLElBQWE7QUFBQSxFQUNwQztBQUFBLEVBRU8sTUFBTSxhQUFhO0FBQUEsSUFDdEIsWUFBbUIsTUFBc0IsT0FBb0I7QUFBMUMsV0FBQSxPQUFBO0FBQXNCLFdBQUEsUUFBQTtBQUFBLElBQXFCO0FBQUEsRUFDbEU7QUFBQSxFQUVPLE1BQU0sUUFBUTtBQUFBLElBQ2pCLFlBQW1CLElBQW9CLGNBQXVCO0FBQTNDLFdBQUEsS0FBQTtBQUFvQixXQUFBLGVBQUE7QUFBQSxJQUF3QjtBQUFBLEVBQ25FO0FBQUEsRUFFTyxNQUFNLGFBQWE7QUFBQSxJQUN0QixZQUNXLFdBQ0EsWUFDQSxRQUNBLFFBQ0EsTUFDVjtBQUxVLFdBQUEsWUFBQTtBQUNBLFdBQUEsYUFBQTtBQUNBLFdBQUEsU0FBQTtBQUNBLFdBQUEsU0FBQTtBQUNBLFdBQUEsT0FBQTtBQUFBLElBQ1Q7QUFBQSxFQUNOO0FBRU8sV0FBUyxpQkFBaUIsT0FBK0I7QUFDNUQsUUFBRyxpQkFBaUIsZUFBZSxNQUFNLFdBQVcsWUFBWSxNQUFNLGFBQWEsTUFBTSxNQUFNLHFCQUFvQjtBQUMvRyxZQUFNLGdCQUFnQixNQUFNLGFBQWEsZUFBZSxhQUFhO0FBQ3JFLFlBQU0sS0FBSyxNQUFNO0FBQ2pCLGNBQU8sZUFBQTtBQUFBLFFBQ0gsS0FBSyxjQUFjO0FBQ2YsZ0JBQU0sWUFBWSxNQUFNLGFBQWEsZUFBZSxnQkFBZ0I7QUFDcEUsZ0JBQU0sU0FBUyxNQUFNLGFBQWEsZUFBZSxhQUFhO0FBQzlELGlCQUFPLElBQUksUUFBUSxRQUFRLGNBQWMsR0FBRztBQUFBLFFBQ2hELEtBQUssY0FBYztBQUNmLGlCQUFPLElBQUksZUFBZSxHQUFHLFVBQVUsa0JBQWtCLE1BQU0sQ0FBQztBQUFBLFFBQ3BFLEtBQUssY0FBYztBQUNmLGlCQUFPLElBQUksYUFBYSxHQUFHLFVBQVUsa0JBQWtCLFFBQVEsR0FBRyxTQUFTLHFCQUFxQixNQUFNLENBQUM7QUFBQSxRQUMzRyxLQUFLLGNBQWM7QUFDZixpQkFBTyxJQUFJLEtBQUssR0FBRyxVQUFVLGtCQUFrQixNQUFNLENBQUM7QUFBQSxRQUMxRCxLQUFLLGNBQWMsY0FBYztBQUM3QixnQkFBTSxPQUFPLE1BQU0sYUFBYSxlQUFlLGdCQUFnQjtBQUMvRCxnQkFBTSxRQUFRLE1BQU0sYUFBYSxlQUFlLGlCQUFpQjtBQUNqRSxpQkFBTyxJQUFJLGFBQWEsTUFBTSxLQUFLO0FBQUEsUUFDdkM7QUFBQSxRQUNBLEtBQUssY0FBYyxjQUFjO0FBQzdCLGdCQUFNLE9BQU8sTUFBTSxhQUFhLGVBQWUsU0FBUztBQUN4RCxnQkFBTUMsTUFBSyxDQUFDLE1BQU0sYUFBYSxlQUFlLGVBQWU7QUFDN0QsZ0JBQU0sU0FBUyxNQUFNLGFBQWEsZUFBZSxXQUFXO0FBQzVELGdCQUFNLFNBQVMsTUFBTSxhQUFhLGVBQWUsV0FBVztBQUM1RCxnQkFBTSxPQUFPLE1BQU0sYUFBYSxlQUFlLFNBQVM7QUFDeEQsaUJBQU8sSUFBSSxhQUFhLE1BQU1BLEtBQUksUUFBUSxRQUFRLElBQUk7QUFBQSxRQUMxRDtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFFTyxXQUFTLGlCQUFpQixNQUFvQjtBQUNqRCx1QkFBbUIsTUFBSTtBQUNuQix3QkFBa0IsSUFBSTtBQUFBLElBQzFCLENBQUM7QUFBQSxFQUNMO0FBRU8sV0FBUyxzQkFBc0IsUUFBeUM7QUFDM0UsUUFBRyxPQUFPLGFBQWEsZUFBZSxzQkFBc0IsR0FBRTtBQUMxRCxVQUFJLFNBQXdCO0FBQzVCLGFBQU0sVUFBVSxPQUFPLGFBQWEsZUFBZSxzQkFBc0IsR0FBRTtBQUN2RSxpQkFBUyxPQUFPO0FBQUEsTUFDcEI7QUFDQSxhQUFPO0FBQUEsSUFDWCxPQUFPO0FBQ0gsYUFBTyxPQUFPO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBVUEsTUFBSSxvQkFBbUMsQ0FBQTtBQUN2QyxNQUFJLG9CQUFtQyxDQUFBO0FBQ2hDLFdBQVMsbUJBQW1CLElBQWM7QUFDN0MsZ0NBQTRCLE1BQUk7QUFDNUIsVUFBSTtBQUNBLFdBQUE7QUFBQSxNQUNKLFVBQUE7QUFDSSxpQkFBUSxXQUFXLG1CQUFrQjtBQUNqQywyQkFBaUIsT0FBTztBQUFBLFFBQzVCO0FBQ0EsaUJBQVEsV0FBVyxtQkFBa0I7QUFDakMsb0JBQVUsT0FBTztBQUFBLFFBQ3JCO0FBRUEsNEJBQW9CLENBQUE7QUFDcEIsNEJBQW9CLENBQUE7QUFBQSxNQUN4QjtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFLTyxXQUFTLGtCQUFrQixTQUFlO0FBQzdDLFFBQUcsbUJBQW1CLGFBQVk7QUFDOUIsZUFBUSxVQUFVLDJCQUEyQixTQUFTLGVBQWUsbUJBQW1CLEdBQUcsR0FBRTtBQUN6RixjQUFNLFlBQVksaUJBQWlCLE1BQU07QUFDekMsWUFBRyxrQkFBa0IsZUFBZSxXQUFVO0FBQzFDLDRCQUFrQixLQUFLLEVBQUMsV0FBVyxTQUFTLFFBQU87QUFBQSxRQUN2RDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUtPLFdBQVMscUJBQXFCLFNBQXNCO0FBQ3ZELFVBQU0sWUFBWSxpQkFBaUIsT0FBTztBQUMxQyxRQUFHLFdBQVU7QUFDVCx3QkFBa0IsS0FBSyxFQUFDLFdBQVcsUUFBQSxDQUFRO0FBQUEsSUFDL0M7QUFBQSxFQUNKO0FBS08sV0FBUyxxQkFBcUIsU0FBZTtBQUNoRCxRQUFHLG1CQUFtQixhQUFZO0FBQzlCLGVBQVEsVUFBVSwyQkFBMkIsU0FBUyxlQUFlLG1CQUFtQixHQUFHLEdBQUU7QUFDekYsY0FBTSxZQUFZLGlCQUFpQixNQUFNO0FBQ3pDLFlBQUcsa0JBQWtCLGVBQWUsV0FBVTtBQUMxQyw0QkFBa0IsS0FBSyxFQUFDLFdBQVcsU0FBUyxRQUFPO0FBQUEsUUFDdkQ7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFLQSxXQUFTLGlCQUFpQixNQUFtQjtBQUN6QyxVQUFNLFNBQVMsc0JBQXNCLEtBQUssT0FBTztBQUNqRCxRQUFHLFFBQU87QUFDTixZQUFNLFlBQVksS0FBSztBQUN2QixZQUFNLFVBQVUsaUNBQUksT0FBSixFQUFVLE9BQUE7QUFDMUIsVUFBRyxxQkFBcUIsY0FBYTtBQUNqQyxxQ0FBNkIsT0FBTztBQUFBLE1BQ3hDLFdBQVUscUJBQXFCLFNBQVE7QUFDbkMseUJBQWlCLFdBQVcsT0FBTztBQUFBLE1BQ3ZDLFdBQVUscUJBQXFCLGNBQWE7QUFDeEMsMEJBQWtCLFdBQVcsT0FBTztBQUFBLE1BQ3hDO0FBQUEsSUFDSixPQUFPO0FBQ0gsY0FBUSxNQUFNLHNCQUFzQixLQUFLLFFBQVEsU0FBUyxFQUFFO0FBQUEsSUFDaEU7QUFBQSxFQUNKO0FBQ0EsV0FBUyxVQUFVLE1BQWtCO0FBQ2pDLFVBQU0sWUFBWSxLQUFLO0FBQ3ZCLFFBQUcscUJBQXFCLGNBQWE7QUFDakMsbUNBQTZCLEtBQUssT0FBTztBQUFBLElBQzdDO0FBQ0EsUUFBRyxxQkFBcUIsY0FBYTtBQUNqQyx5QkFBbUIsV0FBVyxJQUFJO0FBQUEsSUFDdEM7QUFBQSxFQUNKO0FDcEtPLFdBQVMsVUFBVSxVQUFtQixNQUFjO0FBQ3ZELHVCQUFtQixNQUFJO0FBQ25CLFlBQU0sU0FBUyxTQUFTLGVBQWUsb0JBQWtCLFFBQVE7QUFDakUsVUFBRyxDQUFDLFFBQU87QUFBRTtBQUFBLE1BQU87QUFDcEIsWUFBTSxTQUFTLE9BQU87QUFDdEIsWUFBTSxVQUFVLFNBQVMsY0FBYyxPQUFPLE9BQU87QUFDckQsY0FBUSxZQUFZO0FBR3BCLFlBQU0sV0FBVyxDQUFBO0FBQ2pCLFVBQUksVUFBVSxPQUFPO0FBQ3JCLGFBQU0sV0FBVyxNQUFLO0FBQ2xCLGNBQU0sbUJBQW1CLGlCQUFpQixPQUFPO0FBQ2pELFlBQUcsNEJBQTRCLGdCQUFnQixpQkFBaUIsTUFBTSxLQUFHLFVBQVM7QUFDOUU7QUFBQSxRQUNKO0FBQ0EsaUJBQVMsS0FBSyxPQUFPO0FBQ3JCLGtCQUFVLFFBQVE7QUFBQSxNQUN0QjtBQUVBLG9CQUFjLFFBQVEsUUFBUSxVQUFVLFFBQVEsVUFBVTtBQUFBLElBQzlELENBQUM7QUFBQSxFQUNMO0FBQUEsRUFVQSxNQUFNLFVBQVU7QUFBQSxJQUNaLFlBQ1ksZ0JBQ0QsT0FDQSxVQUNBLEtBQ1Y7QUFKVyxXQUFBLGlCQUFBO0FBQ0QsV0FBQSxRQUFBO0FBQ0EsV0FBQSxXQUFBO0FBQ0EsV0FBQSxNQUFBO0FBQUEsSUFDVDtBQUFBLElBRUYsVUFBUztBQUNMLGFBQU8sQ0FBQyxLQUFLLE9BQU8sR0FBRyxLQUFLLFVBQVUsS0FBSyxHQUFHO0FBQUEsSUFDbEQ7QUFBQSxJQUVBLEtBQUk7QUFDQSxhQUFPLEtBQUssZUFBZTtBQUFBLElBQy9CO0FBQUEsRUFDSjtBQUVBLFdBQVMsUUFBUSxRQUF5QjtBQUN0QyxXQUFPLGtCQUFrQixZQUFZLE9BQU8sUUFBQSxJQUFZLENBQUMsTUFBTTtBQUFBLEVBQ25FO0FBR0EsV0FBUyxlQUFlLFVBQWlCLE9BQXFCO0FBQzFELFFBQUcsb0JBQW9CLGVBQWUsaUJBQWlCLGFBQVk7QUFDL0QsVUFBRyxTQUFTLFdBQVcsTUFBTSxTQUFRO0FBQ2pDLDBCQUFrQixLQUFLO0FBQ3ZCLDZCQUFxQixRQUFRO0FBQzdCLGVBQU87QUFBQSxNQUNYLE9BQU87QUFDSCxZQUFJLFVBQVU7QUFDZCxtQkFBVSxhQUFhLFNBQVMscUJBQW9CO0FBQ2hELGNBQUcsQ0FBQyxNQUFNLGFBQWEsU0FBUyxHQUFFO0FBQzlCLGdDQUFvQixVQUFVLFdBQVcsSUFBSTtBQUM3QyxzQkFBVTtBQUFBLFVBQ2Q7QUFBQSxRQUNKO0FBQ0EsaUJBQVEsSUFBRSxHQUFFLElBQUUsTUFBTSxXQUFXLFFBQU8sS0FBSTtBQUN0QyxnQkFBTSxZQUFZLE1BQU0sV0FBVyxDQUFDLEVBQUU7QUFDdEMsZ0JBQU0sWUFBWSxTQUFTLGFBQWEsU0FBUztBQUNqRCxnQkFBTSxZQUFZLE1BQU0sYUFBYSxTQUFTO0FBQzlDLGNBQUcsYUFBYSxXQUFVO0FBQ3RCLGdDQUFvQixVQUFVLFdBQVcsU0FBUztBQUNsRCxzQkFBVTtBQUFBLFVBQ2Q7QUFBQSxRQUNKO0FBQ0EsWUFBRyxTQUFRO0FBQ1Asb0NBQTBCLFFBQVE7QUFDbEMsK0JBQXFCLFFBQVE7QUFBQSxRQUNqQztBQUNBLHNCQUFjLFVBQVUsTUFBTSxTQUFTLFlBQVksTUFBTSxVQUFVO0FBQ25FLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSixXQUFXLG9CQUFvQixRQUFRLGlCQUFpQixNQUFLO0FBQ3pELFVBQUcsU0FBUyxlQUFlLE1BQU0sYUFBWTtBQUN6QyxlQUFPO0FBQUEsTUFDWCxPQUFPO0FBQ0gsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKLE9BQU87QUFDSCxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFFQSxXQUFTLGNBQ0wsS0FDQSxhQUNBLGFBQ0EscUJBQ0g7QUFDRyxVQUFNLFFBQVEsa0JBQWtCLEtBQUssYUFBYSxtQkFBbUI7QUFDckUsUUFBSTtBQUNKLFFBQUcsWUFBWSxTQUFTLEdBQUc7QUFDdkIsd0JBQWtCLFlBQVksWUFBWSxTQUFTLENBQUMsRUFBRTtBQUFBLElBQzFELFdBQVcsYUFBWTtBQUNuQix3QkFBa0IsWUFBWTtBQUFBLElBQ2xDLE9BQU87QUFDSCx3QkFBa0I7QUFBQSxJQUN0QjtBQUVBLFFBQUksVUFBK0IsY0FBYyxjQUFjO0FBQy9ELGFBQVMsZUFBNEI7QUFDakMsVUFBRyxXQUFXLFNBQVE7QUFDbEIsZUFBTyxJQUFJLGFBQWEsSUFBSSxhQUFhO0FBQUEsTUFDN0MsV0FBVSxXQUFXLE9BQU07QUFDdkIsZUFBTztBQUFBLE1BQ1gsT0FBTztBQUNILGVBQU8sUUFBUSxjQUFjLFFBQVEsY0FBYztBQUFBLE1BQ3ZEO0FBQUEsSUFDSjtBQUNBLGVBQVUsU0FBUyxPQUFNO0FBQ3JCLFVBQUksT0FBTyxhQUFBO0FBQ1gsVUFBRyxTQUFTLE9BQU07QUFDZCxZQUFJLGFBQWEsT0FBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsTUFDeEQ7QUFDQSxnQkFBVTtBQUFBLElBQ2Q7QUFDQSxjQUFVLGFBQUE7QUFDVixXQUFNLFdBQVcsU0FBUyxXQUFXLGlCQUFnQjtBQUNqRCxZQUFNLFFBQVE7QUFDZCxnQkFBVSxhQUFBO0FBQ1YsVUFBSSxZQUFZLEtBQUs7QUFBQSxJQUN6QjtBQUFBLEVBQ0o7QUFHQSxXQUFTLGtCQUNMLEtBQ0EsYUFDQSxxQkFDTzs7QUFDUCxVQUFNLFlBQVksMEJBQTBCLFdBQVc7QUFDdkQsVUFBTSxlQUFlLDBCQUEwQixtQkFBbUI7QUFDbEUsVUFBTSxlQUFlLGVBQWUsU0FBUztBQUU3QyxRQUFJLGdCQUFnQjtBQUNwQixRQUFJLG1CQUFtQjtBQUV2QixVQUFNLGdCQUF5QixDQUFBO0FBRS9CLFdBQU0sZ0JBQWdCLFVBQVUsVUFBVSxtQkFBbUIsYUFBYSxRQUFPO0FBQzdFLFVBQUksV0FBdUMsVUFBVSxhQUFhO0FBQ2xFLFlBQU0sUUFBb0MsYUFBYSxnQkFBZ0I7QUFDdkUsVUFBRyxZQUFZLENBQUMsT0FBTztBQUVuQixpQkFBUSxRQUFRLFFBQVEsUUFBUSxHQUFFO0FBQzlCLCtCQUFxQixJQUFJO0FBQUEsUUFDN0I7QUFDQSx5QkFBaUI7QUFBQSxNQUNyQixXQUFXLG9CQUFvQixNQUFNO0FBSWpDLHlCQUFpQjtBQUFBLE1BQ3JCLFdBQVcsaUJBQWlCLE1BQU07QUFDOUIsc0JBQWMsS0FBSyxLQUFLO0FBQ3hCLDRCQUFvQjtBQUFBLE1BQ3hCLE9BQU87QUE2QkgsWUFBUyxXQUFULFdBQW1CO0FBQ2YsZ0JBQU0sUUFBUSxLQUFNO0FBQ3BCLG1CQUFRLFFBQVEsS0FBSTtBQUNoQiw4QkFBa0IsSUFBSTtBQUFBLFVBQzFCO0FBQ0EsY0FBRyxVQUFTO0FBQ1IscUJBQVEsUUFBUSxRQUFRLFFBQVEsR0FBRTtBQUM5QixtQ0FBcUIsSUFBSTtBQUFBLFlBQzdCO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFwQ0EsY0FBTSxpQkFBaUIsaUJBQWlCLFlBQVksT0FBTyxpQkFBaUIsS0FBSztBQUNqRixjQUFNLHNCQUFzQixvQkFBb0IsUUFBUSxpQkFBaUIsUUFBUSxLQUFLO0FBQ3RGLFlBQUcsaUJBQWlCLFFBQVEsa0JBQWtCLFFBQVEsRUFBRSwwQkFBMEIsT0FBTTtBQUNwRixjQUFHLHFCQUFvQjtBQUNuQiwwQkFBYyxLQUFLLGVBQWUsVUFBa0IsS0FBSyxDQUFDO0FBQzFELDZCQUFpQjtBQUFBLFVBQ3JCLE9BQU87QUFDSCwwQkFBYyxLQUFLLEtBQUs7QUFDeEIsOEJBQWtCLEtBQUs7QUFBQSxVQUMzQjtBQUNBLDhCQUFvQjtBQUNwQjtBQUFBLFFBQ0osV0FBVyxxQkFBb0I7QUFDM0IsK0JBQXFCLFFBQWdCO0FBQ3JDLDJCQUFpQjtBQUNqQjtBQUFBLFFBQ0o7QUFFQSxjQUFNLFdBQVcsT0FBTyxLQUFLO0FBQzdCLFlBQUcsWUFBWSxNQUFLO0FBRWhCLHNCQUFXLGtCQUFhLFFBQVEsTUFBckIsbUJBQXdCO0FBQUEsUUFDdkM7QUFFQSxZQUFJLE1BQWUsQ0FBQTtBQWVuQixZQUFHLFlBQVksb0JBQW9CLGFBQWEsMEJBQTBCLFNBQVMsZUFBZSxNQUFNLFNBQVMsR0FBQSxLQUFRLFdBQVU7QUFDL0gsZ0JBQU0sUUFBUSxRQUFRO0FBQUEsUUFDMUIsT0FBTztBQUNILGNBQUcsQ0FBQyxVQUFTO0FBQ1QscUJBQUE7QUFBQSxVQUNKLE9BQU87QUFDSCxnQkFBRyxpQkFBaUIsV0FBVTtBQUMxQixrQkFBRyxvQkFBb0IsYUFBYSxTQUFTLFFBQVEsTUFBTSxNQUFLO0FBQzVELHNCQUFNO0FBQUEsa0JBQ0YsU0FBUztBQUFBLGtCQUNULEdBQUcsa0JBQWtCLEtBQUssU0FBUyxVQUFVLE1BQU0sUUFBUTtBQUFBLGtCQUMzRCxTQUFTO0FBQUEsZ0JBQUE7QUFBQSxjQUVqQixPQUFPO0FBQ0gseUJBQUE7QUFBQSxjQUNKO0FBQUEsWUFDSixXQUFVLG9CQUFvQixXQUFVO0FBQ3BDLHVCQUFBO0FBQUEsWUFDSixPQUFPO0FBQ0gsb0JBQU0sQ0FBQyxlQUFlLFVBQVUsS0FBSyxDQUFDO0FBQUEsWUFDMUM7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUNBLHNCQUFjLEtBQUssR0FBRyxHQUFHO0FBQ3pCLHlCQUFpQjtBQUNqQiw0QkFBb0I7QUFBQSxNQUN4QjtBQUFBLElBQ0o7QUFHQSxlQUFVLE9BQU8sT0FBTyxvQkFBb0IsWUFBWSxHQUFFO0FBQ3RELFlBQU1DLGFBQVksYUFBYSxHQUFHO0FBQ2xDLGVBQVEsWUFBWUEsWUFBVTtBQUMxQixpQkFBUSxRQUFRLFFBQVEsUUFBUSxHQUFFO0FBQzlCLCtCQUFxQixJQUFJO0FBQUEsUUFDN0I7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUVBLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUywwQkFBMEIsTUFBOEM7QUFDN0UsVUFBTSxTQUE2QixDQUFBO0FBQ25DLGFBQVEsSUFBRSxHQUFFLElBQUUsS0FBSyxRQUFPLEtBQUk7QUFDMUIsWUFBTSxRQUFRLEtBQUssQ0FBQztBQUNwQixZQUFNLFlBQVksaUJBQWlCLEtBQUs7QUFDeEMsVUFBSSxNQUFrQjtBQUN0QixVQUFHLHFCQUFxQixnQkFBZTtBQUNuQztBQUNBLGNBQU0sWUFBcUIsQ0FBQTtBQUMzQixlQUFNLElBQUksS0FBSyxRQUFPO0FBQ2xCLGdCQUFNLFdBQVcsS0FBSyxDQUFDO0FBQ3ZCLGdCQUFNLG1CQUFtQixpQkFBaUIsUUFBUTtBQUNsRCxjQUFHLDRCQUE0QixnQkFBZ0IsaUJBQWlCLE1BQU0sVUFBVSxJQUFHO0FBQy9FLGtCQUFNO0FBQ047QUFBQSxVQUNKLE9BQU87QUFDSCxzQkFBVSxLQUFLLFFBQVE7QUFBQSxVQUMzQjtBQUNBO0FBQUEsUUFDSjtBQUNBLFlBQUcsT0FBTyxNQUFLO0FBQ1gsZ0JBQU0sTUFBTSxtQ0FBbUMsVUFBVSxFQUFFO0FBQUEsUUFDL0Q7QUFDQSxlQUFPLEtBQUssSUFBSSxVQUFVLFdBQVcsT0FBTyxXQUFXLEdBQUcsQ0FBQztBQUFBLE1BQy9ELE9BQU87QUFDSCxlQUFPLEtBQUssS0FBSztBQUFBLE1BQ3JCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxlQUFlLFdBQXlFO0FBQzdGLFVBQU0sT0FBaUQsQ0FBQTtBQUN2RCxhQUFRLElBQUUsR0FBRSxJQUFFLFVBQVUsUUFBTyxLQUFJO0FBQy9CLFlBQU0sUUFBUSxVQUFVLENBQUM7QUFDekIsWUFBTSxNQUFNLE9BQU8sS0FBSztBQUN4QixVQUFHLE9BQU8sTUFBSztBQUNYLFlBQUksT0FBTyxLQUFLLEdBQUc7QUFDbkIsWUFBRyxDQUFDLE1BQUs7QUFDTCxpQkFBTyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQUEsUUFDdkI7QUFDQSxhQUFLLEtBQUssS0FBSztBQUFBLE1BQ25CO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxPQUFPLE9BQXdCO0FBQ3BDLFVBQU0sU0FBUyxpQkFBaUIsWUFBWSxNQUFNLFFBQVE7QUFDMUQsUUFBRyxrQkFBa0IsYUFBWTtBQUM3QixZQUFNLE1BQU0sT0FBTyxhQUFhLGVBQWUsR0FBRztBQUNsRCxVQUFHLE9BQU8sTUFBSztBQUNYLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FDaFVPLFdBQVMsaUJBQWlCLFNBQWtCLFlBQXFCLE9BQWEsUUFBOEM7QUFDL0gsVUFBTSxRQUFRLFNBQVMsY0FBYyxNQUFLLGVBQWUsUUFBTyxPQUFRLFVBQVUsSUFBSztBQUN2RixRQUFHLENBQUMsT0FBTTtBQUFFO0FBQUEsSUFBTztBQUNuQixRQUFJLE9BQVEsTUFBYyxjQUFlLE1BQWMsWUFBVTtBQUNqRSxRQUFHLFNBQVMsUUFBUSxZQUFZO0FBQzVCLGFBQU8sT0FBTyxLQUFLO0FBQUEsSUFDdkI7QUFBQSxFQUNKO0FDSk8sV0FBUyxlQUFlLEtBQXdCLE9BQWUsUUFBZ0I7QUFDbEYsUUFBSTtBQUNBLFlBQU0sTUFBTTtBQUFBLElBQ2hCLFNBQVEsR0FBRTtBQUNOLGtCQUFZLEdBQUcsS0FBSyxPQUFPLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFBQSxJQUNoRDtBQUFBLEVBQ0o7QUFHTyxXQUFTLGNBQWMsT0FBd0I7QUFDbEQsVUFBTSxRQUFRLGtDQUFJLFlBQWM7QUFDaEMsVUFBTSxRQUFRLE9BQU8sb0JBQW9CLEtBQUs7QUFDOUMsVUFBTSxTQUFTLE1BQU0sSUFBSSxDQUFDLFNBQVUsTUFBYyxJQUFJLENBQUM7QUFDdkQsV0FBTyxTQUFVLFFBQWlCO0FBQzlCLFlBQU0sV0FBVyxJQUFJLFNBQVMsR0FBRyxPQUFPO0FBQUEsRUFBd0IsTUFBTTtBQUFBLEtBQVE7QUFDOUUsYUFBTyxTQUFTLEdBQUcsTUFBTTtBQUFBLElBQzdCO0FBQUEsRUFDSjtBQUVPLFFBQU0sWUFBWTtBQUFBLElBQ3JCLENBQUMsaUJBQWlCLFNBQVMsR0FBRTtBQUFBLElBQzdCLENBQUMsaUJBQWlCLGdCQUFnQixHQUFFO0FBQUEsSUFDcEMsQ0FBQyxpQkFBaUIsV0FBVyxHQUFFO0FBQUEsSUFDL0IsQ0FBQyxpQkFBaUIsV0FBVyxHQUFFO0FBQUEsRUFDbkM7QUN2QkEsTUFBSSxjQUFjO0FBQ2xCLFFBQU0sbUJBQThCLENBQUE7QUFDcEMsTUFBSTtBQUVHLFdBQVMsZ0JBQWU7QUFDM0IsVUFBTSxNQUFNLElBQUksSUFBSyxPQUFlLGVBQWUsT0FBTyxTQUFTLElBQUk7QUFDdkUsUUFBSSxPQUFlLFdBQVU7QUFDekIsVUFBSSxPQUFRLE9BQWU7QUFBQSxJQUMvQjtBQUNBLFFBQUksV0FBWSxPQUFPLFNBQVMsYUFBYSxXQUFXLFdBQVc7QUFDbkUsYUFBUyxJQUFJLFVBQVUsSUFBSSxJQUFJO0FBQy9CLFdBQU8sU0FBUyxXQUFXO0FBQ3ZCLFlBQU0sS0FBTSxPQUFlO0FBQzNCLGNBQVEsSUFBSSx1QkFBdUIsRUFBRTtBQUNyQyxtQkFBYSxXQUFXLG9CQUFvQjtBQUM1QyxhQUFPLEtBQUssRUFBRTtBQUNkLG9CQUFjO0FBQ2QsYUFBTyxpQkFBaUIsU0FBUyxHQUFHO0FBQ2hDLG9CQUFZLGlCQUFpQixNQUFBLEdBQVUsSUFBSTtBQUFBLE1BQy9DO0FBQUEsSUFDSjtBQUVBLFdBQU8sWUFBWSxTQUFTLE9BQU87QUFDL0IsWUFBTSxPQUFRLE1BQU07QUFDcEIsWUFBTSxhQUFhLEtBQUssUUFBUSxtQkFBbUI7QUFDbkQsWUFBTSxNQUFNLEtBQUssVUFBVSxHQUFHLFVBQVU7QUFDeEMsWUFBTSxTQUFTLEtBQUssVUFBVSxhQUFXLEdBQUcsS0FBSyxNQUFNO0FBQ3ZELFlBQU0sUUFBUSxjQUFjLEVBQUU7QUFDOUIsd0JBQWtCLFdBQVU7QUFDeEIsdUJBQWUsS0FBSyxPQUFPLE1BQU07QUFBQSxNQUNyQyxDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksaUJBQWlCO0FBQ3JCLGFBQVMsY0FBYTtBQUNsQixVQUFHLGdCQUFlO0FBQUU7QUFBQSxNQUFRO0FBQzVCLHVCQUFpQjtBQUNqQixZQUFNLGFBQWEsYUFBYSxRQUFRLG9CQUFvQjtBQUM1RCxVQUFHLFlBQVc7QUFDVixxQkFBYSxrRkFBa0Y7QUFDL0YscUJBQWEsV0FBVyxvQkFBb0I7QUFBQSxNQUNoRCxPQUFPO0FBQ0gscUJBQWEsUUFBUSxzQkFBc0IsTUFBTTtBQUNqRCxpQkFBUyxPQUFBO0FBQUEsTUFDYjtBQUFBLElBQ0o7QUFDQSxXQUFPLFVBQVUsU0FBUyxLQUFLO0FBQzNCLGNBQVEsSUFBSSxrQkFBa0IsSUFBSSxNQUFNLEtBQUssSUFBSSxRQUFRLEVBQUU7QUFDM0Qsb0JBQWM7QUFDZCxVQUFJLElBQUksU0FBUztBQUFBLFdBRVY7QUFDSCxvQkFBQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsV0FBTyxVQUFVLFNBQVMsS0FBSztBQUMzQixjQUFRLElBQUksa0JBQWtCLEdBQUcsRUFBRTtBQUNuQyxvQkFBYztBQUNkLGtCQUFBO0FBQUEsSUFDSjtBQUVBLGdCQUFZLE1BQUk7QUFDWixVQUFHLGFBQVk7QUFDWCxlQUFPLEtBQUssRUFBRTtBQUFBLE1BQ2xCO0FBQUEsSUFDSixHQUFHLEtBQUcsR0FBSTtBQUFBLEVBQ2Q7QUFFTyxXQUFTLFlBQVksSUFBYSxLQUE2QjtBQUNsRSxVQUFNLFdBQVksUUFBUSxVQUFhLFFBQVEsT0FBUSxLQUFLLHNCQUFzQixNQUFNLEtBQUs7QUFDN0YsUUFBSSxhQUFhO0FBQ2IsYUFBTyxLQUFLLFFBQVE7QUFBQSxJQUN4QixPQUFPO0FBQ0gsdUJBQWlCLEtBQUssUUFBUTtBQUFBLElBQ2xDO0FBQUEsRUFDSjtBQUVPLFdBQVMsWUFBWSxPQUFpQixLQUFjLFVBQW1CO0FBQzFFLFVBQU0sT0FBTyxpQkFBaUIsUUFBUTtBQUFBLE1BQ2xDLE1BQU0sTUFBTTtBQUFBLE1BQ1osV0FBVyxNQUFNO0FBQUEsTUFDakIsT0FBUSxNQUFNO0FBQUEsTUFDZCxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQUEsSUFDQTtBQUFBLE1BQ0EsTUFBTTtBQUFBLE1BQ04sV0FBVyxvQkFBb0I7QUFBQSxNQUMvQixPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQUE7QUFFSixXQUFPLEtBQUssR0FBRyxxQkFBcUIsR0FBRyxPQUFPLFNBQVksS0FBSyxHQUFHLEdBQUcsbUJBQW1CLEtBQUssS0FBSyxVQUFVLElBQUksQ0FBQztBQUFBLEVBQ3JIO0FDNUZBLE1BQUcsQ0FBRSxPQUFlLE9BQU07QUFDckIsV0FBZSxRQUFRLENBQUE7QUFDeEIsUUFBRyxDQUFDLE9BQU8sV0FBVTtBQUNqQixtQkFBYSxzSEFBc0g7QUFBQSxJQUN2SSxPQUFPO0FBQ0gsb0JBQUE7QUFFQSx3QkFBa0IsV0FBVTtBQUN4Qix5QkFBaUIsU0FBUyxlQUFlO0FBQUEsTUFDN0MsQ0FBQztBQUVELGFBQU8saUJBQWlCLFNBQVMsU0FBUyxPQUFrQjtBQUN4RCxvQkFBWSxNQUFNLEtBQUs7QUFBQSxNQUMzQixDQUFDO0FBQ0QsYUFBTyxpQkFBaUIsc0JBQXNCLFNBQVMsT0FBOEI7QUFDakYsb0JBQVksTUFBTSxNQUFNO0FBQUEsTUFDNUIsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKOzsifQ==
