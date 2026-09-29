const COLLARS_WITH_INSIDE_OUTSIDE_COLORS = new Set(['Roll Up', 'Hood', 'Zipper Hood']);
const KNITS_WITH_LINE_COLORS = new Set([
  'Single Line',
  'Double Line',
  'Single Line Border',
  'Double Line Border',
]);
const KNITS_WITH_BORDER_COLORS = new Set(['Single Line Border', 'Double Line Border']);

export const getRequiredColorKeys = ({ styles = {}, advance = {}, jacket = '' } = {}) => {
  const requiredColors = ['body', 'sleeves', 'pockets'];
  const isCoachJacket = jacket === 'Coach Jackets';
  const isHoodie = jacket === 'Hoodies';

  if (styles.closure === 'Buttons' && !isHoodie) {
    requiredColors.push('buttons');
  }
  if (styles.closure === 'Zipper') {
    requiredColors.push('zip');
  }
  if (COLLARS_WITH_INSIDE_OUTSIDE_COLORS.has(styles.collar)) {
    requiredColors.push('inside');
    requiredColors.push('outside');
  }
  if (!isCoachJacket) {
    requiredColors.push('base');
  }
  if (KNITS_WITH_LINE_COLORS.has(styles.knit) && !isCoachJacket) {
    requiredColors.push('lines');
  }
  if (KNITS_WITH_BORDER_COLORS.has(styles.knit)) {
    requiredColors.push('border');
  }
  if (advance.inserts) {
    requiredColors.push('inserts');
  }
  if (advance.piping || advance.sleevesPiping) {
    requiredColors.push('piping');
  }

  return requiredColors;
};
