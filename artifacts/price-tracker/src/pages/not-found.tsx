import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center w-full px-4">
      <div className="text-center">
        <AlertCircle className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-6xl font-display font-black mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Aradığınız sayfa bulunamadı.</p>
        <Button asChild size="lg" className="font-bold text-lg px-8">
          <Link href="/">Ana Sayfaya Dön</Link>
        </Button>
      </div>
    </div>
  );
}
