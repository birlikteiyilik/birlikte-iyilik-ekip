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
- Dairesel ve matris şablonları yerel UI’dan yeni çalışmaya dönüştürüldü; kart başlığı/durumu düzenlendi ve yeniden yüklemede korunuyordu. Matrisin dört çapraz bağı, sütunlar/satırlar, görünüm araçları ve seçilen küçük kartın %100 okunabilir odağı görüldü. Oluşturulan test kayıtları kurmaca yerel adaptördedir; üretime eklenmedi.
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

- `pnpm test`: **113 geçti, 0 hata**. Hiyerarşi, sınırları aşan belgenin kesilmeden reddi, alan bazında eşzamanlı değişiklik/geri alma, Türkiye tarihi, rapor, ay sonu tekrar, bağımlılık, takvim kaçışları, gzip açma sınırı, gerçek dosya baytlarıyla ZIP, RS256 imzalı bakım/Firebase kimliği doğrulama ve yanlış imza/proje/süre/kullanıcı red testleri. Örnek seti testleri, örnek belgelerin geçerliliğini, görev/durum/tarih dağılımını, toplantı ve bağımlılık referanslarını ve temsili kişilerin giriş hesaplarından ayrılmasını kapsar.
- `pnpm test:api`: **12 geçti, 0 hata**. Gerçek Auth emülatörü, PGlite PostgreSQL motoru ve yerel HTTP API kullanıldı. Kimlik/doğrulanmış e-posta/roller; farklı alanların korunması; bağımlılık döngüsü/tamamlama; eski ayar ve toplantı çakışması; yorum/mention tekilleştirme ve gizlilik; davet; tekrar; sıkıştırılmış sürüm geri yükleme; dosya bütçesi/tür/boyut; özel indirme; yönetici gzip/ZIP; günlük iş tekilleştirme ve geçmiş sınırı; üyelik kaldırma/pasifleştirme.
- `pnpm build`: başarılı. Üretim Firebase istemcisi emülatör bağlantısı açmaz; web paketi **244,43 kB**, gzip **72,42 kB**.

Blob bu API testlerinde bellek adaptörüdür; gerçek Vercel OIDC/presigned callback'i ve Neon ağ bağlantısı bu testlerden geçmiş sayılmaz. PGlite havuzu SQL bağlantılarını sıraya koyar; üretim transaction yarışlarının yük testi değildir. Önceki **14 Firebase entegrasyon testi** eski yerel mimari için geçmişti; son PostgreSQL üretim kanıtı olarak sayılmaz.

## Son canlı sürüm ve kanıt — 12 Ekim 2026

Kaynak **`fce3e515d6a139cd6ea742a5ced8527eeb47c69a`**, GitHub author ve committer **augrclk**. [CI 38243291593](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38243291593) başarılı: **107 model + 12 HTTP/API testi**, **0 hata**, üretim build’i başarılı. [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/M3Gn73rpSZWuSHYaA6r2pk5AgDm8) **READY / Production**, ID `dpl_M3Gn73rpSZWuSHYaA6r2pk5AgDm8`, `https://birlikte-iyilik-ekip-2qcuey7sf.vercel.app`, alias **https://ekip.birlikteiyilik.com**. Vercel metadata’sı **source=git**, githubCommitSha tam bu SHA, githubCommitAuthorLogin=augrclk, ownerId=`team_0xhbl5nKwdqDc7EeaJBnQK8V`, projectId=`prj_UYc23eeMDrVhlPLZ0gSAbKRB2Ywx` gösterdi. GitHub Vercel commit kontrolü **Deployment has completed / success** oldu. Bu yayın manuel CLI deploy değildir; `main` push’u yerleşik bağlantıyla yayımlandı. Sonraki yalnız dokümantasyon commitleri bu test edilmiş kodu değiştirmez.

Canlı Chrome kontrolünde kurum yöneticisi hesabı açıldı. Mevcut **5 proje**, kullanıcı çalışması **Mihenl** ve dört örnek duruyordu. Mihenk örnek şeması **s7** olarak kaldı; yeni üretim test projesi, görev veya hesap oluşturulmadı. Proje kartları **%17**, **1/6**, açık/devam eden sayıları ve sorumlu isimlerini gösterdi. Hazır şemalar galerisinde sekiz yönetim yapısı görüldü. Şema kartı **%100**, **238 px**, tuval `rgb(243,246,248)`, ayrıntı paneli `rgb(255,255,255)` olarak ölçüldü; kart araçları tuvalin dışında ve sorumlu alanı dikeydi.

Gerçek Mihenk proje kaydından **Sunumu hazırla** açıldı. İlerleme slaytı **%17**, **1/6 tamamlandı**, **5 açık**, **2 devam eden** gösterdi. Bunlar görev ekranıyla uyumluydu. Üretim tarayıcı hata günlüğü boştu. Sunum üretimi yalnız mevcut yetkili belge okumasını kullanır; paylaşılan kayıtlar değişmedi. Yerel örneğin %33 değeri üretim sonucu olarak kullanılmadı.

Yerel çıktı ekranları: `ekip-proje-ilerleme-2026-10-12.png`, `ekip-hazir-semalar-2026-10-12.png`, güncellenmiş `ekip-notr-sema-2026-10-12.png`, `ekip-otomatik-sunum-2026-10-12.png`. Ekranlar kullanıcıya verilen `outputs/` altındadır; GitHub’da takım kayıtlarının ekran görüntüsü paylaşılmadı. Yeni sunum mobilde ayrıca **390 px** genişlikte kontrol edildi; belge 390 ve slayt/içerik 366 piksel, yatay taşma yoktu. Geri sunumu kapattı ve aynı proje URL’sinde bıraktı; viewport sıfırlandı.

**Yayın durumu:** Önceki özel depo/commit yazarı engeli, deponun sahibi tarafından public yapılmasıyla çözüldü. Üstteki Git kaynağı ve READY kanıtı geçerlidir. Firebase giriş, Neon/Blob ücretli plan veya yeni secret/yetki bu turda değiştirilmedi. Günlük yedek/depolama canlı testleri aşağıdaki önceki kanıt tarihine aittir; tekrar yapılmış sayılmaz.

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
- Yerel UI’da SVG dışa aktarma düğmesi kullanıldı. Yeni oluşan SVG XML olarak açıldı; %50 / 3/6 kök, %33 / 1/3 Hazırlık, %67 / 2/3 Duyuru ve tamamlanan görevlerde %100 / 1/1 etiketleri doğrulandı. Dosyanın kart yüksekliği 168 px ve yüzdeyle orantılı 5 px çubukları vardı. Tarayıcı otomasyonunun indirme olayı zaman aşımına uğradı; gerçek dosyanın oluşma zamanı ve içeriği ayrıca doğrulandı. SVG dosyası için ayrı piksel render doğrulaması yapılmadı.


Son kaynak yayını sonrası üretim kontrolü: gerçek Mihenk örneğinin kaydı **s7** olarak kaldı. Kök kart **%17, 1/6**, Hazırlık **%0, 0/3**, Duyuru ve kayıt **%33, 1/3**, tamamlanan görev **%100, 1/1** gösterdi. Kartın computed yüksekliği **168 px**, tamamlanma noktasının rengi **rgb(47, 121, 108)** oldu. Proje ekranı ve yeniden oluşturulan sunum **%17, 1/6** ile aynı kaydı gösterdi; sunumda 5 açık ve 2 devam eden iş vardı. Canlı tarayıcı hata günlüğü boştu. Şema, dolu proje ve otomatik sunum ekran görüntüleri aynı `outputs/` dosyalarına güncellendi. Canlıda örnek görev tamamlanmadı, test projesi oluşturulmadı; yerel %50 değeri canlı önizleme olarak kullanılmadı.


## 12 Ekim ikon çizilmesi ve yüzde dolumu

- Eski parça taşıma/sallama hareketleri SVG çizgi çizilmesine çevrildi. Yerel arama kontrolü etkileşiminde lens ve sapın computed strokeDasharray değeri `1px, 1px`, ara offset değerleri **0.382371 / 0.553094 px**, transform **none** oldu; çizilme hareketi gerçek tarayıcıda görüldü.
- Projeler sayfasına dönüşte görsel yüzdeler **%1**, hedef/erişilebilirlik değeri **%17** olarak gözlendi; son durumda yüzde **%17** ve çubuk `matrix(0.17, 0, 0, 1, 0, 0)` oldu. Şema ilk girişinde kök görsel **%0**, gerçek hedef **%17**; boş olmayan birim hedefi **%33** oldu. Değerler ortak kayıt üzerinde yazılmaz.
- Şema kartları yeni metin/çubuk boyutuyla **168 px**, iç içerik **166 px**; taşma yok. 390 px mobil görünümde belge **390 px**, kartlar **347 px** ve tek sütun oldu. Kapalı menü `inert` ve `aria-expanded=false` idi; geçici viewport sıfırlandı. Hareket tercihi ve sekme gizleme kaynakta kesme/son değere dönme ile desteklenir; işletim sistemi tercihi bu kontrolde değiştirilmedi.
- Yerel model testleri **105/105**, hata yok; üretim build’i başarılı. Tarayıcı hata günlüğü boş. Ücretsiz CI işinin ilk kaydı **38237287272**: test işi geçti, yayın işi eksik şirket VERCEL_TOKEN önkoşulunda durdu. Otomatik yayın henüz READY olarak doğrulanmış değildir.


## 12 Ekim infografik sunum ve yerleşik Git yayını

- Sunum modeli altı yerleşimde gerçek kök/alan sayımı, en fazla beş kart, kaynak değişmezliği, özel UID/ilişki kimliği dışlama, gerçek çapraz bağ ve boş/isimleri gizlenmiş yapılar için iki yeni testle kontrol edildi. **107 model testi**, hata yok; üretim build’i geçti.
- Yerel 1470×780 tarayıcıda şema 1/6 %17, Hazırlık 0/3 %0, Duyuru 1/3 %33 gösterdi. Daire grafiğinde ara değer **%11 / dashoffset 89.2557**, son değer **%17 / 83**, erişilebilir gerçek değer her zaman %17 oldu. Slayt yüksekliği ve scroll yüksekliği 616 px; dış taşma yoktu. Kişi tablosundaki barlar doğru 0/1, 0/2 ve 1/1 değerlerini gösterdi.
- 390×844 mobil şema belge genişliği **390 px**, kök/alan genişlikleri **322/302 px** idi. Son bar ölçekleri **0.17/0/0.33**; dikey bağlı yapı ve alt gezinme okunurdu. Geçici viewport sıfırlandı. Yerel kurmaca kayıtlar canlı veritabanına aktarılmadı.
- Depo sahibi kullanıcının onayıyla görünürlüğü public yaptı. GitHub API `private=false, visibility=public` gösterdi. Tarihte 165 metin blobunda gizli dosya adı, özel anahtar, GitHub tokenı, yazılmış Blob anahtarı ve parola taşıyan PostgreSQL URL kalıpları için tarama bulgu üretmedi; bu tüm olası sırların kesinlikle dışlandığı iddiası değildir.
- VERCEL_TOKEN kurulmadı. Yerleşik Git bağlantısı korunarak gereksiz Actions yayın işi ve CLI scripti kaldırıldı. Gerçek push → READY doğrulaması üstteki son canlı sürüm kaydında tamamlandı.

Yerel haritada seçilen kişisel yerleşimin sunuma aktarılması ayrıca kontrol edildi: daireselde SVG ellipse rehberi ve ayrık kartlar; piramitte `M460 4 14 349H906Z` üçgen rehberi görüldü. Piramit slaytında scroll/client yüksekliği 601/601 px oldu. Sunum yalnız yetkili kayıt kopyasındaki görünüm tercihini kullanır; bu kontrol canlı çalışma kaydını değiştirmedi.


Canlı infografik kontrolü: Mihenk örnek kaydı **s7** kaldı. Şemalı slayt erişilebilir metni **kök 1/6 %17, Hazırlık 0/3 %0, Duyuru 1/3 %33**, son görsel yüzdeler **%17/%0/%33** oldu. İlerleme dairesi açılışta **%9 / dashoffset 91.2005** ile gerçek hedef **%17** arasında hareket ederken gözlendi. Canlı şema ve yeni infografik ön izleme ekran görüntüleri outputs’a kaydedildi. Üretim verisine görev, kişi veya proje yazılmadı.

Canlı ilerleme dairesi son durumda **%17 / dashoffset 83 / aria-valuenow 17** oldu. Arama kontrolünün çizilme etkileşiminde SVG parça offsetleri **0.436979 / 0.622119 px**, dasharray **1px, 1px**, transform **none** gözlendi. Arama mevcut Mihenl ve dört örneği gösterdi. Kimliksiz `/api/maintenance` GET **401** döndü; `/api/workspace` GET **405** ile POST taşıması istedi. Yetkili çalışma işlemlerinin taşıma yöntemi POST içindeki `{method,path}` zarfıdır.

Kimliksiz gerçek çalışma taşıması POST `{method:"GET",path:"/me"}` ile **401** döndü; kayıt okuması açılmadı. Canlı Projelerimiz görünümünde **5 aktif çalışma**, üç proje **%17 / 1/6**, organizasyon **%0 / 0/1** ve Mihenl **Henüz iş yok / 0/0** gösterdi. Yeni dolu proje ekran görüntüsü kaydedildi; güncel canlı Chrome hata/uyarı günlüğü boştu.


## 12 Ekim tarihli iş planı ve mobil kontrolü

- Mevcut üç sekme korunur: **İş planı / Harita / Tablo**. Projeyi açma doğrudan tarihli iş planına gider; yeniden genel başlıklar altında gruplama yapılmadı.
- Yerel kurmaca Mihenk kaydında kutu ile 1/6 → 2/6, tarih değişimi ile sıralama, tamamlananları gizleme, başlık/sorumlu/tarih formu ve yeniden yüklemede kayıt görüldü. Klavyedeki Space, odaktaki kutuyu işaretledi. Açılan küçük adımın kaydı sonrasında alan açık kaldı, odak yeni tamamlanmış kutuda ve toplam 3/7 kaldı; küçük adım ikinci iş sayılmadı.
- **360×800** yerel mobil formda yeni iş 17 Ekim tarihine ve seçilen sorumluya kaydedildi; liste **3/8 %38** oldu. Başlıktan açılan ayrıntı paneli **360 px** genişlikte, close düğmesi **44×44**, input fontları **16 px** idi. Bu sayılar kurmaca önizlemeye aittir, üretim değişikliği değildir.
- **390×844**: eski tek sırada şema araçlarının sağ kenarı 429 px ile görünümün dışına taşıyordu. İki sıra düzeltmesinden sonra toolbar client/scroll genişliği **390/390**, sağdaki araç kenarı **378 px** oldu. İş planı paneli client/scroll **375/375**; dış yatay taşma yoktu. Tablo fontu büyütüldü, sabit ilk sütun ve kaydırma ipucu görüldü.
- **768×1024**: projeye tıklamak İş planını açtı; belge **768/768**, liste paneli **548/548** client/scroll genişliği gösterdi. Dar içerikte yatay alanlar başlığın altına geçti; önceki kaydedilmiş yerel işler korundu.
- Mobil yan menü açıkken arka app `inert`; son hesap düğmesinden Tab ilk kapatma düğmesine döndü. Escape ile menü kapandı, `inert` kaldırıldı ve odak Ana menüyü aç düğmesine döndü.
- Yerel **113 model testi / 0 hata**, Node.js 22.23.3 ile geçti; üretim derlemesi başarılı. İş planının altı model/görünüm testi bu toplam içindedir. API/yayın ve canlı yalnız okuma kanıtı yayından sonra aşağıya eklenir.

Bu turda telefon genişliği tarayıcı viewport'u ile sınandı; fiziksel iOS/Android cihaz, ekran klavyesi, gerçek baskı ve ekran okuyucu oturumu test edilmedi. Yerel adaptör ve kurmaca veriler `work/` altında tutulur; üretim kaynaklarına eklenmez.


## Profil ve daraltılmış üst alan kontrolü

Yerel kurmaca hesapta 390×844 profilden bir PNG seçildi; çıktı doğal boyutu 512×512, encoded uzunluğu 8.795 karakter olan JPEG önizlemeydi. Ad/Soyad Deniz/Arslan yapıldı; kaydetme sonrasında menü adı değişti. Yeniden yükleyip açınca ad, soyad ve fotoğraf korundu. Dialog 356 px, belge 390 px ve alan fontu 16 px idi. Bu değişiklikler sahte yerel adaptördeydi; gerçek hesap adı veya fotoğrafı değiştirilmedi.

117 model/görünüm testi, 13 Auth/PostgreSQL HTTP/API testi ve üretim build'i geçti. Profil testinde özel Blob byte'ı bellek adaptöründe saklandı, PostgreSQL yalnız referans tuttu; başka kullanıcının yetkisini/kimliğini değiştirme reddedildi. Ortak üyeliği olmayan kullanıcı fotoğrafı okuyamadı; aktif fotoğraf temizlikten korundu, kaldırılan ve bekleme süresi geçirilmiş fotoğrafın byte'ları ve kota rezervasyonu temizlendi. Bu test gerçek Private Blob upload kanıtı değildir.

8b24cd6 augrclk commit/push'u GitHub CI 38250360072'de 113 model +12 API testiyle geçti. Native Vercel deployment `dpl_5ea6T5oaJbyW2r9nNaFDAEByFEt5`, build başlamadan `git_info_fail` / Git information retrieval failed sonucunu verdi; aynı Git kaynağının şirket oturumuyla yeniden denemesi `dpl_EHHHESwwiNE7h5V7FSJGW9ykNF4u` da aynı noktada kaldı. Bu başarısız denemeler READY kanıtı değildir. Aynı ekip deposu aynı şirket Vercel projesinden CLI ile disconnect/connect yapılarak yeniden bağlandı; CLI Connected sonucunu verdi. Yeni kaynak push'undan Production'a tam doğrulama yayından sonra eklenir.


## Son profil/iş planı yayını ve canlı yalnız okuma kontrolü

- GitHub kaynak `4d4c9b689cd2af56fd085aaba6ebef0309f2ca50`, author/committer **augrclk**. [CI 38255154928](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38255154928): **117 model/görünüm**, **13 Auth/PostgreSQL API**, sıfır hata ve build başarılı.
- Reconnect sonrasında oluşan yerleşik Git yayını `dpl_9vpLLPkro6TNQhSzdXLZGE2Yo8nc` yine **git_info_fail** ile build öncesinde durdu. Bağlı public depo ve augrclk kaynak SHA doğruydu. Üç Git kaynaklı başarısız deneme çözüm kanıtı değildir.
- Şirket CLI dosya yayını `dpl_HPBV3GgfVACA3FuCSULsRCNpCriQ`, **READY / Production**, **51 saniye** build, `https://ekip.birlikteiyilik.com` alias. Yerleşik Git otomasyonu bu yeni commit için hâlâ tamamlanmış sayılmaz.
- Canlı örnek Mihenk iş planı **1/6, %17** gösterdi; tamamlanan tasarım işi, sorumlu adları, 8–12 Ekim tarihleri ve otomatik kayıt durumu göründü. Proje, tarih, checkbox ve gerçek profil değerleri değiştirilmedi. Var olan YAZ OKULU dahil altı çalışma korunur.
- Canlı masaüstü **1470×780**: üç sekme **44 px** yüksek; şema bölgesi **top=176, height=561 px**. Önceki 204 px üst alanla karşılaştırıldığında yaklaşık **28 px** ek şema yüksekliği vardır. Haritada kök **1/6 %17**, Hazırlık **0/3 %0**, Duyuru **1/3 %33** kaldı.
- Canlı **390×844**: belge **390 px**, iş planı client/scroll **375/375 px**, üç sekme 44 px. Ana menünün hesap düğmesi Profilim formunu açtı ve menü kapandı; alan fontları **16 px**, fotoğraf seçimi **10 MB** sınırını gösterdi. Form kaydedilmedi; gerçek fotoğraf yüklemesi yapılmadı. Geçici viewport sıfırlandı.
- Bu canlı oturumun tarayıcı error/warn kaydı boştu. Masaüstü iş planı, dar üst şema ve mobil iş planı/profil görüntüleri yalnız yerel outputs altında tutulur; gerçek ekip ekran görüntüleri public depoya konmaz.

Saat ve tamamlanan işe göre süre başlatan bağlantılar bu sürümde uygulanmadı. Yönetici için sonuç kontrol listesi ve başkan için tamamlanan/kalan/sorumlu/geciken özeti yönünde ürün fikri olarak ele alındı; mevcut İş planı / Harita / Tablo düzeni değiştirilmedi.


## Git otomasyonunun yeniden çalışması ve sabit görünüm sekmeleri

Sonraki `950e7867b16384a07f99da73cc5ce7a8495c6a2a` augrclk push'u, şirket `dpl_FGcySXmWHL6jwiaY63t4hFTyz3fy` kaydında **source=git, READY, Production** oldu; aynı SHA ve **ekip.birlikteiyilik.com** alias API'den doğrulandı. Build 45 saniye sürdü. Önceki paragraftaki otomasyon hatası bu başarıdan önceki durumdur; nedenin kesin tanısı yapılmadı.

Kullanıcı İş planı → Harita/Tablo geçişinde düğmelerin kaydığını bildirdi. Nedeni planın 32 px, diğer görünümlerin 60 px başlık kullanması ve ağaç düğmesinin diğer görünümlerde sekmelerin önüne gelmesiydi. Ortak başlık 60 px oldu; ağaç düğmesi sekmelerin sağına taşındı, plan modunda görünmez ama yerini korur. İş planındaki tekrar eden büyük proje başlığı yalnız ekran okuyucuya açık tutulur; görünür isim ortak başlıkta kalır. Basılı liste başlığı korunur.

Yerel 1470×780 tarayıcıda üç görünümün her birinde İş planı x=254, Harita x=347.515625, Tablo x=435.421875 ve y=127.5 px; aynı genişlikler ve 44 px yükseklik görüldü. 390×844'te yine her üç görünümde x=12 / 120.6640625 / 229.3359375, y=128 px ve 44 px yükseklik vardı. Belge 390 px; 360×800 kontrolünde belge 360 px ve son sekmenin sağ kenarı 312 px idi. Bu düzeltme kayıt veya API yolunu değiştirmez. 117 yerel test ve build tekrar geçti; canlı yeni kaynak yayını ayrıca doğrulanır.

Sekme düzeltmesi `a194887fa8599dec8c04edc9754f9207a0713caf`, GitHub author/committer augrclk; CI 38258440857: **117 model + 13 API**, sıfır hata ve build başarılı. Native `dpl_6HpUAWwYuYgGTv88eVK5g7vPBkoC` ve Git kaynağını yeniden yayın `dpl_HmbR2Gjacz93kqGxzGL6Tb5KBVr3` yine git_info_fail ile durdu. 950e786 başarısı kalıcı düzelme kanıtı değildir. Sekme düzeltmesinin şirket dosya yayını ve canlı konum ölçümü tamamlanınca ayrıca kaydedilir.


Son sekme düzeltmesi şirket CLI dosya yayını **dpl_2H7YfhEJYAYtWt5dMDTanm1nXxS8**, **READY / Production**, 42 saniye build ve **ekip.birlikteiyilik.com** alias ile yayımlandı. Canlı 1470×780 üç görünümde sekmelerin x=254 / 347.515625 / 435.421875, y=127.5; canlı 390×844'te x=12 / 120.6640625 / 229.3359375, y=128 koordinatları ve 44 px yükseklikleri birebir aynı kaldı. Belge mobilde 390 px, yatay taşma yoktu. Plan **1/6, %17** kaldı; checkbox/tarih/profil kaydı değiştirilmedi. Yeni hata/uyarı günlüğü boştu; geçici viewport sıfırlandı. Canlı masaüstü ve mobil iş planı görüntüleri yerel outputs altında güncellendi. Son otomatik Git denemesi hatalı olduğundan bu dosya yayını otomasyon başarısı olarak sunulmaz.


## Davet iptali ve örnekleri temizleme

117 model/görünüm testi, **14 Auth/PostgreSQL HTTP/API testi** ve build başarılı. Yeni API testi yönetici dışındaki davet listeleme/iptal girişimlerini, kurucu korumasını, idempotent iptali, iptal sonrası ilk kayıt reddini ve bilinçli yeniden davetle kayıt kabulünü doğrular. Canlı yeni sürüm ve kullanıcı tarafından istenen örnek temizliği tamamlanınca ayrıca kaydedilir. Saatten türetilen bağlı iş süresi bu sürüme eklenmedi.


Davet yönetimi kaynak `7e3ef6a663da58ffe80ea51f9a90ca24a8e31b08`, GitHub author/committer augrclk; [CI 38263473299](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38263473299) **117 model + 14 API**, sıfır hata ve build başarılı. Şirket CLI yayını `dpl_HanXuHZD9j66sPtfDDJueHzNv9zc`, **READY / Production**, build 32 saniye ve **ekip.birlikteiyilik.com** alias ile doğrulandı. Uzayan başlatma aşamasında [Vercel resmî durum sayfası](https://www.vercel-status.com/) Build & Deploy / CI-CD / Git Integrations kesintisi bildiriyordu; eski Git hatalarının kesin kök nedeni ayrıca kanıtlanmış sayılmaz.

Kullanıcı isteğiyle dört doldurulmuş örnek çalışma normal arşiv akışından kaldırıldı; sekiz temsili kişi aktif ekip ekranından çıktı. Hazır şema galerisi 8 yönetim/ekip yapısı ve 3 iş planıyla kaldı. Kullanıcının kendi projeleri ve ana hesabın adı/fotoğrafı değişmedi. İlk eski test erişimi kapatıldıktan sonra kullanıcı yeni davet ve üyelik oluşturdu; kullanıcı bu yeni kayıtları korumamızı açıkça istedi. Son salt okunur şirket veritabanı sayımı **1 korunan aktif ana yönetici, 1 diğer aktif üye, 1 yeni bekleyen davet, 3 aktif proje, 0 aktif örnek proje** gösterdi. Yeni üyelik ve davet iptal edilmedi; hazırlanan SQL güncellemesi çalıştırılmadı. Kalıcı silme veya yeni Firebase hesabı silme işlemi yapılmadı. Başlatma aşamasında bekleyen yayın sonradan READY oldu.

Saatli ardıl görev süresi kullanıcıya henüz uygulanmamış tasarım fikri olarak açıklandı. Mevcut görev bağımlılığı ve tarih alanları, bir iş tamamlandıktan sonra iki saatlik süre başlatılması özelliğiyle aynı değildir.

## Projeye atanmamış davetli üyenin ekipte görünmesi

Kaynak `a09860f89b6fcb394f8e2cdc77292cfb4f7f720a`, author/committer **augrclk**. [CI 38271191663](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38271191663) **117 model + 16 Auth/PostgreSQL HTTP/API testi**, sıfır hata ve başarılı üretim build'i. Aynı yerel testler geçti. Yeni kabul edilen, çalışma atanmamış üyeye kurum ekibi gösterilir; proje/görev/toplantı/hareket verileri boş kalır ve mevcut projeye doğrudan GET 403 olur. Aktif üyeye admin ve diğer üyelerin ekip listesinde yer verilir. Bekleyen davet/pasif kullanıcı çıkarılır; proje üye önbelleği pasif kişiyi tekrar ekleyemez. E-posta/rol/Blob yolu çıkmaz, ortak proje dışındaki fotoğraf sürümü ve fotoğraf erişimi korunur.

Canlı salt okunur tanıda kabul edilmiş aktif hesabın hiçbir çalışma üyeliği olmadığı görüldü. Eski `/hub.people` ortak projelerden türediği için hesap görünmüyordu. Kullanıcı çalışma üyeliğini kendisi ekledikten sonra mevcut canlı sürümde üç gerçek ekip üyesi göründü; bu ekran yeni kodun canlı kanıtı olarak sayılmaz. Bu turda gerçek davet/üyelik/profil/proje kaydı değiştirilmedi; gerçek ekip ekranı public depoya yüklenmedi.

Yeni kodun şirket Vercel yayını **henüz READY doğrulanmadı**. API/şirket CLI bağlantısı 403 verdi. Yetkili şirket panelinde mevcut bağlı depodan `main` / `a09860f` için **Deploy to Production** başlatıldı; form Loading durumunda kaldı ve yeni bir deployment kimliği henüz görünmedi. Son gözlenen Production `dpl_BUphJ9TDeXTsYMJFULTVff9efDdx`, kaynak `9e4684a`, READY ve ekip alt alanıydı. [Vercel resmî durum sayfası](https://www.vercel-status.com/) 12 Ekim 2026 14:57 UTC güncellemesinde bazı build'lerin kuyrukta kaldığını ve daha geç başladığını bildiriyordu; bu bilgi mevcut 403 veya bu panel isteğinin kesin kök nedenini kanıtlamaz. Yeni token, ücretli plan veya daha geniş erişim oluşturulmadı. Yeni kod için otomatik push→READY başarısı iddia edilmez; yayın ve yeni ekranın canlı doğrulaması tamamlanınca ayrıca kaydedilmelidir.

## Sade operasyon arayüzü — 19 Ekim 2026

- Yerel **123 model/görünüm + 16 Auth/PostgreSQL API testi**, sıfır hata; üretim build'i geçti. Yerel runtime Node 24.19.0; üretim/CI Node 22. Yeni altı test ortak sayım, durum geçişleri, geçersiz girdilerin atomik reddi, ay/yıl/artık gün, tarihsiz işler ve salt okunur/HTML kaçışlarını kapsar.
- Canlıya bağlanmayan kurmaca önizlemede pano durum değişikliği, yenileme sonrası kalıcılık, plan/harita sayım eşitliği, sorumlu filtresi ve takvim gününden tarihli iş ekleme denendi. 2/6 olan ilerleme yeni açık iş eklenince 2/7 oldu; sorumlu filtresi toplamı değiştirmedi.
- 1470 px masaüstünde ilk üç sekmenin konumu x=254 / 347.515625 / 435.421875, y=129.5 px; 390 px mobilde x=12 / 135.328125 / 258.6640625, y=128 px. Plan, Harita ve Tablo geçişlerinde konumları aynı. Mobil belge 390 px; yatay belge taşması yok. Eski görünmez ağaç düğmesinin mobil üst alanda bıraktığı boşluk kaldırıldı.
- Ana menüde üç ana bölüm; Diğer grubunda ekip, toplantı, organizasyon ve rapor erişimi doğrulandı. İncelenen yerel tarayıcı oturumunda konsol hatası görülmedi.
- Gerçek üye, davet, profil, proje veya iş değiştirilmedi. Yeni arayüz için GitHub CI ve canlı yayın kanıtı henüz eklenmedi; yerel doğrulama üretim yayını sayılmaz.

### GitHub ve canlı yayın doğrulaması

Kaynak **93de206f7cd5e7ccd2c3adb16f46e8478d9da2a2**, author/committer **augrclk**. [CI 39272886951](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/39272886951) Node 22 üzerinde model, Auth/PostgreSQL API ve üretim build adımlarını başarıyla tamamladı.

Mevcut public GitHub → şirket Vercel bağlantısı otomatik çalıştı. [Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/8K1os5hNVjE5MYgTgqJcwj6aHCBa) GitHub durumunda **success / Deployment has completed**; GitHub deployment **7177086861**, **Production**, kaynak SHA aynı. Yeni yayın anahtarı veya ücretli servis eklenmedi.

`https://ekip.birlikteiyilik.com` üzerinde `index.html`, `app.js`, `hub.js`, `operations.js`, `operations-model.js` ve `operations.css` HTTP 200 döndü; altı dosyanın SHA-256 değeri yerel üretim çıktısıyla birebir eşleşti. Canlı giriş ekranı açıldı, konsol hata kaydı boştu. Bu tarayıcıda açık yetkili oturum bulunmadığından gerçek proje içinde yazma testi yapılmadı; kayıt akışı yerel kurmaca adaptör ve izole Auth/PostgreSQL testleriyle doğrulandı.

Yerel ek kontrollerde 360 px mobil pano, belgeyi yatay taşırmadan kendi içinde kaydı; 768 px tablet görünümü ve iş ayrıntısı açılması denendi. Son arayüzde genel bakış ve pano ekran görüntüleri yerel çıktılara kaydedildi. Geçici viewport sıfırlandı.

## Doğrudan çalışma alanı — 19 Ekim 2026

- Yerel 127 model/görünüm testi ve 16 Firebase Auth/PostgreSQL HTTP/API testi geçti. Üretim derlemesi geçti. Yerel Node 24.19.0, CI/üretim hedefi Node 22; CI sonucu ayrıca aşağıda kayıt altına alınır.
- Ağaç araması üst başlıkları korur; dal açma/kapama ortak belgeyi değiştirmez. Geçersiz sorumlu/tarih/başlık/alan atomik reddedilir. Salt okunur görünümde girişler kapalı, ekleme formu yok; kullanıcı metni HTML olarak kaçışlanır.
- Kurmaca yerel önizlemede alt iş eklendi, Selin Aktaş'a atandı, 22 Ekim tarihi seçildi ve tamamlandı. Proje 2/7 (%29), üst Hazırlık başlığı 1/4 (%25) oldu. Yenileme, Ağaç/İş planı/Pano/Zaman çizelgesi/Takvim ve Harita aynı sonucu gösterdi.
- 1470 px masaüstünde yedi sekme Ağaç → İş planı → Pano → Zaman çizelgesi → Takvim → Harita → Tablo boyunca aynı koordinatlarda kaldı (y=130 px). Hiçbiri açılır menü gerektirmedi.
- 360/390 px telefonda belge yatay taşmıyor; iş seçimi, ayrıntıdan listeye dönüş ve profil erişimi çalışıyor. 768 px tablette iki panel 300/468 px. Mobilde yalnız görünüm sekmeleri ve pano gibi yatay içerikler kendi içinde kayar.
- Genel bakış → Çalışmalar son projeyi doğrudan açtı. Proje seçiciden başka çalışma Ağaç görünümünde tek seçimle açıldı. Tarayıcı hata günlüğü boştu.
- Üretim kayıtlarına test yazılmadı; üyelikler, davetler, projeler ve şablonlar korundu.

### Canlı yayın kanıtı

- Kaynak commit: `4d11083c803ffd49c1b8038c22dcebd9b955f39f`; author/committer **augrclk**.
- [GitHub CI 39275763587](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/39275763587): Node 22 üzerinde test ve build adımları **success**.
- [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/67dMYVgYRk7BwwNgheJ9gAFttJ3D): GitHub push ile otomatik tamamlandı. GitHub Production deployment `7177538666`, durum **success**. Ayrı yayın tokenı veya ücretli kaynak açılmadı.
- `https://ekip.birlikteiyilik.com` üzerinden `index.html`, `app.js`, `hub.js`, `team.js`, `operations.css`, `tree-workspace-model.js`, `tree-workspace.js`, `workspace-flow.css` alındı; sekiz dosyanın SHA-256 değerleri bu commitin yerel üretim derlemesiyle birebir eşleşti.
- Düzenleme akışları kurmaca yerel önizlemede test edildi. Canlıda gerçek veri değiştiren bir işlem yapılmadı.

## Genel pano ve proje kapsamı — 19 Ekim 2026

Bu bölüm son ürün akışını anlatır; yukarıdaki otomatik son-proje açılışı artık kullanılmaz.

- Yerel 131 model/görünüm ve 16 izole Firebase Auth/PostgreSQL HTTP/API testi geçti. Üretim derlemesi geçti. Yerel çalışma Node 24.19.0; CI Node 22.23.3 ile ayrıca doğrulanır.
- Açılışta Genel pano: dört projeden 19 bağımsız iş, tüm sorumlular ve tamamlanan işler görünür. Mihenk filtresi yalnız altı işi gösterdi; Genel pano bağlantısıyla dönüşte filtre temizlenip bütün işler geldi. Proje sekmeleri genel kapsamda görünmüyor.
- İşler görünümü açık kişisel işle başlıyor, proje kökü ve diğer projeler listede tekrarlanmıyor. Tamamlama kutuları doğrudan listede. Sorunlu değerlerde atomik alan doğrulaması ve salt okunur korumalar testlerle korunuyor. Yeni work-list ikonu mevcut çizilme hareketini kullanıyor.
- 390 px telefonda kısa formdan Etkinlik sonrası değerlendirmeyi paylaş işi, Selin Aktaş sorumlusu ve 22 Ekim son tarihiyle eklendi. Liste kutusundan tamamlandı. Genel pano 20 işe yükseldi ve yeni kayıt Tamamlandı sütununda göründü. Bu işlem yalnız kurmaca yerel adaptörde yapıldı.
- Sorumlu ve Türkçe arama filtresi aynı işi tek sonuca indirdi; Temizle 20 işi geri getirdi. Mobil sütun düğmesi Tamamlandı sütununu açtı. Menünün Escape kapanışı odağı menü düğmesine döndürdü.
- 1470 px masaüstünde yedi proje görünümünde sekmelerin y konumu 126 px olarak sabit kaldı, seçili proje değişmedi ve belge yatay taşmadı. 390 px telefon ve 768 px tablet yerleşimleri görsel olarak incelendi; belge taşması görülmedi.
- Üretimde gerçek projelere, üyelere veya davetlere veri yazılmadı. Hazır şablonlar ve sunumlar korundu; Firebase/Vercel/Neon/Blob servisleri, yetkiler ve ücretsiz yapı değişmedi.

Son tercih doğrultusunda gezinme üst çubuğa taşındı. Masaüstünde 58 px; 360 px telefonda 102 px iki satır. Dört ana bölüm görünür kalıyor. Diğer menüsü açıldı, Escape ile kapanıp odağı kendi düğmesine döndürdü. İşlerim/Ekip/Genel pano geçişleri, Projeler → proje açma ve 768 px tablet yerleşimi doğrulandı. Belge yatay taşması yok; 20 px sayfa başlığı ve 13 px pano kart başlığı DOM üzerinden doğrulandı. Önceki yan menü/drawer kontrolü bu düzenle değiştirildi.

İş listesindeki tamamla kutusu klavyeyle iki yönde değiştirildi ve yenilemede odağını korudu. Genel pano durum değiştirme kontrolü de odak koruması içeriyor.
### Üst menü sürümünün canlı kanıtı

- Kaynak commit: `9baf57db841edeaae4f765097bb19a579e0bf8b5`, author/committer augrclk. Önceki kapsam/İşler değişiklikleri `1b3ee8d`, odak koruması `3df07d1` içindedir.
- [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/7bNbXd9bj622XbQobqtR2826kK13) 19 Ekim 2026 18:42 (İstanbul) itibarıyla **Ready / Production**. Ekranda şirket Hobby hesabı, kaynak `9baf57d` ve `ekip.birlikteiyilik.com` alan adı doğrulandı; GitHub Vercel commit durumu da **success**.
- Canlı `index.html`, `app.js`, `hub.js`, `hub-model.js`, `icons.js`, `team.js`, `tree-workspace-model.js`, `tree-workspace.js`, `workspace-flow.css` HTTP 200 döndü; dokuz SHA-256 yerel üretim derlemesiyle eşleşti. Yayın geçişindeki eski yanıtları ayırmak için `?release=9baf57d` kullanıldı. Normal URL giriş ekranı da açıldı.
- [GitHub CI 39279922252](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/39279922252) son kontrolde **queued**; runner henüz atanmamıştı. CI geçti iddiası yoktur. Yerel 131 model/görünüm testi ve bu değişiklik grubunda 16 izole Auth/PostgreSQL API testi geçti; son üst menü CSS/gezinti değişikliğinden sonra 131 test ve üretim build yeniden geçti.
- Gerçek kayıtlara yazma yapılmadı; canlıda giriş yapılmış oturum bulunmadı. Yazma ve gezinme testleri yalnız kurmaca yerel önizlemede yapıldı. Yeni ücretli plan, API veya yayın tokenı açılmadı.


## Genel bakış ve kompakt arayüz — 19 Ekim 2026

- Yerel 138 model/görünüm testi ve üretim derlemesi geçti. Yedi yeni test; etkin/erişilebilir proje sınırı, tarih filtresi, aynı adlı kişilerin ayrılması, sayıyla eşleşen pano sonuçları, boş görünüm, izinlere göre kontroller ve metin kaçışını kapsar. Bu arayüz değişikliğinde backend/API dosyaları değişmedi; önceki API testleri yukarıda tarihsel kayıt olarak durur.
- Yerel kurmaca 20 işte başlangıç: 16 açık, 2 geciken, 4 bugün teslim, 4 tamamlanan (%20). Bugün bağlantısı dört kart, Ece Demir bağlantısı iki açık kart, tamamlanan bağlantısı beş tamamlanmış kart gösterdi (tamamlama denemesinden sonra).
- Özet ekranında bir iş klavyeyle tamamlandı: açık iş 15, geciken 1, tamamlanan 5 (%25), Mihenk 3/7 (%43). Odak listeden çıkan işin yerine etkin Geciken filtresine döndü. Ardından durum alanıyla iş yeniden açıldı ve başlangıç sayıları geri geldi. Yalnız yerel örnek adaptör kullanıldı.
- 1470 px masaüstü, 768 px tablet, 390 ve 360 px telefon kontrol edildi; belge yatay taşmadı. Telefon menüsü 102 px içinde beş doğrudan hedefi gösteriyor. Yeni iş formu başlığı 18 px, telefon giriş alanı 16 px.
- Yedi proje görünümünde sekme çubuğu y=124 px konumunu korudu. İş planı/Pano/Zaman çizelgesi/Takvim başlıkları 18 px. Harita ve sunumun kendi çizim ölçeği korunur.
- Tarayıcı hata günlüğü boş. Özetin ilerleme halkası ve çubukları mevcut hareket motorunu kullanıyor; arama/filtreyle tüm ekranı tekrar belirme davranışı kaldırıldı.
- Örnek kişiler/projeler üretime eklenmedi; gerçek kayıt, davet ve yetkilere yazılmadı. Yeni API, servis, ücretli plan veya token eklenmedi.

### Dashboard sürümünün canlı kanıtı

- Kaynak commit `d48859c4d658a4c2b317ca5f990d97b53619bd9c`, author/committer **augrclk**. GitHub Production deployment `7178504184`.
- [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/EmYwrqcQyUZRRUxCWPAgQCRSPrNC) GitHub durumunda **success / Deployment has completed**. Yeni token veya ücretli kaynak açılmadı.
- Canlı `index.html`, `hub.js`, `hub-model.js`, `dashboard-model.js`, `dashboard.js`, `product-ui.css`, `team.js`, `motion.js`, `workspace-flow.css` HTTP 200; dokuz SHA-256 yerel üretim çıktısıyla eşleşti. Önbellek geçişini ayırmak için `?release=d48859c` kullanıldı.
- [GitHub CI 39282227304](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/39282227304) son kontrolde **queued**. CI geçti iddiası yok; yerel 138 test ve üretim derlemesi başarılı. Canlıda gerçek kayıt yazma testi yapılmadı.

## 19 Ekim 2026 — koyu arayüz ve doğrudan proje panosu

- Proje listesi/özet satırı doğrudan Pano açar; İşler sekmesi kaldırıldı. Altı görünüm, eski `tree` bağlantıları, açık Harita bağlantısı ve `node` bağlantısının seçim kuralı model testiyle korunur.
- Yerel model/görünüm testleri: 139 geçti. API/backend değişmedi; bu sürümde API testleri yeniden çalıştırılmadı.
- Yalıtılmış önizlemede Pano, İş planı, Zaman çizelgesi, Takvim, Harita ve Tablo açıldı; genel pano, kişisel işler, projeler, ekip, profil ve Yeni iş formu gözle incelendi.
- Yerel örnekte tamamla/yeniden aç işlemi %17 → %33 → %17 olarak sütun ve toplamı birlikte güncelledi; kayıt onayı görüldü. Üretim kayıtları test için değiştirilmedi.
- 390 px telefonda sekmelerin kırpılması ve tarih alanı taşması düzeltildi. İş planı satırlarında scrollWidth = clientWidth; form alanları 16 px.
- Koyu tema ekranla sınırlı; baskı ve SVG/PNG dışa aktarma model/kaçış testleri aynı test grubunda geçti. Hareket kodu mevcut azaltılmış hareket ve görünmeyen sekme korumalarını kullanır.
- 1470 px masaüstünde altı görünümün bütün sekmeleri aynı x konumlarını ve y=114,5 px konumunu korudu. 360 ve 390 px telefonda belge yatay taşmadı.

### Koyu arayüz sürümünün canlı kanıtı

- Kaynak commit `3060eaee2b5f03896ba5d6aa5a3c9d99e312f4e2`, author/committer **augrclk**. GitHub Production deployment `7179001779`.
- [Şirket Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/8AY16bjzFDQaPcpx1T12grbSxZGB) GitHub durumunda **success / Deployment has completed**. Yayın mevcut GitHub bağlantısıyla otomatik gerçekleşti.
- Canlı `index.html`, `app.js`, `hub.js`, `team.js`, `night-ui.css`, `work-plan.js`, `operations.js`, `operations-model.js`, `motion.js` HTTP 200 döndü; dokuz SHA-256 yerel üretim çıktısıyla eşleşti. Önbellek geçişini ayırmak için `?release=3060eae` kullanıldı.
- [GitHub CI 39285655144](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/39285655144) son kontrolde **queued**. CI geçti iddiası yok; yerel 139 test ve üretim derlemesi başarılı.
- Canlı gerçek kayıt yazma testi yapılmadı. Üye, davet ve proje verileri korunur; yeni servis, token veya ücretli plan eklenmedi.


## 19 Ekim — açık tema, kolay kurulum, günlük işler ve görsel rehber

- 144 model/iş kuralı testi geçti. Proje hazırlığı: şablon ilişkileri, kişi tekilleştirme, boş satırlar, geçersiz tarihler/kişiler. Özet: günlük işleri sayar, proje sayısını şişirmez. Eski zaman çizelgesi bağlantısı tek Takvime gider.
- Yerel Firebase Auth emülatörü + PGlite HTTP testleri: 20 test. Yeni proje üyelikleri atomik; günlük işte kişi/kurum yetkisi, başka kullanıcıya kapalılık, tekrar gönderimde tek kayıt, davet sınırı, durum güncellemesi ve geçmiş doğrulandı. Gerçek Firebase/Neon kayıtları değiştirilmedi.
- Chrome'da üretim kaynakları ve ayrı yerel kurmaca API ile: şablonlu proje, boş projeye iş/kişi ekleme, üç üyeli proje ekibi, projesiz iş kaydı ve yönetici panosunda durum değiştirme görüldü.
- Açık/koyu tema geçişi ve yenilemede tercih; masaüstü ve 360/390 px telefon genişliğinde sayfa taşması kontrol edildi. 390 px proje formunda yatay taşma yok. Üst barda Toplantılar/Haftalık rapor; projede tek Takvim doğrulandı.
- Görsel rehber gerçek UI ekran görüntüleriyle hazır; temsili kişiler kullanıldı. Kaynak görüntüler toplam yaklaşık 464 KB. Canlı veriye test projesi veya davet eklenmedi.
- Yerel `pnpm build` başarılı. Yerel Node 24 sürümü engine uyarısı verir; Vercel yapılandırması Node 22.x'tir. Canlı yayın sonucu ayrıca kaydedilir.
