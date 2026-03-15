import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, ExternalLink, Store, ChevronDown, ChevronUp, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSetOfficialPrice, getGetProductQueryKey } from "@workspace/api-client-react";
import { formatTRY } from "@/lib/utils";

interface Props {
  productId: number;
  currentPrice: number;
  officialPrice?: number | null;
  officialStoreName?: string | null;
  officialStoreUrl?: string | null;
}

const formSchema = z.object({
  officialPrice: z.coerce.number().min(1, "Geçerli bir fiyat girin"),
  officialStoreUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
  officialStoreName: z.string().optional(),
});

export function OfficialPriceWarning({
  productId,
  currentPrice,
  officialPrice,
  officialStoreName,
  officialStoreUrl,
}: Props) {
  const [showManualForm, setShowManualForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isBelowOfficial = officialPrice != null && currentPrice < officialPrice * 0.98;
  const isMuchBelow = officialPrice != null && currentPrice < officialPrice * 0.85;
  const priceDiffPercent = officialPrice != null
    ? Math.round(((officialPrice - currentPrice) / officialPrice) * 100)
    : 0;

  const mutation = useSetOfficialPrice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
        toast({ title: "Resmi fiyat kaydedildi", description: "Bilgi güncellendi." });
        setShowManualForm(false);
      },
      onError: () => {
        toast({ title: "Hata", description: "Fiyat kaydedilemedi.", variant: "destructive" });
      },
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officialPrice: officialPrice ?? undefined,
      officialStoreUrl: officialStoreUrl ?? "",
      officialStoreName: officialStoreName ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      id: productId,
      data: {
        officialPrice: values.officialPrice,
        officialStoreUrl: values.officialStoreUrl || null,
        officialStoreName: values.officialStoreName || "Resmi Mağaza",
      },
    });
  };

  // If no official price set yet — show subtle "set official price" prompt
  if (officialPrice == null) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted p-2 rounded-xl">
              <Store className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Resmi Mağaza Fiyatı</p>
              <p className="text-xs text-muted-foreground">
                Markanın Türkiye'deki resmi fiyatını ekleyerek sahte/gri piyasa kontrolü yapın.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 font-semibold"
            onClick={() => setShowManualForm((v) => !v)}
          >
            <PenLine className="w-3.5 h-3.5" />
            Fiyat Ekle
            {showManualForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <AnimatePresence>
          {showManualForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ManualForm form={form} onSubmit={onSubmit} isPending={mutation.isPending} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Official price set — show comparison
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-5 ${
        isMuchBelow
          ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50"
          : isBelowOfficial
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
          : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          isMuchBelow
            ? "bg-red-100 dark:bg-red-900/30"
            : isBelowOfficial
            ? "bg-amber-100 dark:bg-amber-900/30"
            : "bg-emerald-100 dark:bg-emerald-900/30"
        }`}>
          <ShieldAlert className={`w-5 h-5 ${
            isMuchBelow
              ? "text-red-600 dark:text-red-400"
              : isBelowOfficial
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className={`font-bold text-base ${
              isMuchBelow
                ? "text-red-800 dark:text-red-300"
                : isBelowOfficial
                ? "text-amber-800 dark:text-amber-300"
                : "text-emerald-800 dark:text-emerald-300"
            }`}>
              {isMuchBelow
                ? "⚠️ Orijinal Fiyatın Çok Altında — Dikkat!"
                : isBelowOfficial
                ? "Orijinal Mağaza Fiyatının Altında"
                : "Normal Piyasa Fiyatı"}
            </p>
          </div>

          <p className={`text-sm mb-3 ${
            isMuchBelow
              ? "text-red-700 dark:text-red-400"
              : isBelowOfficial
              ? "text-amber-700 dark:text-amber-400"
              : "text-emerald-700 dark:text-emerald-400"
          }`}>
            {isMuchBelow
              ? `Bu fiyat ${officialStoreName || "resmi mağaza"} fiyatının %${priceDiffPercent} altında. Sahte veya gri piyasa ürün olabilir — dikkatli olun.`
              : isBelowOfficial
              ? `Bu fiyat ${officialStoreName || "resmi mağaza"} fiyatından %${priceDiffPercent} daha ucuz. Kampanya dönemi veya gri piyasa olabilir.`
              : `Bu fiyat ${officialStoreName || "resmi mağaza"} fiyatıyla uyumlu. Normal piyasa koşulları.`}
          </p>

          {/* Price comparison bar */}
          <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Takip edilen fiyat</span>
              <span className="font-bold text-foreground">{formatTRY(currentPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                {officialStoreName || "Resmi mağaza"}
              </span>
              <span className="font-bold text-foreground">{formatTRY(officialPrice)}</span>
            </div>
            {isBelowOfficial && (
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Fark</span>
                <span className={`font-bold ${isMuchBelow ? "text-red-600" : "text-amber-600"}`}>
                  {formatTRY(officialPrice - currentPrice)} daha ucuz (%{priceDiffPercent})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {officialStoreUrl && (
              <a
                href={officialStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  isMuchBelow
                    ? "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : isBelowOfficial
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                {officialStoreName || "Resmi Mağazaya Git"}
              </a>
            )}
            <button
              onClick={() => setShowManualForm((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <PenLine className="w-3 h-3" />
              Fiyatı Güncelle
              {showManualForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showManualForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="pt-3 border-t border-border/30">
              <ManualForm form={form} onSubmit={onSubmit} isPending={mutation.isPending} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ManualForm({
  form,
  onSubmit,
  isPending,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  onSubmit: (v: z.infer<typeof formSchema>) => void;
  isPending: boolean;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="officialPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Resmi Mağaza Fiyatı (₺)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="örn: 54999"
                    {...field}
                    value={field.value ?? ""}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="officialStoreName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Mağaza Adı (isteğe bağlı)</FormLabel>
                <FormControl>
                  <Input placeholder="örn: Apple Türkiye" {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="officialStoreUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Resmi Mağaza URL'si (isteğe bağlı)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.apple.com/tr/shop/..."
                  {...field}
                  className="h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" className="w-full font-bold" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Resmi Fiyatı Kaydet"}
        </Button>
      </form>
    </Form>
  );
}
