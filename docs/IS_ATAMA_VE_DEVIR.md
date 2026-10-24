# İş atama ve devir

## Yeni işi birine vermek

1. **Pano → Yeni iş** düğmesine basın.
2. İşin adını yazın. Bir proje seçin veya **Günlük işler · Projesiz** olarak bırakın.
3. **Sorumlu** listesinden kişiyi ve son tarihi seçin; **İşi ekle** ile kaydedin.

Kurum yöneticisi günlük işleri herhangi bir aktif ekip üyesine verebilir. Projede kurum yöneticisi veya proje yöneticisi, önce kişiyi projeye eklemeden aktif ekip üyelerinden sorumlu seçebilir. İş, kişinin **İşlerim** ekranında görünür. Yeni sorumlu projedeki bütün işleri düzenleyebilir; bu kapsam formda belirtilir. Daveti henüz kabul etmemiş veya erişimi kapalı hesaplar seçilemez.

Şema, ağaç, iş planı ve yeni proje hazırlama ekranlarında da aynı sorumlu listesi kullanılır. Normal düzenleyiciler yeni proje erişimi açamaz; mevcut proje üyelerinden seçim yapar. Gerekli gelişmiş erişim ayarları **Şema → Seçenekler → Proje erişimleri** altında kalır.

## Mevcut işi devretmek

**İşi aç → İşi devret → Yeni sorumlu → Devri tamamla.**

- **Proje işi:** Sorumlu değişir; işin tarihi, açıklaması, adımları, dosyaları ve geçmişi korunur. Önceki kişinin proje erişimi otomatik kaldırılmaz; başka görevleri de olabilir. Proje içindeki alt adımların farklı sorumluları korunur. Tek bir alt iş de kendi ayrıntısından devredilebilir. Sorumlu alanını değiştirip kaydetmek de aynı atama işlevini görür.
- **Günlük iş:** Kurum yöneticisi veya işin mevcut sorumlusu devredebilir. İş ve bağlı alt kartları; adımları, yorumları, dosyaları, tekrar/bağımlılık ayarlarıyla yeni kişinin özel listesine geçer. Diğer günlük işler paylaşılmaz. Alt adımlar ana işle birlikte devredilir.
- Başka bir günlük işe veya toplantıya bağlı işler için önce dış bağlantı kaldırılmalıdır; bağlantı sessizce koparılmaz. Devam eden dosya yüklemesi varsa tamamlanması beklenir.
- Kayıt sırasında bağlantı kesilirse **Devri tamamla** düğmesine tekrar basın. Aynı işlem kimliği kullanılır; ikinci bir iş oluşmaz.
- Devirden vazgeçmek için kaydetmeden **Vazgeç** kullanın. Tamamlanmış günlük işi geri vermek gerekiyorsa yeni sorumludan eski sorumluya yeniden devredin.

## Teknik bakım notları

- Proje atamaları `/boards/:id/changes` üzerinden gerçekleşir. Aktif kişi kontrolü, değişiklik, üyelik ve snapshot aynı transaction içindedir.
- `/boards/:id/transfer` yalnız günlük işler içindir; `operationId`, `nodeId`, `ownerId`, `expectedRevision` gerekir. Beklenen sürüm, aktif hesap, yetki, dış bağlantılar ve dosya yüklemeleri doğrulanmadan yazılmaz.
- İki günlük belgenin sürümü birlikte artar. İlgili metadata taşınır, iki tarafta işlem kaydı tutulur, yeni sorumluya uygulama içi bildirim bırakılır. Eski bildirimlerin geçersiz bağlantıları kaldırılır.
- Dosyanın özel Blob yolu sabit kalır; metadata yalnız yeni listede bulunur. İndirme API'si yeni listenin erişimini kontrol eder; quota iki kez sayılmaz.
- Günlük yedek bütün projeleri tek tutarlı veritabanı anlık görüntüsünden okur; eşzamanlı bir devir iki listeye birden yazılmış gibi yedeklenmez. `transferred` kayıtları yedeğe dahildir.
- `transferred` kayıtları devredilmiş düğümün eski listeye snapshot/undo ile kopyalanmasını engeller. Geri devir bu işareti hedef listeden kaldırır.
- Test verileri yalnız emülatör/bellek içi PostgreSQL ortamındadır; gerçek ekibe sentetik kullanıcı, iş veya bildirim eklenmez.
