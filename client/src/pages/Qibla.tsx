import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { Compass, MapPin, RotateCw, Navigation, AlertCircle } from "lucide-react";

export default function Qibla() {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [hasAbsoluteOrientation, setHasAbsoluteOrientation] = useState(false);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const lastHeadingRef = useRef<number>(0);

  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const calculateQiblaDirection = useCallback((lat: number, lng: number) => {
    const userLatRad = toRadians(lat);
    const userLngRad = toRadians(lng);
    const kaabaLatRad = toRadians(KAABA_LAT);
    const kaabaLngRad = toRadians(KAABA_LNG);

    const deltaLng = kaabaLngRad - userLngRad;

    const x = Math.cos(kaabaLatRad) * Math.sin(deltaLng);
    const y = Math.cos(userLatRad) * Math.sin(kaabaLatRad) - 
              Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(deltaLng);

    let bearing = toDegrees(Math.atan2(x, y));
    bearing = (bearing + 360) % 360;

    return bearing;
  }, []);

  const calculateDistance = useCallback((lat: number, lng: number) => {
    const R = 6371;
    const phi1 = toRadians(lat);
    const phi2 = toRadians(KAABA_LAT);
    const deltaPhi = toRadians(KAABA_LAT - lat);
    const deltaLambda = toRadians(KAABA_LNG - lng);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  const getScreenOrientation = (): number => {
    if (typeof window !== 'undefined') {
      if (screen.orientation && screen.orientation.angle !== undefined) {
        return screen.orientation.angle;
      }
      if ((window as any).orientation !== undefined) {
        return (window as any).orientation;
      }
    }
    return 0;
  };

  const normalizeHeading = useCallback((event: DeviceOrientationEvent): number => {
    let heading: number;

    if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
      heading = (event as any).webkitCompassHeading;
      setHasAbsoluteOrientation(true);
    } else if (event.alpha !== null) {
      let screenAngle = getScreenOrientation();
      screenAngle = ((screenAngle % 360) + 360) % 360;
      
      if (event.absolute) {
        heading = (event.alpha + screenAngle) % 360;
        setHasAbsoluteOrientation(true);
      } else {
        heading = (360 - event.alpha + screenAngle) % 360;
      }
    } else {
      return lastHeadingRef.current;
    }

    if (isNaN(heading)) {
      return lastHeadingRef.current;
    }

    const diff = heading - lastHeadingRef.current;
    let smoothedHeading: number;
    if (Math.abs(diff) > 180) {
      if (diff > 0) {
        smoothedHeading = lastHeadingRef.current + (diff - 360) * 0.25;
      } else {
        smoothedHeading = lastHeadingRef.current + (diff + 360) * 0.25;
      }
    } else {
      smoothedHeading = lastHeadingRef.current + diff * 0.25;
    }

    smoothedHeading = ((smoothedHeading % 360) + 360) % 360;
    lastHeadingRef.current = smoothedHeading;

    return smoothedHeading;
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("الموقع غير مدعوم في هذا المتصفح");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: posAccuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setAccuracy(posAccuracy);
        const direction = calculateQiblaDirection(latitude, longitude);
        const dist = calculateDistance(latitude, longitude);
        setQiblaDirection(direction);
        setDistance(dist);
        setError(null);
      },
      () => {
        setError("يرجى السماح بالوصول للموقع");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [calculateQiblaDirection, calculateDistance]);

  const requestCompass = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === "granted") {
          setPermissionGranted(true);
        }
      } catch {
        setError("يرجى السماح بالوصول للبوصلة");
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    let absoluteSupported = false;

    const handleAbsoluteOrientation = (event: DeviceOrientationEvent) => {
      if (event.absolute && event.alpha !== null) {
        absoluteSupported = true;
        const heading = normalizeHeading(event);
        setDeviceHeading(heading);
        
        if ((event as any).webkitCompassAccuracy !== undefined) {
          setNeedsCalibration((event as any).webkitCompassAccuracy < 0);
        }
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (absoluteSupported) return;
      
      if (event.alpha !== null) {
        const heading = normalizeHeading(event);
        setDeviceHeading(heading);
      }
    };

    if (permissionGranted) {
      window.addEventListener("deviceorientationabsolute", handleAbsoluteOrientation as any, true);
      
      setTimeout(() => {
        if (!absoluteSupported) {
          window.addEventListener("deviceorientation", handleOrientation, true);
        }
      }, 500);
    }

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleAbsoluteOrientation as any, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [permissionGranted, normalizeHeading]);

  useEffect(() => {
    requestLocation();
    
    if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
      setPermissionGranted(true);
    }
  }, [requestLocation]);

  const needleRotation = qiblaDirection !== null ? qiblaDirection - deviceHeading : 0;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-secondary/20">
      <Header title="اتجاه القبلة" showBack />

      <main className="container max-w-md mx-auto px-4 space-y-6 pt-4">
        <Card className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">بوصلة القبلة</h2>
            <p className="text-sm text-muted-foreground">
              وجّه أعلى الجهاز نحو السهم الأخضر
            </p>
          </div>

          {needsCalibration && (
            <div className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>حرّك الجهاز بشكل رقم 8 لمعايرة البوصلة</span>
            </div>
          )}

          {error ? (
            <div className="text-center space-y-4">
              <p className="text-red-500 text-sm">{error}</p>
              <Button onClick={requestLocation} data-testid="button-retry-location">
                <RotateCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </div>
          ) : qiblaDirection !== null ? (
            <div className="space-y-6">
              <div className="relative w-72 h-72 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-inner" />
                
                <div className="absolute inset-2 rounded-full border border-slate-300 dark:border-slate-600">
                  {[...Array(72)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 left-1/2 origin-bottom"
                      style={{
                        transform: `translateX(-50%) rotate(${i * 5}deg)`,
                        height: "50%",
                      }}
                    >
                      <div 
                        className={`w-px ${i % 18 === 0 ? 'h-4 bg-slate-600 dark:bg-slate-300' : i % 9 === 0 ? 'h-3 bg-slate-400 dark:bg-slate-500' : 'h-1.5 bg-slate-300 dark:bg-slate-600'}`}
                      />
                    </div>
                  ))}

                  <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500">N</div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">S</div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">E</div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">W</div>
                </div>

                <div className="absolute inset-10 rounded-full bg-card shadow-lg flex items-center justify-center">
                  <div 
                    className="relative w-full h-full transition-transform duration-200 ease-out"
                    style={{ transform: `rotate(${needleRotation}deg)` }}
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[50px] border-l-transparent border-r-transparent border-b-emerald-500 dark:border-b-emerald-400" />
                      <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current mt-1" />
                    </div>
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                      <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[35px] border-l-transparent border-r-transparent border-t-slate-300 dark:border-t-slate-600" />
                    </div>
                  </div>
                  
                  <div className="absolute w-5 h-5 rounded-full bg-slate-700 dark:bg-slate-300 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-800" />
                  </div>
                </div>

                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">اتجاه القبلة</p>
                  <p className="text-2xl font-bold text-primary font-mono">
                    {qiblaDirection.toFixed(1)}°
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">اتجاه الجهاز</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {deviceHeading.toFixed(0)}°
                  </p>
                </div>
              </div>

              {distance && (
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">المسافة إلى الكعبة</p>
                  <p className="text-xl font-bold text-primary">
                    {distance.toFixed(0)} كم
                  </p>
                </div>
              )}

              {!permissionGranted && (
                <Button
                  onClick={requestCompass}
                  className="w-full"
                  data-testid="button-enable-compass"
                >
                  <Compass className="w-4 h-4 ml-2" />
                  تفعيل البوصلة
                </Button>
              )}

              {!hasAbsoluteOrientation && permissionGranted && (
                <div className="text-center text-xs text-muted-foreground">
                  البوصلة تعمل بدون مستشعر مطلق - قد تحتاج للمعايرة
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapPin className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground">جاري تحديد الموقع...</p>
            </div>
          )}
        </Card>

        {location && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-sm flex-1">
                <p className="font-medium">موقعك الحالي</p>
                <p className="text-muted-foreground text-xs font-mono">
                  {location.lat.toFixed(6)}°, {location.lng.toFixed(6)}°
                </p>
                {accuracy && (
                  <p className="text-muted-foreground text-xs">
                    دقة الموقع: {accuracy.toFixed(0)} متر
                  </p>
                )}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={requestLocation}
                data-testid="button-refresh-location"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-sm">للحصول على أفضل دقة</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-right">
            <li>- حرك جهازك بشكل رقم 8 لمعايرة البوصلة</li>
            <li>- أمسك الجهاز بشكل أفقي مستوٍ</li>
            <li>- ابتعد عن المعادن والأجهزة الإلكترونية</li>
            <li>- السهم الأخضر يشير لاتجاه القبلة</li>
            <li>- وجّه أعلى الجهاز حتى يصبح السهم للأعلى</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
