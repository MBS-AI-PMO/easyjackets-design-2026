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
