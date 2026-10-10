'use strict';
const {projectId}=require('./config.cjs');
const jwksUrl='https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let verifier;
async function createVerifier(keySet){
  const {jwtVerify}=await import('jose');
  return async function verifyIdToken(token){
    const {payload,protectedHeader}=await jwtVerify(token,keySet,{
      issuer:'https://securetoken.google.com/'+projectId,
      audience:projectId,
      algorithms:['RS256'],
      requiredClaims:['exp','iat','aud','iss','sub','auth_time']
    });
    const now=Math.floor(Date.now()/1000);
    // Firebase ID tokens have a single project audience and a non-empty UID.
    // Ignore any supplied uid field: the signed subject is authoritative.
    if(typeof protectedHeader.kid!=='string'||!protectedHeader.kid||payload.aud!==projectId||
      typeof payload.sub!=='string'||!payload.sub||payload.sub.length>128||
      !Number.isFinite(payload.iat)||payload.iat>now||payload.iat<0||
      !Number.isFinite(payload.auth_time)||payload.auth_time>now||payload.auth_time<0)throw Error('Invalid Firebase ID token claims.');
    return {...payload,uid:payload.sub};
  };
}
async function verifyIdToken(token){
  if(!verifier)verifier=(async()=>{
    const {createRemoteJWKSet}=await import('jose');
    // Only Google's fixed signing-key endpoint is trusted; token jku/x5u are ignored.
    return createVerifier(createRemoteJWKSet(new URL(jwksUrl),{cacheMaxAge:60000}));
  })();
  return (await verifier)(token);
}
module.exports={verifyIdToken,createVerifier};
