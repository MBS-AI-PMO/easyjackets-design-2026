// The keyword landing pages (/letterman-jackets …), ported from the live site's data/keywordLandingPages.js
// with the same addresses, titles, copy and questions (N-T3). Added here: `products` (which jackets the
// page lists, a shop filter) and the shared sections below, built only from facts stated elsewhere on the
// site (Shipping & Returns, the builder). Plain data: the page (pages/KeywordLanding.jsx) and the
// storefront server (server.mjs, which writes the same text into the HTML before JavaScript) both read it.

/** Live copy, verbatim ("What You Can Customize" on every live landing page). */
export const LANDING_CUSTOMIZE = {
  heading: 'What you can customize',
  paragraphs: [
    'Easy Jackets lets you start from a jacket style and build the details around the wearer, team, school, or brand. Choose compatible materials, colors, trims, patches, embroidery, names, numbers, and artwork placement before placing the order.',
    'For group orders, collect sizes and personalization details first. The bulk order path is useful when the design stays shared but every jacket needs individual names, numbers, or sizing.',
  ],
};

/** How an order runs, from the Shipping & Returns page and the builder. */
export const LANDING_STEPS = [
  { n: '01', title: 'Design it', desc: 'Build the jacket in the online design lab, or send a sketch or logo and we draw it up. No minimum order: one jacket or a whole class.' },
  { n: '02', title: 'Approve the proof', desc: 'We email a free digital proof of the front, back and sleeves. Nothing is cut until you approve it.' },
  { n: '03', title: 'We make it', desc: 'Standard production takes 10–12 business days; rush production is 7–10 business days for an extra fee. Custom measurements add about three days.' },
  { n: '04', title: 'Delivered, tracked', desc: 'We ship from our workshop by DHL Express and FedEx, tracked and insured: 4–5 business days to the United States, 5–8 elsewhere.' },
];

export const LANDING_PAGES = {
  '/letterman-jackets': {
    title: 'Custom Letterman Jackets',
    h1: 'Custom Letterman Jackets',
    description: 'Shop and design custom letterman jackets with wool, leather, satin, chenille patches, embroidery, names, numbers and school colors.',
    intro: 'Create a letterman jacket that fits your school, team, club, or personal style. Choose the base style, body and sleeve materials, trim colors, names, numbers, chenille patches, embroidery, and artwork placement.',
    quickAnswer: 'Easy Jackets makes custom letterman jackets with premium materials, personalized decoration, inclusive sizing, and support for both single jackets and group orders.',
    highlights: ['Wool, leather, satin, fleece, and nylon options', 'Names, numbers, logos, patches, and embroidery', 'Single custom jackets and bulk school orders'],
    links: [
      { to: '/shop/category/varsity-jackets', label: 'Shop varsity jackets' },
      { to: '/design-custom-jacket', label: 'Start designing' },
      { to: '/bulk-order', label: 'Request a bulk quote' },
    ],
    faqs: [
      { question: 'Can I add school patches to a custom letterman jacket?', answer: 'Yes. You can add chenille patches, embroidered artwork, names, numbers, mascots, initials, and school color details.' },
      { question: 'Can I order one letterman jacket?', answer: 'Yes. Easy Jackets supports individual custom orders as well as school, class, club, and team bulk orders.' },
      { question: 'Which materials work best for letterman jackets?', answer: 'Melton wool bodies with cowhide or sheep leather sleeves create the classic letterman look, while satin and fleece are lighter alternatives.' },
    ],
    products: { material: 'cowhide-leather' },
    productsTitle: 'Letterman jackets to start from',
  },
  '/school-jackets': {
    title: 'Custom School Jackets',
    h1: 'Custom School Jackets',
    description: 'Create custom school jackets for students, clubs, teams and graduation groups with colors, patches, embroidery and bulk order support.',
    intro: 'Build school jackets for classes, clubs, teams, seniors, alumni groups, and spirit wear programs. Match school colors, add mascots and lettering, and keep sizes organized for the full group.',
    quickAnswer: 'Custom school jackets can be designed with school colors, logos, names, numbers, class-year patches, and coordinated sizing for groups.',
    highlights: ['School colors and mascot artwork', 'Class, senior, alumni, and club options', 'Bulk order support for groups'],
    links: [
      { to: '/senior-jackets', label: 'Senior jackets' },
      { to: '/team-jackets', label: 'Team jackets' },
      { to: '/sizechart', label: 'Check sizing' },
    ],
    faqs: [
      { question: 'Can school jackets be ordered in bulk?', answer: 'Yes. Schools and clubs can request bulk pricing, artwork review, size planning, and order support.' },
      { question: 'Can each student have a different name or number?', answer: 'Yes. Personal names, numbers, initials, and role details can be customized per jacket.' },
      { question: 'Do you help match school colors?', answer: 'Yes. Use the color and material options to build a close school-color match before production.' },
    ],
    products: { category: 'varsity-jackets', search: 'high school' },
    productsTitle: 'School jackets to start from',
  },
  '/senior-jackets': {
    title: 'Custom Senior Jackets',
    h1: 'Custom Senior Jackets',
    description: 'Design senior jackets for class groups with school colors, names, numbers, mascots, patches, embroidery and bulk ordering help.',
    intro: 'Senior jackets are built for graduation years, class identity, clubs, teams, and individual student recognition. Add class-year patches, school mascots, names, numbers, embroidery, and school-color trims.',
    quickAnswer: 'Easy Jackets supports senior jacket designs for individuals and full graduating classes, with personalized details for each student.',
    highlights: ['Class year and school mascot options', 'Individual names and numbers', 'Sizing help for student groups'],
    links: [
      { to: '/school-jackets', label: 'School jackets' },
      { to: '/design-custom-jacket', label: 'Design a jacket' },
      { to: '/bulk-order', label: 'Bulk senior orders' },
    ],
    faqs: [
      { question: 'Can every senior jacket have a different name?', answer: 'Yes. Each jacket can include unique names, numbers, initials, roles, or class-year artwork.' },
      { question: 'Are senior jackets only varsity style?', answer: 'No. Varsity, letterman, bomber, hoodie, and coach styles can all be customized for senior groups.' },
      { question: 'Can we review artwork before ordering?', answer: 'Yes. Bulk and group orders can include design support so artwork and placement are confirmed.' },
    ],
    products: { category: 'varsity-jackets' },
    productsTitle: 'Senior jackets to start from',
  },
  '/team-jackets': {
    title: 'Custom Team Jackets',
    h1: 'Custom Team Jackets',
    description: 'Order custom team jackets for sports teams, clubs, schools and businesses with coordinated colors, logos, names and numbers.',
    intro: 'Create jackets for sports teams, clubs, staff groups, businesses, and school programs. Keep the base design consistent while personalizing names, numbers, roles, and sizing per wearer.',
    quickAnswer: 'Custom team jackets can combine group logos, team colors, names, numbers, and bulk order support in one coordinated design.',
    highlights: ['Team logos, names, and numbers', 'Sports, club, and staff designs', 'Bulk pricing and order support'],
    // live: "Sports and spirit wear" (/sports-spirit-wears), which now points here (N-T17)
    extra: {
      heading: 'For every sport',
      paragraphs: [
        'Volleyball, basketball, soccer, ice hockey, baseball and American football teams can all wear one shared design, with each player’s name and number on their own jacket. Pick a varsity, bomber or coach style for the season and the climate, add the team logo and colors, and collect sizes for the whole roster in one bulk order.',
      ],
    },
    links: [
      { to: '/bulk-order', label: 'Request team pricing' },
      { to: '/shop/category/coach-jackets', label: 'Coach jackets' },
      { to: '/shop/category/bomber-jackets', label: 'Bomber jackets' },
    ],
    faqs: [
      { question: 'Can every team member get a custom number?', answer: 'Yes. Names, numbers, initials, and role labels can vary by jacket while keeping the shared team design.' },
      { question: 'Which styles work for teams?', answer: 'Varsity, bomber, coach, hoodie, and sports styles can all work depending on climate, use, and budget.' },
      { question: 'Can businesses order team jackets?', answer: 'Yes. Custom team jackets can be made for companies, staff uniforms, clubs, and events.' },
    ],
    products: { category: 'coach-jackets' },
    productsTitle: 'Team jackets to start from',
  },
  '/mens-varsity-jackets': {
    title: "Men's Varsity Jackets",
    h1: "Men's Varsity Jackets",
    description: "Shop men's varsity jackets and design custom letterman styles with premium materials, colors, patches, embroidery and inclusive sizing.",
    intro: "Design men's varsity jackets with classic letterman proportions, wool bodies, leather sleeves, rib trim, personalized patches, embroidery, names, numbers, and custom colors.",
    quickAnswer: "Men's varsity jackets from Easy Jackets are customizable in style, material, color, sizing, embroidery, patches, and artwork placement.",
    highlights: ['Classic varsity and letterman fits', 'Premium wool, leather, satin, and fleece', 'Names, numbers, logos, and patches'],
    links: [
      { to: '/shop/category/varsity-jackets', label: 'Shop varsity styles' },
      { to: '/leather-varsity-jackets', label: 'Leather varsity jackets' },
      { to: '/sizechart', label: "Men's sizing guide" },
    ],
    faqs: [
      { question: "Can men's varsity jackets be customized?", answer: 'Yes. Materials, colors, trim, patches, names, numbers, and embroidery can all be customized.' },
      { question: "Do men's varsity jackets come in larger sizes?", answer: 'Yes. Check the size guide and available product sizes before ordering.' },
      { question: "Can I make a men's wool and leather jacket?", answer: 'Yes. Melton wool bodies with cowhide or sheep leather sleeves are available on compatible styles.' },
    ],
    products: { category: 'varsity-jackets' },
    productsTitle: "Men's varsity jackets",
  },
  '/womens-varsity-jackets': {
    title: "Women's Varsity Jackets",
    h1: "Women's Varsity Jackets",
    description: "Shop women's varsity jackets and personalized letterman styles with custom colors, patches, embroidery, fleece, satin, wool and leather.",
    intro: "Create women's varsity jackets for school, fashion, teams, seniors, clubs, and personal wear. Choose the jacket style, colors, trims, artwork, names, numbers, embroidery, and material mix.",
    quickAnswer: "Women's varsity jackets can be designed with personalized materials, colors, patches, names, numbers, embroidery, and size options.",
    highlights: ['Varsity, cropped, bomber, and hoodie styles', 'Custom names, numbers, and patches', 'Wool, leather, satin, fleece, and nylon'],
    links: [
      { to: '/shop/category/cropped-varsity-jackets', label: 'Cropped varsity jackets' },
      { to: '/shop/category/varsity-jackets', label: 'Varsity jackets' },
      { to: '/design-custom-jacket', label: 'Design yours' },
    ],
    faqs: [
      { question: "Can I design a women's cropped varsity jacket?", answer: 'Yes. Cropped varsity styles can be customized with colors, trims, patches, names, numbers, and embroidery.' },
      { question: "Are women's varsity jackets only for schools?", answer: 'No. They can be made for fashion, teams, clubs, events, businesses, and personal use.' },
      { question: 'Can I choose satin or fleece?', answer: 'Yes. Material availability depends on the selected product style, but satin, fleece, wool, leather, and nylon options are supported.' },
    ],
    products: { material: 'satin' },
    productsTitle: "Women's varsity jackets to start from",
  },
  '/leather-varsity-jackets': {
    title: 'Custom Leather Varsity Jackets',
    h1: 'Custom Leather Varsity Jackets',
    description: 'Design leather varsity jackets with cowhide or sheep leather sleeves, wool bodies, custom colors, chenille patches and embroidery.',
    intro: 'Build leather varsity jackets with cowhide or sheep leather sleeves, melton wool bodies, rib trim, custom colors, patches, logos, names, numbers, and embroidery.',
    quickAnswer: 'Leather varsity jackets pair premium leather sleeves with classic varsity details and can be personalized for individuals, schools, teams, and brands.',
    highlights: ['Cowhide and sheep leather sleeve options', 'Wool body and leather sleeve combinations', 'Patches, logos, names, and embroidery'],
    links: [
      { to: '/shop/material/cowhide-leather', label: 'Cowhide leather jackets' },
      { to: '/shop/material/sheep-leather', label: 'Sheep leather jackets' },
      { to: '/wool-and-leather-varsity-jackets', label: 'Wool and leather styles' },
    ],
    faqs: [
      { question: 'What leather options are available?', answer: 'Cowhide leather and sheep leather can be used on compatible jacket styles, usually as sleeve materials.' },
      { question: 'Can leather varsity jackets have patches?', answer: 'Yes. Chenille patches, embroidery, names, numbers, logos, and initials can be added.' },
      { question: 'Are leather varsity jackets good for school orders?', answer: 'Yes. They are a classic choice for letterman and school jackets, especially with melton wool bodies.' },
    ],
    products: { material: 'cowhide-leather' },
    productsTitle: 'Leather varsity jackets',
  },
  '/wool-and-leather-varsity-jackets': {
    title: 'Wool and Leather Varsity Jackets',
    h1: 'Wool and Leather Varsity Jackets',
    description: 'Shop wool and leather varsity jackets with melton wool bodies, leather sleeves, rib trim, custom patches, embroidery and school colors.',
    intro: 'The wool and leather varsity jacket is the classic letterman combination: melton wool body, leather sleeves, ribbed trim, snap front, pockets, patches, embroidery, and school-color details.',
    quickAnswer: 'Wool and leather varsity jackets combine melton wool bodies with cowhide or sheep leather sleeves for a traditional letterman look.',
    highlights: ['Melton wool body options', 'Cowhide or sheep leather sleeves', 'Classic letterman styling and custom decoration'],
    links: [
      { to: '/shop/material/melton-wool', label: 'Melton wool jackets' },
      { to: '/leather-varsity-jackets', label: 'Leather varsity jackets' },
      { to: '/letterman-jackets', label: 'Letterman jackets' },
    ],
    faqs: [
      { question: 'What is the classic varsity jacket material mix?', answer: 'The classic mix is a melton wool body with cowhide or sheep leather sleeves and ribbed trim.' },
      { question: 'Can I choose different wool and leather colors?', answer: 'Yes. Body, sleeve, trim, and patch colors can be customized on compatible styles.' },
      { question: 'Can wool and leather jackets be ordered in bulk?', answer: 'Yes. Schools, teams, clubs, and businesses can request bulk support and design help.' },
    ],
    products: { material: 'melton-wool' },
    productsTitle: 'Wool and leather varsity jackets',
  },
  '/satin-bomber-jackets': {
    title: 'Custom Satin Bomber Jackets',
    h1: 'Custom Satin Bomber Jackets',
    description: 'Shop custom satin bomber jackets with smooth satin fabric, team colors, logos, embroidery, patches and lightweight varsity styling.',
    intro: 'Create satin bomber jackets for lightweight team wear, school apparel, brands, events, and personal style. Add custom colors, logos, embroidery, patches, names, numbers, and trim details.',
    quickAnswer: 'Custom satin bomber jackets are lightweight, smooth, and customizable with colors, artwork, embroidery, patches, logos, names, and numbers.',
    highlights: ['Smooth satin fabric', 'Lightweight bomber styling', 'Logos, embroidery, names, numbers, and patches'],
    links: [
      { to: '/shop/category/bomber-jackets', label: 'Shop bomber jackets' },
      { to: '/shop/material/satin', label: 'Satin jacket collection' },
      { to: '/design-custom-jacket', label: 'Start a custom design' },
    ],
    faqs: [
      { question: 'Can satin bomber jackets have embroidery?', answer: 'Yes. Satin bomber jackets can include embroidered logos, names, numbers, patches, and custom artwork.' },
      { question: 'Are satin bomber jackets lightweight?', answer: 'Yes. Satin is a smooth, lighter material option compared with wool and leather combinations.' },
      { question: 'Can a satin bomber jacket be used for team wear?', answer: 'Yes. Satin bomber jackets work well for teams, clubs, brands, schools, and event apparel.' },
    ],
    products: { category: 'bomber-jackets' },
    productsTitle: 'Satin bomber jackets',
  },
};

// Not on the live site: "varsity jacket with hood" already shows the site at position 10 with no page made
// for it (SEO audit B-O7). The shop's 7 hooded varsity jackets (melton wool, cowhide leather sleeves).
LANDING_PAGES['/hooded-varsity-jackets'] = {
  title: 'Hooded Varsity Jackets',
  h1: 'Hooded Varsity Jackets',
  description: 'Custom hooded varsity jackets: melton wool bodies, cowhide leather sleeves and an attached hood, made to order with your colors, letters, names and numbers.',
  intro: 'A hooded varsity jacket keeps everything about the classic letterman, the melton wool body, cowhide leather sleeves and ribbed trim, and adds a hood. Choose the body, sleeve and trim colors, then add chenille letters, patches, names and numbers.',
  quickAnswer: 'Easy Jackets makes hooded varsity jackets to order, in your colors and with your decoration, for single jackets and for team orders.',
  highlights: ['Melton wool body, cowhide leather sleeves', 'Attached hood in the jacket colors', 'Chenille letters, patches, names and numbers'],
  links: [
    { to: '/shop/category/varsity-jackets', label: 'All varsity jackets' },
    { to: '/design-custom-jacket', label: 'Design your own' },
    { to: '/bulk-order', label: 'Team orders' },
  ],
  faqs: [
    { question: 'Can a varsity jacket have a hood?', answer: 'Yes. Our hooded varsity jackets have the usual wool body and leather sleeves with an attached hood.' },
    { question: 'Can I add letters and patches to a hooded varsity jacket?', answer: 'Yes. Chenille letters, patches, names, numbers and embroidery can be added as on any varsity jacket.' },
    { question: 'Can a team order hooded varsity jackets?', answer: 'Yes. Teams and schools can order the same hooded design with each name and number personalized.' },
  ],
  products: { search: 'hooded varsity' },
  productsTitle: 'Hooded varsity jackets',
};

export const landingPage = (pathname = '') => LANDING_PAGES[String(pathname).replace(/\/+$/, '') || '/'] || null;
