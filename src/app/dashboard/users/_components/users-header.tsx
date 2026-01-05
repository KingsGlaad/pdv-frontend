import { Button } from "@/components/ui/button";
import { Users, RefreshCw } from "lucide-react";

interface UsersHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export function UsersHeader({ onRefresh, loading }: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        Usuários
      </h2>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
        />
        Atualizar
      </Button>
    </div>
  );
}
