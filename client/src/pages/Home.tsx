import { useDailyHadith } from "@/hooks/use-content";
import { usePrayerTimes, getNextPrayer } from "@/hooks/use-prayer-times";
import { Header } from "@/components/Header";
import { PrayerCard } from "@/components/PrayerCard";
import { Loader2, ArrowRight, RefreshCw, BookOpen, ShieldCheck, Calculator, Compass, Library, Search } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: hadith, isLoading: isHadithLoading, refetch } = useDailyHadith();
  const { data: prayerData, isLoading: isPrayerLoading } = usePrayerTimes();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshedHadith, setRefreshedHadith] = useState<typeof hadith | null>(null);

  const handleRefreshHadith = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiRequest("POST", "/api/hadith/refresh");
      const newHadith = await response.json();
      setRefreshedHadith(newHadith);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayHadith = refreshedHadith || hadith;

  const nextPrayer = prayerData ? getNextPrayer(prayerData.timings) : null;
  const today = new Date();

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
      <Header title="نور" subtitle={format(today, "EEEE, d MMMM yyyy")} />
    
      <main className="container max-w-md mx-auto px-4 space-y-6 pt-4">
        {/* Next Prayer Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative p-6 sm:p-8 text-center space-y-2">
            {isPrayerLoading ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
              </div>
            ) : nextPrayer ? (
              <>
                <p className="text-primary-foreground/80 font-medium tracking-wide text-sm uppercase">الصلاة القادمة</p>
                <h2 className="text-5xl font-bold font-display tracking-tight mt-1">{nextPrayer.name}</h2>
                <div className="text-3xl font-mono font-medium opacity-90 mt-2">{nextPrayer.time}</div>
                {prayerData?.date?.hijri && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs sm:text-sm text-primary-foreground/70">
                    {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} هـ
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/80">يرجى تفعيل الموقع</p>
                <Link href="/settings" className="mt-2 inline-block text-xs underline">الإعدادات</Link>
              </div>
            )}
          </div>
        </section>

        {/* Hadith Collections Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <Link 
            href="/hadith-collections" 
            className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
            data-testid="link-hadith-collections"
          >
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-right">كتب الحديث الصحيحة</h3>
                <p className="text-xs text-muted-foreground text-right">صحيح البخاري ومسلم</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Library className="w-5 h-5" />
              </div>
            </div>
          </Link>
          <div className="border-t border-border" />
          <Link 
            href="/hadith-verify" 
            className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
            data-testid="link-hadith-verify"
          >
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-right">التحقق من الحديث</h3>
                <p className="text-xs text-muted-foreground text-right">تأكد من صحة الأحاديث</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3">
          <Link href="/adhkar" className="bg-card hover:bg-secondary/30 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <span className="font-arabic text-xl">أ</span>
            </div>
            <span className="font-medium text-sm">الأذكار</span>
          </Link>
          <Link href="/duas" className="bg-card hover:bg-secondary/30 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="font-arabic text-xl">د</span>
            </div>
            <span className="font-medium text-sm">الأدعية</span>
          </Link>
        </section>

        {/* Daily Hadith */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-lg">الحديث اليومي</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleRefreshHadith}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">صحيح</span>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            {isHadithLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayHadith ? (
              <div className="space-y-4">
                <p className="text-right font-arabic text-xl leading-loose text-foreground/90">
                  {displayHadith.arabicText}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed italic text-right">
                  "{displayHadith.translation}"
                </p>
                <p className="text-xs text-primary font-bold uppercase tracking-wider text-right">
                  — {displayHadith.source}
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">الحديث غير متوفر</p>
            )}
          </div>
        </section>

        {/* Daily Ward & Protection */}
        <section className="grid grid-cols-2 gap-3">
          <Link href="/ward" className="bg-card hover:bg-secondary/30 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">الورد اليومي</span>
          </Link>
          <Link href="/protection" className="bg-card hover:bg-secondary/30 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">أذكار الوقاية</span>
          </Link>
        </section>

        {/* Zakat & Qibla */}
        <section className="grid grid-cols-2 gap-3 pb-4">
          <Link href="/zakat" data-testid="link-zakat" className="bg-card hover:bg-secondary/30 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">حاسبة الزكاة</span>
          </Link>
          <Link href="/qibla" data-testid="link-qibla" className="bg-card hover:bg-secondary/30 transition-colors p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">اتجاه القبلة</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
