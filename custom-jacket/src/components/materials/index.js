import React from "react";
import { connect } from "react-redux";

import Accordion from "../accordion/index.js";
import SelectBox from "../selectBox/index.js";
//import { Select2 } from "select2-react-component";

import { Select2, getFilteredData } from "../select2Component/select2.tsx";

import { rspace } from "../../utils/index.js";
import {
  selectMaterial,
  selectMaterialSleeves,
  selectStyle,
  advanceOption,
} from "../../store/actions/index.js";

const MATERIAL_LABEL_OVERRIDES = {
  "Synthatic Leather": "Faux Leather",
  "Synthetic Leather": "Faux Leather",
};

const SLEEVE_MATERIAL_ORDER = ["Melton Wool", "Cowhide Leather", "Sheep Leather", "Faux Leather"];

const getMaterialLabel = (item) =>
  MATERIAL_LABEL_OVERRIDES[item.label] || item.label || MATERIAL_LABEL_OVERRIDES[item.name] || item.name || "";

const sortSleeveMaterials = (array) =>
  [...array].sort((a, b) => {
    const aLabel = getMaterialLabel(a);
    const bLabel = getMaterialLabel(b);
    const aIndex = SLEEVE_MATERIAL_ORDER.indexOf(aLabel);
    const bIndex = SLEEVE_MATERIAL_ORDER.indexOf(bLabel);

    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? SLEEVE_MATERIAL_ORDER.length : aIndex) -
        (bIndex === -1 ? SLEEVE_MATERIAL_ORDER.length : bIndex);
    }

    return aLabel.localeCompare(bLabel);
  });

const replaceKeyName = (array) => {
  return array.map((item) => {
    const { name, label, ...rest } = item;
    return { label: getMaterialLabel(item), value: name, ...rest };
  });
};

const Materials = ({
  defaults,
  globals,
  materials,
  styles,
  advance,
  updateMaterial,
  updateMaterialSleeves,
  updateStyle,
  updateAdvanceOption,
  dispatch,
}) => {

  const filteredMaterials = () => {
    if (globals.catName === "Hoodies") {
      return defaults.materials.filter(
        (item) => item.name === "Soft Shell" || item.name === "Cotton Fleece"
      );
    } else if (globals.catName === "Coach Jackets") {
      return defaults.materials.filter(
        (item) => item.name === "Soft Shell" || item.name === "Nylon"
      );
    } else if (globals.catName === "Varsity Jackets") {
      return defaults.materials.filter(
        (item) => item.name !== "Taslan Fabirc" && item.name !== "Taffeta"
      );
    } else {
      return defaults.materials;
    }
  };

  let transformedMaterialBodyArray = replaceKeyName(
    filteredMaterials().filter((item) => item.body === "on")
  );

  if (globals.productId?.toString() === "5893") {
    const melton = transformedMaterialBodyArray.find((item) => item.value === "Melton Wool");
    const cowhide = transformedMaterialBodyArray.find((item) => item.value === "Cowhide Leather");
    const others = transformedMaterialBodyArray.filter(
      (item) => item.value !== "Melton Wool" && item.value !== "Cowhide Leather"
    );

    transformedMaterialBodyArray = [
      ...(melton ? [melton] : []),
      ...(cowhide ? [cowhide] : []),
      ...others,
    ];
  }

  const transformedMaterialSleeveArray = replaceKeyName(
    sortSleeveMaterials(
      defaults.materials.filter(
        (item) => ((Array.isArray(item["mat-parent"]) ? item["mat-parent"].includes(materials.body) : materials.body === item["mat-parent"]) && item.sleeves === "on") || materials.body === item.name
      )
    )
  );

  const collarList = [
    { name: "Classic" },
    { name: "Overlap" },
    { name: "Shirt Collar" },
    { name: "Hood" },
    { name: "Zipper Hood" },
    { name: "Band" },
  ];

  const getFilteredCollarData = (array) => {
    if (globals.catName === "Coach Jackets") {
      return array.filter(
        (item) => item.name === "Shirt Collar" || item.name === "Hood"
      );
    }
    if (String(globals.productId).trim() === "4893") {
      return array.filter((item) => item.name !== "Zipper Hood");
    } else {
      return array;
    }
  };

  const transformedStylesCollarArray = replaceKeyName(
    getFilteredCollarData(collarList)
  );

  const pocketList = [
    { name: "Slash Pocket" },
    { name: "Welt Pocket" },
    { name: "Flap Pocket" },
    { name: "Snap Pocket" },
    { name: "Straight Pocket" },
    { name: "Zipper Pocket" },
  ];

  const coachPocketList = [
    { name: "Slash Pocket" },
    { name: "Snap Pocket", label: "Flap Pocket" },
  ];

  const transformedStylesPocketArray = replaceKeyName(globals.coach ? coachPocketList : pocketList);

  const liningList = [{ name: "Quilt" }, { name: "Satin" }, { name: "Cotton" }];

  const transformedStylesLiningArray = replaceKeyName(liningList);

  return (
    <>
      <Accordion>
        <div
          parent={0}
          label="Body Material"
          isOpen={globals[0] === "Body Material"}
        >
          {/* <div className="cjd-select-wrapper "> */}
          <label className="select-label">Body Material</label>
          <Select2
            data={transformedMaterialBodyArray}
            value={materials.body}
            open={(e) => console.log("Open", e)}
            update={(value) => updateMaterial("body", value)}
            isOpen={globals[0] === "Body Material"}
            minCountForSearch={Infinity}
          ></Select2>

          <label className="select-label">Sleeves Material</label>
          <Select2
            data={transformedMaterialSleeveArray}
            value={materials.sleeves}
            open={(e) => console.log("Open", e)}
            update={(value) => updateMaterialSleeves("sleeves", value)}
            isOpen={globals[0] === "Sleeve Material"}
            minCountForSearch={Infinity}
          ></Select2>

          <label className="select-label">Sleeves Style</label>
          <div
            className=""
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              data-style="Set-In"
              class={`control-panel-btn ${styles.sleeves === "Set-In" && "active"
                }`}
              onClick={() => updateStyle("sleeves", "Set-In")}
            >
              Set-In
            </button>
            <button
              data-style="Raglan"
              class={`control-panel-btn ${styles.sleeves === "Raglan" && "active"
                }`}
              onClick={() => updateStyle("sleeves", "Raglan")}
            >
              Raglan
            </button>
          </div>
          {globals.catName !== "Hoodies" && (
            <>
              <label className="select-label">Collar Style</label>
              <Select2
                data={transformedStylesCollarArray}
                value={styles.collar}
                open={(e) => console.log("Open", e)}
                update={(value) => updateStyle("collar", value)}
                isOpen={globals[1] === "Collar Type"}
                minCountForSearch={Infinity}
              ></Select2>
            </>
          )}

          {globals.catName !== "Hoodies" && (
            <>
              <label className="select-label">Pocket Style</label>
              <Select2
                data={transformedStylesPocketArray}
                value={styles.pocket}
                open={(e) => console.log("Open", e)}
                update={(value) => updateStyle("pocket", value)}
                minCountForSearch={Infinity}
              ></Select2>
              {globals.coach && (globals.productId === 6046 || globals.productId === "6046") && (
                <div style={{ marginTop: "20px" }}>
                  <label className="select-label">Add Extra Sleeve Patches</label>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                      className={`control-panel-btn ${advance.extraSleevePatches && "active"}`}
                      onClick={() => updateAdvanceOption("extraSleevePatches", true)}
                    >
                      Yes
                    </button>
                    <button
                      className={`control-panel-btn ${!advance.extraSleevePatches && "active"}`}
                      onClick={() => updateAdvanceOption("extraSleevePatches", false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </>
          )}


          {globals.catName !== "Bomber Jackets" && globals.catName !== "Hoodies" && globals.catName !== "Coach Jackets" && (
            <>
              <label className="select-label">Knit Style</label>
              <div
                parent={1}
                label="Knit / Trim"
                isOpen={globals[1] === "Knit / Trim"}
              >
                <div className="cjd-select-wrapper cjd-single">
                  <SelectBox
                    type={"knit"}
                    label={"Plain"}
                    current={styles.knit}
                    style={true}
                    dispatch={(type, label) => updateStyle(type, label)}
                  />

                  <SelectBox
                    type={"knit"}
                    label={"Single Line"}
                    current={styles.knit}
                    className={"cjd-sl"}
                    style={true}
                    dispatch={(type, label) => updateStyle(type, label)}
                  />

                  <SelectBox
                    type={"knit"}
                    label={"Single Line Border"}
                    current={styles.knit}
                    className={"cjd-slb"}
                    style={true}
                    dispatch={(type, label) => updateStyle(type, label)}
                  />

                  <SelectBox
                    type={"knit"}
                    label={"Double Line"}
                    current={styles.knit}
                    className={"cjd-dl"}
                    style={true}
                    dispatch={(type, label) => updateStyle(type, label)}
                  />

                  <SelectBox
                    type={"knit"}
                    label={"Double Line Border"}
                    current={styles.knit}
                    className={"cjd-dlb"}
                    style={true}
                    dispatch={(type, label) => updateStyle(type, label)}
                  />
                </div>
              </div>
            </>
          )}

          {globals.catName !== "Coach Jackets" &&
            globals.catName !== "Bomber Jackets" && (
              <>
                <label className="select-label">Front Closure</label>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    data-style="Buttons"
                    class={`control-panel-btn ${styles.closure === "Buttons" && "active"
                      }`}
                    onClick={() => updateStyle("closure", "Buttons")}
                  >
                    {globals.catName === "Hoodies" ? "Pull Over" : "Buttons"}
                  </button>
                  <button
                    data-style="Zipper"
                    class={`control-panel-btn ${styles.closure === "Zipper" && "active"
                      }`}
                    onClick={() => updateStyle("closure", "Zipper")}
                  >
                    Zipper
                  </button>
                </div>
                {styles.closure === 'Buttons' && globals.catName !== "Hoodies" && (
                  <>
                    <label className="select-label" style={{ marginTop: "10px" }}>Add flap(zip + buttons)</label>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <button
                        data-style="flap-on"
                        class={`control-panel-btn ${styles.flap && "active"}`}
                        onClick={() => updateStyle("flap", true)}
                      >
                        Yes
                      </button>
                      <button
                        data-style="flap-off"
                        class={`control-panel-btn ${!styles.flap && "active"}`}
                        onClick={() => updateStyle("flap", false)}
                      >
                        No
                      </button>
                    </div>
                  </>
                )
                }
              </>
            )}


          {globals.catName === "Hoodies" ||
            globals.catName === "Coach Jackets" ? (
            <></>
          ) : (
            <>
              <label className="select-label">Inside Lining</label>
              <Select2
                data={transformedStylesLiningArray}
                value={styles.lining}
                open={(e) => console.log("Open", e)}
                update={(value) => updateStyle("lining", value)}
                isOpen={globals[1] === "Lining"}
                minCountForSearch={Infinity}
              ></Select2>
            </>
          )}
          {
            globals.catName === "Varsity Jackets" &&
            (
              <>
                <input type="checkbox" id="zip" name="zipoutlining" value="Bike" />
                <label for="zipoutlining" className="select-label" style={{ display: "inline" }}>Add 1/2 zipout lining</label>
              </>
            )}
          {/* {defaults.materials.map((val) => {
            if (val.body === 'on') {
              if (
                (val.name === 'Nylon' ||
                  val.name === 'Soft Shell' ||
                  val.name === 'Taslan Fabirc') &&
                globals.coach
              ) {
                return (
                  <SelectBox
                    key={val.id}
                    type={'body'}
                    label={val.name}
                    current={materials.body}
                    material={true}
                    className={`cjd-mat cjd-${rspace(val.name)} cjd-material-box`}
                    dispatch={(type, label, sel) => updateMaterial(type, label)}
                  />
                );
              } else if (
                val.name !== 'Nylon' &&
                val.name !== 'Soft Shell' &&
                val.name !== 'Taslan Fabirc' &&
                globals.coach === false
              ) {
                return (
                  <SelectBox
                    key={val.id}
                    type={'body'}
                    label={val.name}
                    current={materials.body}
                    material={true}
                    className={`cjd-mat cjd-${rspace(val.name)} cjd-material-box`}
                    dispatch={(type, label, sel) => updateMaterial(type, label)}
                  />
                  
                );
              }
            } else {
              return true;
            }
          })} */}
          {/* </div> */}
        </div>
        {/* <div
        parent={0}
        label="Sleeve Material"
        isOpen={globals[0] === 'Sleeve Material'}
      >
        <div className="cjd-select-wrapper">
          {defaults.materials.map((val) => {
            if (materials.body === val['mat-parent'] && val.sleeves === 'on') {
              return (
                <SelectBox
                  key={val.id}
                  type={'sleeves'}
                  label={val.name}
                  current={materials.sleeves}
                  material={true}
                  className={`cjd-mat cjd-${rspace(val.name)} cjd-material-box`}
                  dispatch={(type, label, sel) => updateMaterial(type, label)}
                />
              );
            } else {
              if (materials.body === val.name) {
                return (
                  <SelectBox
                    key={val.id}
                    type={'sleeves'}
                    label={val.name}
                    current={materials.sleeves}
                    material={true}
                    className={`cjd-mat cjd-${rspace(val.name)} cjd-material-box`}
                    dispatch={(type, label, sel) => updateMaterial(type, label)}
                  />
                );
              } else {
                return true;
              }
            }
          })}
        </div>
      </div> */}
      </Accordion>
    </>
  );
};

const mapStateToProps = (state) => ({
  defaults: state.defaults,
  globals: state.globals,
  materials: state.materials,
  styles: state.styles,
  advance: state.advance,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateMaterial: (key, val) => dispatch(selectMaterial(key, val)),
  updateMaterialSleeves: (key, val) =>
    dispatch(selectMaterialSleeves(key, val)),
  updateStyle: (key, val) => dispatch(selectStyle(key, val)),
  updateAdvanceOption: (key, val) => dispatch(advanceOption(key, val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Materials);
