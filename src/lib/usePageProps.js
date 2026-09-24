import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Page-level props the design exposed to its editor (e.g. the cart's
 * `scenario`) become query parameters, so `/cart?scenario=team` shows the
 * team-order state and `/?showPromo=false` hides the promo bar.
 */
export function usePageProps(meta) {
  const [params] = useSearchParams();
  return useMemo(() => {
    const out = {};
    for (const [key, m] of Object.entries(meta)) {
      const raw = params.get(key);
      if (raw == null) { out[key] = m.default; continue; }
      if (m.type === 'boolean') out[key] = !(raw === 'false' || raw === '0');
      else if (m.type === 'enum') out[key] = m.options.includes(raw) ? raw : m.default;
      else out[key] = raw;
    }
    return out;
  }, [params, meta]);
}
