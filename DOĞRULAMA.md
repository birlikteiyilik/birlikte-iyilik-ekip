# Doğrulama — 10 Ekim 2026

Bu dosya son mimarinin kanıtını ve kalan adımları ayırır. Mimari: **Firebase Auth + Vercel API + Neon PostgreSQL + Private Blob**. Ayrıntılar [MIMARI.md](MIMARI.md).

## Otomatik kontroller

Node.js **22.23.3**, pnpm **11.25.0**:

- `pnpm test`: **82 geçti, 0 hata**. Hiyerarşi, sınırları aşan belgenin kesilmeden reddi, alan bazında eşzamanlı değişiklik/geri alma, Türkiye tarihi, rapor, ay sonu tekrar, bağımlılık, takvim kaçışları, gzip açma sınırı, gerçek dosya baytlarıyla ZIP, RS256 imzalı bakım/Firebase kimliği doğrulama ve yanlış imza/proje/süre/kullanıcı red testleri.
- `pnpm test:api`: **11 geçti, 0 hata**. Gerçek Auth emülatörü, PGlite PostgreSQL motoru ve yerel HTTP API kullanıldı. Kimlik/doğrulanmış e-posta/roller; farklı alanların korunması; bağımlılık döngüsü/tamamlama; eski ayar ve toplantı çakışması; yorum/mention tekilleştirme ve gizlilik; davet; tekrar; sıkıştırılmış sürüm geri yükleme; dosya bütçesi/tür/boyut; özel indirme; yönetici gzip/ZIP; günlük iş tekilleştirme ve geçmiş sınırı; üyelik kaldırma/pasifleştirme.
- `pnpm build`: başarılı. Üretim Firebase istemcisi emülatör bağlantısı açmaz; web paketi **244,45 kB**, gzip **72,43 kB**.

Blob bu API testlerinde bellek adaptörüdür; gerçek Vercel OIDC/presigned callback'i ve Neon ağ bağlantısı bu testlerden geçmiş sayılmaz. PGlite havuzu SQL bağlantılarını sıraya koyar; üretim transaction yarışlarının yük testi değildir. Önceki **14 Firebase entegrasyon testi** eski yerel mimari için geçmişti; son PostgreSQL üretim kanıtı olarak sayılmaz.

## Kurulan dış kaynaklar

- Şirketin `birlikteiyilikakademi-8992s-projects` Vercel takımında ayrı `birlikte-iyilik-ekip` projesi, ekip GitHub deposuna doğal Git bağlantısıyla oluşturuldu.
- `ekip.birlikteiyilik.com` şirket projesinde **Valid Configuration / Production**. HTTPS giriş sayfası açıldı. Alan Firebase Auth authorized domains listesinde.
- Firebase `birlikte-iyilik-ekip`: Spark; Google/e-posta girişleri açık. Ortak kayıtları Firestore'a taşımak, Blaze ve Google IAM kurulumu yapılmadı.
- Neon **Free**, `birlikte-iyilik-ekip-db`, Frankfurt: oluşturuldu, yalnız ekip projesi **Production** ortamına bağlandı; Neon Auth açılmadı. Veritabanı gizli bağlantısı sağlayıcı tarafından ortam değişkenlerine eklendi.
- Blob `ekip-ozel-dosyalar`: **Private**, Frankfurt `fra1`, yalnız ekip projesi **Production** bağlantısı. OIDC/store ID bağlantısı var; uzun ömürlü Blob tokenı depoya yazılmadı.
- Ana web sitesi kaynak deposuna ekip kodu eklenmedi.

İlk şirket yayını `a4bf95002142d73a9f9536db804d2c8dcfa75deb` statik kaynak sürümündendi; yeni PostgreSQL/Blob API kodunun canlıya geçtiği bu bilgiyle varsayılamaz.

Son mimari `4cf53b07202e78b85b3b1be611d8396cb6d78ab9` ile `augrclk` yazarı/committer'ı olarak gönderildi. [GitHub test/build işi](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38059318198) geçti. [Doğal Vercel yayını](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/9aHeeDRFGSTwfdmWFm7PntBmRUDX) Hobby/özel depo commit yazarı kuralı nedeniyle engellendi; panelde Redeploy da Pro gerektirdi. Ücretli plana geçilmedi. Şirket CLI oturumu `birlikteiyilikakademi-8992` olarak doğrulandı ve doğru proje/takım kimliğine bağlandı; yeni API yayını ayrıca doğrulanacak.

Günlük bakım kodu kalıcı `CRON_SECRET` yerine yalnız bu deponun `main` bakım işine ait kısa ömürlü GitHub OIDC kimliği kullanacak şekilde değiştirildi. Elle anahtar ekleme adımı kaldırıldı; gerçek bakım işi yeni API yayını sonrasında sınanacak.

`cd8c5002d15ee8b96db2f1e7eacff5ed0723447a` yazarı/committer'ı `augrclk`; [test işi](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38060210987) başarılı. Şirket CLI yayını `dpl_HEoEsStqrX7DyNv3HR731MUpeN51` Ready oldu ve alan adına terfi etti. Ancak gerçek API çağrıları Firebase Admin SDK'nın `jwks-rsa` → `jose` ESM yükleme hatasıyla `500` verdi. [İlk bakım denemesi](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38060430115) bu nedenle başarısız; yedek başarıyla oluşmuş sayılmaz. Üretim kimlik denetimi JOSE/Google public anahtarlarıyla ayrıştırıldı; düzeltmenin canlı sonucu ayrıca doğrulanacak.

## Canlı doğrulama durumu

- [x] Şirket hesabı, alt alan ve giriş sayfası.
- [x] Ayrı ücretsiz PostgreSQL ve özel Blob kaynakları/Production kapsamı.
- [x] Son API kodunun yerel PostgreSQL/Auth testleri ve üretim build'i.
- [x] Son mimari commitinin `augrclk` ile gönderilmesi ve GitHub test/build başarısı.
- [ ] Kısa ömürlü bakım kimliği değişikliğinin gönderilmesi ve şirket CLI API dağıtımının Ready doğrulaması.
- [ ] Gerçek kurucu girişinden kayıt, yenileme, özel yükleme/indirme ve yedek akışı.
- [ ] Gerçek GitHub OIDC bakım işi ve günlük özel Blob yedeği.
- [ ] İki gerçek hesapla canlı yetki ve eşzamanlı kayıt testi.

Bekleyen kutular tamamlanana kadar bütün proje canlı işlemlerinin doğrulandığı iddia edilmez. Gerçek ekip verisi ve gizli anahtarlar bu belgeye eklenmez.

## Daha önceki tarayıcı kontrolleri

Eski yerel emülatörde giriş, görev, yeniden açılan toplantı tutanağı, bağımlılık/tekrar, TXT yükleme ve dosya baytları, 390×844 mobil menü/rapor ve yatay taşma kontrol edildi. Bunlar arayüz davranışının geçmiş kanıtıdır; üretimdeki yeni depolama yolunu doğrulamak için son canlı kontrol ayrıca gerekir.
