import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
await mkdir('functions/shared',{recursive:true});
for(const name of ['core.js','collab.js','hub-model.js','coordination-model.js'])await copyFile('web/'+name,'functions/shared/'+name);
// Production imports the original web models directly; only the legacy emulator gets generated copies.
const workspace=await readFile('server/workspace.cjs','utf8');
await writeFile('functions/workspace.cjs',workspace.replaceAll("require('../web/","require('./shared/"));
await copyFile('server/snapshots.cjs','functions/snapshots.cjs');

await copyFile('server/profile.cjs','functions/profile.cjs');
