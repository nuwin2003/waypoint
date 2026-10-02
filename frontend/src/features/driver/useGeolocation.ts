import { useEffect, useState } from 'react';

export type GpsStatus = 'pending' | 'active' | 'denied' | 'unavailable';

export interface GpsFix {
  lat: number;
  lng: number;
  accuracy: number;
}

export function useGeolocation(): { fix: GpsFix | null; status: GpsStatus } {
  const [fix, setFix] = useState<GpsFix | null>(null);
  const [status, setStatus] = useState<GpsStatus>('pending');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    const watch = navigator.geolocation.watchPosition(
      (position) => {
        setFix({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus('active');
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    const giveUp = window.setTimeout(() => {
      setStatus((current) => (current === 'pending' ? 'unavailable' : current));
    }, 12000);

    return () => {
      window.clearTimeout(giveUp);
      navigator.geolocation.clearWatch(watch);
    };
  }, []);

  return { fix, status };
}
