'use strict';
let services;
function getServices(){
 if(services)return services;
 const local=!process.env.VERCEL&&process.env.DAL_LOCAL_API==='1';
 if(local&&!process.env.FIREBASE_AUTH_EMULATOR_HOST)throw Error('Local API requires the Auth emulator.');
 if(!local&&(process.env.FIREBASE_AUTH_EMULATOR_HOST||process.env.FIRESTORE_EMULATOR_HOST))throw Error('Emulators are forbidden in production.');
 if(!local&&process.env.VERCEL_ENV!=='production')throw Object.assign(new Error('Önizleme ortak canlı verilere bağlanmaz.'),{status:503});
 let auth;
 if(local){
  // The Admin SDK is reserved for the isolated emulator, never loaded in production.
  const {initializeApp,getApps}=require('firebase-admin/app');
  const {getAuth}=require('firebase-admin/auth');
  const app=getApps().find(a=>a.name==='vercel-workspace')||initializeApp({projectId:'demo-birlikte-iyilik'},'vercel-workspace');
  auth=getAuth(app);
 }else auth={verifyIdToken:require('./firebase-auth.cjs').verifyIdToken};
 services={auth,local,get db(){return require('./database.cjs').getDatabase();}};
 return services;
}
module.exports={getServices};
