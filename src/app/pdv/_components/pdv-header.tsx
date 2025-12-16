// f:\Projetos\costela\pdv-frontend\src\app\pdv\_components\pdv-header.tsx
"use client";

import { useAuth } from "@/providers/auth-provider";

interface PDVHeaderProps {
  date: string;
}

export function PDVHeader({ date }: PDVHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900 text-white p-3 flex justify-between items-center shadow-md shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center font-bold">
            KG
          </div>
          <span>
            PDV{" "}
            <span className="text-slate-400 font-normal text-sm">v1.0</span>
          </span>
        </div>
        <div className="h-6 w-px bg-slate-700 mx-2"></div>
        <div className="text-sm text-slate-300">
          Caixa 01 <span className="mx-2">•</span> Operador:{" "}
          <span className="text-white font-medium">{user?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-400 border border-slate-700">
          <span className="text-green-400">●</span> Online
        </div>
        <div className="text-xs text-slate-400 font-mono">{date}</div>
      </div>
    </header>
  );
}
