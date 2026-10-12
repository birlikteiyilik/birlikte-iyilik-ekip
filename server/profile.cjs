'use strict';
const {createHash}=require('node:crypto');
const PHOTO_LIMIT=512*1024;
const bad=message=>{throw Object.assign(new Error(message),{status:422,body:{status:422,detail:message}});};
function publicUser(u){
 const fields=['id','name','email','title','role','active','createdAt','firstName','lastName','profileUpdatedAt'];
 const out=Object.fromEntries(fields.filter(k=>u[k]!==undefined).map(k=>[k,u[k]]));
 out.avatarVersion=u.avatar?.version||'';return out;
}
function name(value){if(typeof value!=='string')bad('Ad ve soyad metin olmalı.');const text=value.trim().replace(/\s+/gu,' ');if(!text||text.length>100||/[\u0000-\u001f\u007f]/u.test(text))bad('Ad ve soyad 1–100 karakter olmalı.');return text;}
function photo(dataUrl){
 if(dataUrl===null)return null;
 if(typeof dataUrl!=='string'||dataUrl.length>700000)bad('Profil fotoğrafı en fazla 512 KB olmalı.');
 const m=/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);if(!m)bad('JPEG, PNG veya WebP fotoğraf kullanın.');
 const bytes=Buffer.from(m[2],'base64');if(!bytes.length||bytes.length>PHOTO_LIMIT||bytes.toString('base64')!==m[2])bad('Geçersiz veya büyük profil fotoğrafı.');
 let width=0,height=0;
 if(m[1]==='png'&&bytes.length>=33&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.toString('ascii',12,16)==='IHDR'){width=bytes.readUInt32BE(16);height=bytes.readUInt32BE(20);}
 if(m[1]==='jpeg'&&bytes[0]===255&&bytes[1]===216){
  for(let i=2;i+4<=bytes.length;){if(bytes[i]!==255)break;const marker=bytes[i+1];if(marker===217||marker===218)break;if(marker===216||marker===0x01||(marker>=208&&marker<=215)){i+=2;continue;}
   const size=bytes.readUInt16BE(i+2);if(size<2||i+2+size>bytes.length)break;
   if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&size>=8){height=bytes.readUInt16BE(i+5);width=bytes.readUInt16BE(i+7);break;}i+=2+size;
  }
 }
 if(m[1]==='webp'&&bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  const format=bytes.toString('ascii',12,16);
  if(format==='VP8X'){width=1+bytes.readUIntLE(24,3);height=1+bytes.readUIntLE(27,3);}
  else if(format==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42){width=bytes.readUInt16LE(26)&16383;height=bytes.readUInt16LE(28)&16383;}
  else if(format==='VP8L'&&bytes[20]===47){width=1+((bytes[21]|bytes[22]<<8)&16383);height=1+((bytes[22]>>6|bytes[23]<<2|bytes[24]<<10)&16383);}
 }
 if(!width||!height||width>768||height>768)bad('Fotoğrafı küçük bir avatar olarak yeniden seçin (en fazla 768×768).');
 return {mime:'image/'+m[1],base64:m[2],size:bytes.length,version:createHash('sha256').update(bytes).digest('hex').slice(0,24)};
}
function patch(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['firstName','lastName','avatar'].includes(k)))bad('Yalnız kendi adınızı, soyadınızı ve fotoğrafınızı değiştirebilirsiniz.');
 const value={};
 if(Object.hasOwn(body,'firstName')||Object.hasOwn(body,'lastName')){value.firstName=name(body.firstName);value.lastName=name(body.lastName);value.name=value.firstName+' '+value.lastName;}
 if(Object.hasOwn(body,'avatar'))value.avatar=photo(body.avatar);
 if(!Object.keys(value).length)bad('Kaydedilecek profil değişikliği yok.');return value;
}
module.exports={publicUser,patch,photo,PHOTO_LIMIT};
