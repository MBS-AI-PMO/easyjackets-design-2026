// A page's editable content from the admin (Content -> How to Design Page; backend helpers/pageContent.js).
// The last content this browser saw is kept, so a returning visitor sees the page at once; a first visit
// waits for the API (a moment) instead of flashing the content the page shipped with. If the API cannot be
// reached, the shipped content (`fallback`) is shown. Refreshes with the site's live data.
import { useEffect, useState } from 'react';
import { api } from './api';
import { onRevalidate } from './useAsync';

const keyFor = (page) => `ej-page-${page}`;
const readCache = (page) => {
  try { return JSON.parse(localStorage.getItem(keyFor(page)) || 'null'); } catch { return null; }
};
const writeCache = (page, value) => {
  try { localStorage.setItem(keyFor(page), JSON.stringify(value)); } catch { /* storage full or blocked */ }
};

/** { content, ready }: `content` is null until known (no cache yet), then the admin's or the fallback. */
export function usePageContent(page, fallback) {
  const [content, setContent] = useState(() => readCache(page));
  useEffect(() => {
    let alive = true;
    const load = () => api.get(`/page-content/${page}`, { auth: false })
      .then((res) => {
        if (!alive || !res?.content) return;
        writeCache(page, res.content);
        setContent((prev) => (JSON.stringify(prev) === JSON.stringify(res.content) ? prev : res.content));
      })
      .catch(() => { if (alive) setContent((prev) => prev || fallback); });
    load();
    const stop = onRevalidate(load);
    return () => { alive = false; stop(); };
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps
  return { content, ready: content !== null };
}
