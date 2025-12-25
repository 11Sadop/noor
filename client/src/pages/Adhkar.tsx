import { useAdhkar } from "@/hooks/use-content";
import { Header } from "@/components/Header";
import { ContentCard } from "@/components/ContentCard";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "morning", label: "الصباح" },
  { id: "evening", label: "المساء" },
  { id: "after_prayer", label: "بعد الصلاة" },
  { id: "upon_waking", label: "عند الاستيقاظ" },
];

export default function AdhkarPage() {
  const [selectedCategory, setSelectedCategory] = useState("morning");
  const { data: adhkarList, isLoading } = useAdhkar(selectedCategory);

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header title="أذكار المسلم" />
      
      <main className="container max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 flex-row-reverse">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : adhkarList && adhkarList.length > 0 ? (
            adhkarList.map((item: any) => (
              <ContentCard
                key={item.id}
                arabic={item.arabicText}
                translation={item.translation}
                transliteration={item.transliteration}
                reference={item.reference}
                virtueHadith={item.virtueHadith}
                virtueSource={item.virtueSource}
                count={item.count}
                countLabel={item.countLabel}
              />
            ))
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              لا توجد أذكار لهذا التصنيف حالياً.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
