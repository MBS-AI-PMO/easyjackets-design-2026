// The returns policy, shown on /shipping and on its own page /return-policy (the address Merchant Center
// and the Product schema name as the return policy, N-O10). One copy, so the two pages never disagree.
// The terms are the live site's Return Policy: custom-made is final sale, plain stock jackets 10 days.

export default function ReturnsPolicy() {
  return (
    <>
      <h2 id="exchanges">Returns & exchanges</h2>
      <p>
        <strong>Custom-made jackets are final sale.</strong>
        {' '}A jacket designed in the Design Studio, or made with names, numbers, patches, embroidery, custom colours or custom sizes, is made for you alone and cannot be returned or exchanged.
      </p>
      <p>
        <strong>Plain, non-decorated stock jackets</strong>
        {' '}can be returned or exchanged within 10 days of delivery. They must be unworn, unwashed and unaltered. Contact us first for a return authorization number; items sent back without one may be refused. An exchange depends on the size being in stock, and any price difference applies.
      </p>
      <h2 id="refunds">Refunds</h2>
      <p>
        Once the returned jacket arrives and passes inspection, we confirm the refund, exchange or store credit. Return shipping is paid by you, and an approved return carries a restocking fee of 15–25% or $35, whichever is greater.
      </p>
      <h2 id="faults">Damaged or defective items</h2>
      <p>
        If your jacket arrives damaged or defective, contact us within 10 days of receipt with your order number, clear photos and a short description of the problem. Our team reviews every claim.
      </p>
      <h2 id="cancel">Cancellations</h2>
      <p>
        To cancel or change an order, tell us within 24 hours of placing it. After that your jacket has entered production and the order can no longer be cancelled or changed.
      </p>
    </>
  );
}
