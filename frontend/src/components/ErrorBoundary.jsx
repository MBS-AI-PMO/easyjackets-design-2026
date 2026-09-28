import { Component } from 'react';

/**
 * Keeps one broken page from blanking the whole app: the error is logged and
 * the visitor gets a way back instead of an empty screen. Mount it with a
 * route-dependent `key` so navigating away clears the error.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) { return { error }; }

  componentDidCatch(error, info) { console.error('Page error:', error, info?.componentStack); }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '96px 16px', textAlign: 'center', fontFamily: 'var(--body)' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', textTransform: 'uppercase', lineHeight: '0.9' }}>Something went wrong</div>
        <p style={{ color: 'var(--muted)', margin: '16px 0 28px' }}>This page hit an error. Reloading usually fixes it; if not, the home page is a click away.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="ez-btn ez-btn-ink" onClick={() => window.location.reload()}>Reload</button>
          <a href="/" className="ez-btn ez-btn-line">Home</a>
        </div>
      </div>
    );
  }
}
