'use strict';
const {gzipSync,gunzipSync}=require('node:zlib');
const MAX_DOCUMENT=750000;
function encode(content){return {contentGzip:gzipSync(Buffer.from(content),{level:6}).toString('base64'),format:'json-gzip-v1'};}
function decode(data){
  const content=data.contentGzip?gunzipSync(typeof data.contentGzip==='string'?Buffer.from(data.contentGzip,'base64'):Buffer.from(data.contentGzip),{maxOutputLength:MAX_DOCUMENT}).toString('utf8'):data.content;
  if(typeof content!=='string'||Buffer.byteLength(content)>MAX_DOCUMENT)throw new Error('Invalid snapshot.');
  return JSON.parse(content);
}
module.exports={encode,decode};
