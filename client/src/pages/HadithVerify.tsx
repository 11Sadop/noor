import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface VerificationHadith {
  id: number;
  text: string;
  status: string;
  source: string;
  narrator: string | null;
  explanation: string | null;
}

interface VerificationStats {
  total: number;
  sahih: number;
  hasan: number;
  daif: number;
  mawdu: number;
}

export default function HadithVerify() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim().length >= 3) {
        setDebouncedSearch(searchText.trim());
        setHasSearched(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const statsQuery = useQuery<VerificationStats>({
    queryKey: ["/api/hadith/verification/stats"],
  });

  const searchQuery = useQuery<VerificationHadith[]>({
    queryKey: ["/api/hadith/verification", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 3) return [];
      const res = await fetch(`/api/hadith/verification?q=${encodeURIComponent(debouncedSearch)}`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: debouncedSearch.length >= 3,
  });

  const results = searchQuery.data || [];
  const isSearching = searchQuery.isLoading;
  const stats = statsQuery.data || { total: 0, sahih: 0, hasan: 0, daif: 0, mawdu: 0 };

  const handleSearch = () => {
    if (searchText.trim().length >= 3) {
      setDebouncedSearch(searchText.trim());
      setHasSearched(true);
    }
  };

  const getGradeInfo = (status: string) => {
    switch (status) {
      case "صحيح":
        return { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" };
      case "حسن":
        return { icon: <CheckCircle className="w-5 h-5 text-blue-500" />, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" };
      case "ضعيف":
        return { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" };
      case "موضوع":
        return { icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" };
      default:
        return { icon: <AlertCircle className="w-5 h-5 text-muted-foreground" />, color: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
      <Header title="التحقق من الحديث" showBack />
      
      <main className="container max-w-md mx-auto px-4 space-y-4 pt-4">
        <Card className="p-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              أدخل نص الحديث أو جزء منه للتحقق من صحته
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="اكتب الحديث هنا..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="text-right"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-hadith-search"
              />
              <Button 
                onClick={handleSearch} 
                disabled={!searchText.trim() || searchText.trim().length < 3 || isSearching}
                data-testid="button-search-hadith"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {searchText.trim().length > 0 && searchText.trim().length < 3 && (
              <p className="text-xs text-muted-foreground text-center">أدخل 3 أحرف على الأقل</p>
            )}
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
              صحيح: {stats.sahih.toLocaleString("ar-SA")}
            </span>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              حسن: {stats.hasan.toLocaleString("ar-SA")}
            </span>
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
              ضعيف: {stats.daif.toLocaleString("ar-SA")}
            </span>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
              موضوع: {stats.mawdu.toLocaleString("ar-SA")}
            </span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            إجمالي الأحاديث في القاعدة: {stats.total.toLocaleString("ar-SA")}
          </p>
        </Card>

        {isSearching && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جاري البحث...</p>
            </div>
          </Card>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <Card className="p-4">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">لم نجد نتائج لهذا البحث</p>
              <p className="text-xs text-muted-foreground">جرب كلمات مختلفة أو جزء أقصر من الحديث</p>
              <a 
                href="https://dorar.net/hadith" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary text-sm"
                data-testid="link-dorar-fallback"
              >
                <ExternalLink className="w-4 h-4" />
                البحث في الدرر السنية
              </a>
            </div>
          </Card>
        )}

        {!isSearching && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              تم العثور على {results.length} نتيجة
            </p>
            {results.map((result) => {
              const gradeInfo = getGradeInfo(result.status);
              return (
                <Card key={result.id} className="p-4 space-y-3" data-testid={`card-hadith-result-${result.id}`}>
                  <div className="flex items-start gap-3">
                    {gradeInfo.icon}
                    <div className="flex-1 space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${gradeInfo.color}`}>
                        {result.status}
                      </span>
                      
                      <p className="text-sm font-arabic leading-relaxed text-right" dir="rtl">
                        {result.text.length > 500 ? result.text.substring(0, 500) + "..." : result.text}
                      </p>

                      {result.narrator && (
                        <p className="text-xs text-muted-foreground">
                          الراوي: {result.narrator}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-secondary px-2 py-1 rounded flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {result.source}
                        </span>
                      </div>

                      {result.explanation && (
                        <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                          {result.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="p-4">
          <p className="text-sm text-center text-muted-foreground mb-3">
            للمزيد من التفاصيل:
          </p>
          <a 
            href="https://dorar.net/hadith" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg text-primary text-sm font-medium"
            data-testid="link-dorar"
          >
            <ExternalLink className="w-4 h-4" />
            الموسوعة الحديثية - الدرر السنية
          </a>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-sm">درجات الحديث</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">صحيح:</span>
              <span className="text-muted-foreground">ثابت عن النبي صلى الله عليه وسلم</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="font-medium">حسن:</span>
              <span className="text-muted-foreground">مقبول ويُعمل به</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="font-medium">ضعيف:</span>
              <span className="text-muted-foreground">لا يحتج به في الأحكام</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="font-medium">موضوع:</span>
              <span className="text-muted-foreground">مكذوب لا أصل له</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
