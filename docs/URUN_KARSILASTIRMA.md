# Ürün karşılaştırması ve arayüz kararları — 12 Ekim 2026

Bu inceleme resmi ürün belgeleri ve yayınlanmış ürün ekranları üzerinden yapıldı. Rakiplerin oturum açılmış uygulamalarında hesap açma veya gerçek ekip verisiyle deneme yapılmadı. Appllama MCP bu oturumda bağlı değildi; kullanıcının verdiği AppLlama tasarım rehberinin bilgi hiyerarşisi, tek ana eylem, tutarlı etiket, isteğe bağlı ayrıntı ve geri dönüş ilkeleri mevcut web sitesine uyarlandı. Native uygulama/simülatör performansı iddia edilmez.

| Kaynak | Öğrendiğimiz desen | Ekip sitesindeki karar |
|---|---|---|
| [Asana başlangıç akışı](https://help.asana.com/s/article/quick-start-guide-to-asana) | Kişisel işler ve bildirimler günlük işin başlangıcı; başlık, sorumlu ve tarih görev için temel bilgiler. | Bugün ekranı kişisel sıradaki işleri gösterir. Tek Yeni görev eylemi, üç özet. Ayrıntılar görev açılınca gelir. |
| [Trello şablon galerisi](https://support.atlassian.com/trello/docs/community-template-gallery/) ve [proje akışı](https://trello.com/guide/create-project) | Kullanım amacını ve önizlemeyi gör, şablonu seç, yeni çalışmaya ad ver. Kartın ayrıntısı açılınca gösterilir. | Yapı ve iş planlarını ayıran önizlemeli galeri; mevcut çalışma korunarak ayrı proje oluşturulur. Liste/pano sade tutulur. |
| [Linear proje şablonları](https://linear.app/docs/project-templates) ve [kişisel işler](https://linear.app/docs/my-issues) | Tekrarlanan proje için önceden tanımlı işler; odaklı kişisel görünüm. | Proje planı, etkinlik ve gönüllü şablonları altı başlangıç görevi üretir. Kullanıcı sorumlu ve tarihleri belirler. |
| [Basecamp özellikleri](https://basecamp.com/features) | Aşamalı panolar, proje içindeki dosyalar, yinelenen ekip durum soruları ve bütün projeleri birleştiren görünümler. | Var olan pano, yorum, dosya ve toplantılar korunur. Haftalık durum paylaşımı ve toplu dosya kütüphanesi sonraki önerilerdir. |

[Miro dairesel şeması](https://miro.com/templates/circular-org-chart/), [Miro matris şeması](https://miro.com/templates/matrix-org-chart/) ve [Lucid organizasyon şablonları](https://lucid.co/diagram/org-chart/templates) ayrıca incelendi. Dairesel yapı merkez ve halkaları, piramit seviyeleri, matris ise fonksiyon ve proje arasındaki çapraz bağları görünür kılar. Bizde bunlar statik resim değildir: `core.js` kartları yerleştirir; galeri aynı hesapla önizleme üretir. Sekiz yapı: dairesel, piramit, matris, yatay ekip, makro birimler, mikro görev paylaşımı, zihin haritası ve klasik hiyerarşi. Üç iş planı: proje, etkinlik ve gönüllü ekibi. Makro/mikro adları bu ürünün ayrıntı düzeyidir; bir yönetim yönteminin etkinliği veya zorunlu geometrisi hakkında iddia değildir.

Tasarımda referansların renkleri veya ekranları kopyalanmadı. Nötr gri/beyaz yüzey, petrol menü ve yeşil işlem vurgusu korunur. Durum renkleri metni destekler; proje renkleri alanları ayırır. Şema, gündelik iş listesinin yanında isteğe bağlı bir görünüm olarak kalır. Şema araçları kartların üzerini kapatmaz. Görev formu ve filtreler aşamalı açılır. Tarayıcı Geri, kaydı geri almaz; gezinmeyi geri götürür. Açık görev penceresini önce kapatır; kaydedilmemiş taslak korunur.

## Mevcut güçlü taraflar

Ortak görev kaydı, kişisel işler, liste/pano, sorumlu ve son tarih, kontrol listesi, yorum ve mention, özel dosya yükleme/indirme, bağımlılık, tekrar, toplantı/tutanak/karar, haftalık rapor, rol/üyelik denetimi ve yedek/sürüm geri yükleme kaynakta zaten vardır. Bildirimler uygulama içindedir. Ayrıntılı canlı test sınırları [DOĞRULAMA.md](../DOĞRULAMA.md) içindedir.

## Eksikler ve öncelik önerisi

Bunlar ürün değerlendirmemizdir; her rakibin bütün planlarını kapsayan bir özellik/fiyat karşılaştırması değildir.

1. **Ekip kendi şablonunu kaydedebilmeli:** Bu sürümde 11 hazır şablon var. Kullanıcının kendi şemasını kütüphaneye kaydetmesi henüz yok; kurum verilerini, kişi UID'lerini ve dosyaları taşımayan ayrı kopya akışı gerekir.
2. **Proje ara hedefleri ve kısa durum özeti:** Birim/aşama ve görev ilerlemesi var. Ayrı tarihli kilometre taşı ve düzenli proje durum metni yok. Az sayıda ara hedef, proje açıldığında yol göstermeli.
3. **Haftalık kısa ekip durum paylaşımı:** Haftalık rapor mevcut veriyi derler; ekipten otomatik soru/cevap toplamaz. Toplantı sayısını azaltacak isteğe bağlı üç soru değerlendirilebilir.
4. **Yetkili toplu dosya görünümü:** Dosyalar göreve bağlıdır. Arama ve proje filtresiyle dosyaları tek yerde bulmak yararlı olur; mevcut üyelik ve özel Blob denetimini korumalıdır.
5. **Kaydedilmiş kişisel filtreler:** Filtreler ve favoriler var; isimlendirilmiş görünüm kaydı yok. Yalnız görünüm tercihleri saklanmalı, gerçek görev içeriği tarayıcı depolamasına yazılmamalıdır.
6. **E-posta/push ve çift yönlü takvim:** Mevcut kapsamda yoktur. İhtiyaç ve kullanım ölçülmeden yeni servis veya kopya iş yükü eklenmemelidir.

Proje yüzdesi yapılan iş/toplam iş üzerinden hesaplanır; elle girilen kart ilerlemesinden türetilmez. Büyük yüzde, oran, açık/devam eden işler ve sorumlu isimleri görünürdür. İsteğe bağlı İş paylaşımı kişi başına yapılan ve açık iş sayısını gösterir. Boş yapılar henüz iş yok olarak gösterilir. Manrope değişken fontu resmi kaynaktan lisansıyla birlikte yerel sunulur; Türkçe karakter ve sabit genişlikli sayı tercihleri kullanılır. İlerleme çubuğu 620 ms içinde dolar; hareket azaltma tercihinde sabit gerçek değer doğrudan gösterilir.

Bu turdaki seçim, keşfedilebilirlik ve başlangıç maliyetini düşürmektir: sade ana ekran, önizlemeli hazır şemalar, doğru geri dönüş, daha okunabilir nötr editör ve işlevine uygun kısa ikon hareketleri. Yeni bir abonelik, dış servis veya yetki eklenmez.
