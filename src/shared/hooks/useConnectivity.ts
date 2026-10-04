import { useEffect, useState } from 'react';
import { useOfflineSync } from './useOfflineSync';

export function useConnectivity() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const { pending } = useOfflineSync();
  useEffect(() => {
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    return () => { window.removeEventListener('online', onlineHandler); window.removeEventListener('offline', offlineHandler); };
  }, []);
  return { online, pending };
}
