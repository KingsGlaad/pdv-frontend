import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string; // Just a string for now e.g. "+20%"
  trendType?: "up" | "down" | "neutral";
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "neutral",
  iconColor = "text-slate-500",
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-300 border-slate-200 shadow-sm bg-white group hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
          {title}
        </CardTitle>
        <Icon
          className={cn(
            "h-4 w-4 transition-transform group-hover:scale-110",
            iconColor
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
          {value}
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trendType === "up" && "text-green-600",
                trendType === "down" && "text-red-600",
                trendType === "neutral" && "text-slate-600"
              )}
            >
              {trend}
            </span>
          )}
          {description && <span className="opacity-80">{description}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
