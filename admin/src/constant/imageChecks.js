// Shared by Content -> Site Images and Content -> How to Design Page: what a chosen photo will look like in
// its spot (shape, size, scaling on save), before it is uploaded.

export const MAX_EDGE = 1600; // uploads are scaled down to this on their longest side (backend/helpers/fileUpload.js)
export const MAX_UPLOAD_MB = 25; // the admin's upload limit (backend/helpers/uploadLimits.js)
export const ACCEPT = 'image/jpeg,image/png,image/webp';

export const px = ([w, h]) => `${w} × ${h} px`;
export const shapeName = ([w, h]) => {
    if (w === h) return 'square (1:1)';
    return `${w > h ? 'landscape' : 'portrait'} (${w}:${h})`;
};

/** Pixel size of an image address or a chosen file's object URL (null when it cannot be read). */
export const readSize = (src) => new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
});

/** A chosen file's problems before upload: wrong type or too big (a message), else null. */
export const fileProblem = (file) => {
    if (!ACCEPT.split(',').includes(file.type)) return 'Please choose a JPG, PNG or WebP photo.';
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB; the most is ${MAX_UPLOAD_MB} MB.`;
    return null;
};

/** Notes on a photo of `size` for a spot { ratio, minimum, fit }: [{ level, text }]. */
export const checkPhoto = (size, spec) => {
    const notes = [];
    const [rw, rh] = spec.ratio;
    const target = rw / rh;
    const ratio = size.w / size.h;
    if (Math.abs(ratio - target) / target > 0.03) {
        if (spec.fit === 'cover') {
            notes.push({ level: 'warning', text: ratio > target
                ? `Wider than ${rw}:${rh}: the left and right edges will be cut off on the site.`
                : `Taller than ${rw}:${rh}: the top and bottom will be cut off on the site.` });
        } else {
            notes.push({ level: 'info', text: `A different shape from the frame (${rw}:${rh}): it is shown whole, with empty space ${ratio > target ? 'above and below' : 'at the sides'}.` });
        }
    }
    if (size.w < spec.minimum[0] || size.h < spec.minimum[1]) {
        notes.push({ level: 'warning', text: `Smaller than ${px(spec.minimum)}: it may look soft on large screens.` });
    }
    if (Math.max(size.w, size.h) > MAX_EDGE) {
        const k = MAX_EDGE / Math.max(size.w, size.h);
        notes.push({ level: 'info', text: `Will be saved at ${Math.round(size.w * k)} × ${Math.round(size.h * k)} px (photos are stored at most ${MAX_EDGE} px on the longest side).` });
    }
    if (!notes.some((n) => n.level === 'warning')) notes.unshift({ level: 'success', text: 'Good size and shape for this spot.' });
    return notes;
};
