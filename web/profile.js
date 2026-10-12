/* Small private avatars; full photographs are resized locally before saving. */
(()=>{
 'use strict';
 const E=window.DalCore.esc,people=new Map(),photos=new Map(),pending=new Map(),failed=new Set();let frame=0;
 function remember(key,data){photos.delete(key);photos.set(key,data);let size=[...photos.values()].reduce((n,s)=>n+s.length,0);while(photos.size>24||size>12*1024*1024){const first=photos.keys().next().value;size-=photos.get(first).length;photos.delete(first);}}
 function register(users=[]){for(const u of users)if(u?.id)people.set(u.id,u);}
 function queue(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;hydrate();});}
 function image(data){return typeof data==='string'&&data.length<=700000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(data);}
 function content(id,version){const src=photos.get(id+':'+version);return src?`<img src="${E(src)}" alt="" width="160" height="160">`:'';}
 function avatar(id){const u=people.get(id);if(!u?.avatarVersion)return '';queue();return ` data-profile-id="${E(id)}" data-profile-version="${E(u.avatarVersion)}"`;}
 async function hydrate(){
  for(const el of document.querySelectorAll('[data-profile-id][data-profile-version]')){
   const r=el.getBoundingClientRect();if(!el.getClientRects().length||r.bottom<0||r.top>innerHeight+160||r.right<0||r.left>innerWidth)continue;
   const id=el.dataset.profileId,version=el.dataset.profileVersion,key=id+':'+version;if(!version)continue;
   if(photos.has(key)){if(!el.querySelector('img'))el.innerHTML=content(id,version);continue;}
   if(pending.has(key)||failed.has(key)||pending.size>=3||!window.DalTeam)continue;
   const task=window.DalTeam.api('/profile-photos/'+encodeURIComponent(id)).then(r=>{if(r.version===version&&image(r.dataUrl)){remember(key,r.dataUrl);for(const node of document.querySelectorAll('[data-profile-id]'))if(node.dataset.profileId===id&&node.dataset.profileVersion===version)node.innerHTML=content(id,version);}else failed.add(key);}).catch(()=>{failed.add(key);}).finally(()=>{pending.delete(key);queue();});
   pending.set(key,task); // Permission errors do not loop; downloads follow visible avatars.
  }
 }
 function form(u){
  register([u]);const words=String(u.name||'').trim().split(/\s+/),first=u.firstName??words.shift()??'',last=u.lastName??words.join(' '),initial=window.DalHubModel.initials(u.name||'');
  return `<form id="profile-form" class="profile-form"><div class="profile-photo-row"><span id="profile-preview" class="profile-photo"${avatar(u.id)}>${content(u.id,u.avatarVersion)||E(initial)}</span><div><label class="team-button profile-file" for="profile-photo">Fotoğraf seç<input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp"></label><button type="button" class="team-link" id="profile-remove" ${u.avatarVersion?'':'hidden'}>Fotoğrafı kaldır</button><p class="team-hint" id="profile-photo-state" role="status">JPEG, PNG veya WebP · 10 MB’a kadar.</p></div></div><div class="team-grid2"><label>Ad<input name="firstName" autocomplete="given-name" required maxlength="100" value="${E(first)}"></label><label>Soyad<input name="lastName" autocomplete="family-name" required maxlength="100" value="${E(last)}"></label></div><div class="profile-save"><span class="team-hint">E-posta ve erişim yetkiniz korunur.</span><button class="team-button solid" type="submit">Profili kaydet</button></div><p class="profile-feedback" role="alert"></p></form>`;
 }
 async function thumbnail(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file?.type)||file.size<1||file.size>10*1024*1024)throw Error('En fazla 10 MB boyutunda JPEG, PNG veya WebP seçin.');
  const url=URL.createObjectURL(file);let bitmap;
  try{
   bitmap=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Fotoğraf açılamadı. Başka bir görsel seçin.'));img.src=url;});
   const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const context=canvas.getContext('2d');if(!context)throw Error('Bu tarayıcıda fotoğraf hazırlanamadı.');
   context.fillStyle='#ffffff';context.fillRect(0,0,512,512);const side=Math.min(bitmap.naturalWidth,bitmap.naturalHeight);context.drawImage(bitmap,(bitmap.naturalWidth-side)/2,(bitmap.naturalHeight-side)/2,side,side,0,0,512,512);
   for(const quality of [.92,.84,.75,.65]){const data=canvas.toDataURL('image/jpeg',quality);if(image(data)&&Math.floor((data.split(',')[1].length*3)/4)<=524288)return data;}throw Error('Fotoğraf küçültülemedi. Daha sade bir fotoğraf seçin.');
  }finally{URL.revokeObjectURL(url);}
 }
 function mount(user,{api,onSaved,canSave=()=>true}){
  const el=document.querySelector('#profile-form');if(!el)return;let selected,preparing=false,version=0;
  const feedback=el.querySelector('.profile-feedback'),preview=el.querySelector('#profile-preview'),submit=el.querySelector('[type=submit]'),remove=el.querySelector('#profile-remove'),file=el.querySelector('#profile-photo');
  const say=text=>{el.querySelector('#profile-photo-state').textContent=text;};
  file.onchange=async()=>{const chosen=file.files[0];if(!chosen)return;const current=++version;preparing=true;submit.disabled=true;feedback.textContent='';say('Fotoğraf hazırlanıyor…');
   try{const data=await thumbnail(chosen);if(current!==version||!el.isConnected)return;selected=data;preview.removeAttribute('data-profile-version');preview.innerHTML=`<img src="${E(data)}" alt="Seçilen fotoğrafın önizlemesi">`;remove.hidden=false;say('Hazır. Profili kaydet ile tamamlayın.');}
   catch(e){if(current===version){feedback.textContent=e.message;say('Yeni bir fotoğraf seçebilirsiniz.');}}
   finally{if(current===version){preparing=false;submit.disabled=false;file.value='';}}
  };
  remove.onclick=()=>{version++;selected=null;preparing=false;submit.disabled=false;preview.removeAttribute('data-profile-version');preview.textContent=window.DalHubModel.initials(user.name||'');remove.hidden=true;say('Fotoğraf kaldırılacak. Profili kaydet ile tamamlayın.');};
  el.onsubmit=async e=>{e.preventDefault();if(preparing||submit.disabled)return;if(!canSave()){feedback.textContent='Önce çalışma değişikliklerinin kaydedilmesini bekleyin.';return;}
   const fields=new FormData(el),body={firstName:String(fields.get('firstName')||'').trim(),lastName:String(fields.get('lastName')||'').trim(),...(selected!==undefined?{avatar:selected}:{})};
   submit.disabled=true;feedback.textContent='Kaydediliyor…';
   try{const result=await api('/me','PATCH',body);register([result.user]);if(selected)remember(result.user.id+':'+result.user.avatarVersion,selected);await onSaved(result.user);}
   catch(err){feedback.textContent=err?.body?.detail||err.message||'Profil kaydedilemedi. Taslağınız burada duruyor.';}
   finally{submit.disabled=false;}
  };
  queue();
 }
 window.DalProfiles={register,avatar,form,mount,thumbnail,hydrate};
 document.addEventListener('scroll',queue,{capture:true,passive:true});
 document.addEventListener('transitionend',e=>{if(e.target.matches?.('.hub-side'))queue();});
})();
