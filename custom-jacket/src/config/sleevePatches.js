// Every sleeve patch on every jacket (Sleeve, Mid Sleeve Upper, Mid Sleeve Lower and Sleeve End, on
// both sleeves) is one size: 60 x 60 in the varsity drawing
// (components/Jacket: varsity, cropped, bomber, hoodie), and 60 x 60 in the coach drawing
// (components/coach) too. The coach is drawn at a smaller scale (1.0731 screen px per unit against
// 1.2154), so its patches show about 12% smaller on screen; 68 there would match the others on screen.
export const SLEEVE_PATCH = 60;
export const COACH_SLEEVE_PATCH = 60;

// How much of a sleeve patch a name fills (its letters and their outline), centred: utils/autoFitText.js
export const PATCH_NAME_FILL = 0.94;
// The outline of a name on a sleeve patch, in the patch's own units (a patch is 60 across): the same on
// every patch and every jacket (it used to follow each place's own scale, from 0.85 to 2.35).
export const PATCH_NAME_OUTLINE = 2.4;
// Typed letters (Letters › Type Your Own) keep the proportions of their add-design preview
// (components/modal/letters.js): the stroke 4 on a 100.25px letter, the border under it twice that.
export const PATCH_TYPED_STROKE = 4 / 100.25;

/**
 * A guide of the given size around the centre of the guide as it was drawn (x, y, width, height),
 * marked data-patch so names on it are fitted in the patch's own frame (utils/autoFitText.js).
 */
export const patchGuide = (x, y, width, height, size) => ({
  x: x + (width - size) / 2,
  y: y + (height - size) / 2,
  width: size,
  height: size,
  'data-patch': 'true',
});

// Patches moved from where the drawing puts them, per jacket (product id), as [dx, dy] in the drawing:
// dx < 0 = left, dx > 0 = right, dy < 0 = up, dy > 0 = down. A place not listed stays where it is.
// Patch 1 = Sleeve, 2 = Mid Sleeve Upper, 3 = Mid Sleeve Lower, 4 = Sleeve End (top to bottom).
// The placement settled on the cropped varsity. The varsity, bomber and hoodie are drawn with the same
// sleeve (components/Jacket), so they use it too; the coach has its own drawing and is not listed.
const SLEEVE_PLACEMENT = {
  'Left Sleeve': [-1, -10],
  'Left Mid Sleeve Upper': [-2.7, -22.9],
  'Left Mid Sleeve Lower': [4.25, -18.84],
  'Left Sleeve End': [5.45, -7.1],
  'Right Sleeve': [-0.2, -10],
  'Right Mid Sleeve Upper': [-1.44, -21.5],
  'Right Mid Sleeve Lower': [7, -21],
  'Right Sleeve End': [6, -8.69],
};

const PATCH_MOVES = {
  4893: SLEEVE_PLACEMENT, // cropped varsity
  5893: SLEEVE_PLACEMENT, // varsity
  5944: SLEEVE_PLACEMENT, // bomber
  5995: SLEEVE_PLACEMENT, // hoodie
  // coach: its own drawing, all four patches a bit higher on both sleeves
  6046: {
    'Left Sleeve': [0, -10],
    'Left Mid Sleeve Upper': [-2, -10],
    'Left Mid Sleeve Lower': [3, -10],
    'Left Sleeve End': [3, -10],
    'Right Sleeve': [0, -10],
    'Right Mid Sleeve Upper': [2, -10],
    'Right Mid Sleeve Lower': [3, -10],
    'Right Sleeve End': [4, -10],
  },
};

/** The move for a place on a jacket, or null where the patch stays where the drawing puts it. */
export const patchMove = (productId, place) => PATCH_MOVES[String(productId).trim()]?.[place] || null;

/** The guide's transform for a move (none when there is no move). */
export const moveTransform = (move) => (move ? `translate(${move[0]} ${move[1]})` : undefined);

/**
 * Scales the artwork drawn for the old guide (width x height) so it fills the resized one, around the
 * guide's centre (cx, cy in the drawing), then applies the place's move. Nothing when neither applies.
 */
export const patchArt = (cx, cy, width, height, size, move = null) => {
  const k = size / Math.max(width, height);
  const parts = [];
  if (move) parts.push(moveTransform(move));
  if (Math.abs(k - 1) >= 0.001) parts.push(`translate(${cx} ${cy}) scale(${+k.toFixed(4)}) translate(${-cx} ${-cy})`);
  return parts.length ? parts.join(' ') : undefined;
};
