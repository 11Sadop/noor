import { useDuas } from "@/hooks/use-content";
import { Header } from "@/components/Header";
import { ContentCard } from "@/components/ContentCard";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "forgiveness", label: "الاستغفار" },
  { id: "stress", label: "الهم والغم" },
  { id: "travel", label: "السفر" },
  { id: "family", label: "الأهل والمنزل" },
  { id: "health", label: "الشفاء" },
];

export default function DuasPage() {
  const [selectedCategory, setSelectedCategory] = useState("forgiveness");
  const { data: duasList, isLoading } = useDuas(selectedCategory);

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header title="الأدعية" subtitle="أدعية من الكتاب والسنة" />
      
      <main className="container max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 flex-row-reverse">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/50"
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
          ) : duasList && duasList.length > 0 ? (
            duasList.map((item) => (
              <ContentCard
                key={item.id}
                arabic={item.arabicText}
                translation={item.translation}
                reference={item.reference}
              />
            ))
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              لا توجد أدعية لهذا التصنيف حالياً.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
