import axiosInstance from './axiosConfig';
import { autoFitCustomizerText } from './autoFitText';

export const fallbackTypeFonts = [
  { name: 'Rookie', family: 'Rookie', sourceType: 'system', isActive: true },
  { name: 'Baseball', family: 'Baseball', sourceType: 'system', isActive: true },
  { name: 'Ballpark', family: 'Ballpark', sourceType: 'system', isActive: true },
  { name: 'Source Sans Pro', family: 'Source Sans Pro', sourceType: 'google', googleFamily: 'Source Sans Pro', isActive: true },
  { name: 'Courgette', family: 'Courgette', sourceType: 'google', googleFamily: 'Courgette', isActive: true },
  { name: 'Cutive', family: 'Cutive', sourceType: 'google', googleFamily: 'Cutive', isActive: true },
  { name: 'Graduate', family: 'Graduate', sourceType: 'google', googleFamily: 'Graduate', isActive: true },
  { name: 'Lobster Two', family: 'Lobster Two', sourceType: 'google', googleFamily: 'Lobster Two', isActive: true },
  { name: 'Merienda One', family: 'Merienda One', sourceType: 'google', googleFamily: 'Merienda One', isActive: true },
  { name: 'Montserrat', family: 'Montserrat', sourceType: 'google', googleFamily: 'Montserrat', isActive: true },
  { name: 'Open Sans', family: 'Open Sans', sourceType: 'google', googleFamily: 'Open Sans', isActive: true },
  { name: 'Oswald', family: 'Oswald', sourceType: 'google', googleFamily: 'Oswald', isActive: true },
  { name: 'Pinyon Script', family: 'Pinyon Script', sourceType: 'google', googleFamily: 'Pinyon Script', isActive: true },
  { name: 'Satisfy', family: 'Satisfy', sourceType: 'google', googleFamily: 'Satisfy', isActive: true },
];

let cachedFontsPromise = null;

const appendGoogleLink = (font) => {
  if (!font.googleUrl) return;
  const id = `cjd-google-font-${font._id || font.family}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = withSwap(font.googleUrl);
  document.head.appendChild(link);
};

// text shows at once in a stand-in font and switches when the font arrives (without it Chrome steps
// in on slow connections and warns about every font)
const withSwap = (url) => (/[?&]display=/.test(url) ? url : `${url}${url.includes('?') ? '&' : '?'}display=swap`);

// all the Google families in one stylesheet; the jacket's text is refitted once they have loaded
const appendGoogleFamilies = (families) => {
  const id = 'cjd-google-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css?family=${families.map((f) => encodeURIComponent(f).replace(/%20/g, '+')).join('|')}&display=swap`;
  // A font downloads only once something uses it, but names are sized to their place from the real
  // letters: fetch them all in the background (as webfontloader did), and refit the jacket's text
  // whenever one finishes.
  const preload = () => {
    if (!document.fonts?.load) return autoFitCustomizerText();
    Promise.allSettled(families.map((family) => document.fonts.load(`16px "${family}"`))).then(autoFitCustomizerText);
  };
  link.onload = preload;
  link.onerror = autoFitCustomizerText;
  document.head.appendChild(link);
  if (document.fonts?.addEventListener) document.fonts.addEventListener('loadingdone', autoFitCustomizerText);
};

const appendFileFace = (font) => {
  if (!font.fileUrl || !font.family) return;
  const id = `cjd-file-font-${font._id || font.family}`;
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @font-face {
      font-family: "${font.family}";
      src: url("${font.fileUrl}");
      font-weight: ${font.weight || '400'};
      font-style: ${font.style || 'normal'};
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

export const injectCustomizerFonts = (fonts = []) => {
  const googleFamilies = [];

  fonts.forEach((font) => {
    if (!font?.isActive) return;

    if (font.sourceType === 'file') {
      appendFileFace(font);
      return;
    }

    if (font.sourceType === 'google') {
      appendGoogleLink(font);
      googleFamilies.push(font.googleFamily || font.family);
    }
  });

  if (googleFamilies.length) {
    appendGoogleFamilies([...new Set(googleFamilies)]);
  }
};

export const loadCustomizerFonts = async () => {
  if (!cachedFontsPromise) {
    cachedFontsPromise = axiosInstance
      .get('/fonts')
      .then(({ data }) => data?.fonts || fallbackTypeFonts)
      .catch(() => fallbackTypeFonts)
      .then((fonts) => {
        const activeFonts = fonts.filter((font) => font.isActive !== false);
        injectCustomizerFonts(activeFonts);
        autoFitCustomizerText();
        return activeFonts;
      });
  }

  return cachedFontsPromise;
};
