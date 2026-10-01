import React from "react";
import { connect } from "react-redux";

import { modalState, activeSidebar, colorPicker } from "../../store/actions";

// Collar
import Simple from "./collar/simple";
import SimpleBomber from "./collar/simple-bomber";
import Sailor from "./collar/sailor";
import RollUp from "./collar/rollup";
import Hood from "./collar/hood";
import Classic from "./collar/classic";
import ZipperHood from "./collar/zipprHood";
import Band from "./collar/band";
import BadgeTemp from "./badge";

// Sleeves
import { SetIn, Raglan } from "./sleeves";

const JacketBack = ({
  globals,
  modalState,
  activeSidebar,
  colorPicker,
  styles,
  materials,
  colors,
  designs,
  advance,
  flip = false,
  pose,
}) => {
  const openModal = (tab) => {
    modalState("title", tab);
    modalState("open", true);
    activeSidebar(globals.catName === "Hoodies" ? 3 : 4);

    if (designs[tab]?.done) {
      if (designs[tab]?.name) {
        modalState("index", 0);
        modalState("tab", "name");
      } else if (designs[tab]?.letters) {
        modalState(
          "index",
          tab === "Left Pocket" ||
            tab === "Right Pocket" ||
            tab === "Back Middle"
            ? 0
            : 1
        );
        modalState("tab", "letters");
      } else if (designs[tab]?.editables) {
        modalState("index", 1);
        modalState("tab", "editables");
      } else if (designs[tab]?.symbol) {
        modalState(
          "index",
          tab === "Left Pocket" ||
            tab === "Right Pocket" ||
            tab === "Back Middle"
            ? 1
            : 2
        );
        modalState("tab", "symbol");
      }
    } else {
      modalState("index", 0);
    }
  };

  let laddiesJacket = globals.productId === "4893" ? true : false;

  return (
    <>
      <svg
        id="jacketBack"
        viewBox="0 0 514.73 545.96"
        xmlns="http://www.w3.org/2000/svg"
        className={pose ? "" : "cjd-hide"}
      >
        <g id="cjd-jackets">
          {advance.stripes && styles.sleeves === "Set-In" && (
            <path
              d="M525.06,279.19c-1.79-15.1,3.47-19.43-2.49-35.42C500.45,184.48,480.69,120,454.2,61.71,448.46,48,435.8,38.36,417.76,30.45c-4-1.74-8-3.28-12.21-4.89C391.37,20.2,381.92,18,367.37,14.5,356.44,11.84,346.28,9,333.9,6,315-1.65,213.63,1.43,194.37,6,182,9,171.83,11.84,160.9,14.5c-14.55,3.53-24,5.7-38.18,11.06-4.24,1.61-8.22,3.15-12.2,4.89C92.48,38.36,79.81,48,74.07,61.71,47.58,120,27.83,184.48,5.71,243.77c-6,16-.71,20.32-2.5,35.42a287,287,0,0,0-1.15,57.27c.8,9.65,4.44,20.56,6.27,29.82a294.18,294.18,0,0,1,5,38.53c.11,2.12,4.59,2.23,5.17,4.16.79,2.62-3.11,7.22-2,9.73C22,431,31.41,430.2,37.14,439c21.76-3.71,43.1-7.29,64.86-11-.65-11.47,2.68-21.79,1.67-32.79-.62-6.81-5.39-12.6-6-24.94l-.18-3.78c-.71-15,.16-30.4-.4-45.6-.13-3.39-3.33-5.81-3.6-9.18-.24-2.91,3.7-5.8,3.8-8.82.08-2.49-4.43-4.23-4.39-6.79,0-3.3,5.22-1.82,5.52-3.85.43-2.82-4.63-4.25-4.77-6.73,1.07-1.83,4.74-1.93,5.57-3.88,7.33-17.24,21.91-41.6,28.25-58.56-1.62,11.79,275,11.79,273.34,0,6.33,17,20.91,41.32,28.24,58.56.83,1.95,4.5,2.05,5.58,3.88-.14,2.48-5.2,3.91-4.78,6.73.31,2,5.48.55,5.53,3.85,0,2.56-4.48,4.3-4.4,6.79.1,3,4,5.91,3.81,8.82-.27,3.37-3.48,5.79-3.6,9.18-.57,15.2.3,30.59-.4,45.6-.06,1.26-.12,2.52-.19,3.78-.61,12.34-5.38,18.13-6,24.94-1,11,3,20.32,2.4,31.79,21.76,3.71,43.24,8.29,65,12,5.73-8.8,14.27-8,19.73-20.3,1.12-2.51-2.78-7.11-2-9.73.58-1.93,5.06-2,5.18-4.16a294.11,294.11,0,0,1,5-38.53c1.83-9.26,5.47-20.17,6.27-29.82A285.54,285.54,0,0,0,525.06,279.19Z"
              transform="translate(-7, 65)"
              fill={colors.stripes ? colors.stripes : "#000000"}
              fillRule="evenodd"
              className="cjd-color-hover"
              onClick={() => colorPicker("stripes")}
            />
          )}

          {advance.sleevesPiping && styles.sleeves === "Raglan" && (
            <path
              d="M525.06,279.19c-1.79-15.1,3.47-19.43-2.49-35.42C500.45,184.48,480.69,120,454.2,61.71,448.46,48,435.8,38.36,417.76,30.45c-4-1.74-8-3.28-12.21-4.89C391.37,20.2,381.92,18,367.37,14.5,356.44,11.84,346.28,9,333.9,6,315-1.65,213.63,1.43,194.37,6,182,9,171.83,11.84,160.9,14.5c-14.55,3.53-24,5.7-38.18,11.06-4.24,1.61-8.22,3.15-12.2,4.89C92.48,38.36,79.81,48,74.07,61.71,47.58,120,27.83,184.48,5.71,243.77c-6,16-.71,20.32-2.5,35.42a287,287,0,0,0-1.15,57.27c.8,9.65,4.44,20.56,6.27,29.82a294.18,294.18,0,0,1,5,38.53c.11,2.12,4.59,2.23,5.17,4.16.79,2.62-3.11,7.22-2,9.73C22,431,31.41,430.2,37.14,439c21.76-3.71,43.1-7.29,64.86-11-.65-11.47,2.68-21.79,1.67-32.79-.62-6.81-5.39-12.6-6-24.94l-.18-3.78c-.71-15,.16-30.4-.4-45.6-.13-3.39-3.33-5.81-3.6-9.18-.24-2.91,3.7-5.8,3.8-8.82.08-2.49-4.43-4.23-4.39-6.79,0-3.3,5.22-1.82,5.52-3.85.43-2.82-4.63-4.25-4.77-6.73,1.07-1.83,4.74-1.93,5.57-3.88,7.33-17.24,21.91-41.6,28.25-58.56-1.62,11.79,275,11.79,273.34,0,6.33,17,20.91,41.32,28.24,58.56.83,1.95,4.5,2.05,5.58,3.88-.14,2.48-5.2,3.91-4.78,6.73.31,2,5.48.55,5.53,3.85,0,2.56-4.48,4.3-4.4,6.79.1,3,4,5.91,3.81,8.82-.27,3.37-3.48,5.79-3.6,9.18-.57,15.2.3,30.59-.4,45.6-.06,1.26-.12,2.52-.19,3.78-.61,12.34-5.38,18.13-6,24.94-1,11,3,20.32,2.4,31.79,21.76,3.71,43.24,8.29,65,12,5.73-8.8,14.27-8,19.73-20.3,1.12-2.51-2.78-7.11-2-9.73.58-1.93,5.06-2,5.18-4.16a294.11,294.11,0,0,1,5-38.53c1.83-9.26,5.47-20.17,6.27-29.82A285.54,285.54,0,0,0,525.06,279.19Z"
              transform="translate(-7, 65)"
              stroke="#ffffff"
              strokeWidth="6px"
              fill={colors.piping ? colors.piping : "#eadc32"}
              fillRule="evenodd"
              className="cjd-color-hover"
              onClick={() => colorPicker("piping")}
            />
          )}

          <g id="cjd-jacket-base">
            <path
              d={
                laddiesJacket
                  ? "M257.13 445.65C187.59 442.86 131.19 436.71 119.79 419.02C119.92 403.02 120.03 388.12 120.16 372.12C186.42 399.77 343.45 399.98 394.09 372.12C394.22 388.12 394.33 403.02 394.46 419.02C383.06 436.71 326.66 442.86 257.13 445.65Z"
                  : "M257.13,528.65c-69.54-2.79-125.94-8.94-137.34-26.63.13-16,.24-30.9.37-46.9,66.26,27.65,223.29,27.86,273.93,0,.13,16,.24,30.9.37,46.9-11.4,17.69-67.8,23.84-137.33,26.63Z"
              }
              fill={colors.base ? colors.base : "#ffffff"}
              stroke={colors.base == "#000000" ? "#ffffff" : "#231f20"}
              strokeMiterlimit="2.6131"
              strokeWidth="1px"
              className="cjd-color-hover"
              onClick={() => colorPicker("base")}
            />

            <g
              className="cjd-color-hover"
              onClick={() => colorPicker("lines")}
              fill={colors.lines ? colors.lines : "#e6e6e6"}
              fillRule="evenodd"
              strokeWidth="1px"
              stroke={
                styles.knit === "Double Line Border"
                  ? colors.border
                    ? colors.border
                    : "#000000"
                  : ""
              }
              transform={laddiesJacket ? "" : "translate(-426, 107.9)"}
            >
              {(styles.knit === "Double Line" ||
                styles.knit === "Double Line Border") && (
                  <path
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                    d={
                      laddiesJacket
                        ? "M120.23 384.27L120.16 393.22C129.32 399.44 142.54 404.08 159 407.47C174.703 410.526 190.586 412.576 206.55 413.61C240.202 416.155 273.998 416.155 307.65 413.61C323.742 412.582 339.751 410.524 355.58 407.45C372.03 404.06 385.26 399.45 394.42 393.2L394.35 384.25L392.35 385.98C384.04 392.34 370.97 397.07 354.17 400.53C338.68 403.522 323.015 405.526 307.27 406.53C273.818 409.075 240.222 409.075 206.77 406.53C191.206 405.507 175.722 403.503 160.41 400.53C143.61 397.07 130.53 392.34 122.23 385.98L120.23 384.25V384.27ZM206.54 420.73C191.053 419.701 175.645 417.697 160.41 414.73C143.61 411.26 130.53 406.53 122.23 400.18L120.12 398.35L120.05 407.35C129.21 413.61 142.48 418.27 159.05 421.68C174.708 424.723 190.543 426.767 206.46 427.8C240.281 430.38 274.249 430.38 308.07 427.8C324.037 426.764 339.922 424.716 355.63 421.67C372.15 418.26 385.42 413.6 394.58 407.34L394.51 398.34L392.4 400.17C384.09 406.52 371.02 411.25 354.22 414.72C338.855 417.699 323.318 419.703 307.7 420.72C274.046 423.29 240.244 423.29 206.59 420.72L206.54 420.73Z"
                        : "M546.23,359.37l-.07,8.95c9.16,6.22,22.38,10.86,38.84,14.25a376.23,376.23,0,0,0,47.55,6.14,670.32,670.32,0,0,0,101.1,0,377.75,377.75,0,0,0,47.93-6.16c16.45-3.39,29.68-8,38.84-14.25l-.07-8.95-2,1.73c-8.31,6.36-21.38,11.09-38.18,14.55a372.13,372.13,0,0,1-46.9,6,662.4,662.4,0,0,1-100.5,0,370.65,370.65,0,0,1-46.36-6c-16.8-3.46-29.88-8.19-38.18-14.55l-2-1.73Zm86.31,36.46a369.45,369.45,0,0,1-46.13-6c-16.8-3.47-29.88-8.2-38.18-14.55l-2.11-1.83-.07,9c9.16,6.26,22.43,10.92,39,14.33a376.35,376.35,0,0,0,47.41,6.12,667.93,667.93,0,0,0,101.61,0,378.62,378.62,0,0,0,47.56-6.13c16.52-3.41,29.79-8.07,38.95-14.33l-.07-9-2.11,1.83c-8.31,6.35-21.38,11.08-38.18,14.55a371.24,371.24,0,0,1-46.52,6,664,664,0,0,1-101.11,0Z"
                    }
                  />
                )}
            </g>

            {(styles.knit === "Single Line" ||
              styles.knit === "Single Line Border") && (
                <path
                  className="cjd-color-hover"
                  onClick={() => colorPicker("lines")}
                  id="knit_single"
                  data-name="knit single"
                  d="M820.29,366.92v13c-23.9,11.14-59.63,16.46-101,19v-12C763.62,384.57,799.43,378.84,820.29,366.92Zm-274,13c23.9,11.14,59.63,16.46,101,19v-12c-44.33-2.35-80.14-8.08-101-20Zm101,19a484.62,484.62,0,0,0,72,0v-12c-25.24,1-49.26,1.1-72,0Z"
                  strokeWidth="1px"
                  fill={colors.lines ? colors.lines : "#cacae8"}
                  style={{
                    stroke:
                      styles.knit === "Single Line Border" &&
                      // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                      (colors.border ? colors.border : "#000000"),
                  }}
                  transform={
                    laddiesJacket
                      ? "translate(-426, 28)"
                      : "translate(-426, 107.9)"
                  }
                />
              )}
          </g>

          <path
            d={
              laddiesJacket
                ? "M390.27 288.33C401.58 238.82 418.36 186.47 442.36 130.75C436.77 117.36 424.36 107.94 406.77 100.22C402.85 98.52 398.99 97.01 394.85 95.45C380.99 90.21 371.77 88.08 357.56 84.64C346.87 82.05 336.96 79.29 324.87 76.29C306.43 68.87 207.43 71.87 188.62 76.29C176.53 79.29 166.62 82.05 155.93 84.64C141.72 88.08 132.5 90.21 118.64 95.47C114.5 97.03 110.64 98.54 106.72 100.24C89.13 108 76.72 117.38 71.13 130.77C95.13 186.47 111.95 238.77 123.28 288.37C123.01 312.53 108.16 321.36 108.03 347.55C108 357.94 114 364.06 119.8 372.77C127.5 383 166.94 390.66 220.37 392.55C246.87 394.15 271.57 395.27 292.89 393.11C345.25 390.95 381.5 385 393.73 372.76C399.55 364.05 405.55 357.93 405.5 347.54C405.36 321.35 390.56 312.48 390.27 288.33Z"
                : "M325.36,252.47c-1.9-12-3.51-22.63-5.09-34.14,11.31-49.51,28.09-101.86,52.09-157.58-5.59-13.39-18-22.81-35.59-30.53-3.92-1.7-7.78-3.21-11.92-4.77-13.86-5.24-23.08-7.37-37.29-10.81-10.69-2.59-20.6-5.35-32.69-8.35-18.44-7.42-117.44-4.42-136.25,0-12.09,3-22,5.76-32.69,8.35C71.72,18.08,62.5,20.21,48.64,25.47c-4.14,1.56-8,3.07-11.92,4.77C19.13,38,6.72,47.38,1.13,60.77c24,55.7,40.82,108,52.15,157.6-1.58,11.51-3.19,22.1-5.09,34.1-2.33,14.73-2.57,10.39,2.27,24-.27,24.16-12.3,51.89-12.43,78.08C38,364.94,44,377.06,49.8,385.77c1.67,11.35,47.14,17.89,100.57,19.78,26.5,1.6,51.2,2.72,72.52.56,52.36-2.16,97.22-9.53,100.84-20.35,5.82-8.71,11.82-20.83,11.77-31.22-.14-26.19-12.14-53.92-12.43-78.07C327.91,262.9,327.67,267.24,325.36,252.47Z"
            }
            fill={colors.body ? colors.body : "#ffffff"}
            stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
            strokeMiterlimit="2.61"
            className="cjd-color-hover"
            onClick={() => colorPicker("body")}
            transform={laddiesJacket ? "" : "translate(70, 70)"}
          />

          {advance.inserts &&
            !advance.stripes &&
            styles.sleeves === "Set-In" && (
              <>
                {advance.insertsCount === 2 ? (
                  <g id="Inserts" transform="translate(71.3, 94)">
                    <g id="Inserts_Right" data-name="Inserts Right">
                      <path
                        d="M42.46,153.21C31.15,114.63,23.3,91.12,1.07,37.93,2.77,30.71,18.86,15.46,21.22,16,21.22,16,61.59,79.59,42.46,153.21Z"
                        transform="translate(-0.55 -0.38)"
                        fill={colors.inserts ? colors.inserts : "#000000"}
                        stroke={colors.inserts ? colors.inserts : "#000000"}
                        strokeMiterlimit="10"
                        className="cjd-color-hover"
                        onClick={() => colorPicker("inserts")}
                      />
                      <path
                        d="M54.58,115.73C53.2,71.39,37.18,32.49,27.39,12.18A172.67,172.67,0,0,1,53.9,1S75.24,53,76,103.21c-3,52.56-30.55,60.71-30.55,60.71s2.5-6.07,3.54-9.84A106.52,106.52,0,0,0,54.58,115.73Z"
                        transform="translate(-0.55 -0.38)"
                        fill={
                          colors.insertsUpper ? colors.insertsUpper : "#000000"
                        }
                        stroke={
                          colors.insertsUpper ? colors.insertsUpper : "#000000"
                        }
                        strokeMiterlimit="10"
                        className="cjd-color-hover"
                        onClick={() => colorPicker("insertsUpper")}
                      />
                      {advance.piping && (
                        <>
                          <path
                            d="M42.46,153.21C31.15,114.63,23.3,91.12,1.07,37.93,2.77,30.71,18.86,15.46,21.22,16,21.22,16,61.59,79.59,42.46,153.21Z"
                            transform="translate(-0.55 -0.38)"
                            fill="none"
                            strokeWidth="3"
                            stroke={colors.piping ? colors.piping : "pink"}
                            strokeMiterlimit="10"
                          />
                          <path
                            d="M54.58,115.73C53.2,71.39,37.18,32.49,27.39,12.18A172.67,172.67,0,0,1,53.9,1S75.24,53,76,103.21c-3,52.56-30.55,60.71-30.55,60.71s2.5-6.07,3.54-9.84A106.52,106.52,0,0,0,54.58,115.73Z"
                            transform="translate(-0.55 -0.38)"
                            fill="none"
                            strokeWidth="3"
                            stroke={colors.piping ? colors.piping : "pink"}
                            strokeMiterlimit="10"
                          />
                        </>
                      )}
                    </g>

                    <g id="Inserts_Left" data-name="Inserts Left">
                      <path
                        d="M331.41,154.18c11.31-38.58,19.16-62.09,41.35-115.28C371.1,31.66,355,16.43,352.63,17,352.63,17,312.28,80.56,331.41,154.18Z"
                        transform="translate(-0.55 -0.38)"
                        fill={colors.inserts ? colors.inserts : "#000000"}
                        stroke={colors.inserts ? colors.inserts : "#000000"}
                        strokeMiterlimit="10"
                        className="cjd-color-hover"
                        onClick={() => colorPicker("inserts")}
                      />
                      <path
                        d="M318.51,115.73c1.38-44.34,17.4-83.24,27.19-103.55A171.84,171.84,0,0,0,319.19,1s-21.34,52-22.08,102.21c3,52.56,30.55,60.71,30.55,60.71s-2.5-6.07-3.54-9.84A107,107,0,0,1,318.51,115.73Z"
                        transform="translate(-0.55 -0.38)"
                        fill={
                          colors.insertsUpper ? colors.insertsUpper : "#000000"
                        }
                        stroke={
                          colors.insertsUpper ? colors.insertsUpper : "#000000"
                        }
                        strokeMiterlimit="10"
                        className="cjd-color-hover"
                        onClick={() => colorPicker("insertsUpper")}
                      />
                      {advance.piping && (
                        <>
                          <path
                            d="M331.41,154.18c11.31-38.58,19.16-62.09,41.35-115.28C371.1,31.66,355,16.43,352.63,17,352.63,17,312.28,80.56,331.41,154.18Z"
                            transform="translate(-0.55 -0.38)"
                            fill="none"
                            strokeWidth="3"
                            stroke={colors.piping ? colors.piping : "pink"}
                            strokeMiterlimit="10"
                          />
                          <path
                            d="M318.51,115.73c1.38-44.34,17.4-83.24,27.19-103.55A171.84,171.84,0,0,0,319.19,1s-21.34,52-22.08,102.21c3,52.56,30.55,60.71,30.55,60.71s-2.5-6.07-3.54-9.84A107,107,0,0,1,318.51,115.73Z"
                            transform="translate(-0.55 -0.38)"
                            fill="none"
                            strokeWidth="3"
                            stroke={colors.piping ? colors.piping : "pink"}
                            strokeMiterlimit="10"
                          />
                        </>
                      )}
                    </g>
                  </g>
                ) : (
                  <g
                    id="Inserts"
                    transform="translate(71.3, 105)"
                    className="cjd-color-hover"
                    onClick={() => colorPicker("inserts")}
                  >
                    <path
                      d="M47.59,173.61C37.4,135.12,24.53,85.83.54,32.47,4.8,19.52,30.12,3.29,39.59.61,39.59.61,69.59,101.61,47.59,173.61Z"
                      transform="translate(-1, -7)"
                      fill={colors.inserts ? colors.inserts : "#000000"}
                      stroke="#404041"
                      strokeMiterlimit="10"
                      strokeWidth="1"
                    />
                    <path
                      d="M8.56,173.61C18.75,135.12,31.62,85.83,55.62,32.47,51.35,19.52,26,3.29,16.56.61,16.56.61-13.44,101.61,8.56,173.61Z"
                      transform="translate(316, -7)"
                      fill={colors.inserts ? colors.inserts : "#000000"}
                      stroke="#404041"
                      strokeMiterlimit="10"
                      strokeWidth="1"
                    />
                  </g>
                )}
              </>
            )}

          {styles.sleeves === "Raglan" ? (
            <Raglan
              colorPicker={(part) => colorPicker(part)}
              color={colors.sleeves ? colors.sleeves : "#ffffff"}
            />
          ) : (
            <SetIn
              colorPicker={(part) => colorPicker(part)}
              color={colors.sleeves ? colors.sleeves : "#ffffff"}
            />
          )}

          {globals.bomber && advance.sleevePocket && (
            <g
              id="sleeve_zipper_back"
              data-name="sleeve zipper back"
              transform="translate(20, 200)"
              className="cjd-color-hover"
              onClick={() => colorPicker("pockets")}
            >
              <path
                d="M31,74.71h0L.6,63.33C2.48,57.43,21.05,1.08,22.9.44L54.16,12.89Z"
                transform="translate(-0.6 -0.44)"
                fill={colors.pockets ? colors.pockets : "#e6e6e6"}
              />
              <path
                d="M31,74.71h0L11.22,67.3l-10.61-4c.93-2.66,1-2.83,1-2.83L11,64l17-45.53.93.35L12,64.38l9.51,3.55,17-45.53L18.54,15l0,.08c.11-.34.23-.69.34-1l20.93,7.83L22.4,68.28l6.88,2.57,21-56.2L22.15,4.13c.33-.95.65-1.9,1-2.84l31,11.6Z"
                transform="translate(-0.6 -0.44)"
                fillOpacity="0.2"
              />
            </g>
          )}

          {!advance.stripes &&
            advance.piping &&
            advance.inserts &&
            advance.insertsCount === 1 &&
            styles.sleeves === "Set-In" && (
              <g
                id="piping"
                className="cjd-color-hover"
                onClick={() => colorPicker("piping")}
                fill="none"
                stroke={colors.piping ? colors.piping : "#eadc32"}
                strokeMiterlimit="10"
                strokeWidth="1.5"
                transform="translate(70.8, 99)"
              >
                <path d="M371.41,31.14c-19.55,49.41-30.55,82.41-47.55,138.41" />
                <path d="M332.86.55c-13,40-23,114-9,169" />
                <path d="M48.24,169.23c-17-56-28-89-47.54-138.4" />
                <path d="M48.24,169.23c14-55,4-129-9-169" />
              </g>
            )}

          {!advance.stripes &&
            advance.piping &&
            styles.sleeves === "Raglan" && (
              <g
                className="cjd-color-hover"
                onClick={() => colorPicker("piping")}
                transform="translate(123, 83)"
                strokeWidth="1.5"
              >
                <path
                  d="M1.45,205.18C3.43,103.57-5.3,40.26,70.66.53"
                  transform="translate(-0.95 -0.09)"
                  fill="none"
                  stroke={colors.piping ? colors.piping : "#eadc32"}
                  strokeMiterlimit="10"
                />
                <path
                  d="M268.66,205.18c-2-101.61,6.75-164.92-69.21-204.65"
                  transform="translate(-0.95 -0.09)"
                  fill="none"
                  stroke={colors.piping ? colors.piping : "#eadc32"}
                  strokeMiterlimit="10"
                />
              </g>
            )}

          {advance.stripes && advance.piping && (
            <g
              id="Stripe_Pipe"
              data-name="Stripe Pipe"
              className="cjd-color-hover"
              onClick={() => colorPicker("piping")}
              transform="translate(0, 75)"
            >
              <path
                d="M37.36,428a71.92,71.92,0,0,0-8.43-8.93,55.93,55.93,0,0,1-11.55-14.17,12.85,12.85,0,0,1-.08-3.38L19,397.15a2.94,2.94,0,0,0-.3-3.07l-3.16-1.49A2.65,2.65,0,0,1,14,390c-1.37-19.25-4.24-37.24-8.66-52.94a79.68,79.68,0,0,1-2.4-13c-1.35-15.63-.46-35,1.2-55.62a84.78,84.78,0,0,0,0-13.9A48.18,48.18,0,0,1,5.9,235.17l15.5-42.45,13-37.15,15-41.2L67.1,70l6.38-14.53C78.76,45,87.09,37,97.87,30.88c12.8-6.64,27.43-12.06,43.16-16.73l50.7-13"
                transform="translate(-1.27 -0.17)"
                fill="none"
                stroke={colors.piping ? colors.piping : "#eadc32"}
                strokeMiterlimit="10"
                strokeWidth="3"
                fillRule="evenodd"
              />
              <path
                d="M480.64,428a71.92,71.92,0,0,1,8.43-8.93,55.93,55.93,0,0,0,11.55-14.17,12.85,12.85,0,0,0,.08-3.38L499,397.15a2.94,2.94,0,0,1,.3-3.07l3.16-1.49A2.65,2.65,0,0,0,504,390c1.37-19.25,4.24-37.24,8.66-52.94a79.68,79.68,0,0,0,2.4-13c1.35-15.63.46-35-1.2-55.62a84.78,84.78,0,0,1,0-13.9,48.18,48.18,0,0,0-1.77-19.38l-15.5-42.45-13-37.15-15-41.2L450.9,70l-6.38-14.53C439.24,45,430.91,37,420.13,30.88,407.33,24.24,392.7,18.82,377,14.15l-50.7-13"
                transform="translate(-1.27 -0.17)"
                fill="none"
                stroke={colors.piping ? colors.piping : "#eadc32"}
                strokeMiterlimit="10"
                strokeWidth="3"
                fillRule="evenodd"
              />
            </g>
          )}

          {!advance.proCuff && (
            <>
              <path
                d="m415.08 491.52c25.36-2.43 46.31 1.65 63.75 10.88l-13.46 43.11c-24.3 1.14-43.53-2.8-58.26-11.24l8-42.75z"
                fill={colors.base ? colors.base : "#ffffff"}
                fillRule="evenodd"
                data-name="cuff base"
                stroke={colors.base == "#000000" ? "#ffffff" : "#231f20"}
                strokeMiterlimit="2.6131"
                strokeWidth="1px"
                className="cjd-color-hover"
                onClick={() => colorPicker("base")}
              />

              {(styles.knit === "Double Line" ||
                styles.knit === "Double Line Border") && (
                  <g
                    className="cjd-color-hover"
                    onClick={() => colorPicker("lines")}
                    fill={colors.lines ? colors.lines : "#e6e6e6"}
                    fillRule="evenodd"
                    strokeWidth="1"
                    data-name="knit double"
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        (colors.border ? colors.border : "#000000"),
                    }}
                  >
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      strokeWidth="1"
                      stroke="black"
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          (colors.border ? colors.border : "#000000"),
                      }}
                      d="M471.91,524.57l-2.18,7-.7-.46a83,83,0,0,0-26.81-9.93,135.46,135.46,0,0,0-31.49-2l-.81.07,1.34-7.16a141.3,141.3,0,0,1,32.29,2.15,90.51,90.51,0,0,1,28.36,10.37Z"
                    />
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          (colors.border ? colors.border : "#000000"),
                      }}
                      d="M475.24,513.9l-2.18,7-.76-.49A81.71,81.71,0,0,0,445,509.89a134,134,0,0,0-32.19-2.14l-.82.13,1.35-7.22a139.36,139.36,0,0,1,33,2.31,89.19,89.19,0,0,1,28.82,10.93Z"
                    />
                  </g>
                )}

              {(styles.knit === "Single Line" ||
                styles.knit === "Single Line Border") && (
                  <g
                    className="cjd-color-hover"
                    onClick={() => colorPicker("lines")}
                    fill={colors.lines ? colors.lines : "#e6e6e6"}
                    fillRule="evenodd"
                    strokeWidth="1"
                    data-name="knit single"
                    style={{
                      stroke:
                        styles.knit === "Single Line Border" &&
                        (colors.border ? colors.border : "#000000"),
                    }}
                  >
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Single Line Border" &&
                          (colors.border ? colors.border : "#000000"),
                      }}
                      d="m473.56 519.28c-18.37-7.17-38.87-11.37-61.24-12.95l-2.22 11.94a179 179 0 0 1 59.83 12.62z"
                    />
                  </g>
                )}

              <path
                d="m99.69 491.52c-25.36-2.43-46.3 1.65-63.75 10.88l13.47 43.11c24.3 1.14 43.53-2.8 58.25-11.24l-8-42.75z"
                data-name="cuff base"
                fillRule="evenodd"
                stroke={colors.base == "#000000" ? "#ffffff" : "#231f20"}
                strokeMiterlimit="2.6131"
                strokeWidth="1px"
                fill={colors.base ? colors.base : "#ffffff"}
                className="cjd-color-hover"
                onClick={() => colorPicker("base")}
              />

              {(styles.knit === "Double Line" ||
                styles.knit === "Double Line Border") && (
                  <g
                    fillRule="evenodd"
                    data-name="knit double"
                    strokeWidth="1"
                    fill={colors.lines ? colors.lines : "#e6e6e6"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        (colors.border ? colors.border : "#000000"),
                    }}
                    className="cjd-color-hover"
                    onClick={() => colorPicker("lines")}
                  >
                    <path
                      d="M42.87,524.57l2.17,7,.71-.46a83.06,83.06,0,0,1,26.8-9.93,135.55,135.55,0,0,1,31.5-2l.81.07-1.34-7.16a141.39,141.39,0,0,0-32.3,2.15,90.45,90.45,0,0,0-28.35,10.37Z"
                      data-name="bottom"
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          (colors.border ? colors.border : "#000000"),
                      }}
                    />
                    <path
                      d="M39.53,513.9l2.18,7,.76-.49a81.77,81.77,0,0,1,27.27-10.49,133.9,133.9,0,0,1,32.18-2.14l.82.13-1.34-7.22A139.44,139.44,0,0,0,68.35,503,89.28,89.28,0,0,0,39.53,513.9Z"
                      data-name="top"
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          (colors.border ? colors.border : "#000000"),
                      }}
                    />
                  </g>
                )}

              {(styles.knit === "Single Line" ||
                styles.knit === "Single Line Border") && (
                  <g
                    fill={colors.lines ? colors.lines : "#e6e6e6"}
                    fillRule="evenodd"
                    data-name="knit single"
                    strokeWidth="1"
                    style={{
                      stroke:
                        styles.knit === "Single Line Border" &&
                        (colors.border ? colors.border : "#000000"),
                    }}
                    className="cjd-color-hover"
                    onClick={() => colorPicker("lines")}
                  >
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Single Line Border" &&
                          (colors.border ? colors.border : "#000000"),
                      }}
                      d="m41.21 519.28c18.38-7.17 38.88-11.37 61.24-12.95l2.23 11.94a179.06 179.06 0 0 0-59.84 12.62z"
                      data-name="trim"
                    />
                  </g>
                )}
            </>
          )}

          {advance.proCuff && (
            <>
              <g
                id="cuff_pro"
                data-name="cuff pro"
                className="cjd-color-hover"
                onClick={() => colorPicker("sleeves")}
                transform="translate(35.5, 491.2)"
              >
                <path
                  id="cuff_base"
                  data-name="cuff base"
                  d="M379.79.59C402.57,4,423.45,8.24,443.54,11.47L433.08,42.58,374.82,31.34l5-30.75Z"
                  transform="translate(-0.13 -0.13)"
                  fill={colors.sleeves ? colors.sleeves : "#ffffff"}
                  stroke="#404041"
                  strokeMiterlimit="10"
                  strokeWidth="1"
                  fillRule="evenodd"
                />

                <path
                  id="cuff_base-2"
                  data-name="cuff base"
                  d="M64.21.41C41.43,3.84,20.55,8.06.46,11.29L10.92,42.41,69.18,31.16,64.21.41Z"
                  transform="translate(-0.13 -0.13)"
                  fill={colors.sleeves ? colors.sleeves : "#ffffff"}
                  stroke="#404041"
                  strokeMiterlimit="10"
                  strokeWidth="1"
                  fillRule="evenodd"
                />
              </g>

              <g transform="translate(51, 435)">
                <g>
                  <path
                    d="M388.88,92.12c-1.5-.4-6.4-7.9-8.8-12.8a3.79,3.79,0,0,1,1.6-5c4.4-2.5,13.2-7.7,15.6-8.1l5-24.7,8.4-41.4-7.4,41.6-4.4,24.7c-1.7-.3-10.2,4.4-14.9,7.1a4,4,0,0,0-1.7,5.2c2.3,4.9,6.4,13.3,7.9,13.7"
                    transform="translate(-0.88 -0.12)"
                    opacity="0.25"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M390.48,82.92a4.8,4.8,0,0,0,4.8-4.8,4.8,4.8,0,1,0-9.6,0A4.8,4.8,0,0,0,390.48,82.92Zm0-1a3.9,3.9,0,0,1-3.9-3.9,3.9,3.9,0,1,1,7.8,0A3.9,3.9,0,0,1,390.48,81.92Z"
                    transform="translate(-0.88 -0.12)"
                    opacity="0.25"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M391.08,93.32c-.5-.1-1.9-.5-8.5-14.2a4.39,4.39,0,0,1,1.8-5.7c8.9-5,14-7.4,15.4-7.1l-.2,1c-.8-.2-5,1.6-14.6,7a3.51,3.51,0,0,0-1.4,4.4c4.7,9.8,7.2,13.5,7.9,13.7Z"
                    transform="translate(-0.88 -0.12)"
                    fill="#9ca1a4"
                  />
                </g>
                <g>
                  <path
                    d="M22.68,92.12c1.5-.4,6.4-7.9,8.8-12.8a3.79,3.79,0,0,0-1.6-5c-4.4-2.5-13.2-7.7-15.6-8.1l-5-24.7L.88.12l7.4,41.6,4.4,24.7c1.7-.3,10.2,4.4,14.9,7.1a4,4,0,0,1,1.7,5.2c-2.3,4.9-6.4,13.3-7.9,13.7"
                    transform="translate(-0.88 -0.12)"
                    opacity="0.25"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M26,78a4.8,4.8,0,0,0-4.8-4.8,4.8,4.8,0,0,0,0,9.6A4.8,4.8,0,0,0,26,78Zm-8.7,0a3.9,3.9,0,0,1,3.9-3.9,3.9,3.9,0,1,1-3.9,3.9Z"
                    transform="translate(-0.88 -0.12)"
                    opacity="0.25"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M20.48,93.32c.5-.1,1.9-.5,8.5-14.2a4.39,4.39,0,0,0-1.8-5.7c-8.9-5-14-7.4-15.4-7.1l.2,1c.8-.2,5,1.6,14.6,7a3.51,3.51,0,0,1,1.4,4.4c-4.7,9.8-7.2,13.5-7.9,13.7Z"
                    transform="translate(-0.88 -0.12)"
                    fill="#9ca1a4"
                  />
                </g>
              </g>
            </>
          )}

          {styles.collar === "Zipper Hood" && (
            <ZipperHood
              colorPicker={(part) => colorPicker(part)}
              outside={colors.outside ? colors.outside : "#ffffff"}
              inside={colors.inside ? colors.inside : "#ffffff"}
              zipper={colors.zip ? colors.zip : "#c4c6c6"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}          <g
            id="back-middle"
            transform={
              globals.catName === "Hoodies"
                ? "translate(0, 65)"
                : "translate(0, 0)"
            }
          >
            <rect
              className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
              x="133"
              y="175"
              width="245"
              height={globals.productId == "4893" ? 140 : 190}
              fill="#e6e6e6"
              data-name="cjd-back-middle"
              onClick={() => openModal("Back Middle")}
            />

            {designs["Back Middle"]?.done && designs["Back Middle"]?.name && (
              <g
                transform={
                  laddiesJacket
                    ? "translate(256, 265)"
                    : "translate(256, 253)"
                }
              >
                <path
                  id="backMiddleArc"
                  d="M101.689,171.438 c78.71-78.71,206.092-78.71,284.802,0"
                  fill="none"
                  transform="translate(-242, -115)"
                ></path>
                <text
                  x="0"
                  y={globals.productId === "4893" ? -20 : 20}
                  fontFamily={designs["Back Middle"]?.name.font}
                  fill={designs["Back Middle"]?.name.fill}
                  stroke={designs["Back Middle"]?.name?.stroke}
                  strokeWidth="5.5"
                  fontSize={
                    globals.productId === "4893"
                      ? designs["Back Middle"]?.name?.title?.length <= 2
                        ? designs["Back Middle"]?.name?.font === "Cutive" ||
                          designs["Back Middle"]?.name?.font === "Graduate"
                          ? 140
                          : 170
                        : designs["Back Middle"]?.name?.title?.length === 3
                          ? designs["Back Middle"]?.name?.font === "Cutive" ||
                            designs["Back Middle"]?.name?.font === "Graduate"
                            ? 120
                            : 155
                          : designs["Back Middle"]?.name?.title?.length === 4
                            ? designs["Back Middle"]?.name?.font === "Cutive" ||
                              designs["Back Middle"]?.name?.font === "Graduate"
                              ? 90
                              : 115
                            : designs["Back Middle"]?.name?.title?.length === 5
                              ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                designs["Back Middle"]?.name?.font === "Graduate"
                                ? 70
                                : 95
                              : designs["Back Middle"]?.name?.title?.length === 6
                                ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                  designs["Back Middle"]?.name?.font === "Graduate"
                                  ? 50
                                  : 80
                                : designs["Back Middle"]?.name?.title?.length === 7
                                  ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                    designs["Back Middle"]?.name?.font === "Graduate"
                                    ? 55
                                    : 60
                                  : designs["Back Middle"]?.name?.title?.length === 8
                                    ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                      designs["Back Middle"]?.name?.font === "Graduate"
                                      ? 40
                                      : 55
                                    : designs["Back Middle"]?.name?.title?.length === 9
                                      ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                        designs["Back Middle"]?.name?.font === "Graduate"
                                        ? 35
                                        : 45
                                      : designs["Back Middle"]?.name?.title?.length === 10
                                        ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                          designs["Back Middle"]?.name?.font === "Graduate"
                                          ? 35
                                          : 40
                                        : designs["Back Middle"]?.name?.title?.length >= 11
                                          ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                            designs["Back Middle"]?.name?.font === "Graduate"
                                            ? 30
                                            : 38
                                          : designs["Back Middle"]?.name?.size
                      : designs["Back Middle"]?.name?.title?.length === 12
                        ? designs["Back Middle"]?.name?.font === "Graduate" ||
                          designs["Back Middle"]?.name?.font === "Cutive" ||
                          designs["Back Middle"]?.name?.font === "Rookie" ||
                          designs["Back Middle"]?.name?.font === "Merienda One"
                          ? 32
                          : 35
                        : designs["Back Middle"]?.name?.title?.length <= 2
                          ? designs["Back Middle"]?.name?.font === "Cutive" ||
                            designs["Back Middle"]?.name?.font === "Graduate"
                            ? 160
                            : 230
                          : designs["Back Middle"]?.name?.title?.length === 3
                            ? designs["Back Middle"]?.name?.font === "Cutive" ||
                              designs["Back Middle"]?.name?.font === "Graduate"
                              ? 125
                              : 160
                            : designs["Back Middle"]?.name?.title?.length === 4
                              ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                designs["Back Middle"]?.name?.font === "Graduate"
                                ? 90
                                : 120
                              : designs["Back Middle"]?.name?.title?.length === 5
                                ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                  designs["Back Middle"]?.name?.font === "Graduate"
                                  ? 70
                                  : 90
                                : designs["Back Middle"]?.name?.title?.length === 6
                                  ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                    designs["Back Middle"]?.name?.font === "Graduate"
                                    ? 60
                                    : 70
                                  : designs["Back Middle"]?.name?.title?.length === 7
                                    ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                      designs["Back Middle"]?.name?.font === "Graduate"
                                      ? 50
                                      : 60
                                    : designs["Back Middle"]?.name?.title?.length === 8
                                      ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                        designs["Back Middle"]?.name?.font === "Graduate"
                                        ? 40
                                        : 50
                                      : designs["Back Middle"]?.name?.title?.length === 9
                                        ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                          designs["Back Middle"]?.name?.font === "Graduate"
                                          ? 40
                                          : 45
                                        : designs["Back Middle"]?.name?.title?.length === 10
                                          ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                            designs["Back Middle"]?.name?.font === "Graduate"
                                            ? 35
                                            : 40
                                          : designs["Back Middle"]?.name?.title?.length === 11
                                            ? designs["Back Middle"]?.name?.font === "Cutive" ||
                                              designs["Back Middle"]?.name?.font === "Graduate"
                                              ? 30
                                              : 35
                                            : designs["Back Middle"]?.name?.size
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ paintOrder: "stroke fill" }}
                >
                  {designs["Back Middle"].name.appearance === "Arc" ? (
                    <textPath
                      alignmentBaseline="middle"
                      xlinkHref="#backMiddleArc"
                      startOffset="50%"
                      style={{ letterSpacing: "1px" }}
                      fontSize={
                        globals.productId === "4893"
                          ? (
                            designs["Back Middle"]?.name?.title?.length <= 2
                              ? 130
                              : designs["Back Middle"]?.name?.title?.length === 3
                                ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                  designs["Back Middle"]?.name?.font === "Graduate"
                                  ? 110
                                  : 130)
                                : designs["Back Middle"]?.name?.title?.length === 4
                                  ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                    designs["Back Middle"]?.name?.font === "Graduate"
                                    ? 85
                                    : 110)
                                  : designs["Back Middle"]?.name?.title?.length === 5
                                    ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                      designs["Back Middle"]?.name?.font === "Graduate"
                                      ? 70
                                      : 90)
                                    : designs["Back Middle"]?.name?.title?.length === 6
                                      ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                        designs["Back Middle"]?.name?.font === "Graduate"
                                        ? 55
                                        : 70)
                                      : designs["Back Middle"]?.name?.title?.length === 7
                                        ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                          designs["Back Middle"]?.name?.font === "Graduate"
                                          ? 45
                                          : 60)
                                        : designs["Back Middle"]?.name?.title?.length === 8
                                          ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                            designs["Back Middle"]?.name?.font === "Graduate"
                                            ? 40
                                            : 50)
                                          : (designs["Back Middle"]?.name?.font === "Cutive" ||
                                            designs["Back Middle"]?.name?.font === "Graduate"
                                            ? 28
                                            : 36)
                          )
                          : (
                            // 🧩 Keep your existing logic for other product IDs
                            designs["Back Middle"]?.name?.title?.length >= 12
                              ? (
                                designs["Back Middle"]?.name?.font === "Graduate" ||
                                  designs["Back Middle"]?.name?.font === "Cutive" ||
                                  designs["Back Middle"]?.name?.font === "Merienda One"
                                  ? 28
                                  : 38
                              )
                              : designs["Back Middle"]?.name?.title?.length === 2
                                ? 160
                                : designs["Back Middle"]?.name?.title?.length === 3
                                  ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                    designs["Back Middle"]?.name?.font === "Graduate"
                                    ? 110
                                    : 150)
                                  : designs["Back Middle"]?.name?.title?.length === 4
                                    ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                      designs["Back Middle"]?.name?.font === "Graduate"
                                      ? 85
                                      : 110)
                                    : designs["Back Middle"]?.name?.title?.length === 5
                                      ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                        designs["Back Middle"]?.name?.font === "Graduate"
                                        ? 70
                                        : 90)
                                      : designs["Back Middle"]?.name?.title?.length === 6
                                        ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                          designs["Back Middle"]?.name?.font === "Graduate"
                                          ? 55
                                          : 70)
                                        : designs["Back Middle"]?.name?.title?.length === 7
                                          ? (designs["Back Middle"]?.name?.font === "Cutive" ||
                                            designs["Back Middle"]?.name?.font === "Graduate"
                                            ? 45
                                            : 60)
                                          : designs["Back Middle"]?.name?.title?.length === 8
                                            ? 45
                                            : designs["Back Middle"]?.name?.size
                          )
                      }

                    >
                      {designs["Back Middle"]?.name.title}
                    </textPath>
                  ) : (
                    <tspan alignmentBaseline="middle">
                      {designs["Back Middle"]?.name.title}
                    </tspan>
                  )}
                </text>
              </g>
            )}

            {designs["Back Middle"]?.done &&
              designs["Back Middle"]?.editables && (
                <g transform="translate(160, 175)">
                  <svg
                    width="190"
                    height="190"
                    viewBox="0 0 190 190"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* <g dangerouslySetInnerHTML={{ __html: designs['Back Middle']?.editables.path }} /> */}
                    {designs["Back Middle"]?.editables.path
                      .match(/(<path.*?>|<text.*?>.*?<\/text>)/g)
                      .map((path, idx) => {
                        let pShape, color, pId, tPath;
                        const pClass = path.match(/class="(.*?)"/)[1];

                        pId = path.match(/id="(.*?)"/);
                        pId = pId === null ? "noId" : pId[1];

                        if (path.match(/^<text/) === null) {
                          pShape = path.match(/ d="(.*?)"/)[1];
                        } else {
                          const text = path.match(/<text.*?>(.*?)<\/text>/)[1];
                          tPath = text.match(/xlink:href="(.*?)"/)[1];
                        }

                        if (pClass === "cjd-fill") {
                          color = designs.fill || "#fff";
                        } else if (pClass === "cjd-stroke") {
                          color = designs.stroke || "#8089a2";
                        } else if (pClass === "cjd-none") {
                          color = "none";
                        } else {
                          color = designs.border || "#525a6f";
                        }

                        return (
                          <g key={idx}>
                            {path.match(/^<text/) ? (
                              <text
                                fontFamily="Franchise-Bold"
                                fontSize="18.3251px"
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <textPath
                                  xlinkHref={tPath}
                                  startOffset="50%"
                                  fill={color}
                                >
                                  {tPath === "#upperTextArc"
                                    ? designs["Back Middle"]?.editables.txt1
                                    : designs["Back Middle"]?.editables.txt2}
                                </textPath>
                              </text>
                            ) : (
                              <path id={pId} d={pShape} fill={color} />
                            )}
                          </g>
                        );
                      })}
                  </svg>
                </g>
              )}

            {designs["Back Middle"]?.done && designs["Back Middle"]?.symbol && (
              <g transform="translate(58, 175)">
                {designs["Back Middle"]?.symbol.type === "Flags" && (
                  <g transform="translate(0, 0)">
                    {/* the flag across the guide (245 wide, from x 133; 140 tall on the cropped varsity),
                        cropped to the flag and its outline: in a 190 square it used ~3/4 of the guide */}
                    <svg
                      x="80"
                      width="235"
                      height={globals.productId == "4893" ? 140 : 190}
                      viewBox="0 12 72 48"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="72"
                        height="72"
                        xlinkHref={require(`../../assets/images/flags/${designs["Back Middle"]?.symbol.flag}.svg`)}
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

                {designs["Back Middle"]?.symbol.type === "Mascots" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="400"
                      height="190"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="72"
                        height="72"
                        xlinkHref={require(`../../assets/images/mascots/${designs["Back Middle"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  </g>
                )}

                {designs["Back Middle"]?.symbol.type === "Badges" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="400"
                      height="190"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Back Middle"]?.symbol.fill}
                        stroke={designs["Back Middle"]?.symbol.stroke}
                        border={designs["Back Middle"]?.symbol.border}
                      />
                    </svg>
                  </g>
                )}
              </g>
            )}

            {designs["Back Middle"]?.done && designs["Back Middle"]?.upload && (
              <g transform="translate(145, 175)">
                <image
                  xlinkHref={designs["Back Middle"]?.upload.file}
                  width="230"
                  height="190"
                />
              </g>
            )}
          </g>

          {styles.collar === "Overlap" && (
            <Simple
              colorPicker={(part) => colorPicker(part)}
              knit={styles.knit}
              base={colors.base ? colors.base : "#ffffff"}
              lines={colors.lines ? colors.lines : "#cacae8"}
              border={colors.border ? colors.border : "#000000"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}

          {styles.collar === "Sailor" && (
            <Sailor
              colorPicker={(part) => colorPicker(part)}
              knit={styles.knit}
              base={colors.base ? colors.base : "#ffffff"}
              lines={colors.lines ? colors.lines : "#e6e6e6"}
              border={colors.border ? colors.border : "#000000"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}

          {styles.collar === "Shirt Collar" && (
            <RollUp
              colorPicker={(part) => colorPicker(part)}
              outside={colors.outside ? colors.outside : "#ffffff"}
              inside={colors.inside ? colors.inside : "#ffffff"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}

          {styles.collar === "Hood" && (
            <Hood
              colorPicker={(part) => colorPicker(part)}
              outside={colors.outside ? colors.outside : "#ffffff"}
              inside={colors.inside ? colors.inside : "#ffffff"}
              flip={true}
            />
          )}

          {styles.collar === "Classic" && !globals.bomber && (
            <Classic
              colorPicker={(part) => colorPicker(part)}
              knit={styles.knit}
              base={colors.base ? colors.base : "#ffffff"}
              lines={colors.lines ? colors.lines : "#cacae8"}
              border={colors.border ? colors.border : "#000000"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}

          {styles.collar === "Classic" && globals.bomber && (
            <SimpleBomber
              colorPicker={(part) => colorPicker(part)}
              knit={styles.knit}
              base={colors.base ? colors.base : "#ffffff"}
              lines={colors.lines ? colors.lines : "#e6e6e6"}
              border={colors.border ? colors.border : "#000000"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}

          {styles.collar === "Band" && (
            <Band
              colorPicker={(part) => colorPicker(part)}
              band={colors.band ? colors.band : "#ffffff"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={true}
            />
          )}

          <g
            id="back-top"
            transform={
              globals.catName === "Hoodies"
                ? "translate(0, 65)"
                : styles.collar === "Zipper Hood"
                  ? "translate(0, -15)"
                  : "translate(0, 0)"
            }
          >
            <rect
              className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
              x="128"
              y="110"
              width="260"
              height="45"
              fill="#e6e6e6"
              data-name="cjd-back-top"
              onClick={() => openModal("Back Top")}
            />

            {designs["Back Top"]?.done && designs["Back Top"]?.name && (
              <g transform="translate(258, 132.5)">
                {/* Shifted down 5 from the panel centre, curvature unchanged
                    (ends 12->17, controls -22->-17 keeps the same 25.5 depth).
                    Arced glyphs rise from the baseline, so with the arc centred
                    the fitted block — the name modal fits it into 260x34 — sat
                    hard against the top of the 45 unit panel: half a unit of air
                    above, ten and a half below. This puts 5.5 on each side. */}
                <path
                  id="backTopArc"
                  d="M-110,17 C-70,-17 70,-17 110,17"
                  fill="none"
                />

                <text
                  x="0"
                  y="0"
                  fontFamily={designs["Back Top"]?.name.font}
                  fill={designs["Back Top"]?.name.fill}
                  stroke={designs["Back Top"]?.name?.stroke}
                  strokeWidth="2.5"
                  fontSize={designs["Back Top"]?.name.size}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ paintOrder: "stroke fill" }}
                >
                  {designs["Back Top"]?.name.appearance === "Arc" ? (
                    <textPath
                      alignmentBaseline="middle"
                      xlinkHref="#backTopArc"
                      startOffset="50%"
                      style={{ letterSpacing: "2px" }}
                    >
                      {designs["Back Top"]?.name.title}
                    </textPath>
                  ) : (
                    <tspan alignmentBaseline="middle">
                      {designs["Back Top"]?.name.title}
                    </tspan>
                  )}
                </text>
              </g>
            )}
          </g>

          {globals.productId !== "5995" && (
            <g id="back-bottom">
              <rect
                className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
                x="150"
                y={globals.productId == "4893" ? 335 : 388}
                width="210"
                height="45"
                fill="#e6e6e6"
                data-name="cjd-back-bottom"
                onClick={() => openModal("Back Bottom")}
              />

              {designs["Back Bottom"]?.done && designs["Back Bottom"]?.name && (
                <g
                  transform={
                    globals.productId == "4893"
                      ? "translate(258, 350.5)"
                      : "translate(254, 410.5)"
                  }
                >
                  <path
                    id="backBottomArc"
                    d="M107.448,346.152
                c76.631,76.631,200.649,76.631,277.28,0"
                    fill="none"
                    transform="translate(-245, -393)"
                  />
                  <text
                    x="0"
                    y="0"
                    fontFamily={designs["Back Bottom"]?.name?.font}
                    fill={designs["Back Bottom"]?.name?.fill}
                    stroke={designs["Back Bottom"]?.name?.stroke}
                    strokeWidth="2.5"
                    fontSize={designs["Back Bottom"]?.name?.size}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ paintOrder: "stroke fill" }}
                  >
                    {designs["Back Bottom"]?.name?.appearance === "Arc" ? (
                      <textPath
                        alignmentBaseline="middle"
                        xlinkHref="#backBottomArc"
                        startOffset="50%"
                        style={{ letterSpacing: "1px" }}
                      >
                        {designs["Back Bottom"]?.name?.title}
                      </textPath>
                    ) : (
                      <tspan alignmentBaseline="middle">
                        {designs["Back Bottom"]?.name.title}
                      </tspan>
                    )}
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
    </>
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

export default connect(mapStateToProps, mapDispatchToProps)(JacketBack);
