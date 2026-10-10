'use strict';
const {fail}=require('./http.cjs');
const issuer='https://token.actions.githubusercontent.com';
const audience='https://ekip.birlikteiyilik.com/api/maintenance';
const repository='birlikteiyilik/birlikte-iyilik-ekip';
const repositoryId='1413149491',ownerId='276585485';
const workflow=repository+'/.github/workflows/maintenance.yml@refs/heads/main';
let defaultVerifier;
async function createVerifier(keySet){
  const {jwtVerify}=await import('jose');
  return async function verify(authorization){
    if(!/^Bearer [^\s]{1,8192}$/.test(authorization||''))fail(401,'Yetkilendirilmiş bakım kimliği gerekli.');
    let payload;
    try{({payload}=await jwtVerify(authorization.slice(7),keySet,{issuer,audience,algorithms:['RS256'],maxTokenAge:'5m',clockTolerance:5,requiredClaims:['sub','iat','exp','jti']}));}
    catch{fail(401,'Bakım kimliği doğrulanamadı.');}
    const subjects=[`repo:${repository}:ref:refs/heads/main`,`repo:birlikteiyilik@${ownerId}/birlikte-iyilik-ekip@${repositoryId}:ref:refs/heads/main`];
    if(payload.repository!==repository||payload.repository_id!==repositoryId||payload.repository_owner_id!==ownerId||payload.ref!=='refs/heads/main'||payload.workflow_ref!==workflow||!subjects.includes(payload.sub)||!['schedule','workflow_dispatch'].includes(payload.event_name))fail(403,'Bu GitHub işi bakım yetkisine sahip değil.');
    return {runId:payload.run_id};
  };
}
async function verifyMaintenance(authorization){
  if(!/^Bearer [^\s]{1,8192}$/.test(authorization||''))fail(401,'Yetkilendirilmiş bakım kimliği gerekli.');
  if(!defaultVerifier)defaultVerifier=(async()=>{const {createRemoteJWKSet}=await import('jose');return createVerifier(createRemoteJWKSet(new URL(issuer+'/.well-known/jwks')));})();
  return (await defaultVerifier)(authorization);
}
module.exports={verifyMaintenance,createVerifier,issuer,audience,repository,repositoryId,ownerId,workflow};
