'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../web/core.js'),D=require('../web/collab.js');
function setup(){const a=C.newDocument('blank');a.nodes[0].tasks=[{id:'job1',text:'A',done:false,assignee:'',assigneeId:'',dueDate:''}];return a;}
test('Görünüm, katlama ve kamera ortak değişikliğe dönüşmez',()=>{const a=setup(),b=D.clone(a);b.view.x=333;b.settings.layout='mind';b.nodes[0].collapsed=true;b.nodes[0].offsetX=120;assert.deepEqual(D.diff(a,b),[]);});
test('Alan değişikliği korumalı patch oluşturur',()=>{const a=setup(),b=D.clone(a);b.nodes[0].title='B';const c=D.diff(a,b);assert.equal(c.length,1);assert.equal(c[0].path[2],'title');assert.equal(c[0].after.value,'B');});
test('Farklı alanlar üç yönlü birleşir',()=>{const a=setup(),b=D.clone(a),remote=D.clone(a);b.nodes[0].title='B';remote.nodes[0].notes='R';const r=D.apply(remote,D.diff(a,b));assert.equal(r.conflicts.length,0);assert.equal(r.doc.nodes[0].notes,'R');assert.equal(r.doc.nodes[0].title,'B');});
test('Aynı alanın çakışması yakalanır',()=>{const a=setup(),b=D.clone(a),remote=D.clone(a);b.nodes[0].title='B';remote.nodes[0].title='R';assert.equal(D.apply(remote,D.diff(a,b)).conflicts.length,1);});
test('Görevler sıralamaya değil kimliğe göre eşleşir',()=>{const a=setup(),b=D.clone(a);b.nodes[0].tasks[0].done=true;const c=D.diff(a,b);assert.deepEqual(c[0].path.slice(-3),['tasks','job1','done']);});
test('Ayrı görev alanları kaybolmadan birleşir',()=>{const a=setup(),b=D.clone(a),r=D.clone(a);b.nodes[0].tasks[0].done=true;r.nodes[0].tasks[0].text='Revised';const out=D.apply(r,D.diff(a,b));assert.equal(out.conflicts.length,0);assert.equal(out.doc.nodes[0].tasks[0].text,'Revised');assert.equal(out.doc.nodes[0].tasks[0].done,true);});
test('Kendi ters işlemi başka alanları geri sarmaz',()=>{const a=setup(),b=D.clone(a);b.name='B';const remote=D.clone(b);remote.nodes[0].notes='Another author';const out=D.apply(remote,D.inverse(D.diff(a,b)));assert.equal(out.doc.name,a.name);assert.equal(out.doc.nodes[0].notes,'Another author');});
test('Sonradan değiştirilmiş alana geri alma engellenir',()=>{const a=setup(),b=D.clone(a);b.name='B';const remote=D.clone(b);remote.name='Other';assert.equal(D.apply(remote,D.inverse(D.diff(a,b))).conflicts.length,1);});
test('Kart ekleme silme tersine çevrilebilir',()=>{const a=setup(),b=D.clone(a);C.addNode(b,b.nodes[0].id,{title:'New'});const p=D.diff(a,b);assert.equal(D.apply(a,p).doc.nodes.length,2);assert.equal(D.apply(b,D.inverse(p)).doc.nodes.length,1);});
test('Saldırı anahtarları kopyalanmaz',()=>{assert.throws(()=>D.apply(setup(),[{path:['nodes','__proto__'],before:{exists:false},after:{exists:true,value:{polluted:true}}}]));assert.equal({}.polluted,undefined);});
test('Gerçek hesap bağlantıları projeksiyonda korunur',()=>{const a=setup(),b=D.clone(a);b.nodes[0].ownerUserId='real_user';b.nodes[0].tasks[0].assigneeId='real_user';assert.equal(D.diff(a,b).length,2);});
test('Metin ve boolean eşitliği kesin tipli',()=>{assert.equal(D.equal(true,1),false);assert.equal(D.equal({x:0},{x:0.0}),true);});
