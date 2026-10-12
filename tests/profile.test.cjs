const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../server/profile.cjs'),C=require('../web/core'),M=require('../web/hub-model');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
test('Profile patch validates names, explicit photo removal and forbids privilege fields atomically',()=>{
 assert.deepEqual(P.patch({firstName:'  Arif Uğur ',lastName:'Çelik'}),{firstName:'Arif Uğur',lastName:'Çelik',name:'Arif Uğur Çelik'});
 assert.deepEqual(P.patch({avatar:null}),{avatar:null});
 for(const input of [{},{role:'admin'},{active:true},{email:'x@y.z'},{userId:'other'},{firstName:'Only'},{firstName:'a',lastName:'\u0000'}])assert.throws(()=>P.patch(input),e=>e.status===422);
});
test('Avatar validation enforces binary format, canonical base64, small dimensions and 512KB cap',()=>{
 const photo=P.photo(png);assert.equal(photo.size,68);assert.equal(photo.mime,'image/png');assert.equal(photo.version.length,24);assert.equal(P.photo(png).version,photo.version);
 for(const bad of ['https://example.com/x.jpg','data:image/svg+xml;base64,PHN2Zy8+','data:image/png;base64,AAAA',png+'x','data:image/png;base64,'+'A'.repeat(700000)])assert.throws(()=>P.photo(bad));
 const huge=Buffer.from(photo.base64,'base64');huge.writeUInt32BE(3000,16);assert.throws(()=>P.photo('data:image/png;base64,'+huge.toString('base64')));
});
test('Public profile metadata excludes photo bytes and unknown internal fields',()=>{
 const u={id:'id',name:'A B',role:'member',active:true,avatar:P.photo(png),privateNote:'hidden'};const out=P.publicUser(u);
 assert.equal(out.avatarVersion,u.avatar.version);assert.equal(out.name,'A B');assert.ok(!JSON.stringify(out).includes(u.avatar.base64));assert.ok(!Object.hasOwn(out,'privateNote'));
});
test('Profile form escapes names and provides labeled name, surname and image controls',()=>{
 const window={DalCore:C,DalHubModel:M};vm.runInNewContext(fs.readFileSync(require.resolve('../web/profile.js'),'utf8'),{window,document:{addEventListener(){}},requestAnimationFrame:()=>1});
 const html=window.DalProfiles.form({id:'id',name:'<img> X',firstName:'<img>',lastName:'X'});
 assert.ok(html.includes('&lt;img&gt;'));assert.ok(!html.includes('<img>'));assert.match(html,/autocomplete="given-name"/);assert.match(html,/autocomplete="family-name"/);assert.match(html,/type="file" accept="image\/jpeg,image\/png,image\/webp"/);
});
