# İş ve operasyon takibi

## Önce kapsamı seçin

Uygulama **Genel pano** ile açılır. Burada erişiminiz olan bütün projelerin işleri ve bütün sorumlular görünür. Tamamlanan işler de kendi sütununda kalır. Son açılan projeye otomatik yönlendirme yapılmaz.

Üst menü her bölümde aynı yerdedir:

- **Genel pano:** Ekibin bütün işlerini Yapılacak, Devam ediyor, Beklemede ve Tamamlandı sütunlarında takip edin.
- **İşlerim:** Size atanan işleri görün.
- **Projeler:** Bir projeyi seçin, yeni proje açın veya hazır şemalardan başlayın.
- **Ekip:** Ekip üyeleri ve yetkili hesaplarda davet işlemleri.

Genel bakış, toplantılar, haftalık rapor ve kullanım rehberi **Diğer** menüsündedir. Profil, arama ve bildirimler sağ üsttedir. Ana dört bölüm telefonda da doğrudan görünür.

## Genel panoda çalışma

İşe tıklayarak ayrıntılarını açın; kart üzerindeki durum alanıyla ilerletin. Düzenlenebilir görev kartları sütunlar arasında da sürüklenebilir. Klavye ve telefon için durum alanı aynı işlemi sağlar. Karttaki proje adı doğrudan o projenin çalışma alanına götürür.

Arama, proje, sorumlu ve Gecikenler filtreleri yalnız görünümü daraltır. **Temizle** bütün işleri geri getirir. Proje filtresi kullanmak proje çalışma alanını açmaz; kapsam hâlâ Genel pano olarak görünür. **Yeni iş** formunda hangi projeye ekleneceği açıkça seçilir.

Telefonda sütunlar yatay kaydırılır; üstlerindeki durum düğmeleri ilgili sütuna doğrudan götürür. Ana menü ekranın üstünde görünür; bölüm değiştirmek için menü açmak gerekmez.

## Projede günlük çalışma

1. Üst menüdeki Projeler sayfasından bir proje seçin.
2. **İşler** görünümünde o projenin işleri başlıklar altında listelenir. Masaüstünde ilk açık atamanız (yoksa ilk açık iş) seçilir; telefonda önce liste görünür.
3. Bitirdiğiniz işin yanındaki kutuyu işaretleyin. Ayrıntıyı açmak zorunda değilsiniz.
4. Bir işe tıklayınca sorumlu, durum, son tarih ve kısa açıklama açılır. Değişiklikler otomatik kaydedilir; üstteki kayıt durumunu izleyin.
5. **Yeni iş** ile başlık, isteğe bağlı sorumlu/tarih ve bağlı başlık seçilir. Seçili işin altına yanlışlıkla yeni iş eklenmez; mevcut üst başlık varsayılan gelir.
6. **Alt işler** bölümünü gerektiğinde açın. Yeni alt işi veya gruplama için Başlık türünü ekleyebilirsiniz. Notlar, dosyalar ve diğer ayrıntılar ayrı bağlantıda kalır.

**Proje özeti** proje başlığını, toplu ilerlemeyi ve ana başlıkları açar. Telefonda **İşlere dön** düğmesi listeye döner. Ana menüdeki **Genel pano** her zaman bütün ekip kapsamına geri götürür.

## Projeye ait görünümler

Yedi sekme yalnız bir proje seçildiğinde görünür; hiçbiri açılır menüye saklanmaz. Telefonda sekme çubuğu yatay kaydırılır. Sekmelerin sırası ve yüksekliği değişmez.

| Görünüm | Ne için? |
| --- | --- |
| İşler | Başlıklar altında iş listesi, doğrudan tamamla kutusu ve seçilen işin ayrıntıları. |
| İş planı | Tarih sıralı işler, sorumlular ve tamamlandı kutuları. |
| Pano | Yalnız bu projenin durum sütunları. |
| Zaman çizelgesi | İki haftalık son teslim günleri; tarihsiz işler ayrıca görünür. |
| Takvim | Ayı görmek, gün seçmek ve o güne iş eklemek. |
| Harita | Organizasyon, dairesel, piramit ve diğer şema yerleşimleri. |
| Tablo | Şemadaki bütün kartları satırlar halinde karşılaştırmak. |

Hazır şemalar **Projeler** sayfasındadır. Proje araçları **Seçenekler** altında sunum, geçmiş, yerleşim ve dışa aktarma sunar. Mevcut şablonlar, sunum ve şema yapıları korunur.

## Teknik sınırlar

Genel pano mevcut `/hub` erişim denetimli verisini kullanır. Proje görünümleri aynı belgeyi kullanır; yeni veri tabanı veya ek sorgulama döngüsü yoktur. Firebase Auth, Vercel API, Neon ve Blob görevleri değişmemiştir. Yetki, sürüm, bağımlılık ve çakışma denetimleri geçerlidir.

İş araması eşleşen işin üst başlıklarını korur. Filtreler proje ilerlemesinin paydasını değiştirmez. Görevlerin küçük kontrol adımları ikinci kez bağımsız iş sayılmaz. Saatli ardıl iş süresi (A bitince B iki saat içinde) bu sürümde yoktur.

Referansın alışılmış kullanımından yararlanılmıştır; kaynak kodu, hesapları ve veri tabanı taşınmamıştır. Mesai, dış görev ve alışveriş modülleri kapsam dışıdır. Dolu önizleme yerel kurmaca kayıtlarla çalışır; gerçek ekip kayıtlarını değiştirmez.
