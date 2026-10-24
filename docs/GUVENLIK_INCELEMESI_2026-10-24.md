# Güvenlik incelemesi — 24 Ekim 2026

## Kapsam ve sonuç

`birlikteiyilik/birlikte-iyilik-ekip` kaynak kodu, kilit dosyasındaki paketler, Node.js güvenlik duyurusu, kimlik/rol denetimi, dosya/yedek erişimi ve canlı adresin anonim HTTP davranışı incelendi. Bu çalışma kapsamlı bir sızma testi veya sağlayıcı altyapısı denetimi değildir. Gerçek ekip kayıtlarına test verisi eklenmedi ve canlı kayıt silinmedi.

İlk `pnpm audit --json` sonucunda **18 bildirim: 7 yüksek, 8 orta, 3 düşük, 0 kritik** vardı. İlk güncellemede kalan iki orta bildirim de hedefli yamalarla giderildi. Son `pnpm audit --json`: **754 bağımlılık, 0 kritik / yüksek / orta / düşük açık**. Bu sonuç tarama anındaki bilinen paket bildirimleriyle sınırlıdır. Bunlar paket bildirimleridir; 18 ayrı istismar edilebilir uygulama açığı anlamına gelmez.

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
| Sürekli kontrol | Push/PR test işine `pnpm security:audit` eklendi; her seviyedeki güvenlik bildirimi işi başarısız yapar |

Yamalar, özellikle hatalı sıkıştırma yanıtıyla süreç çökmesine yol açabilen Undici bildirimini ve sınırsız doğrulama kaynak kullanımına ilişkin Zod bildirimini giderir. Uygulamada kullanıcı tarafından seçilen URL'lere sunucu taraflı fetch veya EventSource yapılmıyor; paket eşleşmesi tek başına saldırı yolunun erişilebilir olduğunu kanıtlamaz.

Kaynaklar: [Undici GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c), [Zod GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [gRPC GHSA-m9gg-hp2v-232j](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [Firebase sürümü](https://github.com/firebase/firebase-js-sdk/releases/tag/firebase%4013.1.0), [Blob değişiklikleri](https://github.com/vercel/storage/blob/main/packages/blob/CHANGELOG.md).

## Son iki bildirimin giderilmesi

| Paket | Düzeltme ve uyumluluk kanıtı |
| --- | --- |
| `uuid@9.0.1` → `11.1.1` | `<11.1.1` için hedefli override. CommonJS desteği korunan yamalı seri seçildi; Gaxios yüklemesi, v4 üretimi ve v5 taşan buffer reddi test edildi. |
| `@opentelemetry/core@1.30.1` → `2.8.0` | Yalnız `@google-cloud/pubsub` alt bağımlılığı değiştirildi. Pub/Sub kaynak kodunda kullanılan tek core API'si `W3CTraceContextPropagator`; trace inject/extract, büyük Baggage reddi ve Pub/Sub nesnesinin açılması test edildi. |

Kaynaklar: [uuid bildirimi](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [11.1.1 yaması](https://github.com/uuidjs/uuid/releases/tag/v11.1.1), [OpenTelemetry bildirimi](https://github.com/advisories/GHSA-8988-4f7v-96qf), [OpenTelemetry 2.x geçiş notları](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md).

Bildirim istisnası veya bastırma kullanılmadı. `tests/dependency-compat.test.cjs` üst paketlerin kullandığı API'leri doğrular. Firebase Auth emülatörünün açılıp API testlerini bitirmesi ayrıca doğrulandı. Üst paketler bu yamaları kendileri içerdiğinde hedefli override'lar kaldırılabilir. Bu, Firebase CLI'ın kullanılmayan her özelliğinin tam entegrasyon testi değildir.

## Kod ve erişim kontrolleri

- Firebase JWT doğrulaması RS256, sabit Google JWKS adresi, issuer, audience, süre, UID ve doğrulanmış e-posta kontrolü yapıyor. Sahte imza, yanlış proje, süresi geçmiş token ve `alg:none` testleri geçti.
- İşlemler aktif uygulama üyeliğini ve proje rolünü sunucuda kontrol ediyor. Rol değiştirme/yöneticiye yükselme profil formuyla yapılamıyor. Üyelik kaldırıldığında dosya ve kayıt erişimi reddediliyor.
- Günlük işler sorumlusu ve kurum yöneticileriyle sınırlı. Yeni günlük işi başkasına yalnız kurum yöneticisi atayabilir. Bir üye kendi günlük işini aktif ekip üyesine devredebilir; yalnız seçilen işin dalı ve ilgili kayıtlar taşınır, iki tarafın diğer işleri açılmaz. Yönetici proje dışındaki aktif kişiye doğrudan atama yapabilir; proje düzenleme erişimi atomik olarak açılır. Sıradan düzenleyicinin bu yolla proje erişimini genişletmesi ve iptal edilmiş erişimin ilgisiz bir düzenlemeyle yeniden açılması testlerle engellenir.
- SQL sorgularındaki veri ve alan değerleri parametreli. Ortak belge değişikliklerinde prototype alanları engelleniyor; içerik sınırı, çakışma ve şema doğrulaması var.
- Dosyalar özel Blob alanında. Yükleme rezervasyonunda rol, içerik türü, boyut, toplam kota ve kısa süreli imza; indirmede yeniden üyelik kontrolü var. Dosya indirme `attachment` ve `nosniff` ile yapılıyor.
- Yedek dışa aktarımı yönetici rolüyle; bakım GitHub OIDC imzası, depo kimliği, dal ve iş dosyası denetimiyle korunuyor.
- Git'teki mevcut 131 dosyada özel anahtar, GitHub tokenı, kimlik bilgisi içeren PostgreSQL URL'si ve AWS erişim anahtarı desenleri aranıp eşleşme bulunmadı. Bu kontrol tüm Git geçmişi veya sağlayıcıdaki gizli değişkenler için tam secret taraması değildir.
- Canlı `/api/workspace`, `/api/file`, `/api/backup`, `/api/maintenance` anonim isteklere **401** döndü. API yanıtları `private, no-store`; HTTPS/HSTS, `nosniff`, `DENY` ve Referrer-Policy başlıkları doğrulandı.

## Açık sınırlar ve takip

1. **Vercel Node yaması:** Node 22.23.4, 21 Ekim 2026 güvenlik sürümüdür. CI/bakım bu sürüme taşındı. Vercel yapılandırması `22.x` olarak kalır; küçük/yama sürümlerini sağlayıcı yönetir. 24 Ekim tarayıcı kontrolünde şirketin Hobby hesabı, ekip projesi ve Production Override **22.x** doğrulandı. Panelin genel varsayılanı 24.x olsa da package.json nedeniyle canlı 22.x kullanıyor. Panel yama numarasını göstermiyor; bu gözlem tek başına çalışan Function için 22.23.4 kanıtı değildir. Build artık `process.version` değerini yayın günlüğüne yazar; build sürümü ile Function runtime sürümü ayrı kanıtlardır. [Node duyurusu](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), [Vercel sürüm yönetimi](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
2. **İstek sınırı:** Dakikada 90 istek kontrolü işlev örneğinin belleğinde. Sunucusuz örnekler arasında ortak, kesin bir kullanıcı kotası değildir. Yaygın kötüye kullanım için Vercel güvenlik kuralları/kalıcı sayaç ayrıca değerlendirilmeli.
3. **Token iptali:** Uygulamadaki `active=false` erişimi keser. Yalnız Firebase Console'da oturum iptali/hesap kapatma yapılması, yerel JWT doğrulayıcısında merkezi iptal sorgusu yapılmadığından token süresi bitene kadar aynı etkiyi garanti etmez. Ekip erişimini uygulamadan da kapatın.
4. **CSP:** Tam bir script-src CSP politikası henüz yok. İncelenen metin çıktılarında escape uygulanıyor; CSP için Firebase popup, sunum ve blob önizlemelerini kapsayan ayrı tarayıcı doğrulaması gerekir.
5. Google/Firebase/Vercel/Neon hesaplarının MFA ayarları, Firebase parola politikası, veritabanı paneli ve son yedeklerin sağlayıcı üstündeki durumu bu kaynak incelemesinde doğrulanmadı.

## Test kanıtı

Yerel: **146 model/bağımlılık testi + 25 Auth/PostgreSQL API testi**, üretim build'i başarılı. Önceki iş silme/iptal/geri alma tarayıcı kontrolü geçti. Bu turda Chrome üzerinden, yerel ve sentetik ekip verileriyle proje dışındaki Ayşe Yılmaz'a yeni iş atandı; aynı iş ayrıntı ekranındaki **İşi devret** ile Mert Kaya'ya devredildi ve panodaki sorumlunun değiştiği doğrulandı. Günlük işin devir penceresi açılıp kapsam açıklaması kontrol edildi; günlük iş devrinin son onayı/yeniden denemesi ve mobil görünüm bu tarayıcı turunda tamamlanmadı.

Günlük iş devri, dosya erişimi, atomiklik, yetki sınırları, eski sürüm ve tekrarlanan istekler gerçek workspace servisi, Auth emülatörü ve PostgreSQL adaptörü üzerinden API testleriyle doğrulandı. API testleri yalnız `demo-birlikte-iyilik` Auth emülatörü ve bellek içi PGlite veritabanıyla çalıştı. Yerel runtime Node 24.19.0; GitHub CI Node 22.23.4.

Uygulama değişikliklerini içeren `a2b241b43da32e6d6e67fe7f2359b54949698875` için [GitHub CI başarılı](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/40077832243) ve [birlikteiyilik hesabındaki Vercel üretim yayını hazır](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/BNkVHx5NNHJ3vXmb5Rj3nz2P2sM3). Canlı `hub.js`, `team.js`, `app.js` ve `project-setup.js` dosyalarının SHA-256 değerleri gönderilen kaynaklarla birebir eşleşti. Commit ve push hesabı `augrclk`; canlı adres `ekip.birlikteiyilik.com` olarak korundu.
