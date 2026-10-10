const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Writable}=require('node:stream');
const {gunzipSync}=require('node:zlib');
const {unzipSync,strFromU8}=require('fflate');
const {encode,decode}=require('../server/snapshots.cjs');
const {gzipBackup,envelope,streamFullZip}=require('../server/backup.cjs');
test('compressed snapshots recover Turkish text and legacy snapshots remain readable',()=>{
  const value={name:'Birlikte İyilik',notes:'Görev ve ekip çalışması '.repeat(3000)},raw=JSON.stringify(value),compressed=encode(raw);
  assert.ok(compressed.contentGzip.length<Buffer.byteLength(raw)/10);assert.deepEqual(decode(compressed),value);assert.deepEqual(decode({content:raw}),value);
});
test('snapshot decompression refuses oversized data',()=>{assert.throws(()=>decode(encode(JSON.stringify({text:'x'.repeat(800000)}))));});
test('metadata backups decompress into a versioned independent recovery file',()=>{
  const value=envelope([{id:'b',doc:{name:'İyilik'},files:[{id:'f',path:'boards/b/n/f'}]}]),result=gzipBackup(value);
  assert.deepEqual(JSON.parse(gunzipSync(result.bytes)),value);assert.equal(result.sha256.length,64);assert.ok(result.size>0);
});
test('full ZIP includes actual attachment bytes with a safe filename',async()=>{
  const bytes=new Uint8Array([1,2,3,4]),value=envelope([{id:'b',doc:{name:'Ekip'},files:[{id:'f',path:'boards/b/n/f',name:'../../plan.pdf',size:4,state:'ready',deleted:false}]}]);
  const chunks=[];const output=new Writable({write(chunk,_encoding,cb){chunks.push(chunk);cb();}});
  await streamFullZip(output,value,{async get(path){assert.equal(path,'boards/b/n/f');return {statusCode:200,stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})};}});
  const archive=unzipSync(Buffer.concat(chunks));assert.deepEqual(archive['files/f/.._.._plan.pdf'],bytes);assert.equal(JSON.parse(strFromU8(archive['workspace.json'])).boards[0].doc.name,'Ekip');
});
test('full ZIP refuses missing or oversized files instead of delivering an incomplete backup',async()=>{
  const out=()=>new Writable({write(_c,_e,cb){cb();}}),base={id:'b',files:[{id:'f',path:'x',name:'p',size:1,state:'ready',deleted:false}]};
  await assert.rejects(()=>streamFullZip(out(),envelope([base]),{async get(){return null;}}),e=>e.status===404);
  await assert.rejects(()=>streamFullZip(out(),envelope([{...base,files:[{...base.files[0],size:101*1024*1024}]}]),{}),e=>e.status===413);
});
