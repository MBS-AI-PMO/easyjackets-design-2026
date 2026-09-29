import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";

import SelectBox from "../selectBox";
import Fonts from "../dropdown";

import { designColor, chooseName } from "../../store/actions";
import { fixTextSize } from "../../utils";
import { getDesignAreaConfig, isWideDesignArea } from '../../config/designAreaConfig';

const Name = ({
  defaults,
  globals,
  part,
  designs,
  colors,
  materials,
  updateColor,
  updateName,
}) => {

  if (Object.keys(designs).length === 4) {
    designs = {
      ...designs, 'Front Center': {},

      'Right Chest': {},
      'Left Chest': {},

      // 'Right Chest Verticle': {},
      // 'Left Chest Verticle': {},

      'Right Sleeve': {},
      'Left Sleeve': {},

      'Right Sleeve End': {},
      'Left Sleeve End': {},

      'Right Pocket': {},
      'Left Pocket': {},

      'Back Top': {},
      'Back Middle': {},
      'Back Bottom': {}
    }
  }

  const svgText = useRef(null);
  const svgText1 = useRef(null);

  const hideNameApp = [
    "Front Center",
    "Back Top",
    "Back Middle",
    "Back Bottom",
  ];

  const [name, setName] = useState(designs[part]?.name?.title);
  const [view, setView] = useState(
    designs[part]?.name?.appearance || "Straight"
  );
  const [cPanel, setCpanel] = useState(false);
  const [colPart, setColPart] = useState("fill");

  // Get dynamic design area configuration based on the part
  const designConfig = getDesignAreaConfig(part);
  let props = {
    viewBox: designConfig.viewBox,
  };
  // Fitting must stay inside the preview arc's path length - a textPath silently drops
  // any glyphs past the end of its path, which both mangles the preview and makes the
  // measured width plateau, so a wider fit box here does not produce larger text.
  // Front Center now previews on the jacket's own arc, so the size fitted here is the
  // size the chest renders at - no scale factor on the jacket side.
  const getTextFitViewBox = (isArc = view === "Arc") => {
    if (part === "Back Top" && isArc) return "0 0 260 34";
    // Front Center arcs on a deep circle (see modalFrontArt below), so a fitted name is
    // far taller than the 45 unit panel and the height rule would stop the fit long
    // before the width does. The width is what actually decides how much of the chest
    // the name fills, so keep it at the real panel width and give height enough slack
    // to stay out of the way.
    if (part === "Front Center" && isArc) return "0 0 267 120";
    return props.viewBox;
  };

  // Arced text is centred on the path, so glyphs stick out above the apex and below the
  // ends of the curve. Front Center's panel is only 45 units tall, which leaves no room
  // for that overhang - render it with extra vertical headroom so the letters are not
  // sheared off. On the jacket arc a fitted name drops about 38 units from apex to ends,
  // so the glyphs run roughly y -12 to 75; -20 to 80 clears that. Growing the box costs
  // nothing but empty space - the viewBox *width* is what maps to the panel width, so
  // the letters keep their size and the preview simply gets taller.
  const renderViewBox =
    part === "Front Center" && view === "Arc" ? "0 -20 267 100" : props.viewBox;

  useEffect(() => {
    fixTextSize(svgText, svgText1, "name", getTextFitViewBox(), view === "Arc", name);
  }, [part, props.viewBox, view, name]);

  const nameFun = (val) => {
    if (
      part === "Left Sleeve" ||
      part === "Right Sleeve" ||
      part === "Left Sleeve End" ||
      part === "Right Sleeve End" ||
      part === "Right Mid Sleeve Upper" ||
      part === "Left Mid Sleeve Upper" ||
      part === "Right Mid Sleeve Lower" ||
      part === "Left Mid Sleeve Lower"
    ) {
      if (val.length <= 8) {
        setName(val);
        fixTextSize(
          svgText,
          svgText1,
          "name",
          getTextFitViewBox(),
          view === "Arc",
          val
        ).then((size) => {
          updateName("title", val, part, size);
        });
      }
      return;
    }
    if (val.length <= 12) {
      setName(val);
      fixTextSize(
        svgText,
        svgText1,
        "name",
        getTextFitViewBox(),
        view === "Arc",
        val
      ).then((size) => {
        updateName("title", val, part, size);
      });
    }
  };

  const viewFun = (val) => {
    setView(val);
    fixTextSize(
      svgText,
      svgText1,
      "name",
      getTextFitViewBox(val === "Arc"),
      val === "Arc",
      name
    ).then((size) => {
      updateName("appearance", val, part, size);
    });
  };

  const fontChange = () => {
    fixTextSize(
      svgText,
      svgText1,
      "name",
      getTextFitViewBox(),
      view === "Arc",
      name
    ).then((size) => {
      updateName("size", name, part, size);
    });
  };

  const viewCbox = (val) => {
    val === colPart && cPanel ? setCpanel(false) : setCpanel(true);
    setColPart(val);
  };


  return (
    <div className="cjd-modal-form-wrapper">
      <div className="cjd-row">
        <div className="cjd-modal-half">
          <div className="cjd-form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              value={name || ""}
              onChange={(e) => nameFun(e.target.value)}
              className="cjd-form-control"
              placeholder={
                part === "Left Sleeve" ||
                  part === "Right Sleeve" ||
                  part === "Left Sleeve End" ||
                  part === "Right Sleeve End" ||
                  part === "Right Mid Sleeve Upper" ||
                  part === "Left Mid Sleeve Upper" ||
                  part === "Right Mid Sleeve Lower" ||
                  part === "Left Mid Sleeve Lower"
                  ? "Write Name (Max 8 Char)"
                  : "Write Name (Max 12 Char)"
              }
            />
          </div>

          <div className="cjd-form-group">
            <label htmlFor="font">Select Font</label>
            <Fonts
              part={part}
              className="cjd-form-control"
              fixFont={() => fontChange()}
            />
          </div>

          {hideNameApp.includes(part) && (
            <div className="cjd-form-group cjd-btn-group">
              <label htmlFor="font">Appearance</label>
              <div
                className={`cjd-btn ${view === "Arc" && "cjd-btn-secondary"}`}
                onClick={() => viewFun("Straight")}
              >
                Straight
              </div>
              <div
                className={`cjd-btn ${view === "Straight" && "cjd-btn-secondary"
                  }`}
                onClick={() => viewFun("Arc")}
              >
                Arc
              </div>
            </div>
          )}
        </div>

        <div className="cjd-modal-half">
          <div
            className="cjd-mock-preview"
            data-square={
              part === 'Right Chest' ||
                part === 'Left Chest' ||
                part === 'Right Mid Sleeve Upper' ||
                part === 'Left Mid Sleeve Upper' ||
                part === 'Right Mid Sleeve Lower' ||
                part === 'Left Mid Sleeve Lower'
                ? 'true'
                : 'false'
            }
            data-pocket={
              part === 'Right Pocket' ||
                part === 'Left Pocket'
                ? 'true'
                : 'false'
            }
            data-wide={isWideDesignArea(part) ? 'true' : 'false'}
            style={{
              background:
                part === "Right Sleeve" ||
                  part === "Left Sleeve" ||
                  part === "Right Sleeve End" ||
                  part === "Left Sleeve End" ||
                  part === "Right Mid Sleeve Upper" ||
                  part === "Left Mid Sleeve Upper" ||
                  part === "Right Mid Sleeve Lower" ||
                  part === "Left Mid Sleeve Lower"
                  ? colors.sleeves
                  : colors.body,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="cjd-name-area"
              {...props}
              viewBox={renderViewBox}
            >
              {part === "Back Bottom" ? (
                <path
                  id="modalFrontArt"
                  d="M-90,190.9c26.2,25.9,62.2,41.9,102,41.9c39.8,0,75.8-16,102-41.9"
                  fill="none"
                  style={{ transform: "translate(83px, -182px)" }}
                />
              ) : part === "Back Top" ? (
                <path
                  id="modalFrontArt"
                  d="M30,31 C76,-2 184,-2 230,31"
                  fill="none"
                />
              ) : part === "Back Middle" ? (
                <path
                  id="modalFrontArt"
                  d="M18,118 C72,42 173,42 227,118"
                  fill="none"
                />
              ) : (
                /* Front Center: the jacket draws this name on #frontArt, a true circle of
                   radius 189.07 whose apex sits 13 units below the top of the 267x45 chest
                   panel. This is that same circle expressed in panel-local coordinates
                   (the jacket path shifted by its net translate of 12,6 minus the panel
                   origin 124.32,152), so the preview curves the letters exactly the way the
                   chest does. The old cubic was flat across the middle and folded all of its
                   curvature into the last glyph or two, which is why the end letters splayed
                   in the preview but rotated evenly on the jacket. Running well past the
                   panel on both sides is deliberate: a textPath silently drops glyphs that
                   overflow its path, and the path is invisible anyway. */
                <path
                  id="modalFrontArt"
                  d="M-55.301,202.069c0-104.42,84.649-189.07,189.069-189.07s189.069,84.649,189.069,189.07"
                  fill="none"
                ></path>
              )}

              {part === "Left Sleeve" || part === "Right Sleeve" ? (
                <>
                  <text
                    x="50%"
                    y="50%"
                    dy={name?.length > 8 ? "-1.25rem" : ""}
                    fontFamily={designs.font}
                    fill={designs.fill}
                    stroke={designs.stroke}
                    strokeWidth="2"
                    style={{ paintOrder: "stroke fill" }}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    total_char={name?.length || 0}
                    ref={svgText}
                  >
                    <tspan alignmentBaseline="middle">
                      {name?.substr(0, 8)}
                    </tspan>
                  </text>
                  <text
                    x="50%"
                    y="50%"
                    dy="1.0rem"
                    fontFamily={designs.font}
                    fill={designs.fill}
                    stroke={designs.stroke}
                    strokeWidth="2"
                    style={{ paintOrder: "stroke fill" }}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    total_char={name?.length || 0}
                    ref={svgText1}
                  >
                    <tspan alignmentBaseline="hanging">{name?.substr(8)}</tspan>
                  </text>
                </>
              ) : (
                <text
                  x={view === "Arc" ? "0" : "50%"}
                  y={view === "Arc" ? "0" : "50%"}
                  fontFamily={designs.font}
                  fill={designs.fill}
                  stroke={
                    part === "Front Center" ||
                      part === "Back Middle" ||
                      part === "Back Top" ||
                      part === "Back Bottom" ||
                      part === "Right Sleeve" ||
                      part === "Right Sleeve End" ||
                      part === "Left Sleeve" ||
                      part === "Left Sleeve End" ||
                      part === "Right Mid Sleeve Upper" ||
                      part === "Left Mid Sleeve Upper" ||
                      part === "Right Mid Sleeve Lower" ||
                      part === "Left Mid Sleeve Lower" ||
                      part === "Right Chest" ||
                      part === "Left Chest" ||
                      part === "Right Pocket" ||
                      part === "Left Pocket"
                      ? designs.stroke
                      : "none"
                  }
                  borderColor={
                    part === 'Front Center' ||
                      part === 'Back Middle'
                      ? designs.border
                      : 'none'
                  }

                  strokeWidth={
                    part === "Front Center" || part === "Back Middle"
                      ? "5.5"
                      : "2"
                  }
                  style={{ paintOrder: "stroke fill" }}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  total_char={name?.length + 1 || 0}
                  ref={svgText}
                >
                  {view === "Arc" ? (
                    <textPath
                      alignmentBaseline="middle"
                      xlinkHref="#modalFrontArt"
                      startOffset="50%"
                      style={{
                        letterSpacing: part === "Front Center" ? "1px" : "5px",
                      }}
                    >
                      {name}
                    </textPath>
                  ) : (
                    <tspan alignmentBaseline="middle">{name}</tspan>
                  )}
                </text>
              )}
            </svg>
          </div>

          <div
            className="cjd-preview-colors-wrapper cjd-multiple"
            data-color="pink"
            data-square={
              part === 'Right Chest' ||
                part === 'Left Chest' ||
                part === 'Right Mid Sleeve Upper' ||
                part === 'Left Mid Sleeve Upper' ||
                part === 'Right Mid Sleeve Lower' ||
                part === 'Left Mid Sleeve Lower'
                ? 'true'
                : 'false'
            }
            data-pocket={
              part === 'Right Pocket' ||
                part === 'Left Pocket'
                ? 'true'
                : 'false'
            }
            data-wide={isWideDesignArea(part) ? 'true' : 'false'}
          >
            <div
              className="cjd-color-selector"
              onClick={() => viewCbox("fill")}
            >
              <div
                className="cjd-color-pointer"
                style={{ backgroundColor: designs.fill }}
              ></div>
              <span>Fill</span>
            </div>

            <div
              className="cjd-color-selector"
              onClick={() => viewCbox("stroke")}
            >
              <div
                className="cjd-color-pointer"
                style={{ backgroundColor: designs.stroke }}
              ></div>
              <span>Stroke</span>
            </div>

            {cPanel && (
              <div className="cjd-color-box">
                <label className="cjd-note">
                  <span>Select {colPart} Color</span>
                  <div
                    className="cjd-close-color-box"
                    onClick={() => setCpanel(false)}
                  >
                    {" "}
                    ×{" "}
                  </div>
                </label>

                <div className="cjd-colors-list">
                  <div className="cjd-select-wrapper cjd-single">

                    {defaults.colors.map(({ name, code }, key) => {
                      // const check = JSON.parse(mid);
                      // if (check.includes(materials.body)) {
                      return (
                        <SelectBox
                          key={key}
                          type={colPart}
                          label={code}
                          tooltip={name}
                          current={designs[colPart]}
                          colors={true}
                          dispatch={(type, label) => updateColor(type, label)}
                        />
                      );
                      // } else {
                      //   return null;
                      // }
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  defaults: state.defaults,
  globals: state.globals,
  designs: state.designs,
  colors: state.colors,
  materials: state.materials,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateColor: (key, val) => dispatch(designColor(key, val)),
  updateName: (key, val, part, font, tab = "name") =>
    dispatch(chooseName(key, val, part, font, tab)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Name);
