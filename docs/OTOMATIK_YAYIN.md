# GitHub’dan otomatik Vercel yayını

Depo **birlikteiyilik/birlikte-iyilik-ekip** artık **public**. Commit/push hesabı **augrclk**; Vercel hesabı **birlikteiyilikakademi-8992**, takımı **birlikteiyilikakademi-8992s-projects**. Canlı adres **https://ekip.birlikteiyilik.com**. Ana web sitesinin deposu bu akıştan bağımsızdır.

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
