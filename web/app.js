/* Dal Ekip 3.0 — ortak sunucu modeliyle organizasyon editörü. */
(() => {
  'use strict';
  const C = window.DalCore, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)], E = C.esc;
  const ICONS = {
    hierarchy: '<rect x="8" y="2" width="8" height="6" rx="1.5"/><path d="M12 8v5M4 17v-4h16v4"/><rect x="1" y="17" width="6" height="5" rx="1.3"/><rect x="9" y="17" width="6" height="5" rx="1.3"/><rect x="17" y="17" width="6" height="5" rx="1.3"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
    undo:'<path d="M3 10h11a6 6 0 0 1 0 12M3 10l5-5M3 10l5 5"/>',redo:'<path d="M21 10H10a6 6 0 0 0 0 12M21 10l-5-5M21 10l-5 5"/>',
    'file-plus':'<path d="M13 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10Z"/><path d="M13 2v8h8M8 16h8M12 12v8"/>',
    folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v2"/><path d="M3 8h17a1 1 0 0 1 1 1l-2 11H4L2 9a1 1 0 0 1 1-1Z"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',share:'<path d="M12 15V3m-4 4 4-4 4 4M4 12v9h16v-9"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',layers:'<path d="m12 3 10 5-10 5L2 8Z M2 12l10 5 10-5M2 16l10 5 10-5"/>',
    'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>','arrow-left':'<path d="M20 12H4m6-6-6 6 6 6"/>',
    map:'<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M4 17v-5h16v5"/>',table:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12M3 15h18"/>',
    branch:'<path d="M6 3v12a5 5 0 0 0 5 5h7M6 7h12"/><path d="m15 4 3 3-3 3m0 7 3 3-3 3"/>',link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 4V3H3v13h1"/>',trash:'<path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',maximize:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',fit:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
    sidebar:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M5.5 7h1M5.5 11h1"/>','panel-right':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18M18 7h.1M18 11h.1"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>','chevron-down':'<path d="m5 9 7 7 7-7"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    check:'<path d="m5 12 4 4L19 6"/>','check-square':'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/>',note:'<path d="M14 2H4v20h16V8Z"/><path d="M14 2v6h6M8 12h8M8 16h6"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 2v6M8 2v6M3 11h18"/>',
    'list-plus':'<path d="M4 5h16M4 10h16M4 15h8M4 20h8M18 14v8M14 18h8"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',external:'<path d="M15 3h6v6M10 14 21 3M10 3H3v18h18v-7"/>',move:'<path d="M12 2v20M2 12h20m-13-7 3-3 3 3m-6 14 3 3 3-3M5 9l-3 3 3 3m14-6 3 3-3 3"/>',up:'<path d="m6 14 6-6 6 6"/>',down:'<path d="m6 10 6 6 6-6"/>',print:'<path d="M6 8V2h12v6M6 18H2V8h20v10h-4"/><rect x="6" y="14" width="12" height="8" rx="1"/><path d="M18 11h.01"/>'
  };
  const icon = name => window.DalIcons.render(name,'',ICONS[name] || ICONS.hierarchy);
  const kindIcon = k => ({'Birim':'hierarchy','Kişi':'user','Proje':'layers','Görev':'check-square','Başlık':'note'}[k] || 'hierarchy');
  const fillIcons = (scope = document) => scope.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon)+(el.dataset.action==='toggle-inspector'?'<span>Ayrıntılar</span>':''); });
  const T = window.DalTeam;
  if (!T?.initial?.doc) throw new Error('Önce ekip hesabıyla giriş yapılmalıdır.');
  const initial = C.validate(T.initial.doc), hasSavedView = false;
  let restoreWarning = '';
  const store = new C.Store(initial);

  const nativeChange=store.change.bind(store);
  store.change=(fn,opts={})=>{
    const draft=C.clone(store.doc); fn(draft);
    if(window.DalCollab.diff(store.doc,draft).length && !T.canEdit()) throw new Error('Bu çalışmada düzenleme yetkiniz yok veya kayıt bekletiliyor.');
    return nativeChange(d=>Object.assign(d,draft),opts);
  };
  store.undo=()=>T.undo(); store.redo=()=>T.redo();
  let selected = new URLSearchParams(location.search).get('mode')==='tree'?window.DalTreeModel.initialSelection(store.doc,T.user.id):C.rootNode(store.doc).id, tab = 'card', query = '', viewMode = 'map', relationFrom = null;
  let planHideDone=false,planLimit=100,planComposer=false,planDraft={title:'',owner:'',dueDate:window.DalHubModel.today()};
  const treeDrafts=new Map();
  let treeClosed=new Set(),treeQuery='',treeDetail=false,treeDraft={title:'',kind:'Görev'};
  let workOwner='',workQuery='',workFilter='all',opsDate=window.DalHubModel.today(),opsSelectedDate=opsDate,opsDrag=null;
  const isWorkView=()=>['tree','plan','board','timeline','calendar'].includes(viewMode);
  const initialMode=new URLSearchParams(location.search).get('mode');
  let workProgress = C.branchProgress(store.doc);
  let layout = C.layout(store.doc), camera = { ...store.doc.view }, saveTimer = null, viewTimer = null, persistFailed = false, externalConflict = false;
  let lastManualSave = null, clipboardBranch = null, dragging = null, panning = null, spaceHeld = false, savedSerial = '', miniTransform = null, lastBackupAt = 0;
  let templateChoice = 'blank', modalAction = null, pointerMap = new Map(), pinch = null, eventIgnoreClick = false, keyboardMode = true;
  const canvas = $('#canvas'), world = $('#world');
  function toast(message, type = '') { const el = document.createElement('div'); el.className = 'toast ' + type; el.textContent = message; $('#toast-area').appendChild(el); setTimeout(() => el.remove(), type === 'error' ? 6500 : 3400); }
  function getNode(id = selected) { return store.doc.nodes.find(n => n.id === id); }
  function nChildren(id) { return C.children(store.doc, id); }
  function ensureSelected() { if (!getNode()) selected = C.rootNode(store.doc).id; }
  function change(fn, options = {}) { try { return store.change(fn, options); } catch (e) { toast(e.message || 'İşlem uygulanamadı.', 'error'); return false; } }
  function statusClass(status) { return {'Devam ediyor':'active','Tamamlandı':'done','Beklemede':'wait'}[status] || ''; }
  function initials(name) { const p = name.trim().split(/\s+/); return (p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : ''); }
  function dateLabel(date) { if (!date) return ''; const [y,m,d] = date.split('-'); return d + '.' + m + '.' + y; }
  function normalize(s) { return String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g,'i'); }
  function matches(n) { if (!query) return true; return normalize([n.title,n.owner,n.role,n.description,n.responsibilities,n.goals,n.notes,n.kind,n.status,n.tags.join(' '),n.tasks.map(t=>t.text+' '+t.assignee).join(' ')].join(' ')).includes(normalize(query)); }
  function saveStatus(message = 'Sunucuyla eşitlendi', warning = false) { const el = $('#save-state'); el.classList.toggle('warning', warning); el.innerHTML = '<span class="save-dot"></span>' + E(message); }
  function scheduleSave() { clearTimeout(saveTimer); if (externalConflict) return; saveStatus('Kaydediliyor…'); saveTimer = setTimeout(() => { saveTimer = null; persist(); }, 300); }
  function persist() { T.queue(); return !T.hasPending(); }
  function flushSave() { clearTimeout(saveTimer); clearTimeout(viewTimer); saveTimer = null; persist(); }
  function resetSaveState() { externalConflict = false; persistFailed = false; $('#storage-notice').classList.add('hidden'); lastManualSave = null; }
  store.subscribe((doc, meta) => {
    if (meta.selectId) selected = meta.selectId;
    ensureSelected();
    if (meta.replace) { camera = {...doc.view}; query = ''; $('#search').value = ''; selected = C.rootNode(doc).id; relationFrom = null; tab = 'card'; }
    render(meta);
    scheduleSave();
    if (meta.center) requestAnimationFrame(() => revealSelected());
  });
  function render(meta = {}) {
    const projectOption=$('#workspace-project option:checked');if(projectOption)projectOption.textContent=store.doc.name;
    ensureSelected(); layout = C.layout(store.doc); workProgress = C.branchProgress(store.doc);
    if (document.activeElement !== $('#document-name')) $('#document-name').value = store.doc.name;
    document.title = store.doc.name + ' — Birlikte İyilik';
    T.decorate();
    $('#sample-badge').classList.toggle('hidden', !store.doc.sample);
    const labels = {org:'ORGANİZASYON ŞEMASI',tree:'YATAY HİYERARŞİ',mind:'ZİHİN HARİTASI',radial:'DAİRESEL ŞEMA',pyramid:'PİRAMİT ŞEMA',matrix:'MATRİS ŞEMA'};
    $('#canvas-label').textContent = viewMode === 'table' ? 'ORGANİZASYON TABLOSU' : labels[store.doc.settings.layout];
    const visible = layout.positions.size, all = store.doc.nodes.length;
    $('#canvas-meta').textContent = query ? `${store.doc.nodes.filter(matches).length} eşleşen kart · ${all} toplam` : `${all} kart · Ayrıntılar için bir karta tıkla${store.doc.settings.layout==='matrix'&&store.doc.relations.length?' · Kesikli çizgi: çapraz bağ':''}${visible < all ? ' · ' + (all-visible) + ' kapalı dalda' : ''}`;
    const overall = workProgress.get(C.rootNode(store.doc).id), assigned = store.doc.nodes.filter(n => n.owner.trim()).length;
    $('#side-metrics').innerHTML = `<div><strong>${all}</strong><span>toplam kart</span></div><div><strong>${assigned}</strong><span>atanan kart</span></div><div><strong>${overall.done}<span>/${overall.total}</span></strong><span>tamamlanan iş</span></div>`;
    $$('[data-layout]').forEach(b => b.classList.toggle('active', b.dataset.layout === store.doc.settings.layout));
    canvas.classList.toggle('no-grid', !store.doc.settings.grid);
    canvas.classList.toggle('connecting', !!relationFrom); $('#relation-banner').classList.toggle('hidden', !relationFrom);
    if(!isWorkView()){renderOutline();renderCanvas();}else renderWorkPlan();
    if (viewMode === 'table') renderTable();
    if (!meta.skipInspector) renderInspector();
    $('#status-left').textContent = 'Seçili: ' + getNode().title + (getNode().parentId ? ' · ' + C.ancestors(store.doc, selected).length + '. seviye' : ' · Kök kart');
    if(!isWorkView())updateCamera(false);
    T.decorate();
  }
  function renderOutline() {
    const el = $('#outline'), scroll = el.scrollTop;
    let rows = C.ordered(store.doc, !query); if(query) rows = C.ordered(store.doc).filter(({node})=>matches(node));
    el.innerHTML = rows.length ? rows.map(({node:n, depth}) => {
      const count = nChildren(n.id).length;
      return `<div class="outline-row ${n.id===selected?'selected':''} ${query?'search-result':''}" data-tree-id="${E(n.id)}" role="treeitem" aria-level="${depth+1}" aria-selected="${n.id===selected}"${count?` aria-expanded="${!n.collapsed}"`:''} tabindex="-1" style="padding-left:${6 + Math.min(depth,9)*12}px" title="${E(n.title)}">${count?`<button class="tree-toggle" data-action="toggle-node" data-id="${E(n.id)}" aria-label="${n.collapsed?'Dalı aç':'Dalı kapat'}">${icon(n.collapsed?'chevron':'chevron-down')}</button>`:'<span class="tree-spacer"></span>'}<span class="tree-dot" style="background:${n.color}"></span><span class="tree-text">${E(n.title)}${query&&n.owner?`<span class="result-sub">${E(n.owner)}</span>`:''}</span>${count?`<span class="tree-count">${count}</span>`:''}</div>`;
    }).join('') : '<div class="empty-search">Eşleşen kart bulunamadı.<br>Başlık, sorumlu, görev veya notlarda arayabilirsiniz.</div>';
    el.scrollTop = scroll;
  }
  function progressLabel(value) { return value.total ? '%' + value.percent + ' tamamlandı · ' + value.done + ' / ' + value.total + ' iş' : 'Henüz iş yok'; }
  function nodeProgress(n, context='card') {
    const value=workProgress.get(n.id), key='org:'+store.doc.id+':'+context+':'+n.id;
    if(!value.total)return '<div class="node-progress empty"><span>Henüz iş yok</span></div>';
    return `<div class="node-progress ${value.done===value.total?'complete':''}" title="Bu kartın ve alt kartlarının işleri"><div class="node-progress-meta"><strong data-progress-number="${E(key)}" aria-hidden="true">%${value.percent}</strong><span>${value.done} / ${value.total} iş tamamlandı</span></div><div class="node-progress-track" role="progressbar" aria-label="${E(n.title)} işlerinin tamamlanma oranı" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value.percent}" aria-valuetext="${E(progressLabel(value))}" data-progress-key="${E(key)}" data-progress-value="${value.percent}"><span style="transform:scaleX(${value.percent/100})"></span></div></div>`;
  }
  function renderCanvas() {
    const codes = new Map(C.ordered(store.doc).map(({node,code})=>[node.id,code]));
    $('#nodes').innerHTML = [...layout.positions].map(([id,p]) => {
      const n = getNode(id), count = nChildren(id).length, hasText = !!(n.notes || n.description || n.responsibilities || n.goals), taskDone = n.tasks.filter(t=>t.done).length;
      return `<div class="org-card ${id===selected?'selected':''} ${query?(matches(n)?'hit':'dimmed'):''}" data-node-id="${E(id)}" style="transform:translate(${p.x}px,${p.y}px);--node-color:${n.color}" role="button" tabindex="-1" aria-label="${E(n.title)}, ${E(n.kind)}, ${E(n.owner || 'sorumlu atanmadı')}, ${E(n.status)}${count?', '+count+' alt kart':''}, ${E(progressLabel(workProgress.get(id)))}" aria-pressed="${id===selected}" title="${E(n.title + (n.role?' — '+n.role:''))}"><div class="card-inner"><div class="card-top"><span class="type-badge">${icon(kindIcon(n.kind))}${E(n.kind)}</span><span class="card-code">${E(codes.get(id) || 'ANA YAPI')}</span></div><h3 class="card-title">${E(n.title)}</h3><p class="card-role">${E(n.role || (n.kind==='Kişi'?'Görev ve rol tanımlayın':'Amaç ve sorumlulukları tanımlayın'))}</p><div class="card-footer"><div class="card-owner"><span class="avatar">${n.owner?E(initials(n.owner).toLocaleUpperCase('tr-TR')):icon('user')}</span><span>${E(n.owner || 'Sorumlu atanmadı')}</span></div><div class="card-indicators">${hasText?`<span class="card-indicator" title="Ayrıntılı notlar var">${icon('note')}</span>`:''}${n.tasks.length?`<span class="card-indicator" title="Tamamlanan / toplam iş">${icon('check-square')}${taskDone}/${n.tasks.length}</span>`:''}<span class="status-dot ${statusClass(n.status)}" title="${E(n.status)}"></span></div></div>${nodeProgress(n)}</div>${count?`<button class="card-fold" data-action="toggle-node" data-id="${E(id)}" title="${n.collapsed?'Dalı aç':'Dalı kapat'} (${count} doğrudan alt kart)" aria-label="${E(n.title)} dalını ${n.collapsed?'aç':'kapat'}">${n.collapsed?String(C.descendants(store.doc,id,false).length):icon('minus')}</button>`:''}</div>`;
    }).join('');
    renderEdges();
  }
  function renderEdges(pos = layout.positions) {
    const defs = '<defs><marker id="relation-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="#ab8fc6" stroke-width="1"/></marker></defs>';
    const paths = layout.edges.map(edge => { const target = getNode(edge.to); return `<path d="${C.edgePath(edge,pos)}" fill="none" stroke="${target.color}" stroke-opacity=".3" stroke-width="1.5"/>`; }).join('');
    const rels = store.doc.relations.map(r=>{ const g=C.relationGeometry(r,pos); if(!g) return ''; const label = r.label.length>26?r.label.slice(0,25)+'…':r.label; const width=Math.min(190, label.length*5.7+18);return `<g><path d="${g.path}" fill="none" stroke="#ab8fc6" stroke-width="1.5" stroke-dasharray="5 5" marker-end="url(#relation-arrow)"/><rect x="${g.x-width/2}" y="${g.y-11}" width="${width}" height="20" rx="5" fill="#faf7ff" stroke="#eadff3"/><text x="${g.x}" y="${g.y+2}" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#9a80b3">${E(label)}</text></g>`;}).join('');
    const guides=layout.guides.map(g=>`<circle cx="${g.x}" cy="${g.y}" r="${g.radius}" fill="none" stroke="#9eb9bf" stroke-width="2" stroke-dasharray="10 8"/>`).join('');
    $('#edges').innerHTML = defs + guides + paths + rels;
  }
  function updateCamera(saveView = true) {
    world.style.transform = `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
    $('#zoom-value').textContent = (camera.scale<.1?(camera.scale*100).toFixed(1):Math.round(camera.scale*100))+'%';
    const step = Math.max(4,20*camera.scale); canvas.style.backgroundSize=`${step}px ${step}px`; canvas.style.backgroundPosition=`${camera.x}px ${camera.y}px`;
    renderMinimap();
    if(saveView) { clearTimeout(viewTimer); viewTimer=setTimeout(()=>{store.doc.view={...camera};persist();},700); }
  }
  function fit() {
    const rect=canvas.getBoundingClientRect(), b=layout.bounds; if(rect.width<20 || rect.height<20) return;
    const top=94,bottom=78,side=32; camera.scale=Math.max(.001,Math.min(1.15,(rect.width-side*2)/Math.max(1,b.w),(rect.height-top-bottom)/Math.max(1,b.h)));
    camera.x=(rect.width-b.w*camera.scale)/2-b.x*camera.scale;
    camera.y=top+(Math.max(80,rect.height-top-bottom)-b.h*camera.scale)/2-b.y*camera.scale; updateCamera();
  }
  function readableView() {
    const r=canvas.getBoundingClientRect(),p=layout.positions.get(selected);if(!p||r.width<20)return;
    camera.scale=Math.min(1,Math.max(.78,(r.width-44)/(C.W*2+44)));
    camera.x=r.width/2-(p.x+p.w/2)*camera.scale;
    camera.y=selected===C.rootNode(store.doc).id?88-p.y*camera.scale:Math.max(100,(r.height-90)/2)-p.y*camera.scale;
    updateCamera();
  }
  function zoomAt(factor, clientX, clientY, absolute = false) {
    const r=canvas.getBoundingClientRect(), x=clientX==null?r.width/2:clientX-r.left,y=clientY==null?r.height/2:clientY-r.top;
    const before=camera.scale,newScale=Math.max(.001,Math.min(2.5,absolute?factor:before*factor));
    camera.x=x-(x-camera.x)*newScale/before;camera.y=y-(y-camera.y)*newScale/before;camera.scale=newScale;updateCamera();
  }
  function revealSelected(forceCenter=false) { const p=layout.positions.get(selected); if(!p)return;const r=canvas.getBoundingClientRect(),x=camera.x+p.x*camera.scale,y=camera.y+p.y*camera.scale;
    if(forceCenter || x<12 || x+p.w*camera.scale>r.width-12 || y<74 || y+p.h*camera.scale>r.height-80){camera.x=r.width/2-(p.x+p.w/2)*camera.scale;camera.y=(r.height+70)/2-(p.y+p.h/2)*camera.scale;updateCamera();}
  }
  function renderMinimap(){ const el=$('#minimap'),b=layout.bounds,r=canvas.getBoundingClientRect(),pad=9; const s=Math.min((168-pad*2)/Math.max(b.w,1),(94-pad*2)/Math.max(b.h,1)),ox=(168-b.w*s)/2-b.x*s,oy=(94-b.h*s)/2-b.y*s;miniTransform={s,ox,oy};
    let output=[...layout.positions].map(([id,p])=>`<rect x="${p.x*s+ox}" y="${p.y*s+oy}" width="${Math.max(3,p.w*s)}" height="${Math.max(2,p.h*s)}" rx="1.3" fill="${getNode(id).color}" fill-opacity="${id===selected ? .6 : .23}"/>`).join('');
    output+=`<rect x="${(-camera.x/camera.scale)*s+ox}" y="${(-camera.y/camera.scale)*s+oy}" width="${r.width/camera.scale*s}" height="${r.height/camera.scale*s}" rx="3" fill="#6154d9" fill-opacity=".025" stroke="#bdb1e6" stroke-width=".8"/>`;el.innerHTML=output;
  }
  function selectNode(id, reveal=false, openPanel=false, suppressPanel=false) {
    if(!getNode(id))return;
    if(id===selected&&!relationFrom){if(!suppressPanel&&(openPanel||window.innerWidth<=760||window.DalHub)){document.body.classList.remove('inspector-hidden');if(!isWorkView()&&camera.scale<.65)readableView();}if(reveal)revealSelected();return;}
    if(relationFrom && id!==relationFrom){ const from=relationFrom;relationFrom=null;render();openRelationDialog(from,id);return; }
    selected=id;
    const hidden=C.ancestors(store.doc,id).some(i=>getNode(i).collapsed);
    if(hidden)change(d=>{C.ancestors(d,id).forEach(i=>d.nodes.find(n=>n.id===i).collapsed=false);});else render();
    if(!suppressPanel&&(openPanel || window.innerWidth<=760 || window.DalHub)){document.body.classList.remove('inspector-hidden');if(!isWorkView()&&camera.scale<.65)readableView();}
    if(reveal)revealSelected();
  }
  function options(items,value){return items.map(v=>`<option value="${E(v)}" ${v===value?'selected':''}>${E(v==='Planlandı'?'Yapılacak':v)}</option>`).join('');}
  function field(label,key,value,extra=''){return `<label class="field"><span>${E(label)}</span><input data-field="${key}" value="${E(value)}" ${extra}></label>`;}
  function area(label,key,value,placeholder='',min=80){return `<label class="field"><span>${E(label)}</span><textarea data-field="${key}" style="min-height:${min}px" placeholder="${E(placeholder)}" maxlength="${key==='notes'?100000:20000}">${E(value)}</textarea></label>`;}
  function renderInspector(){
    const n=getNode(),direct=nChildren(n.id).length,total=C.descendants(store.doc,n.id,false).length;
    const parts={card:'Genel',tasks:'Adımlar',notes:'Notlar',relations:'Bağlantılar'};
    $('#inspector-content').innerHTML=`<div class="inspector-header"><div class="inspector-label">KART AYRINTILARI<button class="icon-button small" data-action="toggle-inspector" aria-label="Ayrıntı panelini kapat" title="Paneli kapat">${icon('close')}</button></div><div class="inspector-identity"><div class="identity-icon" style="color:${n.color};background:${n.color}10">${icon(kindIcon(n.kind))}</div><div class="identity-copy"><h2 title="${E(n.title)}">${E(n.title)}</h2><p>${n.parentId?E(n.kind)+' · '+C.ancestors(store.doc,n.id).length+'. seviye':'Kök kart · Tüm yapının başlangıcı'}</p></div></div></div><div class="inspector-tabs" role="tablist" aria-label="Ayrıntı bölümleri">${Object.entries(parts).map(([key,label])=>`<button class="${tab===key?'active':''}" data-inspector-tab="${key}" role="tab" aria-selected="${tab===key}">${label}${key==='tasks'&&n.tasks.length?' ('+n.tasks.length+')':''}</button>`).join('')}</div><div class="inspector-scroll" id="inspector-scroll">${tab==='card'?cardFields(n):tab==='tasks'?taskFields(n):tab==='notes'?noteFields(n):relationFields(n)}</div><div class="inspector-bottom">${n.parentId!==null&&T.canEdit()?`<button class="button task-delete" data-action="delete">${icon('trash')}${n.kind==='Görev'?'İşi sil':'Kartı sil'}</button>`:`<span>${direct} doğrudan · ${total} toplam alt kart</span>`}<button class="button secondary" data-action="add-child">${icon('plus')}Alt kart</button></div>`;
    T.decorate();
  }
  function cardFields(n){
    const parent=getNode(n.parentId),isTask=n.kind==='Görev';
    return `<p class="editor-save-hint">${icon('checkCircle')}Değişikliklerin otomatik kaydedilir.</p><section class="inspector-work-progress" aria-label="Kartın iş ilerlemesi">${nodeProgress(n,'inspector')}<p>Bu kartın ve alt kartlarının işlerinden hesaplanır.</p></section>${field(isTask?'Ne yapılacak?':'Başlık','title',n.title,'maxlength="250" placeholder="Kısa ve anlaşılır bir başlık"')}${n.owner&&!n.ownerUserId?field('Sorumlu adı','owner',n.owner,'maxlength="250" placeholder="Sorumlu kişinin adı"'):''}${n.owner&&!n.ownerUserId?'':T.ownerField(n)}<div class="field-row"><label class="field"><span>Durum</span><select data-field="status">${options(C.STATUSES,n.status)}</select></label>${field('Son tarih','dueDate',n.dueDate,'type="date"')}</div>${field('Kısa açıklama','role',n.role,'maxlength="500" placeholder="Beklenen sonuç veya rol"')}<details class="editor-advanced"><summary>Diğer ayrıntılar ve görünüm</summary><div>${n.owner&&!n.ownerUserId?T.ownerField(n):''}<div class="field-row"><label class="field"><span>Kart türü</span><select data-field="kind">${options(C.KINDS,n.kind)}</select></label><label class="field"><span>Öncelik</span><select data-field="priority">${options(C.PRIORITIES,n.priority)}</select></label></div>${n.ownerUserId||!n.owner?field('Sorumlu adı','owner',n.owner,'maxlength="250" placeholder="İsteğe bağlı"'):''}<div class="progress-field"><div class="range-head"><span>İlerleme <span style="font-weight:400">(manuel)</span></span><output id="progress-output">%${n.progress}</output></div><div class="range-wrap"><input type="range" min="0" max="100" step="5" value="${n.progress}" data-field="progress" aria-label="İlerleme yüzdesi"></div><div class="range-label"><span>Başlangıç</span><span>Tamamlandı</span></div></div>${field('Etiketler','tags',n.tags.join(', '),'maxlength="3000" placeholder="Eğitim, gönüllü, öncelikli…"')}<div class="section-rule"></div><div class="small-heading">DAL GÖRÜNÜMÜ</div><div class="color-options">${C.COLORS.map(c=>`<button class="color-option ${c===n.color?'active':''}" data-color="${c}" style="background:${c}" aria-label="Dal rengi ${c}" aria-pressed="${c===n.color}"></button>`).join('')}<label class="color-custom" title="Özel renk"><input type="color" data-field="color" value="${n.color}" aria-label="Özel dal rengi"></label></div><button class="text-button apply-color" data-action="color-branch">Bu rengi tüm alt dallara uygula</button><div class="section-rule"></div><div class="small-heading">HİYERARŞİ</div>${parent?`<div class="parent-nav"><button data-action="select-parent" title="${E(parent.title)}">Üst: ${E(parent.title)}</button><button data-action="move-dialog" title="Başka bir üst karta taşı">${icon('move')}</button></div><div style="display:flex;gap:8px;margin-top:8px"><button class="button secondary" style="font-size:10px;min-height:29px;padding:5px 8px" data-action="order-up">${icon('up')}Sırada yukarı</button><button class="button secondary" style="font-size:10px;min-height:29px;padding:5px 8px" data-action="order-down">${icon('down')}Sırada aşağı</button></div>`:'<p class="small-note">Bu kök karttır. Başlığını değiştirebilir; altına yeni birimler, kişiler ve projeler ekleyebilirsiniz.</p>'}<div class="section-rule"></div><div class="small-heading">İLETİŞİM</div>${field('E-posta','email',n.email,'type="email" maxlength="320" placeholder="ornek@kurum.org"')}${field('Telefon','phone',n.phone,'type="tel" maxlength="80" placeholder="İsteğe bağlı"')}</div></details>`;
  }
  function taskFields(n){const done=n.tasks.filter(t=>t.done).length,pct=n.tasks.length?Math.round(done/n.tasks.length*100):0;return `<div class="task-summary"><strong>${done}<span style="font-size:14px;color:#aaa0be"> / ${n.tasks.length}</span></strong><span>iş tamamlandı</span><div class="task-bar"><i style="width:${pct}%"></i></div></div><p class="small-note" style="margin:-8px 0 13px">İş listesinin oranı, kartın manuel ilerleme yüzdesinden bağımsızdır.</p><form id="task-form" class="task-entry"><input class="inline-input" id="new-task" placeholder="Yeni bir iş ekleyin…" aria-label="Yeni iş başlığı" maxlength="1000" required><button class="button primary" type="submit" aria-label="İş ekle">${icon('plus')}</button></form>${n.tasks.length?n.tasks.map(t=>`<div class="task-card" data-task-id="${E(t.id)}"><div class="task-top"><input type="checkbox" class="task-check" data-task-field="done" ${t.done?'checked':''} aria-label="${E(t.text)} tamamlandı"><textarea class="task-text ${t.done?'done':''}" rows="1" data-task-field="text" maxlength="1000" aria-label="İş başlığı">${E(t.text)}</textarea><button class="icon-button danger-hover" data-action="delete-task" data-id="${E(t.id)}" title="İşi sil" aria-label="İşi sil">${icon('close')}</button></div><div class="task-account">${T.taskOwnerField(t)}</div><div class="task-meta"><input data-task-field="assignee" value="${E(t.assignee)}" placeholder="Sorumlu kişi" aria-label="İşin sorumlusu" maxlength="250"><input type="date" data-task-field="dueDate" value="${E(t.dueDate)}" aria-label="İşin son tarihi"></div></div>`).join(''):`<div class="empty-state"><span>${icon('check-square')}</span>Bu kartın somut işlerini buraya yazın.<br>Her işe ayrı sorumlu ve tarih ekleyebilirsiniz.</div>`}`;}
  function noteFields(n){return `${area('Amaç / açıklama','description',n.description,'Bu birim veya proje neden var?',95)}${area('Görev ve sorumluluklar','responsibilities',n.responsibilities,'Her sorumluluğu ayrı satıra yazabilirsiniz.',110)}${area('Hedefler / beklenen çıktılar','goals',n.goals,'Başarıyı hangi somut çıktılarla izleyeceksiniz?',95)}${area('Çalışma notları','notes',n.notes,'Toplantı notları, kararlar, açık sorular…',150)}<div class="section-rule"></div><div class="small-heading">KAYNAK & BELGE BAĞLANTILARI</div><p class="small-note">Dosya yüklenmez; bağlantı adresi saklanır. Bağlantıyı açmak internet gerektirebilir.</p><form id="link-form" style="margin-top:12px"><label class="field"><span>Bağlantı adı</span><input id="link-label" maxlength="250" placeholder="Örn. görev tanımı belgesi"></label><label class="field"><span>Adres</span><input id="link-url" type="url" required maxlength="2048" placeholder="https://…"></label><button class="button secondary" type="submit">${icon('link')}Bağlantı ekle</button><p class="small-note" id="link-error"></p></form><div class="link-list">${n.links.map(l=>`<div class="link-item">${icon('external')}<a href="${E(l.url)}" target="_blank" rel="noopener noreferrer">${E(l.label)}</a><button class="icon-button danger-hover" data-action="delete-link" data-id="${E(l.id)}" aria-label="Bağlantıyı sil">${icon('close')}</button></div>`).join('')}</div>`;}
  function relationFields(n){const related=store.doc.relations.filter(r=>r.from===n.id||r.to===n.id);return `<p class="small-note" style="margin:0 0 16px">Düz çizgiler hiyerarşiyi, kesik çizgiler birimler arası iş birliği veya danışmanlığı gösterir. Çapraz ilişki, üst birimi değiştirmez.</p><form id="relation-form" class="relation-fields"><label class="field" style="margin:0"><span>Bağlanacak kart</span><select id="relation-target" aria-label="İlişki hedefi" required><option value="">Kart seçin…</option>${C.ordered(store.doc).filter(({node})=>node.id!==n.id).map(({node,code})=>`<option value="${E(node.id)}">${E((code?code+' ':'')+node.title)}</option>`).join('')}</select></label><label class="field" style="margin:0"><span>İlişkinin adı</span><input id="relation-label" maxlength="250" value="İş birliği" required></label><button class="button secondary" type="submit">${icon('link')}Çapraz ilişki ekle</button></form><div class="section-rule"></div><div class="small-heading">BU KARTIN İLİŞKİLERİ (${related.length})</div>${related.length?related.map(r=>{const outgoing=r.from===n.id,other=getNode(outgoing?r.to:r.from);return `<div class="relation-item"><div><strong>${outgoing?'→':'←'} ${E(other.title)}</strong><p>${E(r.label)}</p></div><button class="icon-button small danger-hover" data-action="delete-relation" data-id="${E(r.id)}" aria-label="İlişkiyi sil">${icon('close')}</button></div>`;}).join(''):'<div class="empty-state">Henüz çapraz ilişki yok.</div>'}`;}
  function renderTable(){const rows=C.ordered(store.doc).filter(({node})=>matches(node));$('#table-view').innerHTML=rows.length?`<p class="table-scroll-hint">Diğer sütunlar için yana kaydırın</p><table class="data-table"><thead><tr><th>Kart / birim</th><th>Tür</th><th>Sorumlu</th><th>Üst kart</th><th>Durum</th><th>İş ilerlemesi</th><th>Son tarih</th><th>İşler</th></tr></thead><tbody>${rows.map(({node:n,code})=>`<tr data-tree-id="${E(n.id)}" class="${n.id===selected?'selected':''}" tabindex="0" aria-label="${E(n.title)} ayrıntılarını aç"><td class="table-title"><span class="table-dot" style="background:${n.color}"></span>${E(n.title)}<small>${E(code||'Kök')}${n.role?' · '+E(n.role):''}</small></td><td>${E(n.kind)}</td><td>${E(n.owner||'—')}</td><td>${E(getNode(n.parentId)?.title||'—')}</td><td><span class="table-status">${E(n.status)}</span></td><td>${nodeProgress(n,'table')}</td><td>${dateLabel(n.dueDate)||'—'}</td><td>${n.tasks.filter(t=>t.done).length}/${n.tasks.length}</td></tr>`).join('')}</tbody></table>`:'<div class="table-empty">Aramanızla eşleşen kart yok.</div>';}
  function showModal(title, subtitle, body, footer, callback=null){
    const modal=$('#modal'); if(modal.open)modal.close();
    $('#modal-content').innerHTML=`<div class="modal-head"><div><h2 id="modal-title">${E(title)}</h2>${subtitle?`<p>${E(subtitle)}</p>`:''}</div><button class="icon-button" data-action="close-modal" aria-label="Pencereyi kapat">${icon('close')}</button></div><div class="modal-body">${body}</div><div class="modal-footer">${footer||'<button class="button primary" data-action="close-modal">Tamam</button>'}</div>`;
    modalAction=callback;modal.showModal();
  }
  function closeModal(){ $('#modal').close(); modalAction=null; }
  function confirmModal(title, message, callback, danger=false, confirmText='Onayla'){
    showModal(title,'',`<p style="color:#91869e;line-height:1.8">${E(message)}</p>`,`<button class="button secondary" data-action="close-modal">Vazgeç</button><button class="button ${danger?'danger':'primary'}" data-action="confirm-modal">${E(confirmText)}</button>`,()=>{closeModal();callback();});
  }
  function modalError(message){let el=$('#modal-error');if(!el){el=document.createElement('div');el.id='modal-error';el.className='modal-error';$('#modal .modal-body').appendChild(el);}el.textContent=message;}
  function focusTitle(){document.body.classList.remove('inspector-hidden');if(document.body.classList.contains('focus-mode')){renameDialog();return;}requestAnimationFrame(()=>{const input=$('[data-field="title"]');if(input){input.focus();input.select();}});}
  function addChild(sibling=false){
    tab='card';
    const n=getNode(),parent=sibling&&n.parentId?n.parentId:selected,meta={center:true};
    if(change(d=>{meta.selectId=C.addNode(d,parent,{kind:sibling?n.kind:'Birim'});},meta))focusTitle();
  }
  function duplicateSelected(){const meta={center:true};if(change(d=>{meta.selectId=C.duplicate(d,selected);},meta)){toast('Dal, alt kartlarıyla birlikte kopyalandı.');revealSelected();}}
  function deleteSelected(){const n=getNode();if(n.parentId===null){toast('Kök kart silinemez. Boş bir şema için Yeni düğmesini kullanın.');return;}const count=C.descendants(store.doc,selected).length,id=selected;confirmModal('Bu dal silinsin mi?',`“${n.title}”${count>1?' ve '+(count-1)+' alt kartı':''} silinecek. İlgili çapraz bağlantılar da kaldırılır. Bu işlemi Geri al ile geri çevirebilirsiniz.`,()=>{const meta={};change(d=>{meta.selectId=C.remove(d,id);},meta);toast(count+' kart silindi. Geri al ile geri getirebilirsiniz.');},true,'Dalı sil');}
  function copyBranch(){const ids=new Set(C.descendants(store.doc,selected));clipboardBranch=C.clone(store.doc);clipboardBranch.nodes=clipboardBranch.nodes.filter(n=>ids.has(n.id));clipboardBranch.nodes.find(n=>n.id===selected).parentId=null;clipboardBranch.relations=clipboardBranch.relations.filter(r=>ids.has(r.from)&&ids.has(r.to));toast(ids.size+' kartlık dal uygulama panosuna kopyalandı. Hedef kartı seçip Ctrl/⌘ V ile yapıştırın.');}
  function pasteBranch(){if(!clipboardBranch){toast('Önce bir dalı Ctrl/⌘ C ile kopyalayın.');return;}const parent=selected,meta={center:true};change(d=>{
    const copy=C.clone(clipboardBranch),sourceId=C.rootNode(copy).id,mapping=new Map(copy.nodes.map(n=>[n.id,C.uid()]));
    if(d.nodes.length+copy.nodes.length>C.MAX_NODES)throw new Error('Kart sınırı aşılır.');
    const maxOrder=Math.max(-1,...C.children(d,parent).map(n=>n.order));
    copy.nodes.forEach(n=>{const old=n.id;n.id=mapping.get(old);n.parentId=old===sourceId?parent:mapping.get(n.parentId);n.offsetX=n.offsetY=0;if(old===sourceId)n.order=maxOrder+1;n.tasks.forEach(t=>t.id=C.uid('t'));n.links.forEach(l=>l.id=C.uid('l'));});
    copy.relations.forEach(r=>{r.id=C.uid('r');r.from=mapping.get(r.from);r.to=mapping.get(r.to);});
    d.nodes.push(...copy.nodes);d.relations.push(...copy.relations);d.nodes.find(n=>n.id===parent).collapsed=false;C.validate(d);meta.selectId=mapping.get(sourceId);
  },meta);}
  function renameDialog(){const n=getNode(),id=n.id;showModal('Kartı yeniden adlandır','',`<label class="field"><span>Kart başlığı</span><input id="rename-input" maxlength="250" value="${E(n.title)}" autofocus></label>`,`<button class="button secondary" data-action="close-modal">Vazgeç</button><button class="button primary" data-action="confirm-modal">Uygula</button>`,()=>{const value=$('#rename-input').value.trim();if(!value){modalError('Bir başlık yazın.');return;}change(d=>d.nodes.find(n=>n.id===id).title=value);closeModal();canvas.focus();});requestAnimationFrame(()=>$('#rename-input')?.select());}
  function moveDialog(){const n=getNode();if(!n.parentId){toast('Kök kart başka bir karta bağlanamaz.');return;}const id=n.id;showModal('Dalı başka birime taşı','Alt kartlar ve bütün ayrıntılar korunur.',`<label class="field"><span>Yeni üst kart</span><select id="move-parent">${C.ordered(store.doc).filter(({node})=>C.canReparent(store.doc,id,node.id)).map(({node,code})=>`<option value="${E(node.id)}" ${node.id===n.parentId?'selected':''}>${E((code?code+' ':'')+node.title)}</option>`).join('')}</select></label>`,`<button class="button secondary" data-action="close-modal">Vazgeç</button><button class="button primary" data-action="confirm-modal">Taşı</button>`,()=>{const parent=$('#move-parent').value;if(change(d=>C.reparent(d,id,parent),{center:true})){closeModal();toast('Dal yeni üst karta taşındı.');}});}
  function addRelation(from,to,label){if(!from||!to||from===to)throw new Error('İki farklı kart seçin.');if(!getNode(from)||!getNode(to))throw new Error('Kart bulunamadı.');if(store.doc.relations.some(r=>r.from===from&&r.to===to))throw new Error('Bu yönde zaten bir ilişki var. Önce mevcut ilişkiyi kaldırabilirsiniz.');if(store.doc.relations.length>=5000)throw new Error('İlişki sınırı aşıldı.');const clean=label.trim().slice(0,250);if(!clean)throw new Error('İlişki adını yazın.');change(d=>d.relations.push({id:C.uid('r'),from,to,label:clean}));}
  function openRelationDialog(from,to){showModal('Çapraz ilişki ekle',getNode(from).title+' → '+getNode(to).title,`<label class="field"><span>İlişki adı</span><input id="cross-label" maxlength="250" value="İş birliği" autofocus></label><p class="small-note">Kesik çizgi oluşturulur; kartların hiyerarşik bağlılığı değişmez.</p>`,`<button class="button secondary" data-action="close-modal">Vazgeç</button><button class="button primary" data-action="confirm-modal">İlişkiyi ekle</button>`,()=>{try{addRelation(from,to,$('#cross-label').value);closeModal();toast('Çapraz ilişki eklendi.');}catch(e){modalError(e.message);}});}
  function templatePreview(type){if(type==='blank')return '<svg viewBox="0 0 150 55"><rect x="51" y="16" width="48" height="25" rx="5" fill="#eee9fc" stroke="#b2a3de"/><path d="M75 22v13M69 28.5h12" stroke="#a391d2" stroke-width="1.5"/></svg>';return '<svg viewBox="0 0 150 55"><path d="M75 17v11M24 39V28h102v11M75 28v11" stroke="#d2c8e9" fill="none"/><rect x="54" y="1" width="42" height="19" rx="4" fill="#e9e3f9" stroke="#b8a7df"/><rect x="5" y="36" width="38" height="16" rx="3" fill="#e5f0ec" stroke="#a8c8ba"/><rect x="56" y="36" width="38" height="16" rx="3" fill="#e3edf6" stroke="#aac0d6"/><rect x="107" y="36" width="38" height="16" rx="3" fill="#f9efdd" stroke="#d6c298"/></svg>';}
  function newDialog(){T.newBoard();}
  function archiveRecovery(){}
  function bulkDialog(){const parent=selected;showModal('Metinden bir yapı oluşturun','Her satır bir kart. Alt seviye için iki boşluk veya bir Tab kullanın.',`<p class="small-note" style="margin:0 0 12px">Yeni kartlar “${E(getNode(parent).title)}” altına eklenir. İlk satırın girintisi başlangıç kabul edilir.</p><label class="field"><span>Hiyerarşik metin</span><textarea class="mono-area" id="bulk-text" spellcheck="false" maxlength="1000000" placeholder="Eğitim Birimi&#10;  Program Tasarımı&#10;  Eğitmen Koordinasyonu&#10;Dijital Birim&#10;  Web Sitesi&#10;  İçerik Üretimi"></textarea></label><p class="small-note">Hiyerarşiyi değiştirmeden önce mevcut kartlarınızı koruyun: bu işlem silmez, yalnızca ekler.</p>`,`<button class="button secondary" data-action="close-modal">Vazgeç</button><button class="button primary" data-action="confirm-modal">Kartları ekle</button>`,()=>{const text=$('#bulk-text').value;let count=0;try{const meta={};store.change(d=>{const ids=C.importOutline(d,parent,text);count=ids.length;meta.selectId=ids[0];},meta);closeModal();fit();toast(count+' kart metinden oluşturuldu.');}catch(e){modalError(e.message);}});}
  function renderTree(){
    const el=$('#work-plan-view'),active=document.activeElement,focus=el.contains(active)?{id:active.id,field:active.dataset.treeField,node:active.dataset.planNode,task:active.dataset.planTask,scope:active.closest('.tw-tree')?'.tw-tree':'.tw-detail',start:active.selectionStart,end:active.selectionEnd}:null;
    const left=el.querySelector('.tw-tree-scroll')?.scrollTop||0,right=el.querySelector('.tw-detail')?.scrollTop||0,expanded=el.querySelector('.tw-subwork[open]')?.dataset.node;
    el.innerHTML=window.DalTreeView.render(store.doc,{selected,editable:T.canEdit(),members:T.initial.members,boards:window.DalHub.state.data?.boards||[],boardId:T.initial.id,closed:treeClosed,query:treeQuery,detail:treeDetail,draft:treeDraft});
    el.querySelector('.tw-tree-scroll').scrollTop=left;el.querySelector('.tw-detail').scrollTop=right;if(expanded===selected)el.querySelector('.tw-subwork')?.setAttribute('open','');
    if(focus){const next=focus.id?document.getElementById(focus.id):focus.field?el.querySelector('[data-tree-field="'+focus.field+'"]'):focus.node?el.querySelector(focus.scope+' [data-plan-node="'+CSS.escape(focus.node)+'"]'+(focus.task?'[data-plan-task="'+CSS.escape(focus.task)+'"]':':not([data-plan-task])')):null;if(next&&!next.disabled){next.focus({preventScroll:true});if(['text','search','textarea'].includes(next.type)&&focus.start!==null)next.setSelectionRange(focus.start,focus.end);}}
  }
  function newTreeWork(){
    if(!T.canEdit())return;
    const current=getNode();let group=current;while(group.kind==='Görev'&&group.parentId)group=getNode(group.parentId);const parent=group.id;
    showModal('Yeni iş','Bu projeye yapılacak bir iş ekleyin.',`<label class="field"><span>Ne yapılacak?</span><input id="quick-work-title" maxlength="250" placeholder="İşin adını yazın" autofocus></label><div class="field-row"><label class="field"><span>Sorumlu</span><select id="quick-work-owner"><option value="">Sonra belirle</option>${T.initial.members.filter(m=>m.active!==false).map(m=>`<option value="${E(m.id)}">${E(m.name)}</option>`).join('')}</select></label><label class="field"><span>Son tarih</span><input id="quick-work-date" type="date"></label></div><label class="field"><span>Başlık</span><select id="quick-work-parent">${C.ordered(store.doc).filter(({node})=>node.kind!=='Görev'||node.parentId===null).map(({node,depth})=>`<option value="${E(node.id)}" ${node.id===parent?'selected':''}>${'— '.repeat(depth)}${E(node.parentId===null?'Doğrudan projeye':node.title)}</option>`).join('')}</select></label>`,`<button class="button secondary" data-action="close-modal">Vazgeç</button><button class="button primary" data-action="confirm-modal">İşi ekle</button>`,()=>{
      const title=$('#quick-work-title').value.trim(),dueDate=$('#quick-work-date').value,ownerUserId=$('#quick-work-owner').value,parentId=$('#quick-work-parent').value;
      if(!title)return modalError('İşin adını yazın.');if(dueDate&&!C.validDate(dueDate))return modalError('Geçerli bir tarih seçin.');
      let id;if(change(d=>{id=window.DalTreeModel.add(d,parentId,{title});window.DalTreeModel.update(d,id,{ownerUserId,dueDate},T.initial.members);})){treeClosed.delete(parentId);closeModal();treeSelect(id);toast('İş eklendi.');}
    });
  }
  function treeSelect(id){if(!getNode(id))return;treeDrafts.set(selected,{...treeDraft});selected=id;treeDetail=true;const url=new URL(location.href);url.searchParams.set('node',id);history.replaceState(null,'',url);treeDraft=treeDrafts.get(id)||{title:'',kind:'Görev'};document.body.classList.add('inspector-hidden');renderWorkPlan();$('#work-plan-view .tw-detail').scrollTop=0;if(innerWidth<=760)$('#work-plan-view .tw-detail')?.focus({preventScroll:true});}
  function renderWorkPlan(){
    if(viewMode==='tree'){renderTree();return;}

    const el=$('#work-plan-view'),active=document.activeElement,focus=el.contains(active)?{id:active.id,key:active.dataset.planKey,field:active.dataset.planField,name:active.name,start:active.selectionStart,end:active.selectionEnd}:null,scroll=el.scrollTop;
    const filtersOpen=!!el.querySelector('.op-filters[open]');
    const expanded=new Set([...el.querySelectorAll('.wp-steps[open]')].map(details=>details.closest('[data-work-key]').dataset.workKey));
    const form=$('#work-plan-form');if(form&&planComposer){const f=new FormData(form);planDraft={title:String(f.get('title')||''),owner:String(f.get('owner')||''),dueDate:String(f.get('dueDate')||'')};}
    el.innerHTML=window.DalWorkPlanView.render(store.doc,{editable:T.canEdit(),members:T.initial.members,hideDone:planHideDone,limit:planLimit,composer:planComposer,draft:planDraft,mode:viewMode,owner:workOwner,query:workQuery,filter:workFilter,date:opsDate,selectedDate:opsSelectedDate,userId:T.user.id});
    if(filtersOpen&&el.querySelector('.op-filters'))el.querySelector('.op-filters').open=true;
    for(const details of el.querySelectorAll('.wp-steps'))if(expanded.has(details.closest('[data-work-key]').dataset.workKey))details.open=true;
    el.scrollTop=scroll;
    if(focus){const next=[...el.querySelectorAll('input,select,button')].find(input=>focus.id?input.id===focus.id:focus.key?input.dataset.planKey===focus.key&&input.dataset.planField===focus.field:focus.name?input.name===focus.name:false);if(next&&!next.disabled){next.focus({preventScroll:true});if(['text','search'].includes(next.type)&&focus.start!==null)next.setSelectionRange(focus.start,focus.end);}}
  }
  function setView(mode){
    mode=window.DalOperationsModel.resolveView(mode);
    const previous=viewMode;viewMode=mode;document.body.classList.toggle('table-mode',mode==='table');document.body.classList.toggle('plan-mode',isWorkView());document.body.dataset.workView=mode;
    $('#table-view').classList.toggle('hidden',mode!=='table');$('#work-plan-view').classList.toggle('hidden',!isWorkView());
    $('#work-plan-view').setAttribute('aria-labelledby',mode+'-tab');
    for(const value of ['map','table','plan','board','calendar']){const el=$('#'+value+'-tab');el.classList.toggle('active',mode===value);el.setAttribute('aria-selected',String(mode===value));el.tabIndex=mode===value?0:-1;}
    if(isWorkView()){query='';$('#search').value='';document.body.classList.add('sidebar-hidden','inspector-hidden');}
    const url=new URL(location.href);url.searchParams.set('mode',mode);history.replaceState(null,'',url);
    render();if(previous!==mode&&isWorkView())$('#work-plan-view').scrollTop=0;window.DalHub?.editorViewChanged();if(mode==='map'&&['tree','plan','board','timeline','calendar'].includes(previous))requestAnimationFrame(()=>readableView());
  }
  function addPlanWork(date=''){if(!T.canEdit())return;if(C.validDate(date))planDraft.dueDate=date;planComposer=true;renderWorkPlan();$('#plan-title')?.focus();}
  function printPlan(){
    if(T.hasPending())return toast('Yazdırmadan önce değişikliklerin kaydedilmesini bekleyin.');
    $('#print-area').classList.add('plan-print');$('#print-area').innerHTML=window.DalWorkPlanView.render(store.doc,{print:true});requestAnimationFrame(()=>window.print());
  }

  function helpDialog(){T.help();}
  function exportDialog(){showModal('Çalışmanızı dışa aktarın','Şemayı paylaşın, ayrıntıları taşıyın veya düzenlenebilir bir kopya alın.',`<div class="export-grid">${[
    ['json','JSON','Belge kopyası','Şema ve kart verileri; Dal ile tekrar açılır.'],['svg','SVG','Vektörel şema','Büyütülebilir, net çizgiler ve metin.'],['png','PNG','Yüksek çözünürlüklü görsel','Sunum ve paylaşım için.'],['csv','CSV','Ayrıntılı kart tablosu','Excel uyumlu; sorumlular, işler ve notlar.'],['md','MD','Yazılı organizasyon dökümü','Hiyerarşi, ayrıntılar ve çapraz ilişkiler.'],['print','PDF','Yazdır / PDF kaydet','Tarayıcının yazdırma penceresini açar.']
  ].map(([key,symbol,title,desc])=>`<button class="export-card" data-export="${key}"><span class="export-symbol">${symbol}</span><div><h3>${title}</h3><p>${desc}</p></div></button>`).join('')}</div><label class="checkbox-label"><input type="checkbox" id="export-full" checked>Görsellerde kapalı dalları da göster</label><p class="small-note">JSON, CSV ve Markdown bütün kartları içerir. Görseller seçili yerleşimi kullanır; arama filtresi dışa aktarmayı etkilemez. PNG sınırı: 8.192 piksel uzun kenar ve 24 megapiksel.</p><div class="modal-warning">SVG, PNG ve PDF kartların görsel özetidir; uzun notların yerine geçmez. Belge yedeği için JSON kullanın. Hesaplar, yorumlar ve geçmiş yalnız sunucu yedeğinde bulunur.</div>`,`<button class="button secondary" data-action="close-modal">Kapat</button>`);}
  function recoverDialog(){T.history();}
  async function openFile(file){T.importBoard();}
  function filename(ext){return (store.doc.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').trim().slice(0,100)||'dal-organizasyon')+'.'+ext;}
  function download(content,name,mime){const blob=content instanceof Blob?content:new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function jsonSave(){store.doc.view={...camera};const content=JSON.stringify(store.doc,null,2);download(content,filename('json'),'application/json;charset=utf-8');lastManualSave=content;toast('JSON yedeği hazır. Tarayıcınızın indirme konumuna kaydedin.','success');}
  let measureContext=null;
  function textLines(value,maxWidth,font='14px Arial',maxLines=2){if(!measureContext)measureContext=document.createElement('canvas').getContext('2d');measureContext.font=font;const chars=Array.from(String(value)),lines=[];let line='';for(let i=0;i<chars.length;i++){const ch=chars[i];if(ch==='\n'||measureContext.measureText(line+ch).width>maxWidth){lines.push(line);line='';if(lines.length>=maxLines){let last=lines.pop();while(last&&measureContext.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines.push(last+'…');return lines;}if(ch==='\n')continue;}line+=ch;}if(line||!lines.length)lines.push(line);return lines;}
  function svgExport(full=true){
    const L=C.layout(store.doc,{full}),b=L.bounds,pad=70,top=80,width=Math.ceil(b.w+pad*2),height=Math.ceil(b.h+pad*2+top),tx=pad-b.x,ty=pad+top-b.y;
    const texts=(value,x,y,size,color,maxWidth,maxLines=1,weight='400')=>textLines(value,maxWidth,`${weight} ${size}px Arial`,maxLines).map((line,i)=>`<text x="${x}" y="${y+i*(size+3)}" font-size="${size}" font-weight="${weight}" fill="${color}">${E(line)}</text>`).join('');
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${E(store.doc.name)}"><title>${E(store.doc.name)}</title><desc>Dal organizasyon şeması. Düz çizgiler hiyerarşi, kesik çizgiler çapraz ilişki. Uzun ayrıntılar tam proje JSON dosyasındadır.</desc><defs><marker id="exp-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="#a18ab6" stroke-width="1"/></marker></defs><rect width="100%" height="100%" fill="#fafafb"/><g font-family="Arial,Helvetica,sans-serif">${texts(store.doc.name,pad,45,25,'#343044',width-pad*2,1,'600')}<text x="${pad}" y="69" font-size="11" fill="#a098b1">${E((store.doc.sample?'Düzenlenebilir örnek · ':'')+L.positions.size+' kart · '+store.doc.relations.length+' çapraz ilişki · Dal Organizasyon Atölyesi')}</text><g transform="translate(${tx} ${ty})">`;
    svg+=L.guides.map(g=>`<circle cx="${g.x}" cy="${g.y}" r="${g.radius}" fill="none" stroke="#bdcfd8" stroke-dasharray="6 7"/>`).join('');
    svg+=L.edges.map(edge=>`<path d="${C.edgePath(edge,L.positions)}" fill="none" stroke="${getNode(edge.to).color}" stroke-opacity=".38" stroke-width="1.7"/>`).join('');
    svg+=store.doc.relations.map(r=>{const g=C.relationGeometry(r,L.positions);if(!g)return '';const title=textLines(r.label,160,'10px Arial',1)[0],tw=Math.min(180,measureContext.measureText(title).width+18);return `<path d="${g.path}" fill="none" stroke="#ab8fc6" stroke-width="1.5" stroke-dasharray="5 5" marker-end="url(#exp-arrow)"/><rect x="${g.x-tw/2}" y="${g.y-12}" width="${tw}" height="20" rx="4" fill="#faf7ff"/><text x="${g.x}" y="${g.y+2}" text-anchor="middle" font-size="10" fill="#a18ab6">${E(title)}</text>`;}).join('');
    const codes=new Map(C.ordered(store.doc).map(({node,code})=>[node.id,code]));
    svg+=[...L.positions].map(([id,p])=>{const n=getNode(id),title=textLines(n.title,C.W-34,'600 14px Arial',2),roleY=title.length===2?88:72,owner=n.owner||'Sorumlu atanmadı',progress=workProgress.get(id);return `<g transform="translate(${p.x} ${p.y})"><title>${E(n.title+' — '+n.status+(n.owner?' — '+n.owner:''))}</title><rect width="${C.W}" height="${C.H}" rx="10" fill="white" stroke="#dedbe9"/><rect y="17" width="3" height="${C.H-34}" rx="1.5" fill="${n.color}"/><rect x="16" y="12" width="${Math.max(43,n.kind.length*6+13)}" height="16" rx="4" fill="${n.color}" fill-opacity=".08"/><text x="23" y="23" font-size="9" fill="${n.color}">${E(n.kind)}</text><text x="222" y="23" text-anchor="end" font-size="8" fill="#b6afc5">${E(codes.get(id)||'ANA YAPI')}</text>${title.map((line,i)=>`<text x="17" y="${49+i*17}" font-size="14" font-weight="600" fill="#302a3e">${E(line)}</text>`).join('')}${texts(n.role||'Amaç ve sorumlulukları tanımlayın',17,roleY,10,'#a49bb5',204)}<circle cx="25" cy="110" r="9" fill="#f2eff7"/><text x="25" y="113" font-size="8" text-anchor="middle" fill="#aaa0bb">${E(n.owner?initials(n.owner).toLocaleUpperCase('tr-TR'):'–')}</text>${texts(owner,39,114,9,'#9890a6',123)}${n.tasks.length?`<text x="202" y="113" font-size="9" fill="#a39ab0" text-anchor="end">${n.tasks.filter(t=>t.done).length}/${n.tasks.length}</text>`:''}<circle cx="218" cy="110" r="3" fill="${n.status==='Tamamlandı'?'#36a385':n.status==='Devam ediyor'?'#4596cc':n.status==='Beklemede'?'#d2a05b':'#adb4c5'}"/>${progress.total?`<text x="17" y="142" font-size="11" font-weight="600" fill="${progress.percent===100?'#2f796c':'#427fa0'}">%${progress.percent}</text><text x="221" y="142" text-anchor="end" font-size="9" fill="#647b87">${progress.done} / ${progress.total} iş tamamlandı</text><rect x="17" y="151" width="204" height="5" rx="2.5" fill="#e6edf1"/><rect x="17" y="151" width="${204*progress.percent/100}" height="5" rx="2.5" fill="${progress.percent===100?'#2f796c':'#427fa0'}"/>`:'<text x="17" y="143" font-size="10" fill="#647b87">Henüz iş yok</text>'}${!full&&n.collapsed&&nChildren(id).length?`<circle cx="${C.W}" cy="${C.H}" r="10" fill="white" stroke="#d8d2e4"/><text x="${C.W}" y="${C.H+3}" text-anchor="middle" font-size="8" fill="#9186a6">${C.descendants(store.doc,id,false).length}</text>`:''}</g>`;}).join('');
    svg+=`</g><text x="${pad}" y="${height-23}" font-size="9" fill="#aba2bb">Düz çizgi: hiyerarşi  ·  Kesik çizgi: çapraz ilişki  ·  İlerleme yüzdesi: manuel</text></g></svg>`;
    return {svg,width,height};
  }
  function portableHTML(){throw new Error('Ortak sistem taşınabilir HTML olarak dışa aktarılmaz. JSON yalnız belge kopyasıdır.');}
  async function exportKind(kind){const full=$('#export-full')?.checked!==false;
    try{
      if(kind==='json'){jsonSave();return;}
      if(kind==='csv'){download(C.csv(store.doc),filename('csv'),'text/csv;charset=utf-8');toast('Ayrıntılı kart tablosu CSV olarak dışa aktarıldı.');return;}
      if(kind==='md'){download(C.markdown(store.doc),filename('md'),'text/markdown;charset=utf-8');toast('Yazılı organizasyon dökümü hazır.');return;}
      if(kind==='html')throw new Error('Ekip sürümü taşınabilir HTML kopyası üretmez.');
      const {svg,width,height}=svgExport(full);
      if(kind==='svg'){download(svg,filename('svg'),'image/svg+xml;charset=utf-8');toast('Vektörel şema dışa aktarıldı.');return;}
      if(kind==='print'){closeModal();$('#print-area').innerHTML=svg;requestAnimationFrame(()=>window.print());return;}
      if(kind==='png'){
        const scale=Math.min(2,8192/width,8192/height,Math.sqrt(24000000/(width*height)));
        if(scale<.08)throw new Error('Şema PNG için fazla geniş. Otomatik düzenleyin veya kayıpsız SVG aktarın.');
        const cn=document.createElement('canvas');cn.width=Math.max(1,Math.floor(width*scale));cn.height=Math.max(1,Math.floor(height*scale));
        const ctx=cn.getContext('2d');if(!ctx)throw new Error('Tarayıcı görsel üretim alanı oluşturamadı. SVG kullanın.');
        const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
        try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Şema görüntülenemedi. SVG dışa aktarmayı kullanın.'));img.src=url;});ctx.drawImage(img,0,0,cn.width,cn.height);const blob=await new Promise(resolve=>cn.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG üretilemedi; SVG kullanın.');download(blob,filename('png'),'image/png');toast(`PNG hazır: ${cn.width} × ${cn.height} piksel.`,'success');}finally{URL.revokeObjectURL(url);cn.width=cn.height=0;}
      }
    }catch(e){toast('Dışa aktarma yapılamadı: '+e.message,'error');}
  }
  const actions={
    'undo':()=>T.undo(),'redo':()=>T.redo(),
    'new':()=>T.newBoard(),'open':()=>T.importBoard(),'save':()=>T.flush(true),'export':exportDialog,'help':helpDialog,'recover':recoverDialog,
    'add-child':()=>addChild(false),'add-sibling':()=>addChild(true),'duplicate':duplicateSelected,'delete':deleteSelected,'copy-branch':copyBranch,'paste-branch':pasteBranch,
    'rename':renameDialog,'move-dialog':moveDialog,'bulk':bulkDialog,
    'view-board':()=>setView('board'),'view-timeline':()=>setView('timeline'),'view-calendar':()=>setView('calendar'),
    'ops-clear':()=>{workOwner='';workQuery='';workFilter='all';planHideDone=false;renderWorkPlan();},
    'ops-prev':()=>{opsDate=viewMode==='calendar'?window.DalOperationsModel.moveMonth(opsDate,-1):window.DalHubModel.plus(opsDate,-14);if(viewMode==='calendar')opsSelectedDate=opsDate;renderWorkPlan();},
    'ops-next':()=>{opsDate=viewMode==='calendar'?window.DalOperationsModel.moveMonth(opsDate,1):window.DalHubModel.plus(opsDate,14);if(viewMode==='calendar')opsSelectedDate=opsDate;renderWorkPlan();},
    'ops-today':()=>{opsDate=opsSelectedDate=window.DalHubModel.today();renderWorkPlan();},
    'ops-jump':el=>{if(C.validDate(el.dataset.date)){opsDate=el.dataset.date;renderWorkPlan();}},
    'ops-day':el=>{if(C.validDate(el.dataset.date)){opsSelectedDate=el.dataset.date;renderWorkPlan();if(matchMedia('(max-width:760px)').matches)requestAnimationFrame(()=>$('.op-day-agenda')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));}},
    'ops-add-day':el=>addPlanWork(el.dataset.date),
    'view-tree':()=>setView('tree'),'tree-new':()=>newTreeWork(),
    'tree-select':el=>treeSelect(el.dataset.id),'tree-back':()=>{treeDetail=false;renderWorkPlan();$('#work-plan-view [aria-current=true]')?.focus();},
    'tree-fold':el=>{treeClosed.has(el.dataset.id)?treeClosed.delete(el.dataset.id):treeClosed.add(el.dataset.id);renderWorkPlan();$('#work-plan-view [data-tw-row="'+CSS.escape(el.dataset.id)+'"] .tw-fold')?.focus({preventScroll:true});},
    'tree-expand':()=>{treeClosed.clear();renderWorkPlan();},'tree-collapse':()=>{treeClosed=new Set(store.doc.nodes.filter(n=>n.parentId!==null).map(n=>n.id));renderWorkPlan();},
    'tree-more':el=>{tab='card';selectNode(el.dataset.id,false,true);renderInspector();},
    'view-map':()=>setView('map'),'view-table':()=>setView('table'),'view-plan':()=>setView('plan'),
    'plan-add':()=>addPlanWork(),'plan-cancel':()=>{planComposer=false;planDraft={title:'',owner:'',dueDate:window.DalHubModel.today()};renderWorkPlan();$('#work-plan-view [data-action=plan-add]')?.focus();},'plan-more':()=>{planLimit+=100;renderWorkPlan();},'plan-open':el=>{tab=el.dataset.task?'tasks':'card';selectNode(el.dataset.id,false,true);renderInspector();},'plan-print':printPlan,
    'fit':fit,'readable':readableView,'zoom-in':()=>zoomAt(1.2),'zoom-out':()=>zoomAt(1/1.2),'zoom-100':()=>zoomAt(1,null,null,true),
    'toggle-sidebar':()=>{if(window.innerWidth<=1050)document.body.classList.toggle('sidebar-open');else document.body.classList.toggle('sidebar-hidden');setTimeout(()=>revealSelected(true),30);},
    'toggle-inspector':()=>{document.body.classList.toggle('inspector-hidden');setTimeout(()=>revealSelected(true),30);},
    'focus':()=>{document.body.classList.toggle('focus-mode');setTimeout(()=>revealSelected(true),30);},
    'toggle-grid':()=>change(d=>d.settings.grid=!d.settings.grid),
    'reset-layout':()=>{change(d=>d.nodes.forEach(n=>{n.offsetX=0;n.offsetY=0;}));fit();toast('Manuel konumlar sıfırlandı; hiyerarşi korunarak düzenlendi.');},
    'expand-all':()=>{change(d=>d.nodes.forEach(n=>n.collapsed=false));fit();},
    'collapse-all':()=>{const root=C.rootNode(store.doc).id;change(d=>d.nodes.forEach(n=>n.collapsed=n.id!==root&&C.children(d,n.id).length>0));selected=root;render();fit();},
    'toggle-node':el=>{const id=el?.dataset.id||selected;change(d=>{const n=d.nodes.find(n=>n.id===id);n.collapsed=!n.collapsed;if(n.collapsed&&C.descendants(d,id,false).includes(selected))selected=id;});},
    'color-branch':()=>{const n=getNode(),ids=new Set(C.descendants(store.doc,selected));change(d=>d.nodes.forEach(c=>{if(ids.has(c.id))c.color=n.color;}));toast('Renk bütün alt dallara uygulandı.');},
    'select-parent':()=>{if(getNode().parentId)selectNode(getNode().parentId,true);},
    'order-up':()=>change(d=>C.reorder(d,selected,-1)), 'order-down':()=>change(d=>C.reorder(d,selected,1)),
    'relationship':()=>{relationFrom=selected;render();toast('Bağlanacak diğer karta tıklayın.');},'cancel-relation':()=>{relationFrom=null;render();},
    'delete-task':el=>change(d=>{const n=d.nodes.find(n=>n.id===selected);n.tasks=n.tasks.filter(t=>t.id!==el.dataset.id);}),
    'delete-link':el=>change(d=>{const n=d.nodes.find(n=>n.id===selected);n.links=n.links.filter(l=>l.id!==el.dataset.id);}),
    'delete-relation':el=>change(d=>d.relations=d.relations.filter(r=>r.id!==el.dataset.id)),
    'close-modal':closeModal,'confirm-modal':()=>{if(modalAction)modalAction();},
    'sample-info':()=>showModal('Bu yapı bir örnektir','Mevcut kurumunuzu veya kişileri temsil etmez.',`<p style="line-height:1.9;color:#958aab">Birim adları ve örnek içerik, kendi organizasyonunuzu daha hızlı kurabilmeniz içindir. Gerçek sorumluları, görevleri ve yetkileri kendiniz belirleyin. TACEV / Birlikte İyilik şablonu da öneri niteliğindedir.</p><p class="small-note">Örnek işaretini kaldırmak verileri değiştirmez; kurumsal doğruluk onayı sayılmaz.</p>`,`<button class="button secondary" data-action="close-modal">Kapat</button><button class="button primary" data-action="confirm-modal">Örnek işaretini kaldır</button>`,()=>{change(d=>d.sample=false);closeModal();}),
    'load-external':()=>T.reload()
  };
  document.addEventListener('click',e=>{
    if(eventIgnoreClick){e.preventDefault();return;}
    const action=e.target.closest('[data-action]');
    if(action){const name=action.dataset.action;$('#context-menu').classList.add('hidden');if(actions[name]){e.preventDefault();try{actions[name](action);}catch(err){toast(err.message,'error');}}return;}
    const layoutBtn=e.target.closest('[data-layout]');if(layoutBtn){if(store.doc.settings.layout!==layoutBtn.dataset.layout){change(d=>{d.settings.layout=layoutBtn.dataset.layout;d.nodes.forEach(n=>{n.offsetX=0;n.offsetY=0;});});fit();}return;}
    const t=e.target.closest('[data-inspector-tab]');if(t){tab=t.dataset.inspectorTab;renderInspector();return;}
    const color=e.target.closest('[data-color]');if(color){change(d=>d.nodes.find(n=>n.id===selected).color=color.dataset.color);return;}
    const template=e.target.closest('[data-template]');if(template){templateChoice=template.dataset.template;$$('[data-template]').forEach(b=>b.classList.toggle('selected',b===template));return;}
    const exp=e.target.closest('[data-export]');if(exp){exportKind(exp.dataset.export);return;}
    const tree=e.target.closest('[data-tree-id]');if(tree){selectNode(tree.dataset.treeId,true,true);if(window.innerWidth<=1050)document.body.classList.remove('sidebar-open');return;}
    const card=e.target.closest('[data-node-id]');if(card){selectNode(card.dataset.nodeId,false);canvas.focus({preventScroll:true});return;}
    if(!e.target.closest('#context-menu'))$('#context-menu').classList.add('hidden');
  });
  document.addEventListener('dblclick',e=>{
    if(e.target.closest('button'))return;
    let id=e.target.closest('[data-node-id]')?.dataset.nodeId;
    // Pointer capture tıklamayı tuvale yöneltebilir; görünür kartı koordinattan da bul.
    if(!id&&canvas.contains(e.target)){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-camera.x)/camera.scale,y=(e.clientY-r.top-camera.y)/camera.scale;for(const [key,p]of layout.positions){if(x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h)id=key;}}
    if(id){selectNode(id);renameDialog();}
  });
  document.addEventListener('input',e=>{
    const el=e.target;
    if(el.id==='tree-search'){treeQuery=el.value;renderWorkPlan();return;}
    if(el.closest('#tree-add-form')){treeDraft={title:$('#tree-add-title').value,kind:$('#tree-add-form [name=kind]').value};return;}
    if(el.id==='plan-search'){workQuery=el.value;renderWorkPlan();return;}
    if(el.id==='search'){query=el.value.trim();render({skipInspector:true});return;}
    if(el.id==='document-name'){change(d=>d.name=el.value||'İsimsiz organizasyon',{mergeKey:'document-name',skipInspector:true});return;}
    if(el.dataset.field){const id=selected,key=el.dataset.field;let value=el.value;
      if(key==='progress')value=Math.max(0,Math.min(100,Number(value)||0));
      if(key==='tags')value=value.split(',').map(s=>s.trim()).filter(Boolean).slice(0,30);
      if(key==='title'&&!value)value='Yeni kart';
      if(key==='dueDate')value=C.validDate(value);
      change(d=>{const n=d.nodes.find(n=>n.id===id);n[key]=value;if(key==='owner')n.ownerUserId='';},{mergeKey:id+':'+key,skipInspector:true});
      if(key==='progress'&&$('#progress-output'))$('#progress-output').textContent='%'+value;
      if(key==='title'){$('.identity-copy h2').textContent=value;$('.identity-copy h2').title=value;}
      if(key==='kind'){renderInspector();}
      if(key==='color'){$$('.color-option').forEach(c=>c.classList.toggle('active',c.dataset.color===value));}
      return;
    }
    if(el.dataset.taskField){const id=el.closest('[data-task-id]').dataset.taskId,key=el.dataset.taskField;let value=el.type==='checkbox'?el.checked:el.value;if(key==='dueDate')value=C.validDate(value);if(key==='text'&&!value)value='Yeni iş';change(d=>{const n=d.nodes.find(n=>n.id===selected),t=n.tasks.find(t=>t.id===id);if(t){t[key]=value;if(key==='assignee')t.assigneeId='';}},{mergeKey:selected+':task:'+id+':'+key,skipInspector:key!=='done'});}
  });
  document.addEventListener('change',e=>{
    const el=e.target;
    if(el.dataset.treeField){const id=el.dataset.treeNode;change(d=>window.DalTreeModel.update(d,id,{[el.dataset.treeField]:el.value},T.initial.members));renderWorkPlan();return;}
    if(el.id==='workspace-project'){window.DalHub.openProject(el.value,viewMode);return;}
    if(el.id==='plan-owner'){workOwner=el.value;renderWorkPlan();return;}
    if(el.id==='plan-filter'){workFilter=el.value;renderWorkPlan();return;}
    if(el.id==='plan-hide-done'){planHideDone=el.checked;renderWorkPlan();return;}
    if(!el.dataset.planField)return;
    const patch={[el.dataset.planField]:el.type==='checkbox'?el.checked:el.value};
    const changed=change(d=>window.DalWorkPlanModel.update(d,{nodeId:el.dataset.planNode,taskId:el.dataset.planTask},patch));
    if(!changed)renderWorkPlan();
    if(isWorkView()&&planHideDone&&patch.done===true&&![...$('#work-plan-view').querySelectorAll('[data-plan-key]')].some(input=>input.dataset.planKey===el.dataset.planKey))$('#plan-hide-done')?.focus({preventScroll:true});
  });
  document.addEventListener('submit',e=>{
    if(e.target.id==='tree-add-form'){
      e.preventDefault();if(!T.canEdit())return;const f=new FormData(e.target),parent=selected;
      if(change(d=>window.DalTreeModel.add(d,parent,{title:f.get('title'),kind:f.get('kind')}))){treeClosed.delete(parent);treeDrafts.delete(parent);treeDraft={title:'',kind:treeDraft.kind};renderWorkPlan();$('#tree-add-title')?.focus();toast('Alt iş eklendi.');}return;
    }
    if(e.target.id==='work-plan-form'){
      e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')||'').trim(),owner=String(f.get('owner')||''),dueDate=String(f.get('dueDate')||'');
      if(!title)return;if(dueDate&&!C.validDate(dueDate)){ $('#plan-form-error').textContent='Geçerli bir son tarih seçin.';return;}
      if(!T.canEdit()){ $('#plan-form-error').textContent='Bu çalışmada düzenleme yetkiniz yok.';return;}
      const who=T.initial.members.find(m=>m.id===owner&&m.active!==false);
      if(owner&&!who){$('#plan-form-error').textContent='Sorumlu ekipte bulunmuyor. Lütfen yeniden seçin.';return;}
      if(change(d=>C.addNode(d,C.rootNode(d).id,{kind:'Görev',title,ownerUserId:who?.id||'',owner:who?.name||'',dueDate,status:'Planlandı'}))){planComposer=false;planDraft={title:'',owner:'',dueDate:window.DalHubModel.today()};renderWorkPlan();toast('İş eklendi.');$('#work-plan-view [data-action=plan-add]')?.focus();}
      return;
    }

    if(e.target.id==='task-form'){e.preventDefault();const value=$('#new-task').value.trim();if(!value)return;if(getNode().tasks.length>=500){toast('Bir kart en fazla 500 iş içerebilir.','error');return;}change(d=>d.nodes.find(n=>n.id===selected).tasks.push({id:C.uid('t'),text:value,done:false,assignee:'',assigneeId:'',dueDate:''}));$('#new-task')?.focus();return;}
    if(e.target.id==='link-form'){e.preventDefault();const url=C.safeURL($('#link-url').value),label=$('#link-label').value.trim();if(!url){$('#link-error').textContent='http:// veya https:// ile başlayan geçerli bir adres yazın.';return;}if(getNode().links.length>=100){toast('Bir karta en fazla 100 bağlantı eklenebilir.','error');return;}change(d=>d.nodes.find(n=>n.id===selected).links.push({id:C.uid('l'),label:label||url,url}));toast('Bağlantı kaydedildi.');return;}
    if(e.target.id==='relation-form'){e.preventDefault();try{addRelation(selected,$('#relation-target').value,$('#relation-label').value);toast('Çapraz ilişki eklendi.');}catch(err){toast(err.message,'error');}}
  });
  document.addEventListener('dragstart',e=>{const card=e.target.closest('[data-op-key][draggable=true]');if(!card||!T.canEdit())return;opsDrag=window.DalWorkPlanModel.items(store.doc).find(t=>t.key===card.dataset.opKey);if(!opsDrag)return;e.dataTransfer.setData('application/x-birlikte-work',opsDrag.key);e.dataTransfer.effectAllowed='move';});
  document.addEventListener('dragover',e=>{const col=e.target.closest('[data-op-drop]');if(col&&opsDrag&&T.canEdit()){e.preventDefault();$$('.op-column.drop-active').forEach(el=>el.classList.remove('drop-active'));col.classList.add('drop-active');}});
  document.addEventListener('drop',e=>{const col=e.target.closest('[data-op-drop]');if(!col||!opsDrag)return;e.preventDefault();const work=opsDrag;opsDrag=null;$$('.op-column.drop-active').forEach(el=>el.classList.remove('drop-active'));if(!T.canEdit())return;const target=col.dataset.opDrop;if(work.status!==target&&change(d=>window.DalWorkPlanModel.update(d,work,{status:target})))toast('İşin durumu güncellendi.');});
  document.addEventListener('dragend',()=>{opsDrag=null;$$('.op-column.drop-active').forEach(el=>el.classList.remove('drop-active'));});
  document.addEventListener('keydown',e=>{if(e.target.closest('.view-tabs')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){const tabs=[...document.querySelectorAll('.view-tabs [role=tab]')],i=tabs.indexOf(e.target);if(i<0)return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[n].focus();tabs[n].click();}});
  $('#file-input').addEventListener('change',e=>openFile(e.target.files[0]));
  $('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
  $('#modal').addEventListener('cancel',()=>{modalAction=null;});
  function previewDrag(dx,dy){const pos=new Map([...layout.positions].map(([id,p])=>[id,{...p}]));dragging.ids.forEach(id=>{const p=pos.get(id);if(p){p.x+=dx;p.y+=dy;const el=$(`[data-node-id="${CSS.escape(id)}"]`);if(el){el.style.transform=`translate(${p.x}px,${p.y}px)`;el.classList.add('dragging');}}});renderEdges(pos);}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0&&e.button!==1)return;
    if(e.target.closest('button,input,textarea,a'))return;
    pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(e.pointerType==='touch'&&pointerMap.size===2){const points=[...pointerMap.values()],r=canvas.getBoundingClientRect(),mx=(points[0].x+points[1].x)/2-r.left,my=(points[0].y+points[1].y)/2-r.top;pinch={distance:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),scale:camera.scale,wx:(mx-camera.x)/camera.scale,wy:(my-camera.y)/camera.scale};dragging=null;panning=null;renderCanvas();canvas.setPointerCapture(e.pointerId);return;}
    if(relationFrom)return;
    const card=e.target.closest('[data-node-id]');
    canvas.focus({preventScroll:true});keyboardMode=true;
    if(card&&!spaceHeld&&e.button!==1){const id=card.dataset.nodeId;if(id!==selected)selectNode(id,false,false,true);dragging={id,startX:e.clientX,startY:e.clientY,dx:0,dy:0,started:false,ids:new Set(C.descendants(store.doc,id)),target:null,pointerId:e.pointerId};}
    else{panning={startX:e.clientX,startY:e.clientY,x:camera.x,y:camera.y,pointerId:e.pointerId};canvas.classList.add('panning');}
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(pointerMap.has(e.pointerId))pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pointerMap.size>=2){const p=[...pointerMap.values()],r=canvas.getBoundingClientRect(),distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),mx=(p[0].x+p[1].x)/2-r.left,my=(p[0].y+p[1].y)/2-r.top;camera.scale=Math.max(.001,Math.min(2.5,pinch.scale*distance/Math.max(1,pinch.distance)));camera.x=mx-pinch.wx*camera.scale;camera.y=my-pinch.wy*camera.scale;updateCamera();return;}
    if(panning){camera.x=panning.x+e.clientX-panning.startX;camera.y=panning.y+e.clientY-panning.startY;updateCamera();return;}
    if(!dragging)return;
    let dx=(e.clientX-dragging.startX)/camera.scale,dy=(e.clientY-dragging.startY)/camera.scale;
    if(!dragging.started&&Math.hypot(dx,dy)*camera.scale<6)return;dragging.started=true;
    if(e.shiftKey){dx=Math.round(dx/20)*20;dy=Math.round(dy/20)*20;}
    dragging.dx=dx;dragging.dy=dy;previewDrag(dx,dy);
    const r=canvas.getBoundingClientRect(),wx=(e.clientX-r.left-camera.x)/camera.scale,wy=(e.clientY-r.top-camera.y)/camera.scale;let target=null;
    for(const [id,p]of layout.positions){if(!dragging.ids.has(id)&&wx>p.x+5&&wx<p.x+p.w-5&&wy>p.y+5&&wy<p.y+p.h-5&&C.canReparent(store.doc,dragging.id,id))target=id;}
    dragging.target=target;$$('.org-card').forEach(el=>el.classList.toggle('drop-target',el.dataset.nodeId===target));
    $('#canvas-hint').textContent=target?'“'+getNode(target).title+'” altına bağlanacak':'Boşluğa bırak: dalın görsel konumunu değiştir';
  });
  function endPointer(e){
    pointerMap.delete(e.pointerId);
    if(pinch){pinch=null;if(pointerMap.size===1){const [id,p]=[...pointerMap.entries()][0];panning={startX:p.x,startY:p.y,x:camera.x,y:camera.y,pointerId:id};}else panning=null;eventIgnoreClick=true;setTimeout(()=>eventIgnoreClick=false,80);return;}
    if(dragging){const drag=dragging;dragging=null;if(!drag.started&&e.type!=='pointercancel')selectNode(drag.id,false,window.innerWidth<=760);if(drag.started){eventIgnoreClick=true;setTimeout(()=>eventIgnoreClick=false,80);if(e.type==='pointercancel')render();else{let ok;if(drag.target){ok=change(d=>C.reparent(d,drag.id,drag.target));if(ok)toast('Dal “'+getNode(drag.target).title+'” altına taşındı.');}else{ok=change(d=>{const n=d.nodes.find(n=>n.id===drag.id);n.offsetX+=drag.dx;n.offsetY+=drag.dy;});}if(!ok)render();}}}
    panning=null;canvas.classList.remove('panning');$('#canvas-hint').innerHTML='Bir karta tıkla, ayrıntılarını aç <span>·</span> Boş alanı sürükle, gezin';
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  }
  canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)zoomAt(Math.exp(-e.deltaY*.005),e.clientX,e.clientY);else{if(e.shiftKey)camera.x-=e.deltaY;else{camera.x-=e.deltaX;camera.y-=e.deltaY;}updateCamera();}},{passive:false});
  $('#minimap').addEventListener('pointerdown',e=>{e.preventDefault();if(!miniTransform)return;const r=$('#minimap').getBoundingClientRect(),x=(e.clientX-r.left)*168/r.width,y=(e.clientY-r.top)*94/r.height,{s,ox,oy}=miniTransform,wx=(x-ox)/s,wy=(y-oy)/s,cr=canvas.getBoundingClientRect();camera.x=cr.width/2-wx*camera.scale;camera.y=cr.height/2-wy*camera.scale;updateCamera();});
  canvas.addEventListener('contextmenu',e=>{e.preventDefault();const card=e.target.closest('[data-node-id]');if(card)selectNode(card.dataset.nodeId);const menu=$('#context-menu'),r=$('#canvas-region').getBoundingClientRect();menu.innerHTML=[['add-child','plus','Alt kart ekle'],['add-sibling','branch','Eş düzey ekle'],['rename','note','Başlığı düzenle'],['copy-branch','copy','Dalı panoya kopyala'],['paste-branch','layers','Buraya yapıştır'],['duplicate','copy','Dalı çoğalt'],['move-dialog','move','Başka birime taşı'],['relationship','link','Çapraz ilişki'],['delete','trash','Dalı sil']].map(([a,i,t])=>`<button role="menuitem" data-action="${a}" class="${a==='delete'?'context-danger':''}">${icon(i)}${t}</button>`).join('');menu.style.left=Math.max(5,Math.min(e.clientX-r.left,r.width-205))+'px';menu.style.top=Math.max(5,Math.min(e.clientY-r.top,r.height-340))+'px';menu.classList.remove('hidden');});
  function typing(el){return !!el?.closest('input,textarea,select,[contenteditable="true"]');}
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented)return;
    if(document.querySelector('dialog[open]:not(#modal)'))return;
    const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase(),active=document.activeElement,isInput=typing(active);
    if($('#modal').open){if(e.key==='Enter'&&e.target.id==='rename-input'){e.preventDefault();if(modalAction)modalAction();}if(e.key==='Tab'&&e.target.id==='bulk-text'){e.preventDefault();const t=e.target,start=t.selectionStart;t.setRangeText('  ',start,t.selectionEnd,'end');}return;}
    if(mod&&k==='s'){e.preventDefault();if(isWorkView())T.flush(true);else jsonSave();return;}
    if(mod&&k==='k'){e.preventDefault();if(window.innerWidth<=1050)document.body.classList.add('sidebar-open');document.body.classList.remove('sidebar-hidden','focus-mode');$('#search').focus();$('#search').select();return;}
    if(isWorkView()&&isInput)return;
    if(isInput){if(e.key==='Enter'&&active.dataset.field==='title'){e.preventDefault();active.blur();canvas.focus();keyboardMode=true;}if(e.key==='Escape'){active.blur();canvas.focus();keyboardMode=true;}return;}
    if(e.key==='Escape'){if(relationFrom){relationFrom=null;render();}$('#context-menu').classList.add('hidden');keyboardMode=false;spaceHeld=false;return;}
    if(mod&&k==='z'){e.preventDefault();e.shiftKey?T.redo():T.undo();return;}
    if(mod&&k==='y'){e.preventDefault();T.redo();return;}
    if(isWorkView())return;
    if(mod&&k==='d'){e.preventDefault();duplicateSelected();return;}
    if(mod&&k==='c'){e.preventDefault();copyBranch();return;}
    if(mod&&k==='v'){e.preventDefault();pasteBranch();return;}
    if(e.target.closest('button,a')&&!e.target.closest('#nodes'))return;
    if(e.key==='Tab'&&!e.shiftKey&&keyboardMode&&canvas.contains(active)){e.preventDefault();addChild();return;}
    if(e.key==='Enter'){e.preventDefault();const row=e.target.closest('[data-tree-id]');if(row)selectNode(row.dataset.treeId,true,true);else addChild(true);return;}
    if(e.key==='F2'){e.preventDefault();renameDialog();return;}
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();deleteSelected();return;}
    if(e.code==='Space'){e.preventDefault();spaceHeld=true;canvas.style.cursor='grab';return;}
    if(k==='f'){e.preventDefault();actions.focus();return;}
    if(k==='0'){e.preventDefault();fit();return;}
    if(e.key==='+'||e.key==='='){e.preventDefault();zoomAt(1.2);return;}
    if(e.key==='-'){e.preventDefault();zoomAt(1/1.2);return;}
    if(e.key==='?'){e.preventDefault();helpDialog();return;}
    if(e.key==='ArrowRight'){e.preventDefault();const n=getNode(),children=nChildren(selected);if(children.length){if(n.collapsed)change(d=>d.nodes.find(n=>n.id===selected).collapsed=false);else selectNode(children[0].id,true);}return;}
    if(e.key==='ArrowLeft'){e.preventDefault();const n=getNode();if(!n.collapsed&&nChildren(selected).length)change(d=>d.nodes.find(n=>n.id===selected).collapsed=true);else if(n.parentId)selectNode(n.parentId,true);return;}
    if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const visible=C.ordered(store.doc,true),i=visible.findIndex(v=>v.node.id===selected),j=i+(e.key==='ArrowUp'?-1:1);if(visible[j])selectNode(visible[j].node.id,true);}
  });
  document.addEventListener('keyup',e=>{if(e.code==='Space'){spaceHeld=false;canvas.style.cursor='';}});
  window.addEventListener('blur',()=>{spaceHeld=false;});


  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave();});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>revealSelected(),150);});
  window.addEventListener('afterprint',()=>{$('#print-area').innerHTML='';$('#print-area').classList.remove('plan-print');});
  window.addEventListener('beforeunload',e=>{if((planComposer&&$('#plan-title')?.value.trim())||treeDraft.title.trim()){e.preventDefault();e.returnValue='';}});
  fillIcons();if(window.innerWidth<=760)document.body.classList.add('inspector-hidden');
  setView(window.DalOperationsModel.resolveView(initialMode,new URLSearchParams(location.search).has('node')));requestAnimationFrame(()=>{if(!isWorkView()){if(hasSavedView)updateCamera(false);else readableView();}persist();if(restoreWarning)toast(restoreWarning,'error');});
  // Test/entegrasyon yüzeyi. Veri aktarımı ve DOM dışı kontrol için yalnızca yerel erişim sağlar.
  window.DAL={version:'3.0.0',store,get viewMode(){return viewMode;},get selected(){return selected;},select:(id,...args)=>viewMode==='tree'?treeSelect(id):selectNode(id,...args),fit,readableView,svgExport,portableHTML,exportKind,get camera(){return {...camera};},get layout(){return layout;},actions,flush:flushSave};

  window.DAL.receive=(doc)=>{
    const local=new Map(store.doc.nodes.map(n=>[n.id,{collapsed:n.collapsed,offsetX:n.offsetX,offsetY:n.offsetY}]));
    const settings={...store.doc.settings};
    store.doc=C.validate(doc); store.doc.settings=settings;
    store.doc.nodes.forEach(n=>Object.assign(n,local.get(n.id)||{}));
    store.past=[];store.future=[];ensureSelected();
    render({skipInspector:!!document.activeElement?.closest('#inspector-content')});
  };
  window.DAL.refresh=()=>render();
  window.DAL.editing=()=>!!document.activeElement?.closest('#work-plan-view .tw-detail input,#work-plan-view .tw-detail textarea,#work-plan-view .tw-detail select,#tree-search,#inspector-content input,#inspector-content textarea,#inspector-content select,#document-name,#modal[open],#work-plan-form input,#work-plan-form select,#plan-search,[data-plan-field=dueDate],[data-plan-field=status]');
  T.attach(window.DAL);
})();
