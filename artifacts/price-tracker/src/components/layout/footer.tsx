import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo.png`} 
              alt="Logo" 
              className="w-8 h-8 grayscale"
            />
            <span className="text-lg font-display font-bold tracking-tight text-foreground">
              Fiyat Dedektifi
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Gerçek indirimleri bulmanıza yardımcı olan, topluluk destekli fiyat takip platformu.
          </p>
          <div className="flex gap-6">
            <Link href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tüm Ürünler</Link>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nasıl Çalışır?</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Gizlilik</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
