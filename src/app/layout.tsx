import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans"; // Removed
// import { GeistMono } from "geist/font/mono"; // Removed
import "./globals.css";
import MainLayout from "@/components/common/MainLayout"; // Import the new layout
import { ThemeProvider } from "@/components/theme-provider"; // Assuming theme provider setup for shadcn
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

export const metadata: Metadata = {
  title: "Sistema de Monitoramento de Abate",
  description: "Gerenciamento moderno de escalas de abate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* Removed Geist font variables from className */}
      <body
        className={`antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>{children}</MainLayout>
          <Toaster /> {/* Add Toaster here */}
        </ThemeProvider>
      </body>
    </html>
  );
}

