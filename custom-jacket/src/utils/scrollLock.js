import { useEffect } from 'react';

// Locks the page behind an open dialog or menu: html.cjd-scroll-locked (css/scrollbars.css). The
// locks are counted, so with two open at once (an alert over the Share dialog) the page scrolls
// again only when the last one closes. react-modal dialogs mark <body> themselves; the same CSS
// covers them.
let locks = 0;
const apply = () => document.documentElement.classList.toggle('cjd-scroll-locked', locks > 0);

export const useScrollLock = (active) => {
  useEffect(() => {
    if (!active) return undefined;
    locks += 1;
    apply();
    return () => {
      locks -= 1;
      apply();
    };
  }, [active]);
};
