/* Interruptible, function-led SVG motion. No scrolling overrides or idle loops. */
(()=>{
'use strict';
const preference=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),running=new Map(),progressValues=new Map();let scheduled=false,lastActive='';
function animate(el,frames,options={}){if(!el||preference.matches||document.hidden||!el.animate)return;running.get(el)?.cancel();const a=el.animate(frames,{duration:360,easing:'cubic-bezier(.2,.8,.2,1)',...options});running.set(el,a);const done=()=>{if(running.get(el)===a)running.delete(el);};a.onfinish=done;a.oncancel=done;}
function enter(el,delay=0){if(!el||seen.has(el))return;seen.add(el);animate(el,[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{delay,duration:220,fill:'backwards'});}
function iconMotion(svg){
 if(!svg||preference.matches)return;const name=svg.dataset.motionIcon;
 const part=(key,frames,options)=>animate(svg.querySelector(`[data-icon-part="${key}"]`),frames,options);
 const transform=(key,values,options={})=>part(key,values.map(transform=>({transform})),options);
 switch(name){
 case 'bell':transform('bell',['rotate(0deg)','rotate(-16deg)','rotate(12deg)','rotate(-6deg)','rotate(0deg)'],{duration:620});transform('clapper',['translateX(0)','translateX(1.2px)','translateX(-1px)','translateX(0)'],{duration:600});break;
 case 'folder':transform('lid',['translateY(0) scaleY(1)','translateY(1px) scaleY(.76)','translateY(0) scaleY(1)'],{duration:500});break;
 case 'sun':transform('rays',['rotate(0deg)','rotate(45deg)'],{duration:650});transform('core',['scale(1)','scale(1.12)','scale(1)'],{duration:650});break;
 case 'tasks':case 'menu':case 'note':['row1','row2','row3'].forEach((k,i)=>transform(k,['translateX(0)','translateX(2px)','translateX(0)'],{delay:i*65,duration:300}));break;
 case 'hierarchy':transform('root',['translateY(0)','translateY(-1px)','translateY(0)']);part('branches',[{opacity:.4},{opacity:1}]);transform('leaves',['translateY(0)','translateY(1.5px)','translateY(0)'],{delay:90});break;
 case 'team':transform('person1',['translateX(0)','translateX(1px)','translateX(0)']);transform('person2',['translateX(0)','translateX(-1px)','translateX(0)'],{delay:65});break;
 case 'calendar':transform('date',['translateY(0)','translateY(2px)','translateY(0)']);part('date',[{opacity:1},{opacity:.3},{opacity:1}]);break;
 case 'check':case 'checkCircle':case 'check-square':case 'shield':part('tick',[{strokeDasharray:'1',strokeDashoffset:1,opacity:.4},{strokeDasharray:'1',strokeDashoffset:0,opacity:1}],{duration:440});break;
 case 'search':transform('lens',['scale(1)','scale(1.12)','scale(1)']);transform('handle',['translate(0,0)','translate(1px,1px)','translate(0,0)']);break;
 case 'share':transform('arrow',['translateY(0)','translateY(-3px)','translateY(0)'],{duration:450});break;
 case 'download':transform('arrow',['translateY(0)','translateY(3px)','translateY(0)'],{duration:450});break;
 case 'arrow':transform('arrow',['translateX(0)','translateX(3px)','translateX(0)']);break;
 case 'back':transform('arrow',['translateX(0)','translateX(-3px)','translateX(0)']);break;
 case 'plus':transform('vertical',['scaleY(1)','scaleY(.6)','scaleY(1)']);transform('horizontal',['scaleX(1)','scaleX(.6)','scaleX(1)']);break;
 case 'layers':['layer1','layer2','layer3'].forEach((k,i)=>transform(k,['translateY(0)',`translateY(${(i-1)*1.5}px)`,'translateY(0)'],{delay:i*35}));break;
 case 'board':transform('column1',['translateY(0)','translateY(-1.5px)','translateY(0)']);transform('column2',['translateY(0)','translateY(1.5px)','translateY(0)']);break;
 case 'clock':transform('hand',['rotate(0deg)','rotate(30deg)','rotate(0deg)'],{duration:500});break;
 case 'star':transform('star',['scale(1) rotate(0deg)','scale(1.15) rotate(10deg)','scale(1) rotate(0deg)']);break;
 case 'link':transform('link1',['translate(0,0)','translate(-1px,1px)','translate(0,0)']);transform('link2',['translate(0,0)','translate(1px,-1px)','translate(0,0)']);break;
 case 'fit':transform('corners',['scale(1)','scale(.85)','scale(1)']);break;
 case 'undo':case 'redo':transform('arrow',['rotate(0deg)',`rotate(${name==='undo'?'-':''}12deg)`,'rotate(0deg)']);break;
 case 'refresh':transform('arrows',['rotate(0deg)','rotate(180deg)'],{duration:550});break;
 case 'chat':transform('bubble',['scale(1)','scale(1.06)','scale(1)']);part('dots',[{opacity:.3},{opacity:1}],{delay:100});break;
 case 'help':transform('question',['translateY(0)','translateY(-1.5px)','translateY(0)']);break;
 case 'sidebar':case 'panel-right':transform('panel',['translateX(0)',`translateX(${name==='sidebar'?2:-2}px)`,'translateX(0)']);break;
 case 'copy':transform('page',['translate(0,0)','translate(1.5px,1.5px)','translate(0,0)']);break;
 case 'trash':transform('lid',['translateY(0) rotate(0deg)','translateY(-2px) rotate(-8deg)','translateY(0) rotate(0deg)']);break;
 case 'branch':transform('arrow',['translateX(0)','translateX(2px)','translateX(0)']);break;
 case 'file-plus':transform('plus',['scale(1)','scale(1.2)','scale(1)']);break;
 case 'leaf':transform('leaf',['rotate(0deg)','rotate(-9deg)','rotate(0deg)']);break;
 case 'flag':transform('cloth',['scaleX(1)','scaleX(.8)','scaleX(1)']);break;
 case 'more':['dot1','dot2','dot3'].forEach((k,i)=>transform(k,['translateY(0)','translateY(-2px)','translateY(0)'],{delay:i*65}));break;
 case 'down':transform('arrow',['translateY(0)','translateY(2px)','translateY(0)']);break;
 case 'chevron':transform('arrow',['translateX(0)','translateX(2px)','translateX(0)']);break;
 case 'info':part('info',[{opacity:.3},{opacity:1}]);break;
 case 'close':transform('cross',['rotate(0deg)','rotate(90deg)']);break;
 default:transform('body',['scale(1)','scale(1.06)','scale(1)']);
 }
}
function progressMotion(){for(const track of document.querySelectorAll('.h-progress[data-progress-key],.node-progress-track[data-progress-key]')){if(seen.has(track))continue;seen.add(track);const key=track.dataset.progressKey,value=Number(track.dataset.progressValue),prior=progressValues.get(key);progressValues.set(key,value);if(value>0&&prior!==value)animate(track.firstElementChild,[{transform:`scaleX(${(prior??0)/value})`},{transform:'scaleX(1)'}],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'});}while(progressValues.size>4096)progressValues.delete(progressValues.keys().next().value);}
function scan(){scheduled=false;progressMotion();const main=document.querySelector('#hub-main');if(main&&!seen.has(main)){seen.add(main);enter(main.querySelector('.h-page-heading,.p-welcome'));main.querySelectorAll('.h-metric,.h-project-card,.h-person-card,.h-org-card,.h-column,.p-focus-panel,.flow-side>section').forEach((el,i)=>{if(i<16)enter(el,Math.min(i*35,175));});}for(const el of document.querySelectorAll('.login-story,.login-form-card,.inspector-identity'))enter(el);for(const el of document.querySelectorAll('.h-toast,.team-toast,.toast'))if(!seen.has(el)){seen.add(el);animate(el,[{opacity:0,transform:'translate(-50%, 12px)'},{opacity:1,transform:'translate(-50%, 0)'}]);iconMotion(el.querySelector('[data-motion-icon]'));}const current=document.querySelector('[aria-current="page"]');if(current&&current.dataset.view!==lastActive){lastActive=current.dataset.view;iconMotion(current.querySelector('[data-motion-icon]'));}for(const icon of document.querySelectorAll('.h-check[aria-checked="true"] [data-motion-icon]'))if(!seen.has(icon)){seen.add(icon);iconMotion(icon);}for(const [el,a] of running)if(!el.isConnected){a.cancel();running.delete(el);}}
new MutationObserver(records=>{if(records.every(r=>r.target.closest?.('#minimap,#edges')))return;if(!scheduled){scheduled=true;requestAnimationFrame(scan);}}).observe(document.body,{childList:true,subtree:true});
const controls='button,a,summary,[role="button"]';
const play=e=>{const c=e.target.closest(controls);if(!c||c.disabled||c.contains(e.relatedTarget))return;c.querySelectorAll('[data-motion-icon]').forEach(iconMotion);};
document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')play(e);});document.addEventListener('focusin',play);document.addEventListener('click',e=>{const c=e.target.closest(controls);if(c&&!c.disabled)c.querySelectorAll('[data-motion-icon]').forEach(iconMotion);});
document.addEventListener('toggle',e=>{const el=e.target;if(el instanceof HTMLDialogElement&&el.open)animate(el,[{opacity:0,transform:'translateY(12px) scale(.99)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:260});},true);
const cancel=()=>{for(const a of running.values())a.cancel();running.clear();};preference.addEventListener('change',()=>{if(preference.matches)cancel();});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});scan();window.DalMotion={scan};
})();
