/* Çalıştırma: node --test tests/core.test.cjs — ek paket gerekmez. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../web/core.js');
const blank = () => C.newDocument('blank');
const demo = () => C.newDocument('sample');
const root = d => C.rootNode(d).id;
function tree() { const d = blank(), r = root(d), a = C.addNode(d,r,{title:'A'}), b = C.addNode(d,r,{title:'B'}), c = C.addNode(d,a,{title:'C'}); return {d,r,a,b,c}; }
function noOverlap(layout) { const values=[...layout.positions.values()]; for(let i=0;i<values.length;i++) for(let j=i+1;j<values.length;j++){const a=values[i],b=values[j];assert.ok(!(a.x<b.x+b.w-.01&&a.x+a.w>b.x+.01&&a.y<b.y+b.h-.01&&a.y+a.h>b.y+.01),`Kartlar çakıştı: ${i}, ${j}`);} }

test('01 · Boş belge tek köklü ve doğrulanabilir',()=>{const d=blank();assert.equal(d.nodes.length,1);assert.equal(C.validate(d).nodes.length,1);});
test('02 · Dört şablonun biçimi geçerli; kurum şablonu öneri olarak işaretli',()=>{for(const name of ['blank','sample','education','project'])C.validate(C.newDocument(name));const d=C.newDocument('education');assert.ok(d.sample);assert.match(d.nodes[0].description,/ÖNERİ ŞABLONU/);});
test('03 · Alt kart kalıtımlı renk ve sıralamayla eklenir',()=>{const {d,r}=tree();const id=C.addNode(d,r,{title:'Türkçe İşi'}),n=d.nodes.find(n=>n.id===id);assert.equal(n.color,d.nodes[0].color);assert.equal(n.order,2);});
test('04 · Alt kart ekleme kapalı üst dalı açar',()=>{const d=blank();d.nodes[0].collapsed=true;C.addNode(d,root(d));assert.equal(d.nodes[0].collapsed,false);});
test('05 · Döngü oluşturacak taşıma engellenir',()=>{const {d,a,c}=tree();assert.equal(C.canReparent(d,a,c),false);assert.throws(()=>C.reparent(d,a,c));});
test('06 · Kök taşıma ve silme engellenir',()=>{const {d,r,a}=tree();assert.throws(()=>C.reparent(d,r,a));assert.throws(()=>C.remove(d,r));});
test('07 · Dal taşıma kimlikleri ve alt hiyerarşiyi korur',()=>{const {d,a,b,c}=tree();C.reparent(d,a,b);assert.equal(d.nodes.find(n=>n.id===a).parentId,b);assert.equal(d.nodes.find(n=>n.id===c).parentId,a);C.validate(d);});
test('08 · Dal silme alt kartları ve bağlı çapraz ilişkileri temizler',()=>{const {d,a,b,c}=tree();d.relations.push({id:'r1',from:c,to:b,label:'Bilgi'});C.remove(d,a);assert.equal(d.nodes.length,2);assert.equal(d.relations.length,0);});
test('09 · Çoğaltma alt kartlar, işler, notlar ve iç ilişkileri kopyalar',()=>{const {d,a,c}=tree();const aNode=d.nodes.find(n=>n.id===a);aNode.notes='Not';aNode.tasks=[{id:'t1',text:'İş',done:false,assignee:'Kişi',assigneeId:'',dueDate:''}];d.relations.push({id:'r1',from:a,to:c,label:'Danışma'});const id=C.duplicate(d,a);assert.equal(C.descendants(d,id).length,2);const copied=d.nodes.find(n=>n.id===id);assert.equal(copied.notes,'Not');assert.notEqual(copied.tasks[0].id,'t1');assert.equal(d.relations.length,2);C.validate(d);});
test('10 · Kök çoğaltıldığında yeni kopya mevcut kökün altına eklenir',()=>{const d=demo(),id=C.duplicate(d,root(d));assert.equal(d.nodes.length,20);assert.equal(d.nodes.find(n=>n.id===id).parentId,root(d));C.validate(d);});
test('11 · Sıralama üst-alt ilişkisini değiştirmez',()=>{const {d,r,a,b}=tree();C.reorder(d,b,-1);assert.equal(C.children(d,r)[0].id,b);assert.equal(d.nodes.find(n=>n.id===a).parentId,r);});
test('12 · Geri al / yinele değişiklikleri döndürür',()=>{const s=new C.Store(blank()),r=root(s.doc);s.change(d=>C.addNode(d,r,{title:'İlk'}));assert.equal(s.doc.nodes.length,2);s.undo();assert.equal(s.doc.nodes.length,1);s.redo();assert.equal(s.doc.nodes.length,2);});
test('13 · Arka arkaya aynı alan yazımı tek geri alma grubudur',()=>{const s=new C.Store(blank());s.change(d=>d.name='A',{mergeKey:'name'});s.change(d=>d.name='AB',{mergeKey:'name'});assert.equal(s.past.length,1);s.undo();assert.equal(s.doc.name,'Organizasyonum');});
test('14 · Başarısız işlem kısmi veri bırakmaz',()=>{const s=new C.Store(blank()),before=JSON.stringify(s.doc);assert.throws(()=>s.change(d=>{C.addNode(d,root(d));throw new Error('Dur');}));assert.equal(JSON.stringify(s.doc),before);assert.equal(s.past.length,0);});
test('15 · Yeni işlem, geri alınmış geleceği temizler',()=>{const s=new C.Store(blank());s.change(d=>d.name='A');s.undo();s.change(d=>d.name='B');assert.equal(s.future.length,0);});
test('16 · Bozuk yeni belge mevcut belgeyi değiştirmez',()=>{const s=new C.Store(blank()),before=s.doc;assert.throws(()=>s.replace({}));assert.equal(s.doc,before);});
test('17 · Girintili metin hiyerarşiye dönüşür',()=>{const d=blank(),ids=C.importOutline(d,root(d),'Birim A\n  Alt A\n    Daha alt\nBirim B\n\tAlt B');assert.equal(ids.length,5);assert.equal(d.nodes.find(n=>n.id===ids[2]).parentId,ids[1]);assert.equal(d.nodes.find(n=>n.id===ids[4]).parentId,ids[3]);});
test('18 · Girinti atlama ve tek boşlukla hatalı satır reddedilir',()=>{const s=new C.Store(blank());for(const raw of ['A\n    B','A\n B']){assert.throws(()=>s.change(d=>C.importOutline(d,root(d),raw)));assert.equal(s.doc.nodes.length,1);}});
test('19 · Boş metin kart üretmez',()=>{const d=blank();assert.throws(()=>C.importOutline(d,root(d),'\n  \n'));assert.equal(d.nodes.length,1);});
test('20 · Biçim ve sürüm kontrolü',()=>{assert.throws(()=>C.validate({format:'başka',version:1,nodes:[]}));const d=blank();d.version=999;assert.throws(()=>C.validate(d));});
test('21 · Yinelenen kimlik, yetim, çoklu kök ve döngü reddedilir',()=>{const d=demo(),a=C.clone(d);a.nodes[1].id=a.nodes[0].id;assert.throws(()=>C.validate(a));const b=C.clone(d);b.nodes[1].parentId='yok';assert.throws(()=>C.validate(b));const c=C.clone(d);c.nodes[1].parentId=null;assert.throws(()=>C.validate(c));const f=C.clone(d);f.nodes[1].parentId=f.nodes[2].id;assert.throws(()=>C.validate(f));});
test('22 · Geçersiz ilişki ucu ve tekrarlanan ilişki kimliği reddedilir',()=>{const {d,a,b}=tree();d.relations.push({id:'r',from:a,to:'yok'});assert.throws(()=>C.validate(d));d.relations=[{id:'r',from:a,to:b},{id:'r',from:b,to:a}];assert.throws(()=>C.validate(d));});
test('23 · 60 alt seviye sınırı uygulanır',()=>{const d=blank();let id=root(d);for(let i=0;i<60;i++)id=C.addNode(d,id);C.validate(d);assert.throws(()=>C.addNode(d,id));});
test('24 · 2.000 kart sınırı uygulanır',()=>{const d=blank();for(let i=1;i<2000;i++)d.nodes.push(C.node({id:'n'+i,parentId:root(d),order:i}));assert.equal(C.validate(d).nodes.length,2000);assert.throws(()=>C.addNode(d,root(d)));});
test('25 · Derin taşıma sınırı sessizce aşılmaz',()=>{const d=blank();let id=root(d);for(let i=0;i<59;i++)id=C.addNode(d,id);const a=C.addNode(d,root(d)),b=C.addNode(d,a);assert.throws(()=>C.reparent(d,a,id));});
test('26 · Renk, yüzde ve tarih girdileri normalleştirilir',()=>{const n=C.node({color:'red; background:url(x)',progress:999,dueDate:'2026-02-30'});assert.equal(n.color,C.COLORS[0]);assert.equal(n.progress,100);assert.equal(n.dueDate,'');assert.equal(C.validDate('2024-02-29'),'2024-02-29');});
test('27 · Tehlikeli bağlantılar çalıştırılabilir adres olarak kabul edilmez',()=>{for(const url of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd','vbscript:msgbox(1)'])assert.equal(C.safeURL(url),'');assert.equal(C.safeURL('https://example.com/a?x=1'),'https://example.com/a?x=1');});
test('28 · HTML/XML kaçışı kullanıcı metnini kod olmaktan çıkarır',()=>{assert.equal(C.esc('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');});
test('29 · CSV hücrelerinde formül enjeksiyonuna karşı metin öneki',()=>{const d=blank();d.nodes[0].title='=1+1';d.nodes[0].owner=' +SUM(1)';const csv=C.csv(d);assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes('"\'=1+1"'));assert.ok(csv.includes('"\' +SUM(1)"'));});
test('30 · CSV uzun not, satır sonu ve tırnakları korur',()=>{const d=blank();d.nodes[0].notes='İlk satır\n"İkinci"; üçüncü';assert.ok(C.csv(d).includes('"İlk satır\n""İkinci""; üçüncü"'));});
test('31 · Markdown görev ve çapraz ilişkileri içerir',()=>{const {d,a,b}=tree();d.nodes.find(n=>n.id===a).tasks=[{id:'t',text:'Toplantı',done:true,assignee:'Elif',dueDate:'2026-10-10'}];d.relations=[{id:'r',from:a,to:b,label:'Koordinasyon'}];const text=C.markdown(d);assert.match(text,/- \[x\] Toplantı/);assert.match(text,/A → B: Koordinasyon/);});
test('32 · Altı yerleşimde kartlar çakışmaz',()=>{const d=demo();for(const mode of C.LAYOUTS){const L=C.layout(d,{mode});assert.equal(L.positions.size,10);noOverlap(L);}});
test('33 · Karma derinlikli büyük ağaç altı görünümde çakışmaz',()=>{const d=blank();for(let i=0;i<5;i++){const p=C.addNode(d,root(d));for(let j=0;j<3;j++){const a=C.addNode(d,p);if(j%2)for(let k=0;k<3;k++)C.addNode(d,a);}}for(const mode of C.LAYOUTS)noOverlap(C.layout(d,{mode}));});
test('34 · Kapalı dal görünümden kalkar, tam çıktıdan kalkmaz',()=>{const d=demo();d.nodes[1].collapsed=true;assert.equal(C.layout(d).positions.size,8);assert.equal(C.layout(d,{full:true}).positions.size,10);});
test('35 · Manuel taşıma alt dal konumlarına miras kalır',()=>{const {d,a,c}=tree(),before=C.layout(d);d.nodes.find(n=>n.id===a).offsetX=55;d.nodes.find(n=>n.id===a).offsetY=-30;const after=C.layout(d);for(const id of [a,c]){assert.equal(after.positions.get(id).x-before.positions.get(id).x,55);assert.equal(after.positions.get(id).y-before.positions.get(id).y,-30);}});
test('36 · Çizgi üretimi sonlu koordinatlar üretir',()=>{const d=demo();for(const mode of C.LAYOUTS){const L=C.layout(d,{mode});for(const edge of L.edges){const p=C.edgePath(edge,L.positions);assert.ok(p.startsWith('M '));assert.doesNotMatch(p,/NaN|undefined|Infinity/);}const g=C.relationGeometry({from:d.nodes[1].id,to:d.nodes[4].id},L.positions);assert.ok(g.path);}});
test('37 · JSON turu bütün ayrıntıları korur',()=>{const d=demo(),n=d.nodes[1];n.email='a@example.com';n.phone='+90 555';n.notes='Türkçe: ığüşöç İ';n.tags=['eğitim'];n.links=[{id:'l',url:'https://example.com',label:'Kaynak'}];n.tasks=[{id:'t',text:'İş',done:true,assignee:'Kişi',assigneeId:'',dueDate:'2026-10-10'}];assert.deepEqual(C.validate(JSON.parse(JSON.stringify(d))),d);});
test('38 · Kötü niyetli nesne alanları modelde tutulmaz',()=>{const raw=JSON.parse(JSON.stringify(blank()));raw.nodes[0]['__proto__']={polluted:true};raw.nodes[0].unexpected='<script>';const clean=C.validate(raw);assert.equal(clean.nodes[0].unexpected,undefined);assert.equal({}.polluted,undefined);});
test('39 · 2.000 kartlık yerleşim sonlu ve tamdır',()=>{const d=blank();for(let i=1;i<2000;i++)d.nodes.push(C.node({id:'p'+i,parentId:root(d),order:i}));const start=Date.now();for(const mode of C.LAYOUTS){const L=C.layout(d,{mode});assert.equal(L.positions.size,2000);for(const p of L.positions.values())for(const v of Object.values(p))assert.ok(Number.isFinite(v));assert.ok(Number.isFinite(L.bounds.h));}assert.ok(Date.now()-start<10000);});


test('40 · New diagram layouts keep collapse, exports and inherited manual positions',()=>{
  for(const mode of ['radial','pyramid','matrix']){const {d,a,c}=tree();d.settings.layout=mode;assert.equal(C.validateStrict(JSON.parse(JSON.stringify(d))).settings.layout,mode);const before=C.layout(d);d.nodes.find(n=>n.id===a).offsetX=47;d.nodes.find(n=>n.id===a).offsetY=-19;const after=C.layout(d);for(const id of [a,c]){assert.equal(after.positions.get(id).x-before.positions.get(id).x,47);assert.equal(after.positions.get(id).y-before.positions.get(id).y,-19);}d.nodes.find(n=>n.id===a).collapsed=true;assert.equal(C.layout(d).positions.size,3);assert.equal(C.layout(d,{full:true}).positions.size,4);for(const edge of C.layout(d,{full:true}).edges)assert.doesNotMatch(C.edgePath(edge,C.layout(d,{full:true}).positions),/NaN|Infinity|undefined/);}
});
test('41 · Circular levels share rings and remain separated in uneven branches',()=>{
  const d=blank();for(let i=0;i<7;i++){const a=C.addNode(d,root(d));for(let j=0;j<(i===0?22:2);j++)C.addNode(d,a);}
  const L=C.layout(d,{mode:'radial'});noOverlap(L);const radii=C.children(d,root(d)).map(n=>Math.hypot(L.positions.get(n.id).x,L.positions.get(n.id).y));assert.ok(radii.every(v=>Math.abs(v-radii[0])<.001));assert.ok(radii[0]>C.W);
});
test('42 · Pyramid levels are centered and matrix columns have aligned role rows',()=>{
  const d=demo(),P=C.layout(d,{mode:'pyramid'}),levels=new Map();for(const {node,depth} of C.ordered(d)){if(!levels.has(depth))levels.set(depth,[]);levels.get(depth).push(P.positions.get(node.id));}for(const row of levels.values()){assert.ok(row.every(p=>p.y===row[0].y));const min=Math.min(...row.map(p=>p.x)),max=Math.max(...row.map(p=>p.x));assert.equal((min+max)/2,0);}
  const M=C.layout(d,{mode:'matrix'}),units=C.children(d,root(d));for(const unit of units){const x=M.positions.get(unit.id).x;for(const id of C.descendants(d,unit.id))assert.equal(M.positions.get(id).x,x);}for(let i=0;i<2;i++){const ys=units.map(n=>M.positions.get(C.children(d,n.id)[i].id).y);assert.ok(ys.every(y=>y===ys[0]));}
});

test('43 · Branch completion includes folded work and matches the project counting rule',()=>{
  const P=require('../web/presentation-model.js'),{d,r,a,b,c}=tree();
  const unit=d.nodes.find(n=>n.id===a);unit.collapsed=true;unit.progress=95;
  const task=d.nodes.find(n=>n.id===c);task.kind='Görev';task.status='Tamamlandı';task.tasks=[
    {id:'detail',text:'Checklist detail',done:false,assignee:'Name only',assigneeId:'',dueDate:''},
    {id:'assigned',text:'Independent assigned work',done:false,assignee:'Person',assigneeId:'person-id',dueDate:''},
    {id:'dated',text:'Independent dated work',done:true,assignee:'',assigneeId:'',dueDate:'2026-10-12'}
  ];
  const other=d.nodes.find(n=>n.id===b);other.tasks=[{id:'unit-step',text:'Unit work',done:false,assignee:'',assigneeId:'',dueDate:''}];
  d.relations=[{id:'cross',from:b,to:c,label:'Shared link'}];
  const before=JSON.stringify(d),p=C.branchProgress(d),items=P.workItems(d);
  assert.equal(JSON.stringify(d),before);assert.deepEqual(p.get(r),{total:4,done:2,open:2,percent:50});
  assert.deepEqual(p.get(a),{total:3,done:2,open:1,percent:67});assert.deepEqual(p.get(c),p.get(a));
  assert.equal(p.get(r).total,items.length);assert.equal(p.get(r).done,items.filter(t=>t.done).length);
});
test('44 · Branch completion weights tasks, then recomputes after completion and moving a branch',()=>{
  const {d,r,a,b,c}=tree();const first=d.nodes.find(n=>n.id===c);first.kind='Görev';first.status='Tamamlandı';
  for(let i=0;i<9;i++)C.addNode(d,b,{kind:'Görev',title:'Open '+i});
  let p=C.branchProgress(d);assert.equal(p.get(a).percent,100);assert.equal(p.get(b).percent,0);assert.equal(p.get(r).percent,10);
  const next=C.children(d,b)[0];next.status='Tamamlandı';p=C.branchProgress(d);assert.equal(p.get(r).percent,20);assert.equal(p.get(b).percent,11);
  C.reparent(d,c,b);p=C.branchProgress(d);assert.deepEqual(p.get(a),{total:0,done:0,open:0,percent:0});assert.equal(p.get(b).percent,20);
  C.remove(d,c);assert.equal(C.branchProgress(d).get(r).percent,11);
});
test('45 · Empty structural cards do not pretend to be completed and every layout uses taller progress cards',()=>{
  const d=blank();d.nodes[0].status='Tamamlandı';d.nodes[0].progress=100;
  assert.deepEqual(C.branchProgress(d).get(root(d)),{total:0,done:0,open:0,percent:0});
  const big=demo();for(const mode of C.LAYOUTS){const L=C.layout(big,{mode});noOverlap(L);assert.ok([...L.positions.values()].every(p=>p.h===168));}
});
