import { useCallback, useState } from 'react';

/**
 * A single state object with a merging setter — the same contract the page
 * logic was written against (`setState(patch)` or `setState(prev => patch)`),
 * so the converted pages keep their logic verbatim.
 */
export function useDcState(initial) {
  const [state, set] = useState(initial);
  const setState = useCallback((patch) => {
    set((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : patch;
      return next === prev ? prev : { ...prev, ...next };
    });
  }, []);
  return [state, setState];
}
