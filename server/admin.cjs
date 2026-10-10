'use strict';
const {initializeApp,getApps}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const config=require('./config.cjs');
let services;
function getServices(){
 if(services)return services;
 const local=!process.env.VERCEL&&process.env.DAL_LOCAL_API==='1';
 if(local&&!process.env.FIREBASE_AUTH_EMULATOR_HOST)throw Error('Local API requires the Auth emulator.');
 if(!local&&(process.env.FIREBASE_AUTH_EMULATOR_HOST||process.env.FIRESTORE_EMULATOR_HOST))throw Error('Emulators are forbidden in production.');
 if(!local&&process.env.VERCEL_ENV!=='production')throw Object.assign(new Error('Önizleme ortak canlı verilere bağlanmaz.'),{status:503});
 // ID-token verification uses Firebase's public signing certificates, without an admin private key.
 const app=getApps().find(a=>a.name==='vercel-workspace')||initializeApp({projectId:local?'demo-birlikte-iyilik':config.projectId},'vercel-workspace');
 services={auth:getAuth(app),local,get db(){return require('./database.cjs').getDatabase();}};
 return services;
}
module.exports={getServices};
