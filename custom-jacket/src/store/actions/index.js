import DOMPurify from "dompurify";
import { apiCall, getPrice } from "../../utils";
import { updateDefaults } from "./defaults";
import { svgAsPngUri } from "save-svg-as-png";
import axiosInstance from "../../utils/axiosConfig";
import { categoryKey } from "../../config/categoryKeys";
// Globals Actions
export const updateGlobals = (key, val) => ({
  type: "UPDATE_GLOBAL",
  data: { key, val },
});

export const currentTab = (val) => ({
  type: "ACTIVE_TAB",
  data: val,
});

export const globalColor = (key, val) => ({
  type: "GLOBAL_FILL_COLOR",
  data: { key, val },
});

export const changePose = (val) => ({
  type: "CHANGE_POSE",
  data: val,
});

export const modalState = (key, val) => ({
  type: "MODAL_STATE",
  data: { key, val },
});

export const guideModalState = (key, val) => ({
  type: "GUIDE_MODAL_STATE",
  data: { key, val },
});

export const activeSidebar = (idx) => ({
  type: "ACTIVE_SIDEBAR",
  data: idx,
});

export const activeAccordin = (par, cur) => ({
  type: "ACTIVE_ACCORDIN",
  data: { par, cur },
});

export const colorPicker = (part) => ({
  type: "COLOR_PICKER",
  data: part,
});

// Styles Actions
export const selectStyle = (key, val) => ({
  type: "SELECT_STYLE",
  data: { key, val },
});

export const selectMaterial = (key, val) => ({
  type: "SELECT_MATERIAL",
  data: { key, val },
});

export const selectMaterialSleeves = (key, val) => ({
  type: "SELECT_MATERIAL_SLEEVES",
  data: { key, val },
});

export const selectColor = (key, val) => ({
  type: "SELECT_COLOR",
  data: { key, val },
});

export const openSection = (title, open) => ({
  type: "OPEN_ACCORDIN",
  data: { title, open },
});

export const designColor = (key, val, part) => ({
  type: "DESIGN_COLOR",
  data: { key, val, part },
});

export const chooseName = (key, val, part, font, tab) => {
  return {
    type: "UPDATE_NAME",
    data: { key, val, part, font, tab },
  }
};

export const selectFont = (val, part) => ({
  type: "SELECT_FONT",
  data: { val, part },
});

export const saveName = (part, section, obj) => ({
  type: "SAVE_PART",
  data: { part, section, obj },
});

export const deleteDesign = (sec) => ({
  type: "REMOVE_DESIGN",
  data: { sec },
});

export const updateType = (part, sec, key, val) => ({
  type: "UPDATE_LETTER_TYPE",
  data: { part, sec, key, val },
});

// Sizes
export const selectSize = (type, val) => ({
  type: "SELECT_SIZE",
  data: { type, val },
});

// Styles Actions
export const advanceOption = (key, val) => ({
  type: "ADVANCE_OPTION",
  data: { key, val },
});

export const defaultColors = (res) => ({
  type: "DEFAULT_COLORS",
  data: res,
});

// Jacke
export const firstJacket = (obj, price) => ({
  type: "FIRST_JACKET",
  data: { obj, price },
});

export const duplicate = (obj) => {
  return (dispatch, getState) => {
    dispatch({
      type: "NEW_JACKET",
      data: obj,
    });
  };
};

export const removeJacket = (key) => ({
  type: "REMOVE_JACKET",
  data: key,
});

export const replaceJackets = (obj) => ({
  type: "REPLACE_JACKETS",
  data: obj,
});

export const updatePreviousState = (key, obj, price) => ({
  type: "UPDATE_PREVIOUS_JACKET",
  data: { key, obj, price },
});

export const currentJacket = (key, obj, price) => ({
  type: "JACKET_DATA",
  data: { key, obj, price },
});

export const saveSvg = (key, part, svg) => ({
  type: "SAVE_JACKET_SVG",
  data: { key, part, svg },
});

export const markJacketSaved = (key, saved = true, snapshot = null) => ({
  type: "MARK_JACKET_SAVED",
  data: { key, saved, snapshot },
});

export const setActiveJacket = (key) => ({
  type: "SET_ACTIVE_JACKET",
  data: key,
});

export const renameJacket = (key, val) => ({
  type: "RENAME_JACKET",
  data: { key, val },
});

export const guideModal = (key, val) => ({
  type: "RENAME_JACKET",
  data: { key, val },
});

export const jacketSnapshot = (key) => {
  return (dispatch) => {
    // const svgFront = document.getElementById('jacketFront');
    // const svgBack = document.getElementById('jacketBack');
    // const svgLeft = document.getElementById('jacketLeft');
    // const svgRight = document.getElementById('jacketRight');
    // const options = {
    //   backgroundColor: '#FFFFFF',
    //   encoderType: 'image/webp',
    //   encoderOptions: 1
    // }
    // svgAsPngUri(svgFront, options).then(uri => dispatch(saveSvg(key, 'front', uri)));
    // svgAsPngUri(svgBack, options).then(uri => dispatch(saveSvg(key, 'back', uri)));
    // svgAsPngUri(svgRight, options).then(uri => dispatch(saveSvg(key, 'right', uri)));
    // svgAsPngUri(svgLeft, options).then(uri => dispatch(saveSvg(key, 'left', uri)));
    // dispatch(saveSvg(key, 'front', DOMPurify.sanitize(svgFront)));
    // dispatch(saveSvg(key, 'back', DOMP1urify.sanitize(svgBack)));
    // dispatch(saveSvg(key, 'left', DOMPurify.sanitize(svgLeft)));
    // dispatch(saveSvg(key, 'right', DOMPurify.sanitize(svgRight)));
  };
};

export const switchJacket = (key) => {
  return (dispatch, getState) => {
    dispatch(
      currentJacket(
        key,
        {
          materials: getState().materials,
          styles: getState().styles,
          colors: getState().colors,
          designs: getState().designs,
          sizes: getState().sizes,
          advance: getState().advance,
        },
        getPrice(getState())
      )
    );
    dispatch(jacketSnapshot(key));
    dispatch(updateGlobals("activeJacket", key));

    dispatch(setActiveJacket(key));
    dispatch(replaceMaterials(getState().jackets[key].data.materials));
    dispatch(replaceStyles(getState().jackets[key].data.styles));
    dispatch(replaceColors(getState().jackets[key].data.colors));
    dispatch(replaceDesigns(getState().jackets[key].data.designs));
    dispatch(replaceSizes(getState().jackets[key].data.sizes));
    dispatch(replaceAdvance(getState().jackets[key].data.advance));
  };
};

// Replace Objects
export const replaceMaterials = (obj) => ({
  type: "REPLACE_MATERIALS",
  data: obj,
});

export const replaceStyles = (obj) => ({
  type: "REPLACE_STYLES",
  data: obj,
});

export const replaceColors = (obj) => ({
  type: "REPLACE_COLORS",
  data: obj,
});

export const replaceDesigns = (obj) => ({
  type: "REPLACE_DESIGNS",
  data: obj,
});

export const replaceSizes = (obj) => ({
  type: "REPLACE_SIZES",
  data: obj,
});

export const replaceAdvance = (obj) => ({
  type: "REPLACE_ADVANCE",
  data: obj,
});

// Reset
export const replaceGlobals = (obj) => ({
  type: "REPLACE_GLOBALS",
  data: obj,
});

// Product
export const getProduct = (id, product) => {
  return async (dispatch) => {
    const res = await axiosInstance.get(`/custom/get-properties?code=${id}`)
    // const data = { action: "get_product", id };
    // apiCall(data)
    //   .then((res) => {
    // Resolved from the category's code, not its name — see config/categoryKeys.
    const catName = categoryKey(res.data.category, id);
    // const materials = res.data?.materials;
    // const styles = res.data?.styles;
    // const colors = res.data?.colors;
    // const advanced = res.data?.advanced;
    // const styles = res.data?.styles;
    // const advanced = res.data?.advanced;

    if (catName === "Bomber Jackets") {
      dispatch(updateGlobals("bomber", true));
      dispatch(selectStyle("closure", "Zipper"));
      dispatch(selectStyle("knit", "Plain"));
      dispatch(advanceOption("chestPocket", false));
      dispatch(advanceOption("sleevePocket", true));
    } else if (catName === "Hoodies") {
      dispatch(updateGlobals("hoodies", true));
      dispatch(selectStyle("collar", "Hood"));
      dispatch(selectStyle("closure", "Zipper"));
      dispatch(selectStyle("knit", "Plain"));
      dispatch(updateGlobals(1, "Sleeves Style"));
    } else if (catName === "Coach Jackets") {
      dispatch(updateGlobals("coach", true));
      dispatch(selectMaterial("body", "Nylon"));
      dispatch(selectStyle("collar", "Shirt Collar"));
      dispatch(selectStyle("lining", "Polar Fleece"));
    }

    if (id === "5893") {
      dispatch(selectMaterial("body", "Melton Wool"));
    }

    // console.log(materials)
    // Object.keys(materials).map((key) => {
    //   if (materials[key] !== "")
    //     dispatch(selectMaterial(key, materials[key]));

    //   return true;
    // });

    // Object.keys(styles).map((key) => {
    //   if (styles[key] !== "") dispatch(selectStyle(key, styles[key]));

    //   return true;
    // });

    // Object.keys(colors).map((key) => {
    //   if (colors[key] !== "") dispatch(selectColor(key, colors[key]));

    //   return true;
    // });

    // Object.keys(advanced).map((key) => {
    //   if (advanced[key] !== "") {
    //     if (key === "insertsCount") {
    //       dispatch(advanceOption(key, parseInt(advanced[key])));
    //     } else {
    //       dispatch(advanceOption(key, advanced[key] === "yes"));
    //     }
    //   }

    //   return true;
    // });

    dispatch(updateGlobals("productId", id));
    // dispatch(updateGlobals("token", token))
    dispatch(updateGlobals("catId", catName));
    dispatch(updateGlobals("catName", catName));
    dispatch(updateDefaults(res.data));
    if (product) {
      dispatch(updateGlobals("save", true))
      dispatch(updateGlobals("madeProduct", product))
    }
  }
};

export const getSetProduct = (designId) => {
  return async (dispatch) => {
    const res = await axiosInstance.get(`/custom/getDesign/${designId}`)
    const obj = res.data.data
    const { data } = await axiosInstance.get(`/custom/get-properties?code=${obj.categoryCode}`)

    dispatch(replaceMaterials(obj.materials));
    dispatch(replaceStyles(obj.styles));
    dispatch(replaceColors(obj.colors));
    dispatch(replaceDesigns(obj.designs));
    dispatch(replaceSizes(obj.sizes));
    dispatch(replaceAdvance(obj.advance));
    dispatch(replaceJackets(obj.jackets));
    dispatch(updateGlobals("design", {
      productId: obj.categoryCode,
    }));

    // A saved design stores whatever catName was at the time — which, before
    // config/categoryKeys existed, was the category's display name. Resolve it
    // the same way a fresh load does, so a design saved under an old name
    // still opens as the right jacket.
    const catName = categoryKey(obj.globals?.catName, obj.categoryCode);

    if (catName === "Bomber Jackets") {
      dispatch(updateGlobals("bomber", true));

    } else if (catName === "Hoodies") {
      dispatch(updateGlobals("hoodies", true));

    } else if (catName === "Coach Jackets") {
      dispatch(updateGlobals("coach", true));

    }

    dispatch(updateGlobals("productId", obj.categoryCode));
    // dispatch(updateGlobals("token", token))
    dispatch(updateGlobals("catId", catName));
    dispatch(updateGlobals("catName", catName));
    dispatch(updateGlobals("loading", false));
    dispatch(updateDefaults(data));
  };
};

export const setProduct = (designId) => {
  return async (dispatch) => {
    const res = await axiosInstance.get(`/custom/getDesign/${designId}`)
    const obj = res.data.data
    const { data } = await axiosInstance.get(`/custom/get-properties?code=${obj.categoryCode}`)

    dispatch(replaceMaterials(obj.materials));
    dispatch(replaceStyles(obj.styles));
    dispatch(replaceColors(obj.colors));
    dispatch(replaceDesigns(obj.designs));
    dispatch(replaceSizes(obj.sizes));
    dispatch(replaceAdvance(obj.advance));
    dispatch(replaceJackets(obj.jackets));
    dispatch(updateGlobals("design", {
      update: true,
      productId: obj.categoryCode,
      designItemKey: designId
    }));

    // A saved design stores whatever catName was at the time — which, before
    // config/categoryKeys existed, was the category's display name. Resolve it
    // the same way a fresh load does, so a design saved under an old name
    // still opens as the right jacket.
    const catName = categoryKey(obj.globals?.catName, obj.categoryCode);

    if (catName === "Bomber Jackets") {
      dispatch(updateGlobals("bomber", true));

    } else if (catName === "Hoodies") {
      dispatch(updateGlobals("hoodies", true));

    } else if (catName === "Coach Jackets") {
      dispatch(updateGlobals("coach", true));

    }

    dispatch(updateGlobals("productId", obj.categoryCode));
    // dispatch(updateGlobals("token", token))
    dispatch(updateGlobals("catId", catName));
    dispatch(updateGlobals("catName", catName));
    dispatch(updateGlobals("loading", false));
    dispatch(updateDefaults(data));
  };
};

export const saveDesign = () => {
  return (dispatch, getState) => {
    const state = getState();

    let data = {
      action: "save_jacket",
      advance: JSON.stringify(state.advance),
      colors: JSON.stringify(state.colors),
      designs: JSON.stringify(state.designs),
      email: state.globals.email,
      recipient: state.globals.recipient,
      message: state.globals.message,
      globals: JSON.stringify(state.globals),
      jackets: JSON.stringify(state.jackets),
      materials: JSON.stringify(state.materials),
      sizes: JSON.stringify(state.sizes),
      styles: JSON.stringify(state.styles),
      productId: state.globals.productId,
      productType: state.globals.catName,
      uniqueUrl: Math.random().toString(36).substring(2),
    };

    // apiCall(data)
    //   .then((res) => {
    //     dispatch(modalState("save", false));
    //   })
    //   .catch((err) => console.log(err));
  };
};
