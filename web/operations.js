/* Readable project views; all edits go through the existing editor and save queue. */
(()=>{
  'use strict';
  const C=window.DalCore,H=window.DalHubModel,M=window.DalOperationsModel,E=C.esc;
  const I=name=>window.DalIcons.render(name,'h-icon');
  const names={plan:'İş planı',board:'Pano',timeline:'Zaman çizelgesi',calendar:'Takvim'};
  const label=s=>s==='Planlandı'?'Yapılacak':s;
  const tone=s=>({'Tamamlandı':'done','Devam ediyor':'doing','Beklemede':'waiting'}[s]||'planned');
  const dateLabel=date=>date?new Date(date+'T12:00:00Z').toLocaleDateString('tr-TR',{day:'numeric',month:'short',timeZone:'Europe/Istanbul'}):'Tarih yok';
  const monthLabel=date=>new Date(date+'T12:00:00Z').toLocaleDateString('tr-TR',{month:'long',year:'numeric',timeZone:'Europe/Istanbul'});
  function attributes(t){return `data-plan-node="${E(t.nodeId)}" data-plan-task="${E(t.taskId)}" data-plan-key="${E(t.key)}"`;}
  function check(t,editable){return `<label class="op-check"><input type="checkbox" data-plan-field="done" ${attributes(t)} aria-label="${E(t.title)}: ${t.done?'yeniden aç':'tamamla'}" ${t.done?'checked':''} ${editable?'':'disabled'}></label>`;}
  function owner(t){return `<span class="op-owner"><span class="op-initials" aria-hidden="true">${E(H.initials(t.owner||'?'))}</span><span>${E(t.owner||'Sorumlu belirlenmedi')}</span></span>`;}
  function title(t){return `<button class="op-work-title" data-action="plan-open" data-id="${E(t.nodeId)}" data-task="${E(t.taskId)}">${E(t.title)}</button>`;}
  function status(t,editable){return `<label class="op-status ${tone(t.status)}"><span class="sr-only">${E(t.title)} durumu</span><select data-plan-field="status" ${attributes(t)} ${editable?'':'disabled'}>${(t.taskId?['Planlandı','Tamamlandı']:H.STATUSES).map(s=>`<option value="${E(s)}" ${t.status===s?'selected':''}>${E(label(s))}</option>`).join('')}</select></label>`;}
  function card(t,{editable,day}){
    const late=t.dueDate&&t.dueDate<day&&!t.done;
    const completed=t.steps.filter(s=>s.done).length,percent=t.steps.length?Math.round(completed/t.steps.length*100):0;
    return `<article class="op-card ${t.done?'done':''}" ${editable&&!t.taskId?'draggable="true"':''} data-op-key="${E(t.key)}"><div class="op-card-top">${check(t,editable)}${title(t)}</div>${t.parentTitle?`<small class="op-parent">${E(t.parentTitle)}</small>`:''}${t.steps.length?`<div class="op-step-progress"><span>${completed} / ${t.steps.length} adım</span><div data-progress-key="steps:${E(t.key)}" data-progress-value="${percent}" aria-label="${t.steps.length} adımdan ${completed} tamamlandı"><i style="transform:scaleX(${percent/100})"></i></div></div>`:''}<footer>${owner(t)}<span class="op-due ${late?'late':''}">${E(dateLabel(t.dueDate))}</span></footer><div class="op-card-bottom">${status(t,editable)}${t.priority==='Yüksek'?'<span class="op-priority">Öncelikli</span>':''}</div></article>`;
  }
  function empty(text='Bu görünümde iş yok.'){return `<div class="op-empty"><span>${I('check-square')}</span><h3>${E(text)}</h3><p>Filtreleri değiştirebilir veya yeni bir iş ekleyebilirsiniz.</p></div>`;}
  function board(items,options){
    return `<div class="op-board" aria-label="Duruma göre işler">${H.STATUSES.map(s=>{const group=items.filter(t=>t.status===s);return `<section class="op-column ${tone(s)}" data-op-drop="${E(s)}" aria-label="${E(label(s))}"><header><h3><i aria-hidden="true"></i>${E(label(s))}</h3><span>${group.length}</span></header><div class="op-column-items">${group.map(t=>card(t,options)).join('')||'<p class="op-column-empty">Bu aşamada iş yok.</p>'}</div></section>`;}).join('')}</div><p class="op-footnote">İlerletmek için işin durumunu seçin${options.editable?'; görev kartlarını sütunlar arasında da sürükleyebilirsiniz':''}.</p>`;
  }
  function period(mode,date,selected){
    const timeline=mode==='timeline',days=timeline?M.timeline([],date).days:[];
    return `<div class="op-period"><div><button class="h-btn op-period-arrow" data-action="ops-prev" aria-label="${timeline?'Önceki iki hafta':'Önceki ay'}">${I('back')}</button><h3>${E(timeline?dateLabel(days[0])+' – '+dateLabel(days.at(-1))+' '+days.at(-1).slice(0,4):monthLabel(date))}</h3><button class="h-btn op-period-arrow" data-action="ops-next" aria-label="${timeline?'Sonraki iki hafta':'Sonraki ay'}">${I('arrow')}</button><button class="h-btn" data-action="ops-today">Bugün</button></div><span>${timeline?'İşler son teslim gününde gösterilir.':'Bir gün seçerek o günün işlerini görün.'}</span></div>`;
  }
  function timeline(items,options){
    const t=M.timeline(items,options.date,options.day);
    return period('timeline',options.date)+`<div class="op-timeline" tabindex="0" role="region" aria-label="İki haftalık teslim çizelgesi. Diğer günler için yana kaydırın."><div class="op-timeline-grid"><header class="op-timeline-head"><strong>Yapılacak iş / sorumlu</strong>${t.days.map(d=>`<div class="${d===options.day?'today':''}"><small>${E(new Date(d+'T12:00:00Z').toLocaleDateString('tr-TR',{weekday:'short',timeZone:'Europe/Istanbul'}))}</small><b>${Number(d.slice(-2))}</b></div>`).join('')}</header>${t.rows.map(row=>`<div class="op-timeline-row ${row.done?'done':''}"><div class="op-timeline-label">${check(row,options.editable)}<div>${title(row)}${owner(row)}</div></div><div class="op-timeline-track">${t.days.map(d=>`<i class="${d===options.day?'today':''}"></i>`).join('')}${row.index>=0?`<button class="op-milestone ${tone(row.status)} ${row.late?'late':''}" style="grid-column:${row.index+1} / span 1" data-action="plan-open" data-id="${E(row.nodeId)}" data-task="${E(row.taskId)}" title="${E(row.title+' · '+dateLabel(row.dueDate)+' · '+label(row.status))}"><span class="sr-only">${E(row.title)} · </span>${Number(row.dueDate.slice(-2))}</button>`:`<button class="op-outside ${row.before?'before':'after'}" data-action="ops-jump" data-date="${E(row.dueDate)}">${row.before?'← ':''}${E(dateLabel(row.dueDate))}${row.after?' →':''}</button>`}</div></div>`).join('')||empty('Tarih verilmiş iş yok.')}</div></div>${t.undated.length?`<section class="op-undated"><h3>Tarihi belirlenmeyenler <span>${t.undated.length}</span></h3>${t.undated.map(t=>`<div>${check(t,options.editable)}${title(t)}${owner(t)}</div>`).join('')}</section>`:''}<p class="op-footnote">Çizelge teslim tarihlerini gösterir. İşi açarak tarihini veya sorumlusunu düzenleyebilirsiniz.</p>`;
  }
  function calendar(items,options){
    const days=M.calendar(items,options.date,options.day),chosen=items.filter(t=>t.dueDate===options.selectedDate),undated=items.filter(t=>!t.dueDate);
    return period('calendar',options.date)+`<div class="op-calendar-layout"><section class="op-calendar" aria-label="${E(monthLabel(options.date))} iş takvimi"><div class="op-weekdays">${['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d=>`<span>${d}</span>`).join('')}</div><div class="op-calendar-grid">${days.map(d=>`<button class="op-calendar-day ${d.inMonth?'':'outside'} ${d.today?'today':''} ${d.date===options.selectedDate?'selected':''}" data-action="ops-day" data-date="${d.date}" aria-pressed="${d.date===options.selectedDate}" aria-label="${E(dateLabel(d.date))}: ${d.items.length} iş${d.today?', bugün':''}"><b>${Number(d.date.slice(-2))}</b>${d.items.slice(0,2).map(t=>`<span class="op-calendar-job ${tone(t.status)}">${E(t.title)}</span>`).join('')}${d.items.length?`<small>${d.items.length} iş</small>`:''}</button>`).join('')}</div></section><aside class="op-day-agenda"><header><h3>${E(dateLabel(options.selectedDate))}</h3><span>${chosen.length} iş</span></header>${chosen.map(t=>card(t,options)).join('')||'<p class="op-agenda-empty">Bu gün için iş planlanmadı.</p>'}${options.editable?`<button class="h-btn" data-action="ops-add-day" data-date="${E(options.selectedDate)}">${I('plus')}Bu güne iş ekle</button>`:''}${undated.length?`<div class="op-calendar-undated">${undated.length} işin tarihi belirlenmedi. İş planından tarih ekleyebilirsiniz.</div>`:''}</aside></div>`;
  }
  function render(doc,options){
    const items=M.select(doc,options),config={...options,day:options.day||H.today()};
    return options.mode==='board'?board(items,config):options.mode==='timeline'?timeline(items,config):calendar(items,config);
  }
  window.DalOperationsView={render,names};
})();
