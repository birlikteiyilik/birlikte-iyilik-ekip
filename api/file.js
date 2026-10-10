'use strict';
const {Readable}=require('node:stream');
const {pipeline}=require('node:stream/promises');
const {authenticate,headers,error,fail}=require('../server/http.cjs');
const {getWorkspace}=require('../server/service.cjs');
const {getServices}=require('../server/admin.cjs');
module.exports=async function file(req,res) {
  try {
    if(req.method!=='GET')fail(405,'GET gerekli.');
    const auth=await authenticate(req),service=getWorkspace(),u=await service.user({auth}),url=new URL(req.url,'https://local.invalid');
    const boardId=service.ident(url.searchParams.get('boardId')),id=service.ident(url.searchParams.get('id'));
    await service.getBoard(u,boardId);
    const s=await getServices().db.doc(`boards/${boardId}/files/${id}`).get(),d=s.data();
    if(!s.exists||d.deleted||d.state!=='ready')fail(404,'Dosya bulunamadı.');
    const value=await service.storage.blob.get(d.path,{access:'private'});
    if(!value||value.statusCode!==200)fail(404,'Dosya bulunamadı.');
    headers(res);res.setHeader('Content-Type',d.type);res.setHeader('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(d.name)}`);
    await pipeline(Readable.fromWeb(value.stream),res);
  }catch(e){if(!res.headersSent)error(res,e);else res.destroy();}
};
