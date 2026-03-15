import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatTRY } from "@/lib/utils";
import { PackageSearch, TrendingDown, AlertTriangle } from "lucide-react";
import type { ProductSummary } from "@workspace/api-client-react";

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block h-full outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl transition-all">
      <Card className="hover-elevate cursor-pointer h-full flex flex-col group overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
        <div className="relative aspect-[4/3] bg-muted/20 p-6 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-contain h-full w-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out" 
            />
          ) : (
            <PackageSearch className="w-16 h-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
          )}
          
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <Badge 
              className={cn(
                "shadow-md font-bold px-2.5 py-1 text-xs border-0", 
                product.isFakeDiscount 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-[#10b981] text-white" // explicitly using emerald-500 equivalent
              )}
            >
              {product.isFakeDiscount ? (
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Sahte İndirim</span>
              ) : (
                <span className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5" /> Gerçek İndirim</span>
              )}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
            <span className="font-semibold uppercase tracking-wider">{product.brand}</span>
            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[10px]">{product.store}</span>
          </div>
          
          <h3 className="font-bold text-foreground line-clamp-2 text-sm md:text-base leading-snug mb-5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="mt-auto flex items-end justify-between pt-2 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground line-through decoration-destructive/50 mb-0.5">
                {formatTRY(product.originalPrice)}
              </p>
              <p className="text-lg md:text-xl font-display font-black text-foreground">
                {formatTRY(product.currentPrice)}
              </p>
            </div>
            
            <div className={cn(
              "font-black text-lg md:text-2xl tracking-tighter", 
              product.isFakeDiscount ? "text-destructive" : "text-[#10b981]"
            )}>
              %{product.discountPercent.toFixed(0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
