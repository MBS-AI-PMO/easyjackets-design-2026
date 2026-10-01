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

const fitTarget = (target) => {
  if (target.dataset.cjdAutoFitDone === 'true') return;

  const representativeText = getRepresentativeText(target);
  if (!representativeText?.textContent?.trim() || representativeText.querySelector('textPath')) return;

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
  // Keep what shows inside the guide: the ink (plus its outline) when it could be measured, else the
  // layout box. The trim scales around the ink's centre, so the name stays centred.
  const fittedBox = getScreenBox(target, svg);
  const unitsToScreen = screenPerUnit * fitScale;
  const visibleWidth = inkOffset.inkWidth ? (inkOffset.inkWidth * unitsToScreen) + strokePadding : fittedBox?.width;
  const visibleHeight = inkOffset.inkHeight ? (inkOffset.inkHeight * unitsToScreen) + strokePadding : fittedBox?.height;
  if (visibleWidth && visibleHeight && (visibleWidth > guideBox.width * 0.98 || visibleHeight > guideBox.height * 0.98)) {
    const trimScale = Math.min(
      (guideBox.width * 0.98) / visibleWidth,
      (guideBox.height * 0.98) / visibleHeight
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
