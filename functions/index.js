'use strict';
const {initializeApp,getApps}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const createWorkspace=require('./workspace.cjs');
if(!getApps().length)initializeApp();
const db=getFirestore(),service=createWorkspace({db,storage:{async metadata(path){const [value]=await getStorage().bucket().file(path).getMetadata();return value;}}});
const options={region:'europe-west3',memory:'256MiB',timeoutSeconds:60,maxInstances:3};
exports.workspace=onCall(options,async request=>{
 if(!request.auth)throw new HttpsError('unauthenticated','Giriş yapın.');
 try{return await service.handle(request);}catch(e){if(e.status)return {error:e.body};if(e.message?.startsWith('Geç')||e.message?.includes('görev')||e.message?.includes('Dosya')||e.message?.includes('sınır')||e.message?.includes('karakter')||e.message?.includes('döngü')||e.message?.includes('Bağıml')||e.message?.includes('Tekrar')||e.message?.includes('Önce'))return {error:{status:422,detail:e.message}};console.error('Workspace error',e);throw new HttpsError('internal','İşlem tamamlanamadı. Yeniden deneyin.');}
});
exports.dailyCoordination=onSchedule({...options,schedule:'every day 08:00',timeZone:'Europe/Istanbul'},()=>service.coordinate());
