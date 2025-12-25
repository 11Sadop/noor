import { Header } from "@/components/Header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Globe, Users, Bell, BellOff, Volume2, VolumeX, Sun, Moon, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocalStorage<{city?: string, country?: string, latitude?: number, longitude?: number} | null>("user_location", null);
  const [method, setMethod] = useLocalStorage("calculation_method", "4");
  
  const { 
    permission, 
    settings, 
    requestPermission, 
    updateSettings, 
    isSupported,
    sendNotification 
  } = useNotifications();
  
  const { data: visitorData } = useQuery<{ count: number }>({
    queryKey: ["/api/stats/visitors"],
  });

  const handleEnableNotifications = async () => {
    if (permission === 'granted') {
      updateSettings({ enabled: !settings.enabled });
      toast({
        title: settings.enabled ? "تم إيقاف الإشعارات" : "تم تفعيل الإشعارات",
      });
    } else {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: "تم تفعيل الإشعارات",
          description: "ستصلك تذكيرات الصلاة والأذكار",
        });
      } else {
        toast({
          title: "لم يتم منح الإذن",
          description: "يرجى السماح بالإشعارات من إعدادات المتصفح",
          variant: "destructive",
        });
      }
    }
  };

  const testNotification = () => {
    sendNotification("اختبار الإشعارات", "هذا إشعار تجريبي من تطبيق نور");
  };

  const methods = [
    { id: "2", name: "ISNA (North America)" },
    { id: "3", name: "Muslim World League" },
    { id: "4", name: "Umm Al-Qura (Makkah)" },
    { id: "5", name: "Egyptian General Authority" },
  ];

  const handleResetLocation = () => {
    setLocation(null);
    window.location.reload(); // Force re-fetch of location
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header title="الإعدادات" />
      
      <main className="container max-w-md mx-auto px-4 pt-6 space-y-8">
        
        {/* Location Section */}
        <section>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 text-right">الموقع والوقت</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border/50 flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">الموقع</p>
                  <p className="text-xs text-muted-foreground text-right">
                    {location ? `${location.latitude?.toFixed(2)}, ${location.longitude?.toFixed(2)}` : "جاري التحديد..."}
                  </p>
                </div>
              </div>
              <button onClick={handleResetLocation} className="text-xs font-medium text-primary hover:underline">
                إعادة ضبط
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-2 flex-row-reverse">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">طريقة الحساب</p>
                </div>
              </div>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full mt-2 p-2 rounded-lg bg-secondary/30 text-sm border-none focus:ring-1 focus:ring-primary text-right"
              >
                {methods.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {isSupported && (
          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 text-right">الإشعارات</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-border/50 flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">تفعيل الإشعارات</p>
                    <p className="text-xs text-muted-foreground">تذكيرات الصلاة والأذكار</p>
                  </div>
                </div>
                <Switch
                  checked={settings.enabled && permission === 'granted'}
                  onCheckedChange={handleEnableNotifications}
                  data-testid="switch-notifications"
                />
              </div>

              {settings.enabled && permission === 'granted' && (
                <>
                  <div className="p-4 flex items-center justify-between border-b border-border/50 flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">إشعار وقت الأذان</p>
                        <p className="text-xs text-muted-foreground">تنبيه عند حلول وقت الصلاة</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={settings.reminderMinutes.toString()}
                        onValueChange={(value) => updateSettings({ reminderMinutes: parseInt(value) })}
                        disabled={!settings.prayerReminder}
                      >
                        <SelectTrigger className="w-24" data-testid="select-reminder-time">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 دقائق</SelectItem>
                          <SelectItem value="10">10 دقائق</SelectItem>
                          <SelectItem value="15">15 دقيقة</SelectItem>
                          <SelectItem value="30">30 دقيقة</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        checked={settings.prayerReminder}
                        onCheckedChange={(checked) => updateSettings({ prayerReminder: checked })}
                        data-testid="switch-prayer-reminder"
                      />
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between border-b border-border/50 flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">أذكار الصباح</p>
                        <p className="text-xs text-muted-foreground">بعد صلاة الفجر</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.morningAdhkar}
                      onCheckedChange={(checked) => updateSettings({ morningAdhkar: checked })}
                      data-testid="switch-morning-adhkar"
                    />
                  </div>

                  <div className="p-4 flex items-center justify-between border-b border-border/50 flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">أذكار المساء</p>
                        <p className="text-xs text-muted-foreground">بعد صلاة المغرب</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.eveningAdhkar}
                      onCheckedChange={(checked) => updateSettings({ eveningAdhkar: checked })}
                      data-testid="switch-evening-adhkar"
                    />
                  </div>

                  <div className="p-4 flex items-center justify-between border-b border-border/50 flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                        {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">صوت الإشعارات</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(checked) => updateSettings({ sound: checked })}
                      data-testid="switch-sound"
                    />
                  </div>

                  <div className="p-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={testNotification}
                      data-testid="button-test-notification"
                    >
                      اختبار الإشعارات
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 text-right">إحصائيات</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/20 text-teal-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">عدد الزوار</p>
                  <p className="text-xs text-muted-foreground">إجمالي زيارات الموقع</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary" data-testid="text-visitor-count">
                {visitorData?.count?.toLocaleString('ar-SA') || '0'}
              </span>
            </div>
          </div>
        </section>

        <div className="text-center text-xs text-muted-foreground pt-8">
          <p>الإصدار 1.0.0</p>
        </div>


      </main>
    </div>
  );
}
