// Search copy for the shop's collection pages: the H1, intro, quick answer and
// page title for /shop and every /shop/<type>/<value> page. Mirrors the live
// site's catalog profiles (easyjackets/src/utils/catalogFilters.js) so the same
// URLs keep the same wording, with a generated fallback for everything else.
import { FILTER_TYPES, slugify, unslugify } from './urls';

export const CATALOG_SEO_PROFILES = {
  'category:varsity-jackets': { title: 'Custom Varsity Jackets | Design Your Own', h1: 'Custom Varsity Jackets', description: 'Shop custom varsity jackets with wool, leather, satin, colors, embroidery, patches, names and numbers from Easy Jackets.' },
  'category:bomber-jackets': { title: 'Custom Bomber Jackets', h1: 'Custom Bomber Jackets', description: 'Design custom bomber jackets with satin, fleece, nylon, leather, embroidery, patches, colors, logos and team details.' },
  'category:coach-jackets': { title: 'Custom Coach Jackets', h1: 'Custom Coach Jackets', description: 'Shop custom coach jackets for teams, clubs, schools and businesses with personalized colors, logos and embroidery.' },
  'category:hoodies': { title: 'Custom Hoodies', h1: 'Custom Hoodies', description: 'Create custom hoodies with fleece, colors, logos, embroidery, patches, names and numbers for teams, schools and groups.' },
  'category:cropped-varsity-jackets': { title: 'Cropped Varsity Jackets', h1: 'Cropped Varsity Jackets', description: 'Shop cropped varsity jackets with custom colors, materials, embroidery, patches and personalized design options.' },
  'material:melton-wool': { title: 'Melton Wool Varsity Jackets', h1: 'Melton Wool Varsity Jackets', description: 'Design melton wool varsity jackets with premium wool bodies, leather sleeve options, rib trim, embroidery and patches.' },
  'material:cowhide-leather': { title: 'Cowhide Leather Varsity Jackets', h1: 'Cowhide Leather Varsity Jackets', description: 'Shop cowhide leather varsity jackets and leather sleeve letterman styles with custom colors, patches and embroidery.' },
  'material:sheep-leather': { title: 'Sheep Leather Varsity Jackets', h1: 'Sheep Leather Varsity Jackets', description: 'Create sheep leather varsity jackets with soft leather sleeves, wool bodies, custom colors, names, patches and logos.' },
  'material:satin': { title: 'Satin Varsity Jackets', h1: 'Satin Varsity Jackets', description: 'Shop satin varsity jackets and satin bomber styles with lightweight fabric, team colors, embroidery and custom patches.' },
  'material:cotton-twill': { title: 'Cotton Twill Varsity Jackets', h1: 'Cotton Twill Varsity Jackets', description: 'Customize cotton twill varsity jackets with durable fabric, colors, embroidery, patches, names and team logos.' },
  'material:cotton-fleece': { title: 'Cotton Fleece Jackets and Hoodies', h1: 'Cotton Fleece Jackets and Hoodies', description: 'Shop cotton fleece custom jackets and hoodies with soft fabric, personalized colors, logos, embroidery and patches.' },
  'material:nylon': { title: 'Nylon Varsity Jackets', h1: 'Nylon Varsity Jackets', description: 'Design nylon varsity jackets with lightweight material, custom colors, logos, patches, embroidery and team details.' },
  'material:soft-shell': { title: 'Soft Shell Jackets', h1: 'Soft Shell Jackets', description: 'Customize soft shell jackets for teams, clubs and businesses with logos, colors, embroidery and practical outerwear details.' },
  'color:yellow': { title: 'Yellow Varsity Jackets', h1: 'Yellow Varsity Jackets', description: 'Shop yellow varsity jackets with custom materials, patches, embroidery, names, numbers and school color combinations.' },
  'color:royal-blue': { title: 'Royal Blue Varsity Jackets', h1: 'Royal Blue Varsity Jackets', description: 'Design royal blue varsity jackets with wool, leather, satin, embroidery, patches, names and team color details.' },
  'color:crimson': { title: 'Crimson Varsity Jackets', h1: 'Crimson Varsity Jackets', description: 'Create crimson varsity jackets with custom sleeves, trim colors, embroidery, chenille patches, names and numbers.' },
  'color:old-gold': { title: 'Old Gold Varsity Jackets', h1: 'Old Gold Varsity Jackets', description: 'Shop old gold varsity jackets with personalized materials, leather sleeve options, patches, embroidery and team colors.' },
  'color:light-gray': { title: 'Light Gray Varsity Jackets', h1: 'Light Gray Varsity Jackets', description: 'Design light gray varsity jackets with custom wool, leather, satin, embroidery, patches, names and numbers.' },
  'color:dark-purple': { title: 'Dark Purple Varsity Jackets', h1: 'Dark Purple Varsity Jackets', description: 'Shop dark purple varsity jackets with personalized materials, embroidery, custom patches, logos and team colors.' },
};

/**
 * The copy for a shop view. `filters` holds slugs ({ category, material, color, size });
 * `labels` may carry display names for them (e.g. the category's real name).
 */
export function catalogProfile(filters = {}, labels = {}) {
  const active = FILTER_TYPES.filter((t) => filters[t]);
  const one = active.length === 1 ? active[0] : null;
  const profile = one ? CATALOG_SEO_PROFILES[`${one}:${slugify(filters[one])}`] : null;
  const label = active.map((t) => labels[t] || unslugify(filters[t], t)).join(' ');
  // a category is already a kind of jacket ("Hoodies"); materials, colours and sizes describe varsity jackets
  const h1 = profile?.h1 || (!label ? 'Custom Varsity Jackets' : one === 'category' ? `Custom ${label}` : `${label} Varsity Jackets`);
  const productPhrase = h1.toLowerCase();
  const intro = profile?.description || (label
    ? `Shop ${productPhrase} built for schools, teams, clubs, and everyday streetwear. Choose premium materials, custom colors, sizing, patches, and embroidery support from Easy Jackets.`
    : 'Explore custom varsity jackets made for school pride, team identity, bulk orders, and personal style. Easy Jackets combines premium materials with online customization and design help.');
  const quickAnswer = label
    ? `${h1} are customizable jackets from Easy Jackets with options for materials, colors, sizes, embroidery, names, numbers, and bulk team ordering.`
    : 'Custom Varsity Jackets from Easy Jackets can be personalized with premium materials, colors, patches, embroidery, and sizes for individuals, schools, teams, and organizations.';
  const title = profile?.title || (label ? h1 : 'Shop Varsity Jackets');
  const description = profile?.description || (label
    ? `Shop ${productPhrase} at Easy Jackets. Explore customizable jackets with premium materials, colors, sizing, and free design assistance.`
    : 'Browse our collection of premium varsity and letterman jackets. Customize colors, materials, and add your own embroidery. Free design assistance available.');
  return { h1, intro, quickAnswer, title, description, productPhrase };
}
