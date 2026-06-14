import { useEffect } from 'react';
import { logInfo, recordPageRender } from '../utils/observability';

export function usePageRenderMetric(page: string): void {
  useEffect(() => {
    const start = performance.now();
    logInfo('page.view', {}, page);
    const id = window.requestAnimationFrame(() => {
      recordPageRender(page, performance.now() - start);
    });
    return () => window.cancelAnimationFrame(id);
  }, [page]);
}
