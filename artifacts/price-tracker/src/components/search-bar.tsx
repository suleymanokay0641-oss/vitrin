import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialValue?: string;
  className?: string;
  size?: "default" | "lg";
}

export function SearchBar({ initialValue = "", className, size = "default" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    } else {
      setLocation(`/search`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("flex w-full gap-2 group", className)}>
      <div className="relative flex-1">
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none",
          size === "lg" ? "w-6 h-6 left-5" : "w-5 h-5 left-4"
        )} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ürün adı, marka veya mağaza ile indirim sorgula..."
          className={cn(
            "w-full bg-background/95 backdrop-blur-sm border-2 border-border/50 text-foreground shadow-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/60",
            size === "lg" ? "pl-14 pr-4 py-5 rounded-2xl text-lg" : "pl-12 pr-4 py-3 rounded-xl text-base"
          )}
        />
      </div>
      <Button
        type="submit"
        size={size === "lg" ? "lg" : "default"}
        className={cn(
          "font-bold shadow-md hover:shadow-lg transition-all shrink-0",
          size === "lg" ? "px-8 rounded-2xl text-base h-auto" : "px-6 rounded-xl"
        )}
      >
        Sorgula
      </Button>
    </form>
  );
}
