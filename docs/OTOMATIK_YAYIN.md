# Şirket hesabına otomatik yayın

Commit/push hesabı **augrclk**, depo **birlikteiyilik/birlikte-iyilik-ekip** (özel), yayın hesabı **birlikteiyilikakademi-8992**, Vercel takımı **birlikteiyilikakademi-8992s-projects**. Canlı adres **https://ekip.birlikteiyilik.com**. Ana web sitesi deposu bu akışa dahil değildir. Ücretli plan, yeni veritabanı, IAM veya ek barındırma servisi açılmaz.

Vercel’in yerleşik Git yayınında özel depo commit yazarı ile Hobby sahibi eşleşmediği için yayın engelleniyordu. Commit yazarı veya repo görünürlüğü değiştirilmez. Vercel’in standart CLI yayın yolunu, GitHub testlerinin ardından şirket hesabıyla çalıştırırız.

## Bir defalık anahtar kurulumu

1. **Şirket** Vercel hesabında [Tokens](https://vercel.com/account/tokens) ekranından yalnız şirket takımına erişen bir yayın tokenı oluşturun. augrclk Vercel tokenı kullanmayın. Süresini belirleyin; dolmadan yenileyin.
2. Depo sahibi, [Actions secrets](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/settings/secrets/actions) içinde **VERCEL_TOKEN** adlı repository secret oluşturur. Değeri yalnız bu alana girin. Sohbet, kaynak kodu, log veya mimari belgeye koymayın. Mevcut yerel CLI oturumunu CI’a kopyalamayın.
3. [Actions](https://github.com/birlikteiyilik/birlikte-iyilik-ekip/actions) içinde **Ekip testleri** işini `main` için çalıştırın. Test ve yayın işlerinin ikisi de başarılı olmalıdır. Canlı Vercel yayınının READY/Production, takım/proje kimliğinin doğru ve sourceCommit’in test edilen SHA olduğuna bakın.

İlk kurulumda workflow depoda hazırdır; anahtar eklenmeden yayın işi açık bir hatayla durur. Bu durum otomatik yayının kurulmuş olduğunu göstermez. augrclk mevcut özel depoda kaynak yazabilir; anahtar kurulumunu depo sahibi yapar.

## Çalışma şekli

`.github/workflows/tests.yml` model, Auth/PGlite API ve üretim build testlerini çalıştırır. **deploy** işi bu işe `needs: verify` ile bağlıdır; PR, fork veya başka depo/dal yayın yapamaz. Yalnız `main` push/manual çalıştırması kabul edilir. Yeni commit önceki CI işini iptal eder; aynı anda eski bir yayın tamamlanmaya çalışmaz.

`scripts/deploy-production.mjs` tam test edilen SHA’dan `git archive` alır. `.git`, `.env*`, `.vercel`, node_modules veya private key dosyaları kaynak arşivine taşınmaz; yanlışlıkla izlenen özel/yerel dosya bulunursa durur. Geçici klasör CI artifact olarak paylaşılmaz, iş sonunda silinir. GitHub’daki commit yazarı ve geçmişi olduğu gibi kalır.

Vercel hedefleri kodda açıkça sabittir:

- Proje: `prj_UYc23eeMDrVhlPLZ0gSAbKRB2Ywx` / `birlikte-iyilik-ekip`
- Takım: `team_0xhbl5nKwdqDc7EeaJBnQK8V`
- Hesap: `birlikteiyilikakademi-8992`

Script yanlış Vercel hesabı için durur. Token yalnız yayın adımında ortam değişkenidir; komut satırına `--token` olarak geçmez. `.vercel/project.json` geçici kaynak içine açık proje/takım kimlikleriyle yazılır; otomatik link/proje oluşturma yapılmaz. `sourceCommit` metadata’sı kaynak SHA’sını taşır. Şirket projesinin mevcut build ayarları, Firebase Auth, Neon ve Blob ortamı kullanılır; anahtarlar CI’dan istemciye taşınmaz.

## Doğrulama ve geri alma

İlk başarılı otomatik yayında GitHub run URL’si, kaynak SHA ve Vercel READY kimliği DOĞRULAMA.md’ye kaydedilir. Yerleşik Git bağlantısı aynı commit için hâlâ engelli kontrol üretiyorsa, başarılı CI yayını doğrulandıktan sonra bu yinelenen Git yayın tetikleyicisi kapatılır; CLI/CI yolu açık kalır. Bu aşama doğrulanmadan Git bağlantısını kesmeyin.

Anahtar yok/yanlış/süresi dolmuşsa yayın durur; önceki canlı sürüm açık kalır. Şirket anahtarını Secrets içinde yenileyip başarısız yayın işini yeniden çalıştırın. Test hatasında önce kaynağı düzeltin. Vercel panelinden önceki READY üretim yayınına dönülebilir; geri alma sonrası yeni otomatik yayını tekrar doğrulayın.

Kaynak hazırlamasını kimlik bilgisi olmadan kontrol etmek için Git checkout’u içinde `node scripts/deploy-production.mjs --prepare-only` kullanılır. Bu kontrol Vercel’e yayın yapmaz ve CI’nın gerçekten yayınlandığının kanıtı değildir.

Resmî kaynaklar: [GitHub Actions ile Vercel](https://vercel.com/docs/git/vercel-for-github#using-github-actions), [CLI deploy](https://vercel.com/docs/cli/deploy), [Git işbirliği sınırları](https://vercel.com/docs/deployments/troubleshoot-project-collaboration).
