'use strict';
const blob = require('@vercel/blob');
const cfg = require('./config.cjs');
const {fail} = require('./http.cjs');
const timestamp = () => new Date().toISOString();
module.exports = function createStorage({db,authorize,blobClient=blob}) {
  const usageRef=db.doc('system/storage');
  function locate(path) {
    const match=/^boards\/([a-zA-Z0-9_:-]{1,100})\/([a-zA-Z0-9_:-]{1,100})\/([a-zA-Z0-9_:-]{1,100})$/.exec(path);
    if(!match)fail(422,'Geçersiz dosya yolu.');
    return {boardId:match[1],nodeId:match[2],id:match[3],ref:db.doc(`boards/${match[1]}/files/${match[3]}`)};
  }
  async function prepare({u,b,body}) {
    const file=locate(`boards/${b.id}/${body.nodeId}/${body.id}`);
    if(!Number.isSafeInteger(body.size)||body.size<1||body.size>cfg.fileLimit)fail(413,'Dosya 1 bayt ile 10 MB arasında olmalı.');
    if(!cfg.mimeTypes.includes(body.type))fail(422,'Bu dosya türü desteklenmiyor. PDF, Office, ZIP, metin veya PNG/JPEG/WebP kullanın.');
    if(typeof body.name!=='string'||!body.name.trim()||body.name.length>250)fail(422,'Geçerli dosya adı gerekli.');
    const path=`boards/${b.id}/${body.nodeId}/${body.id}`;
    await db.runTransaction(async tx=>{
      const [usage,old,board,user]=await Promise.all([tx.get(usageRef),tx.get(file.ref),tx.get(db.doc('boards/'+b.id)),tx.get(db.doc('users/'+u.id))]);
      authorize(user.exists?{...user.data(),id:u.id}:null,board.exists?{...board.data(),id:b.id}:null,'editor',false);
      if(old.exists){const d=old.data();if(d.userId!==u.id||d.path!==path||d.name!==body.name||d.size!==body.size||d.type!==body.type)fail(409,'Dosya kimliği başka bir yüklemede kullanılmış.');if(d.deleted)fail(409,'Bu dosya kaldırılmış.');return;}
      const bytes=usage.data()?.attachmentBytes||0;
      if(bytes+body.size>cfg.attachmentBudget)fail(413,'Ekip dosya alanı dolmak üzere. Eski dosyaları arşivleyin veya cihazınıza indirin.');
      tx.set(usageRef,{attachmentBytes:bytes+body.size},{merge:true});
      tx.create(file.ref,{path,nodeId:body.nodeId,name:body.name,size:body.size,type:body.type,userId:u.id,createdAt:timestamp(),expiresAt:new Date(Date.now()+3600000).toISOString(),state:'pending',deleted:false});
    });
    return {ok:true,path,id:body.id};
  }
  async function pending(path,u,b) {
    const file=locate(path),s=await file.ref.get(),d=s.data();
    if(!s.exists||file.boardId!==b.id||d.userId!==u.id||d.deleted||d.state!=='pending'||d.expiresAt<timestamp())fail(403,'Geçerli bir yükleme rezervasyonu gerekli.');
    return d;
  }
  async function metadata(path,{u,b}) {
    const file=locate(path),s=await file.ref.get(),d=s.data();
    if(!s.exists||file.boardId!==b.id||d.userId!==u.id||d.deleted)fail(403,'Bu yükleme size ait değil.');
    if(d.state==='ready')return {size:d.size,contentType:d.type};
    if(d.expiresAt<timestamp())fail(409,'Yükleme süresi dolmuş. Dosyayı yeniden seçin.');
    const head=await blobClient.head(path);
    if(head.pathname!==path||head.size!==d.size||head.contentType!==d.type)fail(422,'Dosya boyutu veya türü yükleme kaydıyla eşleşmiyor.');
    return {size:head.size,contentType:head.contentType};
  }
  async function finish({u,b,body}) {
    const file=locate(body.path);await metadata(body.path,{u,b});
    await db.runTransaction(async tx=>{
      const [s,bs,us]=await Promise.all([tx.get(file.ref),tx.get(db.doc('boards/'+b.id)),tx.get(db.doc('users/'+u.id))]);
      authorize(us.exists?{...us.data(),id:u.id}:null,bs.exists?{...bs.data(),id:b.id}:null,'editor',false);
      if(!JSON.parse(bs.data().content).nodes.some(n=>n.id===file.nodeId))fail(404,'Yüklemenin kartı kaldırılmış.');
      const d=s.data();if(!d||d.userId!==u.id||d.deleted||file.boardId!==b.id||body.id!==file.id||body.nodeId!==file.nodeId)fail(403,'Bu yükleme kaydedilemez.');
      if(d.state!=='ready')tx.update(file.ref,{state:'ready',uploadedAt:timestamp()});
    });
    return {id:file.id};
  }
  async function cleanup() {
    const expired=(await db.collectionGroup('files').where('expiresAt','<',timestamp()).get()).docs.filter(s=>s.data().state==='pending');
    const trash=(await db.collectionGroup('files').where('deleted','==',true).get()).docs.filter(s=>s.data().deletedAt<new Date(Date.now()-7*86400000).toISOString());
    for(const s of [...expired,...trash].slice(0,100)) {
      // Pending uploads remain reserved beyond the token lifetime; physical deletion precedes releasing space.
      await blobClient.del(s.data().path);
      await db.runTransaction(async tx=>{const [current,usage]=await Promise.all([tx.get(s.ref),tx.get(usageRef)]);if(!current.exists)return;tx.delete(s.ref);tx.set(usageRef,{attachmentBytes:Math.max(0,(usage.data()?.attachmentBytes||0)-current.data().size)},{merge:true});});
    }
  }
  return {prepare,pending,metadata,finish,cleanup,locate,blob:blobClient};
};
