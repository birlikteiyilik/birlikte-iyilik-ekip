/* One preparation surface: template, people and first work share one draft.
   Account invitations remain separate; this only selects existing active people. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./core'),require('./templates'));
 else root.DalProjectSetup=factory(root.DalCore,root.DalTemplates);
})(typeof globalThis!=='undefined'?globalThis:this,(C,T)=>{
 'use strict';
 function addWork(doc){const nid=C.addNode(doc,C.rootNode(doc).id,{kind:'Görev'});doc.nodes.find(n=>n.id===nid).title='';return nid;}
 function prepare(draft,name,people,creatorId,optionalEmptyIds=[]){
  if(typeof name!=='string'||!name.trim()||name.trim().length>250)throw new Error('Bir proje adı yazın (en fazla 250 karakter).');
  const doc=JSON.parse(JSON.stringify(draft)),root=C.rootNode(doc),eligible=new Map(people.filter(p=>p.active!==false).map(p=>[p.id,p]));
  doc.name=name.trim();root.title=doc.name;doc.sample=false;
  for(const nid of optionalEmptyIds){const n=doc.nodes.find(n=>n.id===nid);if(n&&!n.title.trim()&&!n.ownerUserId&&!n.dueDate&&!C.children(doc,nid).length)C.remove(doc,nid);}
  const memberIds=new Set([creatorId]);
  for(const n of doc.nodes){
   if(!n.title.trim())throw new Error('Boş başlığa bir ad yazın veya satırı kaldırın.');
   if(n.ownerUserId){const p=eligible.get(n.ownerUserId);if(!p)throw new Error('Seçilen sorumlu artık aktif ekip listesinde değil.');n.owner=p.name;memberIds.add(p.id);}else n.owner='';
   for(const task of n.tasks){if(task.assigneeId){const p=eligible.get(task.assigneeId);if(!p)throw new Error('Alt iş sorumlusu aktif ekip listesinde değil.');task.assignee=p.name;memberIds.add(p.id);}}
  }
  return {doc:C.validateStrict(doc),memberIds:[...memberIds]};
 }
 async function open({user,api,dialog,closeDialog,formError,setBusy,onCreated,template:selectedTemplate='blank'}){
  const E=C.esc,I=name=>window.DalIcons.render(name,'h-icon');
  const templateOptions=selected=>`<option value="blank">Boş proje</option>${T.catalog.map(t=>`<option value="${E(t.id)}" ${selected===t.id?'selected':''}>${E(t.title)}</option>`).join('')}<option value="education" ${selected==='education'?'selected':''}>Birlikte İyilik / TACEV öneri yapısı</option><option value="project" ${selected==='project'?'selected':''}>Önceki proje şablonu</option>`;
  let template=selectedTemplate,draft,dirtyRows=false,people=[],optional=[];
  const el=dialog('Yeni proje','Adını yazın; işleri, kişileri ve tarihleri burada hazırlayın.',`<div class="setup-loading" role="status">Ekip listesi hazırlanıyor…</div>`);
  if(!el)return;
  const body=el.querySelector('.h-dialog-body'),loading=body.querySelector('.setup-loading');
  try {people=(await api('/directory')).users.filter(p=>p.active!==false);}
  catch(error){if(el.open&&loading.isConnected){loading.textContent='Ekip listesi yüklenemedi. Pencereyi kapatıp yeniden deneyin.';formError(error);}return;}
  if(!el.open||!loading.isConnected)return;
  const peopleOptions=(selected='')=>`<option value="">Daha sonra seç</option>${people.map(p=>`<option value="${E(p.id)}" ${p.id===selected?'selected':''}>${E(p.name)}${p.id===user.id?' (ben)':''}</option>`).join('')}`;
  loading.remove();body.insertAdjacentHTML('beforeend',`<form id="hub-new-project" class="h-form project-setup"><label>Proje adı<input name="name" required maxlength="250" placeholder="Örn. Gönüllü buluşması" autocomplete="off"></label><div class="setup-basics"><label>Proje sorumlusu<select name="owner">${peopleOptions(user.id)}</select></label><label>Başlangıç yapısı<select name="template">${templateOptions(template)}</select></label></div><div class="setup-template-note" id="setup-template-note"></div><section class="setup-work"><header><div><h3>İşler ve sorumlular</h3><p>Başlığı düzenleyin, kişiyi ve tarihi seçin.</p></div><button type="button" class="h-btn" id="setup-add">${I('plus')}İş ekle</button></header><div class="setup-column-head"><span>İş / başlık</span><span>Sorumlu</span><span>Son tarih</span><span></span></div><div id="setup-rows"></div><p class="setup-empty" id="setup-empty" hidden>Şimdilik boş başlayabilir veya ilk işi ekleyebilirsiniz.</p></section><div class="setup-access"><strong id="setup-people-count"></strong><p>Seçtiğiniz kişiler bu projedeki tüm işleri düzenleyebilir. Yetkileri daha sonra Ekip bölümünden değiştirebilirsiniz.</p></div><div class="h-dialog-actions"><button type="button" class="h-btn" data-hub="close">Vazgeç</button><button type="submit" class="h-btn primary">Projeyi aç ${I('arrow')}</button></div></form>`);
  const form=el.querySelector('#hub-new-project'),rows=el.querySelector('#setup-rows'),count=el.querySelector('#setup-people-count');
  function memberSummary(){const ids=new Set([user.id,...draft.nodes.map(n=>n.ownerUserId).filter(Boolean)]);count.textContent='Proje ekibi · '+[...ids].map(id=>people.find(p=>p.id===id)?.name||user.name).join(', ');}
  function renderRows(){
   const root=C.rootNode(draft),ordered=[];
   const visit=id=>{for(const n of C.children(draft,id)){ordered.push(n);visit(n.id);}};visit(root.id);
   rows.innerHTML=ordered.map((n,i)=>`<div class="setup-row" data-setup-node="${E(n.id)}" style="--setup-depth:${Math.min(C.ancestors(draft,n.id).length-1,3)}"><label class="setup-title"><span>${E(n.kind==='Görev'?'İş':n.kind==='Kişi'?'Rol':n.kind==='Birim'?'Ekip / başlık':'Başlık')}</span><input data-setup-field="title" value="${E(n.title)}" maxlength="250" placeholder="Yapılacak işi yazın" aria-label="${i+1}. satır başlığı"></label><label><span>Sorumlu</span><select data-setup-field="ownerUserId" aria-label="${i+1}. satır sorumlusu">${peopleOptions(n.ownerUserId)}</select></label><label><span>Son tarih</span><input type="date" data-setup-field="dueDate" value="${E(n.dueDate||'')}" aria-label="${i+1}. satır son tarihi"></label><button type="button" class="h-close setup-remove" data-setup-remove="${E(n.id)}" aria-label="${i+1}. satırı kaldır">${I('close')}</button></div>`).join('');
   el.querySelector('#setup-empty').hidden=ordered.length>0;memberSummary();
  }
  function resetDraft(){
   draft=T.catalog.some(t=>t.id===template)?T.create(template,'Yeni proje'):C.newDocument(template);optional=[];
   C.rootNode(draft).ownerUserId=form.elements.owner.value;
   if(template==='blank')optional.push(addWork(draft));
   const t=T.catalog.find(t=>t.id===template);
   el.querySelector('#setup-template-note').innerHTML=t?`<span class="setup-template-mini">${T.preview(t.id)}</span><div><strong>${E(t.title)}</strong><p>Şema hazır. Aşağıdaki rolleri gerçek kişilerle eşleştirin.</p></div>`:'';
   dirtyRows=false;renderRows();
  }
  resetDraft();form.elements.name.focus();
  form.elements.owner.addEventListener('change',()=>{C.rootNode(draft).ownerUserId=form.elements.owner.value;memberSummary();});
  form.elements.template.addEventListener('change',()=>{
   if(dirtyRows&&!confirm('Hazır yapıyı değiştirmek aşağıdaki satır düzenlemelerini sıfırlar. Değiştirilsin mi?')){form.elements.template.value=template;return;}
   template=form.elements.template.value;resetDraft();
  });
  function updateRow(event){const field=event.target.dataset.setupField;if(!field)return;const n=draft.nodes.find(n=>n.id===event.target.closest('[data-setup-node]').dataset.setupNode);if(!n)return;n[field]=event.target.value;dirtyRows=true;memberSummary();}
  rows.addEventListener('input',updateRow);rows.addEventListener('change',updateRow);
  rows.addEventListener('click',event=>{const button=event.target.closest('[data-setup-remove]');if(!button)return;const nid=button.dataset.setupRemove,children=C.descendants(draft,nid).length-1;if(children&&!confirm('Bu başlık ve '+children+' alt satır taslaktan kaldırılsın mı?'))return;C.remove(draft,nid);dirtyRows=true;renderRows();form.dispatchEvent(new Event('input',{bubbles:true}));el.querySelector('#setup-add').focus();});
  el.querySelector('#setup-add').onclick=()=>{const nid=addWork(draft);optional.push(nid);dirtyRows=true;renderRows();rows.querySelector(`[data-setup-node="${CSS.escape(nid)}"] input`).focus();form.dispatchEvent(new Event('input',{bubbles:true}));};
  form.onsubmit=async event=>{
   event.preventDefault();const submit=form.querySelector('[type=submit]');submit.disabled=true;setBusy(true);let attempted=false;
   try{const payload=prepare(draft,form.elements.name.value,people,user.id,optional);form.querySelectorAll('input,select,button').forEach(control=>control.disabled=true);attempted=true;const result=await api('/boards','POST',payload);setBusy(false);closeDialog(true);onCreated(result.id,T.catalog.find(t=>t.id===template)?.group==='structures'?'map':'board');}
   catch(error){formError(error);if(!error.status||error.status===408||error.status>=500){
     // Validation errors happen before a request. Only an attempted request can be ambiguous.
     if(attempted){submit.dataset.ambiguous='true';submit.textContent='Önce projeleri kontrol edin';el.querySelector('#hub-error').insertAdjacentHTML('beforeend','<p>Proje oluşturulmuş olabilir. Yeniden denemeden önce projeleri kontrol edin.</p><button class="h-link" data-hub="check-projects">Projeleri kontrol et</button>');}
   }}finally{form.querySelectorAll('input,select,button').forEach(control=>control.disabled=false);submit.disabled=submit.dataset.ambiguous==='true';setBusy(false);}
  };
 }
 return {prepare,addWork,open};
});
