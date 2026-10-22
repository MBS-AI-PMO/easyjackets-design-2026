// The Terms & Conditions as the client supplied them (Terms & Conditions.pdf, October 2026), the storefront's
// /terms-and-conditions page. Stored in the database on start-up when the page has no row yet
// (helpers/pageContent.js); after that the admin edits them (Content -> Terms & Conditions) and this file is only
// what "Restore the original" brings back. The wording, numbering and [placeholders] are the document's own.
// Each section is a title and its text as HTML (paragraphs, sub-headings, lists, bold, links), cleaned on every
// save to the same safe subset as blog articles.

export const TERMS_DEFAULTS = {
  header: {
    title: 'Terms & Conditions',
    intro: 'The agreement between you and Easy Jackets when you place an order, written to be read.',
    effectiveDate: '[Month Day, Year]',
  },
  sections: [
    {
      title: '1. About us',
      body: [
        '<p><strong>EASY JACKETS</strong> operates through <strong>EASY JACKETS LLC</strong>, registered in USA, and <strong>EASY JACKETS</strong>, registered in Pakistan.</p>',
        '<p>The legal entity selling your order will be identified at checkout or in your written quotation and invoice. In these terms, “we,” “us,” and “our” refer to that entity.</p>',
        '<p>Our business contact details are:</p>',
        '<p><strong>U.S. address:</strong> 1012 Grand St Bridgeport ct 06604<br><strong>Pakistan address:</strong> citi villas wazirabad road sialkot 51311<br><strong>Email:</strong> <a href="mailto:info@easyjackets.com">info@easyjackets.com</a></p>',
        '<p>These terms apply to orders placed through our website, by email, or through a written quotation. If you order on behalf of a school, team, business, or organization, you confirm that you are authorized to do so.</p>',
        '<h3>What We Offer</h3>',
        '<h4>Made-to-Order Jackets</h4>',
        '<p>We make custom jackets based on your chosen design. Customization options include styles, materials, colors, sleeves, linings, patches, embroidery, names, numbers, and labels.</p>',
        '<p>We accept individual orders, bulk orders for schools, teams, and businesses, and private label orders. Contact us for bulk pricing and available customization options.</p>',
        '<p>A jacket is considered made to order whenever it is produced specifically for your order—even if you choose a plain design without logos or decoration.</p>',
        '<h4>In-Stock Jackets</h4>',
        '<p>In-stock jackets are ready-made and sold in the style, color, and size shown on the product page. When ordered without customization, they do not require production time.</p>',
        '<p>If you request a different color, logo, name, patch, embroidery, or any other change, your jacket will be treated as made to order.</p>',
        '<p>Please review our size guide before selecting your size.</p>',
      ].join(''),
    },
    {
      title: '2. Orders & acceptance',
      body: [
        '<p>We offer bulk pricing on orders of <strong>10 or more jackets</strong>, making it easier for teams, schools, businesses, and clothing brands to order together. If you need a custom color, the minimum order is <strong>100 jackets for custom-dyed fabric</strong> and <strong>25 jackets for custom-colored leather</strong>.</p>',
        '<p>To help make your jackets feel truly your own, we include <strong>custom neck tags featuring your brand name or logo at no extra cost, with no setup fee</strong>. Please share your neck tag design or branding details when placing your order so we can confirm the details with you before production.</p>',
        '<p>These minimum order quantities apply unless we agree otherwise in your written quote. We’ll include the pricing and any specific requirements in your quote so you know what to expect before confirming your order. Prices and requirements may change for future orders.</p>',
        '<p>We do our best to fulfill every order, but sometimes we may need to decline or cancel an order before it is shipped. This may happen if we cannot reproduce your artwork, do not receive a response to questions needed to complete your order, cannot verify your billing or shipping address, or find that your design uses someone else’s protected work without permission. If we cancel your order, we’ll let you know and issue a full refund of any payment received.</p>',
      ].join(''),
    },
    {
      title: '3. Designs and approvals',
      body: [
        '<h3>Reviewing Your Design</h3>',
        '<p>Before approving your design, please check all details carefully, including spelling, names, numbers, colors, sizes, artwork placement, quantities, and your shipping address. Your approval confirms that the details are correct and ready for the next stage.</p>',
        '<h3>Design Proofs</h3>',
        '<p>For orders placed through our online design tool, your preview and order summary serve as your design proof. If your design needs further clarification, our designer will send a design or embroidery sheet for you to review and approve before production begins.</p>',
        '<h3>Bulk and Private Label Orders</h3>',
        '<p>For bulk and private label orders, we’ll confirm your order specifications in writing. If your quote includes a pre-production sample, we’ll prepare it for your review and begin full production once you approve it in writing. Any sample charges will be clearly listed in your quote.</p>',
        '<h3>Approval Before Shipping</h3>',
        '<p>Before shipping, we’ll send you photos of your finished jackets for approval. This gives you an opportunity to review their appearance before they leave our workshop.</p>',
        '<p>We’ll hold your order until we receive your approval, so please check your email regularly and reply promptly. A delay in approval will move your expected shipping and delivery dates.</p>',
        '<h3>Changes After Approval</h3>',
        '<p>Please approve each stage only when you’re happy with the details. Once you approve a design, sample, or set of finished-product photos, that approval is final for that stage. Any changes requested afterward will need to be reviewed and may involve additional charges and production time.</p>',
      ].join(''),
    },
    {
      title: '4. Pricing & payment',
      body: [
        '<p>Team and bulk orders can be paid by bank transfer to our Pakistani bank account or by ACH transfer to our U.S. bank account. The payment details for your order will be provided on your invoice.</p>',
        '<p>If we offer a deposit arrangement, a <strong>50% deposit</strong> is required to confirm your order, with the remaining balance due before shipment. Production begins once you have approved the design proof, your required payment has cleared, and all order details have been confirmed.</p>',
        '<p>Your invoice will clearly identify the seller and the payment recipient. If payment is collected on the seller’s behalf, this will also be stated on the invoice.</p>',
        '<p>Before you make payment, we’ll explain any bank transfer fees or currency conversion charges you are responsible for paying.</p>',
        '<h3>Purchase orders</h3>',
      ].join(''),
    },
    {
      title: '4. Digital proofs & approval',
      body: [
        '<p>We will email a digital proof within two business days of checkout, provided we have received the artwork and information needed to prepare it. For orders placed by quotation, the proof schedule will be confirmed in writing.</p>',
        '<p>You may request unlimited revisions before approving your proof.</p>',
        '<p>Please check all details carefully, including:</p>',
        '<ul><li>Names, numbers, and spelling.</li><li>Artwork and decoration placement.</li><li>Colors and materials.</li><li>Sizes, measurements, and quantities.</li><li>The delivery address shown in your order details.</li></ul>',
        '<p>Production begins after you approve the proof and meet the applicable payment and information requirements.</p>',
        '<p>Approval confirms the design specifications. Changes requested afterward may not be possible. If we can accommodate a change, we will confirm any additional cost and revised schedule before proceeding.</p>',
        '<p>Proof approval does not remove your rights if a finished product is defective or does not match the agreed specifications.</p>',
      ].join(''),
    },
    {
      title: '5. Artwork & intellectual property',
      body: [
        '<p>You retain ownership of the artwork you provide. You grant us a limited license to use, reproduce, and adapt it as necessary to prepare proofs and fulfill your order, including through production providers working on our behalf.</p>',
        '<p>You confirm that you own the artwork or have permission to use it for the products ordered.</p>',
        '<p>We do not reproduce third-party trademarks, school marks, team logos, or other licensed artwork without appropriate authorization. We may request written permission from the rights holder before production.</p>',
        '<p>For designs created by our artists, your order includes permission to use the approved design on jackets produced by us. Any transfer of copyright, delivery of editable source files, or permission for production elsewhere must be agreed separately in writing.</p>',
        '<p>Our pre-existing patterns, templates, production files, website content, and photography remain ours or belong to their respective owners.</p>',
        '<p>We will obtain your permission before using identifiable photographs of your custom order for marketing.</p>',
      ].join(''),
    },
    {
      title: '6. Colors, materials & decoration',
      body: [
        '<p>Colors displayed on screens are approximate. If precise matching matters, please request a free swatch pack before approving your order. Let us know any specific color-matching requirements before production.</p>',
        '<p>Natural materials, including full-grain leather and melton wool, may have minor variations in grain, texture, and tone. These characteristics are not, by themselves, defects. Material differences from the agreed specifications remain subject to our responsibility to supply the order correctly.</p>',
        '<p>If a specified material is unavailable, we will propose an alternative and obtain your approval before using it. If no alternative is agreed, we will explain the available cancellation and refund options for the affected products.</p>',
        '<p>Some artwork may need adjustment for embroidery, patches, or other decoration methods. Any material change to the appearance of your design will be submitted for approval before production.</p>',
      ].join(''),
    },
    {
      title: '7. Sizing & measurements',
      body: [
        '<p>You are responsible for the sizes and measurements you provide. Please consult our <a href="/sizechart">size chart</a> and measure a jacket that fits you well before ordering.</p>',
        '<p>Any applicable manufacturing measurement tolerances will be disclosed before you approve your order.</p>',
        '<p>Custom-made jackets cannot be returned or exchanged because of a customer-selected sizing error or a change in fit preference, except where required by law.</p>',
        '<p>This restriction does not apply if we supply the wrong size or fail to follow the agreed measurements within any disclosed tolerance.</p>',
      ].join(''),
    },
    {
      title: '8. Team & bulk orders',
      body: [
        '<p>Team pricing starts at 10 jackets unless your quotation states otherwise.</p>',
        '<p>A complete and final roster, including sizes, names, numbers, and quantities where applicable, is required before production.</p>',
        '<p>Changes requested after approval may incur additional costs or affect the schedule. We will confirm any proposed charges before making the changes.</p>',
        '<p>Orders of 25 or more jackets may request a physical pre-production sample. The sample charge, approval process, and credit against the order will be stated in your quotation.</p>',
        '<p>Where a sample is included, bulk production begins after the required sample approval.</p>',
        '<p>If we cannot supply the full agreed quantity, we will contact you to arrange completion, an agreed alternative, or a refund for the unfulfilled portion. We will not charge you for products we do not supply.</p>',
      ].join(''),
    },
    {
      title: 'Production and Delivery',
      body: [
        '<p>Our estimated production time is <strong>2–4 weeks</strong>, followed by an estimated <strong>4–10 days for delivery after shipment</strong>. These are separate periods, so please allow time for both when planning your order.</p>',
        '<p>For custom orders, production begins once we have received your design proof approval, the required cleared payment, and your complete order specifications. Missing information or late approvals may delay production. We’ll let you know how any such delay affects your expected schedule.</p>',
        '<p>Rush production or delivery deadlines apply only when we expressly confirm them in writing.</p>',
        '<p>If we cannot ship within the stated timeframe, we’ll notify you, provide a revised estimate, and offer delay-consent, cancellation, and refund options as required by applicable law. Where your consent is required but not received, we’ll cancel and refund the affected order as required by law.</p>',
        '<p>Delivery times are estimates and may be affected by customs processing, weather, or other circumstances beyond our reasonable control. These delays do not remove our obligations under applicable law.</p>',
        '<p>We’ll share tracking details when available. <strong>If your parcel is lost in transit, we’ll work with the courier to locate it. If it cannot be found and is confirmed lost, you may choose to have your order remade and shipped at no additional cost or receive a full refund.</strong> If your order arrives damaged, please contact us so we can investigate and arrange an appropriate resolution.</p>',
      ].join(''),
    },
    {
      title: '10. Shipping addresses & import charges',
      body: '',
    },
    {
      title: '8. Shipping and Duties',
      body: [
        '<h3>Shipping and Tracking</h3>',
        '<p>We ship from our production facility in <strong>Sialkot, Pakistan</strong>, through FedEx, DHL, or UPS. Once your order is dispatched, we’ll email your tracking details so you can follow your parcel’s progress.</p>',
        '<h3>Import Duties and Customs Charges</h3>',
        '<p>We offer both <strong>duty-paid (DDP)</strong> and <strong>duty-unpaid (DAP)</strong> shipping. Your quote or invoice will clearly state which option applies before you confirm your order.</p>',
        '<ul><li><strong>Duty-paid shipping (DDP):</strong> Your quoted total includes shipping and applicable import duties, taxes, and customs clearance charges. We arrange payment of these charges.</li><li><strong>Duty-unpaid shipping (DAP):</strong> Import duties, taxes, brokerage fees, and customs clearance charges are not included in your quoted total. You are responsible for paying these charges and completing any required import formalities. Payment may be required before delivery.</li></ul>',
        '<h3>Refused, Uncollected, or Returned Parcels</h3>',
        '<p>Please check your shipping address carefully and respond promptly to any delivery or customs requests from the courier.</p>',
        '<p>If your parcel is returned because you refused delivery, did not collect it, provided an incorrect address, or failed to pay charges due under duty-unpaid shipping, you will be responsible for the resulting return shipping and related charges.</p>',
        '<p>Made-to-order jackets returned for these reasons are not eligible for a refund, subject to applicable law. For in-stock jackets ordered exactly as shown, any refund will be reduced by return shipping costs, charges paid on your behalf, and any applicable restocking fee disclosed before purchase.</p>',
        '<p>If a delivery problem is outside your control, please contact us so we can review the situation and help resolve it.</p>',
        '<h3>Shipping Restrictions</h3>',
        '<p>We do not currently ship to <strong>Russia, Belarus, Ukraine, Iran, Syria, North Korea, Cuba, Israel, or any country in Africa</strong>.</p>',
        '<h3>Lost or Damaged Parcels</h3>',
        '<p>If your parcel is lost in transit, please contact us so we can work with the courier to locate it. If it cannot be found and is confirmed lost, you can choose to have your order <strong>remade and shipped at no additional cost</strong> or receive a <strong>full refund</strong>.</p>',
        '<p>If your order arrives damaged, please contact us with photos of the packaging and affected jackets so we can investigate and arrange an appropriate resolution.</p>',
        '<h3>Delivery Responsibility</h3>',
        '<p>We remain responsible for loss or damage during transit until your parcel is delivered to your shipping address. Risk of loss or damage passes to you upon delivery, subject to applicable law.</p>',
        '<p>Please provide a complete and accurate delivery address. Contact us promptly if an address needs correction. Changes may not be possible after dispatch.</p>',
        '<p>The shipping origin and responsibility for import duties, taxes, customs clearance, and brokerage fees will be disclosed at checkout or in your written quotation.</p>',
        '<p>If additional charges arise because of an incorrect address, a refused delivery, or failure to complete required customs steps, we will explain the charges and available options. Any</p>',
      ].join(''),
    },
    {
      title: '11. Changes & cancellations',
      body: [
        '<h3>Before proof approval</h3>',
        '<p>You may request changes or cancellation before approving your proof.</p>',
        '<p>Any separately agreed, non-refundable design or sample charge must have been disclosed and accepted before that work began. Otherwise, payments for a canceled order will be refunded.</p>',
        '<h3>After proof approval</h3>',
        '<p>Once you approve the proof, we commit materials and production capacity to your order. Changes and cancellations may no longer be possible.</p>',
        '<p>Team-order deposits are non-refundable after proof approval if you cancel for convenience, except where a refund is required by law.</p>',
        '<p>These restrictions do not apply where we cancel your order, fail to fulfill it as agreed, or must offer cancellation or a refund under applicable law.</p>',
      ].join(''),
    },
    {
      title: '12. Returns, defects & incorrect orders',
      body: [
        '<p>Custom-made jackets are produced to your approved specifications. We do not accept change-of-mind returns or exchanges for customer-selected sizing errors or details correctly reproduced from the approved proof, except where required by law.</p>',
        '<p>If your order arrives damaged, has a manufacturing defect, or differs from the approved specifications, contact us as soon as reasonably possible at [Customer Service Email].</p>',
        '<p>Please provide your order number, a description of the issue, and photographs where reasonably available. Keep the packaging if it may help investigate shipping damage.</p>',
        '<p>We will assess the issue and provide an appropriate remedy, which may include repair, replacement, or a partial or full refund, as required by applicable law. Where a return is needed because of our error or a confirmed defect, we will arrange or cover reasonable return shipping.</p>',
        '<p>Please contact us for return instructions before sending an item back. This request does not limit your legal rights.</p>',
        '<p>Proof approval or approval of photographs does not waive claims for defects or differences that were not reasonably apparent from the proof or photographs.</p>',
        '<p>Additional information is available in our <a href="/shipping">shipping &amp; returns policy</a>.</p>',
      ].join(''),
    },
    {
      title: '13. Refunds',
      body: [
        '<p>Refunds will be issued to the original payment method where possible. For bank-transfer payments, we will confirm suitable refund arrangements with the payer.</p>',
        '<p>We will process refunds promptly and within any legally required timeframe. Your bank or payment provider may require additional time to display the credit.</p>',
        '<p>A refund required because of our cancellation, error, or failure to fulfill an order will not be reduced by an undisclosed administrative or processing fee.</p>',
      ].join(''),
    },
    {
      title: '14. Our responsibility',
      body: [
        '<p>We are responsible for supplying products that match the agreed specifications and meet applicable legal requirements.</p>',
        '<p>To the extent permitted by law, our total liability arising from an order is limited to the amount paid for that order. To the extent permitted by law, we are not liable for indirect or consequential losses, including lost profits or losses associated with missed events.</p>',
        '<p>These limitations do not apply to fraud, willful misconduct, or any liability that cannot legally be limited or excluded.</p>',
        '<p>Nothing in these terms excludes or restricts non-waivable consumer rights, applicable warranties, or remedies provided by law.</p>',
      ].join(''),
    },
    {
      title: '15. Governing law & disputes',
      body: [
        '<p>For orders sold by [U.S. Legal Company Name], these terms are governed by the laws of [U.S. State], subject to applicable conflict-of-laws rules and mandatory consumer protections.</p>',
        '<p>For orders sold by [Pakistan Legal Business Name], these terms are governed by the laws of Pakistan, subject to applicable conflict-of-laws rules and mandatory consumer protections.</p>',
        '<p>The seller will be identified before you place your order. The payment method alone does not determine the seller or governing law.</p>',
        '<p>Nothing in this section removes protections or access to courts that applicable law requires.</p>',
        '<p>Please contact us first at [Customer Service Email] so we can try to resolve any concern.</p>',
      ].join(''),
    },
    {
      title: '16. Changes & contact',
      body: [
        '<p>We may update these terms from time to time. The version in effect when you place your order applies to that order unless we mutually agree otherwise.</p>',
        '<p>An accepted written quotation may set specific commercial terms for your order. Any departure from these standard terms must be expressly identified and agreed in writing and cannot override mandatory legal rights.</p>',
        '<p>For questions, please <a href="/contact-us">contact us</a>.</p>',
      ].join(''),
    },
  ],
};
