import { useSearchProducts, useGetCategories } from "@workspace/api-client-react";
import { useQueryParams } from "@/hooks/use-query-params";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function Search() {
  const params = useQueryParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";

  const { data: products, isLoading: productsLoading } = useSearchProducts({ 
    q: q || undefined, 
    category: category || undefined 
  });
  
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();

  const pageTitle = q
    ? `"${q}" Sonuçları${category ? ` — ${category}` : ""} | Fiyat Dedektifi`
    : category
    ? `${category} Ürünleri | Fiyat Dedektifi`
    : "Tüm Ürünler | Fiyat Dedektifi";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Fiyat Dedektifi'nde ${q || category || "tüm"} ürünleri arayın. Sahte indirim tespiti ve fiyat geçmişi analizi ile en iyi fırsatları bulun.`} />
        <meta property="og:title" content={pageTitle} />
      </Helmet>
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Kategoriler
          </h3>
          <div className="space-y-1.5">
            <Link 
              href={`/search${q ? `?q=${q}` : ''}`} 
              className={cn(
                "block px-4 py-2.5 rounded-xl transition-all duration-200", 
                !category 
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                  : "bg-card hover:bg-accent text-foreground hover-elevate"
              )}
            >
              Tüm Ürünler
            </Link>
            
            {categoriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))
            ) : (
              categories?.map(cat => (
                <Link 
                  key={cat} 
                  href={`/search?category=${encodeURIComponent(cat)}${q ? `&q=${q}` : ''}`} 
                  className={cn(
                    "block px-4 py-2.5 rounded-xl transition-all duration-200", 
                    category === cat 
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                      : "bg-card hover:bg-accent text-foreground hover-elevate"
                  )}
                >
                  {cat}
                </Link>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="mb-8 hidden md:block">
          <SearchBar initialValue={q} size="lg" className="max-w-3xl" />
        </div>
        
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-black text-foreground">
            {q ? `"${q}" için sonuçlar` : (category ? `${category} Ürünleri` : "Tüm Ürünler")}
          </h2>
          <span className="text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-lg">
            {products?.length || 0} ürün
          </span>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[280px] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-card rounded-3xl border border-dashed border-border/60 text-center px-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <PackageSearch className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">Ürün Bulunamadı</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Arama kriterlerinize uygun bir fiyat kaydı bulamadık. Başka bir kelime ile aramayı deneyin veya bu ürünü siz ekleyin.
            </p>
            <Button onClick={() => window.scrollTo(0,0)} className="font-bold px-8" size="lg">
              Farklı Bir Arama Yap
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
