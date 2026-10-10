'use strict';
const {timingSafeEqual}=require('node:crypto');
const {authenticate,json,error,fail}=require('../server/http.cjs');
const {getWorkspace}=require('../server/service.cjs');
const {getServices}=require('../server/admin.cjs');
const {dailyMaintenance}=require('../server/backup.cjs');
module.exports=async function maintenance(req,res) {
  try {
    let service;
    if(req.method==='GET') {
      const secret=process.env.CRON_SECRET,expected=Buffer.from('Bearer '+(secret||'')),actual=Buffer.from(req.headers.authorization||'');
      if(!secret||secret.length<32||expected.length!==actual.length||!timingSafeEqual(expected,actual))fail(401,'Yetkilendirilmiş zamanlayıcı gerekli.');
    } else if(req.method==='POST') {
      const auth=await authenticate(req);service=getWorkspace();const u=await service.user({auth});if(u.role!=='admin')fail(403,'Kurum yöneticisi yetkisi gerekli.');
    }else fail(405,'GET veya POST gerekli.');
    service=service||getWorkspace();
    json(res,200,await dailyMaintenance({db:getServices().db,service,blob:service.storage.blob}));
  }catch(e){error(res,e);}
};
