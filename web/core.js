/* Dal — organizasyon veri modeli. Bağımsız JavaScript; tarayıcı ve Node.js ile çalışır. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DalCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const FORMAT = 'dal-organizasyon', VERSION = 1, MAX_NODES = 2000, MAX_DEPTH = 60;
  const W = 238, H = 130;
  const COLORS = ['#e20439', '#ad1738', '#c84c67', '#8f3047', '#d8778b', '#75636a'];
  const KINDS = ['Birim', 'Kişi', 'Proje', 'Görev', 'Başlık'];
  const STATUSES = ['Planlandı', 'Devam ediyor', 'Tamamlandı', 'Beklemede'];
  const PRIORITIES = ['Normal', 'Yüksek', 'Düşük'];
  function uid(prefix = 'n') { return prefix + '_' + (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); }
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  function text(v, max = 20000) { return typeof v === 'string' ? v.slice(0, max) : ''; }
  function num(v, min, max, fallback = 0) { return Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : fallback; }
  function validDate(v) { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return ''; const d = new Date(v + 'T00:00:00Z'); return !isNaN(d) && d.toISOString().slice(0, 10) === v ? v : ''; }
  function safeURL(value) {
    const s = text(value, 2048).trim();
    if (!s) return '';
    try { const u = new URL(s); return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol) ? s : ''; } catch (_) { return ''; }
  }
  function node(data = {}) {
    return {
      id: text(data.id, 100) || uid(), parentId: data.parentId == null ? null : text(data.parentId, 100),
      title: text(data.title, 250) || 'Yeni kart', kind: KINDS.includes(data.kind) ? data.kind : 'Birim',
      owner: text(data.owner, 250), ownerUserId: text(data.ownerUserId, 100), role: text(data.role, 500), email: text(data.email, 320), phone: text(data.phone, 80),
      description: text(data.description), responsibilities: text(data.responsibilities), goals: text(data.goals), notes: text(data.notes, 100000),
      status: STATUSES.includes(data.status) ? data.status : 'Planlandı', priority: PRIORITIES.includes(data.priority) ? data.priority : 'Normal',
      progress: Math.round(num(data.progress, 0, 100)), dueDate: validDate(data.dueDate),
      color: typeof data.color === 'string' && /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : COLORS[0],
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 30).map(v => text(v, 100)).filter(Boolean) : [],
      tasks: Array.isArray(data.tasks) ? data.tasks.slice(0, 500).map(t => ({ id: text(t && t.id, 100) || uid('t'), text: text(t && t.text, 1000), done: !!(t && t.done), assignee: text(t && t.assignee, 250), assigneeId: text(t && t.assigneeId, 100), dueDate: validDate(t && t.dueDate) })).filter(t => t.text) : [],
      links: Array.isArray(data.links) ? data.links.slice(0, 100).filter(l => l && safeURL(l.url)).map(l => ({ id: text(l.id, 100) || uid('l'), label: text(l.label, 250) || l.url, url: safeURL(l.url) })) : [],
      collapsed: !!data.collapsed, order: num(data.order, -100000, 100000), offsetX: num(data.offsetX, -100000, 100000), offsetY: num(data.offsetY, -100000, 100000)
    };
  }
  function validateStrict(raw) {
    const check=(value,max,label)=>{if(value!=null&&(typeof value!=='string'||value.length>max))throw new Error(label+' en fazla '+max+' karakter olmalı. Dosya değiştirilmedi.');};
    const count=(value,max,label)=>{if(value!=null&&(!Array.isArray(value)||value.length>max))throw new Error(label+' en fazla '+max+' kayıt içerebilir. Dosya değiştirilmedi.');};
    if(raw&&typeof raw==='object'){
      check(raw.name,250,'Çalışma adı');check(raw.id,100,'Çalışma kimliği');count(raw.relations,5000,'İlişkiler');
      for(const n of raw.nodes||[]){
        const limits={title:250,owner:250,ownerUserId:100,role:500,email:320,phone:80,description:20000,responsibilities:20000,goals:20000,notes:100000};
        for(const [k,max] of Object.entries(limits))check(n?.[k],max,k);
        for(const [field,values] of [['kind',KINDS],['status',STATUSES],['priority',PRIORITIES]])if(n?.[field]!=null&&!values.includes(n[field]))throw new Error('Geçersiz kart '+field+' değeri.');
        for(const field of ['progress','order','offsetX','offsetY'])if(n?.[field]!=null&&(typeof n[field]!=='number'||!Number.isFinite(n[field])||(field==='progress'&&(n[field]<0||n[field]>100))||(field!=='progress'&&Math.abs(n[field])>100000)))throw new Error('Geçersiz kart '+field+' değeri.');
        if(n?.color!=null&&!/^#[0-9a-f]{6}$/i.test(n.color))throw new Error('Geçersiz kart rengi.');
        count(n?.tasks,500,'Kartın işleri');count(n?.links,100,'Kartın bağlantıları');count(n?.tags,30,'Etiketler');
        for(const t of n?.tasks||[]){check(t?.text,1000,'İş metni');check(t?.id,100,'İş kimliği');check(t?.assignee,250,'İş sorumlusu');check(t?.assigneeId,100,'Sorumlu kimliği');if(!t?.text)throw new Error('Boş iş metni. Dosya açılmadı.');if(t.dueDate&&!validDate(t.dueDate))throw new Error('Geçersiz iş tarihi.');}
        for(const l of n?.links||[]){check(l?.label,250,'Bağlantı etiketi');check(l?.url,2048,'Bağlantı adresi');if(!safeURL(l?.url))throw new Error('Geçersiz bağlantı. Dosya açılmadı.');}
        for(const tag of n?.tags||[])check(tag,100,'Etiket');
        if(n?.dueDate&&!validDate(n.dueDate))throw new Error('Geçersiz kart tarihi.');
      }
      for(const r of raw.relations||[]){check(r.id,100,'İlişki kimliği');check(r.label,250,'İlişki etiketi');}
    }
    return validate(raw);
  }
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || raw.format !== FORMAT) throw new Error('Bu dosya bir Dal projesi değil. Dal içinden kaydedilmiş JSON dosyasını seçin.');
    if (raw.version !== VERSION) throw new Error('Dosya sürümü desteklenmiyor. Bu uygulama sürüm 1 dosyalarını açar.');
    if (!Array.isArray(raw.nodes) || raw.nodes.length < 1 || raw.nodes.length > MAX_NODES) throw new Error('Proje 1–' + MAX_NODES + ' kart içermeli.');
    const ids = new Set();
    raw.nodes.forEach(n => {
      if (!n || typeof n.id !== 'string' || !n.id || n.id.length > 100 || ids.has(n.id)) throw new Error('Eksik veya tekrarlanan kart kimliği. Dosya açılmadı.');
      ids.add(n.id);
      if (n.parentId != null && (typeof n.parentId !== 'string' || !n.parentId)) throw new Error('Geçersiz üst kart kimliği.');
    });
    const nodes = raw.nodes.map(node), map = new Map(nodes.map(n => [n.id, n]));
    const roots = nodes.filter(n => n.parentId === null);
    if (roots.length !== 1) throw new Error('Şemada tam olarak bir kök kart bulunmalı.');
    for (const n of nodes) {
      let p = n, seen = new Set();
      while (p.parentId !== null) {
        if (seen.has(p.id)) throw new Error('Şemada döngü var; bir kart kendi altına bağlanamaz.');
        seen.add(p.id);
        if (seen.size > MAX_DEPTH) throw new Error('Şema en fazla ' + MAX_DEPTH + ' alt seviye içerebilir.');
        p = map.get(p.parentId);
        if (!p) throw new Error('Üst kartı bulunamayan bir kart var.');
      }
    }
    const relationIds = new Set();
    const relations = (Array.isArray(raw.relations) ? raw.relations : []).slice(0, 5000).map(r => {
      if (!r || !ids.has(r.from) || !ids.has(r.to) || r.from === r.to) throw new Error('Bir ilişkinin uç kartları geçersiz.');
      const id = text(r.id, 100) || uid('r');
      if (relationIds.has(id)) throw new Error('Tekrarlanan ilişki kimliği.');
      relationIds.add(id);
      return { id, from: r.from, to: r.to, label: text(r.label, 250) || 'İş birliği' };
    });
    const s = raw.settings || {};
    return { format: FORMAT, version: VERSION, id: text(raw.id, 100) || uid('doc'), name: text(raw.name, 250) || 'İsimsiz organizasyon',
      createdAt: text(raw.createdAt, 100) || now(), updatedAt: text(raw.updatedAt, 100) || now(),
      sample: !!raw.sample, nodes, relations,
      settings: { layout: ['org', 'tree', 'mind'].includes(s.layout) ? s.layout : 'org', grid: s.grid !== false },
      view: { x: num(raw.view && raw.view.x, -1000000, 1000000), y: num(raw.view && raw.view.y, -1000000, 1000000), scale: num(raw.view && raw.view.scale, .001, 2.5, 1) }
    };
  }
  function children(doc, id) { return doc.nodes.filter(n => n.parentId === id).sort((a, b) => a.order - b.order); }
  function rootNode(doc) { return doc.nodes.find(n => n.parentId === null); }
  function descendants(doc, id, includeSelf = true) {
    const byParent = new Map(); doc.nodes.forEach(n => { if (!byParent.has(n.parentId)) byParent.set(n.parentId, []); byParent.get(n.parentId).push(n.id); });
    const queue = [id], result = [], seen = new Set();
    for (let i = 0; i < queue.length; i++) { const v = queue[i]; if (seen.has(v)) continue; seen.add(v); result.push(v); queue.push(...(byParent.get(v) || [])); }
    return includeSelf ? result : result.slice(1);
  }
  function ancestors(doc, id) { const map = new Map(doc.nodes.map(n => [n.id, n])), arr = []; let n = map.get(id); while (n && n.parentId !== null) { n = map.get(n.parentId); if (n) arr.push(n.id); } return arr; }
  function ordered(doc, visibleOnly = false) {
    const out = [], r = rootNode(doc); if (!r) return out;
    function visit(n, depth, code) { out.push({ node: n, depth, code }); if (!visibleOnly || !n.collapsed) children(doc, n.id).forEach((c, i) => visit(c, depth + 1, code ? code + '.' + (i + 1) : String(i + 1))); }
    visit(r, 0, ''); return out;
  }
  function canReparent(doc, id, parentId) { const n = doc.nodes.find(n => n.id === id); return !!n && n.parentId !== null && doc.nodes.some(n => n.id === parentId) && !descendants(doc, id).includes(parentId); }
  function addNode(doc, parentId, options = {}) {
    if (doc.nodes.length >= MAX_NODES) throw new Error('En fazla ' + MAX_NODES + ' kart eklenebilir.');
    const p = doc.nodes.find(n => n.id === parentId); if (!p) throw new Error('Üst kart bulunamadı.');
    if (ancestors(doc, parentId).length >= MAX_DEPTH) throw new Error('En fazla ' + MAX_DEPTH + ' alt seviye desteklenir.');
    const n = node({ color: p.color, ...options, id: uid(), parentId, order: children(doc, parentId).length ? Math.max(...children(doc, parentId).map(n => n.order)) + 1 : 0 });
    p.collapsed = false; doc.nodes.push(n); return n.id;
  }
  function reparent(doc, id, parentId) {
    if (!canReparent(doc, id, parentId)) throw new Error('Bu bağlantı yapılamaz. Kök kart taşınamaz; bir dal kendi altına bağlanamaz.');
    const branch = descendants(doc, id), baseDepth = ancestors(doc, id).length;
    const maxSubDepth = Math.max(...branch.map(i => ancestors(doc, i).length - baseDepth));
    if (ancestors(doc, parentId).length + 1 + maxSubDepth > MAX_DEPTH) throw new Error('Taşıma sonucunda seviye sınırı aşılır.');
    const n = doc.nodes.find(n => n.id === id); n.parentId = parentId; n.order = Math.max(-1, ...children(doc, parentId).filter(c => c.id !== id).map(c => c.order)) + 1;
    n.offsetX = n.offsetY = 0; doc.nodes.find(n => n.id === parentId).collapsed = false;
  }
  function remove(doc, id) {
    const n = doc.nodes.find(n => n.id === id); if (!n || n.parentId === null) throw new Error('Kök kart silinemez. Yeni bir boş şema oluşturabilirsiniz.');
    const gone = new Set(descendants(doc, id)); doc.nodes = doc.nodes.filter(n => !gone.has(n.id)); doc.relations = doc.relations.filter(r => !gone.has(r.from) && !gone.has(r.to)); return n.parentId;
  }
  function duplicate(doc, id, parentId) {
    const sourceIds = descendants(doc, id), set = new Set(sourceIds);
    if (doc.nodes.length + sourceIds.length > MAX_NODES) throw new Error('Kopyalama kart sınırını aşar.');
    const source = doc.nodes.find(n => n.id === id); if (!source) throw new Error('Kart bulunamadı.');
    const parent = parentId || source.parentId || source.id;
    const parentDepth = ancestors(doc, parent).length + 1, base = ancestors(doc, id).length;
    if (parentDepth + Math.max(...sourceIds.map(i => ancestors(doc, i).length - base)) > MAX_DEPTH) throw new Error('Kopyalama seviye sınırını aşar.');
    if (!doc.nodes.some(n => n.id === parent)) throw new Error('Üst kart bulunamadı.');
    const mapping = new Map(sourceIds.map(i => [i, uid()]));
    const copies = doc.nodes.filter(n => set.has(n.id)).map(n => {
      const c = clone(n); c.id = mapping.get(n.id); c.parentId = n.id === id ? parent : mapping.get(n.parentId);
      c.tasks.forEach(t => t.id = uid('t')); c.links.forEach(l => l.id = uid('l'));
      c.offsetX = c.offsetY = 0; if (n.id === id) { c.title = (c.title + ' (kopya)').slice(0, 250); c.order = Math.max(-1, ...children(doc, parent).map(n => n.order)) + 1; }
      return c;
    });
    const copiedRelations = doc.relations.filter(r => set.has(r.from) && set.has(r.to)).map(r => ({ ...r, id: uid('r'), from: mapping.get(r.from), to: mapping.get(r.to) }));
    doc.nodes.push(...copies); doc.relations.push(...copiedRelations); doc.nodes.find(n => n.id === parent).collapsed = false; return mapping.get(id);
  }
  function reorder(doc, id, delta) { const n = doc.nodes.find(n => n.id === id); if (!n || n.parentId === null) return; const sibs = children(doc, n.parentId), idx = sibs.findIndex(n => n.id === id), j = idx + delta; if (j < 0 || j >= sibs.length) return; [sibs[idx], sibs[j]] = [sibs[j], sibs[idx]]; sibs.forEach((n, i) => n.order = i); }
  function importOutline(doc, parentId, raw) {
    if (typeof raw !== 'string' || raw.length > 1000000) throw new Error('Metin fazla büyük.');
    const lines = raw.replace(/\r/g, '').split('\n').filter(l => l.trim());
    if (!lines.length) throw new Error('En az bir satır yazın.');
    if (doc.nodes.length + lines.length > MAX_NODES) throw new Error('Kart sınırı aşılır.');
    const parsed = lines.map(l => { const leading = l.match(/^[\t ]*/)[0]; const spaces = leading.replace(/\t/g, '  ').length; if (spaces % 2) throw new Error('Girintiler iki boşluğun katı veya Tab olmalı.'); return { depth: spaces / 2, title: l.trim().replace(/^[-*]\s+/, '').slice(0, 250) }; });
    const base = parsed[0].depth, stack = [parentId], created = [];
    for (const line of parsed) { const d = line.depth - base; if (d < 0 || d >= stack.length) throw new Error('Bir seviye atlanmış. Her alt seviye için 2 boşluk veya bir Tab kullanın.'); const id = addNode(doc, stack[d], { title: line.title }); stack[d + 1] = id; stack.length = d + 2; created.push(id); }
    return created;
  }
  function newDocument(template = 'sample') {
    const stamp = now(), doc = { format: FORMAT, version: VERSION, id: uid('doc'), name: 'Organizasyonum', createdAt: stamp, updatedAt: stamp, sample: template !== 'blank', nodes: [], relations: [], settings: { layout: 'org', grid: true }, view: { x: 0, y: 0, scale: 1 } };
    const r = node({ title: template === 'blank' ? 'Ana organizasyon' : 'Genel Koordinasyon', role: template === 'blank' ? '' : 'Karar, öncelik ve koordinasyon', color: COLORS[0] }); doc.nodes.push(r);
    if (template === 'blank') return doc;
    r.notes = 'Bu içerik yalnızca düzenlenebilir bir örnektir; gerçek kurum yapısını, görevleri veya yetkileri temsil etmez.';
    let branches = [
      ['Program & Eğitim', 'Öğrenme ve gelişim', COLORS[1], ['Eğitim Programları', 'Gönüllü Gelişimi']],
      ['İçerik & Dijital', 'İçerik, tasarım ve teknoloji', COLORS[2], ['İçerik Atölyesi', 'Dijital Ürünler']],
      ['Operasyon', 'Kaynak ve süreç yönetimi', COLORS[3], ['İletişim & Paydaşlar', 'İdari İşler']]
    ];
    if (template === 'education') { doc.name = 'Birlikte İyilik / TACEV — öneri'; r.title = 'Ortak Program Koordinasyonu'; r.description = 'ÖNERİ ŞABLONU: Birlikte İyilik ve TACEV için kurgusal çalışma iskeletidir. Hukuki bağlılık, personel ataması veya onaylanmış organizasyon anlamına gelmez.'; branches = [['Eğitim & Programlar','Program geliştirme',COLORS[1],['Mihenk Buluşmaları','Çocuk & Aile Eğitimleri']],['İçerik & Teknoloji','Üretim ve dijital altyapı',COLORS[2],['Eğitim İçerikleri','Web & LMS']],['Gönüllü & Operasyon','Süreklilik ve koordinasyon',COLORS[3],['Gönüllü Koordinasyonu','Etkinlik Operasyonu']]]; }
    if (template === 'project') { doc.name = 'Proje organizasyonu'; r.title = 'Proje Koordinasyonu'; branches = [['Planlama','Kapsam ve hedefler',COLORS[1],['İhtiyaç Analizi','İş Planı']],['Üretim','Uygulama ve teslim',COLORS[2],['İçerik Üretimi','Teknik Uygulama']],['Kalite & Yayın','Kontrol ve takip',COLORS[3],['Kalite Kontrol','Yayın & Ölçüm']]]; }
    branches.forEach(([title, role, color, sub], i) => { const id = addNode(doc, r.id, { title, role, color, status: i === 0 ? 'Devam ediyor' : 'Planlandı', progress: i === 0 ? 35 : 0 }); sub.forEach((t, j) => addNode(doc, id, { title: t, color, kind: j ? 'Birim' : 'Proje', role: j ? 'Sorumlulukları birlikte netleştirin' : 'Hedef ve çıktıları tanımlayın' })); });
    return doc;
  }
  /* Tüm yerleşimler DOM'dan bağımsız hesaplanır. Yaprak istifleme organizasyon görünümünü sıkıştırır. */
  function layout(doc, options = {}) {
    const full = !!options.full, mode = options.mode || doc.settings.layout, r = rootNode(doc), positions = new Map(), edges = [];
    const byParent = new Map(); doc.nodes.forEach(n => { if (!byParent.has(n.parentId)) byParent.set(n.parentId, []); byParent.get(n.parentId).push(n); }); byParent.forEach(list => list.sort((a, b) => a.order - b.order));
    const kids = n => !full && n.collapsed ? [] : (byParent.get(n.id) || []);
    const V = 54, G = 34, IND = 26;
    if (mode === 'org') {
      const metrics = new Map();
      function measure(n) { const c = kids(n), stacked = n.id !== r.id && c.length > 0 && c.every(k => !kids(k).length); let m;
        c.forEach(measure);
        if (!c.length) m = { w: W, h: H, stacked: false };
        else if (stacked) m = { w: W + IND, h: H + V + c.length * (H + 22) - 22, stacked: true };
        else m = { w: Math.max(W, c.reduce((a, k) => a + metrics.get(k.id).w, 0) + G * (c.length - 1)), h: H + V + Math.max(...c.map(k => metrics.get(k.id).h)), stacked: false };
        metrics.set(n.id, m); return m;
      }
      function put(n, x, y) { const m = metrics.get(n.id), c = kids(n); positions.set(n.id, { x: x + (m.stacked ? 0 : (m.w - W) / 2), y, w: W, h: H });
        if (m.stacked) c.forEach((k, i) => { put(k, x + IND, y + H + V + i * (H + 22)); edges.push({ from: n.id, to: k.id, kind: 'stack' }); });
        else { let cx = x; c.forEach(k => { put(k, cx, y + H + V); cx += metrics.get(k.id).w + G; edges.push({ from: n.id, to: k.id, kind: 'org' }); }); }
      }
      measure(r); put(r, 0, 0);
    } else {
      const heights = new Map(), GAP = 28, XGAP = 78;
      function measure(n) { const c = kids(n); c.forEach(measure); const h = Math.max(H, c.reduce((s, k) => s + heights.get(k.id), 0) + Math.max(0, c.length - 1) * GAP); heights.set(n.id, h); return h; }
      function put(n, x, top, sign) { const h = heights.get(n.id); positions.set(n.id, { x, y: top + (h - H) / 2, w: W, h: H }); let cy = top; kids(n).forEach(k => { put(k, x + sign * (W + XGAP), cy, sign); cy += heights.get(k.id) + GAP; edges.push({ from: n.id, to: k.id, kind: sign > 0 ? 'right' : 'left' }); }); }
      measure(r);
      if (mode === 'tree') put(r, 0, 0, 1);
      else { positions.set(r.id, { x: 0, y: 0, w: W, h: H }); const groups = [[], []], sums = [0, 0]; kids(r).forEach(k => { const side = sums[0] <= sums[1] ? 0 : 1; groups[side].push(k); sums[side] += heights.get(k.id) + GAP; }); groups.forEach((list, i) => { let cy = (H - Math.max(0, sums[i] - GAP)) / 2; const sign = i === 0 ? 1 : -1; list.forEach(k => { put(k, sign * (W + XGAP), cy, sign); edges.push({ from: r.id, to: k.id, kind: sign > 0 ? 'right' : 'left' }); cy += heights.get(k.id) + GAP; }); }); }
    }
    // Bir düğümün manuel kaydırması bütün alt dalına uygulanır.
    const shifts = new Map();
    for (const { node: n } of ordered(doc)) { const parent = shifts.get(n.parentId) || { x: 0, y: 0 }; const s = { x: parent.x + n.offsetX, y: parent.y + n.offsetY }; shifts.set(n.id, s); const p = positions.get(n.id); if (p) { p.x += s.x; p.y += s.y; } }
    return { positions, edges, bounds: bounds(positions) };
  }
  function bounds(positions) { const v = [...positions.values()]; if (!v.length) return { x: 0, y: 0, w: W, h: H }; const x = Math.min(...v.map(p => p.x)), y = Math.min(...v.map(p => p.y)); return { x, y, w: Math.max(...v.map(p => p.x + p.w)) - x, h: Math.max(...v.map(p => p.y + p.h)) - y }; }
  function edgePath(edge, pos) { const a = pos.get(edge.from), b = pos.get(edge.to); if (!a || !b) return ''; if (edge.kind === 'stack') return `M ${a.x + 12} ${a.y + H} V ${b.y + H / 2} H ${b.x}`;
    if (edge.kind === 'org') { const x1 = a.x + W / 2, x2 = b.x + W / 2, y1 = a.y + H, y2 = b.y, mid = (y1 + y2) / 2; return `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`; }
    const right = edge.kind === 'right', x1 = a.x + (right ? W : 0), x2 = b.x + (right ? 0 : W), y1 = a.y + H / 2, y2 = b.y + H / 2, mid = (x1 + x2) / 2; return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  }
  function relationGeometry(r, pos) { const a = pos.get(r.from), b = pos.get(r.to); if (!a || !b) return null; const right = b.x + W / 2 >= a.x + W / 2, x1 = a.x + (right ? W : 0), x2 = b.x + (right ? 0 : W), y1 = a.y + H / 2, y2 = b.y + H / 2, bend = Math.max(65, Math.abs(x2 - x1) * .35), sign = right ? 1 : -1; return { path: `M ${x1} ${y1} C ${x1 + sign * bend} ${y1 - 65}, ${x2 - sign * bend} ${y2 - 65}, ${x2} ${y2}`, x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 49 }; }
  class Store {
    constructor(doc) { this.doc = validate(doc); this.past = []; this.future = []; this.listeners = []; this.lastMerge = ''; this.lastEdit = 0; }
    subscribe(fn) { this.listeners.push(fn); return () => this.listeners = this.listeners.filter(f => f !== fn); }
    notify(meta = {}) { this.listeners.forEach(fn => fn(this.doc, meta)); }
    change(fn, options = {}) { const previous = clone(this.doc); try { fn(this.doc); } catch (e) { this.doc = previous; throw e; } if (JSON.stringify(previous) === JSON.stringify(this.doc)) return false;
      const t = Date.now(), merging = options.mergeKey && options.mergeKey === this.lastMerge && t - this.lastEdit < 1200;
      if (!merging) { this.past.push(previous); if (this.past.length > 80) this.past.shift(); }
      this.lastMerge = options.mergeKey || ''; this.lastEdit = t; this.future = []; this.doc.updatedAt = now(); this.notify(options); return true;
    }
    undo() { if (!this.past.length) return false; this.future.push(clone(this.doc)); this.doc = this.past.pop(); this.lastMerge = ''; this.doc.updatedAt = now(); this.notify({ history: true }); return true; }
    redo() { if (!this.future.length) return false; this.past.push(clone(this.doc)); this.doc = this.future.pop(); this.lastMerge = ''; this.doc.updatedAt = now(); this.notify({ history: true }); return true; }
    replace(doc) { const valid = validate(doc); this.doc = valid; this.past = []; this.future = []; this.lastMerge = ''; this.notify({ replace: true }); }
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function csvCell(value) { let s = String(value == null ? '' : value); if (/^[\s]*[=+@-]/.test(s) || /^[\t\r\n]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }
  function csv(doc) { const map = new Map(doc.nodes.map(n => [n.id, n])); const rows = [['Kod','Kart kimliği','Başlık','Tür','Üst kart kimliği','Üst birim','Sorumlu','Rol','E-posta','Telefon','Durum','Öncelik','İlerleme (%)','Son tarih','Etiketler','Açıklama','Sorumluluklar','Hedefler','Notlar','İşler (tamamlanan/toplam)','İş ayrıntıları','Bağlantılar']]; ordered(doc).forEach(({node:n,code}) => rows.push([code,n.id,n.title,n.kind,n.parentId || '',map.get(n.parentId)?.title || '',n.owner,n.role,n.email,n.phone,n.status,n.priority,n.progress,n.dueDate,n.tags.join(', '),n.description,n.responsibilities,n.goals,n.notes,n.tasks.filter(t=>t.done).length+'/'+n.tasks.length,n.tasks.map(t=>(t.done?'[x] ':'[ ] ')+t.text+(t.assignee?' | '+t.assignee:'')+(t.dueDate?' | '+t.dueDate:'')).join('\n'),n.links.map(l=>l.label+': '+l.url).join('\n')])); return '\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n'); }
  function markdown(doc) { const lines = ['# ' + doc.name, '', '> Dal organizasyon dökümü. Hiyerarşi, kart kimliği ve üst kart ile de belirtilmiştir.', '']; ordered(doc).forEach(({node:n,depth,code}) => { lines.push('#'.repeat(Math.min(6,depth+2))+' '+(code?code+' — ':'')+n.title,'',`- Kimlik: ${n.id}`,`- Üst kart: ${n.parentId || 'Kök'}`,`- Tür: ${n.kind}`,`- Sorumlu: ${n.owner || 'Atanmadı'}`,`- Durum: ${n.status} | Öncelik: ${n.priority} | İlerleme: %${n.progress}`); [['Rol',n.role],['E-posta',n.email],['Telefon',n.phone],['Son tarih',n.dueDate],['Etiketler',n.tags.join(', ')],['Açıklama',n.description],['Sorumluluklar',n.responsibilities],['Hedefler',n.goals],['Notlar',n.notes]].forEach(([k,v]) => {if(v) lines.push('', '**'+k+'**', '', v);}); if(n.tasks.length) lines.push('','**İşler**','',...n.tasks.map(t=>`- [${t.done?'x':' '}] ${t.text}${t.assignee?' — '+t.assignee:''}${t.dueDate?' — '+t.dueDate:''}`)); if(n.links.length) lines.push('','**Bağlantılar**','',...n.links.map(l=>'- '+l.label+': '+l.url)); lines.push('','---',''); }); if(doc.relations.length) { const map=new Map(doc.nodes.map(n=>[n.id,n])); lines.push('## Çapraz ilişkiler','',...doc.relations.map(r=>`- ${map.get(r.from).title} → ${map.get(r.to).title}: ${r.label}`)); } return lines.join('\n'); }
  return { FORMAT, VERSION, MAX_NODES, MAX_DEPTH, W, H, COLORS, KINDS, STATUSES, PRIORITIES, uid, clone, node, validate, validateStrict, safeURL, validDate, children, rootNode, descendants, ancestors, ordered, canReparent, addNode, reparent, remove, duplicate, reorder, importOutline, newDocument, layout, bounds, edgePath, relationGeometry, Store, esc, csv, markdown };
});
