// A jacket designed in the builder (custom-jacket/), summarised for emails: the build (materials,
// size, styles), advanced options, colors and the artwork on every placement. Shared by the
// shared-design email (helpers/fileEmail.js) and the order emails (helpers/orderEmailData.js).

export const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim());

// "chestPocket" -> "Chest pocket"
export const label = (key) => {
    const words = String(key).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
};
const shown = (v) => (v === true ? 'Yes' : v === false ? 'No' : v == null ? '' : String(v));

// the builder's placements, in the order they sit on the jacket
export const PLACEMENTS = [
    'Front Center', 'Right Chest', 'Left Chest', 'Right Chest Verticle', 'Left Chest Verticle',
    'Right Pocket', 'Left Pocket', 'Right Sleeve', 'Left Sleeve', 'Right Mid Sleeve Upper', 'Left Mid Sleeve Upper',
    'Right Mid Sleeve Lower', 'Left Mid Sleeve Lower', 'Right Sleeve End', 'Left Sleeve End', 'Back Top', 'Back Middle', 'Back Bottom',
];

/** "Varsity Jackets" -> "Varsity Jacket" */
export const jacketName = (design) => String(design?.globals?.catName || 'Jacket').trim().replace(/s$/i, '');

// one placement ({ done, <section>: {...} }) as a line of text plus its colours
const describePlacement = (entry) => {
    const [section, v] = Object.entries(entry || {}).find(([k, val]) => k !== 'done' && val && typeof val === 'object') || [];
    if (!section) return null;
    const colors = [v.fill, v.stroke, v.border].filter(isHex);
    const bits = [];
    if (section === 'name') bits.push('Name', v.title && `“${v.title}”`, v.appearance, v.font);
    else if (section === 'letters') bits.push(v.type === 'Ready To Use' ? 'Ready-made patch' : 'Letters', v.title && `“${v.title}”`, v.appearance, v.font, v.treatment && 'chenille');
    else if (section === 'editables') bits.push('Editable badge', v.txt1 && `“${v.txt1}”`, v.txt2 && `“${v.txt2}”`);
    else if (section === 'symbol') bits.push(v.type ? label(v.type) : 'Symbol', typeof v.flag === 'string' && v.flag.replace(/[-_]+/g, ' '));
    else if (section === 'upload') bits.push('Uploaded logo / artwork');
    else bits.push(label(section));
    return { text: bits.filter(Boolean).join(' · '), colors };
};

/**
 * @returns {{ name: string, build: string[][], extras: string[], colors: string[][], artwork: { place: string, text: string, colors: string[] }[] }}
 */
export const designSummary = (design) => {
    const d = design || {};
    const s = d.sizes || {};
    const scale = { in: 'Inches', cm: 'Centimetres' }[s.scale] || s.scale;
    const build = [
        ['Jacket', `Custom ${jacketName(d)}`],
        ['Body material', d.materials?.body],
        ['Sleeves material', d.materials?.sleeves],
        ['Size', s.custom ? 'Custom measurements' : s.size],
        ['Scale', scale],
        ...Object.entries(d.styles || {})
            .filter(([k, v]) => k !== 'section' && (typeof v !== 'object' || v === null) && shown(v) !== '')
            .map(([k, v]) => [label(k), shown(v)]),
    ].filter(([, v]) => shown(v) !== '').map(([k, v]) => [k, shown(v)]);

    const extras = Object.entries(d.advance || {}).filter(([k, v]) => v === true && k !== 'insertsCount').map(([k]) => label(k));
    if (d.advance?.inserts && d.advance?.insertsCount) extras.push(`${d.advance.insertsCount} insert${d.advance.insertsCount > 1 ? 's' : ''}`);

    const colors = Object.entries(d.colors || {}).filter(([k, v]) => k !== 'defaults' && isHex(v)).map(([k, v]) => [label(k), v.trim().toUpperCase()]);
    const places = [...PLACEMENTS, ...Object.keys(d.designs || {}).filter((k) => !PLACEMENTS.includes(k))];
    const artwork = places
        .map((p) => {
            const a = d.designs?.[p] && typeof d.designs[p] === 'object' ? describePlacement(d.designs[p]) : null;
            return a ? { place: p.replace('Verticle', 'Vertical'), ...a } : null;
        })
        .filter(Boolean);
    return { name: `Custom ${jacketName(d)}`, build, extras, colors, artwork };
};
