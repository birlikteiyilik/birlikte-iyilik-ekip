import {initializeApp} from 'firebase/app';
import {getAuth,setPersistence,browserSessionPersistence,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,updateProfile,connectAuthEmulator,onAuthStateChanged} from 'firebase/auth';
import {getFunctions,httpsCallable,connectFunctionsEmulator} from 'firebase/functions';
import {getStorage,ref,uploadBytes,getBlob,connectStorageEmulator} from 'firebase/storage';
const config=window.DAL_CONFIG;
const app=initializeApp(config.firebase),auth=getAuth(app),functions=getFunctions(app,config.region),storage=getStorage(app);
auth.languageCode='tr';
if(config.emulators&&['localhost','127.0.0.1'].includes(location.hostname)){
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
  if(path==='/logout'){await signOut(auth);return {ok:true};}
  if(path==='/password'){await sendPasswordResetEmail(auth,auth.currentUser.email);return {ok:true};}
  if(!auth.currentUser)throw error('Ekip hesabınıza giriş yapın.',401);
  const result=(await call({path,method,body})).data;
  if(result.error)throw Object.assign(new Error(result.error.detail),{status:result.error.status,body:result.error});
  return result;
 }catch(e){if(e.status)throw e;if(e.code?.startsWith('auth/'))throw error(authErrors[e.code]||'Giriş tamamlanamadı. E-posta ve parola bilgilerini kontrol edin.',401);throw error('Firebase bağlantısı tamamlanamadı. Bağlantıyı kontrol edip tekrar deneyin.',503);}
}
const cache=new Map();
async function api(path,method='GET',body={}){await ready;if(method!=='GET'){cache.clear();try{return await request(path,method,body);}finally{cache.clear();}}const cacheable=path==='/hub'||path==='/boards'||(path.startsWith('/boards/')&&path.includes('?since='));if(!cacheable)return request(path,method,body);const key=(auth.currentUser?.uid||'')+':'+path,old=cache.get(key);if(old&&Date.now()-old.time<8000)return structuredClone(await old.promise);const promise=request(path,method,body);cache.set(key,{time:Date.now(),promise});try{return structuredClone(await promise);}catch(e){cache.delete(key);throw e;}}
async function google(){await ready;try{await signInWithPopup(auth,new GoogleAuthProvider());location.reload();}catch(e){throw error(authErrors[e.code]||'Google girişi tamamlanamadı.');}}
async function signup({email,password,name}){await ready;if(password.length<12)throw error('Parola en az 12 karakter olmalı.');try{const {user}=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(user,{displayName:name});await sendEmailVerification(user);await signOut(auth);}catch(e){throw error(authErrors[e.code]||'Hesap oluşturulamadı.');}}
async function reset(email){await ready;try{await sendPasswordResetEmail(auth,email);}catch(e){if(e.code!=='auth/user-not-found')throw error(authErrors[e.code]||'Yenileme e-postası gönderilemedi.');}}
async function upload(boardId,nodeId,file){if(!file||file.size>10*1024*1024)throw error('Dosya en fazla 10 MB olmalı.');const id=crypto.randomUUID();const path=`boards/${boardId}/${nodeId}/${id}`;await api(`/boards/${boardId}/files/prepare`,'POST',{nodeId});await uploadBytes(ref(storage,path),file,{contentType:file.type||'application/octet-stream'});return api(`/boards/${boardId}/files`,'POST',{id,nodeId,name:file.name,path,size:file.size,type:file.type});}
async function download(file){const blob=await getBlob(ref(storage,file.path),10*1024*1024);const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
window.DalFirebase={api,ready,google,signup,reset,upload,download};
