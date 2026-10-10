'use strict';
const {authenticate,headers,error,fail}=require('../server/http.cjs');
const {getWorkspace}=require('../server/service.cjs');
const {getServices}=require('../server/admin.cjs');
const {collectBoard,envelope,gzipBackup,streamFullZip}=require('../server/backup.cjs');
module.exports=async function backup(req,res) {
  try {
    if(req.method!=='GET')fail(405,'GET gerekli.');
    const auth=await authenticate(req),service=getWorkspace(),u=await service.user({auth}),url=new URL(req.url,'https://local.invalid');
    const bid=service.ident(url.searchParams.get('boardId')),mode=url.searchParams.get('mode');
    if(!['full','metadata'].includes(mode))fail(422,'Geçersiz yedek türü.');
    await service.getBoard(u,bid,'manager');
    const value=envelope([await collectBoard(getServices().db,bid)]);
    // Re-check role after collection so a revoked manager cannot initiate a download.
    await service.getBoard(u,bid,'manager');
    if(mode==='full'&&value.boards[0].files.filter(f=>f.state==='ready'&&!f.deleted).reduce((n,f)=>n+f.size,0)>100*1024*1024)fail(413,'Tam ZIP sınırı 100 MB. Kayıt yedeğini ve dosyaları ayrı indirin.');
    headers(res);res.setHeader('Content-Disposition',`attachment; filename="Birlikte_Iyilik_${bid}.${mode==='full'?'zip':'json.gz'}"`);
    if(mode==='full'){res.setHeader('Content-Type','application/zip');await streamFullZip(res,value,service.storage.blob);}
    else {const {bytes}=gzipBackup(value);res.setHeader('Content-Type','application/gzip');res.end(bytes);}
  }catch(e){if(!res.headersSent)error(res,e);else res.destroy();}
};
