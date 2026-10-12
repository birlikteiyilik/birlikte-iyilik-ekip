/* Deploy a tested main-branch source archive as the company account.
   Git author stays intact in GitHub; company credentials never enter the archive. */
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const TEAM='birlikteiyilikakademi-8992s-projects';
const ACCOUNT='birlikteiyilikakademi-8992';
const PROJECT='prj_UYc23eeMDrVhlPLZ0gSAbKRB2Ywx';
const ORG='team_0xhbl5nKwdqDc7EeaJBnQK8V';
const prepareOnly=process.argv.includes('--prepare-only');
function run(cmd,args,options={}){
 return new Promise((resolve,reject)=>{
  const child=spawn(cmd,args,{...options,stdio:options.capture?['ignore','pipe','inherit']:'inherit'});
  let output='';child.stdout?.on('data',part=>{output+=part;});
  child.on('error',reject);child.on('exit',code=>code===0?resolve(output.trim()):reject(new Error(cmd+' failed with exit '+code)));
 });
}
let releaseDir;
try{
 if(!prepareOnly){
  if(process.env.GITHUB_REPOSITORY!=='birlikteiyilik/birlikte-iyilik-ekip'||process.env.GITHUB_REF!=='refs/heads/main'||!['push','workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME))throw new Error('Only this repository and main push/manual events may publish.');
  if(!process.env.VERCEL_TOKEN)throw new Error('Set the company-scoped VERCEL_TOKEN in repository Actions secrets. Never put it in source or chat.');
 }
 const sha=await run('git',['rev-parse','HEAD'],{capture:true});
 if(!/^[a-f0-9]{40}$/.test(sha)||(!prepareOnly&&sha!==process.env.GITHUB_SHA))throw new Error('Release must be the exact tested commit.');
 const tracked=await run('git',['ls-files'],{capture:true});
 if(tracked.split('\n').some(name=>/(^|\/)(\.env(?:\..*)?|\.vercel|node_modules)(\/|$)/.test(name)||/service-account.*\.json$|\.private\.json$/.test(name)))throw new Error('Private/local files must not be tracked in release source.');
 releaseDir=await mkdtemp(join(process.env.RUNNER_TEMP||tmpdir(),'ekip-release-'));
 // Tar output remains in the temporary directory, never a CI artifact.
 const archive=join(releaseDir,'source.tar');
 await run('git',['archive','--format=tar','--output='+archive,sha]);
 await run('tar',['-xf',archive,'-C',releaseDir]);await rm(archive);
 await mkdir(join(releaseDir,'.vercel'),{recursive:true});
 await writeFile(join(releaseDir,'.vercel','project.json'),JSON.stringify({projectId:PROJECT,orgId:ORG,projectName:'birlikte-iyilik-ekip'}));
 console.log('Prepared tested source '+sha+' for '+TEAM+'.');
 if(!prepareOnly){
  const account=await run('vercel',['whoami'],{capture:true});
  if(account!==ACCOUNT)throw new Error('VERCEL_TOKEN must belong to the company Vercel account. Release stopped.');
  await run('vercel',['deploy','--prod','--yes','--non-interactive','--scope',TEAM,'--meta','sourceCommit='+sha],{cwd:releaseDir});
 }
} catch(error){console.error(error.message);process.exitCode=1;}
finally{if(releaseDir)await rm(releaseDir,{recursive:true,force:true});}
