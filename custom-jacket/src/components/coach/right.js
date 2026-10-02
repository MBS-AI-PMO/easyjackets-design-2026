import React from "react";
import { connect } from "react-redux";

import { modalState, activeSidebar, colorPicker } from "../../store/actions";
import BadgeTemp from "../Jacket/badge";
import { COACH_SLEEVE_PATCH, moveTransform, patchArt, patchGuide, patchMove } from "../../config/sleevePatches";

const CoachRight = ({
  globals,
  advance,
  activeSidebar,
  colorPicker,
  modalState,
  styles,
  materials,
  colors,
  designs,
  pose
}) => {


  const openModal = (tab) => {
    modalState("title", tab);
    modalState("open", true);
    activeSidebar(3);

    if (designs[tab]?.done) {
      if (designs[tab]?.name) modalState("index", 0);
      else if (designs[tab]?.letters) modalState("index", 1);
      else if (designs[tab]?.editables) modalState("index", 1);
      else if (designs[tab]?.symbol) modalState("index", 2);
    } else {
      modalState("index", 0);
    }
  };

  return (
    <svg
      id="jacketRight"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -28 225 602"
      style={{ transform: "scaleX(-1)" }}
      className={pose ? "" : "cjd-hide"}
    >
      <g
        fill={colors.body ? colors.body : "#ffffff"}
        className="cjd-color-hover"
        onClick={() => colorPicker("body")}
      >
        <path
          d="M29.33,527.62c-12.95-3.41-19.48-10.86-16.89-24.89C14.3,492.64,1.52,369,3.34,333.13,5,300,7.61,266.54,4.74,233.66c-4.11-47,8-89.22,27.82-130.38,9.19-19.06,18.84-37.9,28.06-56.95,1-2,114.76-31.84,124.8-15.82,38.44,61.32,48,127.16,38.23,197.43-9.2,66.48-15.53,265.53-15.15,273.41.5,10.22-3.63,16.11-12.48,20.67-25.67,13.23-53.6,16-81.58,17.48C74.13,540.5,32.4,528.43,29.33,527.62Z"
          transform="translate(-2.66 -1.76)"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.44,500c31.72,36.92,171.44,14.43,195.93-4.46"
          transform="translate(-2.66 -1.76)"
          stroke="#000"
          strokeMiterlimit="10"
        />
      </g>

      {styles.sleeves === "Set-In" && (
        <g
          fill={colors.sleeves ? colors.sleeves : "#ffffff"}
          className="cjd-color-hover"
          onClick={() => colorPicker("sleeves")}
        >
          <path
            d="M90.91,98.53c-8.4,10.68-15.37,26.29-17.53,49-6.6,68.93-5.28,186.36-4,194.29s-7.93,46.59-7.93,46.59L28.71,542l59.92,21.85s41.79-90.78,56.92-155.75c8-34.7,20-98,29.42-149.5,8.28-44.91,18.61-128.84-7.09-160.06-4.68-5.77-19-16.94-36.38-16.94C119.49,81.59,98.6,88.68,90.91,98.53Z"
            transform="translate(-2.66 -1.76)"
            stroke="#000"
            strokeMiterlimit="10"
          />
          <path
            d="M91.78,556.75c-2.64,6-4.42,11-7.11,15.54a8,8,0,0,1-6.26,3.12c-6.47-.4-13.14-.85-19.28-2.73-9.31-2.84-18.34-6.7-27.31-10.54-4.83-2.06-6.65-6-5-11.39,1.14-3.75,1.72-7.67,2.74-12.38C49.1,548.25,68.75,556.2,91.78,556.75Z"
            transform="translate(-2.66 -1.76)"
            stroke="#000"
            strokeMiterlimit="10"
          />
        </g>
      )}

      {styles.sleeves === "Raglan" && (
        <g
          id="sleeve-raglan"
          fill={colors.sleeves ? colors.sleeves : "#ffffff"}
          className="cjd-color-hover"
          onClick={() => colorPicker("sleeves")}
        >
          <path
            d="M91.78,556.75c-2.64,6-4.42,11-7.11,15.54a8,8,0,0,1-6.26,3.12c-6.47-.4-13.14-.85-19.28-2.73-9.31-2.84-18.34-6.7-27.31-10.54-4.83-2.06-6.65-6-5-11.39,1.14-3.75,1.72-7.67,2.74-12.38C49.1,548.25,68.75,556.2,91.78,556.75Z"
            transform="translate(-2.66 -1.76)"
            stroke="#000"
            stroke-miterlimit="10"
          />
          <path
            d="M28.71,542l59.92,21.85C113.74,504.31,138,446,144,414.43,166.4,307,190.24,196.64,184.2,146.08,178.78,108.59,164,69.49,142.7,29.27l-27.53,3.26c-19.38,45.91-19.63,85.08-39,123a43.13,43.13,0,0,0-4.7,17c-3.73,64.4-5.31,124-1.11,170.9a6.68,6.68,0,0,1-.12,2.09Z"
            transform="translate(-2.66 -1.76)"
            stroke="#000"
            stroke-miterlimit="10"
          />
        </g>
      )}

      {styles.sleeves === "Set-In" && (
        <path
          d="M131.5,81.59a266.9,266.9,0,0,0-10.89-50.26"
          transform="translate(-2.66 -1.76)"
          stroke="#c6c6c6"
          strokeMiterlimit="10"
        />
      )}

      {styles.collar === "Shirt Collar" && (
        <path
          d="M184.5,29.5l-5-19.75s.36-6.52-6.06-7.38c-5.57-.72-39.72,2.23-62.34,3.36S72,5.77,62.27,6.2C57.86,18.65,60.5,45.5,60.5,45.5,108.71,34.06,138.75,25.34,184.5,29.5Z"
          transform="translate(-2.66 -1.76)"
          fill={colors.outside ? colors.outside : "#ffffff"}
          stroke="#000"
          strokeMiterlimit="10"
          className="cjd-color-hover"
          onClick={() => colorPicker("outside")}
        />
      )}

      {styles.collar === "Hood" && (
        <path
          id="hood"
          d="M125.77,69.7c4.84,8.61,23.9,90.21,27.55,81,8.75-22,8.2-87.79-5.37-110.47-4.45-7.43-12-14.68-18-20.43-5-4.86-12.77-9.86-24.8-15.11C80-2.35,70.77,15.24,50.45,35.67,38,48.21.73,61.21,2.64,78.23,32.26,70.53,56.82,52.9,87.24,50,114,47.48,114.07,48.9,125.77,69.7Z"
          transform="translate(-2.32 -2.88)"
          fill={colors.outside ? colors.outside : "#ffffff"}
          stroke="#231f20"
          strokeMiterlimit="2.61"
          strokeWidth="1"
          fillRule="evenodd"
          style={{ transform: "translate(46px, -31.4px) scale(1.2)" }}
          className="cjd-color-hover"
          onClick={() => colorPicker("outside")}
        />
      )}

      {styles.pocket === "Slash Pocket" && (
        <polygon
          points="31.46 439.76 38.03 438.46 24.37 356.2 17.8 357.5 31.46 439.76"
          fill={colors.pockets ? colors.pockets : "#e6e6e6"}
          stroke="#231f20"
          strokeMiterlimit="10"
          className="cjd-color-hover"
          onClick={() => colorPicker("pockets")}
        />
      )}

      {styles.pocket === "Snap Pocket" && (
        <g
          id="pockets-2"
          data-name="pockets"
          fill={colors.pockets ? colors.pockets : "#e6e6e6"}
          className="cjd-color-hover"
          onClick={() => colorPicker("pockets")}
        >
          <g id="pocket_flap_right-2" data-name="pocket flap right-2">
            <polygon
              points="26.85 354.02 11.42 356.47 25.17 440.73 40.59 438.29 26.85 354.02"
              stroke="#404041"
              strokeMiterlimit="10"
            />
            <path
              d="M24.63,396.52a4.75,4.75,0,1,1,1.11,6.63h0A4.76,4.76,0,0,1,24.63,396.52Z"
              transform="translate(-2.66 -1.76)"
              stroke="#404041"
              strokeMiterlimit="10"
            />
          </g>
        </g>
      )}

      {designs["Right Sleeve"]?.done && (
        <g transform={patchArt(124, 190, 84, 80, COACH_SLEEVE_PATCH, patchMove(globals.productId, "Right Sleeve"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g
          id="rightSleeveArt"
          style={{ transform: "translate(-41px, 0px) scaleX(-1)" }}
        >
          {designs["Right Sleeve"]?.name && (
            <g style={{ transform: "translate(-165px, 190px)" }}>
              <text
                x="0"
                y="0"
                dy={designs["Right Sleeve"]?.name?.title?.length > 8 ? "-1.25rem" : "0"}
                fontFamily={designs["Right Sleeve"]?.name.font}
                fill={designs["Right Sleeve"]?.name.fill}
                stroke={designs["Right Sleeve"]?.name?.stroke}
                fontSize={(() => {
                  const len = designs["Right Sleeve"]?.name?.title?.length || 0;
                  const font = designs["Right Sleeve"]?.name?.font;
                  let size = designs["Right Sleeve"]?.name.size;

                  if (len === 1) size = 103;
                  else if (len === 2) size = 77;
                  else if (len === 3) size = 50;
                  else if (len === 4) size = 37;
                  else if (len === 5) size = 30;
                  else if (len === 6) size = 25;
                  else if (len === 7) size = 21;
                  else if (len >= 8) size = 18;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="2"
                style={{ paintOrder: "stroke fill" }}
              >
                <tspan alignmentBaseline="middle">
                  {designs["Right Sleeve"]?.name.title.substr(0, 8)}
                </tspan>
              </text>
              <text
                x="0"
                y="0"
                dy="1rem"
                fontFamily={designs["Right Sleeve"]?.name.font}
                fill={designs["Right Sleeve"]?.name.fill}
                stroke={designs["Right Sleeve"]?.name?.stroke}
                fontSize={(() => {
                  const len = designs["Right Sleeve"]?.name?.title?.length || 0;
                  const font = designs["Right Sleeve"]?.name?.font;
                  let size = designs["Right Sleeve"]?.name.size;

                  if (len === 1) size = 103;
                  else if (len === 2) size = 77;
                  else if (len === 3) size = 50;
                  else if (len === 4) size = 37;
                  else if (len === 5) size = 30;
                  else if (len === 6) size = 25;
                  else if (len === 7) size = 21;
                  else if (len >= 8) size = 18;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="2"
                style={{ paintOrder: "stroke fill" }}
              >
                <tspan alignmentBaseline="middle">
                  {designs["Right Sleeve"]?.name.title.substr(8)}
                </tspan>
              </text>
            </g>
          )}

          {designs["Right Sleeve"]?.letters?.type === "Type Your Own" && (
            <g style={{ transform: "translate(-165px, 190px)" }}>
              <text
                x="0"
                y="0"
                fontFamily={designs["Right Sleeve"]?.letters.font}
                fill="none"
                fontSize={(() => {
                  const len = designs["Right Sleeve"]?.letters.title?.length || 0;
                  const font = designs["Right Sleeve"]?.letters.font;
                  let size = designs["Right Sleeve"]?.letters.size;

                  if (len === 1) size = 96;
                  else if (len === 2) size = 71;
                  else if (len === 3) size = 47;
                  else if (len === 4) size = 35;
                  else if (len === 5) size = 30;
                  else if (len === 6) size = 25;
                  else if (len === 7) size = 21;
                  else if (len >= 8) size = 18;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="8"
                stroke={designs["Right Sleeve"]?.letters.border}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Right Sleeve"]?.letters.title}
              </text>

              <text
                x="0"
                y="0"
                fontFamily={designs["Right Sleeve"]?.letters.font}
                fill={designs["Right Sleeve"]?.letters.fill}
                fontSize={(() => {
                  const len = designs["Right Sleeve"]?.letters.title?.length || 0;
                  const font = designs["Right Sleeve"]?.letters.font;
                  let size = designs["Right Sleeve"]?.letters.size;

                  if (len === 1) size = 96;
                  else if (len === 2) size = 71;
                  else if (len === 3) size = 47;
                  else if (len === 4) size = 35;
                  else if (len === 5) size = 30;
                  else if (len === 6) size = 25;
                  else if (len === 7) size = 21;
                  else if (len >= 8) size = 18;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="4"
                stroke={designs["Right Sleeve"]?.letters.stroke}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Right Sleeve"]?.letters.title}
              </text>
            </g>
          )}

          {designs["Right Sleeve"]?.letters && (
            <>
              {designs["Right Sleeve"]?.letters.type === 'Ready To Use' && designs["Right Sleeve"]?.letters.path && (
                <g transform="translate(-206, 150)">
                  <svg
                    width="82"
                    height="80"
                    viewBox={designs["Right Sleeve"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {(designs["Right Sleeve"]?.letters.path.match(/<path[^>]*>(?:<\/path>)?/g) || []).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)[1];
                      const pShape = li.match(/d="(.*?)"/)[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Right Sleeve"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Right Sleeve"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Right Sleeve"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              )}
            </>
          )}

          {designs["Right Sleeve"]?.symbol && (
            <g style={{ transform: "translate(-206px, 150px)" }}>
              <svg
                width="82"
                height="82"
                viewBox="0 0 72 72"
                preserveAspectRatio="xMidYMid meet"
              >
                {designs["Right Sleeve"]?.symbol?.type === "Badges" && (
                  <g style={{ transform: "translate(0px, 0px)" }}>
                    <svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Right Sleeve"]?.symbol.fill}
                        stroke={designs["Right Sleeve"]?.symbol.stroke}
                        border={designs["Right Sleeve"]?.symbol.border}
                      />
                    </svg>
                  </g>
                )}

                {designs["Right Sleeve"]?.symbol?.type === "Mascots" && (
                  <g style={{ transform: "translate(0px, 0px)" }}>
                    <svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="72"
                        height="72"
                        xlinkHref={require(`../../assets/images/mascots/${designs["Right Sleeve"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  </g>
                )}

                {designs["Right Sleeve"]?.symbol?.type === "Flags" && (
                  <g style={{ transform: "translate(0px, 0px)" }}>
                    <svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="72"
                        height="72"
                        xlinkHref={require(`../../assets/images/flags/${designs["Right Sleeve"]?.symbol.flag}.svg`)}
                      />
                      <rect
                        x="1"
                        y="14"
                        width="70"
                        height="43.5"
                        fill="none"
                        strokeWidth="2"
                        stroke={designs.fill}
                      ></rect>
                    </svg>
                  </g>
                )}
              </svg>
            </g>
          )}

          {designs["Right Sleeve"]?.upload && (
            <g style={{ transform: "translate(-208px, 147px)" }}>
              <image
                xlinkHref={designs["Right Sleeve"]?.upload.file}
                width="87"
                height="87"
              />
            </g>
          )}
        </g>
        </g>
      )}

      {designs["Right Sleeve End"]?.done && (
        <g transform={patchArt(73.08, 499.24, 50, 50, COACH_SLEEVE_PATCH, patchMove(globals.productId, "Right Sleeve End"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g
          id="rightSleeveArt"
          style={{
            transform: "translate(245px, -5px) rotate(31deg) scaleX(-1)",
          }}
        >
          {designs["Right Sleeve End"]?.name && (
            <g transform="translate(-112, 521) rotate(11)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Right Sleeve End"]?.name.font}
                fill={designs["Right Sleeve End"]?.name.fill}
                stroke={designs["Right Sleeve End"]?.name?.stroke}
                fontSize={(() => {
                  const len = designs["Right Sleeve End"]?.name?.title?.length || 0;
                  const font = designs["Right Sleeve End"]?.name?.font;
                  let size = designs["Right Sleeve End"]?.name.size;

                  if (len === 1) size = 62;
                  else if (len === 2) size = 45;
                  else if (len === 3) size = 30;
                  else if (len === 4) size = 22;
                  else if (len === 5) size = 17;
                  else if (len === 6) size = 14;
                  else if (len === 7) size = 12;
                  else if (len >= 8) size = 11;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="2"
                style={{ paintOrder: "stroke fill" }}
              >
                <tspan alignmentBaseline="middle">
                  {designs["Right Sleeve End"]?.name.title}
                </tspan>
              </text>
            </g>
          )}

          {designs["Right Sleeve End"]?.letters?.type === "Type Your Own" && (
            <g transform="translate(-112, 521) rotate(11)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Right Sleeve End"]?.letters.font}
                fill="none"
                fontSize={(() => {
                  const len = designs["Right Sleeve End"]?.letters?.title?.length || 0;
                  const font = designs["Right Sleeve End"]?.letters?.font;
                  let size = designs["Right Sleeve End"]?.letters.size;

                  if (len === 1) size = 55;
                  else if (len === 2) size = 40;
                  else if (len === 3) size = 26;
                  else if (len === 4) size = 19;
                  else if (len === 5) size = 24;
                  else if (len === 6) size = 20;
                  else if (len === 7) size = 17;
                  else if (len >= 8) size = 15;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="8"
                stroke={designs["Right Sleeve End"]?.letters.border}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Right Sleeve End"]?.letters.title}
              </text>

              <text
                x="0"
                y="0"
                fontFamily={designs["Right Sleeve End"]?.letters.font}
                fill={designs["Right Sleeve End"]?.letters.fill}
                fontSize={(() => {
                  const len = designs["Right Sleeve End"]?.letters?.title?.length || 0;
                  const font = designs["Right Sleeve End"]?.letters?.font;
                  let size = designs["Right Sleeve End"]?.letters.size;

                  if (len === 1) size = 55;
                  else if (len === 2) size = 40;
                  else if (len === 3) size = 26;
                  else if (len === 4) size = 19;
                  else if (len === 5) size = 24;
                  else if (len === 6) size = 20;
                  else if (len === 7) size = 17;
                  else if (len >= 8) size = 15;

                  if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                    size = Math.floor(size * 0.7);
                  }
                  return size;
                })()}
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="4"
                stroke={designs["Right Sleeve End"]?.letters.stroke}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Right Sleeve End"]?.letters.title}
              </text>
            </g>
          )}

          {designs["Right Sleeve End"]?.letters && (
            <>
              {designs["Right Sleeve End"]?.letters.type === 'Ready To Use' && designs["Right Sleeve End"]?.letters.path && (
                <g transform="translate(-148, 489) rotate(11)">
                  <svg
                    width="83"
                    height="49"
                    viewBox={designs["Right Sleeve End"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {(designs["Right Sleeve End"]?.letters.path.match(/<path[^>]*>(?:<\/path>)?/g) || []).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)[1];
                      const pShape = li.match(/d="(.*?)"/)[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Right Sleeve End"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Right Sleeve End"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Right Sleeve End"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              )}
            </>
          )}

          {designs["Right Sleeve End"]?.symbol && (
            <g transform="translate(-132, 492) rotate(11)">
              <svg
                width="50"
                height="50"
                viewBox="0 0 42 42"
                preserveAspectRatio="xMidYMin meet"
              >
                {designs["Right Sleeve End"]?.symbol.type === "Badges" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 42 42"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Right Sleeve End"]?.symbol.fill}
                        stroke={designs["Right Sleeve End"]?.symbol.stroke}
                        border={designs["Right Sleeve End"]?.symbol.border}
                      />
                    </svg>
                  </g>
                )}

                {designs["Right Sleeve End"]?.symbol.type === "Mascots" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 42 42"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="42"
                        height="42"
                        xlinkHref={require(`../../assets/images/mascots/${designs["Right Sleeve End"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  </g>
                )}

                {designs["Right Sleeve End"]?.symbol.type === "Flags" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 42 42"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="42"
                        height="42"
                        xlinkHref={require(`../../assets/images/flags/${designs["Right Sleeve End"]?.symbol.flag}.svg`)}
                      />
                      <rect
                        x="1"
                        y="8"
                        width="40"
                        height="26"
                        fill="none"
                        strokeWidth="2"
                        stroke={designs.fill}
                      ></rect>
                    </svg>
                  </g>
                )}
              </svg>
            </g>
          )}

          {designs["Right Sleeve End"]?.upload && (
            <g transform="translate(-132, 497) rotate(2)">
              <image
                xlinkHref={designs["Right Sleeve End"]?.upload.file}
                width="42"
                height="42"
              />
            </g>
          )}
        </g>
        </g>
      )}

      {globals.coach && (globals.productId === 6046 || globals.productId === "6046") && designs["Right Mid Sleeve Upper"]?.done && (
        <g transform={patchArt(116.06, 295.43, 74, 70, COACH_SLEEVE_PATCH, patchMove(globals.productId, "Right Mid Sleeve Upper"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g id="rightMidSleeveUpperArt" style={{ transform: "translate(-41px, -114px) scaleX(-1)" }}>
          <g transform="rotate(-11 -160 410)">
            {designs["Right Mid Sleeve Upper"]?.name && (
              <g transform="translate(-157, 410)">
                <text
                  x="0"
                  y="0"
                  dy={designs["Right Mid Sleeve Upper"]?.name?.title?.length > 8 ? "-0.75rem" : "0"}
                  fontFamily={designs["Right Mid Sleeve Upper"]?.name.font}
                  fill={designs["Right Mid Sleeve Upper"]?.name.fill}
                  stroke={designs["Right Mid Sleeve Upper"]?.name?.stroke}
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Upper"]?.name?.title?.length || 0;
                    const font = designs["Right Mid Sleeve Upper"]?.name?.font;
                    let size = designs["Right Mid Sleeve Upper"]?.name.size;

                    if (len === 1) size = 90;
                    else if (len === 2) size = 63;
                    else if (len === 3) size = 42;
                    else if (len === 4) size = 31;
                    else if (len === 5) size = 24;
                    else if (len === 6) size = 20;
                    else if (len === 7) size = 17;
                    else if (len >= 8) size = 15;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="2"
                  style={{ paintOrder: "stroke fill" }}
                >
                  <tspan alignmentBaseline="middle">
                    {designs["Right Mid Sleeve Upper"]?.name.title.substr(0, 8)}
                  </tspan>
                </text>
                <text
                  x="0"
                  y="0"
                  dy="0.75rem"
                  fontFamily={designs["Right Mid Sleeve Upper"]?.name.font}
                  fill={designs["Right Mid Sleeve Upper"]?.name.fill}
                  stroke={designs["Right Mid Sleeve Upper"]?.name?.stroke}
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Upper"]?.name?.title?.length || 0;
                    const font = designs["Right Mid Sleeve Upper"]?.name?.font;
                    let size = designs["Right Mid Sleeve Upper"]?.name.size;

                    if (len === 1) size = 73;
                    else if (len === 2) size = 63;
                    else if (len === 3) size = 42;
                    else if (len === 4) size = 31;
                    else if (len === 5) size = 24;
                    else if (len === 6) size = 20;
                    else if (len === 7) size = 17;
                    else if (len >= 8) size = 15;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="2"
                  style={{ paintOrder: "stroke fill" }}
                >
                  <tspan alignmentBaseline="middle">
                    {designs["Right Mid Sleeve Upper"]?.name.title.substr(8)}
                  </tspan>
                </text>
              </g>
            )}

            {designs["Right Mid Sleeve Upper"]?.letters && (designs["Right Mid Sleeve Upper"]?.letters?.type === "Type Your Own" || !designs["Right Mid Sleeve Upper"]?.letters?.type) && (
              <g transform="translate(-157, 410)">
                <text
                  x="0"
                  y="0"
                  fontFamily={designs["Right Mid Sleeve Upper"]?.letters.font}
                  fill="none"
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Upper"]?.letters.title?.length || 0;
                    const font = designs["Right Mid Sleeve Upper"]?.letters.font;
                    let size = designs["Right Mid Sleeve Upper"]?.letters.size;

                    if (len === 1) size = 82;
                    else if (len === 2) size = 61;
                    else if (len === 3) size = 40;
                    else if (len === 4) size = 30;
                    else if (len === 5) size = 30;
                    else if (len === 6) size = 25;
                    else if (len === 7) size = 21;
                    else if (len >= 8) size = 18;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="8"
                  stroke={designs["Right Mid Sleeve Upper"]?.letters.border}
                  style={{ paintOrder: "stroke fill" }}
                >
                  {designs["Right Mid Sleeve Upper"]?.letters.title}
                </text>

                <text
                  x="0"
                  y="0"
                  fontFamily={designs["Right Mid Sleeve Upper"]?.letters.font}
                  fill={designs["Right Mid Sleeve Upper"]?.letters.fill}
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Upper"]?.letters.title?.length || 0;
                    const font = designs["Right Mid Sleeve Upper"]?.letters.font;
                    let size = designs["Right Mid Sleeve Upper"]?.letters.size;

                    if (len === 1) size = 82;
                    else if (len === 2) size = 61;
                    else if (len === 3) size = 40;
                    else if (len === 4) size = 30;
                    else if (len === 5) size = 30;
                    else if (len === 6) size = 25;
                    else if (len === 7) size = 21;
                    else if (len >= 8) size = 18;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="4"
                  stroke={designs["Right Mid Sleeve Upper"]?.letters.stroke}
                  style={{ paintOrder: "stroke fill" }}
                >
                  {designs["Right Mid Sleeve Upper"]?.letters.title}
                </text>
              </g>
            )}

            {designs["Right Mid Sleeve Upper"]?.letters?.type === 'Ready To Use' && designs["Right Mid Sleeve Upper"]?.letters.path && (
              <g transform="translate(-151, 416)">
                <g transform="translate(-41, -41)">
                  <svg
                    width="70"
                    height="70"
                    viewBox={designs["Right Mid Sleeve Upper"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {(designs["Right Mid Sleeve Upper"]?.letters.path.match(/<path[^>]*>(?:<\/path>)?/g) || []).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)?.[1];
                      const pShape = li.match(/d="(.*?)"/)?.[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Right Mid Sleeve Upper"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Right Mid Sleeve Upper"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Right Mid Sleeve Upper"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              </g>
            )}

            {designs["Right Mid Sleeve Upper"]?.symbol && (
              <g transform="translate(-152, 415)">
                <g transform="translate(-41, -41)">
                  <svg
                    width="72"
                    height="72"
                    viewBox="0 0 72 72"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {designs["Right Mid Sleeve Upper"]?.symbol.type === "Badges" && (
                      <g style={{ transform: "translate(0px, 0px)" }}>
                        <svg
                          width="72"
                          height="72"
                          viewBox="0 0 72 72"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <BadgeTemp
                            fill={designs["Right Mid Sleeve Upper"]?.symbol.fill}
                            stroke={designs["Right Mid Sleeve Upper"]?.symbol.stroke}
                            border={designs["Right Mid Sleeve Upper"]?.symbol.border}
                          />
                        </svg>
                      </g>
                    )}

                    {designs["Right Mid Sleeve Upper"]?.symbol.type === "Mascots" && (
                      <g style={{ transform: "translate(0px, 0px)" }}>
                        <svg
                          width="72"
                          height="72"
                          viewBox="0 0 72 72"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <image
                            width="72"
                            height="72"
                            xlinkHref={require(`../../assets/images/mascots/${designs["Right Mid Sleeve Upper"]?.symbol.flag}.svg`)}
                          />
                        </svg>
                      </g>
                    )}

                    {designs["Right Mid Sleeve Upper"]?.symbol.type === "Flags" && (
                      <g style={{ transform: "translate(0px, 0px)" }}>
                        <svg
                          width="72"
                          height="72"
                          viewBox="0 0 72 72"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <image
                            width="72"
                            height="72"
                            xlinkHref={require(`../../assets/images/flags/${designs["Right Mid Sleeve Upper"]?.symbol.flag}.svg`)}
                          />
                          <rect
                            x="1"
                            y="14"
                            width="70"
                            height="43.5"
                            fill="none"
                            strokeWidth="2"
                            stroke={designs.fill}
                          ></rect>
                        </svg>
                      </g>
                    )}
                  </svg>
                </g>
              </g>
            )}

            {designs["Right Mid Sleeve Upper"]?.upload && (
              <g transform="translate(-154, 413)">
                <g transform="translate(-43, -43)">
                  <image
                    xlinkHref={designs["Right Mid Sleeve Upper"]?.upload.file}
                    width="80"
                    height="80"
                  />
                </g>
              </g>
            )}
          </g>
        </g>
        </g>
      )}

      {globals.coach && (globals.productId === 6046 || globals.productId === "6046") && designs["Right Mid Sleeve Lower"]?.done && (
        <g transform={patchArt(100.98, 398.76, 70, 64, COACH_SLEEVE_PATCH, patchMove(globals.productId, "Right Mid Sleeve Lower"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g id="rightMidSleeveLowerArt" style={{ transform: "translate(-50px, -14px) scaleX(-1)" }}>
          <g transform="rotate(-15 -160 410)">
            {designs["Right Mid Sleeve Lower"]?.name && (
              <g transform="translate(-152, 415)">
                <text
                  x="0"
                  y="0"
                  dy={designs["Right Mid Sleeve Lower"]?.name?.title?.length > 8 ? "-0.75rem" : "0"}
                  fontFamily={designs["Right Mid Sleeve Lower"]?.name.font}
                  fill={designs["Right Mid Sleeve Lower"]?.name.fill}
                  stroke={designs["Right Mid Sleeve Lower"]?.name?.stroke}
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Lower"]?.name?.title?.length || 0;
                    const font = designs["Right Mid Sleeve Lower"]?.name?.font;
                    let size = designs["Right Mid Sleeve Lower"]?.name.size;

                    if (len === 1) size = 80;
                    else if (len === 2) size = 63;
                    else if (len === 3) size = 42;
                    else if (len === 4) size = 31;
                    else if (len === 5) size = 24;
                    else if (len === 6) size = 20;
                    else if (len === 7) size = 17;
                    else if (len >= 8) size = 15;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="2"
                  style={{ paintOrder: "stroke fill" }}
                >
                  <tspan alignmentBaseline="middle">
                    {designs["Right Mid Sleeve Lower"]?.name.title.substr(0, 8)}
                  </tspan>
                </text>
                <text
                  x="0"
                  y="0"
                  dy="0.75rem"
                  fontFamily={designs["Right Mid Sleeve Lower"]?.name.font}
                  fill={designs["Right Mid Sleeve Lower"]?.name.fill}
                  stroke={designs["Right Mid Sleeve Lower"]?.name?.stroke}
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Lower"]?.name?.title?.length || 0;
                    const font = designs["Right Mid Sleeve Lower"]?.name?.font;
                    let size = designs["Right Mid Sleeve Lower"]?.name.size;

                    if (len === 1) size = 73;
                    else if (len === 2) size = 63;
                    else if (len === 3) size = 42;
                    else if (len === 4) size = 31;
                    else if (len === 5) size = 24;
                    else if (len === 6) size = 20;
                    else if (len === 7) size = 17;
                    else if (len >= 8) size = 15;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="2"
                  style={{ paintOrder: "stroke fill" }}
                >
                  <tspan alignmentBaseline="middle">
                    {designs["Right Mid Sleeve Lower"]?.name.title.substr(8)}
                  </tspan>
                </text>
              </g>
            )}

            {designs["Right Mid Sleeve Lower"]?.letters && (designs["Right Mid Sleeve Lower"]?.letters?.type === "Type Your Own" || !designs["Right Mid Sleeve Lower"]?.letters?.type) && (
              <g transform="translate(-152, 415)">
                <text
                  x="0"
                  y="0"
                  fontFamily={designs["Right Mid Sleeve Lower"]?.letters.font}
                  fill="none"
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Lower"]?.letters.title?.length || 0;
                    const font = designs["Right Mid Sleeve Lower"]?.letters.font;
                    let size = designs["Right Mid Sleeve Lower"]?.letters.size;

                    if (len === 1) size = 82;
                    else if (len === 2) size = 61;
                    else if (len === 3) size = 40;
                    else if (len === 4) size = 30;
                    else if (len === 5) size = 30;
                    else if (len === 6) size = 25;
                    else if (len === 7) size = 21;
                    else if (len >= 8) size = 18;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="8"
                  stroke={designs["Right Mid Sleeve Lower"]?.letters.border}
                  style={{ paintOrder: "stroke fill" }}
                >
                  {designs["Right Mid Sleeve Lower"]?.letters.title}
                </text>

                <text
                  x="0"
                  y="0"
                  fontFamily={designs["Right Mid Sleeve Lower"]?.letters.font}
                  fill={designs["Right Mid Sleeve Lower"]?.letters.fill}
                  fontSize={(() => {
                    const len = designs["Right Mid Sleeve Lower"]?.letters.title?.length || 0;
                    const font = designs["Right Mid Sleeve Lower"]?.letters.font;
                    let size = designs["Right Mid Sleeve Lower"]?.letters.size;

                    if (len === 1) size = 82;
                    else if (len === 2) size = 61;
                    else if (len === 3) size = 40;
                    else if (len === 4) size = 30;
                    else if (len === 5) size = 30;
                    else if (len === 6) size = 25;
                    else if (len === 7) size = 21;
                    else if (len >= 8) size = 18;

                    if (font === "Graduate" || font === "Cutive" || font === "Merienda One") {
                      size = Math.floor(size * 0.7);
                    }
                    return size;
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  strokeWidth="4"
                  stroke={designs["Right Mid Sleeve Lower"]?.letters.stroke}
                  style={{ paintOrder: "stroke fill" }}
                >
                  {designs["Right Mid Sleeve Lower"]?.letters.title}
                </text>
              </g>
            )}

            {designs["Right Mid Sleeve Lower"]?.letters?.type === 'Ready To Use' && designs["Right Mid Sleeve Lower"]?.letters.path && (
              <g transform="translate(-143, 424)">
                <g transform="translate(-41, -41)">
                  <svg
                    width="64"
                    height="64"
                    viewBox={designs["Right Mid Sleeve Lower"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {(designs["Right Mid Sleeve Lower"]?.letters.path.match(/<path[^>]*>(?:<\/path>)?/g) || []).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)?.[1];
                      const pShape = li.match(/d="(.*?)"/)?.[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Right Mid Sleeve Lower"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Right Mid Sleeve Lower"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Right Mid Sleeve Lower"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              </g>
            )}

            {designs["Right Mid Sleeve Lower"]?.symbol && (
              <g transform="translate(-147, 420)">
                <g transform="translate(-41, -41)">
                  <svg
                    width="72"
                    height="72"
                    viewBox="0 0 72 72"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {designs["Right Mid Sleeve Lower"]?.symbol.type === "Badges" && (
                      <g style={{ transform: "translate(0px, 0px)" }}>
                        <svg
                          width="72"
                          height="72"
                          viewBox="0 0 72 72"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <BadgeTemp
                            fill={designs["Right Mid Sleeve Lower"]?.symbol.fill}
                            stroke={designs["Right Mid Sleeve Lower"]?.symbol.stroke}
                            border={designs["Right Mid Sleeve Lower"]?.symbol.border}
                          />
                        </svg>
                      </g>
                    )}

                    {designs["Right Mid Sleeve Lower"]?.symbol.type === "Mascots" && (
                      <g style={{ transform: "translate(0px, 0px)" }}>
                        <svg
                          width="72"
                          height="72"
                          viewBox="0 0 72 72"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <image
                            width="72"
                            height="72"
                            xlinkHref={require(`../../assets/images/mascots/${designs["Right Mid Sleeve Lower"]?.symbol.flag}.svg`)}
                          />
                        </svg>
                      </g>
                    )}

                    {designs["Right Mid Sleeve Lower"]?.symbol.type === "Flags" && (
                      <g style={{ transform: "translate(0px, 0px)" }}>
                        <svg
                          width="72"
                          height="72"
                          viewBox="0 0 72 72"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <image
                            width="72"
                            height="72"
                            xlinkHref={require(`../../assets/images/flags/${designs["Right Mid Sleeve Lower"]?.symbol.flag}.svg`)}
                          />
                          <rect
                            x="1"
                            y="14"
                            width="70"
                            height="43.5"
                            fill="none"
                            strokeWidth="2"
                            stroke={designs.fill}
                          ></rect>
                        </svg>
                      </g>
                    )}
                  </svg>
                </g>
              </g>
            )}

            {designs["Right Mid Sleeve Lower"]?.upload && (
              <g transform="translate(-147, 420)">
                <g transform="translate(-43, -43)">
                  <image
                    xlinkHref={designs["Right Mid Sleeve Lower"]?.upload.file}
                    width="76"
                    height="76"
                  />
                </g>
              </g>
            )}
          </g>
        </g>
        </g>
      )}

      <g transform={moveTransform(patchMove(globals.productId, "Right Sleeve"))}>
      <rect
        {...patchGuide(123, 150, 84, 80, COACH_SLEEVE_PATCH)}
        className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
        onClick={() => openModal("Right Sleeve")}
        style={{ transform: "translate(-41px, 0px)" }}
      />
      </g>
      {globals.coach && (globals.productId === 6046 || globals.productId === "6046") && advance.extraSleevePatches && (
        <g transform={moveTransform(patchMove(globals.productId, "Right Mid Sleeve Upper"))}>
        <rect
          {...patchGuide(120, 375, 74, 70, COACH_SLEEVE_PATCH)}
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          onClick={() => openModal("Right Mid Sleeve Upper")}
          transform="translate(-41, -114) rotate(11 160 410)"
        />
        </g>
      )}
      {globals.coach && (globals.productId === 6046 || globals.productId === "6046") && advance.extraSleevePatches && (
        <g transform={moveTransform(patchMove(globals.productId, "Right Mid Sleeve Lower"))}>
        <rect
          {...patchGuide(117, 383, 70, 64, COACH_SLEEVE_PATCH)}
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          onClick={() => openModal("Right Mid Sleeve Lower")}
          transform="translate(-50, -14) rotate(15 160 410)"
        />
        </g>
      )}
      <g transform={moveTransform(patchMove(globals.productId, "Right Sleeve End"))}>
      <rect
        {...patchGuide(35, 430, 50, 50, COACH_SLEEVE_PATCH)}
        className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
        onClick={() => openModal("Right Sleeve End")}
        style={{ transform: "translate(-375px, 400px) rotate(-70deg)" }}
      />
      </g>

    </svg>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  materials: state.materials,
  styles: state.styles,
  colors: state.colors,
  designs: state.designs,
  advance: state.advance,
});

const mapDispatchToProps = (dispatch) => ({
  modalState: (key, val) => dispatch(modalState(key, val)),
  activeSidebar: (idx) => dispatch(activeSidebar(idx)),
  colorPicker: (part) => dispatch(colorPicker(part)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CoachRight);
