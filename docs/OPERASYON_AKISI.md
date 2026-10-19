# İş ve operasyon takibi

## Önce kapsamı seçin

Uygulama **Özet / Genel bakış** ile açılır. Burada erişiminiz olan projelerin açık, geciken ve bugün teslim edilecek işleri; proje ilerlemeleri ve sorumluya göre iş paylaşımı görünür. Son açılan projeye otomatik yönlendirme yapılmaz.

Üst menü her bölümde aynı yerdedir:

- **Özet:** İlgilenilecek işleri ve proje durumunu bir arada görün. İşin kutusundan tamamlayın; başlığından ayrıntısını açın. Sayılara veya sorumluya tıklayarak ilgili işleri panoda görün.
- **Pano:** Ekibin bütün işlerini Yapılacak, Devam ediyor, Beklemede ve Tamamlandı sütunlarında takip edin.
- **İşlerim:** Size atanan işleri görün.
- **Projeler:** Bir projeyi seçin, yeni proje açın veya hazır şemalardan başlayın.
- **Ekip:** Ekip üyeleri ve yetkili hesaplarda davet işlemleri.

Toplantılar, haftalık rapor ve kullanım rehberi **Diğer** menüsündedir. Profil, arama ve bildirimler sağ üsttedir. Ana beş bölüm telefonda da doğrudan görünür.

## Genel panoda çalışma

İşe tıklayarak ayrıntılarını açın; kart üzerindeki durum alanıyla ilerletin. Düzenlenebilir görev kartları sütunlar arasında da sürüklenebilir. Klavye ve telefon için durum alanı aynı işlemi sağlar. Karttaki proje adı doğrudan o projenin çalışma alanına götürür.

Arama, proje, sorumlu ve Gecikenler filtreleri yalnız görünümü daraltır. **Temizle** bütün işleri geri getirir. Proje filtresi kullanmak proje çalışma alanını açmaz; kapsam hâlâ Genel pano olarak görünür. **Yeni iş** formunda hangi projeye ekleneceği açıkça seçilir.

Telefonda sütunlar yatay kaydırılır; üstlerindeki durum düğmeleri ilgili sütuna doğrudan götürür. Ana menü ekranın üstünde görünür; bölüm değiştirmek için menü açmak gerekmez.

## Projede günlük çalışma

1. Üst menüdeki **Projeler** sayfasından bir proje seçin. Doğrudan o projenin **Pano** görünümü açılır.
2. İşi durum alanıyla ilerletin; bitirdiğinizde kutusunu işaretleyin. Ayrıntıyı açmak zorunda değilsiniz.
3. Başlığa tıklayınca sorumlu, durum, tarih ve açıklama paneli açılır. Kayıt otomatiktir; proje adının yanındaki kayıt durumunu izleyin.
4. **Yeni iş** başlık, isteğe bağlı sorumlu ve tarihle yeni bir görev ekler. İş projenin ana yapısına eklenir; alt iş veya gruplama için Harita görünümü kullanılabilir.
5. Tarih sıralı kontrol listesi için **İş planı** sekmesine geçin. Diğer sekmeler aynı kayıtları gösterir.

Üst menüdeki **Pano** bütün ekip kapsamını açar. Proje adının altındaki **Pano** sekmesi yalnız seçili projeyi gösterir. Altı sekme aynı sırada ve aynı konumdadır.

## Projeye ait görünümler

Altı sekme yalnız bir proje seçildiğinde görünür; hiçbiri açılır menüye saklanmaz. Telefonda sekme çubuğu yatay kaydırılır. Sekmelerin sırası ve yüksekliği değişmez.

| Görünüm | Ne için? |
| --- | --- |
| İş planı | Tarih sıralı işler, sorumlular ve tamamlandı kutuları. |
| Pano | Yalnız bu projenin durum sütunları. |
| Zaman çizelgesi | İki haftalık son teslim günleri; tarihsiz işler ayrıca görünür. |
| Takvim | Ayı görmek, gün seçmek ve o güne iş eklemek. |
| Harita | Organizasyon, dairesel, piramit ve diğer şema yerleşimleri. |
| Tablo | Şemadaki bütün kartları satırlar halinde karşılaştırmak. |

Hazır şemalar **Projeler** sayfasındadır. Proje araçları **Seçenekler** altında sunum, geçmiş, yerleşim ve dışa aktarma sunar. Mevcut şablonlar, sunum ve şema yapıları korunur.

## Teknik sınırlar

Özet ve Genel pano aynı `/hub` erişim denetimli verisini kullanır. Özet için yeni istek veya zamanlayıcı yoktur. Geciken, bugün ve yedi gün hesapları İstanbul tarihini kullanır; tamamlanmış işler bu listelere girmez. Sorumlusuz filtresi yalnız açık işleri gösterir. Proje listesi son tarihi geçmiş iş sayısına, ardından açık iş sayısına göre sıralanır; ilk dört proje ve ilk dört dikkat işi gösterilir, tümüne bağlantı vardır. Proje görünümleri aynı belgeyi kullanır; yeni veri tabanı veya ek sorgulama döngüsü yoktur. Firebase Auth, Vercel API, Neon ve Blob görevleri değişmemiştir. Yetki, sürüm, bağımlılık ve çakışma denetimleri geçerlidir.

İş araması eşleşen işin üst başlıklarını korur. Filtreler proje ilerlemesinin paydasını değiştirmez. Görevlerin küçük kontrol adımları ikinci kez bağımsız iş sayılmaz. Saatli ardıl iş süresi (A bitince B iki saat içinde) bu sürümde yoktur.

Referansın alışılmış kullanımından yararlanılmıştır; kaynak kodu, hesapları ve veri tabanı taşınmamıştır. Mesai, dış görev ve alışveriş modülleri kapsam dışıdır. Dolu önizleme yerel kurmaca kayıtlarla çalışır; gerçek ekip kayıtlarını değiştirmez.

## Koyu arayüz ve hareket

Ekranlar kömür tonlarında yüzeyler kullanır; mavi devam eden işleri, mint tamamlananları, amber bekleyen/öncelikli işleri, pembe gecikmeleri belirtir. Renklerin yanında durum metni de bulunur. Arama, filtre, toplam ilerleme ve Yeni iş aynı araç alanındadır; tekrar eden büyük görünüm başlığı kaldırılmıştır.

Sayfa/panel geçişleri kısa ve kademelidir. İlerleme barları ilk gösterimde sıfırdan dolar; güncellemede önceki değerden ilerler. İkonlar üzerine gelince veya klavye odağında çizilir. Hareket azaltma ayarı açıkken bu animasyonlar çalışmaz. Telefonda sekmeler ve pano sütunları yatay kaydırılır; form yazıları 16 px ve ana dokunma hedefleri en az 44 px kalır.
