const {test}=require('node:test'),assert=require('node:assert/strict');
const cfg=require('../server/maintenance-auth.cjs');
test('maintenance accepts only a signed short-lived identity for the exact repository, owner, main and workflow',async()=>{
  const {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT}=await import('jose');
  const {publicKey,privateKey}=await generateKeyPair('RS256'),jwk=await exportJWK(publicKey);jwk.kid='local-test';jwk.alg='RS256';
  const verify=await cfg.createVerifier(createLocalJWKSet({keys:[jwk]}));
  const claims={repository:cfg.repository,repository_id:cfg.repositoryId,repository_owner_id:cfg.ownerId,ref:'refs/heads/main',workflow_ref:cfg.workflow,event_name:'schedule',run_id:'1'};
  const token=(overrides={},options={})=>new SignJWT({...claims,...overrides}).setProtectedHeader({alg:'RS256',kid:'local-test'}).setIssuer(options.issuer||cfg.issuer).setAudience(options.audience||cfg.audience).setSubject(`repo:birlikteiyilik@${cfg.ownerId}/birlikte-iyilik-ekip@${cfg.repositoryId}:ref:refs/heads/main`).setIssuedAt().setExpirationTime(options.expires||'5m').setJti('test-job').sign(privateKey);
  assert.deepEqual(await verify('Bearer '+await token()),{runId:'1'});
  for(const overrides of [{repository_id:'other'},{repository_owner_id:'other'},{ref:'refs/heads/preview'},{workflow_ref:cfg.repository+'/.github/workflows/tests.yml@refs/heads/main'},{event_name:'pull_request'}])await assert.rejects(()=>token(overrides).then(t=>verify('Bearer '+t)),e=>e.status===403);
  for(const options of [{issuer:'https://wrong.example'},{audience:'https://wrong.example'},{expires:Math.floor(Date.now()/1000)-30}])await assert.rejects(()=>token({},options).then(t=>verify('Bearer '+t)),e=>e.status===401);
  await assert.rejects(()=>verify(''),e=>e.status===401);await assert.rejects(()=>verify('Bearer forged'),e=>e.status===401);
});
