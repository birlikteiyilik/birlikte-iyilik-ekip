# Birlikte İyilik Ekip — mimari ve işletim rehberi

Son güncelleme: **10 Ekim 2026**. Projeyi devralan geliştirici için servis, veri ve işletim rehberi. Gerçek test/yayın durumu [DOĞRULAMA.md](DO%C4%9ERULAMA.md) içinde tutulur; bir servisin oluşturulması tüm canlı akışların doğrulandığı anlamına gelmez.

## Amaç, sahiplik ve karar

Birlikte İyilik ekibinin proje, organizasyon, görev, toplantı ve dosyalarını yönetmesi için bir **web sitesi**.

| Kaynak | Son yapılandırma |
| --- | --- |
| Adres | `https://ekip.birlikteiyilik.com` |
| Kaynak deposu | `birlikteiyilik/birlikte-iyilik-ekip` |
| Commit ve push hesabı | `augrclk` |
| Vercel takımı | `birlikteiyilikakademi-8992s-projects` — birlikteiyilik hesabı |
| Vercel projesi/dalı | `birlikte-iyilik-ekip` / `main` |
| Firebase | `birlikte-iyilik-ekip`, Spark |
| PostgreSQL | Neon Free: `birlikte-iyilik-ekip-db`, Frankfurt |
| Dosya alanı | Private Blob: `ekip-ozel-dosyalar`, Frankfurt `fra1` |

**Son karar: Firebase yalnız giriş için; ortak kayıtlar Vercel'e bağlı PostgreSQL'de.** Özel dosyalar ve sıkıştırılmış yedekler Blob'da. Bu dağılım ücretli Firebase Functions/Storage ve yönetici hizmet hesabı kurulumu gerektirmeden sunucu tarafında yetkilendirme sağlar.

Ana sitenin `birlikteiyilik/birlikteiyilik.com` deposuna ekip kodu veya verisi kopyalanmaz. Commit yazarı, repo sahibi, Vercel sahibi ve Firebase sahibi ayrı kavramlardır. Yanlış Vercel takımına bağlanmayın.

```mermaid
flowchart LR
  Git[GitHub kaynak ve testler] -->|main / Git bağlantısı| Web[Vercel CDN / web arayüzü]
  Browser[Tarayıcı] --> Web
  Browser <-->|Google veya e-posta girişi| Auth[Firebase Auth / Spark]
  Browser -->|Firebase ID token| API[Vercel Node.js API / fra1]
  API -->|İmza ve proje doğrulaması| Auth
  API <-->|Yetkili SQL işlemleri| DB[Neon PostgreSQL / Free]
  API -->|Dosyaya özel kısa süreli izin| Browser
  Browser -->|Doğrudan özel yükleme| Blob[Vercel Private Blob]
  Blob -->|İmzalı tamamlanma bildirimi| API
  API <-->|Yetkili indirme / gzip yedek| Blob
  Cron[Vercel günlük zamanlayıcı] -->|CRON_SECRET| API
```

GitHub ekip verisinin yedeği değildir. Vercel'in geçici dosya sistemi kalıcı veritabanı değildir. Üretimde Firestore, Firebase Storage ve Firebase Cloud Functions kullanılmaz. Blaze, Google Cloud IAM/WIF veya hizmet hesabı özel anahtarı bu mimarinin parçası değildir.

## Kod haritası

| Yol | Sorumluluk |
| --- | --- |
| `web/` | Türkçe arayüz, organizasyon editörü, görev ekranları, marka varlıkları |
| `web/core.js`, `web/collab.js` | Belge doğrulama/hiyerarşi; alan değişiklikleri ve çakışmalar |
| `web/hub-model.js`, `web/coordination-model.js` | Tarih, görev, tekrar, bağımlılık, toplantı, rapor |
| `web/team.js`, `web/hub.js` | Ortak kayıt/dosya/geçmiş; panel ve ekip ekranları |
| `firebase/client.js`, `firebase/web-config.json` | Auth/API istemcisi; herkese açık Firebase web ayarları |
| `api/` | Vercel HTTP işlev girişleri |
| `server/admin.cjs`, `server/http.cjs` | ID token, ortam, boyut sınırı, hata ve yanıt başlıkları |
| `server/workspace.cjs` | Ekip üyeliği, roller ve ortak iş kuralları |
| `server/database.cjs` | SQL belge adaptörü, sorgu ve transaction |
| `server/storage.cjs` | Dosya rezervasyonu, doğrulama ve temizlik |
| `server/snapshots.cjs`, `server/backup.cjs` | Sürüm sıkıştırma; yedek, ZIP ve günlük bakım |
| `scripts/build.mjs`, `scripts/sync-shared.mjs` | Web build'i; üretimde doğrudan ortak kaynak kullanımı ve eski emülatöre kopyalama |
| `tests/` | Model, HTTP/PostgreSQL ve eski emülatör testleri |
| `.github/workflows/tests.yml` | Test/build; yayın tokenı kullanmaz |
| `vercel.json` | Build, API/SPA yönlendirmesi, bölge, başlık ve cron |
| `functions/`, `firebase.json`, Firebase kuralları | Korunan eski yerel emülatör düzeni; üretime dağıtılmayacak |

`dist/`, `functions/shared/`, `functions/workspace.cjs`, `functions/snapshots.cjs` üretilir. Kaynağı düzenleyip build/test çalıştırın; kopyaları elle düzenlemeyin. `node_modules`, `.vercel`, `.env*`, loglar ve emülatör verisi depoya girmez.

## Kimlik ve yetki

1. Firebase Auth Google veya e-posta/parola girişini yönetir; tarayıcı oturumu oturum kapsamında saklanır.
2. API'ye `Authorization: Bearer <Firebase ID token>` gönderilir. Parola API/SQL'e gönderilmez.
3. Sunucu imza, süre ve Firebase proje bilgisini herkese açık imzalama sertifikalarıyla doğrular; özel yönetici anahtarı kullanmaz.
4. Doğrulanmış e-posta ve PostgreSQL'de aktif ekip profili gerekir. İlk girişte kurucu dışındaki hesap için geçerli davet aranır.
5. Her işlem çalışma üyeliği ve gerekli rolü denetler. Üye erişebildiği çalışmanın bütününü görür; kart bazında gizlilik yoktur.

Kurucu, doğrulanmış `birlikteiyilikakademi@gmail.com` hesabıdır. Kurucu/kendi yönetici erişimini yanlışlıkla kaldırma engellenir. Davet 7 gün geçerli, seçilen çalışma/role bağlı ve ilk başarılı girişte tüketilir. Davet bağlantısını yönetici paylaşır; uygulama ekip davet e-postası göndermez.

| Rol | İzin |
| --- | --- |
| Kurum `admin` | Kullanıcı, davet ve tüm çalışmalar |
| Çalışma `manager` | İçerik, üyelik, arşiv, geri yükleme ve yedek |
| `editor` | İçerik, görev, yorum, toplantı ve dosya |
| `commenter` | Görüntüleme ve yorum |
| `viewer` | Görüntüleme ve çalışma dosyalarını indirme |

Ekip profilini `active=false` yapmak sonraki istekte erişimi keser. Token doğrulaması `checkRevoked` kullanmaz: Firebase hesabını kapatmak eldeki ID tokenı hemen iptal etmiş sayılmaz. Acil erişim kesme için ekip profilini de pasifleştirin.

API `private, no-store` ve `nosniff` döner; hassas bağlantı/hata metni tarayıcıya verilmez. Bellekte kullanıcı/dakika istek sınırı işlev örneği başınadır, kesin küresel kota değildir. Preview canlı verilere bağlanmaz. Üretimde emülatör ortam değişkenleri reddedilir.

## PostgreSQL modeli

Mevcut iş kuralları JSONB belge adaptörüyle korunmuştur. Kodda `collection/doc` adları bulunması üretimde Firestore kullanıldığı anlamına gelmez.

```sql
CREATE TABLE IF NOT EXISTS ekip_documents (
  path text PRIMARY KEY,
  parent_path text NOT NULL,
  document_id text NOT NULL,
  data jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS ekip_parent_idx ON ekip_documents(parent_path);
```

İlk istekte tablo/indeks oluşturulur. Sonraki şema değişiklikleri için açık migration gerekir; oluşturma metnini değiştirmek mevcut tabloyu dönüştürmez. Sorgu değerleri parametreli SQL'dir. İşlev örneği başına havuz en fazla 3 bağlantıdır.

| Belge yolu | İçerik |
| --- | --- |
| `users/{firebaseUid}` | Ekip adı/e-posta, kurum rolü ve aktiflik; parola/token yok |
| `invitations/{email}` | Hedef çalışma, rol, süre ve davet eden |
| `boards/{boardId}` | Ad, JSON içerik, revision, üyeler/roller, arşiv ve tarihler |
| `boards/{id}/meta/{nodeId}` | Bağımlılık, tekrar, ayar revision ve istek özeti |
| `boards/{id}/comments/{id}` | Kart yorumu, yazarı, tarih ve silinme işareti |
| `boards/{id}/events/{id}` | Toplantı, tutanak, kararlar ve revision |
| `boards/{id}/files/{id}` | Blob yolu, boyut/tür, rezervasyon ve yükleme durumu |
| `boards/{id}/audit/{id}` | Kim/ne/zaman hareketi |
| `boards/{id}/snapshots/{revision}` | Gzip/Base64 organizasyon belgesi |
| `boards/{id}/operations/{id}` | Kayıt isteği tekrarını tanıma |
| `boards/{id}/notifications/{id}` | Üyeye özel bildirim |
| `boards/{id}/completions/{id}` | Gerçek tamamlanma tarihi |
| `system/storage`, `system/backup`, `system/maintenance` | Bütçe, son yedek ve günlük iş durumu |
| `backups/{UTC-date}` | Blob yolu, SHA-256, boyut ve tarih |

Yazma `SERIALIZABLE` transaction içindedir; serialization/deadlock için sınırlı yeniden deneme vardır. Transaction okumaları yazmalardan önce tamamlanır. Tek çalışmanın yedeği `REPEATABLE READ READ ONLY` ile tutarlı okunur; bütün çalışmalar için tek küresel an garanti edilmez.

## Kayıt ve eşzamanlılık

İstemci son bilinen belgeye göre alan değişikliklerini çıkarır. Farklı alanlar birleştirilebilir; aynı alanda uyumsuzluk `409` ve güncel durumla döner. İşlem kimliği + istek özeti aynı kaydın tekrarını tekilleştirir; aynı kimlik farklı içerikte kullanılamaz.

Başarılı kayıtta revision, hareket, tamamlanma/atama bildirimi ve sıkıştırılmış sürüm birlikte yazılır. Ayar ve toplantı revision'ları eski formla kaydı engeller. Bağımlılık döngüsü, yanlış sorumlu ve tamamlanmamış bağlı görevler sunucuda doğrulanır.

Kaydetme 1,8 saniye sessizlikte toplanır; sürekli düzenlemede en fazla 5 saniyede gönderilir. Görünür çalışma yaklaşık 30 saniyede, yorumlar 45, panel 90 saniyede sorgulanır. Gizli/çevrimdışı sekmede sorgu yapılmaz. Bazı GET sonuçları istemcide 30, ortak panel ayrıntısı sunucuda 60 saniye tutulur; yetki güncel veriden denetlenir. Başka işlev örneğindeki panel değişikliği kısa gecikmeyle görülebilir.

Karakter karakter ortak metin yazımı ve canlı kişi mevcudiyeti yoktur. Çevrimdışı ortak kayıt tamamlanmış sayılmaz. Kaydedilmemiş taslak indirilebilir; limit aşımında veri kesilmez.

## HTTP API

| Uç | Yöntem / davranış |
| --- | --- |
| `/api/workspace` | POST `{path, method, body}` ile çalışma işlemleri |
| `/api/upload` | POST: yükleme izni ve imzalı Blob tamamlanma bildirimi |
| `/api/file?boardId=…&id=…` | GET: güncel üyelikten sonra özel dosya akışı |
| `/api/backup?boardId=…&mode=metadata` | GET: yöneticiye `.json.gz` |
| `/api/backup?boardId=…&mode=full` | GET: yöneticiye kayıt + mevcut dosyalar ZIP |
| `/api/maintenance` | GET: `CRON_SECRET`; POST: Firebase ile doğrulanmış kurum yöneticisi |

Workspace yolları `/me`, `/hub`, `/boards`, `/users`, `/directory`, `/invitations`, `/notifications`; çalışma altında `changes`, `restore`, `members`, `archive`, `history`, `snapshots`, `comments`, `meta`, `events`, `files`. Sözleşme ve izinler `server/workspace.cjs` içindedir. Tarayıcı PostgreSQL'e doğrudan bağlanmaz.

## Özel dosyalar

Sunucu aktif düzenleyici/geçerli kart için boyutu bütçeye atomik ayırır. Yol `boards/{boardId}/{nodeId}/{fileId}`, rezervasyon 1 saattir. `uploadPresigned/handleUploadPresigned` yalnız bu yol/tür/boyut için 10 dakikalık izin verir. Dosya doğrudan Blob'a gider; işlev gövdesinden geçirilmez.

Tamamlanma imzasını SDK denetler; sunucu gerçek boyut/türü, üyeliği ve kartı yeniden denetleyip `ready` yapar. İstemci tamamlamayı tekrar güvenle isteyebilir. İndirme her seferinde üyelik denetler; Blob herkese açık yapılmaz.

Sunucu Blob erişimi bağlı `BLOB_STORE_ID` ve Vercel OIDC ile sağlanır; uzun ömürlü `BLOB_READ_WRITE_TOKEN` gerekmez. PDF, belirtilen Office türleri, ZIP, TXT/CSV, PNG/JPEG/WebP kabul edilir. HTML/SVG kabul edilmez. MIME kontrolü antivirüs taraması değildir; dosya indirme eki ve `nosniff` ile sunulur.

Kaldırılan dosya önce işaretlenir. Günlük iş 7 günden eski kaldırılmış dosyaları ve süresi geçmiş yarım yüklemeleri fiziksel silip bütçeyi serbest bırakır; bir çalışmada en fazla 100 dosya temizlenir. Bu temizlikten sonra eski dosya bağlantısının çalışacağı garanti edilmez.

## Ücretsiz kapasite

Firebase Spark, Vercel Hobby ve Neon Free seçilir; ücretli plan/faturalandırma açılmaz. 10 Ekim 2026 kurulum ekranı Neon için proje başına 1 GB / 100 CU-saat, Blob Hobby için 1 GB alan / 10 GB aktarım gösteriyordu. Güncel Usage/Plan sayfası belirleyicidir; ücretsiz hizmet sınırsız değildir.

| Önlem/sınır | Amaç |
| --- | --- |
| Belge 750.000 UTF-8 bayt, 2.000 kart, 60 seviye | Kayıt ve sürüm büyümesini sınırlar |
| Kart 500 kontrol adımı, 100 bağlantı, 30 etiket | Kontrolsüz içerik büyümesini engeller |
| Dosya 10 MB; toplam rezervasyon 750 MiB | Blob'da yedek/temizlik payı bırakır |
| Yedek toplam 100 MiB, tek gzip 12 MiB | Ana dosya alanını korur |
| İlk sürüm + son 30 sıkıştırılmış sürüm | Her düzenlemede sınırsız tam kopya biriktirmez |
| Son 7 değişen günlük kayıt yedeği | Değişmeyen veriyi tekrar yazmaz |
| Tam ZIP dosyaları 100 MiB; günlük yedek 100 çalışma | İşlev/indirme hacmini sınırlar |
| Toplu kayıt, görünürlük ve kısa önbellek | API/SQL hesaplama yükünü azaltır |

30 günden eski işlem kimlikleri ve okunmuş bildirimler bakımda sınırlı partilerle temizlenir. Hareketler, yorumlar, toplantılar ve tamamlanmalar topluca otomatik silinmez; büyümeleri izlenmelidir. PostgreSQL toplam boyutu için uygulamada kesin küresel alan kotası yoktur; sağlayıcı kotası ve kullanım takibi gerekir. Kota aşımı ücretli plana geçme talimatı değildir.

## Yedek ve geri yükleme

1. **Sürüm geçmişi:** organizasyon belgesi PostgreSQL'de gzip/Base64 tutulur. Yönetici gerekçeyle eski belgeyi yeni revision olarak geri yükler. Kullanıcı/yorum/toplantı/dosyaları geçmişe döndürmez; güncel bağımlılık/üyelik kontrolleri uygulanır.
2. **Kayıt yedeği:** `backups/{date}/{sha256}.json.gz` veya yönetici indirmesi. Güncel belge, meta, yorum, toplantı, dosya referansı, tamamlanmalar ve son 100 hareketi içerir. Otomatik toplu yedekte ekip profilleri de vardır. Parola/token, eski sürümler, davetler ve bütün eski hareketler kapsam dışıdır.
3. **Tam ZIP:** `workspace.json` + mevcut, kaldırılmamış dosyaların gerçek baytları. Günlük otomatik yedek dosyaları her gün çoğaltmaz.

Değişiklik özeti aynıysa yeni Blob yazılmaz. Yeni yedek ve metadata başarıyla kaydedilmeden eskiler budanmaz. Son 7 **farklı günlük kopya** tutulur; veri değişmiyorsa 7 takvim gününde son iyi kopya silinmez. Günlük anahtar UTC, görev/rapor tarihleri Türkiye saatidir.

Felaket kurtarma akışı:

1. Yazmayı durdurun, eldeki veriyi ayrıca kopyalayın; yeni izole PostgreSQL/özel Blob ortamında deneyin.
2. Gzip/ZIP açın; `format=birlikte-iyilik-backup`, `version=1`, proje ve SHA-256/JSON bütünlüğünü kontrol edin. ZIP'te dosya baytlarını da kontrol edin.
3. Organizasyon belgesi JSON aktarımıyla yeni çalışmaya alınabilir; bu diğer koleksiyonları ve üyelikleri kendiliğinden taşımaz.
4. Tam kayıt kurtarma için geliştirici yol modeline göre kontrollü import/migration hazırlamalıdır. Çalışma/alt kayıt/Blob yolları ve Firebase UID'leri birlikte eşlenir. Tam sistem yedeğini tek tuşla içeri alan ekran bu sürümde yoktur.
5. Dosyaları özel Blob'a koyup boyut/türü doğrulayın. Firebase kullanıcıları ayrıca yönetilir; Auth projesi değişirse UID eşleştirmesi gerekir.
6. İzole ortamda roller, kayıt, indirme ve yedekleri test edip canlı bağlantıyı değiştirin.

Yedekler özel ekip içeriği ve ad/e-posta içerebilir; GitHub/public Blob'a koymayın. Blob hesabının kaybında aynı hesap içindeki kopya yeterli değildir. Yönetici dönemsel tam ZIP'i kurumun başka, erişimi sınırlı konumunda saklamalıdır.

## Ortam değişkenleri

| Değişken | Kaynağı/kapsamı |
| --- | --- |
| `DATABASE_URL` | Neon bağlantısı ekler; yalnız Production, gizli |
| `BLOB_STORE_ID` | Özel Blob bağlantısı; yalnız Production |
| `BLOB_WEBHOOK_PUBLIC_KEY` | Blob imza doğrulama anahtarı; public key |
| `VERCEL_OIDC_TOKEN`, `VERCEL_ENV` | Vercel çalışma ortamı; elle kopyalanmaz |
| `CRON_SECRET` | Yönetici Production'a en az 32 karakterli rastgele gizli değer girer |
| `DAL_LOCAL_API`, `FIREBASE_AUTH_EMULATOR_HOST` | Yalnız izole yerel API testleri |
| `DAL_EMULATORS` | Yalnız eski yerel Firebase arayüz build'i |

Neon başka `PG*/POSTGRES_*` değişkenleri ekleyebilir; kod yalnız `DATABASE_URL` kullanır. Firebase web API key'i public SDK ayarıdır, yönetici anahtarı değildir. Veritabanı parolası, Vercel tokenı, hizmet hesabı özel anahtarı ve gerçek ekip yedeğini kaynak/build/tarayıcı yapılandırmasına yazmayın.

## Yayın ve günlük bakım

Vercel Git bağlantısı ekip deposuna bağlıdır; `main` yeni Production dağıtımı başlatır. Framework `Other`, Node `22.x`, install `corepack pnpm install --frozen-lockfile`, build `pnpm test && pnpm build`, çıktı `dist`. `api/*.js` Node.js işlevi, bölge `fra1`, süre 60 saniye. SPA rewrite `/api` yollarını kapsamamalıdır.

GitHub akışı model testleri, Auth/PGlite API testleri ve build çalıştırır; canlı anahtar kullanmaz. Native Vercel yayını GitHub testlerini kendiliğinden beklemez; bu yüzden build içinde model testleri vardır. Dal koruması/review ayrı yönetilir. Hobby/özel depo commit yazarı nedeniyle reddedilirse `augrclk` author bilgisini değiştirmeyin; ilgili hesap erişimini düzeltin.

Alan adı şirket Vercel projesinde ve Firebase authorized domains listesinde olmalıdır. Sahiplik TXT, mevcut yönlendirme ve ana sitenin DNS kayıtlarını birlikte koruyun. Sahip/proje değişirse doğrulama değeri değişebilir; eski değeri ezbere kopyalamayın.

`vercel.json` günlük `/api/maintenance` çağrısını `0 5 * * *` UTC tanımlar: Türkiye saatiyle 08.00. Hobby kesin dakikayı garanti etmez. Tekrar/son tarih bildirimleri, yedek, geçmiş budama ve dosya temizliği burada yapılır. Tamamlanan günlük iş tekrar çalışmaz; başarısız iş yeniden denenebilir.

En az 32 karakterli `CRON_SECRET` yoksa GET `401` döner; otomatik bakım çalışmaz. Yeni env sonraki dağıtımda etkinleşir. Firebase ile doğrulanmış kurum yöneticisi POST ile bakımı ayrıca çalıştırabilir. Vercel Logs, `system/maintenance` ve `system/backup` üzerinden izleyin. `failed` eski iyi yedeğin silindiği anlamına gelmez. Süre/kota sorununda hacmi azaltıp yeniden test edin; ücretli plana sessiz geçmeyin.

## Yerel geliştirme ve test

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm test:api
pnpm build
pnpm preview
```

API testleri gerçek Auth emülatörü ve PGlite PostgreSQL sorgu motoruyla çalışır. Blob adaptörü bellektedir. Vercel OIDC, gerçek Blob callback'i, Neon ağ bağlantısı ve DNS canlı uçtan uca test ister. PGlite test havuzu bağlantıları sıraya koyar; canlı Neon transaction yarışlarının tam yük testi değildir.

`preview` statik ekranlar içindir. Eski tam tarayıcı emülatörü Node 22 + Java 21 ile:

```sh
pnpm --dir functions install --frozen-lockfile
pnpm emulators
# Başka terminalde, sadece yerel demo ortamında:
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/seed-emulator.cjs
```

Site `http://localhost:5500`; örnek hesap `admin@example.test`, parola `Test-only-website-2026`; sadece emülatör hesabıdır. `pnpm test:legacy-firebase` eski Auth/Functions/Firestore/Storage testidir; son mimarinin üretim kanıtı değildir. Testten önce aynı porttaki emülatörleri durdurun. Eski Functions/Storage'ı `firebase deploy` ile canlıya yayınlamayın.

## Devralma ve bilinen sınırlar

- Değişiklikten önce doğrulama belgesini okuyun; kurulu kaynak ile test edilmiş akışı ayırın.
- Test/build sonrası `augrclk` ile doğru depoya gönderin; şirket Vercel dağıtımının SHA/Ready durumunu kontrol edin.
- İki kullanıcıyla alan birleştirme/çakışma ve yenileme sonrası kaydı deneyin.
- Görüntüleyicinin yazamadığını, çıkarılan/pasif hesabın dosya indiremediğini kontrol edin.
- Günlük iş, son iyi yedek ve Blob/Neon/Functions kotalarını izleyin; izole geri yükleme provası yapın.
- API/şema değişince bu belge, README ve doğrulama kaydını birlikte güncelleyin.

E-posta/push bildirim, çift yönlü takvim, çevrimdışı ortak kayıt, karakter seviyesinde ortak metin, canlı kişi mevcudiyeti, antivirüs ve tek tuş tam sistem import yoktur. Ücretsiz kapasitenin yetmesi kullanım ve dosya hacmine bağlıdır.

## Resmî servis belgeleri

- [Firebase ID token doğrulama](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Vercel Blob SDK/presigned yükleme](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Blob kullanım ve kota](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Vercel cron](https://vercel.com/docs/cron-jobs)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
