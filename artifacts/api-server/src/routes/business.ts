import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { businessLeadsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/leads", async (req, res) => {
  const { companyName, contactName, email, phone, website, productCount, message } = req.body;

  if (!companyName || !contactName || !email) {
    return res.status(400).json({ error: "Şirket adı, yetkili adı ve e-posta zorunludur." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Geçerli bir e-posta adresi giriniz." });
  }

  await db.insert(businessLeadsTable).values({
    companyName,
    contactName,
    email,
    phone: phone || null,
    website: website || null,
    productCount: productCount || null,
    message: message || null,
  });

  res.json({ success: true, message: "Talebiniz alındı. En kısa sürede size ulaşacağız." });
});

export default router;
