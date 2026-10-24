# İş silme

24 Ekim 2026

- **Pano / İşlerim / Özet:** İşin adına tıklayın, ayrıntılardaki **İşi sil** düğmesini kullanın.
- **Proje içinde:** İşin adına tıklayın; yan panelin altındaki **İşi sil** düğmesini kullanın. Diğer kart türlerinde adı **Kartı sil** olur.
- Onayı iptal etmek hiçbir kayıt değiştirmez. Silmeden sonra bildirimin **Geri al** düğmesi 10 saniye görünür. Proje yöneticileri ayrıca sürüm geçmişini kullanabilir.
- Kontrol listesi adımı tek başına silinebilir. Bir görevin altında kartlar/adımlar varsa, onay metni bunların da kaldırılacağını açıklar. Projenin kök kartı silinemez.
- Projede düzenleme yetkisi gerekir; günlük işlerde yalnız sorumlusu ve kurum yöneticileri işlem yapabilir. Arşivlenmiş projeler değiştirilemez.
- Başka görevlerin ön koşulu olan bir iş silinemez; önce bu bağımlılıklar düzenlenmelidir.
- Silme, mevcut `changes` API'sini, alan bazlı çakışma denetimini ve sürüm yedeklerini kullanır. Yeni bir kalıcı silme API'si yoktur. Ağ yanıtı kaybolursa aynı işlem kimliğiyle yeniden denenir.
- Silinen işin yorum/dosya/sürüm kayıtları bu işlemle fiziksel olarak silinmez; geri alma ve geçmiş için mevcut kapsamlarında korunur. Bu özellik kişisel verileri tüm yedeklerden kalıcı temizleme işlemi değildir.

Doğrulama: yetkili/yetkisiz silme, eşzamanlı değişiklik, bağlı kartlar, çapraz ilişkiler, kontrol adımı, günlük iş, yinelenen istek, bağımlılık engeli ve geri alma API testleri; masaüstü ve 390 px mobil tarayıcı kontrolü.
