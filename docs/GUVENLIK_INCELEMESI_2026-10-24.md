# Güvenlik incelemesi — 24 Ekim 2026

## Kapsam ve sonuç

`birlikteiyilik/birlikte-iyilik-ekip` kaynak kodu, kilit dosyasındaki paketler, Node.js güvenlik duyurusu, kimlik/rol denetimi, dosya/yedek erişimi ve canlı adresin anonim HTTP davranışı incelendi. Bu çalışma kapsamlı bir sızma testi veya sağlayıcı altyapısı denetimi değildir. Gerçek ekip kayıtlarına test verisi eklenmedi ve canlı kayıt silinmedi.

İlk `pnpm audit --json` sonucunda **18 bildirim: 7 yüksek, 8 orta, 3 düşük, 0 kritik** vardı. Uyumlu güncellemelerden sonra **2 orta; 0 yüksek, 0 kritik, 0 düşük** kaldı. Bunlar paket bildirimleridir; 18 ayrı istismar edilebilir uygulama açığı anlamına gelmez.

## Uygulanan güncellemeler

| Alan | Sonuç |
| --- | --- |
| `@vercel/blob` | 2.8.1 → 2.8.2; dosya API uyumluluğu korundu |
| Firebase SDK | 13.0.0 → 13.1.0; Auth başlatma düzeltmesi dahil |
| Firebase CLI | 15.33.0 → 15.34.1; geliştirme araçları |
| Alt bağımlılıklar | Aynı uyumlu sürüm aralıklarında kilit dosyası yenilendi; Undici 6.29.1/8.12.3, body-parser, fast-uri ve diğer yamalar alındı |
| Zod | Üst bağımlılığın sabitlediği 4.1.11, hedefli override ile 4.6.6 oldu |
| gRPC | `<1.13.6` sürümleri hedefli override ile 1.13.6 oldu; üretimde Firestore/gRPC sunucusu kullanılmıyor |
| GitHub CI ve bakım | Node 22.23.3 → **22.23.4** güvenlik sürümü |
| Sürekli kontrol | Push/PR test işine `pnpm security:audit` eklendi; yüksek/kritik bildirim işi başarısız yapar |

Yamalar, özellikle hatalı sıkıştırma yanıtıyla süreç çökmesine yol açabilen Undici bildirimini ve sınırsız doğrulama kaynak kullanımına ilişkin Zod bildirimini giderir. Uygulamada kullanıcı tarafından seçilen URL'lere sunucu taraflı fetch veya EventSource yapılmıyor; paket eşleşmesi tek başına saldırı yolunun erişilebilir olduğunu kanıtlamaz.

Kaynaklar: [Undici GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c), [Zod GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [gRPC GHSA-m9gg-hp2v-232j](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [Firebase sürümü](https://github.com/firebase/firebase-js-sdk/releases/tag/firebase%4013.1.0), [Blob değişiklikleri](https://github.com/vercel/storage/blob/main/packages/blob/CHANGELOG.md).

## Kalan iki paket bildirimi

| Paket | Bağlam ve karar |
| --- | --- |
| `uuid@9.0.1` — orta | Firebase CLI ve eski `functions/` paketinin Google istemcileri. Bildirim v3/v5/v6'ya dışarıdan buffer verilmesiyle ilgili; incelenen gaxios/google-gax çağrıları v4 kullanıyor. Aktif Node API kendi kimliklerini `node:crypto.randomUUID()` ile üretiyor. Üst paketler için ana sürüm zorlaması yapılmadı. |
| `@opentelemetry/core@1.30.1` — orta | `firebase-tools → @google-cloud/pubsub` zincirinde. Canlı uygulama Firebase CLI/PubSub veya W3C Baggage işleme servisi çalıştırmıyor. 2.x ana sürümünü 1.x bekleyen araca zorlamak yerine üst bağımlılık güncellemesi beklenmeli. |

Kaynaklar: [uuid GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [OpenTelemetry GHSA-8988-4f7v-96qf](https://github.com/advisories/GHSA-8988-4f7v-96qf). Bildirimler bastırılmadı; `pnpm audit` ile görünmeye devam eder. Eski Firebase emülatör sunucuları internete açılmamalı.

## Kod ve erişim kontrolleri

- Firebase JWT doğrulaması RS256, sabit Google JWKS adresi, issuer, audience, süre, UID ve doğrulanmış e-posta kontrolü yapıyor. Sahte imza, yanlış proje, süresi geçmiş token ve `alg:none` testleri geçti.
- İşlemler aktif uygulama üyeliğini ve proje rolünü sunucuda kontrol ediyor. Rol değiştirme/yöneticiye yükselme profil formuyla yapılamıyor. Üyelik kaldırıldığında dosya ve kayıt erişimi reddediliyor.
- Günlük işler sorumlusu ve kurum yöneticileriyle sınırlı. Başkasının günlük iş listesine erişme/atama ve silme denemeleri reddedildi.
- SQL sorgularındaki veri ve alan değerleri parametreli. Ortak belge değişikliklerinde prototype alanları engelleniyor; içerik sınırı, çakışma ve şema doğrulaması var.
- Dosyalar özel Blob alanında. Yükleme rezervasyonunda rol, içerik türü, boyut, toplam kota ve kısa süreli imza; indirmede yeniden üyelik kontrolü var. Dosya indirme `attachment` ve `nosniff` ile yapılıyor.
- Yedek dışa aktarımı yönetici rolüyle; bakım GitHub OIDC imzası, depo kimliği, dal ve iş dosyası denetimiyle korunuyor.
- Git'teki mevcut 131 dosyada özel anahtar, GitHub tokenı, kimlik bilgisi içeren PostgreSQL URL'si ve AWS erişim anahtarı desenleri aranıp eşleşme bulunmadı. Bu kontrol tüm Git geçmişi veya sağlayıcıdaki gizli değişkenler için tam secret taraması değildir.
- Canlı `/api/workspace`, `/api/file`, `/api/backup`, `/api/maintenance` anonim isteklere **401** döndü. API yanıtları `private, no-store`; HTTPS/HSTS, `nosniff`, `DENY` ve Referrer-Policy başlıkları doğrulandı.

## Açık sınırlar ve takip

1. **Vercel Node yaması:** Node 22.23.4, 21 Ekim 2026 güvenlik sürümüdür. CI/bakım bu sürüme taşındı. Vercel yapılandırması `22.x` olarak kalır; küçük/yama sürümlerini sağlayıcı yönetir. Mevcut bağlantı yalnız augrclk takımına erişebildiği için birlikteiyilik takımındaki gerçek üretim runtime yaması bu incelemede doğrulanamadı. Şirket hesabından runtime logundaki `process.version` veya sağlayıcı bilgisiyle 22.23.4 veya üstü doğrulanmalı. [Node duyurusu](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), [Vercel sürüm yönetimi](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
2. **İstek sınırı:** Dakikada 90 istek kontrolü işlev örneğinin belleğinde. Sunucusuz örnekler arasında ortak, kesin bir kullanıcı kotası değildir. Yaygın kötüye kullanım için Vercel güvenlik kuralları/kalıcı sayaç ayrıca değerlendirilmeli.
3. **Token iptali:** Uygulamadaki `active=false` erişimi keser. Yalnız Firebase Console'da oturum iptali/hesap kapatma yapılması, yerel JWT doğrulayıcısında merkezi iptal sorgusu yapılmadığından token süresi bitene kadar aynı etkiyi garanti etmez. Ekip erişimini uygulamadan da kapatın.
4. **CSP:** Tam bir script-src CSP politikası henüz yok. İncelenen metin çıktılarında escape uygulanıyor; CSP için Firebase popup, sunum ve blob önizlemelerini kapsayan ayrı tarayıcı doğrulaması gerekir.
5. Google/Firebase/Vercel/Neon hesaplarının MFA ayarları, Firebase parola politikası, veritabanı paneli ve son yedeklerin sağlayıcı üstündeki durumu bu kaynak incelemesinde doğrulanmadı.

## Test kanıtı

Yerel: **144 model testi + 22 Auth/PostgreSQL API testi**, üretim build'i ve tarayıcı silme/iptal/geri alma testi başarılı. API testleri yalnız `demo-birlikte-iyilik` Auth emülatörü ve bellek içi PGlite veritabanıyla çalıştı. Yerel runtime Node 24.19.0; GitHub CI Node 22.23.4 olarak ayarlandı. Yayın/CI sonucu ayrıca doğrulanmalıdır.
