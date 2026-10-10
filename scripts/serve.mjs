import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(process.env.DAL_PREVIEW_DIR||'dist'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+'/')&&path!==root)throw Error();let data;try{data=await readFile(path);}catch{data=await readFile(root+'/index.html');res.setHeader('Content-Type','text/html');}if(!res.hasHeader('Content-Type'))res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404);res.end('Bulunamadı');}}).listen(5173,'127.0.0.1',()=>console.log('Web sitesi: http://localhost:5173'));
