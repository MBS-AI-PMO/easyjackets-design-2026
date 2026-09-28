import A from './A';
import { shopPath } from '../lib/urls';

const LINKS = [
  ['/design-custom-jacket', 'Design a custom jacket'],
  ['/how-to-design-jacket', 'How to design a jacket'],
  ['/sizechart', 'Size guide'],
  ['/fabrics', 'Fabric guide'],
  ['/bulk-order', 'Bulk orders'],
  [shopPath({ category: 'varsity-jackets' }), 'Varsity jackets'],
  ['/faq', 'Ordering FAQs'],
];

/**
 * The buying guide and helpful links under the shop's product grid: the
 * search copy the live site carries on every collection page, in this site's
 * design. `title` names the collection being browsed; `quickAnswer` is the
 * one-paragraph summary shown above the guide.
 */
export default function CatalogGuide({ title, quickAnswer }) {
  return (
    <section className="ez-guide" aria-label={`${title} buying guide`}>
      <div className="ez-guide-inner">
        {quickAnswer ? (
          <div className="ez-quick-answer">
            <div className="ez-quick-answer-label">Quick answer</div>
            <p>{quickAnswer}</p>
          </div>
        ) : null}
        <article>
          <h2 className="ez-guide-h2">Buying guide</h2>
          <p>
            Start with the jacket purpose: school wear, team spirit, everyday fashion, or a bulk group order. Then choose the right
            material, color story, and personalization details. Wool bodies with leather sleeves create the classic letterman look,
            while satin, fleece, and sports styles work well for lighter team apparel.
          </p>
          <p>
            For the best fit, review the <A href="/sizechart">size guide</A> before ordering and compare chest, sleeve, and jacket
            length measurements. If you are ordering for a team, collect all sizes first and use the <A href="/bulk-order">bulk order
            page</A> so the design team can confirm artwork, patches, names, numbers, and delivery timing.
          </p>
        </article>
        <aside>
          <h2 className="ez-guide-h2">Helpful links</h2>
          <ul>
            {LINKS.map(([href, label]) => <li key={href}><A href={href}>{label} <span aria-hidden="true">→</span></A></li>)}
          </ul>
        </aside>
      </div>
    </section>
  );
}
