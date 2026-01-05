// src/app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import { SalesNotificationListener } from "@/components/sales-notification-listener";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ConfigProvider } from "@/providers/config-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SocketProvider } from "@/providers/socket-provider";

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
              <SocketProvider>
                <SalesNotificationListener />
                {children}
              </SocketProvider>
              <Toaster richColors theme="system" />
            </ConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
