# VİTRİN — Sistem Rehberi

## Vitrin Nedir?

Vitrin, Türkiye'nin ilk **URL katkı kazanç platformudur**. Kullanıcılar internetten beğendikleri ürünlerin linklerini paylaşarak kişisel bir vitrin sayfası oluşturur. Bu vitrin sayfası, sosyal medya biyografinize koyabileceğiniz bir "alışveriş linki" gibi çalışır — tıpkı Linktree gibi, ama alışveriş odaklı.

Vitrin'de aktif olan kullanıcılar, platformun aylık gelir havuzundan pay alır. Ne kadar aktifseniz, ne kadar çok tıklama alırsanız, o kadar çok kazanırsınız.

---

## Nasıl Çalışır? (Genel Bakış)

```
1. Kayıt ol (email veya telefon)
2. Ürün URL'si ekle (Trendyol, Amazon, N11 vb.)
3. Kişisel vitrin sayfan oluşur → vitrin.app/senin-kullaniciadin
4. Vitrin linkini sosyal medyada paylaş
5. İnsanlar linkine tıklayıp ürünlere bakar
6. Tıklamalar ve aktiviteler sana puan kazandırır
7. Ay sonunda sıralaman belirlenir
8. Sıralamana göre aylık gelir havuzundan payını alırsın
```

---

## 1. Kayıt ve Hesap Oluşturma

### Kayıt Yöntemleri
- **Email ile kayıt:** Email, şifre ve görünen ad girerek kayıt olunur. Ardından email adresine gelen 6 haneli OTP kodu ile doğrulama yapılır.
- **Telefon ile kayıt:** Telefon numarası ve şifre ile kayıt olunur. Aynı şekilde doğrulama gerekir.

### Giriş
- Email + şifre veya telefon + şifre ile giriş yapılır.
- Giriş yaptığınızda **JWT token** verilir (15 dakika geçerli).
- Token süresi dolduğunda otomatik yenilenir (refresh token — 7 gün geçerli).

---

## 2. Ürün Ekleme ve Vitrin Sayfası

### Ürün Ekleme
1. Herhangi bir e-ticaret sitesinden (Trendyol, Amazon, N11, Hepsiburada vb.) ürün URL'sini kopyalayın.
2. Vitrin uygulamasında "URL Ekle" butonuna tıklayın.
3. Sistem otomatik olarak ürün bilgilerini çeker: isim, marka, fiyat, resim, mağaza adı.
4. Onayladığınızda ürün vitrininize eklenir.

### Vitrin Sayfası
Her kullanıcının benzersiz bir vitrin sayfası vardır:
```
vitrin.app/kullaniciadi
```
Bu sayfada eklediğiniz tüm ürünler görünür. Bu linki sosyal medya biyografinize (Instagram, TikTok, Twitter vb.) koyabilirsiniz.

### Koleksiyonlar
Ürünlerinizi tematik koleksiyonlara ayırabilirsiniz:
- "Yaz Gardırobu"
- "Teknoloji Favori"
- "Ev Dekorasyon"

Koleksiyon oluşturmak size **20 puan** kazandırır.

---

## 3. Puan Sistemi (Detaylı)

Vitrin'de sıralamanız **toplam puanınıza** göre belirlenir. Toplam puan iki ana kaynaktan oluşur:

```
TOPLAM PUAN = Tıklama Puanı + Aktivite Puanı
```

### 3.1. Tıklama Puanı

Vitrininize veya ürünlerinize dışarıdan gelen tıklamalar size puan kazandırır.

| Tıklama Türü | Puan | Günlük Tavan |
|-------------|------|-------------|
| Ürününüze tıklama (siz ürün sahibi) | +5 puan | 50 puan/gün |
| Başkasının ürününe tıklama (siz tıklayan) | +5 puan | 15 puan/gün |

**Önemli:** Her ürün-kişi-gün kombinasyonu için sadece **1 benzersiz tıklama** sayılır. Aynı kişi aynı ürüne aynı gün 10 kez tıklasa bile 1 tıklama olarak sayılır.

### 3.2. Aktivite Puanı (Günlük Görevler)

Her gün yapabileceğiniz görevler ve kazandırdıkları puanlar:

| Görev | Puan | Günlük Limit | Günlük Max Puan |
|-------|------|-------------|----------------|
| Giriş yap | +2 | 1 kez | 2 |
| Vitrinini paylaş | +15 | 1 kez | 15 |
| Ürün ekle | +10 | 3 kez | 30 |
| Koleksiyon oluştur | +20 | 1 kez | 20 |
| Ürün yorumla | +8 | 2 kez | 16 |
| Birini takip et | +5 | 3 kez | 15 |
| Ürün oyla | +3 | 5 kez | 15 |

**Günlük maksimum aktivite puanı: 113 puan**

Yani her gün tüm görevleri yapan bir kullanıcı, bir ayda sadece aktiviteden **~3.390 puan** toplayabilir.

---

## 4. Sıralama Sistemi

Her ay başında herkesin puanı sıfırlanır ve yeni bir yarış başlar. Sıralama o ayki toplam puanlara göre belirlenir.

### İki Grup

| Grup | Sıralama | Havuzdan Pay |
|------|---------|-------------|
| **Top 1000** | İlk 1000 kullanıcı | Havuzun **%50'si** — puanlarına orantılı |
| **1001+** | 1001. sıradan sonrası | Havuzun **%40'ı** — herkese eşit |
| **Platform** | — | Havuzun **%10'u** platformun |

### Top 1000 Nasıl Hesaplanır?

Top 1000'deki kullanıcılar, puanlarına göre **orantılı** pay alır. Yani:
- 1. sıradaki kullanıcının 5000 puanı varsa ve top 1000'in toplam puanı 100.000 ise
- Bu kullanıcı havuzun %50'sinin %5'ini alır (5000/100000)

### 1001+ Nasıl Hesaplanır?

1001. sıradan sonraki tüm kullanıcılar, havuzun %40'ını **eşit olarak** paylaşır. 10.000 kullanıcı varsa her biri aynı miktarı alır.

### Ay Sonu Sıfırlama

- **Top 1000:** Tıklamaları tamamen sıfırlanır. Yeni ay temiz başlar.
- **1001+:** Tıklamalarının **%40'ı** yeni aya taşınır. Bu, düzenli katılan ama henüz top 1000'e giremeyen kullanıcıları ödüllendirir.

---

## 5. Aylık Gelir Havuzu

### Havuzu Ne Oluşturur?

Gelir havuzu üç kaynaktan beslenir:

| Kaynak | Açıklama |
|--------|---------|
| **Google AdSense** | Platformdaki reklam gelirleri |
| **Pro Üyelik** | 49 TL/ay üyelik gelirinin %50'si |
| **Reklam Paneli** | İşletmelerin satın aldığı reklam paketleri |

### Havuz Bölüşümü

```
Toplam Havuz
├── %50 → Top 1000 kullanıcıya (puanlarına orantılı)
├── %40 → 1001+ kullanıcılara (eşit bölüşüm)
└── %10 → Platform payı
```

### Kazanç Tahmini Örneği

Diyelim ki aylık havuz **10.000 TL**:

- **Top 1000 havuzu:** 5.000 TL
  - 1. sıra (5000 puan / 100.000 toplam puan) → **250 TL**
  - 500. sıra (200 puan / 100.000 toplam puan) → **10 TL**

- **1001+ havuzu:** 4.000 TL
  - 5.000 kullanıcı arasında eşit → kişi başı **0,80 TL**

- **Platform:** 1.000 TL

### Tıklama Başı Kazanç

Havuz miktarı toplam benzersiz tıklamalara bölünerek "tıklama başı kazanç" hesaplanır. Bu değer ayın gidişatına göre değişir ve canlı olarak gösterilir.

---

## 6. Şampiyon Sistemi

### Şampiyon Rozeti Nedir?

Bir önceki ay **Top 1000'e giren** kullanıcılara sonraki ay "Şampiyon" rozeti verilir.

### Şampiyon Avantajları

| Avantaj | Açıklama |
|---------|---------|
| Şampiyon Rozeti | Profilde ve vitrin sayfasında özel rozet görünür |
| Tıklama Puanı 2x | O ay aldığı tıklama puanları **2 katı** sayılır |
| Prestij | Diğer kullanıcılar şampiyon kullanıcıları görebilir |

### Örnek

- Mart ayında top 500'e giren bir kullanıcı, Nisan ayında "Şampiyon" olur.
- Nisan ayında her tıklama +5 yerine **+10 puan** verir.
- Bu, şampiyonun top 1000'de kalmasını kolaylaştırır.

---

## 7. Sadakat Bonusu

Platforma düzenli olarak katılan kullanıcılar ek bonus kazanır:

| Süre | Bonus |
|------|-------|
| 3 ay kesintisiz aktif | Puanlara **+%5** bonus |
| 6 ay kesintisiz aktif | Puanlara **+%10** bonus |
| 12 ay kesintisiz aktif | Puanlara **+%20** bonus (tavan) |

Sadakat bonusu, toplam puanınıza eklenir. Yani 12 aydır aktif bir kullanıcının 1000 puanı varsa, aslında sıralamada **1200 puan** olarak görünür.

---

## 8. Seri (Streak) Sistemi

Her gün platforma giriş yaparak "seri" oluşturursunuz.

- **Mevcut Seri:** Ardı ardına kaç gün giriş yaptığınız
- **En Uzun Seri:** Şimdiye kadarki en uzun seriniz

Seri bozmamak motivasyon sağlar ve uzun vadede sadakat bonusuna katkı yapar.

---

## 9. Pro Üyelik (49 TL/ay)

### Pro Üyelik Nedir?

Aylık 49 TL ödeyerek Pro üye olabilirsiniz.

### Pro Üyelik Süreci

1. Uygulamadan "Pro Ol" butonuna tıklayın
2. Ödeme bilgilerinizi girin (IBAN, hesap adı vb.)
3. Talebiniz oluşur → 1 iş günü içinde admin tarafından onaylanır
4. Onaylandığında Pro statünüz aktif olur

### Pro Üyelik Geliri Nasıl Dağıtılır?

```
49 TL Pro Üyelik Ücreti
├── %50 (24,50 TL) → Platform geliri
└── %50 (24,50 TL) → Tüm kayıtlı kullanıcılara eşit "kayıt ödülü"
```

Bu "kayıt ödülü" sistemi, yeni kullanıcıları platforma çekmeyi teşvik eder. Platform ne kadar çok Pro üyeye sahipse, herkesin kayıt ödülü de o kadar artar.

---

## 10. Kazanç Çekimi

### Çekim Nasıl Yapılır?

1. **Cüzdan** sayfasına gidin
2. Çekilebilir bakiyenizi görürsünüz
3. "Çekim Talebi" oluşturun
4. Ödeme yönteminizi seçin (banka havalesi vb.)
5. Hesap bilgilerinizi girin
6. Talebi gönderin

### Çekim Durumları

| Durum | Açıklama |
|-------|---------|
| Beklemede | Talep alındı, işleme alınacak |
| Onaylandı | Admin tarafından onaylandı, ödeme yapılacak |
| Reddedildi | Talep reddedildi (yetersiz bakiye, hatalı bilgi vb.) |
| Tamamlandı | Ödeme hesabınıza gönderildi |

### Kazanç Paneli

Cüzdan sayfasında şunları görebilirsiniz:
- Toplam tıklama sayınız
- Tahmini kazancınız
- Havuz bilgileri
- Çekim geçmişiniz

---

## 11. Keşfet ve Sosyal Özellikler

### Keşfet Sayfası
Platformdaki en popüler ürünleri, yeni eklenen ürünleri ve öne çıkan vitrinleri keşfedebilirsiniz.

### Takip Sistemi
Beğendiğiniz kullanıcıları takip edebilirsiniz. Takip etmek size **5 puan** kazandırır (günde 3 kez).

### Ürün Oylama
Ürünleri renk bazlı oylayabilirsiniz. Her oy **3 puan** verir (günde 5 kez).

### Ürün Yorumlama
Ürünlere anonim yorum yazabilirsiniz. Her yorum **8 puan** kazandırır (günde 2 kez).

### Fiyat Alarmı
Bir ürünün fiyatı düştüğünde bildirim almak için fiyat alarmı kurabilirsiniz.

---

## 12. Fiyat Takibi

Sisteme eklenen ürünlerin fiyatları **günlük olarak** otomatik güncellenir (her gün saat 06:00 İstanbul saati). Böylece:
- Fiyat değişimlerini görebilirsiniz
- Fiyat geçmişini inceleyebilirsiniz
- En uygun zamanı yakalayabilirsiniz

---

## 13. Fiyat Tahmin Oyunu

Platformda eğlenceli bir mini oyun vardır: **Fiyat Tahmini**

1. Rastgele bir ürün gösterilir
2. Bir fiyat aralığı ipucu verilir
3. Siz fiyatı tahmin edersiniz
4. Gerçek fiyata ne kadar yakınsanız o kadar iyi skor alırsınız
5. Skorlar sıralamaya girer

---

## 14. İşletme ve Reklam Paneli

### İşletme Paneli
İşletmeler Vitrin'e başvurarak ürünlerini öne çıkarabilir.

### Reklam Paneli
İşletmeler reklam paketleri satın alarak platformda reklam verebilir. Bu reklam gelirleri doğrudan **aylık gelir havuzunu** besler — yani daha fazla reklam = kullanıcılara daha fazla kazanç.

---

## 15. Bildirim Sistemi

Platform size şu durumlarda bildirim gönderir:
- Birileri sizi takip ettiğinde
- Ürünlerinize tıklama geldiğinde
- Görev hatırlatmaları
- Sıralama değişiklikleri
- Şampiyon rozeti kazandığınızda

---

## 16. En Çok Kazanç Sağlama Stratejileri

### Günlük Rutin (Önerilen)

Her gün şu adımları yapın:

| Adım | Süre | Kazanç |
|------|------|--------|
| 1. Giriş yap | 1 sn | +2 puan |
| 2. Vitrinini paylaş | 1 dk | +15 puan |
| 3. 3 ürün ekle | 5 dk | +30 puan |
| 4. 1 koleksiyon oluştur | 2 dk | +20 puan |
| 5. 3 kişiyi takip et | 1 dk | +15 puan |
| 6. 5 ürün oyla | 2 dk | +15 puan |
| 7. 2 ürün yorumla | 3 dk | +16 puan |
| **TOPLAM** | **~15 dk** | **113 puan/gün** |

### Sosyal Medya Stratejisi

Asıl kazanç, **dışarıdan gelen tıklamalardan** gelir. Bunun için:

1. **Instagram biyografinize** vitrin linkinizi koyun
2. **TikTok'ta** favori ürünlerinizi tanıtın ve linki bırakın
3. **Twitter/X'te** indirimli ürünleri paylaşın
4. **WhatsApp durumunuza** vitrin linkinizi ekleyin

Ne kadar çok dış tıklama alırsanız:
- Tıklama puanınız o kadar yüksek olur
- Sıralamanız yükselir
- Havuzdan daha fazla pay alırsınız

### Uzun Vadeli Strateji

1. **Her gün giriş yapın** → Seriyi koruyun → Sadakat bonusu
2. **3 ay aktif kalın** → +%5 bonus
3. **Top 1000'e girin** → Şampiyon rozeti → Sonraki ay 2x tıklama puanı
4. **Şampiyon kalın** → Tıklama avantajıyla sıralamada kalın

---

## 17. Admin Paneli (Yönetici)

Admin kullanıcılar şunları yapabilir:
- Kullanıcı yönetimi
- Pro üyelik onaylama/reddetme
- Çekim taleplerini işleme
- Aylık havuz miktarını ayarlama
- Reklam kampanyalarını yönetme
- Şikayetleri inceleme
- Platform istatistiklerini görme

---

## Özet Tablosu

| Özellik | Detay |
|---------|-------|
| Platform | vitrin.app |
| Kayıt | Email veya telefon + OTP doğrulama |
| Vitrin | Kişisel ürün sayfası (herkese açık) |
| Puan Kaynakları | Tıklamalar + günlük görevler |
| Günlük Max Aktivite | 113 puan |
| Sıralama | Aylık, toplam puana göre |
| Havuz Bölüşümü | %50 top 1000 · %40 1001+ · %10 platform |
| Şampiyon | Önceki ay top 1000 → 2x tıklama puanı |
| Sadakat | 3 ay +%5 · 6 ay +%10 · 12 ay +%20 |
| Pro Üyelik | 49 TL/ay |
| Kazanç Çekimi | Banka havalesi |
| Fiyat Takibi | Günlük otomatik güncelleme |
| Mini Oyun | Fiyat tahmini |
| Mobil | iOS + Android (Expo) |
| Web | Responsive web uygulaması |

---

*Bu belge Vitrin platformunun v1.0 versiyonu için hazırlanmıştır.*
