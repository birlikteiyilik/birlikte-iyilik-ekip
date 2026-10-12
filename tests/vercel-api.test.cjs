'use strict';
const {test,before,after,mock}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {gunzipSync}=require('node:zlib');
const {initializeApp,deleteApp}=require('firebase/app');
const {getAuth,connectAuthEmulator,createUserWithEmailAndPassword}=require('firebase/auth');
const T=require('../web/templates'),C=require('../web/core'),D=require('../web/collab'),M=require('../web/hub-model');
const {getServices}=require('../server/admin.cjs');
const createWorkspace=require('../server/workspace.cjs');
const createStorage=require('../server/storage.cjs');
const {dailyMaintenance}=require('../server/backup.cjs');
let server,base,db,aa,owner,editor,viewer,stranger,unverified,board,service;
const actors=[],objects=new Map();
const blob={async head(path){const b=objects.get(path);if(!b)throw Error('Not found');return {pathname:path,size:b.bytes.length,contentType:b.type};},async get(path){const b=objects.get(path);if(!b)return null;return {statusCode:200,stream:new ReadableStream({start(c){c.enqueue(b.bytes);c.close();}})};},async put(path,bytes){objects.set(path,{bytes,type:'application/gzip'});return {pathname:path};},async del(path){objects.delete(path);}};
async function actor(email,role,verified=true){
  const app=initializeApp({projectId:'demo-birlikte-iyilik',apiKey:'demo-key'},'api-'+email),auth=getAuth(app);connectAuthEmulator(auth,'http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST,{disableWarnings:true});
  await createUserWithEmailAndPassword(auth,email,'test-only-strong-password-2026');if(verified)await aa.updateUser(auth.currentUser.uid,{emailVerified:true});const token=await auth.currentUser.getIdToken(true),uid=auth.currentUser.uid;
  if(role)await db.doc('users/'+uid).set({id:uid,name:email,email,active:true,role});
  const result={app,uid,token,async api(path,method='GET',body={}){const r=await fetch(base+'/api/workspace',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({path,method,body})}),value=await r.json();if(!r.ok)throw Object.assign(new Error(value.error.detail),value.error);return value;}};
  actors.push(result);return result;
}
before(async()=>{
  if(process.env.DAL_LOCAL_API!=='1'||!process.env.FIREBASE_AUTH_EMULATOR_HOST||process.env.VERCEL)throw Error('Emulator-only API tests.');
  aa=getServices().auth;
  const {PGlite}=require('@electric-sql/pglite'),engine=new PGlite();let lock=Promise.resolve();
  const pgQuery=async(...args)=>{const result=await engine.query(...args);return {...result,rowCount:result.affectedRows??result.rows.length};};
  const pool={query:pgQuery,async connect(){let unlock;const prior=lock;lock=new Promise(resolve=>{unlock=resolve;});await prior;return {query:pgQuery,release(){unlock();}};},end:()=>engine.close()};
  db=require('../server/database.cjs').createDocumentStore(pool);
  mock.method(require('../server/admin.cjs'),'getServices',()=>({db,auth:aa,local:true}));
  const storage=createStorage({db,blobClient:blob,authorize(u,b,min,archive){if(!u?.active)service.fail(403,'Inactive user');service.check(u,b,min,archive);}});
  service=createWorkspace({db,storage});service.storage=storage;
  mock.method(require('../server/service.cjs'),'getWorkspace',()=>service);
  const routes=Object.fromEntries(['workspace','upload','file','backup','maintenance'].map(n=>[n,require('../api/'+n)]));
  server=createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.split('/')[2],handler=routes[name];if(handler)handler(req,res);else{res.statusCode=404;res.end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  owner=await actor('birlikteiyilikakademi@gmail.com');assert.equal((await owner.api('/me')).user.role,'admin');editor=await actor('api-editor@test.example','member');viewer=await actor('api-viewer@test.example','member');stranger=await actor('api-stranger@test.example','member');unverified=await actor('api-unverified@test.example','member',false);
  const doc=C.newDocument('blank');doc.nodes.push(C.node({id:'task',parentId:doc.nodes[0].id,kind:'Görev',title:'Yayın'}));board=await owner.api('/boards','POST',{doc});
  for(const [a,role]of [[editor,'editor'],[viewer,'viewer']])await owner.api(`/boards/${board.id}/members`,'PUT',{userId:a.uid,role});
});
after(async()=>{server?.close();if(board)await db.recursiveDelete(db.doc('boards/'+board.id));for(const a of actors){await db.doc('users/'+a.uid).delete();await aa.deleteUser(a.uid);await deleteApp(a.app);}for(const p of ['system/storage','system/backup','system/maintenance'])await db.doc(p).delete();for(const s of (await db.collection('backups').get()).docs)await s.ref.delete();await db.terminate();mock.restoreAll();});
test('HTTP API rejects missing, forged and expired-looking credentials without exposing internals',async()=>{
  for(const token of ['', 'Bearer bogus-token']){const r=await fetch(base+'/api/workspace',{method:'POST',headers:{Authorization:token,'Content-Type':'application/json'},body:'{"path":"/me"}'});assert.equal(r.status,401);assert.match(r.headers.get('cache-control'),/no-store/);assert.ok(!(await r.text()).includes('access_token'));}
  await assert.rejects(()=>unverified.api('/me'),e=>e.status===403);
});
test('HTTP mutations preserve distinct concurrent edits and block unauthorized writes',async()=>{
  const before=(await editor.api('/boards/'+board.id)).doc,a=structuredClone(before),b=structuredClone(before);a.nodes[0].title='Ortak çalışma';b.nodes[0].description='Ayrı alan';
  await editor.api(`/boards/${board.id}/changes`,'POST',{operationId:'http-one',changes:D.diff(before,a)});await editor.api(`/boards/${board.id}/changes`,'POST',{operationId:'http-two',changes:D.diff(before,b)});
  const final=await viewer.api('/boards/'+board.id);assert.equal(final.doc.nodes[0].title,'Ortak çalışma');assert.equal(final.doc.nodes[0].description,'Ayrı alan');
  await assert.rejects(()=>viewer.api(`/boards/${board.id}/changes`,'POST',{operationId:'denied',changes:[]}),e=>e.status===403);await assert.rejects(()=>stranger.api('/boards/'+board.id),e=>e.status===403);
});
test('Created structural templates retain layout and relations through authenticated Postgres edits',async()=>{
  for(const id of ['circle','pyramid','matrix']){let created;try{const doc=T.create(id,'API şablon '+id);created=await owner.api('/boards','POST',{doc});const initial=await owner.api('/boards/'+created.id);assert.equal(initial.doc.settings.layout,doc.settings.layout);assert.deepEqual(initial.doc.relations,doc.relations);assert.ok(initial.doc.nodes.every(n=>!n.ownerUserId));await assert.rejects(()=>stranger.api('/boards/'+created.id),e=>e.status===403);const draft=structuredClone(initial.doc);draft.nodes[1].title='Düzenlenebilir ekip';await owner.api(`/boards/${created.id}/changes`,'POST',{operationId:'template-'+id,changes:D.diff(initial.doc,draft)});const reloaded=await owner.api('/boards/'+created.id);assert.equal(reloaded.doc.nodes[1].title,'Düzenlenebilir ekip');assert.equal(reloaded.doc.settings.layout,doc.settings.layout);assert.equal(reloaded.doc.relations.length,doc.relations.length);}finally{if(created)await db.recursiveDelete(db.doc('boards/'+created.id));}}
});
test('Postgres metadata protects dependency cycles, completion and stale settings',async()=>{
  const prior=await editor.api('/boards/'+board.id),draft=structuredClone(prior.doc);draft.nodes.push(C.node({id:'prerequisite',parentId:draft.nodes[0].id,kind:'Görev',title:'Hazırlık'}));
  await editor.api(`/boards/${board.id}/changes`,'POST',{operationId:'add-prerequisite',changes:D.diff(prior.doc,draft)});
  const settings={expectedRevision:0,dependencies:['prerequisite'],recurrence:null};await editor.api(`/boards/${board.id}/meta/task`,'PUT',settings);await editor.api(`/boards/${board.id}/meta/task`,'PUT',settings);
  await assert.rejects(()=>editor.api(`/boards/${board.id}/meta/task`,'PUT',{...settings,dependencies:[]}),e=>e.status===409);
  await assert.rejects(()=>editor.api(`/boards/${board.id}/meta/prerequisite`,'PUT',{dependencies:['task']}),e=>e.status===422);
  const before=(await editor.api('/boards/'+board.id)).doc,completed=structuredClone(before);completed.nodes.find(n=>n.id==='task').status='Tamamlandı';
  await assert.rejects(()=>editor.api(`/boards/${board.id}/changes`,'POST',{operationId:'blocked-task',changes:D.diff(before,completed)}),e=>e.status===422);
});
test('Postgres comments, mentions and meeting updates are idempotent and private',async()=>{
  const comment={operationId:'mention',nodeId:'task',body:'Kontrol eder misiniz @['+viewer.uid+']'};await editor.api(`/boards/${board.id}/comments`,'POST',comment);await editor.api(`/boards/${board.id}/comments`,'POST',comment);
  assert.equal((await viewer.api(`/boards/${board.id}/comments?nodeId=task`)).comments.length,1);const notes=(await viewer.api('/notifications')).notifications;assert.equal(notes.length,1);await assert.rejects(()=>editor.api('/notifications/'+notes[0].id,'PATCH',{boardId:board.id}),e=>e.status===404);
  const event={id:'meeting',title:'Ekip toplantısı',start:'2026-10-10T09:00:00+03:00',end:'2026-10-10T10:00:00+03:00',agenda:'Plan',minutes:'Tutanak',attendees:[viewer.uid],decisions:[{text:'Kontrol',nodeId:'task'}]};
  await editor.api(`/boards/${board.id}/events`,'POST',event);let saved=(await viewer.api('/hub')).events.find(x=>x.id==='meeting');assert.equal(saved.minutes,'Tutanak');
  const update={...event,expectedRevision:saved.revision,minutes:'Güncel tutanak'};await editor.api(`/boards/${board.id}/events/meeting`,'POST',update);await editor.api(`/boards/${board.id}/events/meeting`,'POST',update);
  await assert.rejects(()=>editor.api(`/boards/${board.id}/events/meeting`,'POST',{...update,minutes:'Eski veri'}),e=>e.status===409);
});
test('compressed Postgres snapshots restore as a new revision with manager permission',async()=>{
  const meta=(await owner.api(`/boards/${board.id}/meta`)).meta.task;await owner.api(`/boards/${board.id}/meta/task`,'PUT',{expectedRevision:meta.revision,dependencies:[],recurrence:null});
  const before=await owner.api('/boards/'+board.id);await assert.rejects(()=>editor.api(`/boards/${board.id}/restore`,'POST',{expectedRevision:before.revision,revision:1,reason:'İlk sürüme geri dön'}),e=>e.status===403);
  const restored=await owner.api(`/boards/${board.id}/restore`,'POST',{expectedRevision:before.revision,revision:1,reason:'İlk sürüme geri dön'});assert.equal(restored.revision,before.revision+1);assert.equal(restored.doc.nodes.find(n=>n.id==='task').title,'Yayın');
  const history=await viewer.api(`/boards/${board.id}/history`);assert.ok(history.snapshots.some(s=>s.revision===1));assert.ok(history.snapshots.every(s=>!s.contentGzip));
});
test('Postgres invitation grants one board and recurrence does not duplicate on retry',async()=>{
  const invited=await actor('api-invited@test.example');await assert.rejects(()=>invited.api('/me'),e=>e.status===403);await owner.api('/invitations','POST',{email:'api-invited@test.example',boardId:board.id,role:'viewer'});assert.equal((await invited.api('/me')).user.role,'member');assert.equal((await invited.api('/boards/'+board.id)).role,'viewer');assert.equal((await db.doc('invitations/api-invited@test.example').get()).exists,false);
  const current=await owner.api('/boards/'+board.id),draft=structuredClone(current.doc);draft.nodes.find(n=>n.id==='task').ownerUserId=owner.uid;draft.nodes.find(n=>n.id==='task').dueDate=M.today();
  await owner.api(`/boards/${board.id}/changes`,'POST',{operationId:'recurring-owner',changes:D.diff(current.doc,draft)});
  const previous=(await owner.api(`/boards/${board.id}/meta`)).meta.task;await owner.api(`/boards/${board.id}/meta/task`,'PUT',{expectedRevision:previous.revision,dependencies:[],recurrence:{enabled:true,frequency:'daily',interval:1,nextDate:M.today()}});
  await service.coordinate();const first=await owner.api('/boards/'+board.id);assert.equal(first.doc.nodes.filter(n=>n.kind==='Görev').length,2);await service.coordinate();assert.equal((await owner.api('/boards/'+board.id)).revision,first.revision);
});
test('upload reservations enforce role, content type, size and atomic free storage budget',async()=>{
  const prepare=`/boards/${board.id}/files/prepare`,data={id:'file',nodeId:'task',name:'plan.pdf',size:4,type:'application/pdf'};
  await assert.rejects(()=>viewer.api(prepare,'POST',data),e=>e.status===403);
  await assert.rejects(()=>editor.api(prepare,'POST',{...data,type:'text/html'}),e=>e.status===422);
  await assert.rejects(()=>editor.api(prepare,'POST',{...data,size:11*1024*1024}),e=>e.status===413);
  const reservation=await editor.api(prepare,'POST',data);await editor.api(prepare,'POST',data);assert.equal((await db.doc('system/storage').get()).data().attachmentBytes,4);
  objects.set(reservation.path,{bytes:new Uint8Array([1,2,3,4]),type:'application/pdf'});
  await editor.api(`/boards/${board.id}/files`,'POST',{...data,path:reservation.path});assert.equal((await viewer.api(`/boards/${board.id}/files?nodeId=task`)).files.length,1);
  await db.doc('system/storage').set({attachmentBytes:750*1024*1024});await assert.rejects(()=>editor.api(prepare,'POST',{...data,id:'over-budget'}),e=>e.status===413);await db.doc('system/storage').set({attachmentBytes:4});
});
test('private download re-checks membership and never permits anonymous access',async()=>{
  const url=base+`/api/file?boardId=${board.id}&id=file`;
  assert.equal((await fetch(url)).status,401);assert.equal((await fetch(url,{headers:{Authorization:'Bearer '+stranger.token}})).status,403);
  const r=await fetch(url,{headers:{Authorization:'Bearer '+viewer.token}});assert.equal(r.status,200);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[1,2,3,4]);assert.match(r.headers.get('content-disposition'),/^attachment/);
});
test('backup exports require manager and recover real ZIP bytes',async()=>{
  const url=base+`/api/backup?boardId=${board.id}&mode=metadata`;
  assert.equal((await fetch(url,{headers:{Authorization:'Bearer '+viewer.token}})).status,403);
  const r=await fetch(url,{headers:{Authorization:'Bearer '+owner.token}}),value=JSON.parse(gunzipSync(Buffer.from(await r.arrayBuffer())));assert.equal(value.version,1);assert.equal(value.boards[0].files[0].name,'plan.pdf');
  const full=await fetch(url.replace('metadata','full'),{headers:{Authorization:'Bearer '+owner.token}}),zip=require('fflate').unzipSync(new Uint8Array(await full.arrayBuffer()));assert.deepEqual([...zip['files/file/plan.pdf']],[1,2,3,4]);
});
test('daily maintenance is idempotent, compresses backups and caps retained snapshots',async()=>{
  for(let revision=4;revision<=45;revision++)await db.doc(`boards/${board.id}/snapshots/${revision}`).set({revision,content:JSON.stringify(board.doc),created_at:new Date().toISOString()});
  const first=await dailyMaintenance({db,service,blob}),second=await dailyMaintenance({db,service,blob});assert.equal(first.ok,true);assert.equal(second.skipped,true);assert.equal((await db.collection('backups').get()).size,1);assert.ok((await db.collection(`boards/${board.id}/snapshots`).get()).size<=31);
  const record=(await db.doc('system/backup').get()).data();assert.ok(record.size<20000);assert.equal(JSON.parse(gunzipSync(objects.get(record.path).bytes)).boards[0].id,board.id);
  assert.equal((await fetch(base+'/api/maintenance')).status,401);assert.equal((await fetch(base+'/api/maintenance',{method:'POST',headers:{Authorization:'Bearer '+viewer.token}})).status,403);
});
test('Own profile updates persist in PostgreSQL without changing privileges or disclosing photo bytes',async()=>{
  const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
  const before=(await editor.api('/me')).user;
  await assert.rejects(()=>editor.api('/me','PATCH',{firstName:'Bad',lastName:'Role',role:'admin'}),e=>e.status===422);
  assert.equal((await editor.api('/me')).user.name,before.name);
  const updated=(await editor.api('/me','PATCH',{firstName:'Arif Uğur',lastName:'Çelik',avatar:photo})).user;
  assert.equal(updated.name,'Arif Uğur Çelik');assert.equal(updated.role,before.role);assert.equal(updated.email,before.email);assert.equal(updated.active,true);assert.ok(updated.avatarVersion);assert.ok(!JSON.stringify(updated).includes(photo.split(',')[1]));
  assert.equal((await editor.api('/me')).user.name,updated.name);
  const users=await owner.api('/users');assert.ok(!JSON.stringify(users).includes(photo.split(',')[1]));
  assert.equal((await viewer.api('/profile-photos/'+editor.uid)).dataUrl,photo);
  const privateProfile=(await db.doc('users/'+editor.uid).get()).data();assert.ok(privateProfile.avatar.path.startsWith('avatars/'));assert.equal(privateProfile.avatar.base64,undefined);assert.equal(objects.get(privateProfile.avatar.path).bytes.length,68);
  await assert.rejects(()=>stranger.api('/profile-photos/'+editor.uid),e=>e.status===403);
  await assert.rejects(()=>editor.api('/profile-photos/'+viewer.uid,'PATCH',{avatar:photo}),e=>e.status===405);
  const current=(await editor.api('/boards/'+board.id)).doc;assert.equal(current.id,board.doc.id);
  await db.doc('profilePhotos/'+privateProfile.avatar.recordId).update({retiredAt:'2020-01-01T00:00:00.000Z'});await service.storage.cleanupAvatars();assert.ok(objects.has(privateProfile.avatar.path));
  await editor.api('/me','PATCH',{avatar:null});assert.equal((await viewer.api('/profile-photos/'+editor.uid)).dataUrl,'');
  await db.doc('profilePhotos/'+privateProfile.avatar.recordId).update({retiredAt:'2020-01-01T00:00:00.000Z',leaseUntil:null});await service.storage.cleanupAvatars();assert.ok(!objects.has(privateProfile.avatar.path));assert.equal((await db.doc('system/storage').get()).data().avatarBytes,0);
});
test('removed membership and disabled profile immediately reject file access and metadata registration',async()=>{
  await owner.api(`/boards/${board.id}/members/${viewer.uid}`,'DELETE');const url=base+`/api/file?boardId=${board.id}&id=file`;assert.equal((await fetch(url,{headers:{Authorization:'Bearer '+viewer.token}})).status,403);
  await owner.api('/users/'+editor.uid,'PATCH',{role:'member',active:false});await assert.rejects(()=>editor.api(`/boards/${board.id}/files/prepare`,'POST',{id:'closed',nodeId:'task',name:'x.pdf',size:1,type:'application/pdf'}),e=>e.status===403);
});
