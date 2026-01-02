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
  iconColor = "text-muted-foreground",
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-300 border-border shadow-sm bg-card group hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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
        <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trendType === "up" && "text-green-500",
                trendType === "down" && "text-destructive",
                trendType === "neutral" && "text-muted-foreground"
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
