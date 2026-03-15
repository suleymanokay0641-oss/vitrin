import { Link, useLocation } from "wouter";
import { Search, Gamepad2, Building2, X, Coins, Crown, Megaphone, Trophy, LogIn, User, LogOut, FolderOpen, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AddProductDialog } from "@/components/add-product-dialog";
import { usePoints } from "@/hooks/use-points";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isHome = location === "/";
  const { balance, userId: legacyUserId } = usePoints();
  const { user, logout } = useAuth();

  const displayUserId = user?.id || legacyUserId;
  const username = user?.displayName || user?.email?.split("@")[0] || null;

  useEffect(() => {
    if (location.startsWith("/search")) {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") || "");
    } else {
      setQuery("");
    }
  }, [location]);

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : `/search`);
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSearchOpen(false);
    setLocation(mobileQuery.trim() ? `/search?q=${encodeURIComponent(mobileQuery.trim())}` : `/search`);
    setMobileQuery("");
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      {mobileSearchOpen && (
        <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3 md:hidden">
          <form onSubmit={handleMobileSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={mobileInputRef}
              type="text"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Ürün, marka veya kategori ara..."
              className="w-full pl-9 pr-20 py-2.5 rounded-full border border-border/60 bg-muted/30 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
            >
              Ara
            </button>
          </form>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 rounded-xl hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src={`${import.meta.env.BASE_URL}images/logo.png`}
            alt="Vitrin Logo"
            className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="text-xl font-display font-black tracking-tight text-foreground hidden sm:block">
            <span className="text-primary">Vitrin</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl hidden md:flex items-center relative group"
        >
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors hover:text-primary p-0.5"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isHome ? "Ürün ara..." : "Ürün, marka veya kategori ara..."}
            className="w-full pl-9 pr-28 py-2.5 rounded-full border border-border/60 bg-muted/30 focus:bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            Sorgula
          </button>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            href="/oyun"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Oyun</span>
          </Link>

          <Link
            href="/siralama"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
          >
            <Trophy className="w-4 h-4" />
            <span>Sıralama</span>
          </Link>

          <Link
            href="/reklam-ver"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
          >
            <Megaphone className="w-4 h-4" />
            <span>Reklam</span>
          </Link>

          <Link
            href="/premium"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span>Pro</span>
          </Link>

          {/* Puan / cüzdan butonu */}
          <Link href="/cuzdan">
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              displayUserId
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                : "hover:bg-muted text-muted-foreground hover:text-primary"
            }`}>
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">{displayUserId && balance ? `${balance.totalPoints}` : "Kazan"}</span>
            </div>
          </Link>

          {/* Auth bölümü */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  user.isChampion
                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {user.isChampion && <Crown className="w-4 h-4 text-amber-500" />}
                <span className="max-w-[80px] truncate hidden sm:block">{username}</span>
                <User className="w-4 h-4 sm:hidden" />
                <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-bold text-sm truncate">{user.displayName || username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {username && (
                      <Link
                        href={`/vitrin/${username}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4 text-primary" />
                        Vitrinim
                      </Link>
                    )}
                    <Link
                      href="/koleksiyonlar"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <FolderOpen className="w-4 h-4 text-primary" />
                      Koleksiyonlarım
                    </Link>
                    <Link
                      href="/cuzdan"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Coins className="w-4 h-4 text-amber-500" />
                      Cüzdan
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/giris"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş</span>
            </Link>
          )}

          <AddProductDialog />
        </div>
      </div>
    </header>
  );
}
