import React, { useEffect, useRef, useState } from 'react';
import { followWhileOpening } from '../../utils/followOpening';

const DURATION = 320; // ms, matches .cjd-collapse in css/builder-panel.scss

/**
 * Opens and closes its content smoothly (height and fade) instead of the content appearing and
 * vanishing. The content mounts when opening and unmounts once the close has played. While open
 * it stops clipping, so dropdowns inside can reach past its edge. Opening near the bottom of the
 * panel scrolls along so the whole section comes into view (not on the first render).
 */
const Collapse = ({ open, children }) => {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  const [settled, setSettled] = useState(open);
  const boxRef = useRef(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const initial = firstRun.current;
    firstRun.current = false;
    let frame = 0;
    let timer = 0;
    if (open) {
      setMounted(true);
      // two frames: the closed state paints first, so the opening can transition from it
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          setExpanded(true);
          const box = boxRef.current;
          // the heading the section hangs from (the accordion row before it) stays in view
          if (!initial && box) followWhileOpening(box.previousElementSibling || box, box, DURATION + 160);
        });
      });
      timer = setTimeout(() => setSettled(true), DURATION + 40);
    } else {
      setSettled(false);
      setExpanded(false);
      timer = setTimeout(() => setMounted(false), DURATION);
    }
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [open]);

  if (!mounted) return null;
  const className = ['cjd-collapse', expanded && 'is-open', settled && 'is-settled'].filter(Boolean).join(' ');
  return (
    <div className={className} ref={boxRef}>
      <div className="cjd-collapse-inner">{children}</div>
    </div>
  );
};

export default Collapse;
