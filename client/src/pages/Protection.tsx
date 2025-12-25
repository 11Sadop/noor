import { Header } from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { ProtectionHadithResponse } from "@shared/routes";

export default function ProtectionPage() {
  const { data: hadiths, isLoading } = useQuery<ProtectionHadithResponse>({
    queryKey: ["/api/hadith/protection"],
  });

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header title="أذكار الوقاية" subtitle="حصن المسلم من العين والحسد" />
      
      <main className="container max-w-md mx-auto px-4 pt-6 space-y-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex items-start gap-3 flex-row-reverse">
          <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
          <p className="text-sm text-indigo-800 dark:text-indigo-300 text-right">
            أذكار وأحاديث مأثورة للوقاية من العين والحسد والشرور.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : hadiths?.map((hadith) => (
          <div key={hadith.id} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 space-y-4">
            <p className="text-right font-arabic text-xl leading-loose text-foreground/90">
              {hadith.arabicText}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed italic text-right">
                "{hadith.translation}"
              </p>
              <p className="text-xs text-primary font-bold uppercase tracking-wider text-right">
                — {hadith.source}
              </p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
