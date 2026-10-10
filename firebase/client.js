import {initializeApp} from 'firebase/app';
import {getAuth,setPersistence,browserSessionPersistence,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,updateProfile,connectAuthEmulator,onAuthStateChanged} from 'firebase/auth';
import {getFunctions,httpsCallable,connectFunctionsEmulator} from 'firebase/functions';
import {uploadPresigned as uploadBlob} from '@vercel/blob/client';
import {getStorage,ref,uploadBytes,getBlob,connectStorageEmulator} from 'firebase/storage';
const config=window.DAL_CONFIG;
const app=initializeApp(config.firebase),auth=getAuth(app),functions=getFunctions(app,config.region),storage=getStorage(app);
auth.languageCode='tr';
const local=config.emulators&&['localhost','127.0.0.1'].includes(location.hostname);
if(local){
 connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFunctionsEmulator(functions,'127.0.0.1',5001);connectStorageEmulator(storage,'127.0.0.1',9199);
}
const ready=setPersistence(auth,browserSessionPersistence).then(()=>new Promise(resolve=>{const unsub=onAuthStateChanged(auth,()=>{unsub();resolve();});}));
const call=httpsCallable(functions,'workspace',{timeout:60000});
const error=(message,status=400)=>Object.assign(new Error(message),{status,body:{detail:message}});
const authErrors={'auth/invalid-credential':'E-posta veya parola hatalı.','auth/too-many-requests':'Çok fazla deneme. Bir süre sonra tekrar deneyin.','auth/popup-closed-by-user':'Google giriş penceresi kapatıldı.','auth/email-already-in-use':'Bu e-posta ile bir hesap var. Giriş yapın veya parolanızı yenileyin.','auth/weak-password':'En az 12 karakterli güçlü bir parola girin.','auth/unauthorized-domain':'Bu alan adı Firebase giriş ayarlarında yetkilendirilmemiş.','auth/operation-not-allowed':'Bu giriş yöntemi Firebase projesinde henüz etkinleştirilmemiş.'};
async function request(path,method='GET',body={}){
 await ready;
 try{
  if(path==='/login'){await signInWithEmailAndPassword(auth,body.email,body.password);return api('/me');}
  if(path==='/logout'){cache.clear();await signOut(auth);return {ok:true};}
  if(path==='/password'){await sendPasswordResetEmail(auth,auth.currentUser.email);return {ok:true};}
  if(!auth.currentUser)throw error('Ekip hesabınıza giriş yapın.',401);
  let result;
  if(local) result=(await call({path,method,body})).data;
  else {const response=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await auth.currentUser.getIdToken()},body:JSON.stringify({path,method,body})});try{result=await response.json();}catch{throw error('Kayıt servisi yanıt vermedi. Taslağınızı koruyup yeniden deneyin.',503);}if(!response.ok&&!result.error)throw error('İşlem tamamlanamadı.',response.status);}
  if(result.error)throw Object.assign(new Error(result.error.detail),{status:result.error.status,body:result.error});
  return result;
 }catch(e){if(e.status)throw e;if(e.code?.startsWith('auth/'))throw error(authErrors[e.code]||'Giriş tamamlanamadı. E-posta ve parola bilgilerini kontrol edin.',401);throw error('Sunucu bağlantısı tamamlanamadı. Bağlantıyı kontrol edip tekrar deneyin.',503);}
}
const cache=new Map();
async function api(path,method='GET',body={}){await ready;if(method!=='GET'){cache.clear();try{return await request(path,method,body);}finally{cache.clear();}}const cacheable=path==='/hub'||path==='/boards'||(path.startsWith('/boards/')&&path.includes('?since='));if(!cacheable)return request(path,method,body);const key=(auth.currentUser?.uid||'')+':'+path,old=cache.get(key);if(old&&Date.now()-old.time<30000)return structuredClone(await old.promise);const promise=request(path,method,body);cache.set(key,{time:Date.now(),promise});try{return structuredClone(await promise);}catch(e){cache.delete(key);throw e;}}
async function google(){await ready;try{await signInWithPopup(auth,new GoogleAuthProvider());location.reload();}catch(e){throw error(authErrors[e.code]||'Google girişi tamamlanamadı.');}}
async function signup({email,password,name}){await ready;if(password.length<12)throw error('Parola en az 12 karakter olmalı.');try{const {user}=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(user,{displayName:name});await sendEmailVerification(user);await signOut(auth);}catch(e){throw error(authErrors[e.code]||'Hesap oluşturulamadı.');}}
async function reset(email){await ready;try{await sendPasswordResetEmail(auth,email);}catch(e){if(e.code!=='auth/user-not-found')throw error(authErrors[e.code]||'Yenileme e-postası gönderilemedi.');}}
async function upload(boardId,nodeId,file){
 if(!file||file.size<1||file.size>10*1024*1024)throw error('Dosya 1 bayt ile 10 MB arasında olmalı.');
 const id=crypto.randomUUID(),path=`boards/${boardId}/${nodeId}/${id}`,body={id,nodeId,path,name:file.name,size:file.size,type:file.type||'application/octet-stream'};
 await api(`/boards/${boardId}/files/prepare`,'POST',body);
 if(local)await uploadBytes(ref(storage,path),file,{contentType:body.type});
 else await uploadBlob(path,file,{access:'private',handleUploadUrl:'/api/upload',contentType:body.type,addRandomSuffix:false,headers:{Authorization:'Bearer '+await auth.currentUser.getIdToken()}});
 return api(`/boards/${boardId}/files`,'POST',body);
}
async function authorizedDownload(url,name){
 await ready;if(!auth.currentUser)throw error('Yeniden giriş yapın.',401);
 const response=await fetch(url,{headers:{Authorization:'Bearer '+await auth.currentUser.getIdToken()}});
 if(!response.ok){let detail;try{detail=(await response.json()).error?.detail;}catch{}throw error(detail||'İndirme tamamlanamadı.',response.status);}
 const object=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=object;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(object),30000);
}
async function download(file){
 if(!local){const [,boardId]=file.path.split('/');return authorizedDownload('/api/file?'+new URLSearchParams({boardId,id:file.id}),file.name);}
 const blob=await getBlob(ref(storage,file.path),10*1024*1024),link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function backup(boardId,mode='metadata'){return authorizedDownload('/api/backup?'+new URLSearchParams({boardId,mode}),'Birlikte_Iyilik_'+boardId+'_'+new Date().toISOString().slice(0,10)+(mode==='full'?'.zip':'.json.gz'));}
window.DalFirebase={api,ready,google,signup,reset,upload,download,backup};
