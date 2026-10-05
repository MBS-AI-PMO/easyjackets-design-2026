import React from "react";
import { connect } from "react-redux";

import { modalState, activeSidebar, colorPicker } from "../../store/actions";
import { getStaggeredElm } from "../../utils";

import Hood from "../Jacket/collar/hood";
import BadgeTemp from "../Jacket/badge";

// Ready-to-use pocket letters: the box (width, height) each letter is drawn in, centred on its pocket's
// 55 x 55 guide (right 150,410 / left 250,410) at the letter's own viewBox, so a narrow I and a wide X
// both sit in the middle. 45.5 tall is the size they had before.
const POCKET_LETTER_BOX = [51, 45.5];
const pocketLetterBox = (guideX, path) => ({
  x: guideX + 27.5 - POCKET_LETTER_BOX[0] / 2,
  y: 410 + 27.5 - POCKET_LETTER_BOX[1] / 2,
  width: POCKET_LETTER_BOX[0],
  height: POCKET_LETTER_BOX[1],
  viewBox: path.match(/viewBox="(.*?)"/)?.[1] || "0 0 100 100",
  preserveAspectRatio: "xMidYMid meet",
});

const Coach = ({
  globals,
  styles,
  colors,
  designs,
  modalState,
  activeSidebar,
  colorPicker,
  pose
}) => {
  const openModal = (tab) => {
    modalState("title", tab);
    modalState("open", true);
    activeSidebar(3);

    if (designs[tab]?.done) {
      if (designs[tab]?.name) {
        modalState("index", 0);
        modalState("tab", "name");
      } else if (designs[tab]?.letters) {
        modalState(
          "index",
          tab === "Left Pocket" || tab === "Right Pocket" ? 0 : 1
        );
        modalState("tab", "letters");
      } else if (designs[tab]?.editables) {
        modalState("index", 1);
        modalState("tab", "editables");
      } else if (designs[tab]?.symbol) {
        modalState(
          "index",
          tab === "Left Pocket" || tab === "Right Pocket" ? 1 : 2
        );
        modalState("tab", "symbol");
      }
    } else {
      modalState("index", 0);
    }
  };

  let laddiesJacket = globals.productId === '4893' ? true : false;


  return (
    <svg
      id="jacketFront"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -18 460 622"
      className={pose ? "" : "cjd-hide"}
    >
      <g
        id="laces"
        strokeWidth="1"
        stroke="#cacae8"
        style={{ transform: "translate(193px, 494px)" }}
        onClick={() => colorPicker("lace")}
      >
        <path
          d="M77,1.05a3.9,3.9,0,1,1-3.9,3.89A3.9,3.9,0,0,1,77,1.05Z"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke={colors.lace || "#cacae8"}
          strokeMiterlimit="2.61"
          strokeWidth="1"
        />
        <path
          d="M77,4.94c-5.89,41.87-1.6,85.24-6,122.32"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke={colors.lace || "#cacae8"}
          strokeLinecap="round"
          strokeMiterlimit="2.61"
          strokeWidth="2.44"
        />
        <path
          d="M4.92,1.07A3.9,3.9,0,1,1,1.46,5.36,3.9,3.9,0,0,1,4.92,1.07Z"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke={colors.lace || "#cacae8"}
          strokeMiterlimit="2.61"
          strokeWidth="1"
        />
        <path
          d="M5.33,4.94c-1.41,42.26,7.47,84.93,7,122.26"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke={colors.lace || "#cacae8"}
          strokeLinecap="round"
          strokeMiterlimit="2.61"
          strokeWidth="2.44"
        />
      </g>

      <g className="cjd-color-hover" onClick={() => colorPicker("body")}>
        <path
          id="body"
          d="M229.4,536.54c-32.26-2-65.86-3.83-99.41-6.19A60.66,60.66,0,0,1,100.77,521c-13-8.45-19.09-19.78-17.74-36.05,3.1-37.32,5.33-74.73,7.21-112.14.73-14.6-.56-29.29-.65-43.94-.1-15-.18-29.94.34-44.89a369.36,369.36,0,0,1,2.81-37.78c2.36-17.17-.85-33.49-5.53-49.73-6.23-21.56-12.82-43-18.94-64.62-4-14.06-7.49-28.27-10.95-42.47a5.55,5.55,0,0,1,1.85-4.76A216.25,216.25,0,0,1,79.23,72.52c21-10.69,42.44-20.71,63.34-31.67a52,52,0,0,1,21.76-6.26c16.75-.91,33.51-1.85,50.29-2.3,30.83-.83,61.56,1,92.22,4.18a16.8,16.8,0,0,1,5.72,1.45C337.78,50.38,363,62.83,388.09,75.55c5.45,2.77,10.48,6.43,15.49,10,1.14.81,2.2,3.14,1.86,4.4-7.12,26.64-14.43,53.23-21.74,79.83-4,14.58-8.35,29.09-12.07,43.75-3.12,12.25-2.42,24.67-.54,37.12a193.26,193.26,0,0,1,.2,54.19c-.62,4.71.44,9.62.43,14.43-.06,21.49-1.14,43-.14,64.44,1.58,34.26,4.25,68.48,7,102.68,1.21,14.95-4.83,25.71-16.59,33.77-11.21,7.68-24.19,10.11-37.42,10.93C293.34,533,262.07,534.69,229.4,536.54Z"
          transform="translate(-1.48 -0.47)"
          fill={colors.body ? colors.body : "#ffffff"}
          stroke="#000"
          strokeMiterlimit="10"
        />

        <path
          id="base"
          d="M378.59,497.62c-.42,6.71.11,13.65-1.45,20.09-3.56,14.66-14.95,21.35-28.66,23.57a487.74,487.74,0,0,1-49.36,5.7c-29.05,1.71-58.2,3.84-87.24,3.11-30.84-.78-61.61-4.54-92.38-7.34-5.2-.47-10.34-2.35-15.33-4.07-12.57-4.33-19.51-13.4-20.82-26.53a81.06,81.06,0,0,1,.45-15.89C92.34,509.19,104.68,515.93,119,519a169,169,0,0,0,24.7,3.13c24.4,1.59,48.82,3.91,73.23,3.94,29.58,0,59.17-1.93,88.74-3.18,8.8-.37,17.65-.8,26.35-2,22.62-3.23,29.94-7.26,44.95-23.45Z"
          transform="translate(-1.48 -0.47)"
          fill={colors.body ? colors.body : "#ffffff"}
          stroke="#000"
          strokeMiterlimit="10"
        />
      </g>

      {styles.sleeves === "Raglan" && (
        <g
          id="sleeves-raglan"
          className="cjd-color-hover"
          fill={colors.sleeves ? colors.sleeves : "#ffffff"}
          onClick={() => colorPicker("sleeves")}
        >
          <g id="left">
            <path
              d="M301.33,35.16l10.78,3.13c27.76,13.8,101.38,36,105.45,71.55,0,0,15.71,57.83,21.65,87.13A505.63,505.63,0,0,1,448,265.71c2.91,46.71,4.36,93.5,6.48,140.26q2.71,60.12,5.6,120.25c.19,4.06-3.71,10.1-7.59,11.29-18.57,5.68-37.47,5.56-56.37,2.41-4.7-.78-6-5.86-6.45-10.07-1.4-12.9-2.44-25.85-3.53-38.8C384,466.17,381.84,441.3,380,416.4c-.84-11.12-.72-22.32-1.62-33.43-1.5-18.72-3.77-37.38-5.14-56.1a360.71,360.71,0,0,1-1.09-38.33,268.34,268.34,0,0,0-2.94-49.72c-.08-12.8,2.89-33,2.89-33,.06-54.15-29.27-130.55-77.35-170.62C292.32,34.55,301.33,35.16,301.33,35.16Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
            <path
              d="M456.49,535.06c-.45,6.28-.41,11.46-1.37,16.44a7.77,7.77,0,0,1-4.67,4.88c-6,1.76-12.2,3.53-18.4,3.83a261.12,261.12,0,0,1-28.24-.63c-5.07-.3-8-3.28-8.28-8.71-.2-3.78-.95-7.53-1.57-12.13C415,541.31,435.39,542.1,456.49,535.06Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
          </g>
          <g id="right">
            <path
              d="M160.45,35.16l-10.78,3.13c-27.77,13.8-101.38,36-105.45,71.55,0,0-15.71,57.83-21.65,87.13a505.64,505.64,0,0,0-8.75,68.74C10.91,312.42,9.47,359.21,7.35,406Q4.62,466.09,1.74,526.22c-.19,4.06,3.71,10.1,7.6,11.29,18.57,5.68,37.47,5.56,56.36,2.41,4.7-.78,6-5.86,6.46-10.07,1.4-12.9,2.44-25.85,3.53-38.8,2.09-24.88,4.24-49.75,6.12-74.65.83-11.12.72-22.32,1.61-33.43,1.51-18.72,3.78-37.38,5.14-56.1a360.71,360.71,0,0,0,1.09-38.33,269.21,269.21,0,0,1,2.95-49.72c.08-12.8-2.89-33-2.89-33C89.65,151.63,117.54,75.09,165.62,35,168,34.41,160.45,35.16,160.45,35.16Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
            <path
              d="M5.28,535.06c.45,6.28.42,11.46,1.38,16.44a7.77,7.77,0,0,0,4.67,4.88c6,1.76,12.2,3.53,18.39,3.83A261.25,261.25,0,0,0,58,559.58c5.06-.3,8-3.28,8.28-8.71.19-3.78.94-7.53,1.56-12.13C46.82,541.31,26.38,542.1,5.28,535.06Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
          </g>
        </g>
      )}

      {styles.sleeves === "Set-In" && (
        <g
          id="sleeves"
          className="cjd-color-hover"
          fill={colors.sleeves ? colors.sleeves : "#ffffff"}
          onClick={() => colorPicker("sleeves")}
        >
          <g id="left">
            <path
              d="M405.27,86.92A46.62,46.62,0,0,1,418,109.46c7.41,29,15.71,57.83,21.65,87.13a505.64,505.64,0,0,1,8.75,68.74c2.91,46.71,4.35,93.5,6.47,140.26q2.73,60.14,5.61,120.25c.19,4.06-3.71,10.1-7.6,11.29-18.57,5.68-37.47,5.56-56.36,2.42-4.7-.79-6-5.87-6.46-10.07-1.39-12.91-2.44-25.86-3.52-38.8-2.1-24.89-4.25-49.76-6.12-74.66-.84-11.12-.73-22.32-1.62-33.43-1.51-18.72-3.77-37.38-5.14-56.1a360.71,360.71,0,0,1-1.09-38.33,269.21,269.21,0,0,0-2.95-49.72c-1.71-11.25-.11-22.29,2.89-33,6.29-22.58,13.31-45,19.56-67.54,3.95-14.25,7-28.75,10.55-43.12C403.22,92.34,404.21,90,405.27,86.92Z"
              transform="translate(-1.48 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
            <path
              d="M457,534.68c-.45,6.28-.42,11.46-1.38,16.44A7.77,7.77,0,0,1,450.9,556c-6,1.76-12.2,3.53-18.39,3.83a261.25,261.25,0,0,1-28.25-.63c-5.06-.3-8-3.28-8.28-8.71-.19-3.78-.94-7.52-1.56-12.13C415.41,540.93,435.85,541.72,457,534.68Z"
              transform="translate(-1.48 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
          </g>

          <g id="right">
            <path
              d="M57.2,86.92a46.64,46.64,0,0,0-12.75,22.54c-7.4,29-15.71,57.83-21.64,87.13a505.64,505.64,0,0,0-8.75,68.74C11.15,312,9.71,358.83,7.59,405.59Q4.86,465.73,2,525.84c-.19,4.06,3.71,10.1,7.6,11.29,18.56,5.68,37.47,5.56,56.36,2.42,4.7-.79,6-5.87,6.46-10.07,1.39-12.91,2.43-25.86,3.52-38.8C78,465.79,80.17,440.92,82,416c.84-11.12.73-22.32,1.62-33.43,1.51-18.72,3.77-37.38,5.14-56.1a360.71,360.71,0,0,0,1.09-38.33,269.21,269.21,0,0,1,3-49.72c1.71-11.25.1-22.29-2.89-33-6.29-22.58-13.31-45-19.56-67.54-4-14.25-7-28.75-10.55-43.12C59.24,92.34,58.26,90,57.2,86.92Z"
              transform="translate(-1.48 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
            <path
              d="M5.52,534.68C6,541,5.93,546.14,6.9,551.12A7.75,7.75,0,0,0,11.56,556c6,1.76,12.21,3.53,18.4,3.83a261.36,261.36,0,0,0,28.25-.63c5.06-.3,8-3.28,8.27-8.71.2-3.78,1-7.52,1.57-12.13C47.06,540.93,26.62,541.72,5.52,534.68Z"
              transform="translate(-1.48 -0.47)"
              stroke="#000"
              strokeMiterlimit="10"
            />
          </g>
        </g>
      )}

      {styles.collar === "Hood" ? (
        <g style={{ transform: "translate(-28px, -31px)" }}>
          <Hood
            colorPicker={(part) => colorPicker(part)}
            outside={colors.outside ? colors.outside : "#ffffff"}
            inside={colors.inside ? colors.inside : "#000000"}
            lining={colors.lining ? colors.lining : "#ffffff"} // the coach lining only comes in white
            lace={colors.lace ? colors.lace : "#c4c6c6"}
          />
        </g>
      ) : (
        <g id="collar">
          {styles.collar !== "Hood" && (
            <polygon
              points="195.64 32.37 267.35 32.37 233.03 62.08 222.82 62.35 195.64 32.37"
              fill={colors.lining ? colors.lining : "#ffffff"} // the inside lining showing at the neck (it read the collar inside colour)
              className="cjd-color-hover"
              onClick={() => colorPicker("lining")}
            />
          )}

          <g
            id="collarBase"
            className="cjd-color-hover"
            onClick={() => colorPicker("outside")}
            fill={colors.outside ? colors.outside : "#ffffff"}
          >
            <path
              d="M231.42,36c-12.29,0-24.59,0-36.88,0a4.91,4.91,0,0,1-4.64-2.23c-5.38-8.15-10.85-16.24-16.15-24.44-.64-1-1.05-3.11-.5-3.68a6.06,6.06,0,0,1,4.13-1.53c8.87.24,17.74,1,26.61,1,26.33,0,52.65-.37,79-.58,1.73,0,3.46,0,5.2,0,1.9,0,2.33,1,1.78,2.68a8.38,8.38,0,0,1-.71,1.89c-5.49,8.31-10.93,16.64-16.6,24.82a5.65,5.65,0,0,1-4.05,1.93C256.2,36,243.81,36,231.42,36Z"
              transform="translate(-1.24 -3.63)"
              stroke={colors.inside}
              strokeMiterlimit="10"
            />
            <path
              d="M298.66,46.76c-1.23,1.3-3.92,1.55-1.75,3.91.16.18-.22.88-.39,1.33a148.61,148.61,0,0,1-28.61,46.08,6.23,6.23,0,0,1-1,.7L230,64.74l.49-.87c1.06.53,2.13,1.05,3.76,1.84l-2-2.88c4.39-3.47,8.83-6.87,13.14-10.41,8.37-6.87,17.13-13.36,24.86-20.89,6-5.81,10.62-13,15.86-19.52,1.31-1.65,2.63-3.3,4.31-5.39,1.23,4,2.3,7.53,3.38,11,1.8,5.9,3.74,11.76,5.34,17.71a16.27,16.27,0,0,1,.51,7.15C299.43,43.87,297,44.74,298.66,46.76Z"
              transform="translate(-1.24 -3.63)"
              stroke={colors.inside}
              strokeMiterlimit="10"
            />
            <path
              d="M228.27,63.38,226,66.58l3.94-2.2.69.89L195.72,99.7c-4.69-6.12-9.53-11.55-13.36-17.62-5.09-8.07-9.47-16.59-14-25-.59-1.1-2.32-2.61-.44-4.32.12-.11-1.28-1.91-1.68-3-.56-1.19-1.1-2.39-1.7-3.57-.11-.21-.63-.3-.64-.47-.17-3-1-6.28-.3-9.1,2.46-9.52,5.49-18.89,8.32-28.32.07-.25.33-.44,1-1.29C187.56,29.67,207.64,46.74,228.27,63.38Z"
              transform="translate(-1.24 -3.63)"
              stroke={colors.inside}
              strokeMiterlimit="10"
            />
          </g>
        </g>
      )}

      <g id="buttons">
        <line
          x1="226.71"
          y1={styles.collar === "Hood" ? 80.78 : 65.51}
          x2="226.71"
          y2="549.87"
          fill="none"
          stroke="#000"
          strokeMiterlimit="2.61"
          strokeWidth="1"
        />
        <g
          className="cjd-color-hover"
          fill={colors.buttons ? colors.buttons : "#ffffff"}
          onClick={() => colorPicker("buttons")}
        >
          <path
            d="M239.67,105.76a6.57,6.57,0,1,1-6.57,6.57,6.57,6.57,0,0,1,6.57-6.57Z"
            transform="translate(-1.48 -0.47)"
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
          />
          <path
            d="M239.67,190.3a6.57,6.57,0,1,1-6.57,6.56,6.57,6.57,0,0,1,6.57-6.56Z"
            transform="translate(-1.48 -0.47)"
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
          />
          <path
            d="M239.67,274.84a6.57,6.57,0,1,1-6.57,6.56,6.57,6.57,0,0,1,6.57-6.56Z"
            transform="translate(-1.48 -0.47)"
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
          />
          <path
            d="M239.67,359.37a6.57,6.57,0,1,1-6.57,6.57,6.57,6.57,0,0,1,6.57-6.57Z"
            transform="translate(-1.48 -0.47)"
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
          />
          <path
            d="M239.67,423.91a6.57,6.57,0,1,1-6.57,6.57,6.57,6.57,0,0,1,6.57-6.57Z"
            transform="translate(-1.48 20.53)"
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
          />
          <path
            d="M239.67,530.54a6.57,6.57,0,1,1-6.57,6.57,6.57,6.57,0,0,1,6.57-6.57Z"
            transform="translate(-1.48 -0.47)"
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
          />
        </g>
      </g>

      {styles.pocket === "Slash Pocket" && (
        <g
          id="pocket_slash"
          fill={colors.pockets ? colors.pockets : "#e6e6e6"}
          data-name="pocket slash"
          className="cjd-color-hover"
          onClick={() => colorPicker("pockets")}
        >
          <polygon
            points="337.15 468.66 343.73 467.37 330.07 385.1 323.5 386.4 337.15 468.66"
            stroke="#000"
            strokeWidth="1"
          />
          <polygon
            points="123.44 385.1 129.71 386.39 116.69 468.25 110.42 466.96 123.44 385.1"
            stroke="#000"
            strokeWidth="1"
          />
        </g>
      )}

      {styles.pocket === "Snap Pocket" && (
        <g
          id="cjd-pockets"
          fill={colors.pockets ? colors.pockets : "#e6e6e6"}
          data-name="pocket slash"
          className="cjd-color-hover"
          onClick={() => colorPicker("pockets")}
        >
          <g id="Pocket_Snap" data-name="Pocket Snap">
            <g id="pocket_flap_right-2" data-name="pocket flap right-2">
              <polygon
                points="329.63 384.65 314.24 387.31 329.12 471.37 344.51 468.72 329.63 384.65"
                stroke="#404041"
                strokeMiterlimit="10"
              />
              {/* the snap ("Flap Pocket" on the coach): its ring is set inline, so it is a part of the
                  drawing and not an outline (App.scss's outline colour and the Outlines switch leave it
                  alone, App.js) */}
              <path
                d="M326.78,425.92a4.75,4.75,0,1,1,1.2,6.61h0A4.77,4.77,0,0,1,326.78,425.92Z"
                transform="translate(-1.48 -0.47)"
                style={{ stroke: "#9ca1a3" }}
                strokeMiterlimit="10"
              />
            </g>
          </g>
          <g id="Pocket_Snap-2" data-name="Pocket Snap">
            <g id="pocket_flap_right-2-2" data-name="pocket flap right-2">
              <polygon
                points="124.12 385.65 139.51 388.31 124.63 472.37 109.24 469.72 124.12 385.65"
                stroke="#404041"
                strokeMiterlimit="10"
              />
              <path
                d="M129.92,426.92a4.75,4.75,0,1,0-1.2,6.61h0A4.76,4.76,0,0,0,129.92,426.92Z"
                transform="translate(-1.48 -0.47)"
                style={{ stroke: "#9ca1a3" }}
                strokeMiterlimit="10"
              />
            </g>
          </g>
        </g>
      )}

      {!designs["Front Center"]?.done && (
        <g id="right-chest" style={{ transform: "translate(-28px, 0)" }}>
          <rect
            className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
            x="145"
            y="165"
            width="85"
            height="85"
            fill="#e6e6e6"
            data-name="right-chest"
            data-patch="true" // fitted like a sleeve patch (utils/autoFitText.js)
            onClick={() => openModal("Right Chest")}
          />
          {designs["Right Chest"]?.done && (
            <>
              {designs["Right Chest"]?.name && (
                <g style={{ transform: "translate(188px, 208px)" }}>
                  <g className="name">
                    <text
                      x="0"
                      y="0"
                      fontFamily={designs["Right Chest"]?.name?.font}
                      fill={designs["Right Chest"]?.name?.fill}
                      stroke={designs["Right Chest"]?.name?.stroke}
                      strokeWidth="2"
                      style={{ paintOrder: "stroke fill" }}
                      fontSize={designs["Right Chest"]?.name?.size}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan alignmentBaseline="middle">
                        {designs["Right Chest"]?.name?.title}
                      </tspan>
                    </text>
                  </g>
                </g>
              )}

              {designs["Right Chest"]?.letters && (
                <g style={{ transform: "translate(187px, 207px)" }}>
                  <g className="letters">
                    {designs["Right Chest"]?.letters?.type ===
                      "Type Your Own" && (
                        <>
                          <text
                            x="0"
                            y="0"
                            fontFamily={designs["Right Chest"]?.letters?.font}
                            fill="none"
                            fontSize={designs["Right Chest"]?.letters?.size}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            strokeWidth="8"
                            stroke={designs["Right Chest"]?.letters?.border}
                          >
                            {designs["Right Chest"]?.letters?.appearance ===
                              "Staggered"
                              ? getStaggeredElm(
                                designs["Right Chest"]?.letters?.title
                              )
                              : designs["Right Chest"]?.letters?.title}
                          </text>

                          <text
                            x="0"
                            y="0"
                            fontFamily={designs["Right Chest"]?.letters?.font}
                            fill={designs["Right Chest"]?.letters?.fill}
                            fontSize={designs["Right Chest"]?.letters?.size}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            strokeWidth="4"
                            stroke={designs["Right Chest"]?.letters?.stroke}
                          >
                            {designs["Right Chest"]?.letters?.appearance ===
                              "Staggered"
                              ? getStaggeredElm(
                                designs["Right Chest"]?.letters?.title
                              )
                              : designs["Right Chest"]?.letters?.title}
                          </text>
                        </>
                      )}

                    {designs["Right Chest"]?.letters?.type ===
                      "Ready To Use" && designs["Right Chest"]?.letters.path && (
                        <g style={{ transform: "translate(-35px, -40px)" }}>
                          <svg
                            width="73"
                            height="82"
                            viewBox={
                              designs["Right Chest"]?.letters.path.match(
                                /viewBox="(.*?)"/
                              )[1]
                            }
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {designs["Right Chest"]?.letters.path
                              .match(/(<path.*?><\/path>)/g)
                              .map((li, idx) => {
                                const pClass = li.match(/class="(.*?)"/)[1];
                                const pShape = li.match(/d="(.*?)"/)[1];
                                let color;

                                if (pClass === "cjd-fill") {
                                  color =
                                    designs["Right Chest"]?.letters.fill ||
                                    "#fff";
                                } else if (pClass === "cjd-stroke") {
                                  color =
                                    designs["Right Chest"]?.letters.stroke ||
                                    "#8089a2";
                                } else {
                                  color =
                                    designs["Right Chest"]?.letters.border ||
                                    "#525a6f";
                                }
                                return (
                                  <path key={idx} d={pShape} fill={color}></path>
                                );
                              })}
                          </svg>
                        </g>
                      )}
                  </g>
                </g>
              )}

              {designs["Right Chest"]?.symbol && (
                <g style={{ transform: "translate(151px, 171px)" }}>
                  {designs["Right Chest"]?.symbol.type === "Badges" && (
                    <svg
                      width="74"
                      height="74"
                      viewBox="0 0 74 74"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Right Chest"]?.symbol.fill}
                        stroke={designs["Right Chest"]?.symbol.stroke}
                        border={designs["Right Chest"]?.symbol.border}
                      />
                    </svg>
                  )}

                  {designs["Right Chest"]?.symbol.type === "Mascots" && (
                    <svg
                      width="74"
                      height="74"
                      viewBox="0 0 74 74"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="74"
                        height="74"
                        xlinkHref={require(`../../assets/images/mascots/${designs["Right Chest"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  )}

                  {designs["Right Chest"]?.symbol.type === "Flags" && (
                    <svg
                      width="74"
                      height="74"
                      viewBox="0 0 74 74"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="74"
                        height="74"
                        xlinkHref={require(`../../assets/images/flags/${designs["Right Chest"]?.symbol.flag}.svg`)}
                      />
                      <rect
                        x="2"
                        y="14"
                        width="70"
                        height="46"
                        fill="none"
                        strokeWidth="4"
                        stroke={designs.fill}
                      ></rect>
                    </svg>
                  )}
                </g>
              )}

              {designs["Right Chest"]?.upload && (
                <g style={{ transform: "translate(145px, 165px)" }}>
                  <image
                    xlinkHref={designs["Right Chest"]?.upload.file}
                    width="85"
                    height="85"
                  />
                </g>
              )}
            </>
          )}
        </g>
      )}

      {!designs["Left Chest"]?.done && !designs["Right Chest"]?.done && (
        <g
          id="front-center-wrapper"
          style={{ transform: "translate(-28px, 0)" }}
        >
          <rect
            className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
            x="124.32"
            y="142"
            width="267"
            height="44.92"
            fill="#e6e6e6"
            data-name="front-center"
            onClick={() => openModal("Front Center")}
          />

          <g style={{ transform: "translate(257px, 164px)" }}>
            <g>
              {designs["Front Center"]?.done && (
                <g className="name">
                  <path
                    id="frontArt"
                    d="M57.019,348.069c0-104.42,84.649-189.07,189.069-189.07 s189.069,84.649,189.069,189.07"
                    fill="none"
                    style={{ transform: "translate(-245px, -168px)" }}
                  />
                  <text
                    x="0"
                    y="0"
                    fontFamily={designs["Front Center"]?.name?.font}
                    fill={designs["Front Center"]?.name?.fill}
                    stroke={designs["Front Center"]?.name?.stroke}
                    strokeWidth="2.5"
                    fontSize={designs["Front Center"]?.name?.size}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ paintOrder: "stroke fill" }}
                  >
                    {designs["Front Center"]?.name?.appearance === "Arc" ? (
                      <textPath
                        alignmentBaseline="middle"
                        xlinkHref="#frontArt"
                        startOffset="50%"
                        style={{ letterSpacing: '1px' }}
                      >
                        {designs["Front Center"]?.name?.title}
                      </textPath>
                    ) : (
                      <tspan alignmentBaseline="middle">
                        {designs["Front Center"]?.name?.title}
                      </tspan>
                    )}
                  </text>
                </g>
              )}
            </g>
          </g>
        </g>
      )}

      {!designs["Front Center"]?.done && (
        <g id="left-chest" style={{ transform: "translate(-28px, 0px)" }}>
          <rect
            className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
            x="280"
            y="165"
            width="85"
            height="85"
            fill="#e6e6e6"
            data-name="left-chest"
            data-patch="true" // fitted like a sleeve patch (utils/autoFitText.js)
            onClick={() => openModal("Left Chest")}
          />
          {designs["Left Chest"]?.done && (
            <>
              {designs["Left Chest"]?.name && (
                <g
                  className="name"
                  style={{ transform: "translate(322px, 208px)" }}
                >
                  <text
                    x="0"
                    y="0"
                    fontFamily={designs["Left Chest"]?.name?.font}
                    fill={designs["Left Chest"]?.name?.fill}
                    stroke={designs["Left Chest"]?.name?.stroke}
                    strokeWidth="2"
                    style={{ paintOrder: "stroke fill" }}
                    fontSize={designs["Left Chest"]?.name?.size}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan alignmentBaseline="middle">
                      {designs["Left Chest"]?.name?.title}
                    </tspan>
                  </text>
                </g>
              )}

              {designs["Left Chest"]?.letters && (
                <g
                  className="letters"
                  style={{ transform: "translate(322px, 207px)" }}
                >
                  {designs["Left Chest"]?.letters?.type === "Type Your Own" && (
                    <>
                      <text
                        x="0"
                        y="0"
                        fontFamily={designs["Left Chest"]?.letters?.font}
                        fill="none"
                        fontSize={designs["Left Chest"]?.letters?.size}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        strokeWidth="8"
                        stroke={designs["Left Chest"]?.letters?.border}
                      >
                        {designs["Left Chest"]?.letters?.appearance ===
                          "Staggered"
                          ? getStaggeredElm(
                            designs["Left Chest"]?.letters?.title
                          )
                          : designs["Left Chest"]?.letters?.title}
                      </text>

                      <text
                        x="0"
                        y="0"
                        fontFamily={designs["Left Chest"]?.letters?.font}
                        fill={designs["Left Chest"]?.letters?.fill}
                        fontSize={designs["Left Chest"]?.letters?.size}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        strokeWidth="4"
                        stroke={designs["Left Chest"]?.letters?.stroke}
                      >
                        {designs["Left Chest"]?.letters?.appearance ===
                          "Staggered"
                          ? getStaggeredElm(
                            designs["Left Chest"]?.letters?.title
                          )
                          : designs["Left Chest"]?.letters?.title}
                      </text>
                    </>
                  )}

                  {designs["Left Chest"]?.letters?.type === "Ready To Use" && designs["Left Chest"]?.letters.path && (
                    <g style={{ transform: "translate(-35px, -40px)" }}>
                      <svg
                        width="73"
                        height="82"
                        viewBox={
                          designs["Left Chest"]?.letters.path.match(
                            /viewBox="(.*?)"/
                          )[1]
                        }
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {designs["Left Chest"]?.letters.path
                          .match(/(<path.*?><\/path>)/g)
                          .map((li, idx) => {
                            const pClass = li.match(/class="(.*?)"/)[1];
                            const pShape = li.match(/d="(.*?)"/)[1];
                            let color;

                            if (pClass === "cjd-fill") {
                              color =
                                designs["Left Chest"]?.letters.fill || "#fff";
                            } else if (pClass === "cjd-stroke") {
                              color =
                                designs["Left Chest"]?.letters.stroke ||
                                "#8089a2";
                            } else {
                              color =
                                designs["Left Chest"]?.letters.border ||
                                "#525a6f";
                            }
                            return (
                              <path key={idx} d={pShape} fill={color}></path>
                            );
                          })}
                      </svg>
                    </g>
                  )}
                </g>
              )}

              {designs["Left Chest"]?.symbol && (
                <g style={{ transform: "translate(286px, 171px)" }}>
                  {designs["Left Chest"]?.symbol.type === "Badges" && (
                    <svg
                      width="74"
                      height="74"
                      viewBox="0 0 74 74"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Left Chest"]?.symbol.fill}
                        stroke={designs["Left Chest"]?.symbol.stroke}
                        border={designs["Left Chest"]?.symbol.border}
                      />
                    </svg>
                  )}

                  {designs["Left Chest"]?.symbol.type === "Mascots" && (
                    <svg
                      width="74"
                      height="74"
                      viewBox="0 0 74 74"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="74"
                        height="74"
                        xlinkHref={require(`../../assets/images/mascots/${designs["Left Chest"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  )}

                  {designs["Left Chest"]?.symbol.type === "Flags" && (
                    <svg
                      width="74"
                      height="74"
                      viewBox="0 0 74 74"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="74"
                        height="74"
                        xlinkHref={require(`../../assets/images/flags/${designs["Left Chest"]?.symbol.flag}.svg`)}
                      />
                      <rect
                        x="2"
                        y="14"
                        width="70"
                        height="46"
                        fill="none"
                        strokeWidth="4"
                        stroke={designs.fill}
                      ></rect>
                    </svg>
                  )}
                </g>
              )}

              {designs["Left Chest"]?.upload && (
                <g style={{ transform: "translate(280px, 165px)" }}>
                  <image
                    xlinkHref={designs["Left Chest"]?.upload.file}
                    width="85"
                    height="85"
                  />
                </g>
              )}
            </>
          )}
        </g>
      )}
      {globals.catName !== 'Hoodies' && !laddiesJacket && (
        <g id="right-pocket">
          <rect
            className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
            x="150"
            y="410"
            width="55"
            height="55"
            fill="#e6e6e6"
            data-name="right-pocket"
            data-patch="true" // fitted like a sleeve patch (utils/autoFitText.js)
            onClick={() => openModal("Right Pocket")}
          />
          {designs["Right Pocket"]?.done && (
            <g>
              {designs["Right Pocket"]?.letters?.type ===
                "Ready To Use" && designs["Right Pocket"]?.letters.path && (
                  <g>
                    <svg {...pocketLetterBox(150, designs["Right Pocket"].letters.path)}>
                      {designs["Right Pocket"]?.letters.path
                        .match(/(<path.*?><\/path>)/g)
                        .map((li, idx) => {
                          const pClass = li.match(/class="(.*?)"/)[1];
                          const pShape = li.match(/d="(.*?)"/)[1];
                          let color;

                          if (pClass === "cjd-fill") {
                            color =
                              designs["Right Pocket"]?.letters.fill || "#fff";
                          } else if (pClass === "cjd-stroke") {
                            color =
                              designs["Right Pocket"]?.letters.stroke ||
                              "#8089a2";
                          } else {
                            color =
                              designs["Right Pocket"]?.letters.border ||
                              "#525a6f";
                          }
                          return (
                            <path key={idx} d={pShape} fill={color}></path>
                          );
                        })}
                    </svg>
                  </g>
                )}

              {designs["Right Pocket"]?.letters?.type ===
                "Type Your Own" && (
                  <g transform="translate(178, 437)">
                    {(() => {
                      const text = designs["Right Pocket"]?.letters.title || "";
                      const textLength = text.length;
                      const maxSize = 45; // Pocket area size (55 - 10 for padding)

                      // Calculate font size based on text length - same logic for both pockets
                      let fontSize;
                      if (textLength === 1) {
                        fontSize = 50; // Single letter - large and bold
                      } else if (textLength === 2) {
                        fontSize = 28; // Two letters
                      } else if (textLength === 3) {
                        fontSize = 22; // Three letters
                      } else {
                        fontSize = 19; // Four letters
                      }

                      return (
                        <text
                          x="0"
                          y="0"
                          fontFamily={designs["Right Pocket"]?.letters?.font}
                          fill="none"
                          fontSize={fontSize}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          strokeWidth="8"
                          stroke={designs["Right Pocket"]?.letters?.border}
                          style={{ paintOrder: "stroke fill" }}
                        >
                          {designs["Right Pocket"].letters?.appearance ===
                            "Staggered"
                            ? getStaggeredElm(
                              designs["Right Pocket"].letters?.title
                            )
                            : designs["Right Pocket"].letters?.title}
                        </text>
                      );
                    })()}

                    {(() => {
                      const text = designs["Right Pocket"]?.letters.title || "";
                      const textLength = text.length;
                      const maxSize = 45; // Pocket area size (55 - 10 for padding)

                      // Calculate font size based on text length - same logic for both pockets
                      let fontSize;
                      if (textLength === 1) {
                        fontSize = 50; // Single letter - large and bold
                      } else if (textLength === 2) {
                        fontSize = 28; // Two letters
                      } else if (textLength === 3) {
                        fontSize = 22; // Three letters
                      } else {
                        fontSize = 19; // Four letters
                      }

                      return (
                        <text
                          x="0"
                          y="0"
                          fontFamily={designs["Right Pocket"]?.letters?.font}
                          fill={designs["Right Pocket"]?.letters?.fill}
                          fontSize={fontSize}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          strokeWidth="4"
                          stroke={designs["Right Pocket"]?.letters?.stroke}
                          style={{ paintOrder: "stroke fill" }}
                        >
                          {designs["Right Pocket"].letters?.appearance ===
                            "Staggered"
                            ? getStaggeredElm(
                              designs["Right Pocket"].letters?.title
                            )
                            : designs["Right Pocket"].letters?.title}
                        </text>
                      );
                    })()}
                  </g>
                )}

              {designs["Right Pocket"]?.symbol && (
                <>
                  {designs["Right Pocket"]?.symbol.type === "Badges" && (
                    <g transform="translate(150, 410)">
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <BadgeTemp
                          fill={designs["Right Pocket"]?.symbol.fill}
                          stroke={designs["Right Pocket"]?.symbol.stroke}
                          border={designs["Right Pocket"]?.symbol.border}
                        />
                      </svg>
                    </g>
                  )}

                  {designs["Right Pocket"]?.symbol.type === "Flags" && (
                    <g transform="translate(150, 410)">
                      <svg
                        width="54"
                        height="54"
                        viewBox="0 0 44 44"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <image
                          width="44"
                          height="44"
                          xlinkHref={require(`../../assets/images/flags/${designs["Right Pocket"]?.symbol.flag}.svg`)}
                        />
                        <rect
                          x="1"
                          y="8.3"
                          width="42"
                          height="27.5"
                          fill="none"
                          strokeWidth="2"
                          stroke={designs.fill}
                        ></rect>
                      </svg>
                    </g>
                  )}

                  {designs["Right Pocket"]?.symbol.type === "Mascots" && (
                    <g transform="translate(150, 410)">
                      <svg
                        width="54"
                        height="54"
                        viewBox="0 0 44 44"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <image
                          width="44"
                          height="44"
                          xlinkHref={require(`../../assets/images/mascots/${designs["Right Pocket"]?.symbol.flag}.svg`)}
                        />
                      </svg>
                    </g>
                  )}
                </>
              )}

              {designs["Right Pocket"]?.upload && (
                <g transform="translate(150, 409)">
                  <image
                    xlinkHref={designs["Right Pocket"]?.upload.file}
                    width="57"
                    height="57"
                  />
                </g>
              )}
            </g>
          )}
        </g>
      )}

      {globals.catName !== 'Hoodies' && !laddiesJacket && (
        <g id="left-pocket">
          <rect
            className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
            x="250"
            y="410"
            width="55"
            height="55"
            fill="#e6e6e6"
            data-name="left-pocket"
            data-patch="true" // fitted like a sleeve patch (utils/autoFitText.js)
            onClick={() => openModal("Left Pocket")}
          />
          {designs["Left Pocket"]?.done && (
            <g>
              {designs["Left Pocket"]?.letters && (
                <>
                  {designs["Left Pocket"]?.letters?.type ===
                    "Ready To Use" && designs["Left Pocket"]?.letters.path && (
                      <g>
                        <svg {...pocketLetterBox(250, designs["Left Pocket"].letters.path)}>
                          {designs["Left Pocket"]?.letters.path
                            .match(/(<path.*?><\/path>)/g)
                            .map((li, idx) => {
                              const pClass = li.match(/class="(.*?)"/)[1];
                              const pShape = li.match(/d="(.*?)"/)[1];
                              let color;

                              if (pClass === "cjd-fill") {
                                color =
                                  designs["Left Pocket"]?.letters.fill ||
                                  "#fff";
                              } else if (pClass === "cjd-stroke") {
                                color =
                                  designs["Left Pocket"]?.letters.stroke ||
                                  "#8089a2";
                              } else {
                                color =
                                  designs["Left Pocket"]?.letters.border ||
                                  "#525a6f";
                              }
                              return (
                                <path
                                  key={idx}
                                  d={pShape}
                                  fill={color}
                                ></path>
                              );
                            })}
                        </svg>
                      </g>
                    )}

                  {designs["Left Pocket"]?.letters?.type ===
                    "Type Your Own" && (
                      <g transform="translate(276, 438)">
                        {(() => {
                          const text = designs["Left Pocket"]?.letters.title || "";
                          const textLength = text.length;
                          const maxSize = 45; // Pocket area size (55 - 10 for padding)

                          // Calculate font size based on text length - same logic for both pockets
                          let fontSize;
                          if (textLength === 1) {
                            fontSize = 50; // Single letter - large and bold
                          } else if (textLength === 2) {
                            fontSize = 28; // Two letters
                          } else if (textLength === 3) {
                            fontSize = 22; // Three letters
                          } else {
                            fontSize = 19; // Four letters
                          }

                          return (
                            <text
                              x="0"
                              y="0"
                              fontFamily={designs["Left Pocket"]?.letters?.font}
                              fill="none"
                              fontSize={fontSize}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              strokeWidth="8"
                              stroke={designs["Left Pocket"]?.letters?.border}
                            >
                              {designs["Left Pocket"].letters?.appearance ===
                                "Staggered"
                                ? getStaggeredElm(
                                  designs["Left Pocket"].letters?.title
                                )
                                : designs["Left Pocket"].letters?.title}
                            </text>
                          );
                        })()}

                        {(() => {
                          const text = designs["Left Pocket"]?.letters.title || "";
                          const textLength = text.length;
                          const maxSize = 45; // Pocket area size (55 - 10 for padding)

                          // Calculate font size based on text length - same logic for both pockets
                          let fontSize;
                          if (textLength === 1) {
                            fontSize = 50; // Single letter - large and bold
                          } else if (textLength === 2) {
                            fontSize = 28; // Two letters
                          } else if (textLength === 3) {
                            fontSize = 22; // Three letters
                          } else {
                            fontSize = 19; // Four letters
                          }

                          return (
                            <text
                              x="0"
                              y="0"
                              fontFamily={designs["Left Pocket"]?.letters?.font}
                              fill={designs["Left Pocket"]?.letters?.fill}
                              fontSize={fontSize}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              strokeWidth="4"
                              stroke={designs["Left Pocket"]?.letters?.stroke}
                            >
                              {designs["Left Pocket"].letters?.appearance ===
                                "Staggered"
                                ? getStaggeredElm(
                                  designs["Left Pocket"].letters?.title
                                )
                                : designs["Left Pocket"].letters?.title}
                            </text>
                          );
                        })()}
                      </g>
                    )}
                </>
              )}

              {designs["Left Pocket"]?.symbol && (
                <>
                  {designs["Left Pocket"]?.symbol.type === "Badges" && (
                    <g transform="translate(252, 410)">
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <BadgeTemp
                          fill={designs["Left Pocket"]?.symbol.fill}
                          stroke={designs["Left Pocket"]?.symbol.stroke}
                          border={designs["Left Pocket"]?.symbol.border}
                        />
                      </svg>
                    </g>
                  )}

                  {designs["Left Pocket"]?.symbol.type === "Flags" && (
                    <g transform="translate(250, 410)">
                      <svg
                        width="54"
                        height="54"
                        viewBox="0 0 44 44"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <image
                          width="44"
                          height="44"
                          xlinkHref={require(`../../assets/images/flags/${designs["Left Pocket"]?.symbol.flag}.svg`)}
                        />
                        <rect
                          x="1"
                          y="8.3"
                          width="42"
                          height="27.5"
                          fill="none"
                          strokeWidth="2"
                          stroke={designs.fill}
                        ></rect>
                      </svg>
                    </g>
                  )}

                  {designs["Left Pocket"]?.symbol.type === "Mascots" && (
                    <g transform="translate(252, 410)">
                      <svg
                        width="54"
                        height="54"
                        viewBox="0 0 44 44"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <image
                          width="44"
                          height="44"
                          xlinkHref={require(`../../assets/images/mascots/${designs["Left Pocket"]?.symbol.flag}.svg`)}
                        />
                      </svg>
                    </g>
                  )}
                </>
              )}

              {designs["Left Pocket"]?.upload && (
                <g transform="translate(250, 409)">
                  <image
                    xlinkHref={designs["Left Pocket"]?.upload.file}
                    width="57"
                    height="57"
                  />
                </g>
              )}
            </g>
          )}
        </g>
      )}

    </svg>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  jackets: state.jackets,
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

export default connect(mapStateToProps, mapDispatchToProps)(Coach);
