// The answer-first box at the top of a guide (data/answers.js, SEO audit G-3): the question, a 2–3 sentence
// answer, a small table, links and a visible "Updated" date, plus FAQPage schema for that question.
// The cost answer's figures are live: today's prices per style (GET /product/price-ranges, the checkout's
// prices) and the US shipping rate from the admin's Shipping Rates screen.
import A from './A';
import { answerFor, fillAnswer } from '../data/answers';
import { api } from '../lib/api';
import { fetchShippingRates, money, rateForQuantity } from '../lib/materials';
import { useAsync } from '../lib/useAsync';
import { serverWroteFaq } from '../lib/serverSchema';

const fetchPriceRanges = async (signal) => (await api.get('/product/price-ranges', { auth: false, signal }))?.ranges || [];

const dateLabel = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function AnswerBox({ path }) {
  const item = answerFor(path);
  const live = item?.table === 'priceRanges';
  const { data } = useAsync(
    (signal) => (live ? Promise.all([fetchPriceRanges(signal), fetchShippingRates(signal)]) : Promise.resolve(null)),
    [path],
  );
  if (!item) return null;

  let answer = item.answer;
  let table = item.table;
  if (live) {
    const [ranges = [], rates] = data || [];
    if (!ranges.length) return null; // no figures yet: nothing rather than placeholders
    const varsity = ranges.find((r) => r.slug === 'varsity-jackets') || ranges[0];
    const us = rates ? rateForQuantity(rates.usaTiers, 1, rates.usaFallbackRate) : null;
    answer = fillAnswer(answer, {
      from: money(varsity.low), // the varsity row (a hoodie's $40 is not a varsity jacket price)
      typical: money(varsity.typicalFrom),
      usShipping: us ? money(us) : 'charged at checkout',
      freeOver: rates?.enabled && rates.freeShippingOver > 0 ? `, free on orders over ${money(rates.freeShippingOver)}` : '',
    });
    table = {
      head: ['Style', 'Price today', 'Most start at'],
      rows: ranges.map((r) => [r.name, r.low === r.high ? money(r.low) : `${money(r.low)} – ${money(r.high)}`, money(r.typicalFrom)]),
    };
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: answer } }],
  };

  return (
    <aside className="ez-answer" aria-labelledby="ez-answer-q" style={{ border: '2px solid var(--ink)', borderRadius: '4px', background: '#fbf8f2', padding: 'clamp(20px,3vw,28px)', margin: '0 0 36px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '6px 16px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        <span style={{ color: 'var(--gold-2)' }}>Quick answer</span>
        <span style={{ color: 'var(--muted)' }}>Updated <time dateTime={item.updated}>{dateLabel(item.updated)}</time></span>
      </div>
      <h2 id="ez-answer-q" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(26px,3vw,36px)', lineHeight: '0.95', textTransform: 'uppercase', margin: '10px 0 0' }}>{item.question}</h2>
      <p style={{ margin: '12px 0 0', fontSize: '17px', lineHeight: '1.6' }}>{answer}</p>
      {table ? (
        <div style={{ overflowX: 'auto', marginTop: '18px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>{table.head.map((h, i) => <th key={i} scope="col" style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--ink)', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => (j === 0
                  ? <th key={j} scope="row" style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--cream-2)', fontWeight: '600' }}>{cell}</th>
                  : <td key={j} style={{ padding: '8px 10px', borderBottom: '1px solid var(--cream-2)' }}>{cell}</td>))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {item.links?.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: '16px', fontWeight: '600', fontSize: '14px' }}>
          {item.links.map((l) => <A key={l.href} href={l.href} style={{ borderBottom: '2px solid var(--gold)', textDecoration: 'none' }}>{l.label} →</A>)}
        </div>
      ) : null}
      {/* the server writes this answer's FAQPage into the head of the page it sends */}
      {serverWroteFaq() ? null : <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />}
    </aside>
  );
}
