'use strict';
const {handleUploadPresigned}=require('@vercel/blob/client');
const {issueSignedToken}=require('@vercel/blob');
const {authenticate,readJson,json,error,fail}=require('../server/http.cjs');
const {getWorkspace}=require('../server/service.cjs');
const {getServices}=require('../server/admin.cjs');
module.exports=async function upload(req,res) {
  try {
    if(req.method!=='POST')fail(405,'POST gerekli.');
    const body=await readJson(req,20000);
    const result=await handleUploadPresigned({request:req,body,
      async getSignedToken(pathname) {
        const auth=await authenticate(req),service=getWorkspace(),u=await service.user({auth});
        const {boardId,nodeId,id}=service.storage.locate(pathname),b=await service.getBoard(u,boardId,'editor',false);
        const file=await service.storage.pending(pathname,u,b);
        return {token:await issueSignedToken({pathname,operations:['put'],validUntil:Date.now()+10*60000,allowedContentTypes:[file.type],maximumSizeInBytes:file.size}),urlOptions:{allowedContentTypes:[file.type],maximumSizeInBytes:file.size,validUntil:Date.now()+10*60000,addRandomSuffix:false,allowOverwrite:false,cacheControlMaxAge:60,
          tokenPayload:JSON.stringify({uid:u.id,boardId,nodeId,id,path:pathname})}};
      },
      async onUploadCompleted({blob,tokenPayload}) {
        const data=JSON.parse(tokenPayload||'null');if(!data||blob.pathname!==data.path)fail(403,'Yükleme bildirimi geçersiz.');
        const service=getWorkspace(),s=await getServices().db.doc('users/'+service.ident(data.uid)).get();
        if(!s.exists||!s.data().active)fail(403,'Üye erişimi kapanmış.');
        const u={...s.data(),id:s.id},b=await service.getBoard(u,data.boardId,'editor',false);
        await service.storage.finish({u,b,body:data});
      }
    });
    json(res,200,result);
  }catch(e){error(res,e);}
};
