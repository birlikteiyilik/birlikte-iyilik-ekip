/* In-app presentation viewer. Only an authorized project snapshot is supplied. */
(()=>{
  'use strict';
  const E=window.DalCore.esc,I=name=>window.DalIcons.render(name,'h-icon'),M=window.DalPresentationModel;
  let dialog=null,doc=null,deck=null,index=0,showPeople=true,launcher=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set();
  function motion(el,frames,options={}){if(!el||reduced.matches||document.hidden||!el.animate)return;const a=el.animate(frames,{duration:320,easing:'cubic-bezier(.22,1,.36,1)',...options});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);}
  const cancelMotion=()=>{for(const a of animations)a.cancel();animations.clear();};
  function shortDate(value){return value?new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'short'}).format(new Date(value+'T12:00:00Z')):'';}
  function content(s){
    if(s.type==='cover')return `<div class="present-cover-copy">${s.sample?'<p class="present-example">Düzenlenebilir örnek</p>':''}<h1>${E(s.title)}</h1><p class="present-date">${E(s.date)}</p></div>`;
    const title=`<h1>${E(s.title)}</h1>`;
    if(s.type==='structure')return `${title}<p class="present-body">${E(s.body)}</p><div class="present-structure">${s.rows.map((r,i)=>`<div><span class="present-number">0${i+1}</span><h2>${E(r.title)}</h2>${r.detail?`<p>${E(r.detail)}</p>`:''}</div>`).join('')}</div>${s.extra?`<p class="present-caption">${s.extra} diğer alan proje içinde yer alıyor.</p>`:''}`;
    if(s.type==='progress')return `${title}<div class="present-progress-value"><strong data-progress-number="presentation:progress" aria-hidden="true">%${s.percent}</strong><span>${s.done} / ${s.total} iş tamamlandı</span></div><div class="present-progress-track" data-progress-key="presentation:progress" data-progress-value="${s.percent}" data-progress-replay role="progressbar" aria-label="Proje tamamlanma" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.percent}"><span style="transform:scaleX(${s.percent/100})"></span></div><div class="present-stats"><div><strong>${s.done}</strong><span>Tamamlanan</span></div><div><strong>${s.open}</strong><span>Açık işler</span></div><div><strong>${s.doing}</strong><span>Devam eden</span></div></div>`;
    if(s.type==='people')return `${title}<table class="present-people"><thead><tr><th scope="col">Sorumlu</th><th scope="col">Tamamlanan</th><th scope="col">Açık</th></tr></thead><tbody>${s.rows.map(r=>`<tr><th scope="row">${E(r.name)}</th><td>${r.done} / ${r.total}</td><td>${r.open}</td></tr>`).join('')}</tbody></table>${s.extra?`<p class="present-caption">${s.extra} diğer sorumlu proje içinde yer alıyor.</p>`:''}`;
    if(s.type==='next')return `${title}<ol class="present-next">${s.rows.map(r=>`<li><h2>${E(r.title)}</h2><p>${r.owner?`<span>${E(r.owner)}</span>`:''}${r.date?`<time datetime="${r.date}">${E(shortDate(r.date))}</time>`:''}<span>${E(r.status==='Planlandı'?'Yapılacak':r.status)}</span></p></li>`).join('')}</ol>${s.extra?`<p class="present-caption">${s.extra} diğer açık iş proje içinde yer alıyor.</p>`:''}`;
    if(s.type==='attention')return `${title}<div class="present-stats present-attention"><div><strong>${s.late}</strong><span>Tarihi geçen</span></div><div><strong>${s.waiting}</strong><span>Beklemede</span></div><div><strong>${s.unassigned}</strong><span>Sorumlusu belirlenmemiş</span></div></div><p class="present-caption">Bir iş birden fazla grupta yer alabilir.</p>`;
    if(s.type==='complete')return `${title}<p class="present-large-number">${s.done}</p><p class="present-body">Tamamlanan iş</p>`;
    return `${title}<p class="present-body">${E(s.body)}</p><ol class="present-next">${s.rows.map(r=>`<li><h2>${E(r)}</h2></li>`).join('')}</ol>`;
  }
  function render(direction=1){
    cancelMotion();const s=deck.slides[index];dialog.dataset.slideType=s.type;
    dialog.querySelector('.present-stage').innerHTML=`<article class="present-slide ${s.type==='cover'?'cover':''}" aria-label="${index+1}. slayt: ${E(s.title)}"><img class="present-logo" src="assets/brand/wordmark-${s.type==='cover'?'white':'black'}.png" alt="birlikteiyilik.com"><div class="present-slide-content">${content(s)}</div></article>`;
    dialog.querySelector('[data-present=previous]').disabled=index===0;dialog.querySelector('[data-present=next]').disabled=index===deck.slides.length-1;
    dialog.querySelector('.present-counter').textContent=`${index+1} / ${deck.slides.length}`;
    dialog.querySelector('.present-pages').innerHTML=deck.slides.map((slide,i)=>`<button data-present="page" data-index="${i}" aria-label="${i+1}. slayt: ${E(slide.title)}" ${i===index?'aria-current="step"':''}>${i+1}</button>`).join('');
    const toggle=dialog.querySelector('[data-present=names]');toggle.innerHTML=I('team')+(showPeople?'İş sahiplerini gizle':'İş sahiplerini göster');toggle.setAttribute('aria-pressed',String(!showPeople));
    dialog.querySelector('.present-announcement').textContent=`${index+1}. slayt, ${s.title}`;
    motion(dialog.querySelector('.present-slide-content'),[{opacity:0,transform:`translateX(${direction*16}px)`},{opacity:1,transform:'translateX(0)'}]);
    window.DalMotion?.scan();
  }
  function step(value){const next=Math.max(0,Math.min(deck.slides.length-1,value));if(next===index)return;const dir=next>index?1:-1;index=next;render(dir);}
  async function close(){cancelMotion();if(document.fullscreenElement===dialog)try{await document.exitFullscreen();}catch(_){}dialog?.close();dialog?.querySelector('.present-stage').replaceChildren();doc=null;deck=null;launcher?.isConnected&&launcher.focus();}
  function open(raw){
    launcher=document.activeElement;doc=window.DalCore.clone(raw);showPeople=true;index=0;deck=M.build(doc,{showPeople});
    if(!dialog){dialog=document.createElement('dialog');dialog.id='project-presentation';dialog.setAttribute('aria-label','Proje sunumu');dialog.innerHTML=`<header class="present-toolbar"><strong>Proje sunumu<small class="present-feedback"></small></strong><div><button data-present="names"></button><button data-present="fullscreen">${I('maximize')}Tam ekran</button><button data-present="close">${I('close')}Kapat</button></div></header><main class="present-stage"></main><footer class="present-controls"><button data-present="previous">${I('back')}Önceki</button><div class="present-pages" aria-label="Slayt seçimi"></div><span class="present-counter"></span><button data-present="next">Sonraki${I('arrow')}</button></footer><span class="present-announcement h-sr-only" role="status" aria-live="polite"></span>`;document.body.appendChild(dialog);
      dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
      dialog.addEventListener('click',async e=>{const button=e.target.closest('[data-present]');if(!button)return;const action=button.dataset.present;
        if(action==='close')return close();if(action==='previous')return step(index-1);if(action==='next')return step(index+1);if(action==='page')return step(Number(button.dataset.index));
        if(action==='names'){showPeople=!showPeople;const type=deck.slides[index].type;deck=M.build(doc,{showPeople});const match=deck.slides.findIndex(s=>s.type===type);index=match>=0?match:Math.min(index,deck.slides.length-1);render();button.focus();return;}
        if(action==='fullscreen')try{if(document.fullscreenElement===dialog)await document.exitFullscreen();else await dialog.requestFullscreen();}catch(_){const message='Sunum bu tarayıcıda pencere içinde açık.';dialog.querySelector('.present-feedback').textContent=message;dialog.querySelector('.present-announcement').textContent=message;}
      });
    }
    dialog.querySelector('.present-feedback').textContent='';render();dialog.showModal();dialog.querySelector('[data-present=next]').focus();
  }
  document.addEventListener('keydown',e=>{if(!dialog?.open)return;e.stopImmediatePropagation();if(e.ctrlKey||e.metaKey||e.altKey||e.key==='Tab')return;if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();step(index+1);}else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();step(index-1);}else if(e.key==='Home'){e.preventDefault();step(0);}else if(e.key==='End'){e.preventDefault();step(deck.slides.length-1);}else if(e.key==='Escape'){e.preventDefault();close();}},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelMotion();});reduced.addEventListener('change',()=>{if(reduced.matches)cancelMotion();});
  window.DalPresentation={open,close,isOpen:()=>!!dialog?.open};
})();
