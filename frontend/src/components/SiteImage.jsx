// A photo the admin can replace (Content -> Site Images): the admin's upload for this slot when there is one,
// else the bundled photo (lib/siteImages.js). The admin's description, when set, replaces the page's own.
// Until the site settings have been read once (a first visit, a moment) the box stays empty, so the bundled
// photo never flashes before the admin's. Uploads come from the API's resizer at the width asked for.
import ImageSlot from './ImageSlot';
import { useSiteIdentity } from '../lib/siteIdentity';
import { SITE_IMAGES } from '../lib/siteImages';

export default function SiteImage({ which, placeholder = '', 'aria-label': label, width = 960, sizes, ...rest }) {
  const { siteImages, siteImagesKnown } = useSiteIdentity();
  const fallback = SITE_IMAGES[which] || {};
  const own = siteImages?.[which] || {};
  const src = siteImagesKnown ? own.src || fallback.src : '';
  const alt = own.alt || label || fallback.alt || placeholder;
  return (
    <ImageSlot
      {...rest}
      src={src}
      width={own.src ? width : undefined}
      sizes={own.src ? sizes : undefined}
      placeholder={siteImagesKnown ? placeholder : ''}
      aria-label={alt}
    />
  );
}
