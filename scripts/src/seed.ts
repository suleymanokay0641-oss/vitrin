import { db } from "@workspace/db";
import { productsTable, pricesTable } from "@workspace/db";

type SeedProduct = {
  name: string;
  brand: string;
  category: string;
  description: string;
  store: string;
  storeUrl: string;
  originalPrice: number;
  imageUrl: string;
  priceHistory: { daysAgo: number; price: number; note?: string }[];
};

const seedData: SeedProduct[] = [
  {
    name: 'iPhone 15 Pro 256GB',
    brand: 'Apple',
    category: 'Telefon',
    description: 'Apple iPhone 15 Pro 256GB Doğal Titanyum',
    store: 'Trendyol',
    storeUrl: 'https://trendyol.com',
    originalPrice: 54999,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    priceHistory: [
      { daysAgo: 90, price: 54999, note: 'İlk fiyat' },
      { daysAgo: 75, price: 54999 },
      { daysAgo: 60, price: 52999 },
      { daysAgo: 45, price: 54999, note: 'Fiyat artışı' },
      { daysAgo: 30, price: 54999 },
      { daysAgo: 20, price: 54999 },
      { daysAgo: 14, price: 56999, note: '"İndirim öncesi" fiyat artışı' },
      { daysAgo: 7, price: 54999, note: 'Büyük Kampanya - SAHTE!' },
      { daysAgo: 3, price: 54999 },
      { daysAgo: 0, price: 54999 },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    brand: 'Samsung',
    category: 'Telefon',
    description: 'Samsung Galaxy S24 Ultra 512GB Titanyum Gri',
    store: 'Hepsiburada',
    storeUrl: 'https://hepsiburada.com',
    originalPrice: 62000,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    priceHistory: [
      { daysAgo: 120, price: 62000, note: 'İlk fiyat' },
      { daysAgo: 100, price: 60000, note: 'İndirim' },
      { daysAgo: 80, price: 58000, note: 'Devam eden indirim' },
      { daysAgo: 60, price: 56000 },
      { daysAgo: 40, price: 54000 },
      { daysAgo: 20, price: 52000 },
      { daysAgo: 10, price: 50000 },
      { daysAgo: 5, price: 48000 },
      { daysAgo: 0, price: 46500, note: 'En düşük fiyat!' },
    ],
  },
  {
    name: 'Sony WH-1000XM5 Kablosuz Kulaklık',
    brand: 'Sony',
    category: 'Ses Ekipmanları',
    description: 'Sony WH-1000XM5 Gürültü Önleyici Kablosuz Kulaklık - Siyah',
    store: 'Amazon Türkiye',
    storeUrl: 'https://amazon.com.tr',
    originalPrice: 8999,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    priceHistory: [
      { daysAgo: 180, price: 8999, note: 'İlk fiyat' },
      { daysAgo: 150, price: 8999 },
      { daysAgo: 120, price: 9499, note: 'Fiyat artışı' },
      { daysAgo: 90, price: 9499 },
      { daysAgo: 60, price: 9999, note: 'İndirim öncesi yükseltme' },
      { daysAgo: 45, price: 9999 },
      { daysAgo: 30, price: 9999 },
      { daysAgo: 14, price: 7999, note: '"50% indirim!" Sahte!' },
      { daysAgo: 7, price: 7999 },
      { daysAgo: 0, price: 7999 },
    ],
  },
  {
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'Spor & Outdoor',
    description: 'Nike Air Max 270 Erkek Yürüyüş Ayakkabısı - Beyaz/Siyah',
    store: 'Nike TR',
    storeUrl: 'https://nike.com/tr',
    originalPrice: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    priceHistory: [
      { daysAgo: 90, price: 4999, note: 'İlk fiyat' },
      { daysAgo: 70, price: 4999 },
      { daysAgo: 50, price: 4499, note: 'Sezon sonu indirim' },
      { daysAgo: 30, price: 3999, note: 'İndirim devam ediyor' },
      { daysAgo: 14, price: 3499 },
      { daysAgo: 7, price: 2999, note: 'En düşük! Gerçek indirim' },
      { daysAgo: 0, price: 2999 },
    ],
  },
  {
    name: 'Dyson V15 Detect Elektrikli Süpürge',
    brand: 'Dyson',
    category: 'Ev Aletleri',
    description: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    store: 'Trendyol',
    storeUrl: 'https://trendyol.com',
    originalPrice: 21999,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    priceHistory: [
      { daysAgo: 150, price: 21999, note: 'İlk fiyat' },
      { daysAgo: 120, price: 22999, note: 'Fiyat artışı' },
      { daysAgo: 90, price: 24999, note: 'Yüksek sezon' },
      { daysAgo: 60, price: 24999 },
      { daysAgo: 30, price: 26999, note: 'Kampanya öncesi artış' },
      { daysAgo: 15, price: 21999, note: 'Efsane Cuma kampanyası! SAHTE!' },
      { daysAgo: 5, price: 21999 },
      { daysAgo: 0, price: 21999 },
    ],
  },
  {
    name: 'MacBook Pro M3 14" 512GB',
    brand: 'Apple',
    category: 'Bilgisayar',
    description: 'Apple MacBook Pro 14 inç M3 Çip 512GB SSD Uzay Grisi',
    store: 'Gittigidiyor',
    storeUrl: 'https://gittigidiyor.com',
    originalPrice: 89999,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    priceHistory: [
      { daysAgo: 200, price: 89999, note: 'İlk fiyat' },
      { daysAgo: 160, price: 89999 },
      { daysAgo: 120, price: 92999, note: 'Döviz artışı' },
      { daysAgo: 80, price: 87999, note: 'İndirim' },
      { daysAgo: 40, price: 84999 },
      { daysAgo: 20, price: 82999 },
      { daysAgo: 10, price: 79999, note: 'Gerçek indirim!' },
      { daysAgo: 0, price: 79999 },
    ],
  },
  {
    name: 'Philips Airfryer XXL HD9650',
    brand: 'Philips',
    category: 'Ev Aletleri',
    description: 'Philips Airfryer XXL 7.3L Dijitalli Sıcak Hava Fritözü',
    store: 'MediaMarkt',
    storeUrl: 'https://mediamarkt.com.tr',
    originalPrice: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
    priceHistory: [
      { daysAgo: 60, price: 4999, note: 'İlk fiyat' },
      { daysAgo: 50, price: 5499 },
      { daysAgo: 40, price: 5499 },
      { daysAgo: 30, price: 5999, note: 'Kampanya öncesi artış' },
      { daysAgo: 20, price: 5999 },
      { daysAgo: 10, price: 3999, note: '"Yarı fiyatına!" - SAHTE!' },
      { daysAgo: 3, price: 3999 },
      { daysAgo: 0, price: 3999 },
    ],
  },
  {
    name: 'Levi\'s 501 Original Straight Jeans',
    brand: "Levi's",
    category: 'Giyim',
    description: "Levi's 501 Original Straight Erkek Kot Pantolon - Koyu Mavi",
    store: 'Trendyol',
    storeUrl: 'https://trendyol.com',
    originalPrice: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400',
    priceHistory: [
      { daysAgo: 90, price: 2499, note: 'İlk fiyat' },
      { daysAgo: 75, price: 2299, note: 'Sezon indirim' },
      { daysAgo: 60, price: 2099 },
      { daysAgo: 45, price: 1899, note: 'Düşüş devam ediyor' },
      { daysAgo: 30, price: 1699 },
      { daysAgo: 14, price: 1499, note: 'Gerçek indirim!' },
      { daysAgo: 0, price: 1499 },
    ],
  },
];

async function seed() {
  console.log('Seeding database...');

  const now = new Date();

  for (const data of seedData) {
    const [product] = await db
      .insert(productsTable)
      .values({
        name: data.name,
        brand: data.brand,
        category: data.category,
        description: data.description,
        store: data.store,
        storeUrl: data.storeUrl,
        originalPrice: data.originalPrice,
        imageUrl: data.imageUrl,
      })
      .returning();

    console.log(`Created product: ${product.name} (id: ${product.id})`);

    for (const entry of data.priceHistory) {
      const recordedAt = new Date(now);
      recordedAt.setDate(recordedAt.getDate() - entry.daysAgo);

      await db.insert(pricesTable).values({
        productId: product.id,
        price: entry.price,
        note: entry.note ?? null,
        recordedAt,
      });
    }

    console.log(`  Added ${data.priceHistory.length} price entries`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
