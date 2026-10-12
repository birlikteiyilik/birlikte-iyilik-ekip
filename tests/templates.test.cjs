const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../web/core'),T=require('../web/templates');
test('Ready templates are bounded valid documents without people, account IDs or invented deadlines',()=>{
  for(const t of T.catalog){const d=T.create(t.id,'Yeni çalışma');C.validateStrict(d);assert.ok(d.nodes.length>=6&&d.nodes.length<=15);assert.equal(d.settings.layout,t.layout);assert.equal(d.name,'Yeni çalışma');assert.equal(d.sample,false);for(const n of d.nodes){assert.equal(n.ownerUserId,'');assert.equal(n.owner,'');assert.equal(n.dueDate,'');assert.equal(n.email,'');assert.equal(n.phone,'');}}
});
test('Role template starts without tasks; work templates offer six actionable tasks',()=>{
  assert.equal(T.create('team','Ekip').nodes.filter(n=>n.kind==='Görev').length,0);
  for(const id of ['plan','event','volunteer'])assert.equal(T.create(id,'Proje').nodes.filter(n=>n.kind==='Görev'&&n.status==='Planlandı').length,6);
});
test('Creating and editing one instance cannot change another template or its shared catalog',()=>{
  const catalog=JSON.stringify(T.catalog),a=T.create('event','A'),b=T.create('event','B');
  assert.notEqual(a.id,b.id);const ids=new Set(a.nodes.map(n=>n.id));assert.ok(b.nodes.every(n=>!ids.has(n.id)));a.nodes[1].title='Değişen alan';assert.equal(JSON.stringify(T.catalog),catalog);assert.equal(b.nodes[1].title,'Program');
});
test('Unknown template and invalid names are rejected before a create request',()=>{
  for(const [id,name] of [['unknown','Proje'],['plan','  '],['event','x'.repeat(251)],['team',null]])assert.throws(()=>T.create(id,name));
});

test('Management structures model distinct scopes and real matrix relations without access grants',()=>{
  const macro=T.create('macro','Kurum'),micro=T.create('micro','Ekip'),flat=T.create('flat','Yatay');assert.equal(macro.nodes.filter(n=>n.kind==='Görev').length,0);assert.equal(micro.nodes.filter(n=>n.kind==='Görev').length,6);assert.equal(micro.nodes.filter(n=>n.kind==='Kişi').length,3);assert.ok(flat.nodes.slice(1).every(n=>n.parentId===flat.nodes[0].id));
  const matrix=T.create('matrix','Çapraz ekip');assert.equal(matrix.relations.length,4);for(const r of matrix.relations){const a=matrix.nodes.find(n=>n.id===r.from),b=matrix.nodes.find(n=>n.id===r.to);assert.notEqual(a.parentId,b.parentId);assert.equal(a.title.split(' · ')[0],b.title.split(' · ')[0]);assert.match(r.label,/koordinasyonu/);}
  const pyramid=T.create('pyramid','Kademeler');assert.equal(Math.max(...C.ordered(pyramid).map(x=>x.depth)),3);
});
