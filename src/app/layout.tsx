// src/app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ConfigProvider } from "@/providers/config-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConfigProvider>
              {children}
              <Toaster richColors theme="system" />
            </ConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
