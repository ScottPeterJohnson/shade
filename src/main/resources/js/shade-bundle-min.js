(()=>{"use strict";var __webpack_modules__={722:(e,t,n)=>{n.d(t,{Qv:()=>b,Yo:()=>c,ip:()=>h,p3:()=>f,xx:()=>E});var o=n(463),r=n(601),i=n(242);const s=Symbol();function c(e){e[s]&&(delete e[s],d.add(e))}function a(e,t){let n=e[s];n||(n=e[s]={}),t in n||(n[t]=e.getAttribute(t))}const _=`[${r.UD.DirectiveType}=${r.wV.SetAttribute}]`,l=`script[type=${r.jA}]${_}`;function u(e){const t=Array.from(e.querySelectorAll(l));let n=e;for(;n=n.nextElementSibling,n&&n.matches(`script[type=${r.jA}][${r.UD.TargetSiblingDirective}]`);)t.push(n);const i={};for(let e of t){const t=(0,o.ho)(e);if(t&&t instanceof o.RP){let e=i[t.name];e||(e=i[t.name]=[]),e.push(t)}}for(let t of Object.getOwnPropertyNames(i)){const n=i[t],o=n[n.length-1];a(e,o.name),h(e,o.name,o.value)}const c=e[s]||{};for(let t of Object.getOwnPropertyNames(c))i[t]||(h(e,t,c[t]),delete c[t])}let d=new Set;function f(e){try{e()}finally{for(let e of d)u(e);d=new Set}}const p=Symbol();function E(e){d.add(e.target),e.element[p]=e.target}function b(e){const t=e[p];t&&d.add(t)}function h(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n),e instanceof HTMLInputElement&&("value"==t||"checked"==t)&&("value"==t&&e.value!=n?g(e,(()=>{e.value=null!=n?n:""})):"checked"==t&&e.checked!=(null!=n)&&g(e,(()=>{e.checked=null!=n})))}function g(e,t){i.SD.suppress=!0;const n=e.onchange;e.onchange=null,t(),e.onchange=n,i.SD.suppress=!1}},968:(e,t,n)=>{n.d(t,{v:()=>r});var o=n(601);function r(e,t,n,r){let i=document.querySelector("["+o.UD.Bound+'="'+e+'"]'),s=i.boundSeen||(i.boundSeen=0);i&&s<=t&&r(i,n)}},601:(e,t,n)=>{var o,r;n.d(t,{IC:()=>a,LQ:()=>_,TB:()=>l,UD:()=>r,Yd:()=>s,jA:()=>i,kh:()=>c,wV:()=>o}),function(e){e.ApplyJs="j",e.SetAttribute="a",e.EventHandler="e",e.ComponentStart="s",e.ComponentEnd="f",e.ComponentKeep="k"}(o||(o={})),function(e){e.DirectiveType="data-s",e.TargetSiblingDirective="data-f",e.ApplyJsScript="data-t",e.ApplyJsRunOption="data-r",e.SetAttributeName="data-a",e.SetAttributeValue="data-v",e.Key="data-k",e.EventName="data-e",e.EventCallbackId="data-i",e.EventPrefix="data-p",e.EventSuffix="data-x",e.EventData="data-d",e.Bound="data-b",e.Checkbox="data-c"}(r||(r={}));const i="shade",s="shade",c="e",a="|",_="E";var l;!function(e){e.reconcile="r",e.updateBoundInput="b",e.sendMessage="s",e.sendIfError="q"}(l||(l={}))},463:(e,t,n)=>{n.d(t,{pz:()=>l,q1:()=>_,WB:()=>u,RP:()=>d,tH:()=>b,ho:()=>E,rz:()=>m,VN:()=>v,_A:()=>D,y9:()=>w});var o=n(601),r=n(573),i=n(722),s=n(266);const c=Symbol();var a=n(242);class _{constructor(e){this.id=e}}class l{constructor(e){this.id=e}}class u{constructor(e){this.id=e}}class d{constructor(e,t){this.name=e,this.value=t}}class f{constructor(e,t){this.js=e,this.onlyOnCreate=t}}class p{constructor(e,t,n,o,r){this.eventName=e,this.callbackId=t,this.prefix=n,this.suffix=o,this.data=r}}function E(e){if(e instanceof HTMLElement&&"SCRIPT"==e.tagName&&e.getAttribute("type")===o.jA){const t=e.getAttribute(o.UD.DirectiveType),n=e.id;switch(t){case o.wV.ApplyJs:const t=e.getAttribute(o.UD.ApplyJsRunOption),r=e.getAttribute(o.UD.ApplyJsScript);return new f(r,"1"===t);case o.wV.ComponentStart:return new _(n.substr(o.Yd.length));case o.wV.ComponentEnd:return new l(n.substr(5,n.length-o.Yd.length-o.kh.length));case o.wV.ComponentKeep:return new u(n.substr(o.Yd.length));case o.wV.SetAttribute:{const t=e.getAttribute(o.UD.SetAttributeName),n=e.getAttribute(o.UD.SetAttributeValue);return new d(t,n)}case o.wV.EventHandler:{const t=e.getAttribute(o.UD.EventName),n=+e.getAttribute(o.UD.EventCallbackId),r=e.getAttribute(o.UD.EventPrefix),i=e.getAttribute(o.UD.EventSuffix),s=e.getAttribute(o.UD.EventData);return new p(t,n,r,i,s)}}}return null}function b(e){m((()=>{v(e)}))}let h=[],g=[];function m(e){(0,i.p3)((()=>{try{e()}finally{for(let e of h)O(e);for(let e of g)A(e);h=[],g=[]}}))}function v(e){if(e instanceof HTMLElement)for(let t of(0,r.l)(e,`script[type=${o.jA}]`)){const e=E(t);t instanceof HTMLElement&&e&&h.push({directive:e,element:t})}}function D(e){const t=E(e);t&&h.push({directive:t,element:e})}function w(e){if(e instanceof HTMLElement)for(let t of(0,r.l)(e,`script[type=${o.jA}]`)){const e=E(t);t instanceof HTMLElement&&e&&g.push({directive:e,element:t})}}function O(e){const t=function(e){if(e.hasAttribute(o.UD.TargetSiblingDirective)){let t=e;for(;t&&t.hasAttribute(o.UD.TargetSiblingDirective);)t=t.previousElementSibling;return t}return e.parentElement}(e.element);if(t){const n=e.directive,o=Object.assign(Object.assign({},e),{target:t});n instanceof d?(0,i.xx)(o):n instanceof f?function(e,t){const n=t.element[c];if(!e.onlyOnCreate||!n||n.js!=e.js||n.target!=t.target){t.element[c]={js:e.js,target:t.target};const n=t.target,o=(0,s.Dt)({it:n});(0,s.eF)(void 0,o,e.js)}}(n,o):n instanceof p&&(0,a.iY)(n,o)}else console.error(`Unknown target for ${e.element.outerHTML}`)}function A(e){const t=e.directive;t instanceof d&&(0,i.Qv)(e.element),t instanceof p&&(0,a.C1)(t,e)}},758:(e,t,n)=>{function o(e){const t=document.createElement("div");t.innerHTML="<div id='shadeModal' style='position: fixed;z-index: 999999999;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgba(0,0,0,0.4);'><div style='background-color: #fff;margin: 15% auto;padding: 20px;border: 1px solid #888;width: 80%;'><span id='shadeClose' style='float: right;font-size: 28px;font-weight: bold;cursor: pointer;'>&times;</span><p>"+e+"</p></div></div></div>",document.body.appendChild(t),document.getElementById("shadeClose").addEventListener("click",(function(){const e=document.getElementById("shadeModal");e.parentNode.removeChild(e)}))}n.d(t,{l:()=>o})},266:(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Dt:()=>makeEvalScope,eF:()=>evaluateScript});var _socket__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(302),_reconcile__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(162),_bound__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(968),_constants__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(601);function evaluateScript(e,t,n){try{t(n)}catch(t){(0,_socket__WEBPACK_IMPORTED_MODULE_0__.qA)(t,e,n.substring(0,256))}}function makeEvalScope(scope){const final=Object.assign(Object.assign({},baseScope),scope),base=[];for(let e of Object.getOwnPropertyNames(final))base.push(`var ${e}=final.${e};`);const baseScript=base.join("\n")+"\n";return function(script){eval("(function(){\n"+baseScript+script+"\n})()")}.bind({})}const baseScope={[_constants__WEBPACK_IMPORTED_MODULE_3__.TB.reconcile]:_reconcile__WEBPACK_IMPORTED_MODULE_1__.B,[_constants__WEBPACK_IMPORTED_MODULE_3__.TB.updateBoundInput]:_bound__WEBPACK_IMPORTED_MODULE_2__.v,[_constants__WEBPACK_IMPORTED_MODULE_3__.TB.sendMessage]:_socket__WEBPACK_IMPORTED_MODULE_0__.bG,[_constants__WEBPACK_IMPORTED_MODULE_3__.TB.sendIfError]:_socket__WEBPACK_IMPORTED_MODULE_0__.qA}},242:(e,t,n)=>{n.d(t,{C1:()=>a,SD:()=>i,iY:()=>c});var o=n(601),r=n(266);let i={suppress:!1};const s=Symbol();function c(e,t){_(t.element);const n=e.prefix?`${e.prefix};\n`:"",c=e.data?`,JSON.stringify(${e.data})`:"",a=e.suffix?`;\n${e.suffix}`:"",l=`${n}${o.TB.sendMessage}(${e.callbackId}${c})${a}`,u=function(e){if(i.suppress)return;const t=(0,r.Dt)({event:e,e,it:e.target});(0,r.eF)(void 0,t,l)};t.target.addEventListener(e.eventName,u),t.element[s]={eventName:e.eventName,listener:u,target:t.target}}function a(e,t){_(t.element)}function _(e){const t=e[s];t&&t.target.removeEventListener(t.eventName,t.listener)}},162:(e,t,n)=>{n.d(t,{B:()=>s});var o=n(463),r=n(601),i=n(722);function s(e,t){(0,o.rz)((()=>{const n=document.getElementById(r.Yd+e);if(!n)return;const i=n.parentElement,s=document.createElement(i.tagName);s.innerHTML=t;const c=[];let a=n.nextSibling;for(;null!=a;){const t=(0,o.ho)(a);if(t instanceof o.pz&&t.id==""+e)break;c.push(a),a=a.nextSibling}l(i,n,c,s.childNodes)}))}class c{constructor(e,t,n,o){this.startDirective=e,this.start=t,this.children=n,this.end=o}asNodes(){return[this.start,...this.children,this.end]}id(){return this.startDirective.id}}function a(e){return e instanceof c?e.asNodes():[e]}function _(e,t){if(e instanceof HTMLElement&&t instanceof HTMLElement){if(e.tagName!=t.tagName)return(0,o.VN)(t),(0,o.y9)(e),t;{let n=!1;for(let o=0;o<e.attributes.length;o++){const r=e.attributes[o].name;t.hasAttribute(r)||((0,i.ip)(e,r,null),n=!0)}for(let o=0;o<t.attributes.length;o++){const r=t.attributes[o].name,s=e.getAttribute(r),c=t.getAttribute(r);s!=c&&((0,i.ip)(e,r,c),n=!0)}return n&&((0,i.Yo)(e),(0,o._A)(e)),l(e,null,e.childNodes,t.childNodes),e}}return e instanceof Text&&t instanceof Text&&e.textContent==t.textContent?e:t}function l(e,t,n,o){const r=u(e,n,o);let i;i=n.length>0?n[n.length-1].nextSibling:t?t.nextSibling:null;let s=t||"start";function c(){return"start"==s?e.firstChild?e.firstChild:"end":"end"==s?"end":s.nextSibling?s.nextSibling:"end"}for(const t of r){let n=c();n!==t&&e.insertBefore(t,"end"===n?null:n),s=t}for(s=c();"end"!=s&&s!=i;){const t=s;s=c(),e.removeChild(t)}}function u(e,t,n){var r;const i=d(t),s=d(n),l=function(e){const t={};for(let n=0;n<e.length;n++){const o=e[n],r=f(o);if(null!=r){let e=t[r];e||(e=t[r]=[]),e.push(o)}}return t}(i);let p=0,E=0;const b=[];for(;p<i.length||E<s.length;){let h=i[p];const g=s[E];if(h&&null!=f(h))p+=1;else if(h&&!g){for(let m of a(h))(0,o.y9)(m);p+=1}else if(h instanceof Text)p+=1;else if(g instanceof Text)b.push(g),E+=1;else{const v=g instanceof c?null:(0,o.ho)(g),D=h instanceof Node&&null!=(0,o.ho)(h);if(g instanceof Node&&null!=v&&!(v instanceof o.WB)){D?(b.push(_(h,g)),p+=1):(b.push(g),(0,o.VN)(g)),E+=1;continue}if(D){(0,o.y9)(h),p+=1;continue}const w=f(g);null!=w&&(h&&(p-=1),h=null===(r=l[w])||void 0===r?void 0:r.pop());let O=[];function A(){O=a(g);for(let e of O)(0,o.VN)(e);if(h)for(let e of a(h))(0,o.y9)(e)}h&&h instanceof c&&v instanceof o.WB&&(v.id==h.id()||w)?O=a(h):h?g instanceof c?h instanceof c&&h.id()==g.id()?O=[h.start,...u(e,h.children,g.children),h.end]:A():h instanceof c?A():O=[_(h,g)]:A(),b.push(...O),p+=1,E+=1}}for(const M of Object.getOwnPropertyNames(l)){const P=l[M];for(let k of P)for(let y of a(k))(0,o.y9)(y)}return b}function d(e){const t=[];for(let n=0;n<e.length;n++){const r=e[n],i=(0,o.ho)(r);let s=null;if(i instanceof o.q1){n++;const a=[];for(;n<e.length;){const t=e[n],r=(0,o.ho)(t);if(r instanceof o.pz&&r.id==i.id){s=t;break}a.push(t),n++}if(null==s)throw Error("Missing end tag for component "+i.id);t.push(new c(i,r,a,s))}else t.push(r)}return t}function f(e){const t=e instanceof c?e.start:e;if(t instanceof HTMLElement){const e=t.getAttribute(r.UD.Key);if(null!=e)return e}return null}},302:(e,t,n)=>{n.d(t,{bG:()=>u,qA:()=>d,zp:()=>l});var o=n(758),r=n(266),i=n(601),s=n(573);let c=!1;const a=[];let _;function l(){const e=new URL(window.shadeEndpoint,window.location.href);window.shadeHost&&(e.host=window.shadeHost),e.protocol="https:"===window.location.protocol?"wss://":"ws://",_=new WebSocket(e.href),_.onopen=function(){const e=window.shadeId;for(console.log("Connected with ID "+e),localStorage.removeItem("shade_error_reload"),_.send(e),c=!0;a.length>0;)u(a.shift(),null)},_.onmessage=function(e){const t=e.data,n=t.indexOf(i.IC),o=t.substring(0,n),c=t.substring(n+1,t.length),a=(0,r.Dt)({});(0,s.O)((function(){(0,r.eF)(o,a,c)}))};let t=!1;function n(){t||(t=!0,localStorage.getItem("shade_error_reload")?((0,o.l)("This web page could not connect to its server. Please reload or try again later."),localStorage.removeItem("shade_last_error_reload")):(localStorage.setItem("shade_error_reload","true"),location.reload()))}_.onclose=function(e){console.log(`Socket closed: ${e.reason}, ${e.wasClean}`),c=!1,e.wasClean||n()},_.onerror=function(e){console.log(`Socket closed: ${e}`),c=!1,n()},setInterval((()=>{c&&_.send("")}),6e4)}function u(e,t){const n=null!=t?e+i.IC+t:e+i.IC;c?_.send(n):a.push(n)}function d(e,t,n){const o=e instanceof Error?{name:e.name,jsMessage:e.message,stack:e.stack,eval:n,tag:t}:{name:"Unknown",jsMessage:"Unknown error: "+e,stack:"",eval:n,tag:t};_.send(`${i.LQ}${null==t?"":t}${i.IC}`+JSON.stringify(o))}},573:(e,t,n)=>{function o(e,t){const n=e.querySelectorAll(t);return e.matches(t)?[e,...n]:Array.from(n)}function r(e){"complete"===document.readyState||"interactive"===document.readyState?e():document.addEventListener("DOMContentLoaded",e)}n.d(t,{O:()=>r,l:()=>o})}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var n=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](n,n.exports,__webpack_require__),n.exports}__webpack_require__.d=(e,t)=>{for(var n in t)__webpack_require__.o(t,n)&&!__webpack_require__.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},__webpack_require__.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var __webpack_exports__={},_socket__WEBPACK_IMPORTED_MODULE_0__,_errors__WEBPACK_IMPORTED_MODULE_2__,_utility__WEBPACK_IMPORTED_MODULE_3__,_directives__WEBPACK_IMPORTED_MODULE_1__;_socket__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(302),_errors__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(758),_utility__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(573),_directives__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(463),window.shade||(window.shade={},window.WebSocket?((0,_socket__WEBPACK_IMPORTED_MODULE_0__.zp)(),(0,_utility__WEBPACK_IMPORTED_MODULE_3__.O)((function(){(0,_directives__WEBPACK_IMPORTED_MODULE_1__.tH)(document.documentElement)})),window.addEventListener("error",(function(e){(0,_socket__WEBPACK_IMPORTED_MODULE_0__.qA)(e.error)})),window.addEventListener("unhandledrejection",(function(e){(0,_socket__WEBPACK_IMPORTED_MODULE_0__.qA)(e.reason)}))):(0,_errors__WEBPACK_IMPORTED_MODULE_2__.l)("Your web browser doesn't support this page, and it may not function correctly as a result. Upgrade your web browser."))})();