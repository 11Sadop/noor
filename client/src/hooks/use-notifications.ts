import { useEffect, useState, useCallback, useRef } from 'react';

interface NotificationSettings {
  enabled: boolean;
  prayerReminder: boolean;
  reminderMinutes: number;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  sound: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  prayerReminder: true,
  reminderMinutes: 10,
  morningAdhkar: true,
  eveningAdhkar: true,
  sound: true,
};

const morningAdhkar = [
  "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
  "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلامِ وَعَلَى كَلِمَةِ الإِخْلاصِ",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
];

const eveningAdhkar = [
  "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
  "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا",
];

const prayerNamesArabic: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setSettings(prev => ({ ...prev, enabled: true }));
    }
    
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string, playSound = true) => {
    if (permission !== 'granted' || !settings.enabled) return;

    const notification = new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'noor-notification',
      requireInteraction: false,
      silent: !settings.sound || !playSound,
    });

    if (settings.sound && playSound) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {
      }
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }, [permission, settings.enabled, settings.sound]);

  const sendPrayerReminder = useCallback((prayerName: string, minutesLeft: number) => {
    if (!settings.prayerReminder) return;
    
    const arabicName = prayerNamesArabic[prayerName] || prayerName;
    
    if (minutesLeft > 0) {
      const title = `تذكير بصلاة ${arabicName}`;
      const body = `بقي ${minutesLeft} دقيقة على أذان ${arabicName}`;
      sendNotification(title, body);
    } else {
      const title = `حان وقت أذان ${arabicName}`;
      const body = `حيّ على الصلاة - حان الآن موعد صلاة ${arabicName}`;
      sendNotification(title, body);
    }
  }, [settings.prayerReminder, sendNotification]);

  const sendMorningAdhkar = useCallback(() => {
    if (!settings.morningAdhkar) return;
    
    const randomDhikr = morningAdhkar[Math.floor(Math.random() * morningAdhkar.length)];
    sendNotification('حان وقت أذكار الصباح', randomDhikr);
  }, [settings.morningAdhkar, sendNotification]);

  const sendEveningAdhkar = useCallback(() => {
    if (!settings.eveningAdhkar) return;
    
    const randomDhikr = eveningAdhkar[Math.floor(Math.random() * eveningAdhkar.length)];
    sendNotification('حان وقت أذكار المساء', randomDhikr);
  }, [settings.eveningAdhkar, sendNotification]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    permission,
    settings,
    requestPermission,
    sendNotification,
    sendPrayerReminder,
    sendMorningAdhkar,
    sendEveningAdhkar,
    updateSettings,
    isSupported: 'Notification' in window,
  };
}

function normalizeTime(time: string): string {
  return time.replace(/\s*\([^)]*\)$/, '').split(':').slice(0, 2).join(':');
}

export function usePrayerNotifications(prayerTimings: Record<string, string> | null) {
  const { settings, sendPrayerReminder, sendMorningAdhkar, sendEveningAdhkar, permission } = useNotifications();
  const lastNotifiedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!prayerTimings || permission !== 'granted' || !settings.enabled) return;

    const checkPrayerTimes = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

      for (const prayer of prayers) {
        const timeStr = prayerTimings[prayer];
        if (!timeStr) continue;

        const normalized = normalizeTime(timeStr);
        const [hours, minutes] = normalized.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) continue;
        
        const prayerMinutes = hours * 60 + minutes;
        const diff = prayerMinutes - currentMinutes;

        const today = now.toDateString();
        const notifyKey = `${prayer}-${today}`;

        if (diff === settings.reminderMinutes && lastNotifiedRef.current[notifyKey] !== settings.reminderMinutes) {
          sendPrayerReminder(prayer, settings.reminderMinutes);
          lastNotifiedRef.current[notifyKey] = settings.reminderMinutes;
        }

        if (diff === 0 && lastNotifiedRef.current[`${notifyKey}-athan`] !== 1) {
          sendPrayerReminder(prayer, 0);
          lastNotifiedRef.current[`${notifyKey}-athan`] = 1;

          if (prayer === 'Fajr') {
            setTimeout(() => sendMorningAdhkar(), 1000);
          }
        }
      }

      const maghribTime = prayerTimings['Maghrib'];
      if (maghribTime) {
        const normalizedMaghrib = normalizeTime(maghribTime);
        const [mHours, mMinutes] = normalizedMaghrib.split(':').map(Number);
        if (!isNaN(mHours) && !isNaN(mMinutes)) {
          const maghribMinutes = mHours * 60 + mMinutes;
          
          if (currentMinutes === maghribMinutes && lastNotifiedRef.current['evening-adhkar'] !== currentMinutes) {
            setTimeout(() => sendEveningAdhkar(), 2000);
            lastNotifiedRef.current['evening-adhkar'] = currentMinutes;
          }
        }
      }
    };

    checkPrayerTimes();
    const interval = setInterval(checkPrayerTimes, 60000);

    return () => clearInterval(interval);
  }, [prayerTimings, settings.enabled, settings.reminderMinutes, permission, sendPrayerReminder, sendMorningAdhkar, sendEveningAdhkar]);
}
