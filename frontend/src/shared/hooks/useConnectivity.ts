import { useEffect, useState } from 'react';

export function useConnectivity() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(3);
  useEffect(() => {
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    return () => { window.removeEventListener('online', onlineHandler); window.removeEventListener('offline', offlineHandler); };
  }, []);
  return { online, pending, setPending };
}
