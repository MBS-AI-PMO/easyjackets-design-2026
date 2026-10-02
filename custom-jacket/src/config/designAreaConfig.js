// Configuration for design area dimensions
// Each part has its own width, height, and viewBox settings that match the jacket design areas

export const DESIGN_AREA_CONFIG = {
    'Front Center': {
        width: 267,
        height: 45,
        viewBox: '0 0 267 45'
    },
    'Right Chest': {
        width: 85,
        height: 85,
        viewBox: '0 0 85 85'
    },
    'Left Chest': {
        width: 85,
        height: 85,
        viewBox: '0 0 85 85'
    },
    'Right Pocket': {
        width: 55,
        height: 55,
        viewBox: '0 0 44 44'  // Pocket uses scaled viewBox
    },
    'Left Pocket': {
        width: 55,
        height: 55,
        viewBox: '0 0 44 44'  // Pocket uses scaled viewBox
    },
    'Right Sleeve': {
        width: 178,
        height: 72,
        viewBox: '0 0 72 72'
    },
    'Left Sleeve': {
        width: 178,
        height: 72,
        viewBox: '0 0 72 72'
    },
    'Right Mid Sleeve Upper': {
        width: 85,
        height: 85,
        viewBox: '0 0 85 85'
    },
    'Left Mid Sleeve Upper': {
        width: 85,
        height: 85,
        viewBox: '0 0 85 85'
    },
    'Right Mid Sleeve Lower': {
        width: 85,
        height: 85,
        viewBox: '0 0 85 85'
    },
    'Left Mid Sleeve Lower': {
        width: 85,
        height: 85,
        viewBox: '0 0 85 85'
    },
    'Right Sleeve End': {
        width: 178,
        height: 42,
        viewBox: '0 0 42 42'
    },
    'Left Sleeve End': {
        width: 178,
        height: 42,
        viewBox: '0 0 42 42'
    },
    'Back Top': {
        width: 260,
        height: 45,
        viewBox: '0 0 260 45'
    },
    'Back Middle': {
        width: 245,
        height: 95,
        viewBox: '0 0 245 190'
    },
    'Back Bottom': {
        width: 210,
        height: 70,
        viewBox: '0 0 210 70'
    },
    'Right Chest Verticle': {
        width: 85,
        height: 175,
        viewBox: '0 0 85 175'
    },
    'Left Chest Verticle': {
        width: 85,
        height: 175,
        viewBox: '0 0 85 175'
    }
};

/**
 * Panels that are far wider than they are tall - the chest and back name bands. Their
 * preview can fill the whole modal column without turning into a tall block, so the modal
 * sizes them differently from the square chest / pocket / sleeve previews. Derived from the
 * viewBox rather than a hand-kept list, because the viewBox is what the preview renders at.
 * @param {string} part - The part name
 * @returns {boolean}
 */
export const isWideDesignArea = (part) => {
    const box = DESIGN_AREA_CONFIG[part]?.viewBox;
    if (!box) return false;
    const [, , width, height] = box.split(/\s+/).map(Number);
    return Boolean(height) && width / height >= 2.5;
};

/**
 * Get the design area configuration for a specific part
 * @param {string} part - The part name (e.g., 'Front Center', 'Left Chest')
 * @returns {Object} - Configuration object with width, height, and viewBox
 */
export const getDesignAreaConfig = (part) => {
    return DESIGN_AREA_CONFIG[part] || {
        width: 240,
        height: 43,
        viewBox: '0 0 73 82'  // Default fallback
    };
};

/**
 * The guide rectangles drawn on the jacket for each place (components/Jacket: front, back, left,
 * right), as width / height. The add-design dialog shapes its preview like the place's guide, so
 * what you see there is the area it will fill on the jacket. Read from the drawings: some
 * DESIGN_AREA_CONFIG sizes above differ from them (Back Middle 245x190, not 245x95; Back Bottom
 * 210x45, not 210x70). Places not listed have a square guide.
 */
const GUIDE_SIZES = {
    'Front Center': [267, 44.92],
    'Back Top': [260, 45],
    'Back Middle': [245, 190],
    'Back Bottom': [210, 45],
    'Right Chest Verticle': [85, 175],
    'Left Chest Verticle': [85, 175],
};

// Places a product draws at another size: the cropped varsity's shorter back has a 245 x 140 Back Middle
// guide (components/Jacket/back.js), not 245 x 190; the coach (components/coach/back.js) has a wider back.
const PRODUCT_GUIDE_SIZES = {
    4893: { 'Back Middle': [245, 140] },
    6046: { 'Back Middle': [255, 190], 'Back Bottom': [230, 58] },
};

/** The place's guide as [width, height] on the given product (a square for the places not listed). */
export const getGuideSize = (part, productId) =>
    PRODUCT_GUIDE_SIZES[String(productId).trim()]?.[part] || GUIDE_SIZES[part] || [100, 100];

/** The place's guide shape as width / height (1 for the square ones). */
export const getGuideRatio = (part, productId) => {
    const [width, height] = getGuideSize(part, productId);
    return width / height;
};

/** getDesignAreaConfig for a product: a place it draws at another size gets that size's viewBox. */
export const getProductDesignAreaConfig = (part, productId) => {
    const config = getDesignAreaConfig(part);
    const own = PRODUCT_GUIDE_SIZES[String(productId).trim()]?.[part];
    return own ? { ...config, height: own[1], viewBox: `0 0 ${own[0]} ${own[1]}` } : config;
};
