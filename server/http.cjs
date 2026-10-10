'use strict';
const {getServices} = require('./admin.cjs');
const buckets = new Map();
function fail(status, detail) {throw Object.assign(new Error(detail), {status, body:{status,detail}});}
function headers(res) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Vary','Authorization');
}
async function authenticate(req) {
  const value = req.headers.authorization || '';
  if (!/^Bearer [^\s]{1,8192}$/.test(value)) fail(401,'Ekip hesabınıza giriş yapın.');
  let token;
  try {token = await getServices().auth.verifyIdToken(value.slice(7));}
  catch(e) {if (e.status === 503) throw e; fail(401,'Oturum doğrulanamadı. Yeniden giriş yapın.');}
  const key = token.uid, minute = Math.floor(Date.now()/60000);
  let row = buckets.get(key);
  if (!row || row.minute !== minute) buckets.set(key,row={minute,count:0});
  if (++row.count > 90) fail(429,'Çok fazla istek. Bir dakika sonra yeniden deneyin.');
  if (buckets.size > 1000) for (const [id,b] of buckets) if (b.minute !== minute) buckets.delete(id);
  return {uid:token.uid,token};
}
async function readJson(req, limit=1500000) {
  if (Number(req.headers['content-length']) > limit) fail(413,'İstek boyutu sınırı aşıldı.');
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > limit) fail(413,'İstek boyutu sınırı aşıldı.');
    try {return JSON.parse(raw);} catch {fail(400,'Geçersiz JSON.');}
  }
  const chunks=[]; let size=0;
  for await (const part of req) {size+=part.length;if(size>limit)fail(413,'İstek boyutu sınırı aşıldı.');chunks.push(part);}
  try {return JSON.parse(Buffer.concat(chunks).toString('utf8'));} catch {fail(400,'Geçersiz JSON.');}
}
function json(res, status, data) {headers(res);res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));}
function error(res,e) {
  if(!e.status&&process.env.DAL_LOCAL_API==='1'&&!process.env.VERCEL)console.error(e);
  else if(!e.status)console.error('Ekip API failure',e.code||e.name||'unknown');
  const status=e.status || ([8,'resource-exhausted'].includes(e.code)?429:e.name==='ValidationError'?422:503);
  // Never return credential, database or internal exception text to a browser.
  json(res,status,{error:e.body||{status,detail:status===429?'Ücretsiz hizmet kotası doldu. Taslağınızı indirip daha sonra yeniden deneyin.':status===422?e.message:'Kayıt servisine ulaşılamıyor. Taslağınızı koruyup tekrar deneyin.'}});
}
module.exports={authenticate,readJson,headers,json,error,fail};
