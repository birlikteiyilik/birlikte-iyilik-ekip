const endpoint='https://ekip.birlikteiyilik.com/api/maintenance';
if(process.env.GITHUB_ACTIONS!=='true'||process.env.GITHUB_REPOSITORY!=='birlikteiyilik/birlikte-iyilik-ekip'||process.env.GITHUB_REF!=='refs/heads/main')throw Error('Bu komut yalnız ekip deposunun main GitHub işi içindir.');
const tokenUrl=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
tokenUrl.searchParams.set('audience',endpoint);
const identityResponse=await fetch(tokenUrl,{headers:{Authorization:'Bearer '+process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(15000)});
if(!identityResponse.ok)throw Error('GitHub iş kimliği alınamadı.');
const {value:identity}=await identityResponse.json();
if(typeof identity!=='string')throw Error('GitHub iş kimliği eksik.');
// Never print the short-lived identity or any authentication environment variable.
const response=await fetch(endpoint,{headers:{Authorization:'Bearer '+identity},signal:AbortSignal.timeout(70000)});
if(!response.ok)throw Error('Günlük bakım tamamlanamadı. HTTP '+response.status);
const result=await response.json();
if(!result.ok)throw Error('Günlük bakım onayı alınamadı.');
console.log(JSON.stringify({ok:true,skipped:!!result.skipped,day:result.day||null}));
