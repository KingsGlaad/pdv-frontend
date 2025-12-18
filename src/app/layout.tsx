// src/app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors theme="system"/>
        </AuthProvider>
      </body>
    </html>
  );
}
