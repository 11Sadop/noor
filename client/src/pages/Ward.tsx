import { Header } from "@/components/Header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { WardListResponse } from "@shared/routes";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function WardPage() {
  const { data: wardItems, isLoading } = useQuery<WardListResponse>({
    queryKey: ["/api/ward"],
  });
  
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      const res = await apiRequest("PATCH", `/api/ward/${id}/toggle`, { isCompleted });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ward"] });
    },
  });

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getExcerpt = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header title="الورد اليومي" subtitle="تتبع وردك القرآني والأذكار" />
      
      <main className="container max-w-md mx-auto px-4 pt-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : wardItems?.map((item) => {
          const isExpanded = expandedItems[item.id];
          
          return (
            <div 
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.isCompleted 
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800" 
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-row-reverse">
                <div className="space-y-2 text-right flex-1">
                  <div className="flex items-center justify-between flex-row-reverse gap-2">
                    <h4 className={`font-bold ${item.isCompleted ? "text-emerald-700 dark:text-emerald-400 line-through opacity-70" : ""}`}>
                      {item.title}
                    </h4>
                    {item.repeatCount > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.repeatCount}x
                      </Badge>
                    )}
                  </div>
                  
                  <p className="font-arabic text-lg text-right leading-relaxed whitespace-pre-line">
                    {isExpanded ? item.arabicText : getExcerpt(item.arabicText)}
                  </p>
                  
                  {isExpanded && item.virtueHadith && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-arabic text-right leading-relaxed text-foreground/80">
                        {item.virtueHadith}
                      </p>
                      {item.virtueSource && (
                        <p className="text-xs text-primary font-medium mt-2 text-right">
                          — {item.virtueSource}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer flex-row-reverse mt-2"
                    data-testid={`button-expand-ward-${item.id}`}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        <span>إخفاء</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        <span>عرض الكل</span>
                      </>
                    )}
                  </button>
                </div>
                <button 
                  onClick={() => toggleMutation.mutate({ id: item.id, isCompleted: !item.isCompleted })}
                  disabled={toggleMutation.isPending}
                  className="mt-1"
                  data-testid={`button-toggle-ward-${item.id}`}
                >
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {!isLoading && (!wardItems || wardItems.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد مهام ورد يومي حالياً.
          </div>
        )}
      </main>
    </div>
  );
}
