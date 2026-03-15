/**
 * Vitrin Yük Testi — 50 Eş Zamanlı Bot Kullanıcı
 * Kullanım: node scripts/load-test.mjs [kullanıcı_sayısı] [hedef]
 * Örnekler:
 *   node scripts/load-test.mjs           → 50 kullanıcı, ürün ekleme testi
 *   node scripts/load-test.mjs 10 click  → 10 kullanıcı, tıklama testi
 *   node scripts/load-test.mjs 50 login  → sadece kayıt+giriş testi
 */

const API = process.env.API_URL || "http://localhost:8080/api";
const BOT_COUNT = parseInt(process.argv[2]) || 50;
const TEST_TYPE = process.argv[3] || "product"; // product | click | login

// Test ürün URL'leri (gerçek siteler)
const TEST_URLS = [
  "https://ty.gl/ocisbv95oh34q",
  "https://ty.gl/4d9rkpvnjkw8b",
  "https://www.trendyol.com/apple/iphone-15-pro-256gb-p-738861792",
  "https://www.hepsiburada.com/samsung-galaxy-s24",
  "https://www.amazon.com.tr/dp/B0BSHF7LLL",
];

const TEST_PRODUCTS = [
  { name: "Test Ürün A", brand: "TestMarka", category: "Elektronik", store: "Trendyol", originalPrice: 1299 },
  { name: "Test Ürün B", brand: "BotBrand", category: "Giyim", store: "Hepsiburada", originalPrice: 499 },
  { name: "Test Ürün C", brand: "", category: "Genel", store: "Amazon", originalPrice: 249 },
  { name: "Test Ürün D — Uzun İsim ile Bot Testi", brand: "Marka", category: "Ev", store: "n11", originalPrice: 799 },
  { name: "Test Ürün E", brand: "BrandX", category: "Spor", store: "ty.gl", originalPrice: 350 },
];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---- Renkli log ----
const C = {
  green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m",
  blue: "\x1b[34m", cyan: "\x1b[36m", gray: "\x1b[90m",
  bold: "\x1b[1m", reset: "\x1b[0m",
};
const log = {
  ok:   (msg) => console.log(`${C.green}  ✓${C.reset} ${msg}`),
  fail: (msg) => console.log(`${C.red}  ✗${C.reset} ${msg}`),
  info: (msg) => console.log(`${C.blue}  ℹ${C.reset} ${msg}`),
  warn: (msg) => console.log(`${C.yellow}  ⚠${C.reset} ${msg}`),
  bold: (msg) => console.log(`${C.bold}${msg}${C.reset}`),
};

// ---- API fonksiyonları ----
async function register(botId) {
  const email = `bot_${botId}_${Date.now()}@vitrin-test.dev`;
  const displayName = `Bot${botId}`;
  const r = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "BotPass123!", displayName }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || `Kayıt hatası: ${r.status}`);
  return { email, userId: d.userId, accessToken: d.accessToken, displayName };
}

async function login(email, password = "BotPass123!") {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || `Giriş hatası: ${r.status}`);
  return d.accessToken;
}

async function addProduct(accessToken, productData, storeUrl) {
  const r = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ ...productData, storeUrl }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || `Ürün ekleme hatası: ${r.status}`);
  return d;
}

async function clickProduct(productId, accessToken) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const r = await fetch(`${API}/products/${productId}/affiliate-click`, {
    method: "POST", headers, body: JSON.stringify({}),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Tıklama hatası: ${r.status}`);
  return d;
}

// ---- Tek bot işi ----
async function runBot(botId) {
  const start = Date.now();
  const result = { botId, success: false, ms: 0, error: null, data: {} };

  try {
    // 1. Kayıt
    const { email, accessToken, userId } = await register(botId);
    result.data.email = email;
    result.data.userId = userId;

    if (TEST_TYPE === "login") {
      result.success = true;
      result.data.step = "kayıt+giriş";
      result.ms = Date.now() - start;
      return result;
    }

    // 2. Ürün ekle
    if (TEST_TYPE === "product" || TEST_TYPE === "product-click") {
      const product = pick(TEST_PRODUCTS);
      const storeUrl = pick(TEST_URLS);
      const added = await addProduct(accessToken, product, storeUrl);
      result.data.productId = added.id;
      result.data.productName = added.name;

      if (TEST_TYPE === "product") {
        result.success = true;
        result.data.step = "ürün eklendi";
        result.ms = Date.now() - start;
        return result;
      }
    }

    // 3. Tıklama testi — mevcut ürünleri tıkla
    if (TEST_TYPE === "click") {
      const productId = randomInt(1, 35); // mevcut ürün ID'leri
      const d = await clickProduct(productId, accessToken);
      result.data.productId = productId;
      result.data.alreadyCounted = d.alreadyCounted;
      result.data.creatorEarned = d.creatorEarned;
      result.success = true;
      result.data.step = "tıklama";
    }

    result.ms = Date.now() - start;
    result.success = true;
  } catch (err) {
    result.error = err.message;
    result.ms = Date.now() - start;
  }

  return result;
}

// ---- Temizlik ----
async function cleanup(results) {
  const successIds = results.filter(r => r.success && r.data.userId).map(r => r.data.userId);
  if (successIds.length === 0) return;

  log.info(`${successIds.length} bot kullanıcısını temizliyorum...`);
  console.log(`${C.gray}  → Test sonrası DB temizliği için şu komutu çalıştır:${C.reset}`);
  console.log(`${C.gray}  psql $DATABASE_URL -c "\\${C.reset}`);
  console.log(`${C.gray}    DELETE FROM prices WHERE product_id IN (SELECT id FROM products WHERE created_by_user_id IN (SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev')); \\${C.reset}`);
  console.log(`${C.gray}    DELETE FROM products WHERE created_by_user_id IN (SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'); \\${C.reset}`);
  console.log(`${C.gray}    DELETE FROM point_events WHERE user_id IN (SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'); \\${C.reset}`);
  console.log(`${C.gray}    DELETE FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev';"${C.reset}`);
}

// ---- İstatistikler ----
function printStats(results, totalMs) {
  const success = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const times = results.map(r => r.ms).sort((a, b) => a - b);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)] || times[times.length - 1];
  const min = times[0];
  const max = times[times.length - 1];

  console.log("\n" + "═".repeat(60));
  log.bold("📊 SONUÇLAR");
  console.log("═".repeat(60));
  console.log(`  Test Tipi     : ${C.cyan}${TEST_TYPE}${C.reset}`);
  console.log(`  Bot Sayısı    : ${C.cyan}${BOT_COUNT}${C.reset}`);
  console.log(`  Toplam Süre   : ${C.cyan}${(totalMs / 1000).toFixed(2)}s${C.reset}`);
  console.log(`  Throughput    : ${C.cyan}${(BOT_COUNT / (totalMs / 1000)).toFixed(1)} istek/sn${C.reset}`);
  console.log("");
  console.log(`  ${C.green}✓ Başarılı${C.reset}     : ${success.length}/${BOT_COUNT} (${Math.round(success.length / BOT_COUNT * 100)}%)`);
  console.log(`  ${C.red}✗ Başarısız${C.reset}    : ${failed.length}/${BOT_COUNT}`);
  console.log("");
  console.log(`  Yanıt Süreleri:`);
  console.log(`    Ortalama    : ${avg}ms`);
  console.log(`    Min         : ${min}ms`);
  console.log(`    Medyan (P50): ${p50}ms`);
  console.log(`    P95         : ${p95}ms`);
  console.log(`    P99         : ${p99}ms`);
  console.log(`    Max         : ${max}ms`);

  if (failed.length > 0) {
    console.log("\n" + "─".repeat(60));
    log.bold("❌ HATALAR");
    const errorGroups = {};
    failed.forEach(r => {
      errorGroups[r.error] = (errorGroups[r.error] || 0) + 1;
    });
    Object.entries(errorGroups).forEach(([err, count]) => {
      log.fail(`${count}x — ${err}`);
    });
  }

  console.log("\n" + "─".repeat(60));
  log.bold("📈 BAŞARILI SONUÇLAR (ilk 5)");
  success.slice(0, 5).forEach(r => {
    console.log(`  Bot #${r.botId}: ${r.data.step || "OK"} — ${r.ms}ms${r.data.productId ? ` (ürün #${r.data.productId})` : ""}`);
  });
  console.log("═".repeat(60) + "\n");
}

// ---- Ana fonksiyon ----
async function main() {
  console.log("\n" + "═".repeat(60));
  log.bold(`🚀 VİTRİN YÜK TESTİ`);
  console.log("═".repeat(60));
  log.info(`API: ${API}`);
  log.info(`Test tipi: ${C.cyan}${TEST_TYPE}${C.reset}`);
  log.info(`Bot sayısı: ${C.cyan}${BOT_COUNT}${C.reset}`);
  console.log("─".repeat(60));

  // API erişilebilirlik kontrolü
  try {
    const r = await fetch(`${API}/admin/dashboard`, { signal: AbortSignal.timeout(3000) });
    if (r.status === 401 || r.ok) {
      log.ok("API erişilebilir");
    } else {
      log.warn(`API yanıt kodu: ${r.status}`);
    }
  } catch {
    log.fail("API erişilemiyor! API server çalışıyor mu?");
    console.log(`${C.gray}  → http://localhost:8080/api${C.reset}\n`);
    process.exit(1);
  }

  console.log(`\n${C.bold}⚡ ${BOT_COUNT} bot eş zamanlı başlatılıyor...${C.reset}\n`);

  const start = Date.now();
  const promises = Array.from({ length: BOT_COUNT }, (_, i) => runBot(i + 1));

  // Gerçek zamanlı ilerleme
  let done = 0;
  const results = await Promise.all(
    promises.map(p => p.then(r => {
      done++;
      const pct = Math.round(done / BOT_COUNT * 100);
      const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
      process.stdout.write(`\r  [${bar}] ${pct}% — ${done}/${BOT_COUNT} tamamlandı`);
      if (r.success) {
        // sessiz
      } else {
        // hataları kaydet
      }
      return r;
    }))
  );

  const totalMs = Date.now() - start;
  console.log("\n");

  printStats(results, totalMs);
  await cleanup(results);
}

main().catch(err => {
  console.error("\n" + C.red + "Beklenmeyen hata: " + C.reset + err.message);
  process.exit(1);
});
