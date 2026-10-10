'use strict';
const {authenticate,readJson,json,error,fail}=require('../server/http.cjs');
const {getWorkspace}=require('../server/service.cjs');
module.exports=async function workspace(req,res) {
  try {
    if(req.method!=='POST') {res.setHeader('Allow','POST');fail(405,'POST gerekli.');}
    const auth=await authenticate(req),data=await readJson(req);
    if(!data||typeof data!=='object'||!['GET','POST','PUT','PATCH','DELETE'].includes(data.method||'GET')||typeof data.path!=='string'||!data.path.startsWith('/')||data.path.startsWith('//'))fail(400,'Geçersiz işlem.');
    json(res,200,await getWorkspace().handle({auth,data}));
  } catch(e) {error(res,e);}
};
