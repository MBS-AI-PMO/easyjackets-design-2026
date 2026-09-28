import A from './A';
import Faq from './Faq';
import { scrollToHash } from '../lib/scroll';

/**
 * FAQs grouped by category: a category list with counts that stays beside the
 * questions on desktop (a native dropdown on phones), and one heading per group.
 * Used by the FAQ page and the bulk order page, so both look the same.
 *
 * groups   [{ id, name, items }] from lib/faqGroups (null while loading)
 * idPrefix prefix for the group anchors, e.g. "faq-" -> #faq-sizing-and-fit
 * side     what sits above the category list (a heading, a search box …)
 * results  optional { title, items, empty } shown instead of the groups (search)
 * onPick   called when a category is chosen (e.g. to clear a search)
 */
export default function FaqGroups({ id, className = '', groups, idPrefix = '', side, results, onPick, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const jump = (gid) => {
    onPick?.();
    const hash = `#${idPrefix}${gid}`;
    window.history.replaceState(null, '', hash);
    // after a cleared search re-renders the groups
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(hash)));
  };
  return (
    <section id={id} className={`ez-faq-layout ${className}`.trim()}>
      <div className="ez-faq-side">
        {side}
        {groups ? (
          <>
            <nav className="ez-faq-nav" aria-label="Question categories">
              {groups.map((g) => (
                <A key={g.id} href={`#${idPrefix}${g.id}`} className="ez-faq-link" onClick={() => onPick?.()}>
                  <span>{g.name}</span>
                  <span className="ez-faq-count">{g.items.length}</span>
                </A>
              ))}
            </nav>
            <select className="ez-input ez-faq-select" aria-label="Jump to a category" value="" onChange={(e) => { if (e.target.value) jump(e.target.value); }}>
              <option value="" disabled>Jump to a category…</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.items.length})</option>)}
            </select>
          </>
        ) : (
          <div className="ez-faq-nav" aria-busy="true">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="ez-skeleton" style={{ height: '20px', margin: '12px 0' }} />)}
          </div>
        )}
      </div>
      <div>
        {results ? (
          <div className="ez-faq-group">
            <H className="ez-faq-h">{results.title}</H>
            {results.items.length ? <Faq items={results.items} /> : <p style={{ margin: 0, color: 'var(--muted)' }}>{results.empty}</p>}
          </div>
        ) : groups ? groups.map((g) => (
          <div key={g.id} id={`${idPrefix}${g.id}`} className="ez-faq-group">
            <H className="ez-faq-h">{g.name}</H>
            <Faq items={g.items} />
          </div>
        )) : (
          <div className="ez-faq-group">{Array.from({ length: 6 }, (_, i) => <div key={i} className="ez-skeleton" style={{ height: '58px', marginBottom: '2px' }} />)}</div>
        )}
      </div>
    </section>
  );
}
