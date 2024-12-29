import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color palette
export const colors = {
  primary: {
    DEFAULT: "#2b5f6d",
    light: "#96d1bf",
    dark: "#1d4d5a",
  },
  secondary: {
    DEFAULT: "#b69f52",
    light: "#ccc894",
    dark: "#8c7940",
  },
  neutral: {
    50: "#f8f9fa",
    100: "#e9ecef",
    200: "#dee2e6",
    300: "#ced4da",
    400: "#adb5bd",
    500: "#6c757d",
    600: "#495057",
    700: "#343a40",
    800: "#212529",
    900: "#1a1d20",
  },
  success: {
    DEFAULT: "#28a745",
    light: "#48c76c",
    dark: "#1e7e34",
  },
  warning: {
    DEFAULT: "#ffc107",
    light: "#ffcd39",
    dark: "#d39e00",
  },
  error: {
    DEFAULT: "#dc3545",
    light: "#e4606d",
    dark: "#bd2130",
  },
} as const;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
