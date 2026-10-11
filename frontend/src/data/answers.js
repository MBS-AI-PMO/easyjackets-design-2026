// Answer-first summaries for the questions AI answer engines and searchers ask most (SEO audit G-3, B-O7):
// a 2–3 sentence answer and a small table at the top of the page that covers the question, with a visible
// "Updated" date and FAQPage schema. Facts only from the site itself (Shipping & Returns, the size chart,
// the shop's materials) or live data: the cost answer's prices come from the API (GET /product/price-ranges,
// the checkout's own prices), so they follow every price change and sale.
// Shown by components/AnswerBox.jsx; the storefront server writes the same text into the HTML (server.mjs).
// Keys are page addresses.

export const ANSWERS = {
  '/new-blog/how-much-do-custom-varsity-jackets-cost': {
    question: 'How much does a custom varsity jacket cost?',
    // {from}, {typical}, {usShipping}, {freeOver} are filled from live prices and shipping rates
    answer: 'A custom varsity jacket from Easy Jackets costs from {from}, and most varsity jackets start at about {typical}; the price depends on the style, the materials and the size. Names, numbers, patches and embroidery are added in the design lab, which shows the price as you go. Shipping to the US is {usShipping} for one jacket{freeOver}.',
    table: 'priceRanges',
    links: [{ href: '/shop', label: 'Shop jackets' }, { href: '/design-custom-jacket', label: 'Price a custom design' }, { href: '/bulk-order', label: 'Team pricing' }],
    updated: '2026-10-11',
  },
  '/new-blog/varsity-jacket-vs-letterman-jacket-what-s-the-real-difference': {
    question: 'What is the difference between a varsity jacket and a letterman jacket?',
    answer: 'They are the same jacket. A varsity jacket is the style: a wool body, leather sleeves, a ribbed collar, cuffs and waistband and a snap front. It is called a letterman jacket when it carries the chenille letter a student earns by making a school team; today the two names are used for the same style.',
    table: {
      head: ['', 'Varsity jacket', 'Letterman jacket'],
      rows: [
        ['What the name means', 'The style of jacket', 'A varsity jacket with an earned letter'],
        ['Body and sleeves', 'Wool body, leather sleeves', 'The same'],
        ['Letter', 'Optional', 'The chenille school letter'],
        ['Who wears it', 'Anyone: teams, schools, brands, fashion', 'Students and athletes, alumni'],
      ],
    },
    links: [{ href: '/letterman-jackets', label: 'Custom letterman jackets' }, { href: '/shop/category/varsity-jackets', label: 'Custom varsity jackets' }],
    updated: '2026-10-11',
  },
  '/new-blog/what-is-a-varsity-jacket-history-style-modern-trends': {
    question: 'What is a varsity jacket?',
    answer: 'A varsity jacket is a jacket with a wool body, leather sleeves, a ribbed knit collar, cuffs and waistband and a snap front, named after the school varsity teams whose athletes first wore it. Today schools, teams, clubs and brands wear it, decorated with chenille letters, patches, names and numbers.',
    table: {
      head: ['Part', 'Classic', 'Other options'],
      rows: [
        ['Body', 'Melton wool', 'Satin, cotton fleece, cotton twill, nylon'],
        ['Sleeves', 'Cowhide or sheep leather', 'Wool, satin, fleece'],
        ['Trim', 'Ribbed knit collar, cuffs and waistband', 'Stripes in team colours'],
        ['Closure', 'Snap buttons', 'Zip, hood'],
        ['Decoration', 'Chenille letter', 'Patches, embroidery, names, numbers'],
      ],
    },
    links: [{ href: '/shop/category/varsity-jackets', label: 'Custom varsity jackets' }, { href: '/design-custom-jacket', label: 'Design your own' }],
    updated: '2026-10-11',
  },
  '/new-blog/varsity-jacket-size-guide-how-to-choose-the-perfect-fit': {
    question: 'How do I choose my varsity jacket size?',
    answer: 'Measure around the fullest part of the chest and compare it with the size chart, in inches or centimetres. Easy Jackets sizes run from XXS to 6XL with tall sizes, plus youth, cropped and coach jacket charts. Custom-made jackets are final sale, so check the chart before you order.',
    table: {
      head: ['Fit', 'Sizes'],
      rows: [
        ['Regular', 'XXS, XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL'],
        ['Tall (longer body and sleeves)', 'M Tall, L Tall, XL Tall, 2XL Tall'],
        ['Youth, cropped and coach', 'Their own charts on the size chart page'],
        ['Returns', 'Custom made: final sale. Plain stock jackets: within 10 days'],
      ],
    },
    links: [{ href: '/sizechart', label: 'Size chart (inches & cm)' }, { href: '/return-policy', label: 'Return policy' }],
    updated: '2026-10-11',
  },
  '/new-blog/best-materials-custom-varsity-jackets-wool-leather-satin-nylon': {
    question: 'What is the best material for a varsity jacket?',
    answer: 'The classic varsity jacket is a melton wool body with cowhide or sheep leather sleeves: warm, structured and long-lasting. Satin is lighter with a sheen, fleece is soft and casual, and nylon or soft shell suits coach jackets that need to shrug off wind and rain.',
    table: {
      head: ['Material', 'Feel', 'Best for'],
      rows: [
        ['Melton wool + leather sleeves', 'Warm, structured', 'Classic letterman and school jackets'],
        ['Satin', 'Light, smooth, shiny', 'Bomber and team jackets, mild weather'],
        ['Cotton fleece', 'Soft, casual', 'Hoodies and relaxed varsity styles'],
        ['Cotton twill', 'Durable, matte', 'Everyday jackets'],
        ['Nylon / soft shell', 'Light, wind and water resistant', 'Coach jackets'],
      ],
    },
    links: [{ href: '/fabrics', label: 'See the fabrics' }, { href: '/material-colors', label: 'Materials & colors' }],
    updated: '2026-10-11',
  },
  '/shipping': {
    question: 'How long does a custom varsity jacket take?',
    answer: 'About three weeks to the US: 10–12 business days to make it after you approve the free proof, then 4–5 business days by DHL Express or FedEx. Rush production takes 7–10 business days for an extra fee.',
    table: {
      head: ['Step', 'Time'],
      rows: [
        ['Design and free proof', 'Proof within 2 business days'],
        ['Production (after approval)', '10–12 business days (rush: 7–10)'],
        ['Custom measurements', 'About 3 extra days'],
        ['Delivery to the US', '4–5 business days'],
        ['Delivery elsewhere', '5–8 business days'],
      ],
    },
    links: [{ href: '/track-order', label: 'Track an order' }, { href: '/bulk-order', label: 'Team orders' }],
    updated: '2026-10-11',
  },
};

/** The answer for a page address, or null. */
export const answerFor = (path = '') => ANSWERS[String(path).replace(/\/+$/, '') || '/'] || null;

/** The quick-answer pages, for the FAQ page and the footer. */
export const ANSWER_LINKS = [
  ['How much does a varsity jacket cost?', '/new-blog/how-much-do-custom-varsity-jackets-cost'],
  ['How long does a custom jacket take?', '/shipping'],
  ['Varsity vs letterman jacket', '/new-blog/varsity-jacket-vs-letterman-jacket-what-s-the-real-difference'],
  ['What is a varsity jacket?', '/new-blog/what-is-a-varsity-jacket-history-style-modern-trends'],
  ['Varsity jacket sizing', '/new-blog/varsity-jacket-size-guide-how-to-choose-the-perfect-fit'],
  ['Best varsity jacket materials', '/new-blog/best-materials-custom-varsity-jackets-wool-leather-satin-nylon'],
];

/** "{from}" style placeholders → values. */
export const fillAnswer = (text, values) => String(text).replace(/\{(\w+)\}/g, (all, key) => (values[key] != null ? values[key] : all));
