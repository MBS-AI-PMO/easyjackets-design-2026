import React, { useState, useRef, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import SelectBox from '../selectBox';
import Fonts from '../dropdown';

import { designColor, chooseName, updateType } from '../../store/actions';
import { BODY_COLORS, fixTextSize, getStaggeredElm, getColorName } from '../../utils';
import { ROOKIE, ROOKIEJNL, BALLPARK, UNKNOWN } from '../../utils/fonts';
import { getDesignAreaConfig, isWideDesignArea } from '../../config/designAreaConfig';

const Letters = ({
  globals,
  part,
  designs,
  colors,
  defaults,
  updateColor,
  updateName,
}) => {
  const svgText = createRef(null);
  const svgText1 = useRef(null);
  const [name, setName] = useState(designs[part]?.letters?.title);
  const [view, setView] = useState(
    designs[part]?.letters?.appearance || 'Straight'
  );
  const [treatment, setTreatment] = useState(designs[part]?.letters?.treatment);
  const [alphabet, setAlphabets] = useState(designs[part]?.letters?.path);
  const [cPanel, setCpanel] = useState(false);
  const [colPart, setColPart] = useState('fill');
  const [selectedItem, setSelectedItem] = useState(null);

  let defaultType = 'Ready To Use';
  if (
    designs[part]?.letters?.type === 'Type Your Own' ||
    part === 'Left Sleeve End' ||
    part === 'Right Sleeve End' ||
    part === 'Left Mid Sleeve Upper' ||
    part === 'Right Mid Sleeve Upper' ||
    part === 'Right Chest Verticle' ||
    part === 'Left Chest Verticle'
  ) {
    defaultType = 'Type Your Own';
  }
  const [type, setType] = useState(defaultType);

  // Get the design area configuration for this part
  const designConfig = getDesignAreaConfig(part);
  let props = {
    viewBox: designConfig.viewBox,
  };

  useEffect(() => {
    if (type === 'Type Your Own')
      fixTextSize(svgText, svgText1, 'letters', props.viewBox);

    // Initialize selection highlight on mount by matching the SVG path
    if (type === 'Ready To Use' && alphabet && !selectedItem) {
      const fonts = { ROOKIE, ROOKIEJNL, BALLPARK, UNKNOWN };
      for (const [fontType, list] of Object.entries(fonts)) {
        // This is a bit expensive but runs only once on mount/alphabet change
        const idx = list.findIndex(Comp => {
          // We search for a similar SVG structure or just trust the latest click
          return false; // For now, we'll rely on the user clicking at least once
        });
        if (idx !== -1) {
          setSelectedItem({ index: idx, fontType });
          break;
        }
      }
    }

    setType(type);
  }, [svgText, type, props.viewBox, alphabet, selectedItem]);

  const nameFun = (val) => {
    let limit = 4;
    if (part === 'Right Chest Verticle' || part === 'Left Chest Verticle') {
      limit = 3;
    }
    if (val.length <= limit && type === 'Type Your Own') {
      fixTextSize(svgText, svgText1, 'letters', props.viewBox).then((size) => {
        updateName('title', val, part, size);
      });
      setName(val);
    }
  };

  const updateFont = () => {
    fixTextSize(svgText, svgText1, 'letters', props.viewBox).then((size) => {
      updateName('title', name, part, size);
    });
  };

  const viewFun = (val) => {
    setView(val);
    fixTextSize(svgText, svgText1, 'letters', props.viewBox).then((size) => {
      updateName('appearance', val, part, size);
    });
  };

  const treatmentFun = (bol) => {
    setTreatment(bol);
    updateName('treatment', bol, part);
  };

  const typeFun = (val) => {
    setType(val);
    updateName('type', val, part);
  };

  const viewCbox = (val) => {
    val === colPart && cPanel ? setCpanel(false) : setCpanel(true);
    setColPart(val);
  };

  const chooseFont = (e, index, fontType) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedItem({ index, fontType });

    let svg = e.currentTarget.innerHTML;

    if (part === 'Left Pocket' || part === 'Right Pocket')
      svg = svg.replace('<svg', '<svg width="44" height="44"');
    else svg = svg.replace('<svg', '<svg width="73" height="82"');

    setAlphabets(svg);
    updateName('path', svg, part);
  };

  return (
    <div className="cjd-modal-form-wrapper">
      <div className="cjd-row">
        <div className="cjd-modal-half">
          {
            // part !== 'Right Sleeve' &&
            //   part !== 'Left Sleeve' &&
            //   part !== 'Right Sleeve End' &&
            //   part !== 'Left Sleeve End' &&
            part !== 'Right Chest Verticle' &&
            part !== 'Left Chest Verticle' && (
              <div className="cjd-form-group cjd-btn-group">
                <div
                  className={`cjd-btn ${type === 'Type Your Own' && 'cjd-btn-secondary'
                    }`}
                  onClick={() => typeFun('Ready To Use')}
                >
                  Ready To Use
                </div>
                <div
                  className={`cjd-btn ${type === 'Ready To Use' && 'cjd-btn-secondary'
                    }`}
                  onClick={() => typeFun('Type Your Own')}
                >
                  Type Your Own
                </div>
              </div>
            )}

          {type === 'Ready To Use' &&
            // part !== 'Right Sleeve' &&
            // part !== 'Left Sleeve' &&
            // part !== 'Right Sleeve End' &&
            // part !== 'Left Sleeve End' &&
            part !== 'Right Chest Verticle' &&
            part !== 'Left Chest Verticle' && (
              <div className="cjd-rtu-wrapper">
                <div className="cjd-form-group cjd-btn-group">
                  <label htmlFor="font">Treatment</label>
                  <div
                    className={`cjd-btn ${treatment && 'cjd-btn-secondary'}`}
                    onClick={() => treatmentFun(false)}
                  >
                    Felt Patches
                  </div>
                  <div
                    className={`cjd-btn ${!treatment && 'cjd-btn-secondary'}`}
                    onClick={() => treatmentFun(true)}
                  >
                    Embroidery Patch
                  </div>
                </div>

                <div className="cjd-alphabets-wrapper">
                  <div className="cjd-font-option">
                    {ROOKIE.map((alpha, index) => {
                      const LETTER = alpha;
                      const isActive = selectedItem?.index === index && selectedItem?.fontType === 'ROOKIE';
                      return (
                        <span
                          key={index}
                          className={`cjd-letter-wrapper ${isActive ? 'cjd-active' : ''} ${index === 22 && 'cjd-letter-width'
                            }`}
                          onClick={(e) => chooseFont(e, index, 'ROOKIE')}
                        >
                          {' '}
                          <LETTER />{' '}
                        </span>
                      );
                    })}
                  </div>

                  <div className="cjd-font-option">
                    {ROOKIEJNL.map((alpha, index) => {
                      const LETTER = alpha;
                      const isActive = selectedItem?.index === index && selectedItem?.fontType === 'ROOKIEJNL';
                      return (
                        <span
                          key={index}
                          className={`cjd-letter-wrapper ${isActive ? 'cjd-active' : ''} ${index === 22 && 'cjd-letter-width'
                            }`}
                          onClick={(e) => chooseFont(e, index, 'ROOKIEJNL')}
                        >
                          {' '}
                          <LETTER />{' '}
                        </span>
                      );
                    })}
                  </div>

                  <div className="cjd-font-option">
                    {BALLPARK.map((alpha, index) => {
                      const LETTER = alpha;
                      const isActive = selectedItem?.index === index && selectedItem?.fontType === 'BALLPARK';
                      return (
                        <span
                          key={index}
                          className={`cjd-letter-wrapper ${isActive ? 'cjd-active' : ''} ${index === 22 && 'cjd-letter-width'
                            }`}
                          onClick={(e) => chooseFont(e, index, 'BALLPARK')}
                        >
                          {' '}
                          <LETTER />{' '}
                        </span>
                      );
                    })}
                  </div>

                  <div className="cjd-font-option">
                    {UNKNOWN.map((alpha, index) => {
                      const LETTER = alpha;
                      const isActive = selectedItem?.index === index && selectedItem?.fontType === 'UNKNOWN';
                      return (
                        <span
                          key={index}
                          className={`cjd-letter-wrapper ${isActive ? 'cjd-active' : ''} ${index === 22 && 'cjd-letter-width'
                            }`}
                          onClick={(e) => chooseFont(e, index, 'UNKNOWN')}
                        >
                          {' '}
                          <LETTER />{' '}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {type === 'Type Your Own' && (
            <>
              <div className="cjd-form-group">
                <input
                  type="text"
                  value={name || ''}
                  placeholder={`Max ${part === 'Right Chest Verticle' || part === 'Left Chest Verticle' ? '3' : '4'} Characters`}
                  onChange={(e) => nameFun(e.target.value)}
                  className="cjd-form-control"
                />
              </div>

              {part !== 'Right Chest Verticle' &&
                part !== 'Left Chest Verticle' && (
                  <div className="cjd-form-group">
                    <label htmlFor="font">Select Font</label>
                    <Fonts
                      part={part}
                      className="cjd-form-control"
                      fixFont={() => updateFont()}
                    />
                  </div>
                )}

              {part !== 'Right Chest Verticle' &&
                part !== 'Left Chest Verticle' && (
                  <div className="cjd-form-group cjd-btn-group">
                    <label htmlFor="font">Treatment</label>
                    <div
                      className={`cjd-btn ${treatment && 'cjd-btn-secondary'}`}
                      onClick={() => treatmentFun(false)}
                    >
                      Felt Patches
                    </div>
                    <div
                      className={`cjd-btn ${!treatment && 'cjd-btn-secondary'}`}
                      onClick={() => treatmentFun(true)}
                    >
                      Embroidery Patch
                    </div>
                  </div>
                )}

              {part !== 'Left Pocket' &&
                part !== 'Right Pocket' &&
                part !== 'Left Sleeve' &&
                part !== 'Right Sleeve' &&
                part !== 'Left Sleeve End' &&
                part !== 'Right Sleeve End' &&
                part !== 'Right Chest Verticle' &&
                part !== 'Left Chest Verticle' && (
                  <div className="cjd-form-group cjd-btn-group">
                    <label htmlFor="font">Appearance</label>
                    <div
                      className={`cjd-btn ${view === 'Staggered' && 'cjd-btn-secondary'
                        }`}
                      onClick={() => viewFun('Straight')}
                    >
                      Straight
                    </div>

                    <div
                      className={`cjd-btn ${view === 'Straight' && 'cjd-btn-secondary'
                        }`}
                      onClick={() => viewFun('Staggered')}
                    >
                      Staggered
                    </div>
                  </div>
                )}
            </>
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
                part === 'Right Sleeve' ||
                  part === 'Left Sleeve' ||
                  part === 'Right Sleeve End' ||
                  part === 'Left Sleeve End' ||
                  part === 'Right Mid Sleeve Upper' ||
                  part === 'Left Mid Sleeve Upper' ||
                  part === 'Right Mid Sleeve Lower' ||
                  part === 'Left Mid Sleeve Lower'
                  ? colors.sleeves
                  : colors.body,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="cjd-name-area"
              {...props}
            >
              {type === 'Type Your Own' && (
                <>
                  <text
                    x="50%"
                    y="50%"
                    fontFamily={
                      part === 'Right Chest Verticle' ||
                        part === 'Left Chest Verticle'
                        ? 'Geek'
                        : designs.font
                    }
                    fill="none"
                    fontSize={
                      designs[part]?.letters?.size
                      || '100.25px'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="8"
                    stroke={designs.border}
                    style={{ paintOrder: "stroke fill" }}
                    total_char={name?.length || 0}
                    ref={svgText}
                  >
                    {designs[part]?.letters?.appearance === 'Staggered'
                      ? getStaggeredElm(name)
                      : name}
                  </text>

                  <text
                    x="50%"
                    y="50%"
                    fontFamily={
                      part === 'Right Chest Verticle' ||
                        part === 'Left Chest Verticle'
                        ? 'Geek'
                        : designs.font
                    }
                    fill={designs.fill}
                    fontSize={designs[part]?.letters?.size || '100.25px'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="4"
                    stroke={designs.stroke}
                    style={{ paintOrder: "stroke fill" }}
                    ref={svgText1}
                  >
                    {designs[part]?.letters?.appearance === 'Staggered'
                      ? getStaggeredElm(name)
                      : name}
                  </text>
                </>
              )}

              {type === 'Ready To Use' && alphabet && (
                <svg
                  preserveAspectRatio="xMidYMid meet"
                  viewBox={alphabet.match(/viewBox="(.*?)"/)[1]}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {alphabet.match(/(<path.*?><\/path>)/g).map((li, idx) => {
                    const pClass = li.match(/class="(.*?)"/)[1];
                    const pShape = li.match(/d="(.*?)"/)[1];
                    let color;

                    if (pClass === 'cjd-fill') {
                      color = designs.fill || '#fff';
                    } else if (pClass === 'cjd-stroke') {
                      color = designs.stroke || '#8089a2';
                    } else {
                      color = designs.border || '#525a6f';
                    }
                    return <path key={idx} d={pShape} fill={color}></path>;
                  })}
                </svg>
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
              onClick={() => viewCbox('fill')}
            >
              <div
                className="cjd-color-pointer"
                style={{ backgroundColor: designs.fill }}
              ></div>
              <span>Fill</span>
            </div>

            <div
              className="cjd-color-selector"
              onClick={() => viewCbox('stroke')}
            >
              <div
                className="cjd-color-pointer"
                style={{ backgroundColor: designs.stroke }}
              ></div>
              <span>Stroke</span>
            </div>

            <div
              className="cjd-color-selector"
              onClick={() => viewCbox('border')}
            >
              <div
                className="cjd-color-pointer"
                style={{ backgroundColor: designs.border }}
              ></div>
              <span>Border</span>
            </div>

            {cPanel && (
              <div className="cjd-color-box">
                <label className="cjd-note">
                  <span>Select {colPart} Color</span>
                  <div
                    className="cjd-close-color-box"
                    onClick={() => setCpanel(false)}
                  >
                    {' '}
                    ×{' '}
                  </div>
                </label>

                <div className="cjd-colors-list">
                  <div className="cjd-select-wrapper cjd-single">

                    {BODY_COLORS.map((col, key) => {
                      const colorName = getColorName(col, defaults.colors);
                      return (
                        <SelectBox
                          key={key}
                          type={colPart}
                          label={col}
                          tooltip={colorName}
                          current={designs[colPart]}
                          colors={true}
                          dispatch={(type, label) => updateColor(type, label)}
                        />
                      );
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
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateType: (part, sec, key, val) =>
    dispatch(updateType(part, sec, key, val)),
  updateColor: (key, val) => dispatch(designColor(key, val)),
  updateName: (key, val, part, font, tab = 'letters') =>
    dispatch(chooseName(key, val, part, font, tab)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Letters);
