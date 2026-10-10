# Doğrulama · 10 Ekim 2026

## Otomatik kontroller

Node.js 22.23.3 ile model testleri: **75 geçti, 0 hata**. Hiyerarşi ve yerleşim, ortak değişiklik birleştirme, kontrollü geri alma, tarih filtreleri, veri kesilmesini engelleyen aktarım, ay sonu tekrar, bağımlılık döngüleri, takvim metin kaçışları ve rapor tarihleri kapsanır.

Yerel Firebase emülatörlerinde entegrasyon testleri: **14 geçti, 0 hata**. Auth, Functions, Firestore ve Storage gerçek emülatörleri kullanıldı. Yetkisiz/doğrulanmamış hesap, doğrudan veritabanı erişimi ve yetki yükseltme engelleri; proje rolleri; eşzamanlı kayıt ve yeniden deneme; bağımlılık ve tamamlama; bahsetme/bildirim gizliliği; toplantı; dosya kuralları; davet; ayar çakışması; sürüm geri yükleme; zamanlanmış tekrar ve okunmuş hatırlatmanın korunması; arşiv ve pasif hesap kontrol edildi.

## Chrome kontrolleri

- Yerel Firebase hesabıyla giriş yapıldı ve ortak görevler görüntülendi.
- Kırmızı/beyaz giriş ve panelde sağlanan orijinal logolar görüntülendi.
- Toplantı tutanağı ve göreve bağlı karar kaydedildi; sayfa yenilendiğinde kayıt korundu.
- Haftalık tekrar ve görev bağımlılığı kaydedildi; raporda bağımlılık bekleyen görev gösterildi.
- 390×844 mobil görünümde menü ve haftalık rapor çalıştı; sayfa genişliği 390 px, yatay taşma yoktu.
- Chrome dosya erişim izni açıldıktan sonra görev kartına TXT dosyası yüklendi ve ekler listesinde görüntülendi ve indirilen dosyanın içeriği aslıyla karşılaştırıldı. Dosya erişim kuralları ayrıca SDK entegrasyon testinde doğrulandı.

## Bekleyen canlı kontroller

Firebase Blaze geçişi, Storage bucket kurulumu, Functions/Hosting yayını ve canlı hesaplarla uçtan uca kontrol yapılmadı. Üretim verisi oluşturulmadı. Örnek hesaplar ve kontrol kayıtları yalnız yerel emülatörlerdedir.
