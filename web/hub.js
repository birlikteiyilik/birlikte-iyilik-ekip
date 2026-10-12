/* Birlikte İyilik Ekip 4.0.0 — Premium • An everyday workspace over the shared, guarded data model.
 * No task data or authentication token is persisted in browser storage.
 * Only personal starred IDs and display preferences are stored locally.
 */
(() => {
  'use strict';
  const C=window.DalCore,D=window.DalCollab,M=window.DalHubModel,E=C.esc;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const base=location.pathname.endsWith('/')?location.pathname:location.pathname+'/';
  const API=(...a)=>window.DalTeam.api(...a);
  const S={user:null,data:null,view:'today',filter:'open',mode:'list',scope:'mine',query:'',project:'',focusFilter:'due',focusSort:'priority',density:'comfortable',agendaDate:'',busy:false,refreshing:false,newData:null,poll:null,dialogDirty:false,detailDirty:false,pending:null,lastUndo:null,favorites:[],stars:[],editor:false,drawer:null,lastFocus:null,changeInFlight:false,workloadOpen:false};
  const paths={sun:'M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',check:'m5 12 4 4L19 6',checkCircle:'M22 11v1a10 10 0 1 1-5.9-9.1M22 4l-10 10-3-3',tasks:'M9 6h11M9 12h11M9 18h11M3 6h1M3 12h1M3 18h1',projects:'M3 8V5a1 1 0 0 1 1-1h5l3 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z',org:'M9 3h6v5H9zM12 8v4M4 16v-4h16v4M1 16h6v5H1zM9 16h6v5H9zM17 16h6v5h-6zM12 12v4',team:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8m6 10v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',search:'m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',plus:'M12 5v14M5 12h14',arrow:'M5 12h14m-5-5 5 5-5 5',back:'M19 12H5m5-5-5 5 5 5',down:'m6 9 6 6 6-6',clock:'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',help:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z',leaf:'M20 4c-7-1-15 0-15 8a5 5 0 0 0 5 5c8 0 9-8 10-13ZM4 21l10-10',board:'M3 4h7v16H3zM14 4h7v10h-7z',list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 12-12',flag:'M4 22V3m0 0c5-4 9 4 15 0v11c-6 4-10-4-15 0',more:'M5 12h.01M12 12h.01M19 12h.01',chat:'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z',shield:'M12 22s9-4 9-11V4l-9-3-9 3v7c0 7 9 11 9 11m-4-11 3 3 5-5',refresh:'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3',link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2'};
  const I=(name,cls='')=>window.DalIcons.render(name,`h-icon ${cls}`,`<path d="${paths[name]||paths.leaf}"/>`);
  const enc=encodeURIComponent;
  const route=(view,project='')=>base+'?view='+enc(view)+(project?'&project='+enc(project):'');
  const graph=(board,node='')=>base+'?board='+enc(board)+(node?'&node='+enc(node):'');
  const canWrite=b=>b&&['manager','editor'].includes(b.role)&&!b.archived;
  const board=id=>S.data?.boards.find(b=>b.id===id);
  const item=key=>S.data?.items.find(t=>t.key===key);
  const day=()=>M.today();
  function storage(key,fallback){try{return JSON.parse(localStorage.getItem('dal3:'+S.user.id+':'+key))??fallback;}catch(_){return fallback;}}
  function store(key,value){try{localStorage.setItem('dal3:'+S.user.id+':'+key,JSON.stringify(value));}catch(_){/* Preferences are optional. */}}
  function avatar(name,size='',id=''){
    const colors=[['#dcefe8','#286653'],['#e2ecf5','#315c86'],['#f5ecdc','#856126'],['#ebe7f4','#66518d'],['#ddecf0','#356774']];
    const n=[...String(id||name)].reduce((s,c)=>s+c.charCodeAt(0),0),c=colors[n%colors.length];
    return `<span class="h-avatar ${size} ${name?'':'empty'}" title="${E(name||'Sorumlu atanmadı')}" aria-label="${E(name||'Sorumlu atanmadı')}" style="--av-bg:${c[0]};--av-text:${c[1]}">${E(name?M.initials(name):'?')}</span>`;
  }
  const dateLabel=d=>d?new Date(d+'T12:00:00Z').toLocaleDateString('tr-TR',{day:'numeric',month:'short'}):'Tarih yok';
  function due(t){const d=t.dueDate,cls=!t.done&&d&&d<day()?'overdue':d===day()?'today':'';const label=!d?'Tarih yok':d===day()?'Bugün':d===M.plus(day(),1)?'Yarın':dateLabel(d);return `<span class="h-task-due ${cls}" title="${E(d||'Son tarih belirlenmedi')}">${I(d?'calendar':'clock')}${E(label)}</span>`;}
  const statusClass=s=>s==='Devam ediyor'?'doing':s==='Beklemede'?'blocked':s==='Tamamlandı'?'done':'';
  const statusLabel=s=>s==='Planlandı'?'Yapılacak':s;
  const status=s=>`<span class="h-state ${statusClass(s)}">${E(statusLabel(s))}</span>`;
  const errorText=e=>e?.body?.detail||e?.message||'İşlem tamamlanamadı.';
  function toast(text,{error=false,undo=null}={}){
    $$('.h-toast').forEach(e=>e.remove());const el=document.createElement('div');el.className='h-toast'+(error?' error':'');el.setAttribute('role',error?'alert':'status');el.innerHTML=`${I(error?'flag':'checkCircle')}<span>${E(text)}</span>${undo?'<button type="button">Geri al</button>':''}`;document.body.appendChild(el);if(undo)el.querySelector('button').onclick=async()=>{el.remove();try{await undo();}catch(e){toast(errorText(e),{error:true});}};setTimeout(()=>el.remove(),undo?10000:error?8500:4500);
  }
  function navigate(url){if(window.DalTeam?.hasPending()&&!confirm('Şemada henüz kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?'))return;location.href=url;}
  function navigation(user,editor=false,initial=null){
    S.user=user;S.editor=editor;document.body.classList.add('hub-auth');
    if(!S.data){S.favorites=storage('favorites',window.DalDemoFavorites||[]);S.stars=storage('stars',window.DalDemoStars||[]);S.density=storage('density','comfortable')==='compact'?'compact':'comfortable';}
    document.body.dataset.density=S.density;
    if(!Array.isArray(S.favorites))S.favorites=[];if(!Array.isArray(S.stars))S.stars=[];
    const root=$('#team-nav');root.className='hub-navigation';
    const active=editor?'organization':S.view;
    const myCount=S.data?S.data.items.filter(t=>t.ownerId===user.id&&!t.done).length:0;
    const names={today:'Bugün',tasks:'Görevlerim',projects:'Projeler',organization:'Organizasyon',people:'Ekibimiz',activity:'Güncellemeler',calendar:'Takvim ve toplantılar',report:'Haftalık rapor',notifications:'Bildirimler'};
    const links=[['today','sun','Bugün'],['tasks','tasks','Görevlerim'],['projects','projects','Projeler'],['calendar','calendar','Takvim']];
    const extras=[['people','team','Ekibimiz'],['organization','org','Organizasyon'],['report','list','Haftalık rapor']];
    const navLink=([v,i,t])=>`<button data-hub="nav" data-view="${v}" class="${active===v?'active':''}" ${active===v?'aria-current="page"':''}>${I(i)}<span>${t}</span>${v==='tasks'&&myCount?`<span class="h-nav-badge">${myCount}</span>`:''}</button>`;
    const favorites=(S.data?.boards||[]).filter(b=>S.favorites.includes(b.id)).slice(0,3);
    root.innerHTML=`<button class="h-mobile-backdrop" data-hub="menu-close" aria-label="Menüyü kapat"></button>
      <aside class="hub-side" aria-label="Ana menü">
        <a class="hub-brand" href="${E(base)}"><span class="brand-symbol"><img src="assets/brand/symbol.png" alt=""></span><span class="brand-word"><img src="assets/brand/wordmark-white.png" alt="birlikteiyilik.com"><small>EKİP ÇALIŞMA ALANI</small></span></a>
        <nav aria-label="Ana gezinti">${links.map(navLink).join('')}</nav>
        <details class="h-nav-more" ${extras.some(([v])=>active===v)?'open':''}><summary>${I('team')}Ekip ve düzen ${I('down')}</summary><nav aria-label="Ekip araçları">${extras.map(navLink).join('')}</nav></details>
        <div class="h-section-label">Favoriler <span>${I('star')}</span></div>
        <div class="h-favorite-list">${favorites.length?favorites.map(b=>`<button class="h-side-link" data-hub="project" data-id="${E(b.id)}">${I('projects')}<span class="h-side-project">${E(b.name)}</span></button>`).join(''):'<p class="h-favorite-hint">Bir projeyi yıldızlayın.<br>Her zaman elinizin altında olsun.</p>'}</div>
        <div class="p-side-note"><span class="brand-symbol" aria-hidden="true"><img src="assets/brand/symbol.png" alt=""></span><p>Birlikte planla.<br>Sorumluluk paylaş.<br>İşi görünür kıl.</p><small>BİRLİKTE İYİLİK</small></div>
        <div class="h-side-bottom"><details class="h-preferences"><summary>${I('board')}Görünüm ${I('down')}</summary><button class="h-side-link p-density" data-hub="density" aria-label="${S.density==='compact'?'Rahat görünüme geç':'Kompakt görünüme geç'}">${I('list')}<span>${S.density==='compact'?'Kompakt görünüm':'Rahat görünüm'}</span><small>Değiştir</small></button></details><button class="h-side-link" data-hub="help">${I('help')}<span>Kullanım rehberi</span></button><button class="team-account" data-team="account">${avatar(user.name,'medium',user.id)}<span>${E(user.name)}<small>${E(user.title||(user.role==='admin'?'Kurum yöneticisi':'Ekip üyesi'))}</small></span>${I('down')}</button></div>
      </aside>
      <button class="h-mobile-menu" data-hub="menu" aria-label="Ana menüyü aç">${I('menu')}</button>
      <div class="h-top-title"><b>${E(editor?'Organizasyon':names[S.view]||'Bugün')}</b><span>/</span><span>Birlikte İyilik</span></div>
      <button class="h-search-button" data-hub="search" aria-label="Tüm görev ve projelerde ara">${I('search')}<span>Görev, proje veya kişi ara…</span><kbd>⌘ K</kbd></button>
      <span class="h-online ${window.DAL_CONFIG?.emulators?'local-test':''}" id="hub-connect-state">${window.DAL_CONFIG?.emulators?'Yerel test':window.DalDemo?'Örnek çalışma':'Ortak çalışma alanı'}</span>
      <button class="h-top-icon" data-hub="nav" data-view="notifications" aria-label="Bildirimler">${I('bell')}</button>
      <button class="p-top-account" data-team="account" aria-label="Hesap ayarları">${avatar(user.name,'medium',user.id)}<span>${E(user.name)}</span>${I('down')}</button><div id="team-live" aria-live="polite"></div>`;
    syncMenu();
  }
  function syncMenu(){
    const closed=innerWidth<=760&&!document.body.classList.contains('hub-menu-open');
    const side=$('.hub-side');if(side)side.inert=closed;
    const button=$('.h-mobile-menu');if(button)button.setAttribute('aria-expanded',String(!closed&&innerWidth<=760));
  }
  matchMedia('(max-width:760px)').addEventListener('change',syncMenu);
  async function fetchData(){const data=await API('/hub');if(window.DalExamples)data.people=[...data.people,...window.DalExamples.people(data)];return data;}
  async function start(user){
    S.user=user;S.editor=false;const qs=new URLSearchParams(location.search);S.view=['today','tasks','projects','organization','people','activity','calendar','report','notifications'].includes(qs.get('view'))?qs.get('view'):'today';S.project=qs.get('project')||'';S.scope=S.project?'all':'mine';S.mode=storage('task-view','list')==='board'?'board':'list';
    navigation(user);$('#team-shell').innerHTML='<div class="h-skeleton"></div><p class="h-loading-text" role="status">Ekip çalışmaları hazırlanıyor…</p>';
    try{S.data=await fetchData();render();if(!S.poll)S.poll=setInterval(poll,90000);}catch(e){$('#team-shell').innerHTML=`<div class="h-content">${empty('Çalışmalar yüklenemedi',errorText(e),'Yeniden dene','refresh')}</div>`;}
  }
  async function go(view,project='',fromHistory=false){
    if(S.editor)return navigate(route(view,project));
    if(S.dialogDirty&&!confirm('Kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?'))return;
    if(S.project!==project)S.workloadOpen=false;
    S.view=view;S.project=project;S.scope=project?'all':'mine';S.query='';S.filter='open';S.agendaDate='';
    if(!fromHistory&&location.pathname+location.search!==route(view,project))window.history.pushState(null,'',route(view,project));document.body.classList.remove('hub-menu-open');render();$('#team-shell').scrollTop=0;$('#hub-heading')?.focus({preventScroll:true});
  }
  window.addEventListener('popstate',()=>{
    if(S.editor)return;
    const restore=()=>history.pushState(null,'',route(S.view,S.project));
    if(window.DalPresentation?.isOpen()){window.DalPresentation.close();restore();return;}
    if(S.pending||S.changeInFlight){restore();toast('Kaydın doğrulanmasını bekleyin.');return;}
    if($('#hub-dialog')?.open){
      if(S.dialogDirty&&!confirm('Kaydedilmemiş değişiklikler var. Kaydetmeden kapatılsın mı?')){restore();return;}
      closeDialog(true);restore();return;
    }
    const q=new URLSearchParams(location.search),v=q.get('view');
    go(['today','tasks','projects','organization','people','activity','calendar','report','notifications'].includes(v)?v:'today',q.get('project')||'',true).catch(e=>toast(errorText(e),{error:true}));
  });
  async function refresh(){S.data=await fetchData();S.newData=null;render();}
  async function poll(){
    if(S.refreshing||S.changeInFlight||S.editor||window.DalPresentation?.isOpen()||document.hidden||!navigator.onLine||!S.user)return;
    S.refreshing=true;
    try{const d=await fetchData();const changed=JSON.stringify([d.boards.map(b=>[b.id,b.revision,b.role,b.members]),d.activity[0]?.id])!==JSON.stringify([S.data.boards.map(b=>[b.id,b.revision,b.role,b.members]),S.data.activity[0]?.id]);
      $('#hub-connect-state')?.classList.remove('offline');if($('#hub-connect-state'))$('#hub-connect-state').textContent=window.DAL_CONFIG?.emulators?'Yerel test':window.DalDemo?'Örnek çalışma':'Ortak çalışma alanı';
      if(changed){S.newData=d;const bar=$('#hub-live-refresh');if(bar){bar.classList.add('visible');bar.textContent='Yeni ekip güncellemeleri var · Göster';}}
    }catch(e){const el=$('#hub-connect-state');if(el){el.classList.add('offline');el.textContent=[401,403].includes(e.status)?'Yeniden giriş gerekli':'Bağlantı bekleniyor';}if(e.status===401)toast('Oturumunuz sona erdi. Kaydedilmemiş taslağı koruyup yeniden giriş yapın.',{error:true});}
    finally{S.refreshing=false;}
  }
  function pageHeading(title,sub,actions=''){return `<div class="h-page-heading"><div><h1 id="hub-heading" tabindex="-1">${E(title)}</h1><p>${E(sub)}</p></div>${actions}</div>`;}
  function empty(title,body='',button='',action='',compact=false){return `<div class="h-empty ${compact?'compact':''}"><div class="h-empty-icon">${I('leaf')}</div><h3>${E(title)}</h3><p>${E(body)}</p>${button?`<button class="h-btn primary" data-hub="${E(action)}">${E(button)}</button>`:''}</div>`;}
  function render(){
    if(!S.data||S.editor)return;navigation(S.user);const shell=$('#team-shell');shell.classList.remove('hidden');$('#app').classList.add('hidden');
    const views={calendar:()=>window.DalCoord.view('calendar'),report:()=>window.DalCoord.view('report'),notifications:()=>window.DalCoord.view('notifications'),today:homeView,tasks:tasksView,projects:projectsView,organization:organizationView,people:peopleView,activity:activityView};
    shell.innerHTML=`<button id="hub-live-refresh" class="h-btn soft h-live-refresh ${S.newData?'visible':''}" data-hub="apply-refresh">Yeni ekip güncellemeleri var · Göster</button><main class="h-content" id="hub-main">${exampleNotice()}${(views[S.view]||homeView)()}<p class="h-bottom-line">Birlikte düşün. Birlikte üret. Birlikte iyilik.</p></main>`;
  }
  function priorityChip(t){const type=t.priority==='Yüksek'?'high':t.priority==='Düşük'?'low':'normal';return `<span class="p-priority ${type}">${I('flag')}${E(t.priority==='Normal'?'Orta':t.priority||'Orta')}</span>`;}
  function taskRow(t,table=false){return `<div class="h-task-row ${t.done?'done':''} ${table?'p-table-row':'p-focus-row'}" data-key="${E(t.key)}">
    <button class="h-check" role="checkbox" aria-checked="${t.done}" aria-label="${E(t.text)} — ${t.done?'yeniden aç':'tamamla'}" data-hub="toggle" data-key="${E(t.key)}" ${!t.editable?'disabled':''}>${t.done?I('check'):''}</button>
    <button class="h-task-open" data-hub="detail" data-key="${E(t.key)}"><span class="h-task-title">${E(t.text)}</span><span class="h-task-meta">${I('projects')}${E(t.boardName)}${!table?`<span class="flow-owner-name"> · ${E(t.owner||'Atanmadı')}</span>`:''}${t.steps?` <span>· ${t.stepsDone}/${t.steps} adım</span>`:''}${t.type==='check'?' <span>· Alt iş</span>':''}</span>${t.steps?`<span class="p-step-track" aria-label="${t.steps} adımdan ${t.stepsDone} tanesi tamamlandı"><i style="width:${M.percent(t.stepsDone,t.steps)}%"></i></span>`:''}</button>
    ${table?`<span class="p-task-state">${status(t.status)}${priorityChip(t)}</span>`:`<span class="p-owner">${avatar(t.owner,'',t.ownerId)}<span>${E(t.owner||'Atanmadı')}</span></span>${priorityChip(t)}`}${due(t)}${table?`<span class="p-owner">${avatar(t.owner,'',t.ownerId)}<span>${E(t.owner||'Atanmadı')}</span></span>`:''}
    <button class="h-star ${S.stars.includes(t.key)?'active':''}" data-hub="star-task" data-key="${E(t.key)}" aria-label="${S.stars.includes(t.key)?'Odaktan çıkar':'Odağıma ekle'}" aria-pressed="${S.stars.includes(t.key)}">${I('star')}</button></div>`;}
  function projectPeople(b){
    if(!window.DalExamples?.isExample(b))return b.members;
    const names=[...new Set(S.data.items.concat(S.data.units).filter(n=>n.boardId===b.id&&n.owner).map(n=>n.owner))];
    return names.map(name=>b.members.find(m=>m.name===name)||{id:'example-name:'+name,name});
  }
  function progressTrack(b,context='card'){const pc=M.percent(b.done,b.total);return `<div class="h-progress" role="progressbar" aria-label="${E(b.name)} tamamlanma" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}" aria-valuetext="${b.total?b.done+' / '+b.total+' iş tamamlandı':'Henüz iş yok'}" data-progress-key="${context}:${E(b.id)}" data-progress-value="${pc}"><span style="transform:scaleX(${pc/100});transform-origin:left"></span></div>`;}
  function projectCard(b){const pc=M.percent(b.done,b.total),work=M.projectSummary(S.data.items,b.id),people=work.people.filter(p=>p.assigned);return `<article class="h-project-card" style="--project-color:${E(b.color)}"><div class="p-project-cover"><span class="h-project-icon">${I('projects')}</span><span class="p-project-cover-word">${window.DalExamples?.isExample(b)?'ÖRNEK PROJE':'BİRLİKTE ÜRETİYORUZ'}</span><button class="h-star ${S.favorites.includes(b.id)?'active':''}" data-hub="favorite" data-id="${E(b.id)}" aria-label="${E(b.name)} — ${S.favorites.includes(b.id)?'sabitlemeyi kaldır':'sabitle'}" aria-pressed="${S.favorites.includes(b.id)}">${I('star')}</button></div><div class="p-project-body"><h3><button data-hub="project" data-id="${E(b.id)}">${E(b.name)}</button></h3><p>${E(b.description||'Görevleri, sorumlulukları ve ekip notlarını bir arada tutun.')}</p><div class="h-project-completion"><span><strong ${b.total?`data-progress-number="card:${E(b.id)}" aria-hidden="true"`:''}>${b.total?'%'+pc:'—'}</strong><small>${b.total?'tamamlandı':'Henüz iş yok'}</small></span><span class="h-project-ratio"><b>${b.done} / ${b.total}</b><small>iş tamamlandı</small></span></div>${progressTrack(b)}<div class="h-project-statuses"><span>${I('tasks')}${work.open} açık iş</span><span class="doing">${I('clock')}${work.doing} devam ediyor</span></div><div class="h-project-card-foot"><div class="h-project-owner-names">${people.length?people.slice(0,2).map(p=>`<span>${avatar(p.name,'',p.id)}<span>${E(p.name)}</span></span>`).join('')+(people.length>2?`<small>+${people.length-2} sorumlu</small>`:''):`<small>${b.total?'Sorumlularını belirle':'Ekip yapısı hazır'}</small>`}${work.unassigned?`<small>${work.unassigned} iş atanmadı</small>`:''}</div><button class="h-link" data-hub="project" data-id="${E(b.id)}">Projeyi aç ${I('arrow')}</button></div></div></article>`;}
  function miniProject(b){return `<div class="h-mini-project" style="--project-color:${E(b.color)}"><span class="h-project-icon">${I('projects')}</span><button data-hub="project" data-id="${E(b.id)}"><strong>${E(b.name)}</strong><small>${b.done}/${b.total} iş tamamlandı</small>${progressTrack(b,'mini')}</button><div class="h-mini-progress" ${b.total?`data-progress-number="mini:${E(b.id)}" aria-hidden="true"`:''}>${b.total?'%'+M.percent(b.done,b.total):'—'}</div></div>`;}
  function ownerWorkload(b){const work=M.projectSummary(S.data.items,b.id);if(!work.total)return '';return `<details class="h-owner-workload" ${S.workloadOpen?'open':''}><summary>${I('team')}İş paylaşımı <small>${work.people.filter(p=>p.assigned).length} sorumlu${work.unassigned?' · '+work.unassigned+' iş atanmadı':''}</small>${I('down')}</summary><div>${work.people.map(p=>`<div class="h-owner-work-row">${avatar(p.name,'',p.id)}<strong>${E(p.name)}</strong><span>${p.done}/${p.total} tamamlandı</span><b>${p.total-p.done} açık</b></div>`).join('')}</div></details>`;}
  function recentCommentRow(c){
    const at=new Date(c.createdAt).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    return `<article class="p-comment-row">${avatar(c.author,'',c.userId)}<div><header><strong>${E(c.author)}</strong><time datetime="${E(c.createdAt)}">${E(at)}</time></header><p>${E(c.body)}</p><button class="h-link" data-hub="comment-open" data-id="${E(c.boardId)}" data-node="${E(c.nodeId)}" data-key="${E(c.key)}">${E(c.nodeTitle)} ${I('arrow')}</button></div></article>`;
  }
  function homeView(){
    const mine=M.select(S.data.items,{userId:S.user.id}),today=mine.filter(t=>t.dueDate===day()),late=mine.filter(t=>t.dueDate&&t.dueDate<day()),doing=mine.filter(t=>t.status==='Devam ediyor');
    const focus=[...mine].sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||({'Yüksek':0,'Normal':1,'Düşük':2}[a.priority]??1)-({'Yüksek':0,'Normal':1,'Düşük':2}[b.priority]??1));
    const next=M.select(S.data.items,{userId:S.user.id,filter:'week'}).slice(0,3),available=S.data.boards.some(canWrite);
    const projects=[...S.data.boards].sort((a,b)=>Number(S.favorites.includes(b.id))-Number(S.favorites.includes(a.id))).slice(0,3);
    const metrics=[['today',today.length,'Bugün teslim','calendar','green'],['overdue',late.length,'Tarihi geçen','clock','amber'],['doing',doing.length,'Devam eden','tasks','lilac']];
    return `<header class="flow-heading"><div class="p-welcome"><p class="p-greeting">${I('sun')}${E(S.user.name.split(' ')[0])}, hoş geldin</p><h1 id="hub-heading" tabindex="-1">Bugün ne yapıyoruz?</h1><p class="p-welcome-sub">Bir işi aç, durumunu güncelle. Tamamlandığında yanındaki kutuyu işaretle.</p></div>${available?`<button class="h-btn primary" data-hub="new-task">${I('plus')}Yeni görev</button>`:S.user.role==='admin'?`<button class="h-btn primary" data-hub="new-project">${I('projects')}İlk projeni oluştur</button>`:''}</header>
    <div class="flow-dashboard"><div class="flow-main"><section class="h-metrics" aria-label="Size atanan işlerin özeti">${metrics.map(([filter,count,label,icon,tone])=>`<button class="h-metric ${tone}" data-hub="metric" data-filter="${filter}"><div class="p-metric-top"><strong>${count}</strong><span class="h-metric-symbol">${I(icon)}</span></div><p>${label}</p></button>`).join('')}</section>
    <section class="h-panel p-focus-panel"><div class="h-panel-head"><div class="p-panel-title"><span class="p-title-icon">${I('checkCircle')}</span><div><h2>Sıradaki işler</h2><p>${late.length?'Tarihi geçen işlerden başlayabilirsin.':'Sana atanan işler, son tarihine göre sıralı.'}</p></div></div></div><div class="p-focus-list">${focus.length?focus.slice(0,6).map(t=>taskRow(t)).join(''):empty(S.data.boards.length?'Şu an bekleyen işin yok':'İlk adımı birlikte atalım',S.data.boards.length?'Ekibin sana bir iş atadığında burada göreceksin. Projelerden ortak işleri inceleyebilirsin.':S.user.role==='admin'?'Önce bir proje oluştur; ardından ilk görevi ekle.':'Yöneticin seni bir projeye eklediğinde işler burada görünür.','Projeleri gör','projects-link',true)}</div><div class="h-panel-footer"><button class="h-link" data-hub="nav" data-view="tasks">Bütün görevlerim ${I('arrow')}</button></div></section></div>
    <aside class="flow-side"><section class="h-panel"><div class="h-panel-head"><h2>${I('calendar')}Yaklaşan işler</h2></div>${next.length?next.map(t=>`<div class="h-upcoming"><div class="h-upcoming-date"><strong>${Number(t.dueDate.slice(-2))}</strong><small>${E(new Date(t.dueDate+'T12:00:00Z').toLocaleDateString('tr-TR',{month:'short'}))}</small></div><button data-hub="detail" data-key="${E(t.key)}"><b>${E(t.text)}</b><p>${E(t.boardName)}</p></button></div>`).join(''):empty('Takvimin rahat','Önümüzdeki yedi günde sana atanmış tarihli bir iş yok.','','',true)}</section>
    <section class="h-panel"><div class="h-panel-head"><h2>${I('projects')}Projelerin</h2><button class="h-link" data-hub="nav" data-view="projects">Tümü ${I('arrow')}</button></div>${projects.map(miniProject).join('')||empty('Bir projeyle başla','Ortak işleriniz burada toplanır.','','',true)}</section><p class="flow-guidance">${I('chat')}Yorum ve dosya eklemek için görevi açabilirsin.</p></aside></div>`;
  }
  function filtered(){return M.select(S.data.items,{userId:S.scope==='mine'?S.user.id:'',boardId:S.project,query:S.query,filter:S.filter});}
  function tasksView(){
    const b=board(S.project),all=filtered();
    const title=b?b.name:'Görevlerim';
    return (b?`<div class="h-path"><button data-hub="nav" data-view="projects">Projeler</button>${I('arrow')}<span>${E(b.name)}</span></div>`:'')+
      pageHeading(title,b?'Bu projenin bütün işleri. Kim yapıyor, ne zaman bitecek, nerede kaldı?':'Dağınık listeler yerine, size ait bütün işler tek yerde.',`<div class="h-project-hero-actions">${b?`<button class="h-btn" data-hub="graph" data-id="${E(b.id)}">${I('org')}Organizasyon</button><button class="h-btn" data-hub="presentation" data-id="${E(b.id)}">${I('board')}Sunumu hazırla</button>`:''}${(b?canWrite(b):S.data.boards.some(canWrite))?`<button class="h-btn primary" data-hub="new-task">${I('plus')}Yeni görev</button>`:''}</div>`)+
      (b?`<div class="h-project-summary"><p>${E(b.description||'Amaç ve sorumlulukları organizasyon kartında detaylandırın.')}</p><div class="h-project-summary-meter"><div class="h-progress-line"><span>${b.done} / ${b.total} iş tamamlandı</span><b ${b.total?`data-progress-number="summary:${E(b.id)}" aria-hidden="true"`:''}>${b.total?'%'+M.percent(b.done,b.total):'Henüz iş yok'}</b></div>${progressTrack(b,'summary')}</div></div>${ownerWorkload(b)}`:'')+
      `<div class="h-filterbar"><div class="h-filters">${[['open','Açık işler'],['done','Tamamlanan'],['all','Tümü']].map(([v,t])=>`<button class="h-chip ${S.filter===v?'active':''}" data-hub="filter" data-value="${v}" aria-pressed="${S.filter===v}">${t}</button>`).join('')}</div><div class="h-segment" aria-label="Görev görünümü"><button data-hub="mode" data-value="list" class="${S.mode==='list'?'active':''}" aria-pressed="${S.mode==='list'}">${I('list')}Liste</button><button data-hub="mode" data-value="board" class="${S.mode==='board'?'active':''}" aria-pressed="${S.mode==='board'}">${I('board')}Pano</button></div></div>
      <details class="flow-filters" ${!['open','done','all'].includes(S.filter)?'open':''}><summary>${I('search')}Filtreler${!['open','done','all'].includes(S.filter)?' · '+E({today:'Bugün',overdue:'Tarihi geçen',week:'7 gün',undated:'Tarihsiz',doing:'Devam eden'}[S.filter]):''} ${I('down')}</summary><div><select class="h-select" id="hub-scope" aria-label="Sorumlu filtresi"><option value="mine" ${S.scope==='mine'?'selected':''}>Bana atananlar</option><option value="all" ${S.scope==='all'?'selected':''}>Tüm ekip</option></select><select class="h-select" id="hub-project-filter" aria-label="Proje filtresi"><option value="">Tüm projeler</option>${S.data.boards.map(b=>`<option value="${E(b.id)}" ${S.project===b.id?'selected':''}>${E(b.name)}</option>`).join('')}</select></div><div>${[['today','Bugün'],['overdue','Tarihi geçen'],['week','7 gün'],['undated','Tarihsiz'],['doing','Devam eden']].map(([v,t])=>`<button class="h-chip ${S.filter===v?'active':''}" data-hub="filter" data-value="${v}" aria-pressed="${S.filter===v}">${t}</button>`).join('')}</div></details><p class="flow-filter-count">${all.length} iş · ${S.scope==='mine'?'Sana atananlar':'Projedeki herkes'}${S.mode==='board'?' · İlerletmek için durumunu değiştir.':' · Ayrıntı ve yorumlar için görevi aç.'}</p>`+
      (S.mode==='board'?kanban(all):`<section class="h-panel h-task-table"><div class="h-list-head"><span>GÖREV</span><span>DURUM</span><span>SON TARİH</span><span>SORUMLU</span></div>${all.length?all.map(t=>taskRow(t,true)).join(''):empty('Bu görünümde iş yok','Filtreyi değiştirebilir veya yeni bir görev ekleyebilirsiniz.')}</section>`);
  }
  function kanban(items){return `<div class="h-board">${M.STATUSES.map(st=>{const list=items.filter(t=>t.status===st);return `<section class="h-column" data-drop-status="${E(st)}" aria-label="${E(statusLabel(st))}"><header class="h-column-head">${status(st)}<span class="h-count">${list.length}</span></header>${list.map(t=>`<article class="h-kanban-card" draggable="${t.editable&&t.type==='node'}" data-drag-key="${E(t.key)}"><div class="h-board-label"><span class="h-color-dot" style="--dot:${E(t.color)}"></span>${E(t.boardName)}</div><h3><button data-hub="detail" data-key="${E(t.key)}">${E(t.text)}</button></h3><div class="h-kanban-card-foot">${due(t)}<span class="h-card-owner">${avatar(t.owner,'',t.ownerId)}<span>${E(t.owner||'Atanmadı')}</span></span></div><div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between"><select class="h-card-status" data-card-status="${E(t.key)}" aria-label="${E(t.text)} durumunu değiştir" ${!t.editable?'disabled':''}>${(t.type==='check'?['Planlandı','Tamamlandı']:M.STATUSES).map(s=>`<option value="${E(s)}" ${t.status===s?'selected':''}>${E(statusLabel(s))}</option>`).join('')}</select>${t.priority==='Yüksek'?'<span class="h-state high">Öncelikli</span>':t.steps?`<span class="h-keyboard-hint">${t.stepsDone}/${t.steps} adım</span>`:''}</div></article>`).join('')}${S.data.boards.some(canWrite)?`<button class="h-column-add" data-hub="new-task" data-status="${E(st)}">${I('plus')}Görev ekle</button>`:''}</section>`;}).join('')}</div>`;}
  function projectsView(){return pageHeading('Projelerimiz','Her çalışma için tek bir yer. Görevler, ekip ve organizasyon bir arada.',S.user.role==='admin'?`<div class="h-project-hero-actions"><button class="h-btn" data-hub="templates">${I('org')}Hazır şemalar</button><button class="h-btn primary" data-hub="new-project">${I('plus')}Yeni proje</button></div>`:'')+`<div class="h-filterbar"><span class="h-keyboard-hint">${S.data.boards.length} aktif proje · Yıldızla sabitleyin, soldan hemen ulaşın.</span><button class="h-link" data-hub="archive-list">Arşivdeki çalışmalar</button>${S.user.role==='admin'?'<button class="h-link" data-team="import">Önceki Dal dosyasını içe aktar</button>':''}</div><div class="h-project-grid">${S.data.boards.map(projectCard).join('')}</div>${!S.data.boards.length?empty('İlk çalışmayı birlikte başlatalım',S.user.role==='admin'?'Bir ad verin. Ekibi davet edin. İlk görevi paylaşın.':'Yöneticiniz sizi bir projeye eklediğinde burada görünecek.',S.user.role==='admin'?'Proje oluştur':'',S.user.role==='admin'?'new-project':''):''}`;}
  async function archiveList(){
    try{const {boards}=await API('/boards'),archived=boards.filter(b=>b.archived);
      dialog('Arşivdeki çalışmalar','Arşiv kaydı silmez. Çalışmayı okuyabilir; yöneticiyseniz şemadaki Paylaş alanından yeniden açabilirsiniz.',archived.length?archived.map(b=>`<div class="h-unit-row"><span>${I('projects')}</span><button data-hub="graph" data-id="${E(b.id)}"><strong>${E(b.name)}</strong><small>${b.cards} kart · Salt okunur arşiv</small></button>${I('arrow')}</div>`).join(''):empty('Arşiv boş','Erişiminiz olan arşivlenmiş bir çalışma yok.','','',true));
    }catch(e){toast(errorText(e),{error:true});}
  }
  function organizationView(){return pageHeading('Kim, ne yapıyor?','Birimler, sorumlular ve ilişkiler. Büyük resmi kaybetmeden detaylandırın.',S.user.role==='admin'?`<button class="h-btn primary" data-hub="templates">${I('org')}Şablondan başla</button>`:`<button class="h-btn" data-hub="help">${I('help')}Nasıl kullanılır?</button>`)+`<div class="h-organization-pick">${S.data.boards.map(b=>{const units=S.data.units.filter(n=>n.boardId===b.id&&n.parentId===b.rootId);return `<section class="h-org-card"><header class="h-org-head"><span class="h-project-icon" style="--project-color:${E(b.color)}">${I('org')}</span><div><h2>${E(b.name)}</h2><p>${b.cards} kart · ${b.members.length} ekip üyesi</p></div><button class="h-btn soft" data-hub="graph" data-id="${E(b.id)}">Şemayı aç ${I('arrow')}</button></header>${units.slice(0,5).map(n=>`<div class="h-unit-row"><span class="h-color-dot" style="--dot:${E(n.color)}"></span><button data-hub="graph" data-id="${E(b.id)}" data-node="${E(n.nodeId)}"><strong>${E(n.nodeTitle)}</strong><small>${E(n.role||n.kind)}</small></button>${avatar(n.owner,'',n.ownerId)}</div>`).join('')||'<p class="h-note">Şemayı açıp alt birim ekleyerek başlayın. Kartlara sorumlularını ve görevlerini yazın.</p>'}<div class="h-org-card-footer"><span class="h-keyboard-hint">${b.sample?'Düzenlenebilir örnek yapı':'Ekibin ortak organizasyonu'}</span><button class="h-link" data-hub="project" data-id="${E(b.id)}">Projedeki işler ${I('arrow')}</button></div></section>`;}).join('')}</div>${!S.data.boards.length?empty('Henüz organizasyon yok','Önce bir proje açın veya yöneticinizden erişim isteyin.'):''}`;}
  function peopleView(){
    return pageHeading('Ekibimiz','Proje üyeleri ve örnek organizasyondaki temsili roller.',S.user.role==='admin'?`<button class="h-btn primary" data-team="users">${I('plus')}Davet et / yetkiler</button>`:'')+`<div class="h-team-grid">${S.data.people.map(u=>{
      const own=S.data.items.filter(t=>u.example?t.owner===u.name:t.ownerId===u.id);
      const projects=u.example?S.data.boards.filter(b=>window.DalExamples.isExample(b)&&S.data.units.concat(S.data.items).some(n=>n.boardId===b.id&&n.owner===u.name)):S.data.boards.filter(b=>b.members.some(m=>m.id===u.id));
      return `<article class="h-person-card">${avatar(u.name,'large',u.id)}${u.example?'<span class="h-example-badge">Örnek kişi</span>':''}<h3>${E(u.name)}</h3>${u.title?`<p class="h-person-title">${E(u.title)}</p>`:''}<p>${projects.length} ${u.example?'örnek çalışmada':'ortak projede'}</p><div class="h-person-counts"><div><strong>${own.filter(t=>!t.done).length}</strong><small>Açık iş</small></div><div><strong>${own.filter(t=>t.done).length}</strong><small>Tamamlanan</small></div></div></article>`;
    }).join('')}</div><p class="h-note">Örnek kişiler temsili organizasyon kartlarıdır; giriş hesabı veya erişim yetkileri yoktur. İş sayıları yalnız görünür kayıtları gösterir, performans puanı değildir.</p>`;
  }
  const actionsText={'board.changed':'ortak çalışmayı güncelledi','board.created':'yeni bir proje açtı','board.restored':'bir sürümü geri yükledi','member.updated':'ekip erişimini güncelledi','member.removed':'proje üyeliğini güncelledi','comment.added':'bir yorum ekledi','comment.removed':'bir yorumu kaldırdı','board.unarchived':'projeyi yeniden açtı'};
  function activityRow(ev){const at=new Date(ev.createdAt).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});return `<article class="h-activity-row">${avatar(ev.actor,'',ev.actor)}<div><p><strong>${E(ev.actor)}</strong> ${E(actionsText[ev.action]||'bir işlem yaptı')}.</p><button class="h-link" style="font-size:10px;font-weight:400" data-hub="project" data-id="${E(ev.boardId)}">${E(ev.boardName)}</button><small>${E(at)}</small></div></article>`;}
  function activityView(){return pageHeading('Ekipten güncellemeler','Erişiminiz olan projelerdeki en son 30 hareket.',`<button class="h-btn" data-hub="refresh">${I('refresh')}Yenile</button>`)+`<section class="h-panel">${S.data.activity.map(activityRow).join('')||empty('Henüz hareket yok','Yapılan işler, yorumlar ve ekip değişiklikleri burada görünür.')}</section>`;}
  function dialogBlocked(){
    if(S.changeInFlight){toast('İşlem sürüyor; sunucu yanıtını bekleyin.');return true;}
    if(S.pending){toast('Kaydın sonucu henüz doğrulanmadı. Önce aynı kaydı yeniden deneyin.',{error:true});return true;}
    return false;
  }
  function dialog(title,sub,content,{search=false,recovery=false}={}){
    if(!recovery&&dialogBlocked())return null;
    if(!recovery&&S.dialogDirty&&!confirm('Kaydedilmemiş değişiklikleri bırakıp başka bir pencere açılsın mı?'))return null;
    let el=$('#hub-dialog');if(!el){el=document.createElement('dialog');el.id='hub-dialog';el.setAttribute('aria-labelledby','hub-dialog-title');document.body.appendChild(el);el.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});el.addEventListener('close',()=>{S.lastFocus?.isConnected&&S.lastFocus.focus();});}
    if(!el.open)S.lastFocus=document.activeElement;
    S.dialogDirty=false;S.detailDirty=false;S.drawer=null;el.dataset.search=String(search);
    el.innerHTML=search?content:`<header class="h-dialog-head"><div><span class="h-eyebrow">BİRLİKTE İYİLİK</span><h2 id="hub-dialog-title">${E(title)}</h2><p>${E(sub)}</p></div><button class="h-close" data-hub="close" aria-label="Pencereyi kapat">${I('close')}</button></header><section class="h-dialog-body"><div class="h-error" id="hub-error" role="alert"></div>${content}</section>`;
    if(!el.open)el.showModal();el.querySelector('input:not([type=hidden]),textarea')?.focus();return el;
  }
  function closeDialog(force=false){if(!force&&dialogBlocked())return;if(!force&&S.dialogDirty&&!confirm('Kaydedilmemiş değişiklikler var. Kaydetmeden kapatılsın mı?'))return;S.dialogDirty=false;S.pending=null;S.drawer=null;$('#hub-dialog')?.close();}
  function formError(err){const el=$('#hub-error');if(!el){toast(errorText(err),{error:true});return;}
    let text=errorText(err);if(err.status===409)text='Aynı alan başka bir ekip üyesi tarafından değiştirildi. Yazdıklarınız korunuyor; sunucudaki kaydın üzerine yazılmadı.';
    el.innerHTML=`<div>${E(text)}</div>${err.status===409?'<button class="h-link" data-hub="copy-draft">Taslağı indir</button> <button class="h-link" data-hub="reload-detail">Güncel kaydı aç</button>':S.pending?'<p>Sunucu onayı alınamadı. Aynı işlemi güvenle yeniden denemek için Kaydet düğmesine tekrar basın. Sekmeyi kapatmayın.</p><button class="h-link" data-hub="copy-draft">Taslağı indir</button>':''}`;el.scrollIntoView({block:'nearest'});
  }
  async function commit(bid,before,after,label){
    const changes=D.diff(before,after);if(!changes.length)return;
    const signature=JSON.stringify(changes),retry=S.pending;
    if(retry&&retry.signature!==signature)throw new Error('Önce sonucu belirsiz kaydı yeniden deneyin. Yeni düzenleme yapmadan Kaydet düğmesine basın.');
    const operation=retry||{bid,payload:{operationId:C.uid('op'),changes,label},signature};S.pending=operation;
    let res;try{res=await API('/boards/'+bid+'/changes','POST',operation.payload);}catch(e){if(e.status&&e.status<500&&e.status!==408)S.pending=null;throw e;}
    S.pending=null;S.lastUndo={bid,changes:D.inverse(changes)};return res;
  }
  async function undoLast(value){await API('/boards/'+value.bid+'/changes','POST',{operationId:C.uid('op'),changes:value.changes,label:'Günlük ekrandaki işlem geri alındı'});await refresh();toast('İşlem geri alındı.');}
  async function setStatus(key,target){
    const t=item(key);if(!t?.editable)return toast('Bu iş için düzenleme yetkiniz yok.',{error:true});if(dialogBlocked())return;
    if(t.type==='check'&&!['Planlandı','Tamamlandı'].includes(target))return toast('Bu bir kontrol listesi adımı. Yapılacak veya Tamamlandı olarak işaretleyin.');
    S.changeInFlight=true;let saved=false;
    try{const r=await API('/boards/'+t.boardId),draft=D.clone(r.doc),n=draft.nodes.find(n=>n.id===t.nodeId);if(!n)throw new Error('Bu iş artık bulunamıyor. Listeyi yenileyin.');
      if(t.type==='node'){n.status=target;if(target==='Tamamlandı')n.progress=100;else if(n.progress===100)n.progress=0;}else{const step=n.tasks.find(x=>x.id===t.taskId);if(!step)throw new Error('Alt iş kaldırılmış. Listeyi yenileyin.');step.done=target==='Tamamlandı';}
      await commit(t.boardId,r.doc,draft,`${target==='Tamamlandı'?'Tamamlandı':'Durum değişti'}: ${t.text}`);saved=true;const u=S.lastUndo;await refresh();toast(target==='Tamamlandı'?'Bir iş daha tamamlandı. Emeğinize sağlık.':'İşin durumu güncellendi.',{undo:()=>undoLast(u)});
    }catch(e){if(!saved&&S.pending){const pending=S.pending;toast('Sunucu onayı alınamadı. Durumu değiştirmeden önce yeniden kontrol edin.',{error:true,undo:null});const el=dialog('Kayıt onayı bekleniyor','Sonucu belirsiz işlem güvenle tekrar gönderilebilir.',`<p class="h-note">${E(t.text)} · ${E(statusLabel(target))}. Aynı işlem kimliği tekrar kullanıldığı için ikinci bir kayıt oluşturulmaz.</p><button class="h-btn primary" id="hub-retry-operation">Yeniden dene</button>`,{recovery:true});S.dialogDirty=true;if(el)el.querySelector('#hub-retry-operation').onclick=async e=>{if(S.changeInFlight)return;S.changeInFlight=true;const btn=e.currentTarget;btn.disabled=true;try{await API('/boards/'+pending.bid+'/changes','POST',pending.payload);S.pending=null;closeDialog(true);await refresh();toast('İşlem doğrulandı.');}catch(err){formError(err);}finally{S.changeInFlight=false;btn.disabled=false;}};}else toast(saved?'İşlem kaydedildi; ekran yenilenemedi. Yenile düğmesini kullanın.':errorText(e),{error:true});}
    finally{S.changeInFlight=false;}
  }
  function owners(b,selected=''){const arr=[...(b?.members||[])];if(selected&&!arr.some(u=>u.id===selected)&&selected!==S.user.id)arr.push({id:selected,name:'Mevcut sorumlu (erişim değişmiş)'});if(S.user.role==='admin'&&!arr.some(u=>u.id===S.user.id))arr.unshift(S.user);return `<option value="">Henüz atanmadı</option>${arr.map(u=>`<option value="${E(u.id)}" ${u.id===selected?'selected':''}>${E(u.name)}${u.id===S.user.id?' (ben)':''}</option>`).join('')}`;}
  async function newTask(initialStatus='Planlandı'){
    if(S.editor)return navigate(route('tasks',window.DalTeam.initial.id));
    const writable=S.data.boards.filter(canWrite);if(!writable.length){toast(S.user.role==='admin'?'Önce bir proje oluşturun.':'Görev ekleyebileceğiniz bir proje yok; yöneticinizden erişim isteyin.');if(S.user.role==='admin')newProject();return;}
    const b=writable.find(b=>b.id===S.project)||writable[0];
    const el=dialog('Yeni bir görev','Başlık yeterli. Sorumlusunu ve tarihini de belirleyebilirsiniz.',`<form class="h-form" id="hub-new-task"><label>Ne yapılacak?<input class="h-title-input" name="title" placeholder="Örn. Mihenk ilk buluşma planını hazırla" required maxlength="250" autocomplete="off"></label><label>Hangi projede?<select name="board">${writable.map(x=>`<option value="${E(x.id)}" ${x.id===b.id?'selected':''}>${E(x.name)}</option>`).join('')}</select></label><div class="h-two"><label>Sorumlu<select name="owner">${owners(b,S.user.id)}</select></label><label>Son tarih<input name="due" type="date"></label></div><details><summary>Açıklama ve diğer ayrıntılar</summary><div><label>Bağlı olduğu birim<select name="parent"></select></label><label>Açıklama<textarea name="description" maxlength="20000" placeholder="Beklenen sonuç, ihtiyaç duyulan bilgi…"></textarea></label><div class="h-two"><label>Öncelik<select name="priority"><option>Normal</option><option>Yüksek</option><option>Düşük</option></select></label><label>Durum<select name="status">${M.STATUSES.map(s=>`<option ${s===initialStatus?'selected':''}>${s}</option>`).join('')}</select></label></div></div></details><div class="h-dialog-actions"><button class="h-btn" type="button" data-hub="close">Vazgeç</button><button class="h-btn primary" type="submit">Görev oluştur ${I('arrow')}</button></div></form>`);
    if(!el)return;
    const form=$('#hub-new-task');form.onsubmit=e=>e.preventDefault();form.querySelector('[type=submit]').disabled=true;let cache={};const loadParents=async bid=>{const r=await API('/boards/'+bid);cache[bid]=r;if(form.elements.board.value!==bid)return;form.elements.parent.innerHTML=C.ordered(r.doc).filter(({node})=>node.kind!=='Görev').map(({node,depth})=>`<option value="${E(node.id)}">${'— '.repeat(depth)}${E(node.title)}</option>`).join('')||`<option value="${E(C.rootNode(r.doc).id)}">Proje kökü</option>`;};
    try{await loadParents(b.id);}catch(e){formError(e);}
    form.elements.board.onchange=async e=>{form.elements.owner.innerHTML=owners(board(e.target.value),S.user.id);try{await loadParents(e.target.value);}catch(err){formError(err);}};
    let submitted=null;
    form.onsubmit=async e=>{e.preventDefault();if(S.changeInFlight)return;const f=S.pending&&submitted?submitted.fields:Object.fromEntries(new FormData(form));if(!f.title.trim())return formError(new Error('Bir görev başlığı yazın.'));S.changeInFlight=true;const btn=form.querySelector('[type=submit]');btn.disabled=true;
      try{
        if(!submitted){const r=await API('/boards/'+f.board),draft=D.clone(r.doc);const who=(board(f.board)?.members||[]).find(u=>u.id===f.owner)|| (f.owner===S.user.id?S.user:null);C.addNode(draft,f.parent||C.rootNode(draft).id,{title:f.title.trim(),kind:'Görev',ownerUserId:f.owner,owner:who?.name||'',dueDate:f.due,status:f.status,priority:f.priority,description:f.description,progress:f.status==='Tamamlandı'?100:0});submitted={bid:f.board,before:r.doc,after:draft,fields:f};}
        await commit(submitted.bid,submitted.before,submitted.after,'Yeni görev: '+f.title.trim());const u=S.lastUndo;closeDialog(true);try{await refresh();}catch(_){toast('Görev kaydedildi; görünümü yenileyin.');return;}toast('Görev eklendi. Ekibin ortak listesinde hazır.',{undo:()=>undoLast(u)});
      }catch(err){if(!S.pending)submitted=null;else{form.querySelectorAll('input,select,textarea').forEach(x=>x.disabled=true);btn.textContent='Aynı kaydı yeniden dene';}formError(err);}finally{S.changeInFlight=false;btn.disabled=false;}
    };
    form.querySelector('[type=submit]').disabled=false;
  }
  function templateGallery(group='structures'){
    if(S.user.role!=='admin')return toast('Yeni çalışma oluşturmak için yönetici yetkisi gerekir.',{error:true});
    dialog('Hazır şemalar','Önce yapıyı seç. Sonra adını ver ve ekibine göre düzenle.',`<div class="h-template-types" aria-label="Şablon türü"><button class="h-chip ${group==='structures'?'active':''}" aria-pressed="${group==='structures'}" data-hub="template-group" data-group="structures">Ekip ve yönetim yapıları <small>${window.DalTemplates.catalog.filter(t=>t.group==='structures').length}</small></button><button class="h-chip ${group==='work'?'active':''}" aria-pressed="${group==='work'}" data-hub="template-group" data-group="work">İş planları <small>${window.DalTemplates.catalog.filter(t=>t.group==='work').length}</small></button></div><div class="h-template-gallery">${window.DalTemplates.catalog.filter(t=>t.group===group).map(t=>`<button class="h-template-card" data-hub="choose-template" data-template="${E(t.id)}" style="--template-color:${t.color}"><span class="h-template-preview">${window.DalTemplates.preview(t.id)}</span><strong>${I(t.icon)}${E(t.title)}</strong><span>${E(t.description)}</span><small>${E(t.label)}</small><b>Bu yapıyla başla ${I('arrow')}</b></button>`).join('')}</div><p class="h-note">Her şablon yeni ve düzenlenebilir bir çalışma açar. Kartları, bağlantıları ve yerleşimi değiştirebilirsin; sorumluları ve tarihleri sen belirlersin.</p>`);
  }
  function newProject(selectedTemplate='blank'){
    if(S.user.role!=='admin')return toast('Yeni proje açma yetkisi kurum yöneticisindedir.',{error:true});
    const el=dialog('Bir çalışma başlatalım','Adını yaz; hazır yapıyı ekibine göre düzenleyebilirsin.',`<form id="hub-new-project" class="h-form"><label>Proje adı<input name="name" required maxlength="250" class="h-title-input" placeholder="Örn. Mihenk Buluşmaları" autocomplete="off"></label><details ${selectedTemplate!=='blank'?'open':''}><summary>${selectedTemplate==='blank'?'Hazır bir yapıyla başlamak istiyorum':'Seçilen hazır yapı'}</summary><div><label>Başlangıç<select name="template"><option value="blank" ${selectedTemplate==='blank'?'selected':''}>Boş çalışma</option>${window.DalTemplates.catalog.map(t=>`<option value="${E(t.id)}" ${t.id===selectedTemplate?'selected':''}>${E(t.title)}</option>`).join('')}<option value="education">Birlikte İyilik / TACEV öneri yapısı</option><option value="project">Önceki proje şablonu</option></select></label><p class="h-note">Şablonlar kurumun onaylanmış yapısı değil, düzenleyebileceğiniz önerilerdir.</p></div></details><div class="h-dialog-actions"><button type="button" class="h-btn" data-hub="close">Vazgeç</button><button class="h-btn primary" type="submit">Projeyi oluştur ${I('arrow')}</button></div></form>`);if(!el)return;
    const templateChoice=document.createElement('div');templateChoice.id='hub-template-choice';$('#hub-new-project [name=template]').closest('label').after(templateChoice);
    const showChoice=()=>{const t=window.DalTemplates.catalog.find(t=>t.id===$('#hub-new-project [name=template]').value);templateChoice.innerHTML=t?`<div class="h-template-selected"><span class="h-template-preview">${window.DalTemplates.preview(t.id)}</span><div><strong>${E(t.title)}</strong><p>${E(t.description)}</p><small>${E(t.label)}</small></div></div>`:'';};
    $('#hub-new-project [name=template]').onchange=showChoice;showChoice();
    $('#hub-new-project').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')).trim();if(!name)return formError(new Error('Bir proje adı yazın.'));const btn=e.target.querySelector('[type=submit]');btn.disabled=true;S.changeInFlight=true;
      try{const template=String(f.get('template'));const doc=window.DalTemplates.catalog.some(t=>t.id===template)?window.DalTemplates.create(template,name):C.newDocument(template);doc.name=name;if(f.get('template')==='blank'){C.rootNode(doc).title=name;C.rootNode(doc).color=C.COLORS[0];doc.sample=false;}const r=await API('/boards','POST',{doc});closeDialog(true);if(window.DalTemplates.catalog.find(t=>t.id===template)?.group==='structures'){S.changeInFlight=false;return navigate(graph(r.id)+'&overview=1');}await refresh();await go('tasks',r.id);toast(doc.nodes.some(n=>n.kind==='Görev')?'Proje hazır. Başlangıç görevlerine sorumlu ve tarih belirleyebilirsin.':'Proje hazır. İlk görevi ekleyerek başlayın.');}catch(err){formError(err);if(!err.status||err.status>=500){btn.dataset.ambiguous='true';btn.textContent='Önce projeleri kontrol edin';$('#hub-error').innerHTML+='<p>Proje oluşturulmuş olabilir. Tekrar oluşturmadan önce proje listesini kontrol edin.</p><button class="h-link" data-hub="check-projects">Projeleri kontrol et</button>';}}finally{btn.disabled=btn.dataset.ambiguous==='true';S.changeInFlight=false;}};
  }
  async function detail(key){
    if(dialogBlocked())return;
    const t=item(key);if(!t)return toast('Bu görev artık görünmüyor. Listeyi yenileyin.',{error:true});
    if(S.dialogDirty&&!confirm('Kaydedilmemiş değişiklikleri bırakmak istiyor musunuz?'))return;S.dialogDirty=false;
    let r;try{r=await API('/boards/'+t.boardId);}catch(e){toast(errorText(e),{error:true});return;}
    const n=r.doc.nodes.find(n=>n.id===t.nodeId),check=t.type==='check'?n?.tasks.find(x=>x.id===t.taskId):null;
    if(!n||(t.type==='check'&&!check))return toast('Bu iş başka bir ekip üyesi tarafından kaldırılmış.',{error:true});
    const editable=canWrite(r), title=check?check.text:n.title,own=check?check.assigneeId:n.ownerUserId,dt=check?check.dueDate:n.dueDate;
    const el=dialog(check?'Alt işin ayrıntıları':'Görev ayrıntıları',t.boardName,`<form class="h-form" id="hub-detail-form"><label>Görev<input name="title" class="h-title-input" required maxlength="${check?1000:250}" value="${E(title)}" ${!editable?'disabled':''}></label><div class="h-two"><label>Sorumlu<select name="owner" ${!editable?'disabled':''}>${owners(r,own)}</select></label><label>Son tarih<input name="due" type="date" value="${E(dt)}" ${!editable?'disabled':''}></label></div><label>Durum<select name="status" ${!editable?'disabled':''}>${(check?['Planlandı','Tamamlandı']:M.STATUSES).map(s=>`<option value="${E(s)}" ${s===(check?(check.done?'Tamamlandı':'Planlandı'):n.status)?'selected':''}>${E(statusLabel(s))}</option>`).join('')}</select></label>${!check?`<details class="h-task-details"><summary>Açıklama ve küçük adımlar${n.tasks.length?` · ${n.tasks.filter(x=>x.done).length}/${n.tasks.length}`:''}</summary><div><label>Açıklama<textarea name="description" maxlength="20000" placeholder="Bu işin sonunda ne ortaya çıkmalı?" ${!editable?'disabled':''}>${E(n.description)}</textarea></label><label>Öncelik<select name="priority" ${!editable?'disabled':''}>${['Normal','Yüksek','Düşük'].map(p=>`<option ${n.priority===p?'selected':''}>${p}</option>`).join('')}</select></label><div class="h-dialog-subhead">Küçük adımlar</div><div id="hub-checklist"></div>${editable?'<div class="h-checklist-add"><input id="hub-step-input" maxlength="1000" aria-label="Yeni kontrol listesi adımı" placeholder="Bir adım ekle…"><button type="button" data-hub="add-step">Ekle</button></div>':''}</div></details>`:`<p class="h-note">Bu iş <strong>${E(n.title)}</strong> görevine bağlıdır.</p>`}${editable?`<div class="h-dialog-actions"><span class="h-keyboard-hint" id="hub-dirty-label">Değişiklikleri kaydederek paylaşın.</span><button class="h-btn primary" type="submit">Değişiklikleri kaydet</button></div>`:'<p class="h-note">Bu projede yalnız okuma veya yorum yapma yetkiniz var.</p>'}</form><details class="h-task-extras"><summary>Dosyalar ve ek seçenekler</summary><div class="coord-task-tools"><button class="h-btn" type="button" data-coord="task" data-board="${E(t.boardId)}" data-node="${E(n.id)}">Dosya ekle / bağlantılı işler / tekrar</button></div></details><div class="h-dialog-subhead">Yorumlar <small>Ekiple aynı yerde konuşun</small></div><div id="hub-comments"><p class="h-keyboard-hint">Yorumlar yükleniyor…</p></div>${['manager','editor','commenter'].includes(r.role)&&!r.archived?'<form id="hub-comment-form" class="h-form h-comment-form"><label>Yorumunuz<textarea name="body" required maxlength="5000" placeholder="Bir not bırakın veya soruyu ekibe iletin…"></textarea></label><button class="h-btn" type="submit">Yorumu gönder</button></form>':''}<div style="margin-top:18px"><button class="h-link" data-hub="graph" data-id="${E(t.boardId)}" data-node="${E(n.id)}">${I('org')}Ekip şemasında göster</button></div>`);
    if(!el)return;window.DalCoord?.mentions(el,r.members);S.drawer={key,r,editable,check:!!check,nodeId:n.id,steps:D.clone(n.tasks)};renderChecklist();
    const form=$('#hub-detail-form');form.onsubmit=async e=>{e.preventDefault();if(!editable||S.changeInFlight)return;if($('#hub-comment-form textarea')?.value.trim()&&!confirm('Yorumunuz henüz gönderilmedi. Yorumu göndermeden görevi kaydedip kapatmak istiyor musunuz?'))return;const f=Object.fromEntries(new FormData(form));if(!f.title.trim())return formError(new Error('Görev başlığı boş olamaz.'));const d=D.clone(r.doc),changed=d.nodes.find(x=>x.id===n.id);const who=r.members.find(u=>u.id===f.owner)||(f.owner===S.user.id?S.user:null);
      if(check){const ct=changed.tasks.find(x=>x.id===check.id);Object.assign(ct,{text:f.title.trim(),assigneeId:f.owner,assignee:who?.name||(f.owner===check.assigneeId?check.assignee:''),dueDate:f.due,done:f.status==='Tamamlandı'});}
      else{Object.assign(changed,{title:f.title.trim(),ownerUserId:f.owner,owner:who?.name||(f.owner===n.ownerUserId?n.owner:''),dueDate:f.due,status:f.status,priority:f.priority,description:f.description,tasks:S.drawer.steps});if(f.status==='Tamamlandı')changed.progress=100;else if(changed.progress===100)changed.progress=0;}
      S.changeInFlight=true;const btn=form.querySelector('[type=submit]');btn.disabled=true;
      try{await commit(t.boardId,r.doc,d,'Görev ayrıntıları: '+f.title.trim());const u=S.lastUndo;closeDialog(true);try{await refresh();}catch(_){toast('Değişiklikler kaydedildi; ekranı yenileyin.');return;}toast('Değişiklikler ekip için kaydedildi.',{undo:u?()=>undoLast(u):null});}catch(err){formError(err);}finally{btn.disabled=false;S.changeInFlight=false;}
    };
    await loadComments(t.boardId,n.id);
    if($('#hub-comment-form')){let requestId=C.uid('comment'),lastText='';$('#hub-comment-form').onsubmit=async e=>{e.preventDefault();const text=e.target.elements.body.value.trim();if(!text)return;if(text!==lastText){lastText=text;requestId=C.uid('comment');}const btn=e.target.querySelector('button');btn.disabled=true;
      try{await API('/boards/'+t.boardId+'/comments','POST',{nodeId:n.id,body:text,operationId:requestId});e.target.reset();S.dialogDirty=S.detailDirty;requestId=C.uid('comment');await loadComments(t.boardId,n.id);toast('Yorum ekiple paylaşıldı.');}catch(err){formError(err);}finally{btn.disabled=false;}};}
  }
  function renderChecklist(){if(!S.drawer||!$('#hub-checklist'))return;$('#hub-checklist').innerHTML=S.drawer.steps.map((t,i)=>`<div class="h-checklist-row ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} data-step-index="${i}" aria-label="${E(t.text)}" ${!S.drawer.editable?'disabled':''}><span>${E(t.text)}</span>${S.drawer.editable?`<button type="button" data-hub="remove-step" data-index="${i}" aria-label="${E(t.text)} adımını kaldır">×</button>`:''}</div>`).join('')||'<p class="h-keyboard-hint">Küçük adımlar ekleyerek işi kolaylaştırın.</p>';}
  async function loadComments(bid,nid){const el=$('#hub-comments');if(!el)return;try{const r=await API('/boards/'+bid+'/comments?nodeId='+enc(nid));if(!el.isConnected)return;el.innerHTML=r.comments.map(c=>`<article class="h-comment">${avatar(c.author||c.name||'Ekip üyesi')}<div><b>${E(c.author||c.name||'Ekip üyesi')}</b><small>${E(new Date(c.created_at||c.createdAt).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</small><p>${E(c.body)}</p></div></article>`).join('')||'<p class="h-keyboard-hint">Henüz yorum yok. İlk notu siz bırakın.</p>';}catch(e){el.textContent=errorText(e);}}
  function exampleNotice(){
    const count=S.data.boards.filter(b=>window.DalExamples?.isExample(b)).length;
    if(!count)return '';
    return `<aside class="h-example-notice" aria-label="Örnek içerik"><div>${I('org')}<span><strong>Örnek içeriklerle çalışma alanını keşfet</strong><small>${count} çalışma · Temsili kişiler ve görevler; kayıtlar düzenlenebilir.</small></span></div><button class="h-link" data-hub="help">Rehberi aç ${I('arrow')}</button></aside>`;
  }
  function help(){
    const count=S.data?.boards.filter(b=>window.DalExamples?.isExample(b)).length||0;
    const steps=[
      ['today','sun','Bugün','Sana atanan, geciken ve yaklaşan işleri gör. Bir görevi açıp sorumlusunu, tarihini ve açıklamasını incele.'],
      ['tasks','tasks','Görevlerim','Liste / Pano geçişini dene. Tamamladığın bir işi işaretle; gerekirse Geri al ile eski durumuna dön.'],
      ['projects','projects','Projeler','Projeyi aç; bağlı işleri ve ilerlemeyi gör. Yeni görev eklerken proje, sorumlu ve tarih seç.'],
      ['organization','org','Organizasyon','Bir şemayı aç. Birimlerin, kişilerin ve görevlerin bağlılığını incele. Kart seçerek ayrıntıları düzenle.'],
      ['people','team','Ekibimiz','Gerçek üyeleri ve temsili örnek kişileri gör. Yönetici hesabıyla Davet et / yetkiler bölümünden gerçek ekip üyelerini ekle.'],
      ['calendar','calendar','Takvim ve toplantılar','Gündemi, tutanağı ve kararları kaydet. Takvimi .ics olarak indirebilir, Haftalık rapor bölümünden işleri takip edebilirsin.']
    ];
    dialog('Çalışma alanını birlikte tanıyalım','Bir görevden başlayın, projenin ve ekibin tamamına ilerleyin.',`<div class="h-guide"><div class="h-color-guide"><span class="h-state">Yapılacak</span><span class="h-state doing">Devam ediyor</span><span class="h-state blocked">Beklemede</span><span class="h-state done">Tamamlandı</span><span class="h-task-due overdue">Geciken</span></div><div class="h-guide-grid">${steps.map(([v,icon,title,text])=>`<button class="h-guide-step" data-hub="guide-go" data-view="${v}"><span class="p-title-icon">${I(icon)}</span><span><strong>${title}</strong><small>${text}</small></span>${I('arrow')}</button>`).join('')}</div><div class="h-guide-example"><h3>${count?'Örnek içerikler hazır':'Dolu bir çalışma alanını inceleyin'}</h3><p>Bir organizasyon, üç proje, sekiz temsili kişi; farklı durumlarda görevler, yorumlar ve toplantılar. Örnek kişiler için hesap açılmaz. Çalışmalar sunucuda saklanır, gerçek kayıtlarınızın üzerine yazılmaz.</p>${S.user.role==='admin'?`<div class="h-guide-actions"><button class="h-btn primary" data-hub="populate-examples">${I('plus')}${count?'Örnek setini kontrol et':'Örnek içerikleri ekle'}</button>${count?'<button class="h-btn" data-hub="archive-examples">Örnekleri arşivle</button>':''}</div>`:''}<p id="hub-example-progress" class="h-note hidden" role="status"></p></div><p class="h-keyboard-hint">Ctrl / ⌘ K: ara · N: yeni görev · Esc: pencereyi kapat. Görev ayrıntılarında Kaydet kullanılır; şemada kayıt otomatiktir. Yıldızlar ve favoriler bu tarayıcıya özeldir.</p></div>`);
  }
  async function populateExamples(){
    if(S.user.role!=='admin')throw Error('Örnek eklemek için kurum yöneticisi yetkisi gerekli.');
    if(S.changeInFlight)return;
    S.changeInFlight=true;
    const buttons=$$('#hub-dialog button');buttons.forEach(b=>b.disabled=true);
    const progress=$('#hub-example-progress'),say=text=>{if(progress){progress.classList.remove('hidden');progress.textContent=text;}};
    try{
      const {boards}=await API('/boards'),plans=window.DalExamples.plans(S.user),ids=[];
      for(let i=0;i<plans.length;i++){
        const p=plans[i];say(`${i+1} / ${plans.length} · ${p.doc.name}`);
        const found=boards.find(b=>b.name===p.doc.name);
        if(found?.archived){say(`${p.doc.name} arşivde korunuyor.`);continue;}
        const current=found?await API('/boards/'+found.id):await API('/boards','POST',{doc:p.doc});
        if(!current.doc.sample||!C.rootNode(current.doc).tags.includes('ekip-örnek-set-v1'))continue;
        ids.push(current.id);
        const target=id=>{const original=p.doc.nodes.find(n=>n.id===id);return current.doc.nodes.find(n=>n.title===original?.title&&n.kind===original?.kind)?.id;};
        const existingComments=await API('/boards/'+current.id+'/comments');
        for(const comment of p.comments){const nodeId=target(comment.nodeId);if(nodeId&&!existingComments.comments.some(c=>c.body===comment.body))await API('/boards/'+current.id+'/comments','POST',{nodeId,body:comment.body,operationId:'example-comment:'+nodeId});}
        const existingEvents=await API('/boards/'+current.id+'/events');
        for(const event of p.events)if(!existingEvents.events.some(e=>e.id===event.id))await API('/boards/'+current.id+'/events','POST',{...event,expectedRevision:0,decisions:event.decisions.map(d=>({...d,nodeId:target(d.nodeId)||''}))});
        const {meta}=await API('/boards/'+current.id+'/meta');
        for(const m of p.metadata){const nodeId=target(m.nodeId);if(nodeId&&!meta[nodeId])await API('/boards/'+current.id+'/meta/'+nodeId,'PUT',{expectedRevision:0,dependencies:m.dependencies.map(target).filter(Boolean),recurrence:null});}
      }
      S.favorites=[...new Set([...S.favorites,...ids])].slice(0,5);store('favorites',S.favorites);
      S.data=await fetchData();S.view='today';S.editor=false;
      window.history.replaceState(null,'',route('today'));
      closeDialog(true);render();toast('Örnek organizasyon, projeler ve temsili kişiler hazır.');
    }catch(e){say('Eklenen çalışmalar korunuyor. Aynı düğme ile eksik kalan adımları yeniden deneyebilirsiniz. '+errorText(e));}
    finally{S.changeInFlight=false;buttons.forEach(b=>b.disabled=false);}
  }
  async function archiveExamples(){
    if(S.user.role!=='admin')throw Error('Arşivleme için kurum yöneticisi yetkisi gerekli.');
    if(!confirm('Örnek seti salt okunur arşive alınacak. Kayıtlar korunur ve yeniden açılabilir. Devam edilsin mi?'))return;
    if(S.changeInFlight)return;S.changeInFlight=true;
    try{for(const b of S.data.boards.filter(window.DalExamples.isExample)){const current=await API('/boards/'+b.id);if(!C.rootNode(current.doc).tags.includes('ekip-örnek-set-v1'))continue;await API('/boards/'+b.id+'/archive','PATCH',{archived:true,expectedRevision:current.revision});}closeDialog(true);await refresh();toast('Örnekler arşivlendi. Projeler → Arşivdeki çalışmalar bölümünden açabilirsiniz.');}
    finally{S.changeInFlight=false;}
  }
  function search(){
    if(!S.data){fetchData().then(d=>{S.data=d;search();}).catch(e=>toast(errorText(e),{error:true}));return;}
    const el=dialog('Ara','',`<div class="h-search-input-wrap"><span>${I('search')}</span><label class="h-sr-only" id="hub-dialog-title" for="hub-global-query">Projeler, görevler ve birimlerde ara</label><input id="hub-global-query" type="search" placeholder="Görev, proje veya birim ara…" autocomplete="off" aria-label="Projeler, görevler ve birimlerde ara"><button class="h-close" data-hub="close" aria-label="Aramayı kapat">${I('close')}</button></div><div id="hub-search-results" class="h-search-results"></div><p class="h-keyboard-hint" style="padding:0 22px 12px">↑ ↓ Sonuçlar arasında gezin · Enter Aç · Esc Kapat</p>`,{search:true});if(!el)return;
    const show=()=>{const q=M.norm($('#hub-global-query').value.trim()),bs=S.data.boards.filter(b=>M.norm(b.name).includes(q)).slice(0,5),ts=S.data.items.filter(t=>M.norm(t.text+' '+t.owner+' '+t.boardName).includes(q)).slice(0,12),ns=q?S.data.units.filter(n=>M.norm(n.nodeTitle+' '+n.owner).includes(q)).slice(0,6):[];
      $('#hub-search-results').innerHTML=(bs.length?'<div class="h-search-group">PROJELER</div>'+bs.map(b=>`<button class="h-search-result" data-hub="search-project" data-id="${E(b.id)}">${I('projects')}<span><b>${E(b.name)}</b><small>${b.total-b.done} açık iş</small></span>${I('arrow')}</button>`).join(''):'')+(ts.length?'<div class="h-search-group">GÖREVLER</div>'+ts.map(t=>`<button class="h-search-result" data-hub="search-task" data-key="${E(t.key)}">${I('tasks')}<span><b>${E(t.text)}</b><small>${E(t.boardName)} · ${E(t.owner||'Atanmadı')}</small></span>${due(t)}</button>`).join(''):'')+(ns.length?'<div class="h-search-group">ORGANİZASYON</div>'+ns.map(n=>`<button class="h-search-result" data-hub="graph" data-id="${E(n.boardId)}" data-node="${E(n.nodeId)}">${I('org')}<span><b>${E(n.nodeTitle)}</b><small>${E(n.boardName)}</small></span></button>`).join(''):'')||empty('Eşleşme bulunamadı','Başka bir kelime veya kişi adı deneyin.','','',true);};
    $('#hub-global-query').oninput=show;show();$('#hub-global-query').focus();
  }
  async function onEditor(editor,initial){
    S.editor=true;document.body.classList.add('sidebar-hidden','inspector-hidden');
    if(new URLSearchParams(location.search).get('node'))document.body.classList.remove('inspector-hidden');
    const actions=document.createElement('div');actions.className='h-editor-actions';actions.innerHTML=`<button class="h-btn" data-hub="project" data-id="${E(initial.id)}">${I('tasks')}Projedeki işler</button><button class="h-btn" data-team="members">${I('team')}Paylaş</button><button class="h-btn" data-hub="map-options">${I('more')}Görünüm</button>`;$('#app .app-header').appendChild(actions);
    const pane=$('#app .pane-toggle');if(pane)pane.style.display='inline-flex';
    try{S.data=await fetchData();navigation(S.user,true,initial);}catch(_){/* The authorized editor still works if hub summary fails. */}
    requestAnimationFrame(()=>new URLSearchParams(location.search).get('overview')==='1'?editor.fit():editor.readableView());
  }
  async function preparePresentation(id,button){
    if(!id||S.presentationLoading||dialogBlocked())return;
    if(window.DalTeam.hasPending())return toast('Son şema değişikliklerinin kaydedilmesini bekle.');
    S.presentationLoading=true;button.disabled=true;closeDialog(true);
    try{
      const r=await API('/boards/'+enc(id)),snapshot=C.clone(r.doc);
      // Layout is a personal view preference; preserve it without changing shared data.
      if(S.editor&&window.DalTeam.initial.id===id)snapshot.settings.layout=window.DAL.store.doc.settings.layout;
      window.DalPresentation.open(snapshot);
    }catch(e){toast(errorText(e),{error:true});}finally{S.presentationLoading=false;button.disabled=false;}
  }
  function mapOptions(){dialog('Şema araçları','Günlük görünümü sade tutmak için ayrıntılı araçlar burada.',`<div class="h-form"><div class="h-dialog-subhead" style="margin-top:0">Yerleşim</div><div class="h-filters">${[['org','Klasik hiyerarşi'],['tree','Soldan sağa'],['mind','Zihin haritası'],['radial','Dairesel'],['pyramid','Piramit'],['matrix','Matris']].map(([v,t])=>`<button class="h-btn ${window.DAL.store.doc.settings.layout===v?'active':''}" aria-pressed="${window.DAL.store.doc.settings.layout===v}" data-hub="layout" data-value="${v}">${t}</button>`).join('')}</div><div class="h-dialog-subhead">Diğer işlemler</div><div class="h-filters"><button class="h-btn" data-hub="presentation" data-id="${E(window.DalTeam.initial.id)}">Sunumu hazırla</button><button class="h-btn" data-hub="editor-tool" data-tool="bulk">Metinden toplu ekle</button><button class="h-btn" data-hub="editor-tool" data-tool="export">Dışa aktar / yazdır</button><button class="h-btn" data-hub="editor-history">Değişiklik geçmişi</button><button class="h-btn" data-hub="editor-tool" data-tool="reset-layout">Otomatik düzenle</button><button class="h-btn" data-hub="editor-tool" data-tool="focus">Odak görünümü</button></div><p class="h-note">Şema değişiklikleri otomatik kaydedilir. Yerleşim ve yakınlaştırma diğer kullanıcıların ekranını değiştirmez.</p></div>`);}
  async function handle(action,el){
    if(action==='nav')return go(el.dataset.view);if(action==='projects-link')return go('projects');
    if(action==='density'){S.density=S.density==='compact'?'comfortable':'compact';store('density',S.density);document.body.dataset.density=S.density;S.editor?navigation(S.user,true,window.DalTeam.initial):render();return;}
    if(action==='comments')return dialog('Son yorumlar','Erişebildiğiniz projelerdeki en son yorumlar.',(S.data.recentComments||[]).map(recentCommentRow).join('')||empty('Henüz yorum yok','Bir görevi açıp ilk görüşünüzü paylaşabilirsiniz.','','',true));
    if(action==='comment-open'){const t=item(el.dataset.key);if(t)return detail(t.key);return navigate(graph(el.dataset.id,el.dataset.node));}
    if(action==='focus-all'){const f=S.focusFilter;await go('tasks');S.filter=f==='done'?'done':'open';return render();}
    if(action==='menu'){document.body.classList.add('hub-menu-open');syncMenu();$('.hub-side nav button')?.focus();return;}if(action==='menu-close'){document.body.classList.remove('hub-menu-open');syncMenu();$('.h-mobile-menu')?.focus();return;}
    if(action==='presentation')return preparePresentation(el.dataset.id,el);if(action==='guide-go'){closeDialog(true);return go(el.dataset.view);}if(action==='populate-examples')return populateExamples();if(action==='archive-examples')return archiveExamples();if(action==='close')return closeDialog();if(action==='help')return help();if(action==='search')return search();if(action==='new-task')return newTask(el.dataset.status);if(action==='new-project')return newProject();if(action==='templates')return templateGallery();if(action==='template-group')return templateGallery(el.dataset.group);if(action==='choose-template')return newProject(el.dataset.template);
    if(action==='check-projects'){closeDialog(true);await refresh();return go('projects');}if(action==='activity')return go('activity');if(action==='project')return go('tasks',el.dataset.id);
    if(action==='graph'){if(S.dialogDirty&&!confirm('Kaydedilmemiş değişiklikleri bırakıp şemaya geçmek istiyor musunuz?'))return;S.dialogDirty=false;return navigate(graph(el.dataset.id,el.dataset.node||''));}
    if(action==='detail')return detail(el.dataset.key);if(action==='toggle'){const t=item(el.dataset.key);return setStatus(el.dataset.key,t.done?'Planlandı':'Tamamlandı');}
    if(action==='filter'){S.filter=el.dataset.value;return render();}if(action==='mode'){S.mode=el.dataset.value;store('task-view',S.mode);return render();}if(action==='focus-filter'){S.focusFilter=el.dataset.value;return render();}
    if(action==='metric'){await go('tasks');S.filter=el.dataset.filter;return render();}
    if(action==='favorite'){const id=el.dataset.id;S.favorites=S.favorites.includes(id)?S.favorites.filter(x=>x!==id):[...S.favorites,id];store('favorites',S.favorites);return render();}
    if(action==='star-task'){const key=el.dataset.key;S.stars=S.stars.includes(key)?S.stars.filter(x=>x!==key):[...S.stars,key];store('stars',S.stars);render();return;}
    if(action==='agenda-date'){S.agendaDate=el.dataset.date;return render();}if(action==='agenda-reset'){S.agendaDate='';return render();}
    if(action==='refresh')return refresh();if(action==='apply-refresh'){S.data=S.newData||S.data;S.newData=null;return render();}
    if(action==='search-project'){closeDialog(true);return go('tasks',el.dataset.id);}if(action==='search-task'){closeDialog(true);if(S.editor)return navigate(graph(item(el.dataset.key).boardId,item(el.dataset.key).nodeId));return detail(el.dataset.key);}
    if(action==='add-step'){const input=$('#hub-step-input'),text=input?.value.trim();if(!text)return;if(S.drawer.steps.length>=500)return toast('Bir görevde en fazla 500 kontrol adımı olabilir.',{error:true});S.drawer.steps.push({id:C.uid('t'),text,done:false,assignee:'',assigneeId:'',dueDate:''});input.value='';S.dialogDirty=true;S.detailDirty=true;renderChecklist();input.focus();return;}
    if(action==='remove-step'){S.drawer.steps.splice(Number(el.dataset.index),1);S.dialogDirty=true;S.detailDirty=true;return renderChecklist();}
    if(action==='copy-draft'){const data={note:'Bu dosya sunucuya kaydedilmemiş kullanıcı taslağıdır.',fields:Object.fromEntries(new FormData($('#hub-detail-form')||$('#hub-new-task')||document.createElement('form'))),steps:S.drawer?.steps,pending:S.pending};const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=url;a.download='Dal_kaydedilmemis_taslak.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);return;}
    if(action==='reload-detail'){const key=S.drawer?.key;if(!key)return toast('Yeni görev formundaki alanları koruyup tekrar deneyin.');if(!confirm('İndirmediğiniz yerel değişiklikler bırakılacak. Güncel sunucu kaydı açılsın mı?'))return;S.dialogDirty=false;S.pending=null;return detail(key);}
    if(action==='archive-list')return archiveList();if(action==='map-options')return mapOptions();if(action==='layout'){closeDialog(true);$(`#app [data-layout="${el.dataset.value}"]`)?.click();return;}
    if(action==='editor-tool'){closeDialog(true);window.DAL?.actions[el.dataset.tool]?.();return;}if(action==='editor-history'){closeDialog(true);window.DalTeam.history();return;}
  }
  document.addEventListener('click',e=>{const el=e.target.closest('[data-hub]');if(!el)return;e.preventDefault();Promise.resolve(handle(el.dataset.hub,el)).catch(err=>{if($('#hub-dialog')?.open)formError(err);else toast(errorText(err),{error:true});});});
  document.addEventListener('input',e=>{if(e.target.closest('#hub-comment-form'))S.dialogDirty=S.detailDirty||!!e.target.value.trim();if(e.target.closest('#hub-detail-form,#hub-new-task,#hub-new-project')){S.dialogDirty=true;S.detailDirty=true;if($('#hub-dirty-label'))$('#hub-dirty-label').textContent='Henüz kaydedilmedi.';}});
  document.addEventListener('change',e=>{const el=e.target;
    if(el.id==='hub-focus-sort'){S.focusSort=el.value;render();return;}
    if(el.id==='hub-scope'){S.scope=el.value;render();}
    if(el.id==='hub-project-filter'){S.project=el.value;window.history.replaceState(null,'',route('tasks',S.project));render();$('#hub-project-filter')?.focus({preventScroll:true});return;}
    if(el.hasAttribute('data-card-status'))setStatus(el.dataset.cardStatus,el.value).catch(err=>toast(errorText(err),{error:true}));
    if(el.hasAttribute('data-step-index')&&S.drawer){S.drawer.steps[Number(el.dataset.stepIndex)].done=el.checked;S.dialogDirty=true;S.detailDirty=true;renderChecklist();}
    if(el.closest('#hub-detail-form,#hub-new-task,#hub-new-project')){S.dialogDirty=true;S.detailDirty=true;}
  });
  document.addEventListener('keydown',e=>{
    if(!S.user)return;const editing=e.target.closest('input,textarea,select,[contenteditable=true]');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();search();return;}
    if($('#hub-dialog')?.open){if($('#hub-dialog').dataset.search==='true'&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const results=$$('#hub-search-results .h-search-result');const index=results.indexOf(document.activeElement),next=e.key==='ArrowDown'?Math.min(results.length-1,index+1):Math.max(0,index-1);results[next]?.focus();}if(e.key==='Enter'&&e.target.id==='hub-step-input'){e.preventDefault();handle('add-step',e.target);}return;}
    if(e.target.closest('#team-dialog[open],#modal[open]'))return;
    if(!editing&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key.toLowerCase()==='n'&&!S.editor){e.preventDefault();newTask();}
    if(!editing&&e.key==='Escape'&&document.body.classList.contains('hub-menu-open')){document.body.classList.remove('hub-menu-open');syncMenu();$('.h-mobile-menu')?.focus();}
  },true);
  document.addEventListener('dragstart',e=>{const el=e.target.closest('[data-drag-key][draggable=true]');if(el){e.dataTransfer.setData('text/dal-task',el.dataset.dragKey);e.dataTransfer.effectAllowed='move';}});
  document.addEventListener('dragover',e=>{const el=e.target.closest('[data-drop-status]');if(el&&[...e.dataTransfer.types].includes('text/dal-task')){e.preventDefault();el.classList.add('dragover');}});
  document.addEventListener('dragleave',e=>{e.target.closest('[data-drop-status]')?.classList.remove('dragover');});
  document.addEventListener('drop',e=>{const el=e.target.closest('[data-drop-status]');if(!el)return;const key=e.dataTransfer.getData('text/dal-task');el.classList.remove('dragover');if(!key)return;e.preventDefault();setStatus(key,el.dataset.dropStatus).catch(err=>toast(errorText(err),{error:true}));});
  document.addEventListener('toggle',e=>{if(e.target.matches?.('.h-owner-workload')&&e.target.isConnected)S.workloadOpen=e.target.open;},true);
  window.addEventListener('beforeunload',e=>{if(S.dialogDirty||S.pending||S.changeInFlight){e.preventDefault();e.returnValue='';}});
  window.addEventListener('offline',()=>toast('Bağlantı kesildi. Kaydedilmemiş değişiklikler varsa sekmeyi kapatmayın.',{error:true}));
  window.DalHub={navigation,start,onEditor,go,refresh,help,search,get state(){return S;},I};
})();
