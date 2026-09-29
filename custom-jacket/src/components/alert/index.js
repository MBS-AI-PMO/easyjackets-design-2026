import React, { useCallback, useEffect, useRef, useState } from 'react'

// Replaces window.alert() across the customiser. Rendered as a dialog rather
// than a browser alert so it can be styled, and animated in and out.

// Must match the exit duration in App.scss (.cjd-alert-overlay transition), or
// the dialog is unmounted mid-fade.
const EXIT_MS = 220

const ICONS = {
  success: <path d="M20 6 9 17l-5-5" />,
  error: (
    <>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  save: (
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </>
  ),
}

const CjdAlert = ({ open, tone = 'info', title, message, actionLabel = 'OK', onClose }) => {
  // `mounted` outlives `open` by one animation so the dialog can play its exit.
  const [mounted, setMounted] = useState(Boolean(open))
  const [entered, setEntered] = useState(false)
  const buttonRef = useRef(null)

  // Callers clear their notice state on close, which blanks these props while
  // the dialog is still fading out. Keep the last real content to render.
  const shown = useRef({ tone, title, message, actionLabel })
  if (open) shown.current = { tone, title, message, actionLabel }
  const content = open ? { tone, title, message, actionLabel } : shown.current

  useEffect(() => {
    if (open) {
      setMounted(true)
      // A frame late, so the browser has painted the closed state to move from.
      const frame = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(frame)
    }

    setEntered(false)
    const timer = setTimeout(() => setMounted(false), EXIT_MS)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    buttonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleOverlayClick = useCallback(() => onClose?.(), [onClose])

  if (!mounted) return null

  const tint = content.tone || 'info'

  return (
    <div
      className={`cjd-alert-overlay${entered ? ' is-open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`cjd-alert cjd-alert--${tint}`}
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={content.title}
      >
        <span className="cjd-alert-accent" aria-hidden="true" />

        <div className="cjd-alert-icon">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICONS[tint] || ICONS.info}
          </svg>
        </div>

        <h3>{content.title}</h3>
        {content.message ? <p>{content.message}</p> : null}

        <button type="button" ref={buttonRef} onClick={onClose}>
          {content.actionLabel || 'OK'}
        </button>
      </div>
    </div>
  )
}

export default CjdAlert
