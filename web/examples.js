/* Synthetic, editable examples. People are presentation cards, never login accounts. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core'), require('./hub-model'));
  else root.DalExamples = factory(root.DalCore, root.DalHubModel);
})(typeof globalThis !== 'undefined' ? globalThis : this, (C, M) => {
  'use strict';
  const PREFIX = 'Örnek · ';
  const PEOPLE = [
    ['Elif Kaya', 'Genel koordinasyon', '#2f796c'],
    ['Deniz Arslan', 'Program ve eğitim', '#427fa0'],
    ['Selin Aktaş', 'İletişim ve paydaşlar', '#8372a6'],
    ['Mert Aydın', 'Tasarım ve içerik', '#8372a6'],
    ['Ece Demir', 'Saha operasyonu', '#b28642'],
    ['Can Yılmaz', 'Gönüllü koordinasyonu', '#427fa0'],
    ['Zeynep Şahin', 'Atölye yürütücüsü', '#427fa0'],
    ['Bora Güneş', 'Kaynak ve lojistik', '#b28642']
  ];
  const isExample = b => !!b?.sample && String(b.name).startsWith(PREFIX);
  function plans(user, day = M.today()) {
    if (!user?.id || !user?.name || !C.validDate(day)) throw new Error('Örnekler için geçerli yönetici ve tarih gerekli.');
    const date = offset => M.plus(day, offset), stamp = day + 'T09:00:00+03:00';
    const result = [];
    function board(name, description, color) {
      const doc = C.newDocument('blank');
      doc.name = PREFIX + name; doc.sample = true;
      doc.createdAt = doc.updatedAt = stamp;
      const root = C.rootNode(doc);
      Object.assign(root, {title:name, kind:'Proje', description:'ÖRNEK ÇALIŞMA. ' + description,
        role:'Düzenlenebilir örnek; gerçek personel veya kurum ataması değildir.', color, tags:['Örnek','ekip-örnek-set-v1']});
      const plan = {doc, comments:[], events:[], metadata:[]};
      result.push(plan); return plan;
    }
    function card(p, parent, title, kind, owner, role, color) {
      const id = C.addNode(p.doc, parent, {title, kind, owner, role, color, tags:['Örnek','ekip-örnek-set-v1']});
      return p.doc.nodes.find(n => n.id === id);
    }
    function task(p, parent, title, person, offset, status='Planlandı', mine=false, priority='Normal', steps=[]) {
      const node = card(p, parent, title, 'Görev', mine ? user.name : person, '', p.doc.nodes.find(n=>n.id===parent).color);
      Object.assign(node, {ownerUserId:mine?user.id:'', dueDate:date(offset), status, priority,
        progress:status==='Tamamlandı'?100:status==='Devam ediyor'?45:0,
        description:'Örnek görev: ' + title + '. Beklenen sonucu, sorumluyu ve son tarihi bu pencereden düzenleyebilirsiniz.',
        tasks:steps.map((text,i)=>({id:C.uid('t'),text,done:status==='Tamamlandı'||i===0,assignee:'',assigneeId:'',dueDate:''}))});
      return node;
    }
    function meeting(p, title, offset, agenda, minutes, decisions) {
      p.events.push({id:'example-meeting', title, start:date(offset)+'T14:00:00+03:00', end:date(offset)+'T14:45:00+03:00',
        location:'Örnek · çevrim içi ekip buluşması', attendees:[user.id], agenda, minutes, decisions});
    }
    const org = board('Birlikte İyilik organizasyonu', 'Eğitim, gönüllüler, iletişim ve operasyonun nasıl birlikte çalıştığını inceleyin.', '#2f796c');
    const orgRoot = C.rootNode(org.doc); orgRoot.kind='Birim'; orgRoot.owner='Elif Kaya';
    const divisions = [
      ['Program ve gönüllüler','Öğrenme, buluşmalar ve gönüllü gelişimi','#427fa0',[1,5,6]],
      ['İletişim ve içerik','Duyurular, tasarım ve paydaş ilişkileri','#8372a6',[2,3]],
      ['Saha ve operasyon','İhtiyaçlar, kaynaklar ve teslim planı','#b28642',[4,7]]
    ];
    card(org,orgRoot.id,'Elif Kaya','Kişi','Elif Kaya','Genel koordinasyon · örnek kişi','#2f796c');
    for (const [title,role,color,indices] of divisions) {
      const unit = card(org,orgRoot.id,title,'Birim',PEOPLE[indices[0]][0],role,color);
      for (const i of indices) card(org,unit.id,PEOPLE[i][0],'Kişi',PEOPLE[i][0],PEOPLE[i][1]+' · örnek kişi',color);
    }
    const review = task(org,orgRoot.id,'Haftalık ekip önceliklerini netleştir','',0,'Devam ediyor',true,'Yüksek',['Proje sorumlularından gündemi al','Ortak öncelikleri yaz','Son tarihleri kontrol et']);
    org.comments.push({nodeId:review.id,body:'Örnek not: önce bu haftanın iki önceliğini belirleyelim; ardından sorumluları ve tarihleri birlikte gözden geçirelim.'});

    const mihenk=board('Mihenk · Gönüllü buluşması','Yeni gönüllülerin tanışma buluşmasını planlayın; görevlerin hazırlıktan kapanışa ilerleyişini görün.','#427fa0');
    const mr=C.rootNode(mihenk.doc), prep=card(mihenk,mr.id,'Hazırlık','Birim','Deniz Arslan','Program ve katılımcı hazırlığı','#427fa0'), comm=card(mihenk,mr.id,'Duyuru ve kayıt','Birim','Selin Aktaş','İletişim ve kayıt takibi','#8372a6');
    task(mihenk,prep.id,'Buluşma akışını hazırla','Deniz Arslan',0,'Devam ediyor',true,'Yüksek',['Tanışma bölümünü planla','Kısa atölyeyi ekle','Kapanış sorularını hazırla']);
    const venue=task(mihenk,prep.id,'Mekân ve teknik ihtiyaçları teyit et','Ece Demir',-1,'Beklemede',false,'Yüksek',['Salon saatini teyit et','Ses ve sunum düzenini kontrol et']);
    task(mihenk,prep.id,'Gönüllü karşılama ekibini belirle','Can Yılmaz',2,'Planlandı');
    task(mihenk,comm.id,'Duyuru tasarımını tamamla','Mert Aydın',-2,'Tamamlandı',false,'Normal',['Görseli hazırla','Son metni kontrol et']);
    task(mihenk,comm.id,'Kayıt listesini kontrol et','',-1,'Devam ediyor',true);
    const publish=task(mihenk,comm.id,'Buluşma duyurusunu paylaş','Selin Aktaş',1,'Beklemede');
    mihenk.metadata.push({nodeId:publish.id,dependencies:[venue.id],recurrence:null});
    mihenk.comments.push({nodeId:venue.id,body:'Örnek not: mekân teyidi bekleniyor. Duyuru görevi bu iş tamamlanınca ilerleyebilir.'});
    meeting(mihenk,'Örnek · Mihenk hazırlık toplantısı',1,'Buluşma akışı, mekân teyidi ve kayıt durumu. Temsili ekip: Deniz, Selin ve Ece.','Örnek tutanak: akış 45 dakika olarak planlandı; teknik ihtiyaçların teyit edilmesi kararlaştırıldı.',[{text:'Mekân teyidini duyurudan önce tamamla',nodeId:venue.id}]);

    const workshop=board('İyilik atölyeleri','Atölye içeriği, malzemeler ve değerlendirme için küçük bir eğitim projesi.','#8372a6');
    const wr=C.rootNode(workshop.doc), content=card(workshop,wr.id,'İçerik ve kolaylaştırma','Birim','Zeynep Şahin','Atölye hazırlığı','#8372a6'), logistics=card(workshop,wr.id,'Malzeme ve uygulama','Birim','Bora Güneş','Uygulama hazırlığı','#b28642');
    task(workshop,content.id,'Atölye hedeflerini belirle','Deniz Arslan',-3,'Tamamlandı');
    const sheet=task(workshop,content.id,'Etkinlik çalışma kâğıtlarını hazırla','Zeynep Şahin',1,'Devam ediyor',false,'Normal',['İlk taslağı yaz','Süreleri kontrol et','Kolaylaştırıcı notunu ekle']);
    task(workshop,content.id,'İçerik taslağını gözden geçir','',2,'Planlandı',true);
    task(workshop,logistics.id,'Malzeme listesini tamamla','Bora Güneş',0,'Devam ediyor');
    task(workshop,logistics.id,'Gönüllü görev paylaşımını yap','Can Yılmaz',3,'Planlandı');
    task(workshop,logistics.id,'Geri bildirim formunu hazırla','Mert Aydın',4,'Planlandı');
    workshop.comments.push({nodeId:sheet.id,body:'Örnek not: çalışma kâğıtlarını kısa tutalım; uygulama ve değerlendirme için ayrı alan bırakalım.'});
    meeting(workshop,'Örnek · Atölye içerik değerlendirmesi',2,'Çalışma kâğıtları, malzeme ihtiyacı ve gönüllü iş bölümü.','Örnek tutanak: içerik taslağı uygulama öncesinde birlikte kontrol edilecek.',[{text:'İçerik taslağını gözden geçir',nodeId:sheet.id}]);

    const support=board('Dayanışma · Destek paketleri','İhtiyaç listesinden paket hazırlığına ve teslim planına uzanan örnek saha çalışması.','#b28642');
    const sr=C.rootNode(support.doc), resources=card(support,sr.id,'Kaynak ve hazırlık','Birim','Bora Güneş','Liste ve paket hazırlığı','#b28642'), field=card(support,sr.id,'Saha ve takip','Birim','Ece Demir','Teslim ve kapanış','#2f796c');
    task(support,resources.id,'İhtiyaç listesini netleştir','Ece Demir',-2,'Tamamlandı');
    task(support,resources.id,'Paket içeriklerini kontrol et','Bora Güneş',0,'Devam ediyor',false,'Yüksek',['Eksik ürünleri yaz','Kontrol listesini güncelle','Paketleri etiketle']);
    task(support,resources.id,'Eksik kaynakları planla','',1,'Planlandı',true);
    const delivery=task(support,field.id,'Teslim rotasını oluştur','Ece Demir',2,'Planlandı');
    task(support,field.id,'Saha gönüllülerini bilgilendir','Can Yılmaz',3,'Beklemede');
    task(support,field.id,'Çalışma kapanış notunu yaz','',5,'Planlandı',true,'Düşük');
    support.comments.push({nodeId:delivery.id,body:'Örnek not: teslim planını bölgelere göre sıralayalım. Bu örnekte gerçek kişi, adres veya ihtiyaç sahibi bilgisi bulunmuyor.'});
    meeting(support,'Örnek · Saha koordinasyonu',3,'Paket durumu, teslim rotası ve gönüllü bilgilendirmesi.','',[{text:'Teslim rotasını gönüllülerle paylaş',nodeId:delivery.id}]);
    for (const p of result) p.doc=C.validateStrict(p.doc);
    return result;
  }
  function people(data) {
    const names=new Map();
    for (const n of data.units||[]) {
      if(n.kind!=='Kişi'||!isExample(data.boards?.find(b=>b.id===n.boardId)))continue;
      const name=n.owner||n.nodeTitle;
      if(!names.has(name))names.set(name,{id:'example-person:'+n.nodeId,name,title:n.role?.replace(' · örnek kişi',''),example:true});
    }
    return [...names.values()];
  }
  return {PREFIX,PEOPLE,isExample,plans,people};
});
