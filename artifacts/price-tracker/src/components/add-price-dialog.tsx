import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, PenLine } from "lucide-react";

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
import { useAddPriceEntry, getGetProductQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  price: z.coerce.number().min(0.01, "Geçerli bir fiyat girin"),
  note: z.string().optional(),
});

interface AddPriceDialogProps {
  productId: number;
  defaultNote?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  triggerClassName?: string;
}

export function AddPriceDialog({
  productId,
  defaultNote,
  triggerLabel,
  triggerVariant = "outline",
  triggerClassName,
}: AddPriceDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: undefined,
      note: defaultNote ?? "",
    },
  });

  const addPrice = useAddPriceEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
        toast({
          title: "Fiyat Güncellendi",
          description: "Yeni fiyat kaydı başarıyla eklendi.",
        });
        setOpen(false);
        form.reset({ price: undefined, note: defaultNote ?? "" });
      },
      onError: () => {
        toast({
          title: "Hata",
          description: "Fiyat eklenirken bir sorun oluştu.",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addPrice.mutate({
      id: productId,
      data: {
        price: values.price,
        note: values.note || null,
      },
    });
  };

  const label = triggerLabel ?? "Yeni Fiyat Bildir";
  const Icon = defaultNote ? PenLine : Activity;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName ?? "gap-2 font-semibold"}>
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">Güncel Fiyatı Gir</DialogTitle>
          <DialogDescription>
            {defaultNote
              ? "Otomatik güncelleme başarısız oldu. Mağazadan gördüğünüz güncel fiyatı elle girerek fiyat geçmişini güncelleyin."
              : "Bu ürünü mağazada farklı bir fiyata mı gördünüz? Hemen kaydederek fiyat geçmişini güncelleyin."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Güncel Fiyat (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      className="text-lg py-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Not (İsteğe bağlı)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Örn: Sepette %10 indirim kampanyası vardı"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full font-bold h-12 mt-2"
              disabled={addPrice.isPending}
            >
              {addPrice.isPending ? "Kaydediliyor..." : "Fiyatı Kaydet"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
