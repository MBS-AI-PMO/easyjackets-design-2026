import React from "react";
import QS from "qs";
import axios from "axios";
import { svgAsPngUri } from "save-svg-as-png";

export const lcase = (str) => str.toLocaleLowerCase();
export const uCase = (str) => str.toLocaleUpperCase();
export const rspace = (str) => lcase(str.replace(/\s+/g, "-"));

export const MATERIALS = {
  "Melton Wool": [
    "Melton Wool",
    "Sheep Leather",
    "Synthatic Leather",
    "Cowhide Leather",
  ],
  "Cowhide Leather": ["Cowhide Leather"],
  "Cotton Twill": ["Cotton Twill"],
  "Sheep Leather": ["Sheep Leather"],
  "Nylon Memory": ["Nylon Memory"],
  "Cotton Fleece": ["Cotton Fleece"],
  "Soft Shell": ["Soft Shell"],
  Satin: ["Satin"],
};

// Colors
const commonColors = [
  "#fff",
  "#fffed0",
  "#d1c4a4",
  "#000",
  "#565656",
  "#99999a",
  "#174633",
  "#44883e",
  "#152347",
  "#1a4096",
  "#83c2e7",
  "#3aa9b2",
  "#3b275b",
  "#dd1d58",
  "#fed0e4",
  "#601f2a",
  "#e00000",
  "#e95926",
  "#ffb81c",
  "#b7923e",
  "#eadc32",
  "#81533f",
];

const removeSpace = (str) =>
  str.replace(/\s/g, "").replace(/-/g, "").replace(/\//g, "").toLowerCase();

export const BODY_COLORS = [...commonColors];
export const SLEEVES_COLORS = [...commonColors];
export const ZIP_COLORS = ["#000", "#c4c6c6", "#b7923e"];

export const COLOR_MAP = {
  "#fff": "White",
  "#fffed0": "Cream",
  "#d1c4a4": "Khaki",
  "#000": "Black",
  "#565656": "Charcoal",
  "#99999a": "Silver",
  "#174633": "Dark Green",
  "#44883e": "Kelly Green",
  "#152347": "Navy Blue",
  "#1a4096": "Royal Blue",
  "#83c2e7": "Light Blue",
  "#3aa9b2": "Teal",
  "#3b275b": "Purple",
  "#dd1d58": "Pink",
  "#fed0e4": "Light Pink",
  "#601f2a": "Maroon",
  "#e00000": "Red",
  "#e95926": "Orange",
  "#ffb81c": "Gold",
  "#b7923e": "Old Gold",
  "#eadc32": "Yellow",
  "#81533f": "Brown",
};

export const normalizeHex = (hex) => {
  if (!hex) return "";
  let h = hex.trim().replace("#", "").toLowerCase();
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  return h;
};

export const getColorName = (hex, defaultsColors = []) => {
  const norm = normalizeHex(hex);

  // 1. Try defaults
  const fromDefaults = defaultsColors.find(c => normalizeHex(c.code) === norm);
  if (fromDefaults) return fromDefaults.name;

  // 2. Try COLOR_MAP
  const fromMapKey = Object.keys(COLOR_MAP).find(k => normalizeHex(k) === norm);
  if (fromMapKey) return COLOR_MAP[fromMapKey];

  return hex; // Fallback to hex
};

export const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === "[::1]" ||
  // ej.test is the local domain
  window.location.hostname === "ej.test" ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export const fixTextSize = (
  obj,
  obj2 = null,
  type = "name",
  viewBox = "0 0 73 82",
  arc = false,
  name = ""
) => {
  // t = 'frontCenter-name'
  // a = ['frontCenter', 'name']
  // o = fName
  // s = <text> element
  // r = input text
  // l = length of input text
  // let a = ['frontCenter', 'name']

  // Below This Line
  let txtElm = obj.current;
  let txtElm1 = obj2?.current || null;

  var promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      var svgWidth = viewBox.split(" ")[2],
        svgHeight = viewBox.split(" ")[3];

      let textBox = txtElm.getBBox();

      if (0 !== textBox.width && 0 !== textBox.height) {
        let fontSize = 1;
        for (let index = 0; index < 1000; index++) {
          txtElm.setAttribute("font-size", fontSize + "px");
          textBox = txtElm.getBBox();

          if (txtElm1 !== null)
            txtElm1.setAttribute("font-size", fontSize + "px");

          if (arc) {
            if (name.length >= 8) var n = textBox.height - 30;
            else if (name.length >= 4) n = textBox.height - 15;
            else if (name.length >= 2) n = textBox.height - 10;
            else n = textBox.height;

            if (textBox.width >= svgWidth * 0.85 || n >= svgHeight * 0.85) {
              resolve(fontSize);
              return !0;
            }
          } else {
            if (textBox.width >= svgWidth * 0.85 || textBox.height >= svgHeight * 0.85) {
              resolve(fontSize);
              return !0;
            }
          }

          fontSize += 0.25;
        }
      }
    }, 0);
  });

  return promise;
};

export const getUpnDown = (name) => {
  let content = [];

  for (let i = 0; i < name.length; i++) {
    const item = name[i];
    let dx = "0";
    let dy = "0";

    if (i === 1) {
      dx = "0";
      dy = "40";
    }

    if (i === 2) {
      dx = "0";
      dy = "80";
    }

    content.push(
      <tspan key={i} alignmentBaseline="middle" x={dx} y={dy}>
        {item}
      </tspan>
    );
  }

  return content;
};

export const getStaggeredElm = (name) => {
  let content = [];

  for (let i = 0; i < name.length; i++) {
    const item = name[i];
    let dx = "-0";
    let dy = "12";

    if (i === 0) {
      dx = "0";
      dy = "-12";
    }

    content.push(
      <tspan key={i} alignmentBaseline="middle" dx={dx} dy={dy}>
        {item}
      </tspan>
    );
  }

  return content;
};

export const alphabets = (type) => {
  let alphabets = [];

  for (let i = 0; i < 26; i++) {
    let letter = (i + 10).toString(36);
    alphabets.push(
      <span className="cjd-letter-wrapper" key={i}>
        <img
          src={require(`../assets/images/alphabets/${type}/${letter}.svg`)}
          alt={i}
        />
      </span>
    );
  }

  return alphabets;
};

export const cmToInc = (num) => {
  return (num / 2.54).toFixed(2);
};

export const incToCm = (num) => {
  return (num * 2.54).toFixed(2);
};

export const postData = async (url = "", data = {}) => {
  var bodyData = "";
  for (var key in data) {
    if (bodyData !== "") {
      bodyData += "&";
    }
    bodyData += key + "=" + encodeURIComponent(data[key]);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: bodyData,
    credentials: "same-origin",
  });

  return response.json();
};

// The old WordPress endpoint (admin-ajax.php) is gone: every call now goes to the new backend
// through utils/axiosConfig (config/url.js). apiCall is kept only for the commented-out callers.
export const API = null;

export const apiCall = async (data) => {
  if (!API) throw new Error('apiCall: the WordPress endpoint is retired; use the backend API');
  const res = await axios.post(API, QS.stringify(data));
  if (res.data.id === 4893) {
    res.data = {
      id: 4893,
      cat_id: 29,
      cat_name: "Varsity Jackets",
      materials: {
        body: "",
        sleeves: "",
      },
      styles: {
        collar: "",
        sleeves: "",
        closure: "",
        flap: "",
        pocket: "",
        knit: "",
        lining: "",
      },
      colors: {
        body: "",
        sleeves: "",
        buttons: "",
        zip: "",
        pockets: "",
        lining: "",
        base: "",
        lines: "",
        border: "",
        inside: "",
        outside: "",
        piping: "",
        inserts: "",
        stripes: "",
      },
      advanced: {
        chestPocket: "no",
        inserts: "no",
        insertsCount: "1",
        stripes: "no",
        piping: "no",
        proCuff: "no",
      },    // this is default setting 
    };
    return res;
  }
  return res;
};

export const getPrice = (state) => {
  const bodyPrice = state.defaults.materials.filter(
    (obj) => obj.name === state.materials.body
  );

  let body = state.pricing.materials.body[removeSpace(state.materials.body)]
  let sleeves = state.pricing.materials.sleeves[removeSpace(state.materials.sleeves)]

  let price = state.pricing.collar[removeSpace(state.styles.collar.toLowerCase())];
  price += state.pricing.sleeves[removeSpace(state.styles.sleeves)];
  price += state.pricing.closure[removeSpace(state.styles.closure)];
  price += state.pricing.pocket[removeSpace(state.styles.pocket)];
  price += state.pricing.lining[removeSpace(state.styles.lining)];
  price += state.styles.flap ? state.pricing.closure.flap : 0;
  price += state.styles.zipout ? state.pricing.lining.zipout : 0;
  price += body
  price += sleeves


  // Designs Calc
  if (state.designs["Front Center"]?.done)
    price += state.pricing.designs.frontcenter;

  if (state.designs["Back Top"]?.done) price += state.pricing.designs.backtop;

  if (state.designs["Back Bottom"]?.done)
    price += state.pricing.designs.backbottom;

  if (state.designs["Back Middle"]?.done)
    price += state.pricing.designs.backmiddle;

  if (state.designs["Right Chest"]?.done)
    price += state.pricing.designs.rightchest;

  if (state.designs["Left Chest"]?.done)
    price += state.pricing.designs.leftchest;

  if (state.designs["Right Pocket"]?.done)
    price += state.pricing.designs.rightpocket;

  if (state.designs["Left Pocket"]?.done)
    price += state.pricing.designs.leftpocket;

  if (state.designs["Right Sleeve"]?.done)
    price += state.pricing.designs.rightsleeve;

  if (state.designs["Left Sleeve"]?.done)
    price += state.pricing.designs.leftsleeve;

  if (state.designs["Right Sleeve End"]?.done)
    price += state.pricing.designs.rightsleeveend;

  if (state.designs["Left Sleeve End"]?.done)
    price += state.pricing.designs.leftsleeveend;

  // Mid Sleeve Positions (Upper and Lower) - Pricing from state
  if (state.designs["Right Mid Sleeve Upper"]?.done)
    price += state.pricing.designs.rightmidsleeveupper || 0;

  if (state.designs["Left Mid Sleeve Upper"]?.done)
    price += state.pricing.designs.leftmidsleeveupper || 0;

  if (state.designs["Right Mid Sleeve Lower"]?.done)
    price += state.pricing.designs.rightmidsleevelower || 0;

  if (state.designs["Left Mid Sleeve Lower"]?.done)
    price += state.pricing.designs.leftmidsleevelower || 0;

  // Advance Options Pricing
  if (state?.advance?.chestPocket) price += state.pricing.advance.chestPocket;

  if (state.advance.inserts && state?.advance?.insertsCount === 1)
    price += state.pricing.advance.insertsCount1;

  if (state.advance.inserts && state?.advance?.insertsCount === 2)
    price += state.pricing.advance.insertsCount2;

  if (state?.advance?.piping) price += state.pricing.advance.piping;

  if (state?.advance?.proCuff) price += state.pricing.advance.proCuff;

  // Sizes Calc
  if (state.sizes.custom) price += state.pricing.sizes.custom;
  // eslint-disable-next-line
  else
    state.defaults.sizes.map((obj) => {
      const sizePrice =
        state.materials.body === "Cowhide Leather" ||
          state.materials.body === "Sheep Leather"
          ? obj.price
          : obj.fprice;
      if (uCase(obj.size) === state.sizes.size) price += parseInt(sizePrice);
    });
  // console.log( state.defaults )
  // price += state.pricing.sizes[removeSpace(state.sizes.size)]

  return price.toFixed(2);
};

export const SvgToImg = async () => {
  const jacket = {
    front: "",
    back: "",
    right: "",
    left: "",
  };

  const svg = document.getElementById("jacketFront");
  const svgBack = document.getElementById("jacketBack");
  const svgRight = document.getElementById("jacketRight");
  const svgLeft = document.getElementById("jacketLeft");

  // guides.forEach((element) => {
  //   element.remove();
  // });

  const options = {
    backgroundColor: "#FFFFFF",
    encoderType: "image/webp",
    encoderOptions: 0.92,
  };

  svgAsPngUri(svg, options).then((uri) => {
    jacket.front = uri;
  });
  svgAsPngUri(svgBack, options).then((uri) => (jacket.back = uri));
  svgAsPngUri(svgRight, options).then((uri) => (jacket.right = uri));
  svgAsPngUri(svgLeft, options).then((uri) => (jacket.left = uri));

  if (svg !== null) {
    svg.classList.remove('cjd-hide');
    svgBack.classList.add('cjd-hide');
    svgRight.classList.add('cjd-hide');
    svgLeft.classList.add('cjd-hide');
    const canvas = new OffscreenCanvas(svg.clientWidth, svg.clientHeight);
    const ctx = canvas.getContext('2d');
    var xml = new XMLSerializer().serializeToString(svg);
    const v = await Canvg.from(ctx, xml, preset);

    // Render only first frame, ignoring animations and mouse.
    await v.render();

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.92 });
    const url = URL.createObjectURL(blob);

    jacket.frontUrl = url;
    jacket.frontBlob = blob;
  } else {
    return null;
  }

  if (svgBack !== null) {
    svg.classList.add('cjd-hide');
    svgBack.classList.remove('cjd-hide');
    svgRight.classList.add('cjd-hide');
    svgLeft.classList.add('cjd-hide');
    const canvasBack = new OffscreenCanvas(svgBack.clientWidth, svgBack.clientHeight);
    const ctxBack = canvasBack.getContext('2d');
    var xmlBack = new XMLSerializer().serializeToString(svgBack);
    const vBack = await Canvg.from(ctxBack, xmlBack, preset);

    // Render only first frame, ignoring animations and mouse.
    await vBack.render();

    const blobBack = await canvasBack.convertToBlob({ type: 'image/webp', quality: 0.92 });
    const urlBack = URL.createObjectURL(blobBack);

    jacket.backUrl = urlBack;
    jacket.backBlob = blobBack;
  } else {
    return null;
  }

  if (svgRight !== null) {
    svg.classList.add('cjd-hide');
    svgBack.classList.add('cjd-hide');
    svgRight.classList.remove('cjd-hide');
    svgLeft.classList.add('cjd-hide');
    const canvasRight = new OffscreenCanvas(svgRight.clientWidth, svgRight.clientHeight);
    const ctxRight = canvasRight.getContext('2d');
    var xmlRight = new XMLSerializer().serializeToString(svgRight);
    const vRight = await Canvg.from(ctxRight, xmlRight, preset);

    // Render only first frame, ignoring animations and mouse.
    await vRight.render();

    const blobRight = await canvasRight.convertToBlob({ type: 'image/webp', quality: 0.92 });
    const urlRight = URL.createObjectURL(blobRight);

    jacket.rightBlob = blobRight;
    jacket.rightUrl = urlRight;
  } else {
    return null;
  }

  if (svgLeft !== null) {
    svg.classList.add('cjd-hide');
    svgBack.classList.add('cjd-hide');
    svgRight.classList.add('cjd-hide');
    svgLeft.classList.remove('cjd-hide');
    const canvasLeft = new OffscreenCanvas(svgLeft.clientWidth, svgLeft.clientHeight);
    const ctxLeft = canvasLeft.getContext('2d');
    var xmlLeft = new XMLSerializer().serializeToString(svgLeft);
    const vLeft = await Canvg.from(ctxLeft, xmlLeft, preset);

    // Render only first frame, ignoring animations and mouse.
    await vLeft.render();

    const blobLeft = await canvasLeft.convertToBlob({ type: 'image/webp', quality: 0.92 });
    const urlLeft = URL.createObjectURL(blobLeft);

    jacket.leftBlob = blobLeft;
    jacket.leftUrl = urlLeft;
  } else {
    return null;
  }

  svgLeft.classList.add('cjd-hide');
  svg.classList.remove('cjd-hide');

  return jacket;
};

export const svgToUri = async (svg) => {
  const options = {
    backgroundColor: "#FFFFFF",
    encoderType: "image/webp",
    encoderOptions: 0.92,
  };

  svgAsPngUri(svg, options).then((uri) => {
    return uri;
  });
};
