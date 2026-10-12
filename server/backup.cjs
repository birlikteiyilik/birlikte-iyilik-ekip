'use strict';
const {gzipSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const {Zip,ZipPassThrough,strToU8}=require('fflate');
const cfg=require('./config.cjs');
const {fail}=require('./http.cjs');
const {once}=require('node:events');
const now=()=>new Date().toISOString();
const hash=data=>createHash('sha256').update(data).digest('hex');
const collections=['meta','comments','events','files','audit','completions'];
async function collectBoard(db,bid) {
  const ref=db.doc('boards/'+bid);
  return db.runTransaction(async tx=>{
    const s=await tx.get(ref);if(!s.exists)fail(404,'Çalışma bulunamadı.');
    const b=s.data(),data={id:bid,...b,doc:JSON.parse(b.content)};delete data.content;
    for(const name of collections) {
      const query=name==='audit'?ref.collection(name).orderBy('createdAt','desc').limit(100):ref.collection(name).limit(10001);
      const rows=await tx.get(query);if(rows.size>10000)fail(413,'Yedeklenecek kayıt sayısı sınırı aşıldı.');
      data[name]=rows.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.id.localeCompare(b.id));
    }
    return data;
  },{readOnly:true});
}
function envelope(boards,users=[],profilePhotos=[]) {
  return {format:'birlikte-iyilik-backup',version:1,projectId:cfg.projectId,createdAt:now(),
    scope:'Current board data, comments, metadata, meetings, file references, completions and latest 100 audit events. Profile photo metadata references private Blob objects. Auth credentials, profile photo bytes and historical file bytes are excluded.',boards,users,profilePhotos};
}
function gzipBackup(value) {
  const raw=Buffer.from(JSON.stringify(value)),bytes=gzipSync(raw,{level:6});
  if(bytes.length>12*1024*1024)fail(413,'Sıkıştırılmış yedek 12 MB sınırını aşıyor. Hiçbir kayıt kesilmedi.');
  return {bytes,sha256:hash(raw),size:bytes.length};
}
async function compact(db,bid) {
  const ref=db.doc('boards/'+bid),snapshots=await ref.collection('snapshots').orderBy('revision','desc').select('revision').get();
  const old=snapshots.docs.filter((s,i)=>i>=cfg.snapshotCount&&s.id!=='1');
  const cutoff=new Date(Date.now()-30*86400000).toISOString();
  const operations=await ref.collection('operations').where('createdAt','<',cutoff).limit(400).get();
  const notes=await ref.collection('notifications').where('createdAt','<',cutoff).limit(400).get();
  const records=[...old,...operations.docs,...notes.docs.filter(s=>s.data().read)];
  for(let i=0;i<records.length;i+=400){const batch=db.batch();for(const s of records.slice(i,i+400))batch.delete(s.ref);await batch.commit();}
}
async function dailyMaintenance({db,service,blob}) {
  const day=now().slice(0,10),ref=db.doc('system/maintenance');
  const acquired=await db.runTransaction(async tx=>{
    const s=await tx.get(ref),d=s.data();
    if(d?.day===day&&(d.status==='complete'||d.leaseUntil>now()))return false;
    tx.set(ref,{day,status:'running',leaseUntil:new Date(Date.now()+10*60000).toISOString(),startedAt:now()});return true;
  });
  if(!acquired)return {ok:true,skipped:true};
  try {
    await service.coordinate();
    const boards=(await db.collection('boards').get()).docs;if(boards.length>100)fail(413,'Otomatik yedek en fazla 100 çalışma içerir.');
    const all=[];for(const b of boards)all.push(await collectBoard(db,b.id));
    const users=(await db.collection('users').get()).docs.map(s=>({id:s.id,...s.data()})).sort((a,b)=>a.id.localeCompare(b.id));
    all.sort((a,b)=>a.id.localeCompare(b.id));
    const photoIds=[...new Set(users.map(u=>u.avatar?.recordId).filter(Boolean))];
    const profilePhotos=photoIds.length?(await db.getAll(...photoIds.map(key=>db.doc('profilePhotos/'+key)))).filter(s=>s.exists).map(s=>({id:s.id,...s.data()})).sort((a,b)=>a.id.localeCompare(b.id)):[];
    const value=envelope(all,users,profilePhotos),fingerprint=hash(JSON.stringify({boards:all,users,profilePhotos}));
    const state=(await db.doc('system/backup').get()).data();
    if(state?.fingerprint!==fingerprint) {
      const {bytes,sha256,size}=gzipBackup(value),path=`backups/${day}/${sha256}.json.gz`;
      const prior=(await db.collection('backups').orderBy('createdAt','desc').get()).docs;
      const retained=prior.filter(s=>s.id!==day).slice(0,cfg.backupDays-1);
      if(retained.reduce((n,s)=>n+s.data().size,0)+size>cfg.backupBudget)fail(413,'Yedek alanı sınırına ulaşıldı; mevcut yedekler korundu.');
      await blob.put(path,bytes,{access:'private',contentType:'application/gzip',addRandomSuffix:false,allowOverwrite:true});
      // Commit the new backup before pruning old ones. A failed deletion cannot erase the newest recovery point.
      const record={path,sha256,size,createdAt:now(),day,boards:all.length};
      const batch=db.batch();batch.set(db.doc('backups/'+day),record);batch.set(db.doc('system/backup'),{...record,fingerprint,lastCheckedAt:now()});await batch.commit();
      const obsolete=prior.filter(s=>!retained.some(r=>r.id===s.id));
      for(const s of obsolete){if(s.data().path!==path)await blob.del(s.data().path);if(s.id!==day)await s.ref.delete();}
    } else await db.doc('system/backup').update({lastCheckedAt:now()});
    for(const b of boards)await compact(db,b.id);
    await service.storage.cleanup();
    await ref.set({day,status:'complete',completedAt:now()});
    return {ok:true,day};
  } catch(e){await ref.set({day,status:'failed',failedAt:now(),code:e.status||503});throw e;}
}
async function streamFullZip(res,value,blob) {
  const board=value.boards[0],files=board.files.filter(f=>f.state==='ready'&&!f.deleted);
  if(files.reduce((n,f)=>n+f.size,0)>100*1024*1024)fail(413,'Tam ZIP dosyaları 100 MB sınırını aşıyor. Kayıt yedeği ve dosyaları ayrı indirin.');
  const pending=[];
  const zip=new Zip((err,chunk,final)=>{if(err)throw err;pending.push({chunk,final});});
  async function drain(){while(pending.length){const {chunk,final}=pending.shift();if(!res.write(Buffer.from(chunk)))await once(res,'drain');if(final)res.end();}}
  value.scope+=' This ZIP additionally includes all current, non-deleted attachment bytes.';
  const metadata=new ZipPassThrough('workspace.json');zip.add(metadata);metadata.push(strToU8(JSON.stringify(value,null,2)),true);await drain();
  for(const file of files) {
    const result=await blob.get(file.path,{access:'private'});if(!result||result.statusCode!==200)fail(404,'Yedekteki dosyalardan birine ulaşılamadı. ZIP tamamlanamadı.');
    const entry=new ZipPassThrough(`files/${file.id}/${file.name.replace(/[^\p{L}\p{N}._ -]/gu,'_')}`);zip.add(entry);
    let actual=0;for await(const chunk of result.stream){actual+=chunk.length;if(actual>file.size)fail(413,'Dosya boyutu yedek kaydıyla eşleşmiyor.');entry.push(chunk,false);await drain();}
    if(actual!==file.size)fail(422,'Dosya eksik okundu. ZIP tamamlanamadı.');entry.push(new Uint8Array(0),true);await drain();
  }
  zip.end();await drain();
}
module.exports={collectBoard,envelope,gzipBackup,dailyMaintenance,compact,streamFullZip};
