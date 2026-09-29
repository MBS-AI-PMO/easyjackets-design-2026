import WebFont from 'webfontloader';
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
  link.href = font.googleUrl;
  document.head.appendChild(link);
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
    WebFont.load({
      google: {
        families: [...new Set(googleFamilies)],
      },
      active: autoFitCustomizerText,
      inactive: autoFitCustomizerText,
    });
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
