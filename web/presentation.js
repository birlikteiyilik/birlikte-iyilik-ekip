/* In-app presentation viewer. Only an authorized project snapshot is supplied. */
(()=>{
  'use strict';
  const E=window.DalCore.esc,I=name=>window.DalIcons.render(name,'h-icon'),M=window.DalPresentationModel;
  let dialog=null,doc=null,deck=null,index=0,showPeople=true,launcher=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set();
  function motion(el,frames,options={}){if(!el||reduced.matches||document.hidden||!el.animate)return;const a=el.animate(frames,{duration:320,easing:'cubic-bezier(.22,1,.36,1)',...options});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);}
  const cancelMotion=()=>{for(const a of animations)a.cancel();animations.clear();};
  function shortDate(value){return value?new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'short'}).format(new Date(value+'T12:00:00Z')):'';}
  function diagramPositions(layout,count){
    const box=(x,y,w=218,h=100)=>({x,y,w,h,cx:x+w/2,cy:y+h/2});
    const root=box(330,10,260,98),areas=[];
    if(layout==='radial'){
      Object.assign(root,box(330,131,260,98));
      for(let i=0;i<count;i++){const a=-Math.PI/2+i*2*Math.PI/count;areas.push(box(460+330*Math.cos(a)-112,180+128*Math.sin(a)-46,224,92));}
    }else if(layout==='tree'){
      Object.assign(root,box(16,131,260,98));
      const gap=8,h=Math.min(100,(344-gap*Math.max(0,count-1))/Math.max(1,count)),top=(360-(h+gap)*count+gap)/2;
      for(let i=0;i<count;i++)areas.push(box(600,top+i*(h+gap),300,h));
    }else if(layout==='mind'){
      Object.assign(root,box(330,131,260,98));
      for(let i=0;i<count;i++){const side=i%2,row=Math.floor(i/2),rows=Math.ceil((count-side)/2);areas.push(box(side?670:26,rows===1?130:36+row*188,224,96));}
    }else{
      const gap=18,w=Math.min(250,(904-gap*Math.max(0,count-1))/Math.max(1,count)),start=(920-(w+gap)*count+gap)/2;
      for(let i=0;i<count;i++)areas.push(box(start+i*(w+gap),222,w,100));
    }
    return [root,...areas];
  }
  function diagramLines(text,width){
    const max=Math.max(16,Math.floor((width-32)/10)),words=String(text).split(/\s+/),lines=[''];
    for(const [wordIndex,word] of words.entries()){const at=lines.length-1;if(lines[at]&&(lines[at]+' '+word).length>max){if(lines.length===2){lines[1]=M.brief(lines[1]+' '+words.slice(wordIndex).join(' '),max);break;}lines.push(word);}else lines[at]+=(lines[at]?' ':'')+word;}
    return lines.slice(0,2).map(line=>M.brief(line,max));
  }
  function diagramCard(n,p,i){
    const key='presentation:diagram:'+i,complete=n.total&&n.done===n.total,color=complete?'#2f796c':'#427fa0',lines=p.h<92?[M.brief(n.title,Math.floor((p.w-32)/10))]:diagramLines(n.title,p.w),stats=p.h-24,bar=p.h-14;
    return `<g transform="translate(${p.x} ${p.y})"><g class="present-diagram-node"><title>${E(n.title+' · '+(n.total?n.done+'/'+n.total+' iş, %'+n.percent:'Henüz iş yok'))}</title><rect width="${p.w}" height="${p.h}" rx="13" fill="${i?'#fff':'#edf5f2'}" stroke="${i?'#cbdbe3':'#a6c4ba'}" stroke-width="1.5"/><rect x="0" y="16" width="4" height="${p.h-32}" rx="2" fill="${i?['#427fa0','#8372a6','#b28642','#5c8c7a'][(i-1)%4]:'#2f796c'}"/>${lines.map((line,j)=>`<text x="16" y="${26+j*20}" font-size="18" font-weight="650" fill="#203a45">${E(line)}</text>`).join('')}<text x="16" y="${stats}" font-size="${n.total?21:13}" font-weight="750" fill="${color}" ${n.total?`data-progress-number="${key}" aria-hidden="true"`:''}>${n.total?'%'+n.percent:'Henüz iş yok'}</text>${n.total?`<text x="${p.w-16}" y="${stats-1}" text-anchor="end" font-size="15" fill="#536b75">${n.done} / ${n.total} iş</text><g data-progress-key="${key}" data-progress-value="${n.percent}" data-progress-replay><rect x="16" y="${bar}" width="${p.w-32}" height="5" rx="2.5" fill="#e6edf1"/><rect data-progress-fill x="16" y="${bar}" width="${p.w-32}" height="5" rx="2.5" fill="${color}" style="transform:scaleX(${n.percent/100});transform-origin:left;transform-box:fill-box"/></g>`:''}</g></g>`;
  }
  function structureDiagram(d){
    const positions=diagramPositions(d.layout,d.nodes.length-1),root=positions[0],colors=['#427fa0','#8372a6','#b28642','#5c8c7a'];
    const guides=d.layout==='radial'?'<ellipse cx="460" cy="180" rx="330" ry="128" fill="none" stroke="#dfebef" stroke-dasharray="5 7"/>':d.layout==='pyramid'?'<path d="M460 4 14 349H906Z" fill="#f6f9fa" stroke="#e4ecef"/>':d.layout==='matrix'?positions.slice(1).map(p=>`<path d="M${p.cx} 193V346" stroke="#e6edf1"/>`).join(''):'';
    const branches=positions.slice(1).map((p,i)=>{
      const horizontal=['tree','mind'].includes(d.layout),radial=d.layout==='radial';
      const x1=horizontal?(p.cx<root.cx?root.x:root.x+root.w):root.cx,y1=horizontal?root.cy:radial?root.cy:root.y+root.h;
      const x2=horizontal?(p.cx<root.cx?p.x+p.w:p.x):p.cx,y2=horizontal?p.cy:radial?p.cy:p.y;
      const path=radial?`M${x1} ${y1}L${x2} ${y2}`:horizontal?`M${x1} ${y1}C${(x1+x2)/2} ${y1} ${(x1+x2)/2} ${y2} ${x2} ${y2}`:`M${x1} ${y1}C${x1} 174 ${x2} 174 ${x2} ${y2}`;
      return `<path d="${path}" pathLength="1" fill="none" stroke="${colors[i%4]}" stroke-opacity=".5" stroke-width="2"/>`;
    }).join('');
    const relations=d.relations.map(r=>{const a=positions[r.from],b=positions[r.to];return `<path d="M${a.cx} ${a.cy}Q460 354 ${b.cx} ${b.cy}" fill="none" stroke="#8372a6" stroke-width="1.5" stroke-dasharray="5 5"><title>${E(r.label)}</title></path>`;}).join('');
    const description=d.nodes.map(n=>n.title+': '+(n.total?n.done+'/'+n.total+' iş, %'+n.percent:'Henüz iş yok')).join('; ');
    const mobile=d.nodes.map((n,i)=>{const key='presentation:mobile:diagram:'+i;return `<div class="present-mobile-node ${i?'':'root'}"><strong>${E(n.title)}</strong><span>${n.total?`<b data-progress-number="${key}" aria-hidden="true">%${n.percent}</b> · ${n.done} / ${n.total} iş`:'Henüz iş yok'}</span>${n.total?`<div class="present-mobile-track" role="progressbar" aria-label="${E(n.title)} tamamlanma" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n.percent}" data-progress-key="${key}" data-progress-value="${n.percent}" data-progress-replay><span style="transform:scaleX(${n.percent/100});transform-origin:left"></span></div>`:''}</div>`;}).join('');
    return `<svg class="present-diagram" viewBox="0 0 920 360" role="img" aria-label="${E('Özet çalışma şeması. '+description)}"><title>Özet çalışma şeması</title>${guides}<g class="present-diagram-edges">${branches}</g>${relations}${d.nodes.map((n,i)=>diagramCard(n,positions[i],i)).join('')}</svg><div class="present-mobile-diagram" aria-label="Özet çalışma şeması">${mobile}</div>`;
  }
  function progressRing(s){
    return `<div class="present-progress-overview"><div class="present-ring" role="progressbar" aria-label="Proje tamamlanma" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.percent}" aria-valuetext="${s.done} / ${s.total} iş tamamlandı" data-progress-key="presentation:progress" data-progress-value="${s.percent}" data-progress-kind="ring" data-progress-replay><svg viewBox="0 0 256 256" aria-hidden="true"><circle cx="128" cy="128" r="104" fill="none" stroke="#e7eef1" stroke-width="16"/><circle data-progress-fill cx="128" cy="128" r="104" fill="none" stroke="#2f796c" stroke-width="16" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="${100-s.percent}" stroke-linecap="round" transform="rotate(-90 128 128)"/></svg><strong data-progress-number="presentation:progress" aria-hidden="true">%${s.percent}</strong><span>${s.done} / ${s.total} iş</span></div><div class="present-progress-breakdown"><div>${I('checkCircle')}<strong>${s.done}</strong><span>Tamamlanan</span></div><div>${I('tasks')}<strong>${s.open}</strong><span>Açık işler</span></div><div>${I('clock')}<strong>${s.doing}</strong><span>Devam eden</span></div></div></div><p class="present-caption">Devam eden işler açık işlerin içindedir.</p>`;
  }
  function content(s){
    if(s.type==='cover')return `<div class="present-cover-copy">${s.sample?'<p class="present-example">Düzenlenebilir örnek</p>':''}<h1>${E(s.title)}</h1><p class="present-date">${E(s.date)}</p></div>`;
    const title=`<h1>${E(s.title)}</h1>`;
    if(s.type==='structure')return `${title}<p class="present-body present-diagram-purpose">${E(M.brief(s.body,150))}</p>${structureDiagram(s.diagram)}<p class="present-caption present-diagram-caption">Özet şema${s.extra?' · '+s.extra+' diğer alan çalışma içinde':''}${s.diagram.extraRelations?' · '+s.diagram.extraRelations+' çapraz bağ tam şemada':''}${s.diagram.relations.length?' · Kesikli çizgi: iş birliği':''}</p>`;
    if(s.type==='progress')return `${title}${progressRing(s)}`;
    if(s.type==='people')return `${title}<table class="present-people"><thead><tr><th scope="col">Sorumlu</th><th scope="col">Tamamlanan</th><th scope="col">Açık</th></tr></thead><tbody>${s.rows.map((r,i)=>`<tr><th scope="row">${E(r.name)}</th><td>${r.done} / ${r.total}<div class="present-owner-track" role="progressbar" aria-label="${E(r.name)} işlerinin tamamlanması" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(r.done/r.total*100)}" data-progress-key="presentation:owner:${i}" data-progress-value="${Math.round(r.done/r.total*100)}" data-progress-replay><span style="transform:scaleX(${r.done/r.total});transform-origin:left"></span></div></td><td>${r.open}</td></tr>`).join('')}</tbody></table>${s.extra?`<p class="present-caption">${s.extra} diğer sorumlu proje içinde yer alıyor.</p>`:''}`;
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
    dialog.querySelectorAll('.present-diagram-edges path').forEach((path,i)=>motion(path,[{strokeDasharray:'1 1',strokeDashoffset:1},{strokeDasharray:'1 1',strokeDashoffset:0}],{duration:700,delay:i*55,fill:'backwards'}));
    dialog.querySelectorAll('.present-diagram-node').forEach((node,i)=>motion(node,[{opacity:0},{opacity:1}],{duration:400,delay:i*65,fill:'backwards'}));
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
