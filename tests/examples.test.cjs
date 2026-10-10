const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../web/core');
const X=require('../web/coordination-model');
const E=require('../web/examples');
const user={id:'verified-owner',name:'Ekip Yöneticisi'};

test('example documents are valid, bounded and identify all fictional people without creating login IDs',()=>{
  const plans=E.plans(user,'2026-10-10');
  assert.equal(plans.length,4);
  assert.equal(new Set(plans.map(p=>p.doc.name)).size,4);
  const people=plans.flatMap(p=>p.doc.nodes.filter(n=>n.kind==='Kişi'));
  assert.equal(people.length,8);
  for(const p of plans){
    assert.deepEqual(C.validateStrict(p.doc),p.doc);
    assert.ok(E.isExample(p.doc));
    assert.ok(C.rootNode(p.doc).tags.includes('ekip-örnek-set-v1'));
    assert.ok(Buffer.byteLength(JSON.stringify(p.doc))<750000);
    assert.ok(p.doc.nodes.every(n=>!n.ownerUserId||n.ownerUserId===user.id));
    assert.ok(p.doc.nodes.flatMap(n=>n.tasks).every(t=>!t.assigneeId));
  }
  assert.ok(people.every(n=>!n.ownerUserId&&!n.email&&!n.phone));
});

test('examples cover every task state and keep dates relative to the chosen Istanbul day',()=>{
  const tasks=E.plans(user,'2026-10-10').flatMap(p=>p.doc.nodes.filter(n=>n.kind==='Görev'));
  assert.equal(tasks.length,19);
  assert.deepEqual(new Set(tasks.map(t=>t.status)),new Set(C.STATUSES));
  const mine=tasks.filter(t=>t.ownerUserId===user.id);
  assert.equal(mine.length,6);
  assert.ok(mine.some(t=>t.dueDate==='2026-10-10'));
  assert.ok(mine.some(t=>t.dueDate<'2026-10-10'));
  assert.ok(mine.some(t=>t.dueDate>'2026-10-10'));
  const later=E.plans(user,'2026-11-01').flatMap(p=>p.doc.nodes.filter(n=>n.kind==='Görev'));
  assert.equal(later[0].dueDate,'2026-11-01');
});

test('meetings, comments and dependencies reference their own board and only the real owner is an attendee',()=>{
  for(const p of E.plans(user,'2026-10-10')){
    const ids=new Set(p.doc.nodes.map(n=>n.id)),metadata={};
    for(const c of p.comments){assert.ok(ids.has(c.nodeId));assert.ok(c.body.startsWith('Örnek not:'));}
    for(const m of p.metadata){metadata[m.nodeId]=X.validateMeta(m,p.doc.nodes,m.nodeId);}
    assert.ok(X.assertAcyclic(metadata));
    for(const event of p.events){const value=X.event(event);assert.deepEqual(value.attendees,[user.id]);assert.ok(value.decisions.every(d=>ids.has(d.nodeId)));}
  }
});

test('fictional people are derived only from marked sample boards, without mixing real account IDs',()=>{
  const p=E.plans(user,'2026-10-10')[0];
  const data={boards:[{id:'example',name:p.doc.name,sample:true},{id:'real',name:'Kurum',sample:false}],units:p.doc.nodes.map(n=>({...n,nodeId:n.id,nodeTitle:n.title,boardId:'example'}))};
  data.units.push({kind:'Kişi',nodeId:'real-user',nodeTitle:'Gerçek Üye',owner:'Gerçek Üye',boardId:'real'});
  const out=E.people(data);
  assert.equal(out.length,8);
  assert.equal(new Set(out.map(u=>u.id)).size,8);
  assert.ok(out.every(u=>u.example&&u.id.startsWith('example-person:')));
  assert.ok(!out.some(u=>u.name==='Gerçek Üye'));
});
