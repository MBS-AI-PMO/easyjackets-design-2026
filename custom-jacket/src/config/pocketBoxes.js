// The Right / Left Pocket design boxes on the front of the 4 jackets (components/Jacket/index.js: 68 x 68
// at x 161.13 and 285.13, y 353.23). The Welt, Flap, Snap and Zipper pockets are drawn wider than the
// slash pocket and ran into them, so with those styles each box, and everything drawn in it, is made
// `size` square and centred `offset` units either side of the front opening (x 257.13), at `centerY`.
// Jacket units: a larger offset moves both boxes outward (towards the pockets), a larger centerY moves
// them down. The front buttons sit at x 250.5 - 263.8, so offset - size / 2 must stay above 6.7.
// Styles not listed (Slash, Straight) keep the boxes where they are.
export const POCKET_BOX_MOVES = {
  'Welt Pocket': { size: 60, offset: 47.5, centerY: 387.5 },
  'Flap Pocket': { size: 60, offset: 47.5, centerY: 387.5 },
  'Snap Pocket': { size: 60, offset: 47.5, centerY: 387.5 },
  'Zipper Pocket': { size: 60, offset: 47.5, centerY: 387.5 },
};

const BOX = { size: 68, right: 161.13, left: 285.13, y: 353.23 };

/** The transform for a pocket box's group (the guide and its designs) with this pocket style. */
export const pocketBoxTransform = (pocketStyle, side) => {
  const move = POCKET_BOX_MOVES[pocketStyle];
  if (!move) return undefined;
  const x = side === 'right' ? 257.13 - move.offset - move.size / 2 : 257.13 + move.offset - move.size / 2;
  const y = move.centerY - move.size / 2;
  return `translate(${x} ${y}) scale(${move.size / BOX.size}) translate(${-BOX[side]} ${-BOX.y})`;
};
