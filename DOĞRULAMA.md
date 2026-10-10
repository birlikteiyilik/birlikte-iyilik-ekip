# Doğrulama — 10 Ekim 2026

Bu dosya son mimarinin kanıtını ve kalan adımları ayırır. Mimari: **Firebase Auth + Vercel API + Neon PostgreSQL + Private Blob**. Ayrıntılar [MIMARI.md](MIMARI.md).

## Otomatik kontroller

Node.js **22.23.3**, pnpm **11.25.0**:

- `pnpm test`: **86 geçti, 0 hata**. Hiyerarşi, sınırları aşan belgenin kesilmeden reddi, alan bazında eşzamanlı değişiklik/geri alma, Türkiye tarihi, rapor, ay sonu tekrar, bağımlılık, takvim kaçışları, gzip açma sınırı, gerçek dosya baytlarıyla ZIP, RS256 imzalı bakım/Firebase kimliği doğrulama ve yanlış imza/proje/süre/kullanıcı red testleri. Dört yeni test; örnek belgelerin geçerliliğini, görev/durum/tarih dağılımını, toplantı ve bağımlılık referanslarını ve temsili kişilerin giriş hesaplarından ayrılmasını kapsar.
- `pnpm test:api`: **11 geçti, 0 hata**. Gerçek Auth emülatörü, PGlite PostgreSQL motoru ve yerel HTTP API kullanıldı. Kimlik/doğrulanmış e-posta/roller; farklı alanların korunması; bağımlılık döngüsü/tamamlama; eski ayar ve toplantı çakışması; yorum/mention tekilleştirme ve gizlilik; davet; tekrar; sıkıştırılmış sürüm geri yükleme; dosya bütçesi/tür/boyut; özel indirme; yönetici gzip/ZIP; günlük iş tekilleştirme ve geçmiş sınırı; üyelik kaldırma/pasifleştirme.
- `pnpm build`: başarılı. Üretim Firebase istemcisi emülatör bağlantısı açmaz; web paketi **244,43 kB**, gzip **72,42 kB**.

Blob bu API testlerinde bellek adaptörüdür; gerçek Vercel OIDC/presigned callback'i ve Neon ağ bağlantısı bu testlerden geçmiş sayılmaz. PGlite havuzu SQL bağlantılarını sıraya koyar; üretim transaction yarışlarının yük testi değildir. Önceki **14 Firebase entegrasyon testi** eski yerel mimari için geçmişti; son PostgreSQL üretim kanıtı olarak sayılmaz.

## Kurulan dış kaynaklar

- Şirketin `birlikteiyilikakademi-8992s-projects` Vercel takımında ayrı `birlikte-iyilik-ekip` projesi, ekip GitHub deposuna doğal Git bağlantısıyla oluşturuldu.
- `ekip.birlikteiyilik.com` şirket projesinde **Valid Configuration / Production**. HTTPS giriş sayfası açıldı. Alan Firebase Auth authorized domains listesinde.
- Firebase `birlikte-iyilik-ekip`: Spark; Google/e-posta girişleri açık. Ortak kayıtları Firestore'a taşımak, Blaze ve Google IAM kurulumu yapılmadı.
- Neon **Free**, `birlikte-iyilik-ekip-db`, Frankfurt: oluşturuldu, yalnız ekip projesi **Production** ortamına bağlandı; Neon Auth açılmadı. Veritabanı gizli bağlantısı sağlayıcı tarafından ortam değişkenlerine eklendi.
- Blob `ekip-ozel-dosyalar`: **Private**, Frankfurt `fra1`, yalnız ekip projesi **Production** bağlantısı. OIDC/store ID bağlantısı var; uzun ömürlü Blob tokenı depoya yazılmadı.
- Ana web sitesi kaynak deposuna ekip kodu eklenmedi.

## Son canlı sürüm ve kanıt

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
