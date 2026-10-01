import React, { useEffect, useState } from 'react';
import { useScrollLock } from '../../utils/scrollLock';

const EXIT_MS = 220; // matches .cjd-presence in css/builder-dialogs.scss

/**
 * Keeps a dialog mounted for its exit animation: it enters a frame after mounting (so there is a
 * closed state to animate from) and leaves the page only once the fade-out has played. The
 * wrapper carries .is-open; the dialog inside is styled from it.
 */
const Presence = ({ open, children }) => {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  // the page behind stays put while the dialog is open
  useScrollLock(open);

  useEffect(() => {
    let frame = 0;
    if (open) {
      setMounted(true);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;
  return <div className={`cjd-presence${shown ? ' is-open' : ''}`}>{children}</div>;
};

export default Presence;
