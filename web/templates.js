/* Ready structures contain roles and starter tasks, never people or access grants. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./core'));
  else root.DalTemplates=factory(root.DalCore);
})(typeof globalThis!=='undefined'?globalThis:this,C=>{
  'use strict';
  const catalog=[
    {id:'circle',group:'structures',layout:'radial',title:'Dairesel ekip',icon:'sun',color:'#2f796c',description:'Ortak amaç merkezde; ekipler ve roller çevresindeki halkalarda.',sections:['Program','İletişim','Operasyon','Gönüllü'],label:'Merkez + 2 halka · 13 kart'},
    {id:'pyramid',group:'structures',layout:'pyramid',title:'Piramit',icon:'hierarchy',color:'#427fa0',description:'Koordinasyon, alanlar, ekipler ve roller; seviyeleri birlikte gör.',sections:['Programlar','Destek'],label:'4 kademe · 15 kart'},
    {id:'matrix',group:'structures',layout:'matrix',title:'Matris',icon:'table',color:'#8372a6',description:'Birimler sütunlarda, proje rolleri satırlarda. Çapraz koordinasyon bağları hazır.',sections:['Program','Dijital','Operasyon'],label:'3 birim × 2 proje · 4 çapraz bağ'},
    {id:'flat',group:'structures',layout:'pyramid',title:'Yatay ekip',icon:'team',color:'#b28642',description:'Küçük ekipte roller aynı seviyede; arada ek yönetim kademesi yok.',sections:['Kolaylaştırma','Program','İletişim','Operasyon','Gönüllü'],label:'Tek ekip · 5 eş düzey rol'},
    {id:'macro',group:'structures',layout:'org',title:'Makro · birimler',icon:'hierarchy',color:'#427fa0',description:'Kurumun genel yapısı: ana alanlar ve ekipler. Günlük görev ayrıntıları olmadan.',sections:['Programlar','Topluluk','Destek'],label:'3 alan · 6 ekip'},
    {id:'micro',group:'structures',layout:'tree',title:'Mikro · görev paylaşımı',icon:'tasks',color:'#2f796c',description:'Bir çalışma ekibi, üç sorumlu rol ve her rolün başlangıç görevleri.',sections:['Program sorumlusu','İletişim sorumlusu','Operasyon sorumlusu'],label:'3 rol · 6 görev'},
    {id:'mind',group:'structures',layout:'mind',title:'Zihin haritası',icon:'map',color:'#8372a6',description:'Bir fikirden iki yöne açıl. İhtiyaçları, çözüm yollarını ve çıktıları toparla.',sections:['İhtiyaçlar','Çözümler','Çıktılar'],label:'3 konu · 6 alt başlık'},
    {id:'team',group:'structures',layout:'org',title:'Klasik hiyerarşi',icon:'team',color:'#2f796c',description:'Birimleri ve rolleri üst–alt ilişkileriyle netleştir.',sections:['Program','İletişim','Operasyon'],label:'3 birim · 6 rol'},
    {id:'plan',group:'work',layout:'org',title:'Proje planı',icon:'tasks',color:'#427fa0',description:'Hazırlıktan uygulamaya, sonuçtan kapanışa ilerle.',sections:['Hazırlık','Uygulama','Kapanış'],label:'3 aşama · 6 başlangıç görevi'},
    {id:'event',group:'work',layout:'org',title:'Etkinlik',icon:'calendar',color:'#8372a6',description:'Programı, duyuruyu ve saha hazırlığını birlikte planla.',sections:['Program','Duyuru','Operasyon'],label:'3 alan · 6 başlangıç görevi'},
    {id:'volunteer',group:'work',layout:'org',title:'Gönüllü ekibi',icon:'team',color:'#b28642',description:'Katılımı, görev paylaşımını ve ekip takibini düzenle.',sections:['Katılım','Görev paylaşımı','Takip'],label:'3 aşama · 6 başlangıç görevi'}
  ];
  const tasks={
    plan:[['Hedefi netleştir','İlk görevleri paylaş'],['Uygulamayı başlat','İlerlemeyi kontrol et'],['Sonuçları değerlendir','Kapanış notunu hazırla']],
    event:[['Etkinlik akışını hazırla','Kolaylaştırıcıları belirle'],['Duyuru metnini hazırla','Kayıt yöntemini belirle'],['Mekân ve ihtiyaçları kontrol et','Etkinlik sonrası notları toparla']],
    volunteer:[['Katılım bilgilerini topla','Tanışma buluşmasını planla'],['İlgi alanlarını belirle','Görevleri sorumlularıyla eşleştir'],['İlk hafta geri bildirimini al','Sonraki adımları paylaş']]
  };
  function create(id,name){
    const template=catalog.find(t=>t.id===id);
    if(!template)throw new Error('Şablon bulunamadı.');
    if(typeof name!=='string'||!name.trim()||name.trim().length>250)throw new Error('Geçerli bir proje adı yazın.');
    const doc=C.newDocument('blank');doc.name=name.trim();doc.sample=false;
    doc.settings.layout=template.layout;
    const root=C.rootNode(doc);Object.assign(root,{title:doc.name,kind:['team','circle','pyramid','flat','macro','matrix'].includes(id)?'Birim':'Proje',color:template.color,description:template.description,role:'Düzenlenebilir başlangıç yapısı'});
    const add=(parent,title,kind,color,extra={})=>C.addNode(doc,parent,{title,kind,color,status:'Planlandı',...extra});
    if(id==='pyramid'){
      template.sections.forEach((title,i)=>{const color=C.COLORS[i],area=add(root.id,title,'Birim',color);
        const names=i===0?['Eğitim ekibi','Etkinlik ekibi']:['İletişim ekibi','Operasyon ekibi'];
        for(const title of names){const team=add(area,title,'Birim',color);add(team,'Ekip sorumlusu','Kişi',color);add(team,'Ekip üyesi','Kişi',color);}
      });
    }else if(id==='flat'){
      template.sections.forEach((title,i)=>add(root.id,title,'Kişi',C.COLORS[i%C.COLORS.length],{role:'Aynı ekipte eş düzey sorumluluk'}));
    }else if(id==='matrix'){
      root.notes='Sütunlar fonksiyon ekiplerini, kart satırları projelerdeki rolleri gösterir. Düz çizgi birim bağını, kesikli çizgi proje koordinasyonunu belirtir. İlişki çizgileri hesap erişimi veya yetki vermez.';
      const rows=[[],[]],roles=[['Mihenk · kolaylaştırıcı','Atölye · eğitmen'],['Mihenk · duyuru','Atölye · içerik'],['Mihenk · saha','Atölye · hazırlık']];
      template.sections.forEach((title,i)=>{const color=C.COLORS[i],unit=add(root.id,title,'Birim',color);roles[i].forEach((title,j)=>rows[j].push(add(unit,title,'Kişi',color,{role:'Birim ve proje ile birlikte çalışır'})));});
      rows.forEach(row=>row.slice(1).forEach(to=>doc.relations.push({id:C.uid('r'),from:row[0],to,label:'Proje koordinasyonu'})));
    }else{
      const macro=[['Eğitim ekibi','Etkinlik ekibi'],['Gönüllü ekibi','Paydaş ilişkileri'],['Dijital ekip','Operasyon ekibi']];
      const micro=[['Program akışını hazırla','Programı ekip ile gözden geçir'],['Duyuru metnini hazırla','Katılım bilgisini paylaş'],['İhtiyaç listesini hazırla','Hazırlığı kontrol et']];
      const mind=[['Kimin için?','Hangi ihtiyaç?'],['Neler yapabiliriz?','Hangi kaynaklar var?'],['Beklenen etki','Nasıl takip edeceğiz?']];
      template.sections.forEach((title,i)=>{
        const color=C.COLORS[i%C.COLORS.length],unit=add(root.id,title,id==='micro'?'Kişi':id==='mind'?'Başlık':'Birim',color);
        const names=id==='macro'?macro[i]:id==='micro'?micro[i]:id==='mind'?mind[i]:['team','circle'].includes(id)?[title+' sorumlusu',title+' ekibi']:tasks[id][i];
        const kind=id==='macro'?'Birim':id==='mind'?'Başlık':['team','circle'].includes(id)?'Kişi':'Görev';
        for(const title of names)add(unit,title,kind,color,{description:kind==='Görev'?'Beklenen sonucu, sorumluyu ve son tarihi belirleyin.':kind==='Kişi'?'Bu bir rol kartıdır. Gerçek sorumluyu seçebilirsiniz.':''});
      });
    }
    return C.validateStrict(doc);
  }
  // The gallery depicts the same layout that the editor opens, rather than an
  // unrelated illustration. No third-party assets or template data are loaded.
  function preview(id){
    const doc=create(id,'Başlangıç'),L=C.layout(doc),b=L.bounds,pad=35;
    const guides=L.guides.map(g=>`<circle cx="${g.x}" cy="${g.y}" r="${g.radius}" fill="none" stroke="#bdcfd8" stroke-width="5" stroke-dasharray="16 16"/>`).join('');
    const edges=L.edges.map(e=>`<path d="${C.edgePath(e,L.positions)}"/>`).join('');
    const relations=doc.relations.map(r=>`<path d="${C.relationGeometry(r,L.positions).path}" stroke-dasharray="14 10"/>`).join('');
    const cards=[...L.positions].map(([id,p])=>{const n=doc.nodes.find(n=>n.id===id);return `<g><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="18" fill="white" stroke="${n.color}" stroke-width="4"/><rect x="${p.x+15}" y="${p.y+19}" width="${p.w-30}" height="18" rx="7" fill="${n.color}" opacity=".7"/><rect x="${p.x+15}" y="${p.y+55}" width="${p.w*.65}" height="9" rx="4" fill="#cbd9e2"/><rect x="${p.x+15}" y="${p.y+77}" width="${p.w*.44}" height="9" rx="4" fill="#dce5e9"/></g>`;}).join('');
    return `<svg viewBox="${b.x-pad} ${b.y-pad} ${b.w+pad*2} ${b.h+pad*2}" aria-hidden="true" focusable="false">${guides}<g fill="none" stroke="#94adb9" stroke-width="5">${edges}</g><g fill="none" stroke="#8372a6" stroke-width="5">${relations}</g>${cards}</svg>`;
  }
  return {catalog,create,preview};
});
