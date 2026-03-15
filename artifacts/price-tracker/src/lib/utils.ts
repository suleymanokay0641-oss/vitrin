import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const BASE = import.meta.env.BASE_URL;
export function getApiUrl(path: string): string {
  return `${BASE}api/${path}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTRY(value: number) {
  return new Intl.NumberFormat("tr-TR", { 
    style: "currency", 
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
