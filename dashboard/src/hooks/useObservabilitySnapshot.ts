import { useEffect, useState } from 'react';
import { getObservabilitySnapshot } from '../utils/observability';

export function useObservabilitySnapshot() {
  const [snapshot, setSnapshot] = useState(getObservabilitySnapshot());

  useEffect(() => {
    const handler = () => setSnapshot(getObservabilitySnapshot());
    window.addEventListener('horta-observability:update', handler as EventListener);
    return () => window.removeEventListener('horta-observability:update', handler as EventListener);
  }, []);

  return snapshot;
}
