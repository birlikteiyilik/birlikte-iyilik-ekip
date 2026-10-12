# Doğrulama — 12 Ekim 2026

Bu dosya son mimarinin kanıtını ve kalan adımları ayırır. Mimari: **Firebase Auth + Vercel API + Neon PostgreSQL + Private Blob**. Ayrıntılar [MIMARI.md](MIMARI.md).

## 12 Ekim arayüz ve kullanıcı akışı kontrolü

Bu sürüm günlük iş akışını sadeleştirir ve eski pembe editör stilini kaldırır. Kimlik ve erişim yetkileri korunur. Yeni şablonlar mevcut çalışma API’sini kullanır; model altı yerleşimi doğrular. Son yayın kanıtı aşağıdaki **Son canlı sürüm** bölümünde kaydedilir.

Yerel tarayıcı kontrolü, üretim web kaynaklarının `work/` altında yalnız kurmaca veri ve sahte API adaptörüyle oluşturulan önizlemesinde yapıldı; gerçek ekip kayıtlarının bu kontrolle değiştiği iddia edilmez.

- Ana ekranda tek **Yeni görev** eylemi, üç iş özeti ve **Sıradaki işler** listesi; dört ana menü düğmesi ve açılır **Ekip ve düzen** bölümü görüldü.
- Başlık/proje/sorumlu/tarih formundan bir yerel test görevi oluşturuldu; listede belirdi. Ayrıntı penceresinde durumu değiştirildi, kaydedildi ve tekrar açıldığında yeni durum görüldü.
- Yeni kapalı **Açıklama ve küçük adımlar** bölümüne dokunmadan durum güncellendi. Yeniden açılan görevde açıklama aynen korunuyordu; kapalı alanlar sıfırlanmadı.
- Şema ilk açılışta **%100** ve **238 piksel** genişliğinde kartlarla geldi. Zemin ve canvas rengi DOM/computed style üzerinde **rgb(243,246,248)** olarak görüldü. Panel açınca yakınlaştırma %100 kaldı; ek seçenekler kapalı, temel alanlar görünürdü.
- **390×844** mobil görünüm: belge genişliği 390 piksel, dış yatay taşma yok; Yeni görev düğmesi genişliği 347 piksel, görev penceresi 356 piksel. Tab ile başlıktan proje seçimine geçildi. Kapalı yan menü `inert`; açınca ilk menü düğmesi odağa geldi, Escape ile kapandı ve odak menüyü aç düğmesine döndü. Viewport sonra sıfırlandı.
- Chrome hata/uyarı günlüğü örnek görev güncellemesi sonrasında boştu. Motion kodunda kesilme/temizleme, `prefers-reduced-motion` ve gizli sekme davranışı denetlendi. Sayısal 60fps/performans veya gerçek kullanıcı kullanılabilirlik araştırması yapıldığı iddia edilmez.
- Dairesel ve matris şablonları yerel UI’dan yeni çalışmaya dönüştürüldü; kart başlığı/durumu düzenlendi ve yeniden yüklemede korunuyordu. Matrisin dört çapraz bağı, sütunlar/satırlar, görünüm araçları ve seçilen küçük kartın %100 okunabilir odağı görüldü. Yaratılan test kayıtları kurmaca yerel adaptördedir; üretime eklenmedi.
- Proje ilerlemesi yerel görev tamamlama ile **1/6 → 2/6**, **%17 → %33** oldu; sorumlu hesabının tamamlanan sayısı **1/2** olarak İş paylaşımı içinde görüldü. Aynı adlı ayrı UID’ler model testinde ayrı kaldı. Boş yapılar Henüz iş yok gösterdi. Manrope fontu computed style ve ekran üzerinde görüldü; sayfa hata günlüğü boştu.
- Yerel yeni galeri **390×844** boyutta ayrıca kontrol edildi: belge genişliği **390**, pencere **355.92**, tek sütun **299** piksel; 8 yapı kartı ve 3 iş planına geçiş görüldü. Geçici viewport sıfırlandı. Üretim mobil test yapılmış sayılmaz.
- Tarayıcı Geri açık, değişmemiş görev penceresini kapattı ve aynı proje URL’sinde kaldı; sonraki Geri proje listesine döndü. Kaydedilmemiş taslak koruması kaynakta korunur; bu turda iptal/çakışma senaryolarının tamamı yeniden denenmedi.
- Yeni npm bağımlılığı veya ücretli servis eklenmedi. Yerel **102 model + 12 HTTP/API testi** ve üretim build’i geçti. 11 şablon; yeni yerleşimlerde çakışmasızlık, asimetrik dairesel dallar, 2.000 kart, kapalı dal/tam çıktı, manuel kaydırma, kayıt sonrası biçim/ilişki korunması ve yetkisiz kullanıcı reddi kontrol edildi.

## Otomatik sunum kontrolü

- Kurmaca yerel projede altı slaytın tamamı UI’dan açıldı: kapak, yapı, ilerleme, kişi dağılımı, sıradaki işler ve dikkat sayıları. Masaüstünde 1095×616 piksel slaytta ölçülen içerik genişliği/yüksekliği aynı kaldı; taşma görülmedi. İlerleme **2/6, %33** olarak yerel kaynak kaydıyla uyumluydu.
- İş sahiplerini gizle, altı slaydı beşe indirdi; kişi slaytı kalktı ve sıradaki işler üzerindeki isimler boşaldı. Kapatınca odak **Sunumu hazırla** düğmesine döndü, slayt içeriği DOM’dan temizlendi.
- Otomatik tarayıcı oturumunda native fullscreen isteği kabul edilmedi; pencereyi kaplayan sunum ve geri bildirim yolu kontrol edildi. Gerçek klavye tuşları ve bütün tarayıcıların fullscreen davranışı test edilmiş sayılmaz; klavye olay yalıtımı ve azaltılmış hareket kaynakta denetlendi.
- Sunum modeli için altı test geçti: doğru iş/kişi toplamları, tarih sıralaması, en fazla altı slayt, kaynak değişmezliği, özel alan/UID dışlama, isim gizleme, boş/tamamlanan projeler ve bağımsız kontrol listesi sayımı.

## Otomatik kontroller

Node.js **22.23.3**, pnpm **11.25.0**:

- `pnpm test`: **102 geçti, 0 hata**. Hiyerarşi, sınırları aşan belgenin kesilmeden reddi, alan bazında eşzamanlı değişiklik/geri alma, Türkiye tarihi, rapor, ay sonu tekrar, bağımlılık, takvim kaçışları, gzip açma sınırı, gerçek dosya baytlarıyla ZIP, RS256 imzalı bakım/Firebase kimliği doğrulama ve yanlış imza/proje/süre/kullanıcı red testleri. Örnek seti testleri, örnek belgelerin geçerliliğini, görev/durum/tarih dağılımını, toplantı ve bağımlılık referanslarını ve temsili kişilerin giriş hesaplarından ayrılmasını kapsar.
- `pnpm test:api`: **12 geçti, 0 hata**. Gerçek Auth emülatörü, PGlite PostgreSQL motoru ve yerel HTTP API kullanıldı. Kimlik/doğrulanmış e-posta/roller; farklı alanların korunması; bağımlılık döngüsü/tamamlama; eski ayar ve toplantı çakışması; yorum/mention tekilleştirme ve gizlilik; davet; tekrar; sıkıştırılmış sürüm geri yükleme; dosya bütçesi/tür/boyut; özel indirme; yönetici gzip/ZIP; günlük iş tekilleştirme ve geçmiş sınırı; üyelik kaldırma/pasifleştirme.
- `pnpm build`: başarılı. Üretim Firebase istemcisi emülatör bağlantısı açmaz; web paketi **244,43 kB**, gzip **72,42 kB**.

Blob bu API testlerinde bellek adaptörüdür; gerçek Vercel OIDC/presigned callback'i ve Neon ağ bağlantısı bu testlerden geçmiş sayılmaz. PGlite havuzu SQL bağlantılarını sıraya koyar; üretim transaction yarışlarının yük testi değildir. Önceki **14 Firebase entegrasyon testi** eski yerel mimari için geçmişti; son PostgreSQL üretim kanıtı olarak sayılmaz.

## Son canlı sürüm ve kanıt — 12 Ekim 2026

Kaynak **`a88b904448d20b2b49d9190a9faa2172f6e33f1d`**, GitHub author ve committer **augrclk**. [CI 38231291895](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38231291895) başarılı: **102 model + 12 HTTP/API testi**, **0 hata**, üretim build’i başarılı. [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/6jtdxkGrFbHfDynVXYLMu9UNDu8r) **READY / Production**, ID `dpl_6jtdxkGrFbHfDynVXYLMu9UNDu8r`, `https://birlikte-iyilik-ekip-b2fti0eeg.vercel.app`, alias **https://ekip.birlikteiyilik.com**. CLI oturumu `birlikteiyilikakademi-8992`, takım `birlikteiyilikakademi-8992s-projects`. Sonraki yalnız dokümantasyon commitleri bu test edilmiş/yayımlanmış kod sürümünü değiştirmez.

Canlı Chrome kontrolünde kurum yöneticisi hesabı açıldı. Mevcut **5 proje**, kullanıcı çalışması **Mihenl** ve dört örnek duruyordu. Mihenk örnek şeması **s7** olarak kaldı; yeni üretim test projesi, görev veya hesap oluşturulmadı. Proje kartları **%17**, **1/6**, açık/devam eden sayıları ve sorumlu isimlerini gösterdi. Hazır şemalar galerisinde sekiz yönetim yapısı görüldü. Şema kartı **%100**, **238 px**, tuval `rgb(243,246,248)`, ayrıntı paneli `rgb(255,255,255)` olarak ölçüldü; kart araçları tuvalin dışında ve sorumlu alanı dikeydi.

Gerçek Mihenk proje kaydından **Sunumu hazırla** açıldı. İlerleme slaytı **%17**, **1/6 tamamlandı**, **5 açık**, **2 devam eden** gösterdi. Bunlar görev ekranıyla uyumluydu. Üretim tarayıcı hata günlüğü boştu. Sunum üretimi yalnız mevcut yetkili belge okumasını kullanır; paylaşılan kayıtlar değişmedi. Yerel örneğin %33 değeri üretim sonucu olarak kullanılmadı.

Yerel çıktı ekranları: `ekip-proje-ilerleme-2026-10-12.png`, `ekip-hazir-semalar-2026-10-12.png`, güncellenmiş `ekip-notr-sema-2026-10-12.png`, `ekip-otomatik-sunum-2026-10-12.png`. Ekranlar kullanıcıya verilen `outputs/` altındadır; GitHub’da takım kayıtlarının ekran görüntüsü paylaşılmadı. Yeni sunum mobilde ayrıca **390 px** genişlikte kontrol edildi; belge 390 ve slayt/içerik 366 piksel, yatay taşma yoktu. Geri sunumu kapattı ve aynı proje URL’sinde bıraktı; viewport sıfırlandı.

**Kalan yayın kısıtı:** Son kaynak commitinin Vercel Git durumu `failure`: Git yazarı augrclk’ın Vercel projesine erişmesi isteniyor. Şirket hesabından açıkça yetkilendirilmiş CLI yayını READY olsa da Git’ten otomatik yayın çözülmüş sayılmaz. Firebase giriş, Neon/Blob ücretli plan veya yeni secret/yetki bu turda değiştirilmedi. Günlük yedek/depolama canlı testleri aşağıdaki önceki kanıt tarihine aittir; tekrar yapılmış sayılmaz.

## Kurulan dış kaynaklar

- Şirketin `birlikteiyilikakademi-8992s-projects` Vercel takımında ayrı `birlikte-iyilik-ekip` projesi, ekip GitHub deposuna doğal Git bağlantısıyla oluşturuldu.
- `ekip.birlikteiyilik.com` şirket projesinde **Valid Configuration / Production**. HTTPS giriş sayfası açıldı. Alan Firebase Auth authorized domains listesinde.
- Firebase `birlikte-iyilik-ekip`: Spark; Google/e-posta girişleri açık. Ortak kayıtları Firestore'a taşımak, Blaze ve Google IAM kurulumu yapılmadı.
- Neon **Free**, `birlikte-iyilik-ekip-db`, Frankfurt: oluşturuldu, yalnız ekip projesi **Production** ortamına bağlandı; Neon Auth açılmadı. Veritabanı gizli bağlantısı sağlayıcı tarafından ortam değişkenlerine eklendi.
- Blob `ekip-ozel-dosyalar`: **Private**, Frankfurt `fra1`, yalnız ekip projesi **Production** bağlantısı. OIDC/store ID bağlantısı var; uzun ömürlü Blob tokenı depoya yazılmadı.
- Ana web sitesi kaynak deposuna ekip kodu eklenmedi.

## 10 Ekim önceki tema sürümü ve kanıt

Kaynak kodu: **`bfad6f3095eecef352baa1bc351668d6002c526a`**. GitHub API üzerinde commit yazarı ve committer **`augrclk`** olarak doğrulandı. [GitHub test/build işi](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38064874441) başarılı: 86 model testi, 11 API testi ve üretim derlemesi. [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/HKF5NmpkQY2AvJUpgB98jhuGpjH5) **Ready / Production**, ID `dpl_HKF5NmpkQY2AvJUpgB98jhuGpjH5`, adres **https://ekip.birlikteiyilik.com**. Yayın şirketin `birlikteiyilikakademi-8992` CLI oturumuyla yapıldı; `sourceCommit` metadata'sı bu kaynak sürümünü gösterir. Sonraki yalnız dokümantasyon commitleri bu kod sürümünün canlı kanıtını değiştirmez.

Yeni tema ve dolu çalışma alanı canlı kontrolü:

- Petrol tonlu menü, açık yüzeyler, sakin vurgu renkleri ve durum etiketleri canlıda görüldü. Durumlar metinle de belirtilir: gri planlandı, mavi devam ediyor, amber beklemede, yeşil tamamlandı, kırmızı gecikme/hata.
- Kullanım rehberindeki **Örnek içerikleri ekle** işlemi kurucu yönetici hesabıyla tamamlandı. Standart API üzerinden **1 organizasyon, 3 proje, 8 temsili kişi kartı, 19 görev, 3 toplantı, 4 yorum ve 1 görev bağımlılığı** kaydedildi. Kişi kartları Firebase hesabı veya erişim yetkisi oluşturmaz; 6 görev gerçek yöneticiye atanır.
- Sayfa yenilendikten sonra örnek kayıtlar korunuyordu. Örneklerle birlikte önceden bulunan çalışma da projeler listesinde duruyor; mevcut kullanıcı kaydı veya proje içeriği değiştirilmedi.
- Projeler görünümünde dört örnek çalışma ve ilerleme oranları; Ekibimiz görünümünde sekiz **Örnek kişi**; takvimde üç toplantı; organizasyon haritasında 13 kart ve üç ana birim doğrulandı. Mihenk örneğinin panosunda Tümü filtresiyle altı görev dört durum sütununda görüldü: 1 yapılacak, 2 devam eden, 2 bekleyen, 1 tamamlanan.
- Rehberde **Örnek setini kontrol et** tekrar çalıştırıldı; örnek çalışma sayısı dört, mevcut çalışma dahil toplam aktif proje sayısı beş kaldı. Kayıtlar çoğaltılmadı.
- Örnek seti ayrı bir geçici demo değildir: gerçek çalışma alanında düzenlenebilir kayıtlardır. Rehberden geri açılabilir biçimde arşivlenebilir. Örnek setinin kaynak üreticisi depodadır; canlı veritabanı dökümü GitHub'a eklenmedi.
- Yerel üretim derlemesinin kontrollü örnek verisiyle **390×844** mobil görünümü kontrol edildi: belge genişliği 390 piksel, dış yatay taşma yok. Bu mobil kontrol canlı üretim ağı üzerindeki bir test değildir; viewport değişikliği ardından sıfırlandı.

## Önceki çekirdek sürümün canlı depolama kanıtı

Kaynak kodu: **`92cef7b8df2fc5cf12854c1e43fceceb64709452`**, commit/push hesabı `augrclk`. [GitHub test/build işi](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38060988788) başarılı. [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/5deFwEiv4ekqdtM2q7hQdkHY3daV) **Ready / Production**, ID `dpl_5deFwEiv4ekqdtM2q7hQdkHY3daV`. Aşağıdaki dosya/yedek/geri yükleme kontrolleri bu sürümde yapılmıştır; yeni tema sürümünde tekrar yapılmış sayılmaz.

Canlı kontroller:

- Kimliksiz `/api/workspace` ve `/api/maintenance`: **401**, `private, no-store`.
- Kurucu hesabıyla Google/Firebase girişi, kurum yöneticisi profili ve Neon kaydı.
- Ayrı örnek projede görev oluşturma; sayfa yenileme sonrası aynı proje/görev.
- Gerçek Private Blob/presigned yükleme ve yetkili dosya indirme. `canli-dogrulama.txt` **115 bayt**, yüklenen/indirilen SHA-256 aynı: `3fa803675bcb76a184222edc09d0d6a18fa0d487eb6f8f35bcb78a239c0ecb98`.
- Yönetici kayıt yedeği **1.193 bayt gzip**: açıldı, `format=birlikte-iyilik-backup`, `version=1`, tek çalışma içeriyor.
- Tam ZIP **5.877 bayt**: arşiv bütünlüğü kontrol edildi; `workspace.json` ve tek dosyanın gerçek baytları, yüklenen dosyayla birebir aynı.
- Sürüm 2'nin gerekçeyle geri yüklenmesi yeni **s3** kaydı oluşturdu; yenilemeden sonra görüldü. Mevcut içerikle denenmiştir; bütün sistemin felaket kurtarma/import provası değildir.
- Örnek çalışma, test sonunda geri açılabilir **salt okunur arşive** alındı. Test dosyası özel alanda ve çalışma üyeliği kapsamında kaldı.

[Gerçek GitHub OIDC günlük bakım işi](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38060751412) `8becd35318e123a04dab4ccfdb3d0e087a0620af` kodunda **`ok=true, skipped=false, day=2026-10-10`** ile geçti; SQL ve özel Blob yedek yolu kullanıldı. İlk günlük yedek, örnek proje açılmadan önceki boş ekip durumudur. Günün işi tekrar çalışınca tamamlanan gün atlanır; güncel çalışma yedeği ayrıca indirilerek doğrulandı. Kalıcı `CRON_SECRET` yok; güvenilir bakım işi her çalıştırmada kısa ömürlü kimlik alır. İlk zamanlanmış günlük çalışma, dönemsel takip ve iki gerçek davetli hesapla eşzamanlı kullanım ayrıca izlenmelidir.

Yayın kısıtı: [doğal Git yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/9aHeeDRFGSTwfdmWFm7PntBmRUDX) Hobby/özel depo commit yazarı kuralıyla engellendi; panel Redeploy da Pro gerektirdi. Bu nedenle kaynak şirket sahibinin CLI oturumuyla yayınlandı. Ücretli plana geçilmedi; **GitHub push'unun otomatik Production yayını şu anda kurulu/doğrulanmış değildir**. Günlük bakım otomasyonu ayrı ve çalışır durumdadır. Manuel yayın akışı [mimari rehberinde](MIMARI.md#yayın-ve-günlük-bakım).

Canlı testte giderilen hatalar: Firebase Admin SDK'nın `jwks-rsa` → `jose` ESM yüklemesi üretimden ayrıştırıldı; JOSE/Google public anahtarlarıyla imza/claim denetimi eklendi. Blob presigned istemcisinin reddettiği `addRandomSuffix` yalnız sunucu ayarlarında bırakıldı. Önceki başarısız API/bakım denemeleri son başarı kanıtı olarak kullanılmaz.

## Canlı doğrulama durumu

- [x] Şirket hesabı, alt alan ve giriş sayfası.
- [x] Ayrı ücretsiz PostgreSQL ve özel Blob kaynakları/Production kapsamı.
- [x] Son API kodunun yerel PostgreSQL/Auth testleri ve üretim build'i.
- [x] Son mimari commitinin `augrclk` ile gönderilmesi ve GitHub test/build başarısı.
- [x] Kısa ömürlü bakım kimliği değişikliğinin gönderilmesi ve şirket CLI API dağıtımının Ready doğrulaması.
- [x] Gerçek kurucu Google girişi, proje/görev kaydı ve yenileme sonrası kalıcılık.
- [x] Özel dosya yükleme/indirme ve kayıt/tam ZIP yedek indirmesi.
- [x] Gerekçeli sürüm geri yükleme ve test çalışmasını arşivleme.
- [x] Gerçek GitHub OIDC bakım işi ve günlük özel Blob yedeği.
- [x] Yeni tema ve rehberin şirket Production yayını; örnek kayıtların canlıya eklenmesi ve yenileme sonrası kalıcılığı.
- [ ] İki gerçek hesapla canlı yetki ve eşzamanlı kayıt testi.

İki hesapla canlı eşzamanlı/rol testi ve ilk zamanlanmış günlük çalışma henüz doğrulanmış sayılmaz. Otomatik API testleri bu alanlardaki yerel kuralları kapsar; bütün canlı senaryoların tamamlandığı iddia edilmez. Gerçek ekip verisi ve gizli anahtarlar bu belgeye eklenmez.

## Daha önceki tarayıcı kontrolleri

Eski yerel emülatörde giriş, görev, yeniden açılan toplantı tutanağı, bağımlılık/tekrar, TXT yükleme ve dosya baytları, 390×844 mobil menü/rapor ve yatay taşma kontrol edildi. Bunlar arayüz davranışının geçmiş kanıtıdır; yeni üretim depolama yolunun canlı kontrolleri yukarıda ayrıca kaydedilmiştir.


## 12 Ekim şablon ve ilerleme yayını

Kaynak `3047acb6619e9fcbd07025d28e850dc13758d4aa`, GitHub author/committer **augrclk**. [CI 38227636694](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38227636694) başarılı: **96 model**, **12 API**, build. Şirket CLI, `birlikteiyilikakademi-8992` hesabı ve `birlikteiyilikakademi-8992s-projects` takımıyla yayımlandı; `dpl_FuPsWkgkvfy8kFdEX5NNd2wdnc7p`, **READY**, Production. `https://birlikte-iyilik-ekip-7bdpejgzf.vercel.app`, alias `https://ekip.birlikteiyilik.com`. Bu ara sürüm sunum özelliğini içermez; sonraki sunum sürümünün kaydı ayrıca eklenir.


## 12 Ekim şema kartlarının iş ilerlemesi

- `branchProgress` için üç yeni model testi eklendi: kapalı dallar ve çapraz ilişkiyle proje sayımına uyum; 1/9 iş dağılımında doğru ağırlık, durum değişimi/taşıma/silme sonrası hesap; boş yapıda gerçek sıfır iş ve altı yerleşimde 168 px kart yüksekliği/çakışmama. Yerel model testleri **105/105** başarılı, hata yok.
- Yalnız kurmaca yerel önizlemede bir görev UI’dan tamamlandı: kök **2/6, %33 → 3/6, %50**, Hazırlık **0/3, %0 → 1/3, %33**; diğer birim **2/3, %67** kaldı. Üretim kayıtlarında görev durumu değiştirilmedi.
- Masaüstünde dolu şema kartı ölçüsü **168 px**, iç içerik yüksekliği **166 px** oldu; uzun iki satır başlıklar ve ilerleme bölümü kartın içine sığdı. Aynı birim ayrıntı paneli ve tablo **2/3, %67** gösterdi. Tamamlanan kartta **1/1, %100** ve yeşil çubuk göründü. Manuel ilerleme değeri otomatik sayımı etkilemedi.
- SVG görsel çıktısı aynı türetilmiş oranı kullanır; kaynak kod güncellendi. Görsel dışa aktarma ayrıca gerçek UI’dan kontrol edildiğinde sonucu aşağıdaki son yayın kanıtına eklenir.
