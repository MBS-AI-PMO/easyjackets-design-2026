import { uploadUrl } from '../constant/url';

const DEFAULT_BLOG_IMAGE = '/assets/images/Site-Logo.webp';
const LEGACY_IMAGE_RE = /\.(png|jpe?g)(?=([?#]|$))/i;

const toWebpVariant = (url) => url.replace(LEGACY_IMAGE_RE, '.webp');

export const getBlogImageCandidates = (image, fallback = DEFAULT_BLOG_IMAGE) => {
  const source = typeof image === 'string' ? uploadUrl(image.trim()) : '';
  const candidates = [];

  if (source) {
    if (LEGACY_IMAGE_RE.test(source)) {
      candidates.push(toWebpVariant(source));
    }
    candidates.push(source);
  }

  if (fallback) candidates.push(fallback);

  return [...new Set(candidates.filter(Boolean))];
};

export const getBlogImageSrc = (image, fallback = DEFAULT_BLOG_IMAGE) => (
  getBlogImageCandidates(image, fallback)[0] || fallback
);

export const handleBlogImageError = (event, image, fallback = DEFAULT_BLOG_IMAGE) => {
  const img = event.currentTarget;
  const candidates = getBlogImageCandidates(image, fallback);
  const currentIndex = Number(img.dataset.blogImageIndex || 0);
  const nextIndex = currentIndex + 1;

  if (nextIndex < candidates.length) {
    img.dataset.blogImageIndex = String(nextIndex);
    img.src = candidates[nextIndex];
    return;
  }

  img.onerror = null;
};
