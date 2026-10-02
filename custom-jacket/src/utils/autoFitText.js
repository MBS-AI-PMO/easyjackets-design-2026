import { PATCH_NAME_FILL, PATCH_NAME_OUTLINE, PATCH_TYPED_STROKE } from '../config/sleevePatches';

const fittedTextSelector = [
  '#jacketFront text[font-family]',
  '#jacketBack text[font-family]',
  '#jacketRight text[font-family]',
  '#jacketLeft text[font-family]',
  '.cjd-name-area text',
].join(',');

const getSvgPoint = (svg, x, y, matrix) => {
  const point = svg.createSVGPoint();
  point.x = x;
  point.y = y;
  return point.matrixTransform(matrix);
};

const getScreenBox = (element, svg, box = element.getBBox()) => {
  const matrix = element.getScreenCTM();
  if (!matrix) return null;

  const points = [
    getSvgPoint(svg, box.x, box.y, matrix),
    getSvgPoint(svg, box.x + box.width, box.y, matrix),
    getSvgPoint(svg, box.x, box.y + box.height, matrix),
    getSvgPoint(svg, box.x + box.width, box.y + box.height, matrix),
  ];

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: minX + (maxX - minX) / 2,
    centerY: minY + (maxY - minY) / 2,
  };
};

const getAnchorScreenPoint = (text, svg) => {
  const matrix = text.getScreenCTM();
  if (!matrix) return null;

  const x = text.x?.baseVal?.[0]?.value || 0;
  const y = text.y?.baseVal?.[0]?.value || 0;
  return getSvgPoint(svg, x, y, matrix);
};

const getViewBoxGuide = (svg) => {
  const viewBox = svg.viewBox?.baseVal;
  if (!viewBox || !viewBox.width || !viewBox.height) return null;

  const matrix = svg.getScreenCTM();
  if (!matrix) return null;

  return getScreenBox(svg, svg, {
    x: viewBox.x,
    y: viewBox.y,
    width: viewBox.width,
    height: viewBox.height,
  });
};

const findNearestGuide = (svg, anchorScreenPoint) => {
  const guides = Array.from(svg.querySelectorAll('rect.cjd-guides'));
  if (!guides.length) return getViewBoxGuide(svg);

  let nearestGuide = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  guides.forEach((guide) => {
    const guideBox = getScreenBox(guide, svg);
    if (!guideBox || !guideBox.width || !guideBox.height) return;

    const distance = Math.hypot(
      guideBox.centerX - anchorScreenPoint.x,
      guideBox.centerY - anchorScreenPoint.y
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestGuide = guideBox;
    }
  });

  return nearestGuide || getViewBoxGuide(svg);
};

const isNearGuide = (guideBox, point) => {
  const distance = Math.hypot(guideBox.centerX - point.x, guideBox.centerY - point.y);
  const threshold = Math.hypot(guideBox.width, guideBox.height) * 1.15;
  return distance <= threshold;
};

const getLocalDelta = (matrix, screenDx, screenDy) => {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (!determinant) return { x: 0, y: 0 };

  return {
    x: (matrix.d * screenDx - matrix.c * screenDy) / determinant,
    y: (-matrix.b * screenDx + matrix.a * screenDy) / determinant,
  };
};

const getTextStrokePadding = (target) => {
  const text = getRepresentativeText(target);
  const strokeWidth = Number(text?.getAttribute('stroke-width') || 0);
  return Math.min(Math.max(strokeWidth * 1.25, 2), 10);
};

// The most of a guide a name's letters (with their outline) may cover, so a margin shows all round.
const INK_FILL = 0.9;

// The thickest outline among the name's layers (the outline layer is drawn with a wider stroke).
const getTargetStrokeWidth = (target) => {
  const texts = target.tagName.toLowerCase() === 'text' ? [target] : Array.from(target.querySelectorAll('text'));
  return Math.max(0, ...texts.map((text) => Number(text.getAttribute('stroke-width')) || 0));
};

const getTargetFillRatio = (target, guideBox, textScreenBox) => {
  const isSquare = Math.abs(guideBox.width - guideBox.height) <= Math.max(guideBox.width, guideBox.height) * 0.12;
  const isSingleLetter = (getRepresentativeText(target)?.textContent || '').trim().length === 1;
  const textRatio = textScreenBox.width / textScreenBox.height;

  if (isSquare && isSingleLetter && textRatio < 0.72) return 0.96;
  return 0.92;
};

const getFontFamily = (text) => (
  text.getAttribute('font-family') ||
  window.getComputedStyle(text).fontFamily ||
  'serif'
).replace(/^["']|["']$/g, '');

const getInkMetrics = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  return (text) => {
    if (!context) return null;

    const content = (text.textContent || '').trim();
    if (!content) return null;

    const fontFamily = getFontFamily(text);
    const sampleSize = 180;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `${sampleSize}px "${fontFamily}"`;
    context.fillText(content, canvas.width / 2, canvas.height / 2);

    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width;
    let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = image.data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 10) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX <= minX || maxY <= minY) return null;

    // Where the ink sits inside the box the browser lays the text out in (getBBox: the font's ascent
    // to descent, the advance width centred on the anchor), as a share of the font size. Capitals
    // fill only the upper part of that box, so centring the box set names high in their guide, with
    // the top of the letters against the edge and a gap below.
    context.textBaseline = 'alphabetic';
    const m = context.measureText(content);
    const hasMetrics = Number.isFinite(m.actualBoundingBoxAscent) && Number.isFinite(m.fontBoundingBoxAscent);
    const offsetX = hasMetrics ? (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 / sampleSize : 0;
    const offsetY = hasMetrics
      ? ((m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) - (m.fontBoundingBoxDescent - m.fontBoundingBoxAscent)) / 2 / sampleSize
      : 0;

    return {
      widthRatio: (maxX - minX + 1) / sampleSize,
      heightRatio: (maxY - minY + 1) / sampleSize,
      offsetX,
      offsetY,
    };
  };
})();

// The ink's centre relative to the centre of the text's layout box, in the text's own units. Zero for
// text laid out in several lines or with moved letters (tspans), which the measurement cannot follow.
const getInkCenterOffset = (text) => {
  if (!text || text.querySelector('tspan[x], tspan[y], tspan[dx], tspan[dy]')) return { x: 0, y: 0 };
  const ink = getInkMetrics(text);
  const fontSize = Number(text.getAttribute('font-size') || window.getComputedStyle(text).fontSize.replace('px', ''));
  if (!ink || !fontSize) return { x: 0, y: 0 };
  return { x: ink.offsetX * fontSize, y: ink.offsetY * fontSize, inkWidth: ink.widthRatio * fontSize, inkHeight: ink.heightRatio * fontSize };
};

const getVisualScaleBoost = (target, textBox) => {
  const text = getRepresentativeText(target);
  const ink = getInkMetrics(text);
  const fontSize = Number(text?.getAttribute('font-size') || window.getComputedStyle(text).fontSize.replace('px', ''));

  if (!ink || !fontSize || !textBox.width || !textBox.height) return 1;

  const visualWidth = ink.widthRatio * fontSize;
  const visualHeight = ink.heightRatio * fontSize;
  const widthBoost = textBox.width / Math.max(visualWidth, 1);
  const heightBoost = textBox.height / Math.max(visualHeight, 1);
  const boost = Math.min(widthBoost, heightBoost);

  return Math.max(1, Math.min(boost, 2.1));
};

const hasOnlyTextChildren = (element) => {
  const elementChildren = Array.from(element.children);
  return elementChildren.length > 0 && elementChildren.every((child) => child.tagName.toLowerCase() === 'text');
};

const getFitTarget = (text) => {
  const parent = text.parentElement;
  if (
    parent &&
    parent.tagName.toLowerCase() === 'g' &&
    hasOnlyTextChildren(parent) &&
    parent.querySelectorAll('text').length <= 2
  ) {
    return parent;
  }

  return text;
};

const getRepresentativeText = (target) => {
  if (target.tagName.toLowerCase() === 'text') return target;
  return target.querySelector('text');
};

// The guide element nearest a point on screen, with its screen box.
const findNearestGuideElement = (svg, point) => {
  let nearest = null;
  svg.querySelectorAll('rect.cjd-guides').forEach((guide) => {
    const box = getScreenBox(guide, svg);
    if (!box || !box.width || !box.height) return;
    const distance = Math.hypot(box.centerX - point.x, box.centerY - point.y);
    if (!nearest || distance < nearest.distance) nearest = { guide, box, distance };
  });
  return nearest;
};

// Sets a name's outline to `width` (in its own units). A name drawn in two layers keeps the layers'
// proportion; the widths the drawing gave them are kept aside, so fitting again starts from them.
// The outline layers of a name or typed letters, with the widths the drawing gave them (kept aside, so
// fitting again starts from them). Typed letters have two: a wide border under the letter's own stroke.
const getOutlineLayers = (target) => {
  const texts = target.tagName.toLowerCase() === 'text' ? [target] : Array.from(target.querySelectorAll('text'));
  texts.forEach((text) => {
    if (text.dataset.cjdBaseStroke === undefined) text.dataset.cjdBaseStroke = text.getAttribute('stroke-width') || '';
  });
  const widths = texts.map((text) => Number(text.dataset.cjdBaseStroke) || 0).filter((width) => width > 0);
  const thinnest = widths.length ? Math.min(...widths) : 1;
  const widest = widths.length ? Math.max(...widths) : 1;
  return { texts, thinnest, widest };
};

// Sets the thinnest layer (the letters' own stroke) to `width`, in the text's own units; a wider layer
// (the border of typed letters) keeps its proportion to it, so the border still shows around the stroke.
const setPatchOutline = ({ texts, thinnest }, width) => {
  texts.forEach((text) => {
    const base = Number(text.dataset.cjdBaseStroke) || thinnest;
    text.setAttribute('stroke-width', (width * (base / thinnest)).toFixed(4));
  });
};

// Sleeve patches (data-patch, config/sleevePatches.js) are fitted in the patch's own frame: two of them
// are angled, and a fit on the screen boxes around them left their names small and off-centre. The
// name's ink and outline fill PATCH_NAME_FILL of the patch, centred, at any angle.
const fitInPatch = (target, guide, representativeText, textBox, baseTransform) => {
  const svg = guide.ownerSVGElement;
  const toTarget = target.getScreenCTM()?.inverse();
  const guideToScreen = guide.getScreenCTM();
  if (!svg || !toTarget || !guideToScreen) return false;

  // the patch's corners in the name's own units (the angles line up, so this box is the patch)
  const x = guide.x.baseVal.value;
  const y = guide.y.baseVal.value;
  const w = guide.width.baseVal.value;
  const h = guide.height.baseVal.value;
  const corners = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([px, py]) => getSvgPoint(svg, px, py, guideToScreen).matrixTransform(toTarget));
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const patch = {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    centerX: (Math.max(...xs) + Math.min(...xs)) / 2,
    centerY: (Math.max(...ys) + Math.min(...ys)) / 2,
  };

  const ink = getInkCenterOffset(representativeText);
  const measured = Boolean(ink.inkWidth && ink.inkHeight);
  const inkWidth = measured ? ink.inkWidth : textBox.width;
  const inkHeight = measured ? ink.inkHeight : textBox.height;
  const inkX = textBox.x + textBox.width / 2 + (measured ? ink.x : 0);
  const inkY = textBox.y + textBox.height / 2 + (measured ? ink.y : 0);
  // The outline. Names: PATCH_NAME_OUTLINE patch units on every patch. Typed letters (a border layer
  // under the letters' stroke): the proportions of their preview, the stroke PATCH_TYPED_STROKE of the
  // letter size and the border keeping its proportion to it. The widest layer adds its full width
  // around the ink, so the fit counts that one.
  const layers = getOutlineLayers(target);
  const typed = layers.widest > layers.thinnest;
  let scale;
  let stroke; // the thinnest layer, in the text's own units
  if (typed) {
    const fontSize = parseFloat(representativeText.getAttribute('font-size')) || parseFloat(window.getComputedStyle(representativeText).fontSize) || 0;
    stroke = PATCH_TYPED_STROKE * fontSize;
    const around = stroke * (layers.widest / layers.thinnest);
    scale = Math.min((patch.width * PATCH_NAME_FILL) / (inkWidth + around), (patch.height * PATCH_NAME_FILL) / (inkHeight + around));
  } else {
    const outline = PATCH_NAME_OUTLINE * (patch.width / w);
    scale = Math.min((patch.width * PATCH_NAME_FILL - outline) / inkWidth, (patch.height * PATCH_NAME_FILL - outline) / inkHeight);
    stroke = outline / scale;
  }
  if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(stroke) || stroke <= 0) return false;
  setPatchOutline(layers, stroke);

  target.setAttribute('transform', [
    baseTransform,
    `translate(${patch.centerX.toFixed(3)} ${patch.centerY.toFixed(3)})`,
    `scale(${scale.toFixed(4)})`,
    `translate(${(-inkX).toFixed(3)} ${(-inkY).toFixed(3)})`,
  ].filter(Boolean).join(' '));
  return true;
};

// An arched name (textPath) on a guide marked data-arc-fit (Back Bottom): its size comes from the dialog,
// which left a long name small and low in the guide and a short one, whose letters are big and curve
// deeply, sticking out above and below. It is scaled to at most ARC_FIT_WIDTH of the guide's width and
// 96% of its height, and centred on it. The box measured is the letters' cells along the curve, a few %
// larger than the letters themselves and centred on them, so a small margin remains.
const ARC_FIT_WIDTH = 0.82;
const ARC_FIT_HEIGHT = 0.96; // the ends of the curve reach the top: a little room keeps them off the guide line
const fitArcInGuide = (target, guide, textBox, baseTransform) => {
  const svg = guide.ownerSVGElement;
  const toTarget = target.getScreenCTM()?.inverse();
  const guideToScreen = guide.getScreenCTM();
  if (!svg || !toTarget || !guideToScreen) return;
  const x = guide.x.baseVal.value;
  const y = guide.y.baseVal.value;
  const w = guide.width.baseVal.value;
  const h = guide.height.baseVal.value;
  const corners = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([px, py]) => getSvgPoint(svg, px, py, guideToScreen).matrixTransform(toTarget));
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const scale = Math.min((width * ARC_FIT_WIDTH) / textBox.width, (height * ARC_FIT_HEIGHT) / textBox.height);
  if (!Number.isFinite(scale) || scale <= 0) return;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  target.setAttribute('transform', [
    baseTransform,
    `translate(${cx.toFixed(3)} ${cy.toFixed(3)})`,
    `scale(${scale.toFixed(4)})`,
    `translate(${(-(textBox.x + textBox.width / 2)).toFixed(3)} ${(-(textBox.y + textBox.height / 2)).toFixed(3)})`,
  ].filter(Boolean).join(' '));
};

const fitTarget = (target) => {
  if (target.dataset.cjdAutoFitDone === 'true') return;

  const representativeText = getRepresentativeText(target);
  if (!representativeText?.textContent?.trim()) return;
  // an arched name is left as drawn, except on a guide marked data-arc-fit (fitArcInGuide, below)
  const arched = Boolean(representativeText.querySelector('textPath'));
  if (arched && !representativeText.ownerSVGElement?.querySelector('rect.cjd-guides[data-arc-fit]')) return;

  const svg = representativeText.ownerSVGElement;
  if (!svg) return;

  const baseTransform = target.dataset.cjdBaseTransform ?? (target.getAttribute('transform') || '');
  target.dataset.cjdBaseTransform = baseTransform;
  target.setAttribute('transform', baseTransform);

  let textBox;
  try {
    textBox = target.getBBox();
  } catch {
    return;
  }

  if (!textBox.width || !textBox.height) return;

  const anchorScreenPoint = getAnchorScreenPoint(representativeText, svg);
  if (!anchorScreenPoint) return;

  const nearest = findNearestGuideElement(svg, anchorScreenPoint);
  if (arched) {
    if (nearest?.guide.hasAttribute('data-arc-fit') && isNearGuide(nearest.box, anchorScreenPoint)) {
      fitArcInGuide(target, nearest.guide, textBox, baseTransform);
    }
    target.dataset.cjdAutoFitDone = 'true';
    return;
  }

  // a sleeve patch: fitted in the patch's own frame (fitInPatch)
  if (
    nearest?.guide.hasAttribute('data-patch') &&
    isNearGuide(nearest.box, anchorScreenPoint) &&
    fitInPatch(target, nearest.guide, representativeText, textBox, baseTransform)
  ) {
    target.dataset.cjdAutoFitDone = 'true';
    return;
  }

  const guideBox = findNearestGuide(svg, anchorScreenPoint);
  if (!guideBox || !isNearGuide(guideBox, anchorScreenPoint)) return;

  const textScreenBox = getScreenBox(target, svg, textBox);
  const matrix = target.getScreenCTM();
  if (!guideBox || !textScreenBox || !matrix) return;

  const strokePadding = getTextStrokePadding(target);
  const fillRatio = getTargetFillRatio(target, guideBox, textScreenBox);
  const maxWidth = Math.max(1, guideBox.width * fillRatio - strokePadding);
  const maxHeight = Math.max(1, guideBox.height * fillRatio - strokePadding);
  const rawScale = Math.min(maxWidth / textScreenBox.width, maxHeight / textScreenBox.height);
  const visualScaleBoost = getVisualScaleBoost(target, textBox);
  const fitScale = Math.max(0.2, Math.min(rawScale * visualScaleBoost, 8));
  // centre the ink, not the layout box (see getInkMetrics)
  const inkOffset = getInkCenterOffset(representativeText);
  const screenPerUnit = textScreenBox.width / textBox.width;
  const inkCenterX = textScreenBox.centerX + inkOffset.x * screenPerUnit;
  const inkCenterY = textScreenBox.centerY + inkOffset.y * screenPerUnit;
  const scaledCenterX = anchorScreenPoint.x + (inkCenterX - anchorScreenPoint.x) * fitScale;
  const scaledCenterY = anchorScreenPoint.y + (inkCenterY - anchorScreenPoint.y) * fitScale;
  const localDelta = getLocalDelta(matrix, guideBox.centerX - scaledCenterX, guideBox.centerY - scaledCenterY);
  const anchorX = representativeText.x?.baseVal?.[0]?.value || 0;
  const anchorY = representativeText.y?.baseVal?.[0]?.value || 0;
  const autoTransform = [
    baseTransform,
    `translate(${localDelta.x.toFixed(3)} ${localDelta.y.toFixed(3)})`,
    `translate(${anchorX} ${anchorY})`,
    `scale(${fitScale.toFixed(4)})`,
    `translate(${-anchorX} ${-anchorY})`,
  ]
    .filter(Boolean)
    .join(' ');

  target.setAttribute('transform', autoTransform);
  // Keep what shows inside the guide: the ink plus its whole outline (at most INK_FILL of the guide, a
  // margin all round) when it could be measured, else the layout box. The trim scales around the ink's
  // centre, so the name stays centred.
  const fittedBox = getScreenBox(target, svg);
  const unitsToScreen = screenPerUnit * fitScale;
  const outline = getTargetStrokeWidth(target) * unitsToScreen;
  const measured = Boolean(inkOffset.inkWidth && inkOffset.inkHeight);
  const visibleWidth = measured ? (inkOffset.inkWidth * unitsToScreen) + outline : fittedBox?.width;
  const visibleHeight = measured ? (inkOffset.inkHeight * unitsToScreen) + outline : fittedBox?.height;
  const limit = measured ? INK_FILL : 0.98;
  if (visibleWidth && visibleHeight && (visibleWidth > guideBox.width * limit || visibleHeight > guideBox.height * limit)) {
    const trimScale = Math.min(
      (guideBox.width * limit) / visibleWidth,
      (guideBox.height * limit) / visibleHeight
    );
    const inkX = textBox.x + textBox.width / 2 + inkOffset.x;
    const inkY = textBox.y + textBox.height / 2 + inkOffset.y;
    const trimmedTransform = [
      autoTransform,
      `translate(${inkX.toFixed(3)} ${inkY.toFixed(3)})`,
      `scale(${trimScale.toFixed(4)})`,
      `translate(${(-inkX).toFixed(3)} ${(-inkY).toFixed(3)})`,
    ].join(' ');
    target.setAttribute('transform', trimmedTransform);
  }

  target.dataset.cjdAutoFitDone = 'true';
};

export const autoFitCustomizerText = () => {
  window.requestAnimationFrame(() => {
    const targets = new Set();
    document.querySelectorAll(fittedTextSelector).forEach((text) => targets.add(getFitTarget(text)));
    targets.forEach((target) => {
      target.dataset.cjdAutoFitDone = 'false';
      fitTarget(target);
    });
  });
};
