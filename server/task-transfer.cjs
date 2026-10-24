'use strict';
const C=require('../web/core');
const snapshots=require('./snapshots.cjs');

// Move one daily-work branch, never grant access to either person's whole list.
module.exports=function createTransfer({db,fail,ident,check,document,requestHash,audit,notify}){
 return async function transfer(u,bid,body){
  const operationId=ident(body.operationId),nodeId=ident(body.nodeId),ownerId=ident(body.ownerId);
  const destination='daily_'+requestHash(ownerId).slice(0,32);
  const source=db.doc('boards/'+bid),target=db.doc('boards/'+destination),op=source.collection('operations').doc(operationId),hash=requestHash(body);
  return db.runTransaction(async tx=>{
   const [sourceSnap,operation,person,targetSnap]=await Promise.all([tx.get(source),tx.get(op),tx.get(db.doc('users/'+ownerId)),tx.get(target)]);
   const b=sourceSnap.exists?{...sourceSnap.data(),id:bid}:null;
   check(u,b,'editor',false);
   if(b.purpose!=='daily')fail(422,'Proje işlerini Sorumlu alanından devredebilirsiniz.');
   if(u.role!=='admin'&&u.id!==b.dailyOwnerId)fail(403,'Yalnız kendi günlük işinizi devredebilirsiniz.');
   if(operation.exists){if(operation.data().userId!==u.id||operation.data().requestHash!==hash)fail(409,'İşlem kimliği farklı bir kayıtta kullanılmış.');return {boardId:operation.data().targetBoardId,nodeId};}
   if(destination===bid)fail(422,'Farklı bir sorumlu seçin.');
   if(!person.exists||!person.data().active)fail(422,'Aktif bir ekip üyesi seçin.');
   if(body.expectedRevision!==b.revision)fail(409,'İş bu sırada değişti. Ayrıntıları yeniden açıp kontrol edin.');
   const previous=targetSnap.exists?{...targetSnap.data(),id:destination}:null;
   if(previous&&(previous.purpose!=='daily'||previous.dailyOwnerId!==ownerId||previous.archived))fail(409,'Hedef günlük iş listesi kullanılamıyor.');
   const doc=JSON.parse(b.content),node=doc.nodes.find(n=>n.id===nodeId);
   if(!node||node.parentId===null||node.kind!=='Görev')fail(422,'Devredilecek bir iş seçin.');
   const ids=new Set(C.descendants(doc,nodeId)),dest=previous?JSON.parse(previous.content):C.newDocument('blank');
   if(dest.nodes.some(n=>ids.has(n.id)))fail(409,'Bu iş hedef listede zaten var.');
   const collections=['meta','comments','files','completions','notifications','events'];
   const rows=Object.fromEntries(await Promise.all(collections.map(async name=>[name,(await tx.get(source.collection(name))).docs])));
   for(const r of rows.meta)for(const dep of r.data().dependencies||[])if(ids.has(r.id)!==ids.has(dep))fail(422,'Bu iş başka bir günlük işe bağlı. Devretmeden önce dış bağlantısını kaldırın.');
   if(doc.relations.some(r=>ids.has(r.from)!==ids.has(r.to))||rows.events.some(r=>!r.data().cancelled&&(r.data().decisions||[]).some(d=>ids.has(d.nodeId))))fail(422,'Bu işin başka bir iş veya toplantıyla bağlantısı var. Devretmeden önce bağlantısını kaldırın.');
   if(rows.files.some(r=>ids.has(r.data().nodeId)&&r.data().state==='pending'&&!r.data().deleted))fail(409,'Dosya yüklemesi sürüyor. Yükleme tamamlanınca yeniden devredin.');
   const moving=[];
   for(const name of ['meta','comments','files','completions'])for(const row of rows[name])if(ids.has(name==='meta'?row.id:row.data().nodeId)&&(name!=='files'||(!row.data().deleted&&row.data().state==='ready')))moving.push({name,row,ref:target.collection(name).doc(row.id)});
   const collisions=await Promise.all(moving.map(m=>tx.get(m.ref)));
   if(collisions.some(s=>s.exists))fail(409,'Hedef listede aynı kimlikli bir kayıt var; hiçbir kayıt taşınmadı.');
   const name='Günlük işler · '+person.data().name,root=C.rootNode(dest),stamp=new Date().toISOString();
   dest.name=name;root.title=name;root.kind='Başlık';
   const branch=doc.nodes.filter(n=>ids.has(n.id)).map(n=>({...n,ownerUserId:ownerId,owner:person.data().name,tasks:n.tasks.map(t=>({...t,assigneeId:t.assigneeId?ownerId:'',assignee:t.assigneeId?person.data().name:t.assignee}))}));
   const first=branch.find(n=>n.id===nodeId);first.parentId=root.id;first.order=Math.max(-1,...C.children(dest,root.id).map(n=>n.order))+1;
   dest.nodes.push(...branch);dest.relations.push(...doc.relations.filter(r=>ids.has(r.from)&&ids.has(r.to)));C.remove(doc,nodeId);
   const from=document(doc),to=document(dest),sourceRevision=b.revision+1,targetRevision=(previous?.revision||0)+1;
   const targetRecord={name,content:to.content,revision:targetRevision,archived:false,purpose:'daily',dailyOwnerId:ownerId,roles:{[ownerId]:'editor'},memberIds:[ownerId],createdAt:previous?.createdAt||stamp,updatedAt:stamp};
   // All reads above. Files retain their private Blob path, with exactly one live
   // metadata record, so quota and download authorization follow the new list.
   tx.update(source,{content:from.content,revision:sourceRevision,updatedAt:stamp});
   if(previous)tx.update(target,targetRecord);else tx.create(target,targetRecord);
   for(const [ref,valid,revision] of [[source,from,sourceRevision],[target,to,targetRevision]]){tx.create(ref.collection('snapshots').doc(String(revision)),{...snapshots.encode(valid.content),revision,actor:u.name,created_at:stamp});if(revision>31)tx.delete(ref.collection('snapshots').doc(String(revision-30)));}
   for(const m of moving){const value={...m.row.data()};if('boardId' in value)value.boardId=destination;tx.create(m.ref,value);tx.delete(m.row.ref);}
   for(const row of rows.notifications)if(ids.has(row.data().nodeId))tx.delete(row.ref);
   for(const nid of ids){tx.set(source.collection('transferred').doc(nid),{targetBoardId:destination,operationId,createdAt:stamp});tx.delete(target.collection('transferred').doc(nid));}
   tx.create(op,{userId:u.id,requestHash:hash,targetBoardId:destination,nodeId,createdAt:stamp});
   const detail={nodeId,fromUserId:b.dailyOwnerId,toUserId:ownerId,label:node.title};
   audit(tx,u,b,'task.transferred',detail);audit(tx,u,{...targetRecord,id:destination},'task.received',detail);
   notify(tx,destination,ownerId,'İş size devredildi',node.title,nodeId,'transfer:'+operationId);
   return {boardId:destination,nodeId};
  });
 };
};
