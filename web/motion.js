/* Native web motion: interruptible, compositor-only, no scroll interception. */
(()=>{
 'use strict';const preference=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),running=new Map();let lastView='';
 const easing='cubic-bezier(.2,.8,.2,1)';
 function animate(el,frames,options={}){if(!el||preference.matches)return;running.get(el)?.cancel();const animation=el.animate(frames,{duration:440,easing,...options});running.set(el,animation);const done=()=>{if(running.get(el)===animation)running.delete(el);};animation.onfinish=done;animation.oncancel=done;}
 function enter(el,delay=0,offset=18){if(seen.has(el))return;seen.add(el);animate(el,[{opacity:0,transform:`translateY(${offset}px)`},{opacity:1,transform:'translateY(0)'}],{delay,duration:520,fill:'backwards'});}
 function scan(){const main=document.querySelector('#hub-main'),view=window.DalHub?.state.view;if(main&&view!==lastView){lastView=view;enter(main.querySelector('.h-page-heading,.p-welcome'),0,22);main.querySelectorAll('.h-metric,.h-project-card,.coord-event,.coord-report-section,.p-tasks-card,.p-today-card,.p-right-column>section,.h-task-row').forEach((el,i)=>{if(i<24)enter(el,Math.min(i*38,240),20);});}
 for(const login of document.querySelectorAll('.login-story,.login-form-card'))enter(login,login.classList.contains('login-form-card')?150:0,24);
 for(const toast of document.querySelectorAll('.h-toast,.team-toast')){if(!seen.has(toast)){seen.add(toast);animate(toast,[{opacity:0,transform:'translate(-50%, 18px) scale(.98)'},{opacity:1,transform:'translate(-50%, 0) scale(1)'}],{duration:300});}}
 for(const [el,a] of running)if(!el.isConnected){a.cancel();running.delete(el);}}
 const observer=new MutationObserver(()=>{requestAnimationFrame(scan);});observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',e=>{const button=e.target.closest('.h-check,.h-star,.h-btn,.team-button,.coord-event');if(!button||button.disabled)return;animate(button,[{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:260});});
 document.addEventListener('toggle',e=>{const el=e.target;if(el instanceof HTMLDialogElement&&el.open)animate(el,[{opacity:0,transform:'translateY(24px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:360});},true);
 preference.addEventListener('change',()=>{if(preference.matches){for(const a of running.values())a.cancel();running.clear();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const a of running.values()){try{a.finish();}catch{a.cancel();}}running.clear();}});
 scan();window.DalMotion={scan};
})();
