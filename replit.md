# Vitrin – Workspace

## Proje Hakkında
Türk URL-katkı kazanç platformu. Kullanıcılar ürün URL'leri ekler → kişisel vitrin sayfası → katkı yapanlar aylık gelir havuzundan pay alır.

**Gelir Modeli**: Google AdSense + Pro üyelik (49 TL/ay) + reklam paneli  
**Havuz Bölüşümü**: %50 top 1000 (orantılı) · %40 1001+ (eşit) · %10 platform

---

## Ürün Tasarım Kararları (Güncel)

### Gelir & Havuz Modeli
- Reklam geliri: %50 ilk 1000 (orantılı) · %40 1001+ (eşit) · %10 platform
- Pro üyelik (49 TL/ay): %50 platform · %50 tüm kayıtlı kullanıcılara eşit "kayıt ödülü"
- Dışarıdan gelen tıklama (referrer ≠ vitrin.app) → 2x puan [PLANLI]

### Şampiyon + Sadakat Sistemi
- Önceki ay top 1000'e giren → "Şampiyon" rozeti + o ay tıklama puanı 2x
- Sadakat bonusu: 3. ay +%5, 6. ay +%10, 12. ay +%20 (tavan)
- Ay sonu: top 1000 tıklamaları sıfırlanır · 1001+ tıklamaların %40'ı yeni aya taşınır

### Puan Sistemi
- Sıralama = Tıklama Puanı + Aktivite Puanı
- Günlük görevler: login (+2p), share_vitrin (+15p), add_product (+10p), follow_user (+5p), create_collection (+20p), vote_product (+3p), review_product (+8p)
- Affiliate click (ürün sahibi): +5p (günlük 50p tavan)
- Affiliate click (tıklayan): +5p (günlük 15p tavan)

### Tıklama Stratejisi
- Platform içi "birbirini tıkla" teşvikinden KAÇIN — sahte tıklama riski
- Asıl model: kullanıcı vitrinini sosyal medyada paylaşır → dışarıdan gerçek tıklama gelir
- Vitrin linki = sosyal medya biyografisine konulan kişisel alışveriş sayfası (Linktree for shopping)

---

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

---

## Proje Yapısı

```
artifacts/
  api-server/         # Express API (port 8080)
  price-tracker/      # Web frontend (Vite + React)
  vitrin-mobile/      # Expo mobil uygulama
  mockup-sandbox/     # UI prototip ortamı

packages/
  db/                 # Drizzle schema + DB client
  api-zod/            # Zod şemaları
  api-client-react/   # Tanstack Query hooks (orval)

scripts/
  bot-test.mjs        # 50 bot entegrasyon testi
```

---

## API Server (api-server) — Rotalar

| Grup | Endpoint |
|------|----------|
| Auth | `/api/auth/register`, `/verify-email`, `/login`, `/refresh`, `/logout`, `/profile` |
| Vitrin | `/api/vitrin/:username`, `/api/vitrin/me/products` |
| Products | `/api/products`, `/api/products/:id`, `/api/products/:id/affiliate-click` |
| Rankings | `/api/rankings/live`, `/api/rankings/my/:userId` |
| Tasks | `/api/tasks`, `/api/tasks/complete` |
| Points | `/api/points/balance`, `/api/points/my-products/:userId`, `/api/points/tournament` |
| Earnings | `/api/earnings/pool`, `/api/earnings/dashboard/:userId`, `/api/earnings/withdraw` |
| Collections | `/api/collections`, `/api/collections/:id`, `/api/collections/user/:userId` |
| Follows | `/api/follows/:userId` |
| Streak | `/api/streak/me`, `/api/streak/:userId` |
| Notifications | `/api/notifications` |
| Discover | `/api/discover` |
| Reviews | `/api/products/:id/reviews` |
| Votes | `/api/products/:id/votes` |
| Alarms | `/api/products/:id/alarms` |
| Admin | `/api/admin/*` |
| Ads | `/api/ads/*` |
| Subscriptions | `/api/subscriptions/*` |
| Game | `/api/game/*` |
| Business | `/api/business/*` |

---

## Veritabanı (29 Tablo)

Kritik tablolar:
- `user_accounts` — email, phone, passwordHash, otpCode, role, totalPoints, displayName, username, bio, loyaltyMonths, isChampion
- `products` — name, brand, category, image_url, store, store_url, original_price, created_by_user_id, affiliate_click_count
- `point_events` — user_id, type, points, description, reference_id
- `user_monthly_earnings` — userId, yearMonth, totalClicks, estimatedEarnings
- `user_monthly_points` — puan tablosu
- `user_daily_tasks` — günlük görev tamamlamalar
- `user_streak` — currentStreak, longestStreak, lastActiveDate
- `collections` + `collection_items` — koleksiyon sistemi
- `user_follows` — takip sistemi
- `champion_history` — şampiyon geçmişi
- `refresh_tokens` — JWT refresh token'ları
- `monthly_pool` — aylık gelir havuzu
- `subscriptions` — Pro üyelikler
- `reviews`, `votes` — anonim (user_id YOK!)

---

## Önemli Notlar

### Auth Sistemi
- `POST /api/auth/register` → `{ email, password, displayName, phone? }` → `{ userId, devOtp? }`
- `POST /api/auth/verify-email` → `{ userId, otp }` (email değil!)
- `POST /api/auth/login` → `{ email, password }` veya `{ phone, password }`
- Telefon kayıt: `${digits}@vitrin.phone` fake email'e çevrilir
- Dev modda `devOtp` response'da döner (Resend aktif değilse)
- JWT access token (15dk) + refresh token (7 gün)
- `RESEND_API_KEY` secret olarak set edilmiş

### Veritabanı
- `products` kolon adları: `store` (store_name değil), `original_price` (current_price değil), `created_by_user_id`
- `reviews` ve `votes` tablosunda `user_id` YOK — anonim
- `votes` API → `{ color, sessionId }` formatı
- `unique_product_clicks` → `creator_user_id` kolonu

### API Yanıt Formatları
- Rankings: `{ ranked: [...], meta: { yearMonth, poolAmount, totalParticipants, ... } }`
- Earnings pool: `{ yearMonth, poolAmount, poolPercent, daysRemaining, ... }`
- Streak: `GET /api/streak/me` (auth gerekli), `GET /api/streak/:userId` (public)
- Tasks: `GET /api/tasks` (auth gerekli) → `{ tasks, totalEarned, maxPossible, date }`

### Admin Kullanıcılar
- `suleymanokay0641@gmail.com` (King06, id:9) — admin
- `suleymanokay@gmail.com` (id:5) — admin

### Scraping
- Image proxy: web'de CDN resimleri `${API_BASE}/img-proxy?url=<encoded>` üzerinden
- Cloudflare korumalı siteler (Hepsiburada, MediaMarkt) scraping yapılamıyor
- Fiyat tazeleme: günlük 06:00 İstanbul

---

## Web Frontend (price-tracker)

Sayfalar:
- `/` — Ana sayfa (URL ekle, puan tablosu, keşfet)
- `/giris` — Giriş (email/telefon + OTP)
- `/kayit` — Kayıt (email/telefon + OTP)
- `/vitrin/:username` — Herkese açık vitrin profili
- `/koleksiyonlar` — Kullanıcı koleksiyonları
- `/koleksiyon/:slug` — Koleksiyon detay
- `/siralama` — Puan bazlı sıralama
- `/cuzdan` — Kazanç + çekim (wallet)
- `/urun/:id` — Ürün detay
- `/premium` — Pro üyelik
- `/isletme` — İşletme paneli
- `/reklam-ver` — Reklam paketi
- `/admin` — Admin paneli

---

## Expo Mobil Uygulama (vitrin-mobile)

**Tab yapısı**: Keşfet · Vitrinim · Panosum · Sıralama · Profil

**Ekranlar**:
- `app/(tabs)/index.tsx` — Keşfet (discover grid)
- `app/(tabs)/vitrin.tsx` — Vitrinim (kişisel ürün listesi + pay butonu)
- `app/(tabs)/pano.tsx` — Panosum (dashboard: görevler, sıra, streak, havuz)
- `app/(tabs)/siralama.tsx` — Sıralama (rankings/live endpoint)
- `app/(tabs)/profil.tsx` — Profil (düzenleme, çıkış)
- `app/auth/index.tsx` — Giriş/Kayıt modal (email + telefon + OTP)
- `app/url-ekle.tsx` — URL ekleme (scrape + onay)
- `app/koleksiyon/[slug].tsx` — Koleksiyon detay
- `app/cuzdan.tsx` — Cüzdan/Kazanç
- `app/(tabs)/bildirimler.tsx` — Bildirimler

**App Store/Play Store**:
- `bundleIdentifier`: `app.vitrin.mobile` (iOS)
- `package`: `app.vitrin.mobile` (Android)
- Adaptive icon, splash, permissions, deep linking kurulu

---

## Bot Test Scripti

`scripts/bot-test.mjs` — 50 bot entegrasyon testi:
- Phase 1: Kayıt + OTP + Doğrulama + Giriş → 50/50
- Phase 2: İlk görevler (login, share_vitrin, create_collection)
- Phase 3: Ürün ekleme + tekrarlayan görevler (add_product, follow, vote, review)
- Phase 4: Çapraz tıklama (affiliate-click)
- Phase 5: Panel kontrolü (tasks API + rankings)
- Phase 6: Sıralama snapshot

**Son sonuç: 15/15 tüm fazlar %100 başarılı**

```
node scripts/bot-test.mjs  # E gir temizlik için
```

---

## Deployment Notları

- API: `artifacts/api-server` → port 8080
- Web: `artifacts/price-tracker` → `PORT` env değişkeninden
- Mobile: `artifacts/vitrin-mobile` → Expo
- DB: `DATABASE_URL` env var (PostgreSQL)
- Secrets: `RESEND_API_KEY`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`
- JWT_SECRET: "vitrin-jwt-secret-change-in-production" (production'da değiştir)

## Taşınabilirlik Dosyaları

- `README.md` — Projeyi başka bir ortamda (VS Code, GitHub) çalıştırma kılavuzu
- `.env.example` — Ortam değişkenleri şablonu (gerçek değerler olmadan)
