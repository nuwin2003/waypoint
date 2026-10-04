import { useEffect, useState } from 'react';
import { pendingOrderCount, subscribePendingOrderChanges } from '../offlineSync';

export function useOfflineSync() {
  const [pending, setPending] = useState(() => pendingOrderCount());

  useEffect(() => {
    const refresh = () => setPending(pendingOrderCount());
    return subscribePendingOrderChanges(refresh);
  }, []);

  return { pending };
}
