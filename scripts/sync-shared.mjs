import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('functions/shared',{recursive:true});
for(const name of ['core.js','collab.js','hub-model.js','coordination-model.js']) await copyFile('web/'+name,'functions/shared/'+name);
