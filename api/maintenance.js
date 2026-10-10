'use strict';
const {verifyMaintenance}=require('../server/maintenance-auth.cjs');
const {authenticate,json,error,fail}=require('../server/http.cjs');
const {getWorkspace}=require('../server/service.cjs');
const {getServices}=require('../server/admin.cjs');
const {dailyMaintenance}=require('../server/backup.cjs');
module.exports=async function maintenance(req,res) {
  try {
    let service;
    if(req.method==='GET') {
      await verifyMaintenance(req.headers.authorization);
    } else if(req.method==='POST') {
      const auth=await authenticate(req);service=getWorkspace();const u=await service.user({auth});if(u.role!=='admin')fail(403,'Kurum yöneticisi yetkisi gerekli.');
    }else fail(405,'GET veya POST gerekli.');
    service=service||getWorkspace();
    json(res,200,await dailyMaintenance({db:getServices().db,service,blob:service.storage.blob}));
  }catch(e){error(res,e);}
};
