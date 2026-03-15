# Vitrin — URL Katkı Kazanç Platformu

Türk URL-katkı kazanç platformu. Kullanıcılar ürün URL'leri ekler, kişisel vitrin sayfası oluşturur ve katkı yapanlar aylık gelir havuzundan pay alır.

---

## Gereksinimler

| Araç       | Versiyon | Kurulum |
|-----------|---------|---------|
| **Node.js** | 24+     | [nodejs.org](https://nodejs.org) |
| **pnpm**    | 9+      | `npm install -g pnpm` |
| **PostgreSQL** | 15+  | [postgresql.org](https://www.postgresql.org/download/) |

---

## Hızlı Başlangıç

### 1. Repoyu klonlayın

**GitHub Repo:** [https://github.com/suleymanokay0641-oss/vitrin](https://github.com/suleymanokay0641-oss/vitrin)

```bash
git clone https://github.com/suleymanokay0641-oss/vitrin.git
cd vitrin
```

### 2. Ortam değişkenlerini ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasını açıp veritabanı bilgilerinizi doldurun. Zorunlu değişkenler: `DATABASE_URL`, `PORT`, `JWT_SECRET` ve `BASE_PATH`.

### 3. Bağımlılıkları yükleyin

```bash
pnpm install
```

### 4. Veritabanını oluşturun

Önce PostgreSQL'de `vitrin` adında bir veritabanı oluşturun:

```bash
createdb vitrin
```

Ardından Drizzle ORM ile tablo şemalarını yükleyin (`.env` dosyasındaki `DATABASE_URL` otomatik okunur):

```bash
# Proje kök dizinindeyken:
source .env
cd lib/db
DATABASE_URL="$DATABASE_URL" pnpm push
cd ../..
```

### 5. Uygulamayı başlatın

Her iki sunucu da ayrı terminallerde çalıştırılmalıdır. `.env` dosyasındaki `PORT=8080` API içindir; web arayüzü farklı bir portla başlatılır.

**Terminal 1 — API Sunucusu (port 8080):**
```bash
cd artifacts/api-server
pnpm dev
```

**Terminal 2 — Web Arayüzü (port 5173):**
```bash
cd artifacts/price-tracker
PORT=5173 pnpm dev
```

- API → `http://localhost:8080`
- Web → `http://localhost:5173`

---

## Proje Yapısı

```
vitrin/
├── artifacts/
│   ├── api-server/          # Express 5 API sunucusu
│   ├── price-tracker/       # Vite + React web arayüzü
│   └── vitrin-mobile/       # Expo React Native mobil uygulama
├── lib/
│   ├── db/                  # Drizzle ORM şemaları ve veritabanı bağlantısı
│   ├── api-zod/             # Zod doğrulama şemaları
│   ├── api-client-react/    # TanStack Query hooks (Orval ile oluşturulmuş)
│   ├── api-spec/            # OpenAPI spesifikasyonu
│   └── object-storage-web/  # Dosya yükleme yardımcıları
├── scripts/
│   └── bot-test.mjs         # Entegrasyon test scripti
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | Evet | PostgreSQL bağlantı URL'si |
| `PORT` | Evet | Sunucu port numarası |
| `JWT_SECRET` | Evet | JWT token imzalama anahtarı (production'da mutlaka değiştirin) |
| `RESEND_API_KEY` | Hayır | Email doğrulama servisi ([resend.com](https://resend.com)). Yoksa dev modda OTP konsolda görünür |
| `BASE_PATH` | Evet (web) | Web arayüzünün base path'i. Yerel geliştirmede `/` kullanın |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Hayır | Dosya yükleme bucket ID |
| `PRIVATE_OBJECT_DIR` | Hayır | Özel dosya dizini |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Hayır | Genel dosya arama yolları |

---

## Veritabanı

### Tabloları oluşturma (sıfırdan)

```bash
cd lib/db
pnpm push
```

Bu komut Drizzle ORM şemalarını kullanarak tüm tabloları (29 tablo) PostgreSQL'e yükler.

### Mevcut verileri yedekten geri yükleme

Repo içinde `database/backup.sql` dosyasında mevcut veritabanı yedeği bulunmaktadır (29 tablo, tüm şema ve veriler dahil).

Yeni ortamda bu yedeği geri yüklemek için:

```bash
# Önce boş veritabanını oluşturun
createdb vitrin

# Yedeği geri yükleyin
psql "postgresql://postgres:password@localhost:5432/vitrin" < database/backup.sql
```

Bu komutu çalıştırdıktan sonra `pnpm push` yapmanıza gerek yoktur — yedek dosyası zaten tüm tabloları ve verileri içerir.

### Yeni yedek almak (opsiyonel)

Replit ortamında veritabanınızın güncel bir yedeğini almak için:

```bash
pg_dump "$DATABASE_URL" > database/backup.sql
```

---

## Replit'e Özgü Bağımlılıklar

Bu proje Replit ortamı için geliştirilmiştir. Başka bir ortamda çalıştırırken aşağıdaki Replit'e özgü paketleri kaldırmanız veya değiştirmeniz gerekebilir:

### Vite yapılandırmasında (price-tracker)

`artifacts/price-tracker/vite.config.ts` dosyasında şu Replit eklentileri üretim dışı ortamda zaten devre dışıdır, ancak import hataları alırsanız kaldırabilirsiniz:

- `@replit/vite-plugin-runtime-error-modal` → Kaldırılabilir (sadece geliştirme yardımcısı)
- `@replit/vite-plugin-cartographer` → Zaten sadece Replit'te aktif
- `@replit/vite-plugin-dev-banner` → Zaten sadece Replit'te aktif

**Eğer bu paketlerden hata alırsanız**, `vite.config.ts` dosyasını şu şekilde basitleştirin:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    host: "0.0.0.0",
  },
});
```

---

## Mobil Uygulama (Expo)

Mobil uygulamayı çalıştırmak için:

```bash
cd artifacts/vitrin-mobile
npx expo start
```

Gereksinimler:
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) veya Android Studio Emulator
- Veya fiziksel cihazda Expo Go uygulaması

---

## Sık Sorulan Sorular

### Replit olmadan çalışır mı?
Evet. Proje standart Node.js + PostgreSQL kullanıyor. Replit'e özgü eklentiler opsiyoneldir ve kolayca kaldırılabilir.

### Production'a nasıl deploy edebilirim?
- **API**: Herhangi bir Node.js hosting (Railway, Render, DigitalOcean, VPS)
- **Web**: Vite build çıktısı statik dosyadır — Vercel, Netlify veya herhangi bir CDN
- **Veritabanı**: Supabase, Neon, Railway veya herhangi bir PostgreSQL servisi

### Production build nasıl oluşturulur?

```bash
# API build
cd artifacts/api-server
pnpm build

# Web build
cd artifacts/price-tracker
PORT=5173 BASE_PATH=/ pnpm build
# Build çıktısı: artifacts/price-tracker/dist/public/
```
