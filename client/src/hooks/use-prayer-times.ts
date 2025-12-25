import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Types for Aladhan API
interface PrayerTimesData {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
  };
  date: {
    readable: string;
    hijri: {
      day: string;
      month: { en: string; ar: string };
      year: string;
      weekday: { en: string; ar: string };
    };
  };
  meta: {
    method: { name: string };
  };
}

interface AladhanResponse {
  code: number;
  status: string;
  data: PrayerTimesData;
}

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Arabic prayer names mapping
const prayerNamesArabic: { [key: string]: string } = {
  Fajr: "صلاة الفجر",
  Sunrise: "الشروق",
  Dhuhr: "صلاة الظهر",
  Asr: "صلاة العصر",
  Maghrib: "صلاة المغرب",
  Isha: "صلاة العشاء"
};

// Normalize time string (strip timezone and seconds)
function normalizeTime(time: string): string {
  return time.replace(/\s*\([^)]*\)$/, '').split(':').slice(0, 2).join(':');
}

// Convert 24-hour time to 12-hour Arabic format
function formatTo12Hour(time24: string): string {
  const normalized = normalizeTime(time24);
  const [hours, minutes] = normalized.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? 'م' : 'ص';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper to get next prayer
export function getNextPrayer(timings: PrayerTimesData['timings']) {
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const prayer of prayers) {
    const normalized = normalizeTime(timings[prayer]);
    const [hours, minutes] = normalized.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) continue;
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      return { name: prayerNamesArabic[prayer] || prayer, time: formatTo12Hour(timings[prayer]), diff: prayerTime - currentTime };
    }
  }

  // If no prayer left today, next is Fajr tomorrow
  const fajrNormalized = normalizeTime(timings['Fajr']);
  const [fajrHours, fajrMinutes] = fajrNormalized.split(':').map(Number);
  const fajrTime = (isNaN(fajrHours) || isNaN(fajrMinutes)) ? 0 : fajrHours * 60 + fajrMinutes;
  return { name: prayerNamesArabic['Fajr'], time: formatTo12Hour(timings['Fajr']), diff: (24 * 60 + fajrTime) - currentTime };
}

export function usePrayerTimes() {
  const [location, setLocation] = useState<Location | null>(() => {
    const stored = localStorage.getItem('user_location');
    return stored ? JSON.parse(stored) : null;
  });

  const [method, setMethod] = useState(() => localStorage.getItem('calculation_method') || '4'); // 4 is Umm Al-Qura (Saudi Arabia)

  useEffect(() => {
    if (!location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setLocation(newLoc);
          localStorage.setItem('user_location', JSON.stringify(newLoc));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, [location]);

  return useQuery({
    queryKey: ['prayer-times', location, method],
    queryFn: async () => {
      if (!location) return null;
      
      const date = new Date();
      // Using Timings endpoint
      const url = `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const json = await res.json() as AladhanResponse;
      return json.data;
    },
    enabled: !!location,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
