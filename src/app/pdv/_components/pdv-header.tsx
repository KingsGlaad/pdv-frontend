// f:\Projetos\costela\pdv-frontend\src\app\pdv\_components\pdv-header.tsx
"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useConfig } from "@/providers/config-provider";
import Image from "next/image";

interface PDVHeaderProps {
  date: string;
}

export function PDVHeader({ date }: PDVHeaderProps) {
  const { user, signout } = useAuth();
  const { config } = useConfig();

  const appName = config?.appName || "PDV";
  const initials = appName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const getLogoUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const apiUrl = "http://localhost:3000";
    return `${apiUrl}${url}`;
  };

  const logoUrl = getLogoUrl(config?.logoUrl);

  return (
    <header className="bg-background border-b text-foreground p-3 flex justify-between items-center shadow-md shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          {logoUrl ? (
            <div className="h-8 w-8 relative rounded-md overflow-hidden">
              <Image
                src={logoUrl}
                alt={appName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground text-sm">
              {initials}
            </div>
          )}
          <span>
            {appName}{" "}
            <span className="text-muted-foreground font-normal text-sm">
              PDV v1.0
            </span>
          </span>
        </div>
        <div className="h-6 w-px bg-border mx-2"></div>
        <div className="text-sm text-muted-foreground">
          <span className="mx-2">•</span> Operador:{" "}
          <span className="text-foreground font-medium">{user?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-muted px-3 py-1 rounded text-xs text-muted-foreground border border-border">
          <span className="text-green-500">●</span> Online
        </div>
        <div className="text-xs text-muted-foreground font-mono">{date}</div>
        <button
          onClick={signout}
          className="ml-2 hover:bg-accent p-2 rounded-full transition-colors text-muted-foreground hover:text-foreground"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
