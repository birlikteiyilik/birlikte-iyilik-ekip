# Birlikte İyilik · Ekip

Birlikte İyilik ekibinin projelerini, görevlerini, organizasyonunu ve toplantılarını ortak bir yerde takip ettiği Türkçe **web sitesi**. Petrol tonlarında menü, açık taş grisi yüzeyler ve durumları anlatan renkler kullanır. Sağlanan orijinal logolar ve hareket azaltma tercihine uyumlu animasyonlar korunur.

**Adres:** [ekip.birlikteiyilik.com](https://ekip.birlikteiyilik.com)

**Depo:** `birlikteiyilik/birlikte-iyilik-ekip`

**Commit/push hesabı:** `augrclk`

**Vercel sahibi:** birlikteiyilik hesabının `birlikteiyilikakademi-8992s-projects` takımı.

Ana sitenin `birlikteiyilik/birlikteiyilik.com` deposundan bağımsız yayınlanır.

## Projeyi devralacak geliştirici

- [MIMARI.md](MIMARI.md): servis görevleri, kod haritası, veri modeli, yetkiler, kayıt akışı, ücretsiz kota önlemleri, yedekleme, kurulum ve işletim.
- [DOĞRULAMA.md](DO%C4%9ERULAMA.md): geçen testler, yapılan canlı kontroller ve kalan adımlar.
- [Ürün karşılaştırması](docs/URUN_KARSILASTIRMA.md): incelenen benzer ürünler, uygulanan arayüz kararları ve sonraki öneriler.
- `server/workspace.cjs`: ortak iş kuralları; `server/database.cjs`: PostgreSQL işlemleri; `firebase/client.js`: giriş ve API istemcisi.

## Özellikler

- E-posta/parola veya Google ile giriş; e-posta doğrulama, davet ve parola yenileme.
- Çalışma yöneticisi, düzenleyici, yorumcu ve görüntüleyici rolleri; ekip hesabını pasifleştirme.
- Bugün, Görevlerim, liste/pano, ekip ve organizasyon ekranları; sorumlu, tarih, öncelik ve kontrol listeleri.
- Eşzamanlı değişiklik denetimi, güvenli yeniden deneme, sıkıştırılmış sürüm geçmişi ve yönetici geri yüklemesi.
- Görev bağımlılığı, döngü kontrolü, bağlı işler bitmeden tamamlama engeli ve günlük/haftalık/aylık tekrar.
- Özel dosyalar, 10 MB sınırı; yorumlar, bahsetmeler ve uygulama içi bildirimler.
- Toplantı gündemi, katılımcılar, tutanak, göreve bağlı kararlar ve `.ics` indirme.
- Haftalık rapor ve CSV; kayıt yedeği ve dosyalarla tam ZIP indirme; günlük bakım/yedek kodu.
- 11 önizlemeli hazır şablon; dairesel, piramit, matris, yatay, makro/mikro ve klasik yapılar; altı düzenlenebilir yerleşim.
- Proje yüzdesi, yapılan/toplam işler, sorumlu isimleri ve kişi bazında iş dağılımı; kısa ilerleme animasyonu ve yerel Manrope fontu.
- Proje verisinden 3–6 sade slayt hazırlayan ücretsiz web sunumu; kişi isimlerini gizleme, klavye ve tam ekran düğmesi.
- Mobil tarayıcıya uyumlu ekranlar ve erişilebilir hareketler.
- Bölümlere götüren kullanım rehberi; yönetici için bir organizasyon, üç proje, sekiz temsili kişi, 19 görev ve üç toplantıdan oluşan düzenlenebilir örnek seti. Örnek kişiler giriş hesabı değildir; set sonradan arşivlenebilir.

## Son mimari

| Servis | Görevi |
| --- | --- |
| Firebase Auth / Spark | Giriş ve kimlik doğrulama |
| Vercel CDN + Node.js Functions / Hobby | Web sitesi, yetki denetimi ve API |
| Vercel Marketplace Neon / Free | Ekip profilleri ve tüm ortak kayıtlar |
| Vercel Private Blob | Dosyalar ve sıkıştırılmış günlük yedekler |
| GitHub | Kaynak, dokümantasyon, testler ve kısa ömürlü kimlikle günlük bakım |

Üretimde Firestore, Firebase Storage ve Firebase Cloud Functions kullanılmaz. Blaze, hizmet hesabı özel anahtarı veya Google Cloud IAM kurulumu gerekmez. Korunan Firebase emülatör dosyaları eski yerel test akışı içindir; üretime yayınlamayın.

## Geliştirme

Node.js 22 ve pnpm:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm test:api
pnpm build
pnpm preview
```

`test:api`, yalnız yerel Firebase Auth emülatörü ve PGlite PostgreSQL motoruyla çalışır; canlı kullanıcı/kayıt oluşturmaz. `preview`, `http://localhost:5173` üzerinde statik ekranları sunar; Vercel API yerine geçmez. Eski tam tarayıcı emülatörü [MIMARI.md](MIMARI.md#yerel-geliştirme-ve-test) içinde açıklanır.

Hobby planı özel depoda `augrclk` yazarlı doğal Git yayınını engellediği için şirket sahibi hesabıyla CLI yayını yapıldı; güncel yayın kanıtı doğrulama dosyasındadır. GitHub push → otomatik Production yayını henüz kurulmuş değildir. GitHub test ve günlük bakım akışları kalıcı token istemez. Günlük bakım GitHub OIDC kimliğiyle yetkilendirilir; `CRON_SECRET` eklemek gerekmez. Ortam değişkenleri ve işletim mimari belgesindedir. Ücretsiz kapasite sınırsız değildir; kayıt toplama, sıkıştırma ve dosya/yedek bütçelerine rağmen sağlayıcı kotaları izlenmelidir.

Temel kaynak lisansı [LICENSE.txt](LICENSE.txt) içinde korunmuştur. Kurum logoları kullanıcı tarafından bu proje için sağlanmıştır.


Organizasyon şemasındaki kartlar da kendi işlerini ve alt dallarındaki işleri otomatik toplar: yüzde ve tamamlanan/toplam çubuğu kartta, ayrıntı panelinde, tabloda ve görsel dışa aktarmada görünür. Görev tamamlandığında üst birimlerin oranı güncellenir. İşsiz yapılarda Henüz iş yok yazılır. Hesap yöntemi [MIMARI.md](MIMARI.md) içinde açıklanır.
