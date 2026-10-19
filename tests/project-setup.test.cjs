'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../web/core'),T=require('../web/templates'),P=require('../web/project-setup');
const people=[{id:'creator',name:'Yönetici',active:true},{id:'member',name:'Deniz',active:true},{id:'closed',name:'Kapalı',active:false}];
test('project preparation preserves the template and assigns existing people once',()=>{
 const draft=T.create('matrix','Taslak'),node=draft.nodes[2];node.ownerUserId='member';node.dueDate='2026-10-24';C.rootNode(draft).ownerUserId='creator';
 const p=P.prepare(draft,'  Etkinlik  ',people,'creator');
 assert.equal(p.doc.name,'Etkinlik');assert.equal(C.rootNode(p.doc).title,'Etkinlik');assert.equal(p.doc.nodes[2].owner,'Deniz');assert.equal(p.doc.nodes[2].dueDate,'2026-10-24');assert.deepEqual(p.memberIds,['creator','member']);assert.deepEqual(p.doc.relations,draft.relations);assert.equal(p.doc.settings.layout,'matrix');assert.equal(draft.name,'Taslak');
});
test('blank first row is optional but an assigned unnamed job is rejected',()=>{
 const draft=C.newDocument('blank'),nid=P.addWork(draft);
 assert.equal(P.prepare(draft,'Proje',people,'creator',[nid]).doc.nodes.length,1);
 draft.nodes.find(n=>n.id===nid).ownerUserId='member';assert.throws(()=>P.prepare(draft,'Proje',people,'creator',[nid]),/Boş başlığa/);
});
test('inactive and unknown assignees cannot silently become project members',()=>{
 const draft=T.create('plan','Proje');draft.nodes[2].ownerUserId='closed';assert.throws(()=>P.prepare(draft,'Proje',people,'creator'),/aktif ekip/);
 draft.nodes[2].ownerUserId='unknown';assert.throws(()=>P.prepare(draft,'Proje',people,'creator'),/aktif ekip/);
});
test('preparation includes checklist assignees and validates task dates',()=>{
 const draft=T.create('plan','Proje');draft.nodes[2].tasks=[{id:'step',text:'Kontrol',done:false,assigneeId:'member',assignee:'Eski ad',dueDate:''}];
 const p=P.prepare(draft,'Proje',people,'creator');assert.deepEqual(p.memberIds,['creator','member']);assert.equal(p.doc.nodes[2].tasks[0].assignee,'Deniz');
 draft.nodes[2].dueDate='not-a-date';assert.throws(()=>P.prepare(draft,'Proje',people,'creator'));
});
