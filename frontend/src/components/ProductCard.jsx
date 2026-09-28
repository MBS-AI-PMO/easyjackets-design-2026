import A from './A';
import ImageSlot from './ImageSlot';
import { productPath } from '../lib/urls';

/** One catalogue product as a card: badge, photo, colour dot, name, material line and price. */
export default function ProductCard({ product: p, slotPrefix = 'card', width = 480 }) {
  return (
    <A href={productPath(p.slug)} className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
      {p.badge ? (
        <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: '2', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '2px' }}>
          {p.badge}
        </span>
      ) : null}
      <div className="ez-product-photo" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px' }}>
        <ImageSlot slot={`${slotPrefix}-${p.id}`} shape="rect" src={p.image} width={width} placeholder={p.name} aria-label={p.imageAlt} />
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', minHeight: '14px' }}>
        {p.color?.code ? <span title={p.color.name} style={{ width: '14px', height: '14px', borderRadius: '50%', boxShadow: '0 0 0 1px var(--cream-2)', background: p.color.code }} /> : null}
      </div>
      <div className="ez-pcard-info" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '12px', alignItems: 'start', marginTop: '10px' }}>
        <div>
          <h3 className="ez-pcard-name" style={{ fontWeight: '600', fontSize: '16px', lineHeight: '1.35', margin: '0' }}>{p.name}</h3>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {p.materialLabel || p.category?.name}
            {p.reviewCount > 0 ? (
              <>
                {' '}· <span style={{ color: 'var(--gold-2)' }}>★</span> {p.rating} ({p.reviewCount})
              </>
            ) : null}
          </div>
        </div>
        <div className="ez-pcard-price" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {p.wasLabel ? <s style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>{p.wasLabel}</s> : null}
          <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1' }}>{p.priceLabel}</span>
        </div>
      </div>
    </A>
  );
}
