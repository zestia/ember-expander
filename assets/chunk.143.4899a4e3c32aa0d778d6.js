var __ember_auto_import__;(()=>{var e={268:(e,t,r)=>{"use strict"
async function n(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}
if("function"==typeof e.getAnimations)return o().length<1&&!0!==t.maybe?await r():await n(),Promise.allSettled(o().map((e=>e.finished)))
function r(){return new Promise((t=>{e.addEventListener("animationstart",t,{once:!0}),e.addEventListener("transitionstart",t,{once:!0})}))}function n(){return new Promise(window.requestAnimationFrame)}function o(){return e.getAnimations({subtree:t.subtree}).filter((e=>t.transitionProperty?e.transitionProperty===t.transitionProperty:!t.animationName||e.animationName===t.animationName))}}r.r(t),r.d(t,{waitForAnimation:()=>n})},371:(e,t,r)=>{var n,o
e.exports=(n=_eai_d,o=_eai_r,window.emberAutoImportDynamic=function(e){return 1===arguments.length?o("_eai_dyn_"+e):o("_eai_dynt_"+e)(Array.prototype.slice.call(arguments,1))},window.emberAutoImportSync=function(e){return o("_eai_sync_"+e)(Array.prototype.slice.call(arguments,1))},n("__v1-addons__early-boot-set__",["@glimmer/tracking","@glimmer/component","@ember/service","@ember/controller","@ember/routing/route","@ember/component"],(function(){})),void n("@zestia/animation-utils",["__v1-addons__early-boot-set__"],(function(){return r(268)})))},589:function(e,t){window._eai_r=require,window._eai_d=define}},t={}
function r(n){var o=t[n]
if(void 0!==o)return o.exports
var i=t[n]={exports:{}}
return e[n].call(i.exports,i,i.exports,r),i.exports}r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r(589)
var n=r(371)
__ember_auto_import__=n})()
