/**
 * VİTRİN — 50 Bot Entegrasyon Testi
 * Kayıt → OTP → Giriş → Ürün → Görevler → Çapraz Tıklama → Sıralama Raporu
 */

import pg from "pg";
const { Client } = pg;

const API = "http://localhost:8080";
const TOTAL_BOTS = 50;
const CONCURRENCY = 5; // Aynı anda kaç bot aktif
const DELAY_MS = 80; // İstekler arası bekleme

// ─── Gerçek Türk e-ticaret URL havuzu ───────────────────────────────────────
const PRODUCT_URLS = [
  "https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461",
  "https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626",
  "https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038",
  "https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525",
  "https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742",
  "https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696",
  "https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555",
  "https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073",
  "https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX",
  "https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG",
];

// ─── Yardımcı ────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomIP = () => `${randomInt(10,240)}.${randomInt(1,254)}.${randomInt(1,254)}.${randomInt(1,254)}`;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Renk çıktısı ───────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m", bold: "\x1b[1m",
  green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m",
  cyan: "\x1b[36m", gray: "\x1b[90m", magenta: "\x1b[35m",
  blue: "\x1b[34m",
};
const log = {
  ok:   (msg) => console.log(`${c.green}  ✓${c.reset} ${msg}`),
  err:  (msg) => console.log(`${c.red}  ✗${c.reset} ${c.red}${msg}${c.reset}`),
  info: (msg) => console.log(`${c.cyan}  ℹ${c.reset} ${msg}`),
  warn: (msg) => console.log(`${c.yellow}  ⚠${c.reset} ${msg}`),
  head: (msg) => console.log(`\n${c.bold}${c.magenta}▸ ${msg}${c.reset}`),
  sub:  (msg) => console.log(`${c.gray}    ${msg}${c.reset}`),
};

// ─── API İstek Yardımcısı ────────────────────────────────────────────────────
async function api(method, path, body, token, ip) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (ip)    headers["X-Forwarded-For"] = ip;
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { _raw: text }; }
    return { status: res.status, ok: res.ok, data: json };
  } catch (e) {
    return { status: 0, ok: false, data: { error: e.message } };
  }
}

// ─── Test Sonuç Takibi ───────────────────────────────────────────────────────
const report = {
  bots: [],
  errors: [],
  phase: {},
  add(phase, status, detail) {
    this.phase[phase] = this.phase[phase] || { ok: 0, fail: 0, errors: [] };
    if (status === "ok") this.phase[phase].ok++;
    else {
      this.phase[phase].fail++;
      this.phase[phase].errors.push(detail);
      this.errors.push({ phase, detail });
    }
  },
};

// ─── DB Bağlantısı ───────────────────────────────────────────────────────────
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });
await dbClient.connect();

async function getOtpFromDb(email) {
  const r = await dbClient.query(
    "SELECT otp_code FROM user_accounts WHERE email = $1",
    [email]
  );
  return r.rows[0]?.otp_code || null;
}

async function getUserIdFromDb(email) {
  const r = await dbClient.query(
    "SELECT id FROM user_accounts WHERE email = $1",
    [email]
  );
  return r.rows[0]?.id || null;
}

// ─── PHASE 1: Kayıt & Doğrulama & Giriş ────────────────────────────────────
async function registerBot(botIndex) {
  const tag = `bot_${String(botIndex).padStart(2, "0")}`;
  const email = `${tag}@vitrin-test.dev`;
  const password = "Test1234!";
  const displayName = `TestBot${botIndex}`;
  const ip = randomIP();

  const bot = { tag, email, password, displayName, ip, token: null, userId: null,
    products: [], errors: [], tasksDone: [], clicksDone: 0 };

  // Kayıt
  await sleep(randomInt(0, DELAY_MS));
  const reg = await api("POST", "/api/auth/register",
    { email, password, displayName }, null, ip);

  let regUserId = null;
  if (!reg.ok) {
    if (reg.data?.error?.includes("kayıtlı") || reg.status === 409) {
      log.sub(`${tag}: zaten kayıtlı, direkt giriş deneniyor`);
      regUserId = await getUserIdFromDb(email);
    } else {
      report.add("register", "fail", `${tag}: ${reg.status} — ${JSON.stringify(reg.data)}`);
      bot.errors.push(`register: ${reg.status}`);
      return bot;
    }
  } else {
    report.add("register", "ok");
    regUserId = reg.data.userId;
    log.sub(`${tag}: kayıt tamam (userId: ${regUserId})`);
  }

  // OTP - DB'den oku
  await sleep(600);
  const otp = await getOtpFromDb(email);
  if (!otp) {
    report.add("otp_read", "fail", `${tag}: OTP DB'de yok`);
    bot.errors.push("otp_read: not found in db");
    return bot;
  }
  report.add("otp_read", "ok");

  // E-posta doğrulama — userId + otp gönder (email değil!)
  const verify = await api("POST", "/api/auth/verify-email",
    { userId: regUserId, otp }, null, ip);
  if (verify.ok) {
    report.add("verify_email", "ok");
    // verify-email token da döndürüyor, direkt kullanabiliriz
    bot.token = verify.data.accessToken;
    bot.userId = verify.data.user?.id || regUserId;
    log.ok(`${tag} verify+login tamam (userId: ${bot.userId})`);
    return bot; // login adımına gerek yok
  } else if (verify.data?.error?.includes("zaten doğrulandı")) {
    report.add("verify_email", "ok");
    log.sub(`${tag}: zaten doğrulanmış, login deneniyor`);
  } else {
    report.add("verify_email", "fail",
      `${tag}: ${verify.status} — ${JSON.stringify(verify.data).slice(0,100)}`);
    bot.errors.push(`verify: ${verify.status} ${JSON.stringify(verify.data).slice(0,60)}`);
    // Yine de login dene
  }

  // Login
  await sleep(DELAY_MS);
  const login = await api("POST", "/api/auth/login", { email, password }, null, ip);
  if (!login.ok) {
    report.add("login", "fail", `${tag}: ${login.status} — ${JSON.stringify(login.data)}`);
    bot.errors.push(`login: ${login.status}`);
    return bot;
  }
  report.add("login", "ok");
  bot.token = login.data.accessToken;
  bot.userId = login.data.user?.id;
  if (!bot.userId) bot.userId = await getUserIdFromDb(email);

  log.ok(`${tag} giriş tamam (userId: ${bot.userId})`);
  return bot;
}

// ─── PHASE 2: Ürün Ekleme (DB direkt — scraping yok) ────────────────────────
const SAMPLE_PRODUCTS = [
  { name: "Apple Watch SE 2. Nesil", brand: "Apple", imageUrl: "https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg", storeName: "Trendyol", currentPrice: "4299.00" },
  { name: "Samsung 55 4K Smart TV", brand: "Samsung", imageUrl: "https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg", storeName: "Trendyol", currentPrice: "12999.00" },
  { name: "Nike Air Max 270", brand: "Nike", imageUrl: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg", storeName: "Nike", currentPrice: "3299.00" },
  { name: "Dyson V15 Detect Kablosuz Süpürge", brand: "Dyson", imageUrl: "https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg", storeName: "Trendyol", currentPrice: "18999.00" },
  { name: "Philips Airfryer XL 2000W", brand: "Philips", imageUrl: "https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg", storeName: "Hepsiburada", currentPrice: "2499.00" },
  { name: "Samsung Galaxy Buds2 Pro", brand: "Samsung", imageUrl: "https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg", storeName: "Trendyol", currentPrice: "3499.00" },
  { name: "Logitech MX Keys Mini Klavye", brand: "Logitech", imageUrl: "https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg", storeName: "Hepsiburada", currentPrice: "1899.00" },
  { name: "Adidas Ultraboost 22", brand: "Adidas", imageUrl: "https://assets.adidas.com/images/w_600/abc.jpg", storeName: "Adidas", currentPrice: "2799.00" },
];

async function addProductsForBot(bot) {
  if (!bot.token || !bot.userId) return;
  const picks = [...SAMPLE_PRODUCTS].sort(() => Math.random() - 0.5).slice(0, 3);
  const url = pick(PRODUCT_URLS); // url alanı için gerekli

  for (const prod of picks) {
    try {
      const res = await dbClient.query(`
        INSERT INTO products (name, brand, image_url, store, store_url, original_price, created_by_user_id, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [prod.name, prod.brand, prod.imageUrl, prod.storeName, url, parseFloat(prod.currentPrice), bot.userId, prod.category || "Elektronik"]);
      const pid = res.rows[0]?.id;
      if (pid) {
        bot.products.push(pid);
        report.add("add_product", "ok");
        log.sub(`  ${bot.tag}: ürün eklendi → id:${pid} "${prod.name.slice(0,30)}"`);
      }
    } catch(e) {
      report.add("add_product", "fail", `${bot.tag}: ${e.message.slice(0,80)}`);
      bot.errors.push(`add_product_db: ${e.message.slice(0,50)}`);
    }
  }
}

// ─── PHASE 3: Günlük Görevler ───────────────────────────────────────────────
const DAILY_TASKS = [
  "login",
  "share_vitrin",
  "create_collection",
];
// Tekrar yapılabilenler ayrı
const REPEAT_TASKS = [
  { type: "add_product",    times: 3 },
  { type: "follow_user",    times: 3 },
  { type: "vote_product",   times: 5 },
  { type: "review_product", times: 2 },
];

async function completeDailyTasks(bot, allBotUserIds, allProductIds) {
  if (!bot.token) return;

  // Tekil görevler
  for (const taskType of DAILY_TASKS) {
    await sleep(DELAY_MS);
    const r = await api("POST", "/api/tasks/complete", { taskType }, bot.token, bot.ip);
    if (r.ok || r.data?.pointsEarned != null) {
      report.add(`task_${taskType}`, "ok");
      bot.tasksDone.push(taskType);
      log.sub(`  ${bot.tag}: görev ✓ ${taskType} (+${r.data?.pointsEarned || "?"}p)`);
    } else {
      report.add(`task_${taskType}`, "fail",
        `${bot.tag}: ${r.status} — ${JSON.stringify(r.data).slice(0,100)}`);
      bot.errors.push(`task_${taskType}: ${r.status} ${JSON.stringify(r.data).slice(0,60)}`);
    }
  }

  // Tekrarlı görevler
  for (const { type, times } of REPEAT_TASKS) {
    for (let i = 0; i < times; i++) {
      await sleep(DELAY_MS);
      let body = { taskType: type };

      // follow_user → rastgele kullanıcı seç
      if (type === "follow_user") {
        const others = allBotUserIds.filter(id => id !== bot.userId && id != null);
        if (others.length === 0) continue;
        const targetId = pick(others);
        // Önce follow API'si
        const fol = await api("POST", `/api/follows/${targetId}`, {}, bot.token, bot.ip);
        if (!fol.ok && fol.status !== 409) {
          report.add("follow_user_api", "fail", `${bot.tag}: ${fol.status}`);
        }
      }

      // vote / review → rastgele ürün (anonim API, sessionId ile)
      if (type === "vote_product") {
        const pid = pick(allProductIds);
        if (!pid) continue;
        const sessionId = `bot-${bot.tag}-${randomInt(100000,999999)}`;
        await api("POST", `/api/products/${pid}/votes`,
          { color: pick(["green","yellow","red"]), sessionId }, bot.token, bot.ip);
      }
      if (type === "review_product") {
        const pid = pick(allProductIds);
        if (!pid) continue;
        await api("POST", `/api/products/${pid}/reviews`, {
          authorName: bot.displayName,
          rating: randomInt(3, 5),
          comment: `Harika ürün, ${randomInt(1,99)} gündür kullanıyorum. Kesinlikle tavsiye.`,
        }, bot.token, bot.ip);
      }

      const r = await api("POST", "/api/tasks/complete", body, bot.token, bot.ip);
      if (r.ok || r.data?.pointsEarned != null) {
        report.add(`task_${type}`, "ok");
        bot.tasksDone.push(type);
      } else {
        report.add(`task_${type}`, "fail",
          `${bot.tag}: ${r.status} — ${JSON.stringify(r.data).slice(0,80)}`);
        bot.errors.push(`task_${type}[${i}]: ${r.status}`);
      }
    }
  }
}

// ─── PHASE 4: Çapraz Tıklama ────────────────────────────────────────────────
async function crossClick(bot, allProductIds) {
  if (!bot.token) return;
  // Her bot rastgele 8–15 farklı ürüne tıklar
  const targets = [...allProductIds]
    .filter(id => !bot.products.includes(id))
    .sort(() => Math.random() - 0.5)
    .slice(0, randomInt(3, 6));

  for (const pid of targets) {
    await sleep(randomInt(50, DELAY_MS));
    const r = await api("POST", `/api/products/${pid}/affiliate-click`, {}, bot.token, bot.ip);
    if (r.ok) {
      bot.clicksDone++;
      report.add("cross_click", "ok");
    } else {
      report.add("cross_click", "fail",
        `${bot.tag}→pid${pid}: ${r.status} ${JSON.stringify(r.data).slice(0,80)}`);
    }
  }
}

// ─── PHASE 5: Panel Kontrolü ────────────────────────────────────────────────
async function checkPanel(bot) {
  if (!bot.token) return null;
  const r = await api("GET", "/api/tasks", null, bot.token, bot.ip);
  const r2 = await api("GET", "/api/rankings/live?limit=5", null, bot.token, bot.ip);
  return {
    tasks: r.ok ? r.data : null,
    ranking: r2.ok ? r2.data : null,
    taskStatus: r.status,
    rankStatus: r2.status,
  };
}

// ─── Paralel Çalıştırma ──────────────────────────────────────────────────────
async function runInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    await sleep(500);
  }
  return results;
}

// ─── CLEANUP ─────────────────────────────────────────────────────────────────
async function cleanupBots() {
  log.head("Temizlik: bot hesapları siliniyor…");
  try {
    await dbClient.query(`
      DELETE FROM prices WHERE product_id IN (
        SELECT id FROM products WHERE created_by_user_id IN (
          SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
        )
      );
      DELETE FROM unique_product_clicks WHERE creator_user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM point_events WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM user_daily_tasks WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM user_monthly_earnings WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM user_monthly_points WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM user_streak WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM user_follows WHERE follower_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      ) OR following_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM reviews WHERE product_id IN (
        SELECT id FROM products WHERE created_by_user_id IN (
          SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
        )
      );
      DELETE FROM votes WHERE product_id IN (
        SELECT id FROM products WHERE created_by_user_id IN (
          SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
        )
      );
      DELETE FROM collections WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM products WHERE created_by_user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM refresh_tokens WHERE user_id IN (
        SELECT id FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev'
      );
      DELETE FROM user_accounts WHERE email LIKE 'bot_%@vitrin-test.dev';
    `);
    log.ok("Tüm bot hesapları silindi");
  } catch(e) {
    log.err(`Temizlik hatası: ${e.message}`);
  }
}

// ─── RAPOR ───────────────────────────────────────────────────────────────────
function printReport(bots) {
  console.log(`\n${c.bold}${"═".repeat(60)}${c.reset}`);
  console.log(`${c.bold}${c.magenta}  VİTRİN BOT TEST RAPORU${c.reset}`);
  console.log(`${c.bold}${"═".repeat(60)}${c.reset}\n`);

  // Faz özeti
  console.log(`${c.bold}📊 FAZ SONUÇLARI:${c.reset}`);
  for (const [phase, result] of Object.entries(report.phase)) {
    const total = result.ok + result.fail;
    const pct = total > 0 ? Math.round(result.ok / total * 100) : 0;
    const bar = result.fail === 0 ? c.green : result.ok === 0 ? c.red : c.yellow;
    console.log(`  ${bar}${phase.padEnd(22)}${c.reset} ` +
      `${c.green}${result.ok}✓${c.reset} / ${c.red}${result.fail}✗${c.reset}` +
      `  (${bar}%${pct}${c.reset})`);
  }

  // Bot başarı/başarısızlık
  const withToken = bots.filter(b => b.token).length;
  const withProducts = bots.filter(b => b.products.length > 0).length;
  const totalProducts = bots.reduce((a, b) => a + b.products.length, 0);
  const totalTasks = bots.reduce((a, b) => a + b.tasksDone.length, 0);
  const totalClicks = bots.reduce((a, b) => a + b.clicksDone, 0);

  console.log(`\n${c.bold}🤖 BOT ÖZET:${c.reset}`);
  console.log(`  Giriş yapan     : ${c.green}${withToken}${c.reset} / ${TOTAL_BOTS}`);
  console.log(`  Ürün ekleyen    : ${c.green}${withProducts}${c.reset} bot (toplam ${c.cyan}${totalProducts}${c.reset} ürün)`);
  console.log(`  Toplam görev    : ${c.cyan}${totalTasks}${c.reset}`);
  console.log(`  Toplam tıklama  : ${c.cyan}${totalClicks}${c.reset}`);

  // Hatalar
  if (report.errors.length > 0) {
    console.log(`\n${c.bold}${c.red}🐛 HATALAR (${report.errors.length} adet):${c.reset}`);
    const byPhase = {};
    for (const e of report.errors) {
      byPhase[e.phase] = byPhase[e.phase] || [];
      byPhase[e.phase].push(e.detail);
    }
    for (const [phase, errs] of Object.entries(byPhase)) {
      console.log(`\n  ${c.yellow}[${phase}]${c.reset}`);
      // İlk 3 hatayı göster
      const shown = errs.slice(0, 3);
      for (const e of shown) console.log(`  ${c.red}→${c.reset} ${e.slice(0,120)}`);
      if (errs.length > 3) console.log(`  ${c.gray}... ve ${errs.length - 3} daha${c.reset}`);
    }
  } else {
    console.log(`\n  ${c.green}✓ Hiç kritik hata yok!${c.reset}`);
  }

  // Bot hata detayları
  const botsWithErrors = bots.filter(b => b.errors.length > 0);
  if (botsWithErrors.length > 0) {
    console.log(`\n${c.bold}📋 BOT HATA DETAYLARI:${c.reset}`);
    for (const b of botsWithErrors.slice(0, 10)) {
      console.log(`  ${c.yellow}${b.tag}${c.reset}: ${b.errors.join(" | ")}`);
    }
  }

  console.log(`\n${c.bold}${"═".repeat(60)}${c.reset}\n`);
}

// ─── ANA ÇALIŞMA ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold}${c.cyan}🤖 VİTRİN 50 BOT ENTEGRASYOn TESTİ BAŞLIYOR${c.reset}\n`);
  const startTime = Date.now();

  // Önceki bot temizliği
  await cleanupBots();

  // PHASE 1: Kayıt & Giriş
  log.head("PHASE 1: Kayıt & OTP & Giriş (50 bot)");
  const botDefs = Array.from({ length: TOTAL_BOTS }, (_, i) => i + 1);
  const bots = await runInBatches(botDefs, CONCURRENCY, registerBot);
  const activeBots = bots.filter(b => b.token);
  log.info(`${activeBots.length}/${TOTAL_BOTS} bot aktif (token aldı)`);

  if (activeBots.length === 0) {
    log.err("Hiç bot giriş yapamadı, test durduruluyor");
    await printReport(bots);
    await dbClient.end();
    return;
  }

  // PHASE 2: Ürün Ekleme
  log.head("PHASE 2: Ürün Ekleme");
  await runInBatches(activeBots, CONCURRENCY, addProductsForBot);
  const allProductIds = bots.flatMap(b => b.products);
  log.info(`Toplam ${allProductIds.length} ürün eklendi`);

  // Gerçek DB'deki ürün id'leri de al (önceki oturumlar + gerçek kullanıcılar)
  const dbProducts = await dbClient.query("SELECT id FROM products LIMIT 200");
  const allKnownProductIds = [...new Set([
    ...allProductIds,
    ...dbProducts.rows.map(r => r.id),
  ])];

  // PHASE 3: Günlük Görevler
  log.head("PHASE 3: Günlük Görevler");
  const allUserIds = activeBots.map(b => b.userId).filter(Boolean);
  await runInBatches(activeBots, CONCURRENCY, b =>
    completeDailyTasks(b, allUserIds, allKnownProductIds)
  );

  // PHASE 4: Çapraz Tıklama
  log.head("PHASE 4: Çapraz Tıklama");
  await runInBatches(activeBots, CONCURRENCY, b =>
    crossClick(b, allKnownProductIds)
  );

  // PHASE 5: Panel Kontrolü (örneklem 5 bot)
  log.head("PHASE 5: Panel Kontrolü (5 örnek bot)");
  const sampleBots = activeBots.slice(0, 5);
  for (const bot of sampleBots) {
    const panel = await checkPanel(bot);
    if (panel) {
      const taskCount = panel.tasks?.tasks?.filter(t => t.completedToday)?.length || 0;
      const rankTotal = panel.ranking?.ranked?.length || 0;
      const myRank = panel.ranking?.ranked?.findIndex(r => r.userId === bot.userId);
      log.sub(`${bot.tag}: görev=${taskCount} sıralama_toplam=${rankTotal} kendi_sıra=${myRank >= 0 ? myRank + 1 : "?"}` );
      if (panel.taskStatus !== 200) {
        report.add("panel_tasks", "fail", `${bot.tag}: tasks status ${panel.taskStatus}`);
      } else report.add("panel_tasks", "ok");
      if (panel.rankStatus !== 200) {
        report.add("panel_ranking", "fail", `${bot.tag}: ranking status ${panel.rankStatus}`);
      } else report.add("panel_ranking", "ok");
    }
  }

  // Sıralama snapshot
  log.head("PHASE 6: Sıralama Snapshot (Top 10)");
  const rankRes = await api("GET", "/api/rankings/live?limit=10");
  if (rankRes.ok && rankRes.data?.ranked) {
    report.add("ranking_api", "ok");
    for (const entry of rankRes.data.ranked.slice(0, 10)) {
      const name = entry.displayName || "?";
      log.sub(`#${entry.rank} ${name.padEnd(20)} ~${entry.estimatedEarnings || 0}₺  ${entry.totalClicks || 0} tıklama`);
    }
  } else {
    report.add("ranking_api", "fail", `status: ${rankRes.status}`);
    log.err(`Sıralama API hatası: ${rankRes.status} — ${JSON.stringify(rankRes.data).slice(0,100)}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log.info(`Toplam süre: ${elapsed}s`);

  printReport(bots);

  // Temizlik (bots sonrası)
  const { default: readline } = await import("readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve => {
    rl.question(`\n${c.yellow}Bot hesaplarını temizleyelim mi? (E/h): ${c.reset}`, async (ans) => {
      rl.close();
      if (ans.toLowerCase() !== "h") {
        await cleanupBots();
      } else {
        log.warn("Bot hesapları DB'de bırakıldı");
      }
      resolve();
    });
  });

  await dbClient.end();
}

main().catch(async e => {
  console.error(`\n${c.red}FATAL: ${e.message}${c.reset}`);
  console.error(e.stack);
  await dbClient.end().catch(() => {});
  process.exit(1);
});
