var __ember_auto_import__;(()=>{var e={259:(e,t,r)=>{"use strict"
async function i(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}
if(e.getAnimations)return await n(),Promise.all(e.getAnimations({subtree:t.subtree}).filter((e=>t.transitionProperty?e.transitionProperty===t.transitionProperty:!t.animationName||e.animationName===t.animationName)).map((e=>e.finished.catch((()=>{})))))}function n(){return new Promise(window.requestAnimationFrame)}r.r(t),r.d(t,{waitForAnimation:()=>i,waitForFrame:()=>n})},405:(e,t,r)=>{var i,n
e.exports=(i=_eai_d,n=_eai_r,window.emberAutoImportDynamic=function(e){return 1===arguments.length?n("_eai_dyn_"+e):n("_eai_dynt_"+e)(Array.prototype.slice.call(arguments,1))},window.emberAutoImportSync=function(e){return n("_eai_sync_"+e)(Array.prototype.slice.call(arguments,1))},void i("@zestia/animation-utils",[],(function(){return r(259)})))},538:function(e,t){window._eai_r=require,window._eai_d=define}},t={}
function r(i){var n=t[i]
if(void 0!==n)return n.exports
var o=t[i]={exports:{}}
return e[i].call(o.exports,o,o.exports,r),o.exports}r.d=(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r(538)
var i=r(405)
__ember_auto_import__=i})()
