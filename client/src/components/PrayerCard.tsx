import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface PrayerCardProps {
  name: string;
  time: string;
  isNext?: boolean;
  isPast?: boolean;
}

function normalizeTime(time: string): string {
  return time.replace(/\s*\([^)]*\)$/, '').split(':').slice(0, 2).join(':');
}

function formatTo12Hour(time24: string): string {
  const normalized = normalizeTime(time24);
  const [hours, minutes] = normalized.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? 'م' : 'ص';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function PrayerCard({ name, time, isNext, isPast }: PrayerCardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between p-4 rounded-xl transition-all duration-300",
        isNext 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
          : "bg-card hover:bg-secondary/50 border border-border/50",
        isPast && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isNext ? "bg-white/20" : "bg-muted text-muted-foreground"
        )}>
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className={cn("font-semibold", isNext ? "text-white" : "text-foreground")}>
            {name}
          </h3>
          {isNext && <span className="text-xs text-primary-foreground/80">الصلاة القادمة</span>}
        </div>
      </div>
      
      <div className={cn(
        "text-xl font-bold font-mono tracking-tight",
        isNext ? "text-white" : "text-primary"
      )}>
        {formatTo12Hour(time)}
      </div>
    </div>
  );
}
