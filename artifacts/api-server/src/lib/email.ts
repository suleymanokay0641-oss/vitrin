const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "alarm@fiyatdedektifi.com";
const APP_URL = process.env.APP_URL || "https://fiyatdedektifi.com";

interface AlarmEmailData {
  to: string;
  productName: string;
  productId: number;
  targetPrice: number;
  currentPrice: number;
  storeUrl?: string | null;
  imageUrl?: string | null;
}

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function buildHtml(data: AlarmEmailData): string {
  const discount = Math.round(((data.targetPrice - data.currentPrice) / data.targetPrice) * 100);
  const productUrl = `${APP_URL}/product/${data.productId}`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fiyat Alarmı Tetiklendi</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🔔 Fiyat Alarmı Tetiklendi!</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">Fiyat Dedektifi</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#374151;font-size:15px;">Merhaba,</p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;">
              Takip ettiğiniz ürün hedef fiyatınıza ulaştı!
            </p>

            <!-- Product box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin-bottom:28px;">
              <tr>
                ${data.imageUrl ? `<td style="padding:16px 12px 16px 20px;width:80px;vertical-align:middle;">
                  <img src="${data.imageUrl}" width="80" height="80" alt="" style="border-radius:6px;object-fit:cover;" />
                </td>` : ""}
                <td style="padding:16px 20px;vertical-align:middle;">
                  <p style="margin:0 0 6px;font-weight:700;color:#1e3a5f;font-size:15px;">${data.productName}</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Hedef Fiyatınız: <span style="font-weight:600;color:#374151;">₺${formatPrice(data.targetPrice)}</span></p>
                </td>
              </tr>
            </table>

            <!-- Price comparison -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td width="50%" style="padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Güncel Fiyat</p>
                  <p style="margin:0;font-size:26px;font-weight:800;color:#16a34a;">₺${formatPrice(data.currentPrice)}</p>
                </td>
                <td width="4%" />
                <td width="46%" style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Hedef Fiyatınız</p>
                  <p style="margin:0;font-size:26px;font-weight:800;color:#374151;">₺${formatPrice(data.targetPrice)}</p>
                </td>
              </tr>
            </table>

            ${discount > 0 ? `<p style="margin:0 0 24px;padding:10px 16px;background:#fefce8;border-left:4px solid #f59e0b;border-radius:4px;color:#78350f;font-size:14px;">
              📉 Hedef fiyatınızın <strong>%${discount}</strong> altında — şimdi harika bir fırsat!
            </p>` : ""}

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${data.storeUrl ? `<td width="48%" style="padding-right:8px;">
                  <a href="${data.storeUrl}" style="display:block;padding:14px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:8px;text-align:center;font-weight:700;font-size:14px;">
                    🛒 Hemen Satın Al
                  </a>
                </td>
                <td width="4%" />` : ""}
                <td style="padding-left:${data.storeUrl ? "8px" : "0"};">
                  <a href="${productUrl}" style="display:block;padding:14px;background:#f0f9ff;color:#1e40af;text-decoration:none;border-radius:8px;text-align:center;font-weight:700;font-size:14px;border:1px solid #bae6fd;">
                    📊 Fiyat Geçmişini Gör
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Bu e-postayı Fiyat Dedektifi üzerinden kurduğunuz fiyat alarmı nedeniyle alıyorsunuz.<br/>
              <a href="${productUrl}" style="color:#6b7280;">Alarm ayarlarını yönet</a> · 
              <a href="https://fiyatdedektifi.com" style="color:#6b7280;">Fiyat Dedektifi</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAlarmEmail(data: AlarmEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY ayarlı değil. E-posta simüle ediliyor → ${data.to}`);
    console.log(`[email] Konu: Fiyat Alarmı - ${data.productName} ₺${formatPrice(data.currentPrice)}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.to],
        subject: `🔔 Fiyat Alarmı: ${data.productName} hedef fiyatınıza ulaştı!`,
        html: buildHtml(data),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[email] Resend hatası: ${res.status} ${err}`);
      return false;
    }

    console.log(`[email] Gönderildi → ${data.to} (${data.productName})`);
    return true;
  } catch (err) {
    console.error("[email] Bağlantı hatası:", err);
    return false;
  }
}
