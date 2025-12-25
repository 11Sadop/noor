import { usePrayerTimes, getNextPrayer } from "@/hooks/use-prayer-times";
import { Header } from "@/components/Header";
import { PrayerCard } from "@/components/PrayerCard";
import { Loader2, MapPin, Search, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePrayerNotifications } from "@/hooks/use-notifications";

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

const saudiCities = [
  { name: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
  { name: "المدينة المنورة", lat: 24.5247, lng: 39.5692 },
  { name: "الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", lat: 21.5433, lng: 39.1728 },
  { name: "الدمام", lat: 26.4207, lng: 50.0888 },
  { name: "الخبر", lat: 26.2172, lng: 50.1971 },
  { name: "الطائف", lat: 21.2854, lng: 40.4150 },
  { name: "تبوك", lat: 28.3998, lng: 36.5715 },
  { name: "بريدة", lat: 26.3286, lng: 43.9710 },
  { name: "أبها", lat: 18.2164, lng: 42.5053 },
];

export default function PrayerTimes() {
  const { toast } = useToast();
  const [savedLocation, setSavedLocation] = useLocalStorage<{latitude: number, longitude: number, city?: string} | null>("user_location", null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { data: prayerData, isLoading, refetch } = usePrayerTimes();

  usePrayerNotifications(prayerData?.timings || null);

  const filteredCities = saudiCities.filter(city => 
    city.name.includes(searchQuery)
  );

  const selectCity = (city: typeof saudiCities[0]) => {
    const newLocation = { latitude: city.lat, longitude: city.lng, city: city.name };
    setSavedLocation(newLocation);
    localStorage.setItem('user_location', JSON.stringify(newLocation));
    setShowCityPicker(false);
    toast({
      title: "تم تحديد الموقع",
      description: `تم اختيار ${city.name}`,
    });
    setTimeout(() => refetch(), 100);
  };

  const getAutoLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setSavedLocation(newLoc);
        localStorage.setItem('user_location', JSON.stringify(newLoc));
        setIsGettingLocation(false);
        setShowCityPicker(false);
        toast({
          title: "تم تحديد الموقع",
          description: "تم الحصول على موقعك تلقائياً",
        });
        setTimeout(() => refetch(), 100);
      },
      (err) => {
        setIsGettingLocation(false);
        toast({
          title: "خطأ",
          description: "لم نتمكن من الحصول على موقعك. يرجى اختيار مدينتك يدوياً.",
          variant: "destructive",
        });
      }
    );
  };

  const prayers = [
    { id: 'Fajr', name: 'الفجر' },
    { id: 'Sunrise', name: 'الشروق' },
    { id: 'Dhuhr', name: 'الظهر' },
    { id: 'Asr', name: 'العصر' },
    { id: 'Maghrib', name: 'المغرب' },
    { id: 'Isha', name: 'العشاء' }
  ];

  const nextPrayer = prayerData ? getNextPrayer(prayerData.timings) : null;

  if (showCityPicker) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <Header title="اختر مدينتك" />
        
        <main className="container max-w-md mx-auto px-4 pt-6 space-y-4">
          <Button
            onClick={getAutoLocation}
            disabled={isGettingLocation}
            className="w-full"
            variant="outline"
            data-testid="button-auto-location"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 ml-2" />
            )}
            تحديد الموقع تلقائياً
          </Button>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مدينتك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
              data-testid="input-city-search"
            />
          </div>

          <div className="space-y-2">
            {filteredCities.map((city) => (
              <button
                key={city.name}
                onClick={() => selectCity(city)}
                className="w-full text-right p-4 rounded-xl bg-card border border-border/50 hover-elevate transition-all"
                data-testid={`button-city-${city.name}`}
              >
                <div className="flex items-center justify-between">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{city.name}</span>
                </div>
              </button>
            ))}
          </div>

          {savedLocation && (
            <Button
              onClick={() => setShowCityPicker(false)}
              variant="ghost"
              className="w-full"
              data-testid="button-cancel-city-picker"
            >
              إلغاء
            </Button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header title="أوقات الصلاة" />
      
      <main className="container max-w-md mx-auto px-4 pt-6 space-y-6">
        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p>جاري حساب الأوقات...</p>
          </div>
        ) : prayerData ? (
          <>
            <button 
              onClick={() => setShowCityPicker(true)}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm bg-secondary/50 py-3 rounded-lg hover-elevate"
              data-testid="button-change-location"
            >
              <MapPin className="w-4 h-4" />
              <span>{savedLocation?.city || "موقعك الحالي"}</span>
            </button>

            {nextPrayer && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">الصلاة القادمة</p>
                <p className="text-2xl font-bold text-primary">
                  {prayers.find(p => p.id === nextPrayer.name)?.name}
                </p>
                <p className="text-lg font-mono">{formatTo12Hour(nextPrayer.time)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  بعد {Math.floor(nextPrayer.diff / 60)} ساعة و {nextPrayer.diff % 60} دقيقة
                </p>
              </div>
            )}

            <div className="space-y-3">
              {prayers.map((prayer) => (
                <PrayerCard 
                  key={prayer.id}
                  name={prayer.name}
                  time={prayerData.timings[prayer.id]}
                  isNext={nextPrayer?.name === prayer.id}
                />
              ))}
            </div>

            <div className="text-center text-xs text-muted-foreground px-4 py-8 text-right">
              طريقة الحساب: <br />
              <span className="font-medium">{prayerData.meta.method.name}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-12 px-4 space-y-4">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-bold">الموقع مطلوب</h3>
            <p className="text-muted-foreground text-sm">
              يرجى تحديد موقعك لعرض أوقات الصلاة
            </p>
            <Button onClick={() => setShowCityPicker(true)} data-testid="button-set-location">
              <MapPin className="w-4 h-4 ml-2" />
              تحديد الموقع
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
