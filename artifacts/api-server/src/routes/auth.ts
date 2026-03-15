import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, refreshTokensTable, userStreakTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router: IRouter = Router();

const JWT_SECRET = process.env["JWT_SECRET"] || "vitrin-jwt-secret-change-in-production";
const JWT_EXPIRES = "15m";
const REFRESH_EXPIRES_DAYS = 7;
const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;

// Rate limiting basit (bellek tabanlı)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTokens(userId: number) {
  const accessToken = jwt.sign({ userId, type: "access" }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  const refreshToken = crypto.randomBytes(40).toString("hex");
  return { accessToken, refreshToken };
}

// E-posta ile OTP gönder — RESEND_API_KEY yoksa dev modda kodu response'a ekle
async function sendOtpEmail(email: string, otp: string, name?: string): Promise<boolean> {
  const RESEND_KEY = process.env["RESEND_API_KEY"];
  if (!RESEND_KEY) {
    console.log(`[Auth][DEV] OTP for ${email}: ${otp}`);
    return false; // false = e-posta gönderilmedi, kodu response'a ekle
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Vitrin <onboarding@resend.dev>",
        to: email,
        subject: "Vitrin — E-posta Doğrulama Kodun",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#1a1a1a">Merhaba${name ? ` ${name}` : ""}! 👋</h2>
            <p style="color:#444">Vitrin hesabını doğrulamak için aşağıdaki kodu kullan:</p>
            <div style="background:#f5f5f5;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1a1a1a">${otp}</span>
            </div>
            <p style="color:#888;font-size:13px">Bu kod ${OTP_EXPIRY_MINUTES} dakika geçerlidir.</p>
          </div>
        `,
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const ip = req.ip || "unknown";
  if (rateLimit(`register:${ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Çok fazla deneme. 15 dakika sonra tekrar dene." });
  }

  const { email, password, displayName, phone } = req.body;
  if (!email || !password) return res.status(400).json({ error: "E-posta ve şifre zorunludur" });
  if (password.length < 6) return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Geçersiz e-posta adresi" });

  // Mevcut kayıt varsa ve doğrulanmamışsa sil, yeniden kayıt izin ver
  const [existing] = await db.select({ id: userAccountsTable.id, emailVerified: userAccountsTable.emailVerified })
    .from(userAccountsTable).where(eq(userAccountsTable.email, email.toLowerCase()));

  if (existing) {
    if (existing.emailVerified) {
      return res.status(409).json({ error: "Bu e-posta zaten kayıtlı. Giriş yap." });
    }
    // Doğrulanmamış eski kaydı güncelle
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await db.update(userAccountsTable).set({
      displayName: displayName || null, phone: phone || null,
      passwordHash, otpCode: otp, otpExpiry,
    }).where(eq(userAccountsTable.id, existing.id));
    const emailSent = await sendOtpEmail(email, otp, displayName);
    return res.status(200).json({
      success: true, userId: existing.id,
      message: emailSent ? "Doğrulama kodu e-postana gönderildi" : "Doğrulama kodu oluşturuldu",
      ...(emailSent ? {} : { devOtp: otp, devNote: "E-posta servisi aktif değil — bu kodu kullan" }),
    });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  try {
    const [user] = await db.insert(userAccountsTable).values({
      email: email.toLowerCase(),
      displayName: displayName || null,
      phone: phone || null,
      passwordHash,
      otpCode: otp,
      otpExpiry,
      emailVerified: false,
    }).returning({ id: userAccountsTable.id });

    const emailSent = await sendOtpEmail(email, otp, displayName);

    res.status(201).json({
      success: true, userId: user.id,
      message: emailSent ? "Doğrulama kodu e-postana gönderildi" : "Doğrulama kodu oluşturuldu",
      ...(emailSent ? {} : { devOtp: otp, devNote: "E-posta servisi aktif değil — bu kodu kullan" }),
    });
  } catch (err: any) {
    if (err?.message?.includes("unique")) {
      return res.status(409).json({ error: "Bu e-posta zaten kayıtlı. Giriş yap." });
    }
    throw err;
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ error: "Kullanıcı ID ve doğrulama kodu gerekli" });

  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, parseInt(userId)));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
  if (user.emailVerified) return res.status(400).json({ error: "E-posta zaten doğrulandı" });
  if (user.otpCode !== otp) return res.status(400).json({ error: "Hatalı doğrulama kodu" });
  if (!user.otpExpiry || new Date() > user.otpExpiry) return res.status(400).json({ error: "Doğrulama kodunun süresi dolmuş. Yeni kod isteyin." });

  await db.update(userAccountsTable)
    .set({ emailVerified: true, otpCode: null, otpExpiry: null, loyaltyMonths: 1 })
    .where(eq(userAccountsTable.id, user.id));

  // Streak başlat
  await db.insert(userStreakTable).values({ userId: user.id, currentStreak: 1, longestStreak: 1, lastActiveDate: new Date().toISOString().slice(0, 10) })
    .onConflictDoNothing();

  const { accessToken, refreshToken } = generateTokens(user.id);
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(refreshTokensTable).values({ userId: user.id, tokenHash, expiresAt });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, displayName: user.displayName, emailVerified: true },
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const ip = req.ip || "unknown";
  if (rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Çok fazla giriş denemesi. 15 dakika sonra tekrar dene." });
  }

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "E-posta ve şifre gerekli" });

  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.email, email.toLowerCase()));
  if (!user || !user.passwordHash) return res.status(401).json({ error: "E-posta veya şifre hatalı" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "E-posta veya şifre hatalı" });

  if (!user.emailVerified) {
    // Yeni OTP gönder
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await db.update(userAccountsTable).set({ otpCode: otp, otpExpiry }).where(eq(userAccountsTable.id, user.id));
    await sendOtpEmail(user.email, otp, user.displayName || undefined);
    return res.status(403).json({ error: "E-posta doğrulanmamış. Yeni doğrulama kodu gönderildi.", userId: user.id, requiresVerification: true });
  }

  // Streak güncelle
  const today = new Date().toISOString().slice(0, 10);
  const [streak] = await db.select().from(userStreakTable).where(eq(userStreakTable.userId, user.id));
  if (!streak) {
    await db.insert(userStreakTable).values({ userId: user.id, currentStreak: 1, longestStreak: 1, lastActiveDate: today });
  } else if (streak.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = streak.lastActiveDate === yesterday ? streak.currentStreak + 1 : 1;
    await db.update(userStreakTable).set({
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActiveDate: today,
      updatedAt: new Date(),
    }).where(eq(userStreakTable.userId, user.id));
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(refreshTokensTable).values({ userId: user.id, tokenHash, expiresAt });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id, email: user.email, displayName: user.displayName,
      phone: user.phone, role: user.role, isChampion: user.isChampion,
      loyaltyMonths: user.loyaltyMonths, championMultiplier: user.championMultiplier,
    },
  });
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token gerekli" });

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const [stored] = await db.select().from(refreshTokensTable)
    .where(and(eq(refreshTokensTable.tokenHash, tokenHash), gt(refreshTokensTable.expiresAt, new Date())));

  if (!stored) return res.status(401).json({ error: "Geçersiz veya süresi dolmuş refresh token" });

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(stored.userId);
  const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, stored.id));
  await db.insert(refreshTokensTable).values({ userId: stored.userId, tokenHash: newHash, expiresAt });

  res.json({ accessToken, refreshToken: newRefreshToken });
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await db.delete(refreshTokensTable).where(eq(refreshTokensTable.tokenHash, tokenHash));
  }
  res.json({ success: true });
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  const ip = req.ip || "unknown";
  if (rateLimit(`otp:${ip}`, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Çok fazla istek. 10 dakika bekleyin." });
  }
  const { userId } = req.body;
  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, parseInt(userId)));
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await db.update(userAccountsTable).set({ otpCode: otp, otpExpiry }).where(eq(userAccountsTable.id, user.id));
  await sendOtpEmail(user.email, otp, user.displayName || undefined);
  res.json({ success: true, message: "Yeni kod gönderildi" });
});

// GET /api/auth/me — JWT gerektirir
router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Token gerekli" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    const [user] = await db.select({
      id: userAccountsTable.id, email: userAccountsTable.email,
      displayName: userAccountsTable.displayName, phone: userAccountsTable.phone,
      role: userAccountsTable.role, isChampion: userAccountsTable.isChampion,
      loyaltyMonths: userAccountsTable.loyaltyMonths, championMultiplier: userAccountsTable.championMultiplier,
      emailVerified: userAccountsTable.emailVerified, phoneVerified: userAccountsTable.phoneVerified,
      createdAt: userAccountsTable.createdAt,
      bio: sql<string | null>`${userAccountsTable}.bio`,
      socialLink: sql<string | null>`${userAccountsTable}.social_link`,
    }).from(userAccountsTable).where(eq(userAccountsTable.id, payload.userId));
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
});

// PATCH /api/auth/profile — profil güncelle (displayName, bio, socialLink)
router.patch("/profile", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Token gerekli" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    const { displayName, bio, socialLink } = req.body;
    if (!displayName && bio === undefined && socialLink === undefined) {
      return res.status(400).json({ error: "Güncellenecek alan belirtilmedi" });
    }
    const updates: Record<string, any> = {};
    if (displayName !== undefined) {
      const trimmed = displayName.trim();
      if (trimmed.length < 2) return res.status(400).json({ error: "İsim en az 2 karakter olmalı" });
      if (trimmed.length > 50) return res.status(400).json({ error: "İsim en fazla 50 karakter olabilir" });
      updates.displayName = trimmed;
    }
    if (bio !== undefined) updates.bio = bio?.trim()?.slice(0, 200) || null;
    if (socialLink !== undefined) {
      const link = socialLink?.trim() || null;
      if (link && !link.startsWith("http")) return res.status(400).json({ error: "Link http ile başlamalı" });
      updates.socialLink = link;
    }
    await db.update(userAccountsTable).set(updates as any).where(eq(userAccountsTable.id, payload.userId));
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
});

export { JWT_SECRET };
export default router;
