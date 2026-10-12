# GitHub’dan otomatik Vercel yayını

Depo **birlikteiyilik/birlikte-iyilik-ekip** artık **public**. Commit/push hesabı **augrclk**; Vercel hesabı **birlikteiyilikakademi-8992**, takımı **birlikteiyilikakademi-8992s-projects**. Canlı adres **https://ekip.birlikteiyilik.com**. Ana web sitesinin deposu bu akıştan bağımsızdır.

## Güncel durum — otomatik yayın yeniden doğrulandı

12 Ekim 2026: Git bağlantısı yeniden kurulduktan sonraki `950e7867b16384a07f99da73cc5ce7a8495c6a2a` **augrclk** push'u, [dpl_FGcySXmWHL6jwiaY63t4hFTyz3fy](https://vercel.com/birlikteiyilikakademi-8992s-projects/birlikte-iyilik-ekip/FGcySXmWHL6jwiaY63t4hFTyz3fy) sonucunu üretti: **source=git, READY, Production**, aynı SHA ve **ekip.birlikteiyilik.com** alias. Build **45 saniye** sürdü. Güncel push → şirket Vercel → canlı akışı yeniden başarılıdır.

Öncesindeki `8b24cd6` ve `4d4c9b6` Git yayınları build başlamadan `git_info_fail` vermişti; yeniden bağlantının ilk push'u da hata verdi. Bu başarısızlıklar tarihsel kayıttır, kök neden kesin olarak tespit edilmedi. Profil ve iş planı kodu önce şirket CLI dosya yayını `dpl_HPBV3GgfVACA3FuCSULsRCNpCriQ` ile canlıya alındı; sonraki başarılı Git yayını aynı uygulama kaynaklarını kullandı.

Uygulama kaynak `4d4c9b689cd2af56fd085aaba6ebef0309f2ca50` için [CI 38255154928](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions/runs/38255154928) **117 model + 13 API** testi ve build ile başarılıdır. `950e786` yalnız belge güncellemesidir; `[skip ci]` ile gereksiz test tekrarı önlendi. Yeni kod push'ları test ve yerleşik Git yayını çalıştırır.

Yeni token, deploy hook veya ücretli plana geçiş yapılmadı. Her yayın için Git SHA, READY/Production ve alias doğrulamasını sürdürün.

## Yayın akışı

1. augrclk ile `main` dalına commit/push yapılır.
2. Mevcut Vercel GitHub bağlantısı bu commit için Production build başlatır ve başarılı olduğunda alt alanı yeni sürüme atar.
3. GitHub’da **Ekip testleri** model, Auth/PostgreSQL API ve build kontrollerini ayrıca çalıştırır. GitHub doğrulaması ile Vercel build’i ayrı kontrollerdir; Actions işi Vercel yayınının önünde bir onay kapısı değildir.
4. Commitin Vercel kontrolü, READY/Production durumu ve kaynak SHA’sı kontrol edilir. İlk gerçek otomatik yayın kanıtı **DOĞRULAMA.md** içinde tutulur.

Yayın için Actions içinde VERCEL_TOKEN, ek bir deploy hook, özel CLI yayın scripti veya ücretli plan kullanılmaz. `.github/workflows/tests.yml` yalnız test işidir. Günlük yedek/bakım işi ayrı kalır; kısa ömürlü GitHub OIDC kimliği kullanır ve CRON_SECRET istemez.

## Hedefler ve özel veriler

- Proje: `birlikte-iyilik-ekip` / `prj_UYc23eeMDrVhlPLZ0gSAbKRB2Ywx`
- Takım: `team_0xhbl5nKwdqDc7EeaJBnQK8V`
- Üretim dalı: `main`
- Üretim adresi: `https://ekip.birlikteiyilik.com`

Public olan yalnız kaynak depodur. Firebase giriş, API’de üyelik/rol denetimi, Neon kayıtları ve özel Blob dosyaları korunur. Veritabanı parolaları ve sunucu anahtarları Vercel ortamında kalır. `.env*`, `.vercel`, kimlik bilgisi dosyaları ve gerçek ekip yedeklerini Git’e eklemeyin. Public kaynak kodu son kullanıcıya kayıt okuma/yazma yetkisi vermez.

## Sorun giderme

GitHub’daki Vercel kontrolünü ve şirket projesinin build logunu inceleyin. Başarısız build önceki canlı sürümü değiştirmez. Yanlış depo/dal bağlantısı varsa yalnız bu projenin Git ayarını düzeltin; ana siteyi başka projeye bağlamayın. Geri almak için Vercel’de önceki READY Production yayını kullanılır; sonraki push’un otomatik alan adı atamasını tekrar doğrulayın.

Özel depoya yeniden geçmek Hobby planındaki commit yazarı/hesap sahibi engelini geri getirebilir. Bu durumda görünürlük değişmeden önce yayın yöntemi yeniden kararlaştırılmalıdır. Resmî açıklama: [Hobby işbirliği kuralı](https://vercel.com/docs/deployments/troubleshoot-project-collaboration#hobby-teams), [GitHub bağlantısı](https://vercel.com/docs/git/vercel-for-github).

## İlk başarılı otomatik yayın

12 Ekim 2026: `fce3e515d6a139cd6ea742a5ced8527eeb47c69a` augrclk commit/push’u, şirket Vercel projesinde `dpl_M3Gn73rpSZWuSHYaA6r2pk5AgDm8` **READY / Production** sonucunu üretti. Vercel `source=git` ve aynı Git SHA’sını gösterdi; `ekip.birlikteiyilik.com` alias’ı atandı. GitHub CI 38243291593: 107 model + 12 API, sıfır hata ve build başarılı. Otomatik yayın doğrulandı.
