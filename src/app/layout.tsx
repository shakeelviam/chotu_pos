import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Initialize Poppins font with all weights we'll use
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chotu POS",
  description: "A simple and elegant point of sale system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-polarBlue">
            {/* Background pattern */}
            <div className="fixed inset-0 bg-white/20 bg-[size:40px_40px] grid grid-cols-[repeat(auto-fill,2px)] grid-rows-[repeat(auto-fill,2px)]" />
            
            {/* Gradient overlay */}
            <div className="fixed inset-0 bg-gradient-to-t from-polarBlue/90 to-polarBlue/50 backdrop-blur-[1px]" />
            
            {/* Content */}
            <div className="relative">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
