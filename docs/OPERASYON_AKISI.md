# İş ve operasyon takibi

## Günlük akış

1. **Çalışmalar** açılınca son projeniz gelir. Üstteki proje adından başka bir projeye geçebilirsiniz.
2. **Ağaç** görünümünde soldan bir iş veya başlık seçin. Ayrıntıları hemen sağda açılır.
3. Sorumluyu, durumu ve son tarihi aynı yerde değiştirin. Değişiklikler otomatik kaydedilir; üstteki kayıt durumu sonucu gösterir.
4. Alt iş eklemek için **Alt işler** satırına başlığı yazıp **Ekle** düğmesine basın. İşleri gruplamak için türü **Başlık** seçin.
5. Bitirdiğiniz işin kutusunu işaretleyin veya durumunu **Tamamlandı** yapın. Üst başlığın ve projenin yüzdesi birlikte güncellenir.

Telefon ekranında işe tıklanınca ayrıntı açılır; **İşlere dön** ile listeye dönülür. Masaüstünde ikisi yan yanadır.

## Görünümler

Yedi sekme doğrudan görünür. Telefonda sekme çubuğu yatay kaydırılır. Görünüm değişince sekmelerin sırası ve yüksekliği değişmez.

| Görünüm | Ne için? |
| --- | --- |
| Ağaç | Proje, başlık ve alt işlerin bağlılığı; yanında seçilen işin ayrıntısı. |
| İş planı | Tarih sıralı işler, sorumlular ve tamamlandı kutuları. |
| Pano | Yapılacak, Devam ediyor, Beklemede, Tamamlandı sütunları. |
| Zaman çizelgesi | İki haftalık son teslim günleri. Tarihsiz işler ayrıca görünür. |
| Takvim | Ayı görmek, gün seçmek ve o güne iş eklemek. |
| Harita | Mevcut organizasyon, dairesel, piramit ve diğer şema yerleşimleri. |
| Tablo | Şemadaki bütün kartları satırlar halinde karşılaştırmak. |

Ağaç araması eşleşen kartın üst başlıklarını da gösterir. İş listelerinin sorumlu/durum filtreleri görünen işleri daraltır; toplam ilerleme paydasını değiştirmez. Küçük kontrol adımları Yapılacak/Tamamlandı, görev kartları dört durum kullanır. Saatli ardıl iş süresi (A bitince B iki saat içinde) bu sürümde yoktur.

## Diğer bölümler

- **İşlerim:** Kişisel işler; ekip ve proje filtreleri.
- **Genel bakış:** Projelerin ilerlemesi, açık ve geciken işler.
- **Ekip:** Ekip üyeleri. Hesap düğmesi profil ve fotoğraf ayarlarını açar.
- **Üstteki üç nokta:** Bütün projeler, organizasyon, toplantılar, rapor, güncellemeler ve rehber.
- **Hazır şemalar:** Proje üst çubuğundan veya Bütün projeler ekranından açılır. Mevcut projeye dokunmadan yeni çalışma başlatır.
- **Seçenekler:** Şema yerleşimleri, sunum, geçmiş ve dışa aktarma.

## Teknik sınırlar

Bütün görünümler aynı proje kaydını kullanır. Yeni veritabanı, ücretli servis veya ek sürekli sorgu yoktur. Firebase Auth, Vercel API, Neon ve Blob görevleri değişmemiştir. Mevcut yetki, sürüm ve çakışma denetimleri geçerlidir.

Referans sistemin alışılmış iş akışından yararlanılmıştır; kaynak kodu, hesapları ve veritabanı taşınmamıştır. Devam/mesai, dış görev ve alışveriş modülleri bulunmaz. Dolu önizleme yerel kurmaca kayıtlarla çalışır; gerçek ekip kayıtlarını değiştirmez.
