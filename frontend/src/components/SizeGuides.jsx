// The size chart page's three extra guides — youth varsity, cropped (ladies
// fit) and coach jackets. Wording and figures are the live site's
// (easyjackets/src/Pages/SizeChart.jsx); the layout is this site's own.
// `unit` is the page's 'in' / 'cm' switch, shared by every table on the page.
import ImageSlot from './ImageSlot';
import ProductCard from './ProductCard';

const YOUTH = [ // stored in centimetres, as on the live site
  { size: 'YXS', chest: 40, bodyLength: 50, acrossShoulder: 36, sleeveLength: 40 },
  { size: 'YS', chest: 43, bodyLength: 53, acrossShoulder: 37, sleeveLength: 43 },
  { size: 'YM', chest: 45, bodyLength: 56, acrossShoulder: 38, sleeveLength: 47 },
  { size: 'YL', chest: 47, bodyLength: 59, acrossShoulder: 39, sleeveLength: 51 },
  { size: 'YXL', chest: 49, bodyLength: 62, acrossShoulder: 40, sleeveLength: 54 },
];
const CROPPED = [ // inches
  { size: 'XS', chest: 40, waist: 30, length: 18.5, sleeve: 26.5 },
  { size: 'S', chest: 42, waist: 32, length: 19, sleeve: 27 },
  { size: 'M', chest: 44, waist: 34, length: 19.5, sleeve: 27.5 },
  { size: 'L', chest: 46, waist: 36, length: 20, sleeve: 28 },
  { size: 'XL', chest: 48, waist: 38, length: 20.5, sleeve: 28.5 },
  { size: '2XL', chest: 50, waist: 40, length: 21, sleeve: 29 },
  { size: '3XL', chest: 52, waist: 42, length: 21.5, sleeve: 29.5 },
  { size: '4XL', chest: 54, waist: 44, length: 22, sleeve: 30 },
];
const COACH = [ // inch ranges
  { size: 'S', sleeve: '30-32', bodyWidth: '21-23', bodyLength: '27-29' },
  { size: 'M', sleeve: '30-32', bodyWidth: '23-25', bodyLength: '28-30' },
  { size: 'L', sleeve: '32-34', bodyWidth: '24-26', bodyLength: '29-31' },
  { size: 'XL', sleeve: '32-34', bodyWidth: '26-28', bodyLength: '29-31' },
  { size: '2X', sleeve: '32-34', bodyWidth: '28-30', bodyLength: '30-32' },
  { size: '3X', sleeve: '32-34', bodyWidth: '29-31', bodyLength: '30-32' },
  { size: '4X', sleeve: '32-34', bodyWidth: '31-33', bodyLength: '31-33' },
  { size: '5X', sleeve: '32-34', bodyWidth: '33-35', bodyLength: '32-34' },
  { size: '6X', sleeve: '32-34', bodyWidth: '35-37', bodyLength: '33-35' },
];

const one = (n) => n.toFixed(1).replace(/\.0$/, '');
const fromInches = (inches, cm) => (cm ? one(inches * 2.54) : `${inches}"`);
const fromCm = (centimetres, cm) => (cm ? String(centimetres) : `${one(centimetres / 2.54)}"`);
const inchRange = (range, cm) => (cm ? range.split('-').map((v) => one(Number(v) * 2.54)).join('-') : range);

/** The page's image style: a cream panel over an ink offset shadow. */
export function Frame({ ratio = '4/3', children }) {
  return (
    <div className="sc-frame">
      <div className="sc-frame-shadow" />
      <div className="sc-frame-panel" style={{ aspectRatio: ratio }}>{children}</div>
    </div>
  );
}

function UnitSwitch({ unit, setUnit }) {
  return (
    <div className="ez-seg sc-unit" role="group" aria-label="Units">
      {[['in', 'Inches'], ['cm', 'Cm']].map(([v, l]) => (
        <button key={v} type="button" aria-pressed={unit === v} onClick={() => setUnit(v)}>{l}</button>
      ))}
    </div>
  );
}

function Head({ id, eyebrow, title, accent, unit, setUnit }) {
  return (
    <div className="sc-head">
      <div>
        <div className="sc-eyebrow">{eyebrow}</div>
        <h2 id={id} className="sc-h2">{title} <span>{accent}</span></h2>
      </div>
      <UnitSwitch unit={unit} setUnit={setUnit} />
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="ez-wrap sc-table-wrap">
      <table className="ez-table sc-table">
        <thead>
          <tr>{columns.map(([label, sub]) => <th key={label}>{label}{sub ? <small>{sub}</small> : null}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cells) => <tr key={cells[0]}>{cells.map((c, i) => <td key={i}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Notes({ items }) {
  return (
    <div className="sc-notes">
      {items.map(([title, text]) => (
        <div key={title} className="sc-note-card">
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

export default function SizeGuides({ unit, setUnit, croppedProduct }) {
  const cm = unit === 'cm';
  const unitWord = cm ? 'centimeters' : 'inches';
  const u = cm ? '(cm)' : '(in)';

  return (
    <>
      {/* Youth varsity jackets */}
      <section id="youth" className="sc-guide" aria-labelledby="sc-youth-title">
        <Head id="sc-youth-title" eyebrow="Youth Varsity Jackets" title="Youth Varsity" accent="Jacket" unit={unit} setUnit={setUnit} />
        <div className="sc-split">
          <div>
            <p className="sc-copy">
              Measurements are listed in {unitWord} and taken from the finished jacket. For the best fit, compare this chart with a similar jacket your child already owns.
            </p>
            <Table
              columns={[['Size'], ['Chest', u], ['Body Length', u], ['Across Shoulder', u], ['Sleeve Length', u]]}
              rows={YOUTH.map((r) => [r.size, fromCm(r.chest, cm), fromCm(r.bodyLength, cm), fromCm(r.acrossShoulder, cm), fromCm(r.sleeveLength, cm)])}
            />
            <ol className="sc-steps">
              <li><span><strong>Chest:</strong> Measure across the front of the jacket from armpit to armpit.</span></li>
              <li><span><strong>Body length:</strong> Measure from the highest shoulder point near the collar down to the bottom hem.</span></li>
              <li><span><strong>Across shoulder:</strong> Measure straight across the back from shoulder seam to shoulder seam.</span></li>
              <li><span><strong>Sleeve length:</strong> Measure from the shoulder seam down to the end of the cuff.</span></li>
            </ol>
            <div className="sc-callout">
              <strong>Note:</strong> Handmade production can vary by {cm ? '±1–2 cm' : 'about ±0.4–0.8 inch'}. Choose the closest match, and size up if your child is between sizes or prefers a relaxed fit.
            </div>
          </div>
          <Frame ratio="5/4">
            <ImageSlot slot="size-youth" shape="rect" src="/images/size-chart/youth-varsity-measure.webp" fit="contain" placeholder="Youth varsity jacket measurement guide" aria-label="Youth varsity jacket measurement guide showing chest, body length, across shoulder, and sleeve length" />
          </Frame>
        </div>
      </section>

      {/* Cropped jacket (ladies fit) */}
      <section id="cropped" className="sc-guide" aria-labelledby="sc-cropped-title">
        <Head id="sc-cropped-title" eyebrow="Ladies Fit" title="Cropped" accent="Jacket" unit={unit} setUnit={setUnit} />
        <div className="sc-split">
          <div>
            <p className="sc-copy">
              Measurements are listed in {unitWord}. Manual measurements can vary by {cm ? '1.3 to 2.5 cm' : '0.5 to 1 inch'}. This cropped fit is shorter by design for a modern relaxed silhouette.
            </p>
            <Table
              columns={[['Size'], ['Chest', '(All Around)'], ['Waist', '(Relaxed)'], ['Length', '(Cropped)'], ['Sleeve Length', '(Shoulder To Cuff)']]}
              rows={CROPPED.map((r) => [r.size, fromInches(r.chest, cm), fromInches(r.waist, cm), fromInches(r.length, cm), fromInches(r.sleeve, cm)])}
            />
            <Notes items={[
              ['Fit Guide', 'This is a cropped fit jacket. For a relaxed or oversized look, we recommend sizing up.'],
              ['Please Note', 'Length is shorter by design for a modern, stylish fit.'],
            ]} />
          </div>
          <div className="sc-product">
            {croppedProduct ? (
              <ProductCard product={croppedProduct} slotPrefix="size-cropped" width={640} />
            ) : (
              <div className="ez-skeleton" style={{ aspectRatio: '4/5', borderRadius: '4px' }} aria-busy="true" />
            )}
            <p className="sc-product-meta">Live catalog example for the cropped varsity fit.</p>
          </div>
        </div>
      </section>

      {/* Coach jackets */}
      <section id="coach" className="sc-guide" aria-labelledby="sc-coach-title">
        <Head id="sc-coach-title" eyebrow="Coach Jackets" title="Coach Jacket" accent="Fit Guide" unit={unit} setUnit={setUnit} />
        <div className="sc-split sc-split-center">
          <div>
            <p className="sc-copy">
              Measurements are listed in {unitWord}. Match these finished garment measurements to a jacket you already own for the closest fit.
            </p>
            <ol className="sc-steps">
              <li><span>Pull out any jacket you own that fits just the way you like.</span></li>
              <li><span>Lay your jacket flat and measure the areas illustrated.</span></li>
              <li><span>Order the size that most closely matches your jacket’s measurements.</span></li>
            </ol>
          </div>
          <Frame ratio="16/10">
            <ImageSlot slot="size-coach" shape="rect" src="/images/size-chart/coach-jacket-measure.webp" fit="contain" placeholder="Coach jacket measurement guide" aria-label="Coach jacket measurement guide showing sleeve length, body width, and body length" />
          </Frame>
        </div>
        <div className="sc-wide">
          <Table
            columns={[['Size'], ['Sleeve Length', '(Wrist To Neckline)'], ['Body Width'], ['Body Length']]}
            rows={COACH.map((r) => [r.size, inchRange(r.sleeve, cm), inchRange(r.bodyWidth, cm), inchRange(r.bodyLength, cm)])}
          />
          <Notes items={[
            ['Size Note', 'Sizes are approximate and can vary slightly by brand or manufacturer.'],
            ['Ordering Tip', 'If you want a specific brand fit, request it before ordering so availability can be checked.'],
          ]} />
        </div>
      </section>
    </>
  );
}
