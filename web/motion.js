/* SVG redraw and factual progress motion. No idle loops or external services. */
(()=>{
'use strict';
const preference=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),running=new Map(),progressValues=new Map(),counters=new Map(),pending=new Map();
let scheduled=false,counterFrame=0,lastRoute='',entryRoute='',projectRoute='';
const duration=1000,easing='cubic-bezier(.333333,1,.666667,1)';
function animate(el,frames,options={}){
 if(!el||preference.matches||document.hidden||!el.animate)return;
 running.get(el)?.cancel();const a=el.animate(frames,{duration:360,easing:'cubic-bezier(.2,.8,.2,1)',...options});running.set(el,a);
 const done=()=>{if(running.get(el)===a)running.delete(el);};a.onfinish=done;a.oncancel=done;
}
function enter(el,delay=0){if(!el||seen.has(el))return;seen.add(el);animate(el,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{delay,duration:420,fill:'backwards'});}
function iconMotion(svg){
 if(!svg||preference.matches||document.hidden)return;
 svg.querySelectorAll('[pathLength="1"]').forEach((shape,i)=>animate(shape,[{strokeDasharray:'1 1',strokeDashoffset:1},{strokeDasharray:'1 1',strokeDashoffset:0}],{duration:620,delay:Math.min(i*45,180),easing:'cubic-bezier(.4,0,.2,1)',fill:'backwards'}));
}
function counterTick(now){
 counterFrame=0;
 for(const [el,c] of counters){
  if(!el.isConnected){counters.delete(el);continue;}
  const t=Math.min(1,Math.max(0,(now-c.start)/c.duration)),ease=c.smooth?t*t*(3-2*t):1-(1-t)**3;
  el.textContent='%'+Math.round(c.from+(c.to-c.from)*ease);
  if(t===1)counters.delete(el);
 }
 if(counters.size)counterFrame=requestAnimationFrame(counterTick);
}
function startProgress(track){
 const record=pending.get(track);if(!record)return;pending.delete(track);observer?.unobserve(track);
 if(!track.isConnected)return;
 const {key,value,number}=record,prior=progressValues.get(key),replay=track.hasAttribute('data-progress-replay');progressValues.set(key,value);
 while(progressValues.size>4096)progressValues.delete(progressValues.keys().next().value);
 const fill=track.querySelector('[data-progress-fill]')||track.firstElementChild;
 if(preference.matches||document.hidden||!fill?.animate){if(number)number.textContent='%'+value;return;}
 if(prior===value&&!replay)return;
 const from=replay?0:prior??0,smooth=track.dataset.progressEasing==='smooth',ms=prior===undefined||replay?(smooth?1200:duration):650;
 const frames=track.dataset.progressKind==='ring'?[{strokeDashoffset:100-from},{strokeDashoffset:100-value}]:[{transform:`scaleX(${from/100})`},{transform:`scaleX(${value/100})`}];
 // Linear time coordinates keep the ring and its numeric counter on the same curve.
 animate(fill,frames,{duration:ms,easing:smooth?'cubic-bezier(.333333,0,.666667,1)':easing});
 if(number){number.textContent='%'+from;counters.set(number,{from,to:value,start:performance.now(),duration:ms,smooth});if(!counterFrame)counterFrame=requestAnimationFrame(counterTick);}
}
const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)startProgress(e.target);},{threshold:.15}):null;
function progressMotion(){
 const route=location.pathname+location.search;if(route!==lastRoute){lastRoute=route;progressValues.clear();}
 const numbers=new Map([...document.querySelectorAll('[data-progress-number]')].map(el=>[el.dataset.progressNumber,el]));
 for(const track of document.querySelectorAll('[data-progress-key][data-progress-value]')){
  if(seen.has(track))continue;seen.add(track);
  const key=track.dataset.progressKey,value=Math.max(0,Math.min(100,Number(track.dataset.progressValue)||0));
  pending.set(track,{key,value,number:numbers.get(key)});
  if(observer)observer.observe(track);else startProgress(track);
 }
 for(const [el] of pending)if(!el.isConnected){observer?.unobserve(el);pending.delete(el);}
}
function scan(){
 scheduled=false;progressMotion();
 const main=document.querySelector('#hub-main');if(main&&!seen.has(main)&&entryRoute!==location.pathname+location.search){entryRoute=location.pathname+location.search;seen.add(main);enter(main.querySelector('.h-page-heading,.p-welcome,.dash-heading'));main.querySelectorAll('.h-metric,.h-project-card,.h-person-card,.h-org-card,.h-column,.p-focus-panel,.flow-side>section,.dash-summary,.dash-panel').forEach((el,i)=>{if(i<16)enter(el,Math.min(i*40,200));});}
 const work=document.querySelector('#work-plan-view:not(.hidden)');if(work&&projectRoute!==location.pathname+location.search){projectRoute=location.pathname+location.search;enter(work.querySelector('.wp-commandbar'));work.querySelectorAll('.op-column,.wp-day,.op-timeline,.op-calendar,.op-day-agenda').forEach((el,i)=>enter(el,Math.min(i*45,180)));}
 for(const el of document.querySelectorAll('.login-story,.login-form-card,.inspector-identity'))enter(el);
 for(const el of document.querySelectorAll('.h-toast,.team-toast,.toast'))if(!seen.has(el)){seen.add(el);animate(el,[{opacity:0,transform:'translate(-50%, 12px)'},{opacity:1,transform:'translate(-50%, 0)'}]);}
 for(const [el,a] of running)if(!el.isConnected){a.cancel();running.delete(el);}
}
new MutationObserver(records=>{
 if(records.every(r=>r.target.closest?.('#minimap,#edges,[data-progress-number]')))return;
 if(!scheduled){scheduled=true;requestAnimationFrame(scan);}
}).observe(document.body,{childList:true,subtree:true});
const controls='button,a,summary,[role="button"]';
function play(e){
 const c=e.target.closest(controls),svg=e.target.closest('[data-motion-icon]');
 if(c){if(c.disabled||c.contains(e.relatedTarget))return;c.querySelectorAll('[data-motion-icon]').forEach(iconMotion);}
 else if(svg&&!svg.contains(e.relatedTarget))iconMotion(svg);
}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')play(e);});document.addEventListener('focusin',play);
document.addEventListener('click',e=>{if(e.pointerType==='touch')play(e);});
document.addEventListener('toggle',e=>{const el=e.target;if(el instanceof HTMLDialogElement&&el.open)animate(el,[{opacity:0,transform:'translateY(12px) scale(.99)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:260});},true);
function cancel(){
 for(const a of running.values())a.cancel();running.clear();
 for(const [el,c] of counters)if(el.isConnected)el.textContent='%'+c.to;counters.clear();
 cancelAnimationFrame(counterFrame);counterFrame=0;
}
preference.addEventListener('change',()=>{if(preference.matches)cancel();});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});scan();window.DalMotion={scan};
})();
