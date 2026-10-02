// Keeps something that slides open in view (a dropdown list, an accordion section). While it
// grows, the nearest scroll area (and then the page) follows its bottom edge frame by frame, so
// what opens near the bottom of the panel is seen whole without scrolling by hand, and the view
// moves together with the opening. It never scrolls the field or heading it hangs from out of
// view at the top: a section taller than the view stops with its heading at the top.

const GAP = 12; // room left under the list, and above the field

const scrollParent = (element) => {
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    if (/(auto|scroll|overlay)/.test(window.getComputedStyle(node).overflowY)) return node;
  }
  return null;
};

// the bottom of what the window shows: a bar fixed to the bottom of the screen (Add to cart on
// phones) hides what is under it
const windowBottom = () => {
  let node = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 2);
  for (; node && node !== document.body; node = node.parentElement) {
    if (window.getComputedStyle(node).position === 'fixed') {
      const top = node.getBoundingClientRect().top;
      return top > window.innerHeight / 2 ? top : window.innerHeight;
    }
  }
  return window.innerHeight;
};

// how far to scroll so the list's bottom (as far as it shows) is in view, without pushing the
// field above the top
const needed = (field, listBottom, view) => {
  const below = listBottom + GAP - view.bottom;
  const room = field.getBoundingClientRect().top - GAP - view.top;
  return Math.min(below, room);
};

export const followWhileOpening = (field, list, duration = 480) => {
  if (!field || !list) return;
  const box = scrollParent(field);
  const bottom = windowBottom();
  const end = performance.now() + duration;

  const step = (now) => {
    let listBottom = list.getBoundingClientRect().bottom;
    if (box) {
      const area = box.getBoundingClientRect();
      const dy = needed(field, listBottom, area);
      if (dy > 0.5) box.scrollTop += dy;
      // past the scroll area's edge nothing shows, so the page need not move for it
      listBottom = Math.min(list.getBoundingClientRect().bottom, area.bottom);
    }
    // the scroll area itself can reach below the window (a short panel growing with the list)
    const dy = needed(field, listBottom, { top: 0, bottom });
    if (dy > 0.5) window.scrollBy(0, dy);
    if (now < end) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};
