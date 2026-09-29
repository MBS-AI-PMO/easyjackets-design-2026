import React from "react";
import { connect } from "react-redux";

import Loader from "../loader";
import SelectBox from "../selectBox";
import { selectColor, updateGlobals } from "../../store/actions";

const PartsBase = ["Body", "Sleeves", "Pockets", "Inside Lining", "Knit Base"];
const PARTS = {
  Gifts: PartsBase,
  "Varsity Jackets": PartsBase,
  "Varsity Jacket": PartsBase,
  "ladies Varsity Jackets": PartsBase,
  "Bomber Jackets": PartsBase,
  "Bomber Jacket": PartsBase,
  Hoodies: ["Body", "Sleeves", "Pockets", "Knit Base", "Lace"],
  Hoodie: ["Body", "Sleeves", "Pockets", "Knit Base", "Lace"],
  "Coach Jackets": [
    "Body",
    "Sleeves",
    "Pockets",
    "Collar Color",
    "Inside Lining",
    "Lace",
  ],
  "Coach Jacket": [
    "Body",
    "Sleeves",
    "Pockets",
    "Collar Color",
    "Inside Lining",
    "Lace",
  ],
};

const Colors = ({
  globals,
  advance,
  defaults,
  styles,
  materials,
  updateGlobals,
  updateColor,
  color,
}) => {
  const { parts, colors } = defaults;
  let finalParts = [];

  // Filter the parts based on the category (like "Gifts", "Bomber Jackets", etc.)
  parts.map((part) => {
    if (PARTS[globals.catName]?.includes(part.name)) {
      finalParts.push(part);
    }
  });

  // Add advanced options for parts if applicable (stripes, piping, etc.)
  if (advance.stripes) {
    finalParts.splice(2, 0, parts.find((a) => a.name === "Sleeves Stripe"));
  }

  if (advance.piping || advance.sleevesPiping) {
    finalParts.splice(2, 0, parts.find((a) => a.name === "Shoulder & Pocket Piping"));
  }

  if (advance.inserts) {
    finalParts.push(parts.find((a) => a.name === "Shoulder Inserts"));
  }

  if (advance.inserts && advance.insertsCount === 2) {
    finalParts.push(parts.find((a) => a.name === "Shoulder Insert Upper"));
  }

  // Styles-specific part filtering
  if (styles.collar === "Roll Up") {
    finalParts.push(parts.find((a) => a.name === "Collar Inside"));
    finalParts.push(parts.find((a) => a.name === "Collar Outside"));
  }
  if (styles.collar === "Shirt Collar") {
    finalParts.push(parts.find((a) => a.name === "Collar Inside"));
    finalParts.push(parts.find((a) => a.name === "Collar Outside"));
  }
  if (styles.collar === "Hood" || styles.collar === "Zipper Hood") {
    finalParts.push(parts.find((a) => a.name === "Hood Inside"));
    finalParts.push(parts.find((a) => a.name === "Hood Outside"));
  }
  if (styles.collar === "Band") {
    finalParts.push(parts.find((a) => a.name === "Band"));
  }
  if (styles.closure === "Buttons" && globals.catName !== "Hoodies") {
    finalParts.push(parts.find((a) => a.name === "Buttons"));
  }
  if (styles.closure === "Zipper") {
    finalParts.push(parts.find((a) => a.name === "Zip"));
  }
  if (
    (styles.knit === "Single Line" ||
      styles.knit === "Double Line" ||
      styles.knit === "Single Line Border" ||
      styles.knit === "Double Line Border") &&
    globals.catName !== "Coach Jackets"
  ) {
    finalParts.push(parts.find((a) => a.name === "Knit Lines"));
  }
  if (styles.knit === "Single Line Border" || styles.knit === "Double Line Border") {
    finalParts.push(parts.find((a) => a.name === "Knit Border"));
  }

  // Sort parts by their id
  finalParts.sort((a, b) => a.id - b.id);
  const [currentTab, setCurrentTab] = React.useState(-1);
  const [isActive, setIsActive] = React.useState(false);
  // Color mapping based on materials and parts
  const zipColor = [
    { name: 'black', code: '#000000' },
    { name: 'metallic', code: '#777777' },
    { name: 'grey', code: '#cccccc' }
  ];

  const availableColorsForPart = (part, materials) => {
    // If colors for a specific part are available from the backend
    const partColors = colors.filter(color => {
      if (Array.isArray(color?.parts) && color.parts.length > 0) {
        return color?.parts?.includes(part.name);
      } else {
        return color;
      }
    });

    const filteredColors = partColors.filter((color) => {
      if (Array.isArray(color?.materials) && color.materials.length > 0) {
        return color?.materials?.includes(materials.body);
      } else {
        return color;
      }
    });

    if (filteredColors.length > 0) {
      return filteredColors;
    } else {
      // If no specific colors are available for the part, return all colors
      return part.name === 'Zip' ? zipColor : colors;
    }
  };

  const selectColorTab = (index, nick) => {
    if (index === currentTab && isActive) {
      // Clicking the already-open tab: close it
      setIsActive(false);
      setCurrentTab(-1);
      updateGlobals("3", "");
    } else {
      // Opening a new tab
      updateGlobals("3", nick);
      setCurrentTab(index);
      setIsActive(true);
    }
  };

  return (
    <>
      {finalParts.map((part, key) => {
        const selectedHex = color[part?.nick];
        const allColors = [...availableColorsForPart(part, materials), ...zipColor];
        const selectedColorName = selectedHex
          ? (allColors.find(c => c.code?.toLowerCase() === selectedHex?.toLowerCase())?.name || selectedHex)
          : null;

        return (
          <div key={key} className="control-panel-color">
            <div
              className={`control-box-color ${globals[3] === part?.nick && isActive ? "open" : "close"}`}
              onClick={() => selectColorTab(key, part?.nick)}
            >
              <span
                className="step-title"
                style={{ '--selected-color-label': selectedColorName ? `"${selectedColorName}"` : '"Please Select"' }}
              >
                <strong>{part?.name}</strong>
              </span>
              <svg height={15} width={15} viewBox="0 0 24 24" fill="#8089a2" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12H18M12 6V18" stroke="#8089a2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {isActive && currentTab === key && (
              <div className="cjd-accordin-wrapper">
                <div className="cjd-select-wrapper cjd-single cjd-colors-select">
                  {availableColorsForPart(part, materials).map(({ name, code }, index) => (
                    <div key={index}>
                      <SelectBox
                        type={part?.nick}
                        label={code}
                        tooltip={name}
                        current={colors.body}
                        colors={true}
                        dispatch={(type, label) => updateColor(type, label)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};


const mapStateToProps = (state) => ({
  defaults: state.defaults,
  globals: state.globals,
  advance: state.advance,
  styles: state.styles,
  color: state.colors,
  materials: state.materials,
});

const mapDispatchToProps = (dispatch) => ({
  updateColor: (key, val) => dispatch(selectColor(key, val)),
  updateGlobals: (key, val) => dispatch(updateGlobals(key, val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Colors);
