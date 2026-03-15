import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatTRY, formatDate } from "@/lib/utils";
import type { PriceEntry } from "@workspace/api-client-react";

interface PriceChartProps {
  data: PriceEntry[];
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    // Sort by date ascending to show timeline correctly
    return [...data]
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .map(entry => ({
        rawDate: entry.recordedAt,
        date: formatDate(entry.recordedAt),
        price: entry.price,
      }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed">
        <p className="text-muted-foreground text-sm">Yeterli fiyat verisi yok.</p>
      </div>
    );
  }

  // Calculate min and max for y-axis domain to make chart more dramatic
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const domainPadding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1;

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickMargin={12}
            minTickGap={30}
          />
          <YAxis
            domain={[Math.max(0, minPrice - domainPadding), maxPrice + domainPadding]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₺${value}`}
            tickMargin={12}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderRadius: '12px', 
              border: '1px solid hsl(var(--border))', 
              boxShadow: 'var(--shadow-lg)' 
            }}
            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', fontSize: '16px' }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '13px', marginBottom: '4px' }}
            formatter={(value: number) => [formatTRY(value), "Kayıtlı Fiyat"]}
            labelFormatter={(label) => `Tarih: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 3 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
