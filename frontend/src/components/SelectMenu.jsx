import { useEffect, useId, useRef, useState } from 'react';

/**
 * A select in the navbar's dropdown style: a button that opens a floating
 * panel of options. `options` is a list of [value, label] pairs. Works with
 * the mouse, touch and keyboard (arrows, Home/End, Enter/Space, Escape, Tab)
 * and is announced as a listbox.
 */
export default function SelectMenu({ value, options, onChange, labelledBy }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const id = useId();
  const selected = Math.max(0, options.findIndex(([v]) => v === value));

  useEffect(() => {
    if (!open) return undefined;
    setActive(selected);
    // focus the list once it is on screen (a hidden element cannot take focus)
    const raf = requestAnimationFrame(() => listRef.current?.focus());
    const close = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('pointerdown', close); };
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[id="${id}-opt-${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  const choose = (i) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (options[i][0] !== value) onChange(options[i][0]);
  };
  const onButtonKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); }
  };
  const onListKey = (e) => {
    const last = options.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(last, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(last); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div ref={rootRef} className={`ez-select-menu${open ? ' is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="ez-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}-value` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        <span id={`${id}-value`}>{options[selected]?.[1]}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
      </button>
      <ul
        ref={listRef}
        role="listbox"
        tabIndex={-1}
        className="ez-select-list"
        aria-labelledby={labelledBy}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onKeyDown={onListKey}
      >
        {options.map(([v, label], i) => (
          <li
            key={v}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={v === value}
            className={i === active ? 'is-active' : undefined}
            onMouseEnter={() => setActive(i)}
            onClick={() => choose(i)}
          >
            {label}
            {v === value ? <svg width="14" height="11" viewBox="0 0 14 11" aria-hidden="true"><path d="M1 5.5l4 4L13 1" stroke="currentColor" strokeWidth="2" fill="none" /></svg> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
