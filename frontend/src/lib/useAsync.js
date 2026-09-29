import { useCallback, useEffect, useRef, useState } from 'react';

// Live data: every useAsync on the page quietly reloads when the tab comes back into view
// (say after a change in the admin in another tab) and once a minute while it is visible.
// The page keeps showing what it has until the new data arrives and only re-renders when
// something actually changed, so nothing flickers. Loaders that pick random items per
// visit pass { live: false } so they do not reshuffle each time the tab is focused.
const REFRESH_MS = 60000;
const MIN_GAP_MS = 4000; // focus + visibilitychange fire together; one refresh is enough
const listeners = new Set();
let lastRun = Date.now(); // not straight after the first load
let timer = null;

function revalidate() {
  if (document.visibilityState === 'hidden') return;
  const now = Date.now();
  if (now - lastRun < MIN_GAP_MS) return;
  lastRun = now;
  listeners.forEach((fn) => fn());
}

/** Calls `fn` whenever live data should refresh; returns the unsubscribe. Module caches use it too. */
export function onRevalidate(fn) {
  listeners.add(fn);
  if (listeners.size === 1) {
    window.addEventListener('focus', revalidate);
    document.addEventListener('visibilitychange', revalidate);
    timer = window.setInterval(revalidate, REFRESH_MS);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      window.removeEventListener('focus', revalidate);
      document.removeEventListener('visibilitychange', revalidate);
      window.clearInterval(timer);
    }
  };
}

const same = (a, b) => {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
};

/**
 * Runs an async loader whenever `deps` change and exposes {data, loading,
 * error, reload}. In-flight requests are aborted on change/unmount. Unless
 * `live` is false, the data also refreshes itself in the background (see above).
 */
export function useAsync(loader, deps = [], { live = true } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  const dataRef = useRef(null);
  const readyRef = useRef(false);
  useEffect(() => { loaderRef.current = loader; });

  useEffect(() => {
    let alive = true;
    const ctl = new AbortController();
    readyRef.current = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(() => loader(ctl.signal))
      .then((data) => {
        if (!alive) return;
        dataRef.current = data;
        readyRef.current = true;
        setState({ data, loading: false, error: null });
      })
      .catch((error) => { if (alive && error?.name !== 'AbortError') setState({ data: null, loading: false, error }); });
    return () => { alive = false; ctl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  // background refresh: same loader, no loading state, applied only when the data changed
  useEffect(() => {
    if (!live) return undefined;
    let ctl = null;
    const unsubscribe = onRevalidate(() => {
      if (ctl || !readyRef.current) return; // one at a time, and never before the first load
      const mine = new AbortController();
      ctl = mine;
      Promise.resolve()
        .then(() => loaderRef.current(mine.signal))
        .then((data) => {
          if (mine.signal.aborted || same(data, dataRef.current)) return;
          dataRef.current = data;
          setState({ data, loading: false, error: null });
        })
        .catch(() => { /* keep what is shown */ })
        .finally(() => { if (ctl === mine) ctl = null; });
    });
    return () => { unsubscribe(); ctl?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, ...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
