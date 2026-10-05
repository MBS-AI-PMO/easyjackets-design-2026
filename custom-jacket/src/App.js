import React from "react";
import { connect, useStore } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { svgAsPngUri } from 'save-svg-as-png';
import axiosInstance from './utils/axiosConfig';
import { frontendUrl } from './config/url';
import { getPrice } from './utils';
import { loadCustomizerFonts } from './utils/fontLoader';
import { autoFitCustomizerText } from './utils/autoFitText';
import { getRequiredColorKeys } from './utils/requiredOptions';

import {
  currentTab,
  changePose,
  selectMaterial,
  activeSidebar,
  updateGlobals,
  modalState,
  currentJacket,
  saveSvg,
  jacketSnapshot,
  markJacketSaved,
  selectColor,
} from "./store/actions";

import Header from "./components/Header";
import StatsSection from "./components/StatsSection";
import CustomJacketFaqs from "./components/CustomJacketFaqs";
import CustomFooter from "./components/CustomFooter";
import MaintenanceGate from "./components/MaintenanceGate";
import Collapse from "./components/collapse";
import Presence from "./components/presence";

import Loader from "./components/loader";
import CjdAlert from "./components/alert";
import Jacket from "./components/Jacket";
import JacketBack from "./components/Jacket/back";
import JacketLeft from "./components/Jacket/left";
import JacketRight from "./components/Jacket/right";

import Coach from "./components/coach";
import CoachBack from "./components/coach/back";
import CoachLeft from "./components/coach/left";
import CoachRight from "./components/coach/right";

import Styles from "./components/styles";
import Materials from "./components/materials";
import Colors from "./components/colors";
import Designs from "./components/designs";
import Sizes from "./components/sizes";
import Advance from "./components/advance";
import PopUp from "./components/modal/popup";
import SaveDesign from "./components/modalSave";

import ViewFront from "./assets/images/view-front.svg";
import ViewBack from "./assets/images/view-back.svg";
import ViewSide from "./assets/images/view-side.svg";

import BadgeIcon from "./components/icons/badgeIcon";
import StyleIcon from "./components/icons/styleIcon";
import AdvanceIcon from "./components/icons/advanceIcon";
import ColorIcon from "./components/icons/colorsIcon";
import DesignIcon from "./components/icons/designIcon";
import SizeIcon from "./components/icons/sizeIcon";
import HamburgerIcon from "./components/icons/hamburgerIcon";
import JacketIcon from "./components/icons/jacketIcon";

import "./css/App.scss";
import "./css/site.css";
import "./css/builder-panel.scss"; // the left panel in the storefront look: after App.scss on purpose
import "./css/builder-toolbar.scss"; // the toolbar over the jacket, likewise
import "./css/builder-dialogs.scss"; // the dialogs, likewise
import "./css/builder-design-modal.scss"; // the add-design dialog, likewise
import { faCoffee, faPlus } from "@fortawesome/free-solid-svg-icons";

const App = ({
  globals,
  jackets,
  styles,
  materials,
  colors,
  designs,
  sizes,
  activeTab,
  changePose,
  popup,
  selectMaterial,
  pricing,
  activeSidebar,
  advance,
  updateGlobals,
  modalState,
  defaults,
  currentJacket,
  saveSvg,
  jacketSnapshot,
  markJacketSaved,
  selectColor,
}) => {
  // the coach jacket's inside lining only comes in white: it starts white, and stays white after a
  // design or another jacket tab is loaded
  React.useEffect(() => {
    if (String(globals.productId).trim() === "6046" && colors.lining !== "#ffffff") selectColor("lining", "#ffffff");
  }, [globals.productId, colors.lining, selectColor]);

  React.useEffect(() => {
    // the tab icon comes from the admin (utils/favicon.js, loaded in index.js)
    loadCustomizerFonts();
  }, []);

  React.useEffect(() => {
    autoFitCustomizerText();
  }, [designs, globals.activeJacket, globals.pose]);

  // Outlines off (toolbar switch): each part is stroked in its own colour instead of the grey outline,
  // which closes the hairline gaps between neighbouring parts that the outline used to cover (a white
  // line showed along the top of the waistband). The gold hover outline still wins (it is !important).
  // Only the strokes this switch sets are ever changed or removed (it notes each in data-cjd-outline-stroke):
  // a stroke the drawing sets inline itself, like the knit border (Knit / Trim "... Border"), is left
  // alone with the outlines on or off. (It used to remove every inline stroke when the outlines were on,
  // which took the knit border away.)
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const setOutline = (el, value) => {
        el.style.stroke = value;
        el.dataset.cjdOutlineStroke = el.style.stroke;
      };
      const clearOutline = (el) => {
        if (el.dataset.cjdOutlineStroke === undefined) return;
        if (el.style.stroke === el.dataset.cjdOutlineStroke) el.style.removeProperty('stroke');
        delete el.dataset.cjdOutlineStroke;
      };
      // the drawing's own stroke: set inline, and not by this switch
      const hasOwnStroke = (el) => {
        if (!el.style.stroke || el.style.stroke === el.dataset.cjdOutlineStroke) return false;
        delete el.dataset.cjdOutlineStroke;
        return true;
      };
      // every shape of a colour part, not only paths (the coach's pocket strips are polygons with a
      // black stroke of their own)
      document
        .querySelectorAll([
          '.cjd-content-wrapper svg .cjd-color-hover',
          ...['path', 'polygon', 'rect', 'circle', 'ellipse', 'polyline'].map((shape) => `.cjd-content-wrapper svg .cjd-color-hover ${shape}`),
        ].join(', '))
        .forEach((part) => {
          if (hasOwnStroke(part)) return;
          if (globals.outlines === false) {
            // a group passes its stroke on to lines inside it that have none of their own (the line down
            // the front opening): groups get none, only the shapes themselves are stroked
            if (part.tagName.toLowerCase() === 'g') {
              setOutline(part, 'none');
              return;
            }
            const fill = window.getComputedStyle(part).fill;
            // a part that is only a line (drawn by its outline) shows nothing, rather than a line in its fill
            let thin = false;
            try {
              const box = part.getBBox();
              thin = box.width < 2 || box.height < 2;
            } catch {
              thin = false;
            }
            setOutline(part, fill && fill !== 'none' && !thin ? fill : 'none');
          } else {
            clearOutline(part);
          }
        });
      // the black line down the front opening stays (it has no stroke of its own: it took the outline's)
      document.querySelectorAll('.cjd-content-wrapper #jacketFront .cjd-color-hover line').forEach((line) => {
        if (hasOwnStroke(line)) return;
        if (globals.outlines === false) setOutline(line, line.getAttribute('stroke') || '#000');
        else clearOutline(line);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [globals.outlines, globals.pose, globals.activeJacket, colors, styles, materials, advance]);

  const [openSideBar, setOpenSideBar] = React.useState(true);
  const svgContainerStyle = { paddingRight: "10px", paddingLeft: "20px" };
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [currentTab, setCurrentTab] = React.useState();
  const [isActive, setIsActive] = React.useState(true);
  const [canvasDark, setCanvasDark] = React.useState(false);

  // Share Modal States
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [shareFormData, setShareFormData] = React.useState({ name: '', email: '' });
  const [shareLoading, setShareLoading] = React.useState(false);
  const [saveNoticeOpen, setSaveNoticeOpen] = React.useState(false);
  // Replaces window.alert() — see components/alert.
  const [notice, setNotice] = React.useState(null);
  const store = useStore();
  let state = store.getState();

  const onClickTab = (value) => {
    if (value == currentTab) {
      setCurrentTab(0);
    } else {
      setCurrentTab(value);
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // The workspace (.cjd-main) fills the rest of the screen: its height is the screen minus what sits
  // above it (site navbar, jacket bar, stats), measured here because the navbar's height follows the
  // logo size set in the admin (css/assets/scss/_variables.scss $chrome-height reads this).
  React.useEffect(() => {
    if (globals.loading) return undefined;
    const main = document.querySelector(".cjd-main");
    if (!main) return undefined;
    const publish = () => {
      const top = main.getBoundingClientRect().top + window.scrollY;
      document.documentElement.style.setProperty("--cjd-chrome-h", `${Math.round(top)}px`);
    };
    publish();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(publish);
    for (let el = main.previousElementSibling; el; el = el.previousElementSibling) observer.observe(el);
    return () => observer.disconnect();
  }, [globals.loading]);

  if (globals.loading) {
    return (
      <MaintenanceGate>
        <Loader msg="Wait while we prepare the custom experience for you" />
      </MaintenanceGate>
    );
  }

  const updateJacketState = async (key) => {
    await currentJacket(
      key,
      { materials, styles, colors, designs, sizes, advance },
      getPrice(state)
    );
  };

  const getSvgSnapshot = (key) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Change to target jacket
        currentJacket(key, { materials, styles, colors, designs, sizes, advance }, getPrice(state));
        jacketSnapshot(key);
        updateGlobals('activeJacket', key);

        const options = { encoderType: 'image/webp', encoderOptions: 0.92 }; // transparent ground: the site shows it on its own colour, emails flatten it on white
        const svg = document.getElementById('jacketFront');
        const svgBack = document.getElementById('jacketBack');
        const svgRight = document.getElementById('jacketRight');
        const svgLeft = document.getElementById('jacketLeft');

        await svgAsPngUri(svg, options).then(uri => saveSvg(key, 'front', uri));
        await svgAsPngUri(svgBack, options).then(uri => saveSvg(key, 'back', uri));
        await svgAsPngUri(svgRight, options).then(uri => saveSvg(key, 'right', uri));
        await svgAsPngUri(svgLeft, options).then(uri => saveSvg(key, 'left', uri));

        resolve(store.getState().jackets[key].front);
      }, 1);
    });
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareLoading(true);

    try {
      await updateJacketState(globals.activeJacket);
      await getSvgSnapshot(globals.activeJacket);

      const element = store.getState().jackets[globals.activeJacket];
      const designData = {
        product_id: globals?.productId,
        title: element.title,
        styles: element.data.styles,
        advance: element.data.advance,
        colors: element.data.colors,
        materials: element.data.materials,
        sizes: element.data.sizes,
        designs: element.data.designs,
        globals,
        jackets: store.getState().jackets,
        custom_price: element.price,
        custom_image: element.front,
        custom_image_back: element.back,
        custom_image_left: element.left,
        custom_image_right: element.right,
      };

      const { data } = await axiosInstance.post(`/custom/share`, {
        name: shareFormData.name,
        email: shareFormData.email,
        design: designData,
      });

      setShowShareModal(false);
      setNotice({
        tone: 'success',
        title: 'Design sent',
        message: `We emailed your jacket design to ${shareFormData.email}.${data?.pdfAttached === false ? ' The PDF spec could not be generated this time, but the full preview is in the email.' : ''}`,
      });
    } catch (error) {
      console.error(error);
      setNotice({
        tone: 'error',
        title: "Couldn't send your design",
        message: error?.response?.data?.error || 'Something went wrong on our end. Please try again in a moment.',
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleReview = async () => {
    if (globals.design.update && globals.design.designItemKey) {
      window.open(frontendUrl(`/design/${globals.design.designItemKey}`), '_blank');
      return;
    }
    setNotice({
      tone: 'info',
      title: 'Save your design first',
      message: 'Save this design to your cart to see the full detailed review, or use Share to email yourself a summary.',
    });
  };

  const doSomeAsyncStuff = (v) => {
    return new Promise((resolve, reject) => {
      if (colors[v] === '') {
        updateGlobals('requiremodal', true);
        reject(new Error(`Missing color value for ${v}`));
      } else {
        resolve();
      }
    });
  };

  const checkIfDirty = async () => {
    if (sizes.size === '') {
      updateGlobals('requiremodal', true);
      throw new Error('Size is not selected');
    }

    const requiredColors = getRequiredColorKeys({ styles, advance, jacket: globals.catName });
    const promises = requiredColors.map((v) => doSomeAsyncStuff(v));
    return Promise.all(promises);
  };

  const getSvg = (key) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await currentJacket(key, { materials, styles, colors, designs, sizes, advance }, getPrice(state));
        await jacketSnapshot(key);
        updateGlobals('activeJacket', key);

        const options = { encoderType: 'image/webp', encoderOptions: 0.92 }; // transparent ground: the site shows it on its own colour, emails flatten it on white
        const svg = document.getElementById('jacketFront');
        const svgBack = document.getElementById('jacketBack');
        const svgRight = document.getElementById('jacketRight');
        const svgLeft = document.getElementById('jacketLeft');

        await svgAsPngUri(svg, options).then(uri => saveSvg(key, 'front', uri));
        await svgAsPngUri(svgBack, options).then(uri => saveSvg(key, 'back', uri));
        await svgAsPngUri(svgRight, options).then(uri => saveSvg(key, 'right', uri));
        await svgAsPngUri(svgLeft, options).then(uri => saveSvg(key, 'left', uri));

        resolve(store.getState().jackets[key].front);
      }, 10);
    });
  };

  const handleSaveAction = async () => {
    const savedSnapshot = JSON.parse(JSON.stringify({ materials, styles, colors, designs, sizes, advance }));

    await currentJacket(globals.activeJacket, savedSnapshot, getPrice(store.getState()));
    jacketSnapshot(globals.activeJacket);
    markJacketSaved(globals.activeJacket, true, savedSnapshot);
    setSaveNoticeOpen(true);
  };

  const handleAddToCart = async () => {
    updateGlobals('loading', true);
    let images = [];
    for (let i = 0; i < jackets.length; i++) {
      images.push(await getSvg(i));
    }

    let ids = [];
    let promises = [];
    for (let i = 0; i < jackets.length; i++) {
      const element = store.getState().jackets[i];
      const data = {
        product_qty: 1,
        product_id: globals?.productId,
        title: element.title,
        styles: element.data.styles,
        advance: element.data.advance,
        colors: element.data.colors,
        materials: element.data.materials,
        sizes: element.data.sizes,
        designs: element.data.designs,
        globals,
        jackets: store.getState().jackets,
        custom_price: element.price,
        custom_image: element.front,
        custom_image_back: element.back,
        custom_image_left: element.left,
        custom_image_right: element.right,
      };
      let res = await axiosInstance.post(`/custom/addToCart`, { categoryCode: globals?.productId, ...data });
      if (res.status === 200) ids.push(res.data.id);
      promises.push(res);
    }

    Promise.all(promises).then(() => {
      updateGlobals('loading', false);
      window.onbeforeunload = null;
      window.location.href = frontendUrl(`/cart?index=${ids.join(',')}`);
    });
  };

  const handleSaveDesign = async () => {
    updateGlobals('loading', true);
    let images = [];
    for (let i = 0; i < jackets.length; i++) {
      images.push(await getSvg(i));
    }

    let promises = [];
    for (let i = 0; i < jackets.length; i++) {
      const element = store.getState().jackets[i];
      const data = {
        product_qty: 1,
        product_id: globals?.productId,
        title: element.title,
        styles: element.data.styles,
        advance: element.data.advance,
        colors: element.data.colors,
        materials: element.data.materials,
        sizes: element.data.sizes,
        designs: element.data.designs,
        globals,
        jackets: store.getState().jackets,
        custom_price: element.price,
        custom_image: element.front,
        custom_image_back: element.back,
        custom_image_left: element.left,
        custom_image_right: element.right,
      };
      promises.push(axiosInstance.post(`/custom/product-design/?productId=${globals.madeProduct}`, { categoryCode: globals?.productId, ...data }));
    }

    Promise.all(promises).then(() => {
      updateGlobals('loading', false);
      window.onbeforeunload = null;
      window.history.go(-1);
    });
  };

  const handleUpdateCart = async () => {
    updateGlobals('loading', true);
    const designId = globals.design.designItemKey;
    let images = [];
    for (let i = 0; i < jackets.length; i++) {
      images.push(await getSvg(i));
    }

    let promises = [];
    for (let i = 0; i < jackets.length; i++) {
      const element = store.getState().jackets[i];
      const data = {
        title: element.title,
        styles: element.data.styles,
        advance: element.data.advance,
        colors: element.data.colors,
        materials: element.data.materials,
        sizes: element.data.sizes,
        designs: element.data.designs,
        globals,
        jackets: store.getState().jackets,
        custom_price: element.price,
        custom_image: element.front,
        custom_image_back: element.back,
        custom_image_left: element.left,
        custom_image_right: element.right,
      };
      promises.push(axiosInstance.put(`/custom/updateDesign/${designId}`, { ...data }));
    }

    Promise.all(promises).then(() => {
      updateGlobals('loading', false);
      window.onbeforeunload = null;
      window.history.go(-1);
    });
  };

  return (
    <MaintenanceGate>
    <>
      <Header />
      <StatsSection />
      <div className="cjd-main">
        <div
          className="ez-site panel-desktop"
          style={{ width: "40%" }}
        >
          {/* the sections scroll; Save and Share stay below, outside the scroll */}
          <div className="cjd-panel-scroll">
            <div
              className={
                currentTab === 1 ? "control-box activeBox" : "control-box"
              }
              onClick={() => onClickTab(1)}
            >
              <span className="step-title">
                <strong>Materials</strong> Style
              </span>
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <Collapse open={isActive && currentTab === 1}>
              <div className="control-box-control">
                <Materials />
              </div>
            </Collapse>

            {globals.catName === "Hoodies" ||
              globals.catName === "Coach Jackets" ||
              globals.productId === "5995" ||
              globals.productId === "6046" ||
              String(globals.productId).trim() === "4893" ? (
              <></>
            ) : (
              <>
                <div
                  className={
                    currentTab === 2 ? "control-box activeBox" : "control-box"
                  }
                  onClick={() => onClickTab(2)}
                >
                  <span className="step-title">
                    <strong>Advance</strong> Options
                  </span>
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <Collapse open={isActive && currentTab === 2}>
                  <div className="control-box-control">
                    <Advance />
                  </div>
                </Collapse>
              </>
            )}

            <div
              className={
                currentTab === 3 ? "control-box activeBox" : "control-box"
              }
              onClick={() => onClickTab(3)}
            >
              <span className="step-title">
                <strong>Add</strong> Colors
              </span>
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <Collapse open={isActive && currentTab === 3}>
              <div className="control-box-control">
                <Colors />
              </div>
            </Collapse>
            <div
              className={
                currentTab === 4 ? "control-box activeBox" : "control-box"
              }
              onClick={() => onClickTab(4)}
            >
              <span className="step-title">
                <strong>Add</strong> Design
              </span>
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <Collapse open={isActive && currentTab === 4}>
              <div className="control-box-control">
                <Designs />
              </div>
            </Collapse>
            <div
              className={
                currentTab === 5 ? "control-box activeBox" : "control-box"
              }
              onClick={() => onClickTab(5)}
            >
              <span className="step-title">
                <strong>Select</strong> Size
              </span>
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <Collapse open={isActive && currentTab === 5}>
              <div className="control-box-control">
                <Sizes />
              </div>
            </Collapse>
          </div>

          <div className="cjd-panel-actions">
            <button className="cjd-btn cjd-btn-cart" onClick={handleSaveAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              Save
            </button>
            <button className="cjd-btn-secondary" onClick={() => setShowShareModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              Share
            </button>
          </div>
        </div>

        <div className={`cjd-content-wrapper${canvasDark ? ' canvas-dark' : ''}${globals.outlines === false ? ' outlines-off' : ''}`}>
          <div className="ez-site cjd-jacket-guides">
            <div className="cjd-guides-pill">
              <span className="cjd-guides-label">Guides</span>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(globals.guides)}
                aria-label="Guides"
                className={`cjd-guides-toggle${globals.guides ? ' on' : ''}`}
                onClick={() => updateGlobals("guides", !globals.guides)}
              >
                <span className="cjd-switch-knob" aria-hidden="true" />
                <span className="cjd-switch-text">{globals.guides ? "On" : "Off"}</span>
              </button>
            </div>
            {/* the thin lines drawn around each part: off shows the jacket as it is made */}
            <div className="cjd-guides-pill cjd-outlines-pill">
              <span className="cjd-guides-label">Outlines</span>
              <button
                type="button"
                role="switch"
                aria-checked={globals.outlines !== false}
                aria-label="Outlines"
                className={`cjd-guides-toggle cjd-outlines-toggle${globals.outlines !== false ? ' on' : ''}`}
                onClick={() => updateGlobals("outlines", globals.outlines === false)}
                title={globals.outlines !== false ? "Hide the outlines" : "Show the outlines"}
              >
                <span className="cjd-switch-knob" aria-hidden="true" />
                <span className="cjd-switch-text">{globals.outlines !== false ? "On" : "Off"}</span>
              </button>
            </div>
            <div className="cjd-guides-pill" style={{ padding: "3px" }}>
              <button
                type="button"
                aria-pressed={canvasDark}
                aria-label="Dark canvas"
                className={`cjd-canvas-bg-toggle${canvasDark ? ' on' : ''}`}
                onClick={() => setCanvasDark(d => !d)}
                title={canvasDark ? "Light canvas" : "Dark canvas"}
              >
                {canvasDark ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Phones: Save lives here (the buttons under the panel are hidden there, css/builder-panel.scss);
                Share is at the top, next to + (components/Header) */}
            {isMobile && (
              <>
                <div
                  className="cjd-guides-pill cjd-action-pill cjd-action-pill--primary"
                  role="button"
                  tabIndex={0}
                  onClick={handleSaveAction}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSaveAction(); } }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                  <span className="cjd-guides-label">Save</span>
                </div>
              </>
            )}
          </div>

          {globals.catName === "Coach Jackets" ? (
            <>
              {<Coach pose={globals.pose === "front"} />}
              {<CoachBack pose={globals.pose === "back"} />}
              {<CoachLeft pose={globals.pose === "left"} />}
              {<CoachRight pose={globals.pose === "right"} />}
            </>
          ) : (
            <>
              <Jacket pose={globals.pose === "front"} />
              <JacketBack pose={globals.pose === "back"} />
              <JacketLeft pose={globals.pose === "left"} />
              <JacketRight pose={globals.pose === "right"} />
            </>
          )}
        </div>

        {/* the four views of the jacket (css/builder-toolbar.scss) */}
        <div className="ez-site cjd-jacket-nav outer" role="group" aria-label="Jacket view">
          <button
            type="button"
            className={`cjd-nav-item${globals.pose === "front" ? " cjd-active-nav" : ""}`}
            aria-pressed={globals.pose === "front"}
            onClick={() => changePose("front")}
          >
            <img src={ViewFront} alt="" />
            <span className="cjd-nav-label">Front</span>
          </button>
          <button
            type="button"
            className={`cjd-nav-item${globals.pose === "back" ? " cjd-active-nav" : ""}`}
            aria-pressed={globals.pose === "back"}
            onClick={() => changePose("back")}
          >
            <img src={ViewBack} alt="" />
            <span className="cjd-nav-label">Back</span>
          </button>
          <button
            type="button"
            className={`cjd-nav-item${globals.pose === "left" ? " cjd-active-nav" : ""}`}
            aria-pressed={globals.pose === "left"}
            onClick={() => changePose("left")}
          >
            <img src={ViewSide} alt="" />
            <span className="cjd-nav-label">Left</span>
          </button>
          <button
            type="button"
            className={`cjd-nav-item is-mirrored${globals.pose === "right" ? " cjd-active-nav" : ""}`}
            aria-pressed={globals.pose === "right"}
            onClick={() => changePose("right")}
          >
            <img src={ViewSide} alt="" />
            <span className="cjd-nav-label">Right</span>
          </button>
        </div>

        <div className="ez-site panel-mbl">
          <div
            className={
              currentTab === 1 ? "control-box activeBox" : "control-box"
            }
            onClick={() => onClickTab(1)}
          >
            <span className="step-title">
              <strong>Materials</strong> Style
            </span>
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <Collapse open={isActive && currentTab === 1}>
            <div className="control-box-control">
              <Materials />
            </div>
          </Collapse>

          {globals.catName === "Hoodies" ||
            globals.catName === "Coach Jackets" ||
            globals.productId === "5995" ||
            globals.productId === "6046" ||
            String(globals.productId).trim() === "4893" ? (
            <></>
          ) : (
            <>
              <div
                className={
                  currentTab === 2 ? "control-box activeBox" : "control-box"
                }
                onClick={() => onClickTab(2)}
              >
                <span className="step-title">
                  <strong>Advance</strong> Options
                </span>
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <Collapse open={isActive && currentTab === 2}>
                <div className="control-box-control">
                  <Advance />
                </div>
              </Collapse>
            </>
          )}

          <div
            className={
              currentTab === 3 ? "control-box activeBox" : "control-box"
            }
            onClick={() => onClickTab(3)}
          >
            <span className="step-title">
              <strong>Add</strong> Colors
            </span>
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <Collapse open={isActive && currentTab === 3}>
            <div className="control-box-control">
              <Colors />
            </div>
          </Collapse>

          <div
            className={
              currentTab === 4 ? "control-box activeBox" : "control-box"
            }
            onClick={() => onClickTab(4)}
          >
            <span className="step-title">
              <strong>Add</strong> Design
            </span>
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <Collapse open={isActive && currentTab === 4}>
            <div className="control-box-control">
              <Designs />
            </div>
          </Collapse>

          <div
            className={
              currentTab === 5 ? "control-box activeBox" : "control-box"
            }
            onClick={() => onClickTab(5)}
          >
            <span className="step-title">
              <strong>Select</strong> Size
            </span>
            {currentTab === 5}
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <Collapse open={isActive && currentTab === 5}>
            <div className="control-box-control">
              <Sizes />
            </div>
          </Collapse>

          <div className="cjd-panel-actions">
            <button className="cjd-btn cjd-btn-cart" onClick={handleSaveAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              Save
            </button>
            <button className="cjd-btn-secondary" onClick={() => setShowShareModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              Share
            </button>
          </div>
        </div>
      </div>

      <CustomJacketFaqs />
      <CustomFooter />

      <PopUp />
      <SaveDesign />

      <CjdAlert
        open={saveNoticeOpen}
        tone="success"
        title="Jacket saved"
        message="You can design a new jacket now."
        onClose={() => setSaveNoticeOpen(false)}
      />

      <CjdAlert
        open={Boolean(notice)}
        tone={notice?.tone}
        title={notice?.title}
        message={notice?.message}
        onClose={() => setNotice(null)}
      />

      {/* Share Modal */}
      <Presence open={showShareModal}>
        <div className="cjd-share-modal" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="cjd-dialog-eyebrow">Share</div>
                <h3>Share Your Creation</h3>
              </div>
              <button type="button" className="close-btn" aria-label="Close" onClick={() => setShowShareModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="desc">Enter your details to share this configuration via email.</p>
              <form onSubmit={handleShareSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={shareFormData.name}
                    onChange={e => setShareFormData({ ...shareFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="recipient@example.com"
                    value={shareFormData.email}
                    onChange={e => setShareFormData({ ...shareFormData, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={shareLoading}>
                  {shareLoading ? 'Processing...' : 'Send Design'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Presence>
    </>
    </MaintenanceGate>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  defaults: state.defaults,
  jackets: state.jackets,
  designs: state.designs,
  styles: state.styles,
  materials: state.materials,
  colors: state.colors,
  sizes: state.sizes,
  popup: state.popup,
  pricing: state.pricing,
  advance: state.advance,
});

const mapDispatchToProps = (dispatch) => ({
  activeTab: (tab) => dispatch(currentTab(tab)),
  changePose: (val) => dispatch(changePose(val)),
  selectMaterial: (val) => dispatch(selectMaterial(val)),
  activeSidebar: (idx) => dispatch(activeSidebar(idx)),
  updateGlobals: (key, val) => dispatch(updateGlobals(key, val)),
  modalState: (key, val) => dispatch(modalState(key, val)),
  currentJacket: (key, obj, price) => dispatch(currentJacket(key, obj, price)),
  saveSvg: (key, part, svg) => dispatch(saveSvg(key, part, svg)),
  jacketSnapshot: (key) => dispatch(jacketSnapshot(key)),
  markJacketSaved: (key, saved, snapshot) => dispatch(markJacketSaved(key, saved, snapshot)),
  selectColor: (key, val) => dispatch(selectColor(key, val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
