import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCreateProduct, getSearchProductsQueryKey, scrapeUrl } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  brand: z.string().min(1, "Marka zorunludur"),
  category: z.string().min(1, "Kategori zorunludur"),
  store: z.string().min(1, "Mağaza adı zorunludur"),
  storeUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
  initialPrice: z.coerce.number().min(0.01, "Geçerli bir fiyat girin"),
  originalPrice: z.coerce.number().min(0.01, "Geçerli bir fiyat girin"),
  imageUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [scrapeInputUrl, setScrapeInputUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedStoreOffers, setScrapedStoreOffers] = useState<unknown[]>([]);
  const [showScraperHint, setShowScraperHint] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      store: "",
      storeUrl: "",
      initialPrice: undefined,
      originalPrice: undefined,
      imageUrl: "",
      description: "",
    },
  });

  const handleScrape = async () => {
    if (!scrapeInputUrl.trim()) {
      toast({ title: "URL girin", description: "Otomatik doldurmak için bir ürün URL'si yapıştırın.", variant: "destructive" });
      return;
    }

    try {
      new URL(scrapeInputUrl);
    } catch {
      toast({ title: "Geçersiz URL", description: "Lütfen geçerli bir web adresi girin.", variant: "destructive" });
      return;
    }

    setIsScraping(true);
    try {
      const data = await scrapeUrl({ url: scrapeInputUrl });

      if (data.name) form.setValue("name", data.name);
      if (data.brand) form.setValue("brand", data.brand);
      if (data.category) form.setValue("category", data.category);
      if (data.store) form.setValue("store", data.store);
      if (data.description) form.setValue("description", data.description);
      if (data.imageUrl) form.setValue("imageUrl", data.imageUrl);
      if (data.currentPrice) form.setValue("initialPrice", data.currentPrice);
      if (data.originalPrice) form.setValue("originalPrice", data.originalPrice);
      form.setValue("storeUrl", scrapeInputUrl);
      if ((data as { storeOffers?: unknown[] }).storeOffers) {
        setScrapedStoreOffers((data as { storeOffers: unknown[] }).storeOffers);
      }

      toast({
        title: "Bilgiler otomatik dolduruldu!",
        description: data.name ? `"${data.name}" ürünü bulundu.` : "Temel bilgiler çekildi, eksikleri tamamlayın.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      const isCloudflare = message.toLowerCase().includes("cloudflare") || message.toLowerCase().includes("scraperapi") || message.toLowerCase().includes("bot");
      if (isCloudflare) {
        setShowScraperHint(true);
      } else {
        toast({
          title: "Otomatik doldurma başarısız",
          description: message.includes("fetch") ? "Site erişimi engellenmiş, bilgileri manuel girin." : message,
          variant: "destructive",
        });
      }
    } finally {
      setIsScraping(false);
    }
  };

  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getSearchProductsQueryKey() });
        toast({
          title: "Başarılı!",
          description: "Ürün başarıyla takibe alındı.",
        });
        setOpen(false);
        form.reset();
        setScrapeInputUrl("");
        setLocation(`/product/${data.id}`);
      },
      onError: () => {
        toast({
          title: "Hata",
          description: "Ürün eklenirken bir sorun oluştu.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const storedUserId = localStorage.getItem("fd-user-id");
    createProduct.mutate({
      data: {
        name: values.name,
        brand: values.brand,
        category: values.category,
        store: values.store,
        storeUrl: values.storeUrl || null,
        initialPrice: values.initialPrice,
        originalPrice: values.originalPrice,
        imageUrl: values.imageUrl || null,
        description: values.description || null,
        storeOffers: scrapedStoreOffers.length > 0 ? scrapedStoreOffers : undefined,
        ...(storedUserId ? { createdByUserId: parseInt(storedUserId) } : {}),
      } as Parameters<typeof createProduct.mutate>[0]["data"]
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { form.reset(); setScrapeInputUrl(""); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-bold shadow-sm hover-elevate active-elevate-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Ürün Ekle</span>
          <span className="sm:hidden">Ekle</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">Yeni Ürün Takibi Başlat</DialogTitle>
          <DialogDescription>
            Ürün URL'sini yapıştırın ve bilgileri otomatik doldurun, ya da kendiniz girin.
          </DialogDescription>
        </DialogHeader>

        {/* URL Auto-fill Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-2">
          <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Otomatik Doldur (URL ile)
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 text-sm"
                placeholder="https://www.trendyol.com/..."
                value={scrapeInputUrl}
                onChange={(e) => setScrapeInputUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScrape(); } }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleScrape}
              disabled={isScraping}
              className="shrink-0 font-semibold"
            >
              {isScraping ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Yüklüyor</> : "Getir"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Trendyol, Hepsiburada, Amazon, <strong>Akakçe</strong> ve diğer siteler desteklenir.</p>
        </div>

        {/* ScraperAPI setup hint — shown when Cloudflare blocks scraping */}
        {showScraperHint && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Bot koruması algılandı (Cloudflare)
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Bu site sunucu taraflı erişimi engelliyor. Çözmek için ücretsiz bir proxy servisi bağlayabilirsiniz.
                </p>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 space-y-2 text-xs">
              <p className="font-semibold text-foreground">📋 Kurulum (2 dakika, ücretsiz):</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>
                  <a href="https://www.scraperapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">scraperapi.com</a>
                  {" "}adresine gidin ve ücretsiz hesap açın (kart gerekmez)
                </li>
                <li>Dashboard'dan API anahtarınızı kopyalayın</li>
                <li>Bu projenin <strong>Secrets</strong> bölümüne gidin</li>
                <li><code className="bg-muted px-1 rounded">SCRAPER_API_KEY</code> adıyla anahtarı ekleyin</li>
                <li>Uygulamayı yeniden başlatın ve tekrar deneyin</li>
              </ol>
              <p className="text-muted-foreground pt-1">Ücretsiz plan: 1.000 istek/ay — Akakçe + tüm korumalı siteler için yeterli.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowScraperHint(false)}
                className="text-xs text-muted-foreground underline"
              >
                Kapat
              </button>
              <span className="text-xs text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => { setShowScraperHint(false); }}
                className="text-xs text-amber-700 dark:text-amber-400 font-medium underline"
              >
                Manuel doldurmaya devam et
              </button>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: iPhone 15 Pro 256GB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marka</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Apple" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Elektronik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="store"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mağaza</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Hepsiburada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mağaza URL (İsteğe bağlı)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
              <FormField
                control={form.control}
                name="initialPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">İndirimli Fiyat (Mevcut)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Üstü Çizili Fiyat (Eski)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Görsel URL (İsteğe bağlı)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://cdn.example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama (İsteğe bağlı)</FormLabel>
                  <FormControl>
                    <Input placeholder="Kısa ürün açıklaması..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full font-bold h-12 text-lg mt-4" 
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ekleniyor...</>
              ) : "Ürünü Takibe Al"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
