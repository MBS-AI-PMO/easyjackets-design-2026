import React from "react";
import { connect } from "react-redux";

import { modalState, activeSidebar, colorPicker } from "../../store/actions";

import BadgeTemp from "./badge";
import { SLEEVE_PATCH, moveTransform, patchArt, patchGuide, patchMove } from "../../config/sleevePatches";

const JacketLeft = ({
  globals,
  advance,
  activeSidebar,
  colorPicker,
  modalState,
  styles,
  materials,
  colors,
  designs,
  pose,
}) => {
  const openModal = (tab) => {
    modalState("title", tab);
    modalState("open", true);
    activeSidebar(globals.hoodies ? 3 : 4);

    if (designs[tab]?.done) {
      if (designs[tab]?.name) modalState("index", 0);
      else if (designs[tab]?.letters) modalState("index", 1);
      else if (designs[tab]?.editables) modalState("index", 1);
      else if (designs[tab]?.symbol) modalState("index", 2);
    } else {
      modalState("index", 0);
    }
  };
  // Helper function to calculate optimal font size for mid sleeve patches
  // Helper function to calculate optimal font size for mid sleeve patches
  const getMidSleeveFontSize = (text, maxSize, boxWidth) => {
    const length = text?.trim().length || 0;
    if (length === 0) return maxSize;
    if (length === 1) return maxSize;

    // Calculate font size based on box width and text length
    // Approximate character width is about 0.6 of font size for most fonts
    const estimatedWidth = length * (maxSize * 0.6);

    if (estimatedWidth > boxWidth) {
      // Scale down to fit within box width
      const scaledSize = (boxWidth / length) / 0.6;
      return Math.max(15, Math.min(maxSize, Math.floor(scaledSize)));
    }

    return maxSize;
  };

  let laddiesJacket = globals.productId === '4893' ? true : false;

  const midUpperNameSize = getMidSleeveFontSize(
    designs["Left Mid Sleeve Upper"]?.name?.title,
    50,
    55
  );

  const midUpperLettersSize = getMidSleeveFontSize(
    designs["Left Mid Sleeve Upper"]?.letters?.title,
    50,
    55
  );

  const midLowerNameSize = getMidSleeveFontSize(
    designs["Left Mid Sleeve Lower"]?.name?.title,
    40,
    45
  );

  const midLowerLettersSize = getMidSleeveFontSize(
    designs["Left Mid Sleeve Lower"]?.letters?.title,
    40,
    45
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 223.45 531.51"
      style={{ transform: "scaleX(1)" }}
      id="jacketLeft"
      className={pose ? "" : "cjd-hide"}
    >
      <defs>
        <clipPath id="clip-path">
          <path
            d="M110.77,517c49.34-2.72,89.36-8.74,97.45-26-.09-15.65-.18-30.23-.26-45.88-47,27.05-158.43,27.26-194.37,0-.09,15.65-.17,30.23-.26,45.88,8.09,17.3,48.11,23.32,97.44,26Z"
            style={{ fill: "none", clipRule: "evenodd" }}
          />
        </clipPath>
        <clipPath id="clip-path-2">
          <path
            id="collar_base"
            data-name="collar base"
            d="M177.84,62.43c-6.46-13.22-9.59-28.55-10.21-45.46C142.44,9.9,118.3,16.59,98,37,85.51,49.56,63.6,73.14,65.52,90.17c38.07-9.91,67.79-39.07,112.32-27.74Z"
            style={{ fill: "none" }}
          />
        </clipPath>
        <clipPath id="clip-path-3">
          <path
            id="sailor_mask"
            data-name="sailor mask"
            d="M188.74,81.61l14.53,25.83c5.19,24.22,8,40.06,6.66,4.14-1-26.6-26.71-78.82-38.84-84.11-25.19-7.07-37.35-.32-57.67,20.11C101,60.12,63.7,73.12,65.61,90.14c29.62-7.71,54.18-25.34,84.59-28.23,26.73-2.53,26.83-1.11,38.54,19.7Z"
            style={{ fill: "none" }}
          />
        </clipPath>
        <clipPath id="clip-path-4">
          <path
            d="M72,466.94c23.49,5.85,41,16.14,53.66,29.93L100,531.22c-22.13-6.67-38.1-16.29-48.62-28.51L72,466.94Z"
            style={{ fill: "none", clipRule: "evenodd" }}
          />
        </clipPath>
        <clipPath id="clip-path-5" transform="translate(-570.26 -137.72)">
          <path
            d="M759,194.82l14.53,25.83c5.19,24.23,8,40.06,6.66,4.14-1-26.6-26.71-78.81-38.84-84.11-25.19-7.07-37.35-.32-57.67,20.11-12.47,12.54-49.72,25.54-47.81,42.56,29.62-7.7,54.18-25.34,84.6-28.22,26.72-2.54,26.83-1.12,38.53,19.69Z"
            fill="none"
            clipRule="evenodd"
          />
        </clipPath>
      </defs>
      <title>Jacket Left</title>
      <g id="Layer_1-2" data-name="Layer 1">
        <g id="jacket_base" data-name="jacket base">
          <path
            id="base_path"
            data-name="base path"
            d={
              laddiesJacket
                ? "M110.77 444C160.11 441.28 200.13 435.26 208.22 418C208.13 402.35 208.04 387.77 207.96 372.12C160.96 399.17 49.53 399.38 13.59 372.12C13.5 387.77 13.42 402.35 13.33 418C21.42 435.3 61.44 441.32 110.77 444Z"
                : "M110.77,516c49.34-2.72,89.36-8.74,  97.45-26-.09-15.65-.18-30.23-.26-45.88-47,27.05-158.43,27.26-194.37,0-.09,15.65-.17,30.23-.26,45.88,8.09,17.3,48.11,23.32,97.44,26Z"
            }
            fill={colors.base ? colors.base : "#ffffff"}
            stroke="#231f20"
            strokeMiterlimit="2.61312"
            strokeWidth="1px"
            className="cjd-color-hover"
            onClick={() => colorPicker("base")}
          />

          <g id="knit_double" data-name="knit double" strokeWidth="1px">
            <g
              className="cjd-color-hover"
              onClick={() => colorPicker("lines")}
              clipPath={laddiesJacket ? "" : "url(#clip-path)"}
              fill={colors.lines ? colors.lines : "#e6e6e6"}
              stroke={
                styles.knit === "Single Line Border" ||
                  styles.knit === "Double Line Border"
                  ? colors.border
                    ? colors.border
                    : "#000000"
                  : "transparent"
              }
            >
              {(styles.knit === "Double Line" ||
                styles.knit === "Double Line Border") && (
                  <path
                    id="knit_double-2"
                    data-name="knit double"
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                    d={
                      laddiesJacket
                        ? "M13.52 385V393.75C20 399.84 29.36 404.38 41 407.7C52.0534 410.666 63.3418 412.673 74.74 413.7C98.5883 416.195 122.632 416.195 146.48 413.7C157.965 412.686 169.341 410.679 180.48 407.7C192.16 404.38 201.54 399.84 208.04 393.76V385.01L206.62 386.7C200.73 392.91 191.45 397.54 179.53 400.93C168.627 403.849 157.492 405.82 146.25 406.82C122.549 409.315 98.6512 409.315 74.95 406.82C63.8184 405.803 52.7946 403.832 42 400.93C30.08 397.54 20.81 392.93 14.91 386.7L13.52 385ZM74.76 420.65C63.6939 419.649 52.7339 417.701 42 414.83C30.08 411.44 20.81 406.83 14.91 400.59L13.41 398.8V407.58C19.92 413.7 29.33 418.26 41.05 421.58C52.0707 424.54 63.3255 426.547 74.69 427.58C98.6573 430.1 122.823 430.1 146.79 427.58C158.188 426.55 169.476 424.543 180.53 421.58C192.26 418.24 201.67 413.68 208.17 407.58L208.12 398.8L206.62 400.59C200.73 406.81 191.45 411.44 179.53 414.83C168.718 417.726 157.678 419.686 146.53 420.69C122.683 423.21 98.6369 423.21 74.79 420.69L74.76 420.65Z"
                        : "M13.52,457l0,8.75C20,471.84,29.36,476.38,41,479.7a199.14,199.14,0,0,0,33.74,6,344.73,344.73,0,0,0,71.74,0,199.47,199.47,0,0,0,34-6c11.68-3.32,21.06-7.86,27.56-13.94l0-8.75-1.42,1.69c-5.89,6.21-15.17,10.84-27.09,14.23a195.76,195.76,0,0,1-33.28,5.89,340.53,340.53,0,0,1-71.3,0A195.37,195.37,0,0,1,42,472.93c-11.92-3.39-21.19-8-27.09-14.23L13.52,457Zm61.24,35.65A194.66,194.66,0,0,1,42,486.83c-11.92-3.39-21.19-8-27.09-14.24l-1.5-1.79,0,8.78c6.51,6.12,15.92,10.68,27.64,14a199.15,199.15,0,0,0,33.64,6,344.76,344.76,0,0,0,72.1,0,199.77,199.77,0,0,0,33.74-6c11.73-3.34,21.14-7.9,27.64-14l-.05-8.78-1.5,1.79c-5.89,6.22-15.17,10.85-27.09,14.24a195.18,195.18,0,0,1-33,5.86,341.33,341.33,0,0,1-71.74,0Z"
                    }
                  />
                )}

              {(styles.knit === "Single Line" ||
                styles.knit === "Single Line Border") && (
                  <path
                    transform={laddiesJacket ? "translate(0, -70)" : "translate(0, 3)"}

                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Single Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                    id="knit_single"
                    data-name="knit single"
                    d="M13.63,465.71c46.11,22.08,159.11,20.08,194.74,0v11.85c-44.63,19.23-154.63,21.23-194.74,0Z"
                  />
                )}
            </g>
          </g>
        </g>

        <path
          id="body"
          d={
            laddiesJacket
              ? "M211.749 290.7C212.929 305.52 210.999 315.09 220.459 339.35C226.459 358.24 221.379 369.98 207.709 376.17C163.579 401.55 62.7993 403.3 20.7993 380.89L13.0693 374.6C1.74931 364.63 -0.910694 346.53 0.249306 324.9C1.23931 306.46 9.23931 255.64 10.9793 237.28C14.3434 214.951 21.3685 186.922 25.2172 172.339C26.9503 165.773 29.4528 159.461 32.5755 153.43L65.2693 90.2899C103.339 80.3799 133.059 51.2199 177.519 62.5899C188.42 76.068 196.982 91.279 202.849 107.59C206.774 118.5 215.259 161.28 217.089 170.57C221.089 190.68 209.689 246.315 202.849 259.935L200.209 255.28L211.749 275.63V290.7ZM211.749 290.7C211.379 286.06 212.119 295.34 211.749 290.7Z"
              : "M13.32,443.48l7.73,6.29c42,22.41,142.78,20.66,186.91-4.72,13.67-6.19,18.75-17.93,12.75-36.82-9.46-24.26-2.32-19.91-3.5-34.73-.37-4.64-4.84-9.28-5.21-13.92l0-15.07-11.54-20.35,13.88-102.37c6.84-13.62,7-31.23,3-51.34-1.83-9.29-5.07-17.44-6.94-26.36-2.56-12.15-3.13-25.18-7.3-36.62a155,155,0,0,0-25.33-45C133.31,51.1,103.59,80.26,65.52,90.17L28.13,162.38C14,191.43,10.21,215.44,11.23,237.16c1.48,31.56-2.53,63.14-6.07,100.48C3.42,356,1.49,375.34.5,393.78-.66,415.41,2,433.51,13.32,443.48Z"
          }
          fill={colors.body ? colors.body : "#ffffff"}
          stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
          strokeMiterlimit="2.61312"
          strokeWidth="1px"
          className="cjd-color-hover"
          onClick={() => colorPicker("body")}
        />

        {advance.inserts && !advance.stripes && styles.sleeves === "Set-In" && (
          <>
            {advance.insertsCount === 2 ? (
              <g id="double" transform="translate(94, 75)">
                <path
                  d="M122.87,145c3.15-7.26,4.66-15.91,4.47-26a130.41,130.41,0,0,0-5-31.89c-1.36-4.54-3.21-10.89-4.57-16.84,0,0-20.18-48.14-49.25-46.55S27.85,56,20.33,74.58c-10.28,25.39-9.12,57.32-3,98.61L17,170.11c-2.88-37.23,1.25-73.48,17.75-104.23C40.63,55.65,47,47.08,54.48,42.44c5-3.18,9.77-3.24,15.74-2.84,10.6,1.11,20.46,6.21,29.12,17.7a83.75,83.75,0,0,1,9.82,17.31,139.69,139.69,0,0,1,8.18,26.17C120.68,115,121.82,131,122.87,145Z"
                  transform="translate(-1.12 -0.89)"
                  stroke="#000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cjd-color-hover"
                  onClick={() => colorPicker("inserts")}
                  fill={colors.inserts ? colors.inserts : "#000000"}
                />
                <path
                  d="M112.29,40S97.27,6.48,68.54,1.76c-31.49-5.17-51,44.45-60.15,63.86-16.21,41.5.4,97.5,11.28,126.75l-.26-3.08C8.22,160,5.32,103.7,15.27,76.18c8.6-27,20.88-43,39.21-55.74,19.92-9.1,46,6.42,60.76,34.39C115.24,54.83,112.86,42.52,112.29,40Z"
                  transform="translate(-1.12 -0.89)"
                  stroke="#000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cjd-color-hover"
                  onClick={() => colorPicker("insertsUpper")}
                  fill={colors.insertsUpper ? colors.insertsUpper : "#000000"}
                />
              </g>
            ) : (
              <path
                d="M116.61,130.78q4.74-10.89,4.48-26a131.38,131.38,0,0,0-5-31.89c-1.37-4.54-3.21-10.89-4.58-16.84,0,0-19.74-56.74-48.82-55.15s-48.46,38.86-56,57.45C-3.55,83.75.7,122.37,11,159l-.27-3.09C7.9,118.63,12,82.38,28.52,51.63c5.86-10.22,12.23-18.8,19.7-23.44C53.26,25,58,25,64,25.35c10.6,1.12,20.45,6.21,29.12,17.7a83.75,83.75,0,0,1,9.82,17.31,139.56,139.56,0,0,1,8.18,26.18C114.42,100.7,115.57,116.75,116.61,130.78Z"
                fill={colors.inserts ? colors.inserts : "#000000"}
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cjd-color-hover"
                onClick={() => colorPicker("inserts")}
                transform="translate(98.7, 88)"
              />
            )}
          </>
        )}

        {styles.sleeves === "Raglan" ? (
          <path
            id="raglan"
            d="M114.62,276.64c-7.76-36.77-7-68.53-2-94h0c6.65-33.64,25-85.36,14.7-117.33,10.89-3.7,22.24-6,34.67-5.36,21.16,32.57,33.9,66.82,44.14,101.57h0c4.27,13.87,6.92,29.85,8,46.67.42,18.22,2.28,36.7,2.25,54.93,0,23.43-2,46.54-1.62,69.25.27,15.84-5.67,18-8.77,31.76a266.42,266.42,0,0,1-16.7,50.46c-3.69,8.2-10.25,16.62-14.71,24.15a274.85,274.85,0,0,0-16.31,32.15c-.75,1.82-4.71.54-5.82,2-1.5,2.05.5,7.28-1.26,9.13-8.57,9.05-17.76,8.85-25.5,14.78L72,466.94c4.12-9.84,5.91-23,10.19-32.35,2.65-5.77,8.62-9.36,13-20,.44-1.08.88-2.16,1.33-3.24,5.26-12.92,9.25-26.65,14.45-39.78,1.16-2.92,4.71-4.05,6-6.91,1.11-2.48-1.44-6.22-.59-8.9.7-2.2,5.18-2.32,5.94-4.58,1-2.9-4-3.2-3.65-5.08.5-2.59,5.38-2.28,6.27-4.41-.38-1.93-3.56-3.15-3.68-5.11-1.09-17.36-6.31-43.17-6.61-60Z"
            fill={colors.sleeves ? colors.sleeves : "#ffffff"}
            stroke={colors.sleeves == "#000000" ? "#ffffff" : "#231f20"}
            strokeMiterlimit="2.61312"
            strokeWidth="1px"
            fillRule="evenodd"
            className="cjd-color-hover"
            onClick={() => colorPicker("sleeves")}
          />
        ) : (
          <path
            id="sleeve"
            d="M114.62,276.65C94,179,133.38,116.76,153.64,114c37.34-5.08,57.06,40.21,60.48,94.23,4.56,44.22,3,86,.63,124.18-1,15.81-5.67,18-8.77,31.76a266.08,266.08,0,0,1-16.7,50.45c-3.69,8.2-10.25,16.62-14.71,24.16a273.28,273.28,0,0,0-16.31,32.15c-.75,1.82-4.71.54-5.82,2-1.5,2,.5,7.27-1.26,9.13-8.57,9.05-17.76,8.85-25.5,14.78L72,466.94c4.12-9.83,5.91-23,10.19-32.34,2.65-5.77,8.62-9.36,13-20l1.32-3.25c5.27-12.91,9.26-26.64,14.46-39.77,1.16-2.93,4.71-4.05,6-6.92,1.11-2.47-1.44-6.22-.59-8.89.7-2.21,5.18-2.33,5.94-4.58,1-2.9-4-3.21-3.64-5.08.49-2.6,5.37-2.29,6.26-4.41-.38-1.93-3.56-3.15-3.68-5.11-1.09-17.36-6.31-43.17-6.61-60Z"
            fill={colors.sleeves ? colors.sleeves : "#ffffff"}
            stroke={colors.sleeves == "#000000" ? "#ffffff" : "#231f20"}
            strokeMiterlimit="2.61312"
            strokeWidth="1px"
            fillRule="evenodd"
            className="cjd-color-hover"
            onClick={() => colorPicker("sleeves")}
          />
        )}

        {advance.stripes && styles.sleeves === "Set-In" && (
          <g
            id="stripes_Pipes"
            data-name="stripes &amp; Pipes"
            transform="translate(93, 59)"
          >
            <path
              id="stripes"
              d="M73.42,54.57l-.1-.7L57,.92A92,92,0,0,0,43.75,3.19L59.47,54.63c1.4,11.9,22.25,180,7.35,233C55.92,326.47,16.48,384.74,2,415.24a112.51,112.51,0,0,1,12.54,6.84c14.8-31,54.5-90.51,65.8-130.51C96.52,234.07,74.32,61.57,73.42,54.57Z"
              transform="translate(-1.48 -0.42)"
              fill={colors.stripes ? colors.stripes : "#000000"}
              className="cjd-color-hover"
              onClick={() => colorPicker("stripes")}
            />

            {advance.stripes && advance.piping && (
              <g
                id="pipes"
                stroke={colors.piping ? colors.piping : "#eadc32"}
                className="cjd-color-hover"
                onClick={() => colorPicker("piping")}
                strokeWidth={2}
              >
                <path
                  d="M14.52,422.08c6.79-13.69,15.43-29.16,25.1-45.62C50,358.54,59.66,341,67.73,324c6.32-13.63,11.5-26.72,14.06-38.54A243.25,243.25,0,0,0,86,240.58c.44-25.39-.92-56.48-2.87-89.47C80.2,116,77,83.34,73.42,54.57L57,.92"
                  transform="translate(-1.48 -0.42)"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M43.75,3.19,59.47,54.63l7.51,73,5,81.6c.55,30-.07,58-5.16,78.44-7.14,22.26-19.45,46.91-34.41,72.78C19.89,382,8,402.65,2,415.24"
                  transform="translate(-1.48 -0.42)"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        )}

        {advance.sleevesPiping && styles.sleeves === "Raglan" && (
          <path
            d="M43.44,1c7.79,18.47,14.13,36.41,16.34,52.89L70.52,162.6l1.91,59.94A330.3,330.3,0,0,1,70,281.38c-2.36,14.82-7.11,27.68-14.44,38.42L24.75,375.37l-24,42"
            fill="none"
            stroke={colors.piping ? colors.piping : "#eadc32"}
            strokeWidth="4"
            strokeMiterlimit="10"
            transform="translate(100, 60)"
            className="cjd-color-hover"
            onClick={() => colorPicker("piping")}
          />
        )}

        {globals.bomber && advance.sleevePocket && (
          <g
            id="sleeve_zipper"
            data-name="sleeve zipper"
            transform="translate(132, 178)"
          >
            <g>
              <polygon
                points="0 0 0 66 15.9 66 58.22 66 58.22 0 0 0"
                fill={colors.pockets ? colors.pockets : "#e6e6e6"}
              />
              <path
                d="M.56.36v66H58.77V.36Zm11.9,63H4.08v-60h8.38Zm35,0H37.28V14.75h-1V63.36H26.13V14.75h21.3V63.36Zm8.34,0H48.43V13.75H25.14V63.36H16.45v-60H55.77v60Z"
                transform="translate(-0.56 -0.36)"
                fillOpacity="0.2"
              />
            </g>
            <path
              d="M11.22,15.54C11.22,14.6,10,4.69,10,4.69H6.56S5.32,14.6,5.32,15.54a2.94,2.94,0,0,0,.95,2.16V63.36h4V17.7A2.93,2.93,0,0,0,11.22,15.54ZM8.28,13.62a1.77,1.77,0,1,1-1.77,1.76A1.76,1.76,0,0,1,8.28,13.62ZM9.71,19.7H8.23a.25.25,0,1,0,0,.49H9.71v3.53H8.23a.25.25,0,1,0,0,.49H9.71v3.54H8.23A.24.24,0,0,0,8,28a.25.25,0,0,0,.25.24H9.71v3.54H8.23a.24.24,0,1,0,0,.48H9.71v3.54H8.23A.25.25,0,0,0,8,36a.24.24,0,0,0,.25.24H9.71v3.54H8.23a.25.25,0,1,0,0,.49H9.71v3.54H8.23a.24.24,0,0,0-.25.24.25.25,0,0,0,.25.24H9.71v3.54H8.23a.24.24,0,1,0,0,.48H9.71v5.55H6.84V52.36H8.32a.24.24,0,0,0,.25-.24.25.25,0,0,0-.25-.24H6.84V50.35H8.32a.24.24,0,1,0,0-.48H6.84V46.33H8.32a.24.24,0,1,0,0-.48H6.84V42.31H8.32a.25.25,0,0,0,.25-.24.24.24,0,0,0-.25-.24H6.84V38.29H8.32a.25.25,0,1,0,0-.49H6.84V34.27H8.32a.25.25,0,1,0,0-.49H6.84V30.24H8.32a.24.24,0,1,0,0-.48H6.84V26.22H8.32a.24.24,0,1,0,0-.48H6.84V22.2H8.32A.25.25,0,0,0,8.57,22a.24.24,0,0,0-.25-.24H6.84V18.18H7a3,3,0,0,0,1.31.32,2.92,2.92,0,0,0,1.43-.39V19.7Z"
              transform="translate(-0.56 -0.36)"
            />
          </g>
        )}

        {(styles.collar === "Overlap" || styles.collar === "Shirt Collar" || styles.collar === "Classic") && (
          <g id="collar_simple" data-name="collar simple">

            {/* Base collar paths */}
            {(styles.collar === "Overlap" || styles.collar === "Classic") && (
              <path
                id="collar_base-2"
                data-name="collar base"
                d="M177.84,62.43c-6.46-13.22-9.59-28.55-10.21-45.46C142.44,9.9,118.3,16.59,98,37,85.51,49.56,63.6,73.14,65.52,90.17c38.07-9.91,67.79-39.07,112.32-27.74Z"
                fill={colors.base || "#ffffff"}
                stroke="#231f20"
                strokeMiterlimit="2.61312"
                strokeWidth="1px"
                className="cjd-color-hover"
                onClick={() => colorPicker("base")}
              />
            )}

            {/* Shirt collar */}
            {styles.collar === "Shirt Collar" && (
              <path
                id="collar_polo_side"
                data-name="collar polo side"
                d="M754.22,183.48l-11.66-35.72s-1.31-7.57-7.75-6.61c-5.56.85-37.83,14.5-59.42,22.6S637.55,175.59,628.28,179c-1.09,15.56,7.63,51.17,7.63,51.17s18.1-15.35,58.45-40C729.8,168.66,754.22,183.48,754.22,183.48Z"
                fill={colors.outside || "#ffffff"}
                stroke="#000"
                strokeMiterlimit="2"
                strokeWidth="1"
                transform="translate(-570, -112)"
                className="cjd-color-hover"
                onClick={() => colorPicker("outside")}
              />
            )}

            {/* Classic decorative path — behind knit lines */}
            {styles.collar === "Classic" && (
              <path
                d="M1.48,76.22C1.25,74.39.55,64,11.73,48.69c15.64-21.4,46.6-41.07,59.47-45S89.28,1,93.71,1.85C103.82,4,102.84,23,115.39,48.74c.09.19.56,1.15.71,1.44C107.27,43.91,86.32,54,59.24,64.49c-40.75,15.77-57.71,12-57.71,12S1.51,76.42,1.48,76.22Z"
                transform="translate(64, 15)"
                fill={colors.base || "#ffffff"}
                stroke="#000"
                strokeMiterlimit="10"
                className="cjd-color-hover"
                onClick={() => colorPicker("base")}
              />
            )}

            {/* Knit lines — render LAST so they are always on top */}
            {styles.collar !== "Shirt Collar" && (
              <g
                id="knit"
                className="cjd-color-hover"
                onClick={() => colorPicker("base")}
              >
                {(styles.knit === "Double Line" || styles.knit === "Double Line Border") && (
                  <path
                    id="knit_double-3"
                    data-name="knit double"
                    fill={colors.lines || "#cacae8"}
                    style={{
                      stroke: styles.knit === "Double Line Border" ? (colors.border || "#000000") : "none",
                      vectorEffect: "non-scaling-stroke"
                    }}
                    d="M81,84.8s5.9-7.81,9-11.44A124.65,124.65,0,0,1,104,59.5c9-7.61,18-14.13,29.78-18.11,9.7-3.29,35.85-3.69,35.85-3.69.39,2.17.94,4.6,1.57,7.21,0,0-25.86,0-35.15,3.16-10.69,3.62-19.06,9.7-27.5,16.81A118.43,118.43,0,0,0,95.41,78l-1,1.12C90.05,81.08,85.58,83,81,84.8ZM66.24,89.7S76.16,74.12,81.69,67a134.68,134.68,0,0,1,19.52-20.73c9-7.61,18-14.13,29.78-18.11,9.91-3.36,36.83-3.61,36.83-3.61.22,2.45.49,4.85.81,7.15,0,0-26,0-35.37,3.14-10.69,3.62-19.06,9.7-27.49,16.82A127.8,127.8,0,0,0,87.26,71.29C83.55,76.08,76.6,86.46,76.6,86.46,73.09,87.73,69.63,88.82,66.24,89.7Z"
                  />
                )}

                {(styles.knit === "Single Line" || styles.knit === "Single Line Border") && (
                  <path
                    fill={colors.lines || "#cacae8"}
                    style={{
                      stroke: styles.knit === "Single Line Border" ? (colors.border || "#000000") : "none",
                      vectorEffect: "non-scaling-stroke"
                    }}
                    d="M72.89,87.73s5.61-8.12,7.32-10.32a158.79,158.79,0,0,1,23-24.4c10.61-8.95,21.22-16.62,35-21.31,5.82-2,29.93-3.71,29.93-3.71.3,2.63.69,5.4,1.17,8.28,0,0-23,1.45-28.44,3.29C128.32,43.82,118.46,51,108.54,59.35,103.55,63.56,87.87,82,87.87,82,82.45,84.28,77.36,86.29,72.89,87.73Z"
                  />
                )}
              </g>
            )}
          </g>
        )}


        {styles.collar === "Hood" && (
          <path
            id="hood"
            d="M125.77,69.7c4.84,8.61,23.9,90.21,27.55,81,8.75-22,8.2-87.79-5.37-110.47-4.45-7.43-12-14.68-18-20.43-5-4.86-12.77-9.86-24.8-15.11C80-2.35,70.77,15.24,50.45,35.67,38,48.21.73,61.21,2.64,78.23,32.26,70.53,56.82,52.9,87.24,50,114,47.48,114.07,48.9,125.77,69.7Z"
            transform="translate(63, 12)"
            fill={colors.outside ? colors.outside : "#ffffff"}
            stroke="#231f20"
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
            className="cjd-color-hover"
            onClick={() => colorPicker("outside")}
          />
        )}

        {styles.collar === "Zipper Hood" && (
          <path
            d="M160.78,174.64c-3.49-1.65-7.09-3.07-10.41-5a21.88,21.88,0,0,1-10.56-14c-3.1-12.19-6-24.45-9.61-36.48A85.26,85.26,0,0,0,111.92,85.8c-9-10-20.06-16.9-33.87-16.64C60.68,69.5,43.33,71,26,71.88c-8.36.44-16.66.51-23.52-5.52V61.7c2.48-2.33,4.66-5.17,7.49-7.05,22.2-14.89,44.31-29.88,66.92-44.18A64.62,64.62,0,0,1,97.74,2.32c9.4-2,10.68-.22,15.44,8.3,5.94,10.63,11.2,22,19.08,31.07C148.35,60.1,158,81.2,163.11,104.61c3.28,15.13,5.47,30.38,8.15,45.58v24.44Z"
            fill={colors.outside ? colors.outside : "#ffffff"}
            stroke="#404041"
            strokeMiterlimit="10"
            strokeWidth="1"
            transform="translate(58, 27)"
            className="cjd-color-hover"
            onClick={() => colorPicker("outside")}
          />
        )}

        {styles.collar === "Sailor" && (
          <g id="sailor" transform="translate(0, 25)">
            <path
              d="M759,194.82l14.53,25.83c5.19,24.23,8,40.06,6.66,4.14-1-26.6-26.71-78.81-38.84-84.11-25.19-7.07-37.35-.32-57.67,20.11-12.47,12.54-49.72,25.54-47.81,42.56,29.62-7.7,54.18-25.34,84.6-28.22,26.72-2.54,26.83-1.12,38.53,19.69Z"
              transform="translate(-570.26 -137.72)"
              fill={colors.base ? colors.base : "#ffffff"}
              stroke="#1d1d1b"
              strokeMiterlimit="2.61"
              strokeWidth="1"
              className="cjd-color-hover"
              onClick={() => colorPicker("base")}
            />

            <g
              id="outlines"
              className="cjd-color-hover"
              onClick={() => colorPicker("lines")}
              style={{
                fill: colors.lines ? colors.lines : "#e6e6e6",
                fillRule: "evenodd",
                strokeWidth: "1px",
                strokeMiterlimit: 2.61,
                stroke:
                  (styles.knit === "Single Line Border" ||
                    styles.knit === "Double Line Border") &&
                  (colors.border ? colors.border : "#000000"),
              }}
            >
              {(styles.knit === "Double Line" ||
                styles.knit === "Double Line Border") && (
                  <>
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                          (colors.border ? colors.border : "#000000"),
                      }}
                      id="top"
                      d="M775.88,205.1l-2.19-3.89-5-8.93L762,180.44c-4.93-8.89-8.72-15.22-10.38-16.72a17,17,0,0,0-11.76-6.31c-3-.52-8.37-.23-14,.15-4,.27-8.24.75-12.55,1.4a137.29,137.29,0,0,0-22.06,5.9l-6.52,2.42-12.5,5-14.1,6a187.69,187.69,0,0,0-16,11.55l11-4,11.07-4.53,24.89-10.18A154.61,154.61,0,0,1,713,164.16a138.76,138.76,0,0,1,25.24-1.8,13,13,0,0,1,11,6.47L780,226.33a70.94,70.94,0,0,0-2.24-15.78Z"
                      transform="translate(-570.26 -137.72)"
                    />
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                          (colors.border ? colors.border : "#000000"),
                      }}
                      id="bottom"
                      d="M780,226.33l-31.33-58-1.75-1.14c-3-1.75-7-2.49-11.85-2.48a180.86,180.86,0,0,0-21.27,1.78,147.88,147.88,0,0,0-22.87,6.13q-13.14,4.89-26.81,10.77l-24.34,9.47a15.78,15.78,0,0,0-3.38,6.39l12.33-4.16,19.1-7.75,20.63-8.42a157.76,157.76,0,0,1,25-7.24c7.15-.9,13.87-1.57,19.91-1.87,5-.12,8.85.43,11.22,1.87,2.78,1.73,5.46,5.49,8.08,10.11L760.07,195l11.07,19.76,1,3,1.69,2.81.93,4.73,5.77,16.27Z"
                      transform="translate(-570.26 -137.72)"
                    />
                  </>
                )}

              {(styles.knit === "Single Line" ||
                styles.knit === "Single Line Border") && (
                  <path
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Single Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                    id="single"
                    d="M775.88,205.1l-2.19-3.89-5-8.93L762,180.44c-4.93-8.89-8.72-15.22-10.38-16.72a17,17,0,0,0-11.76-6.31c-3-.52-8.37-.23-14,.15-4,.27-8.24.75-12.55,1.4a137.29,137.29,0,0,0-22.06,5.9l-6.52,2.42-12.5,5-14.1,6a187.69,187.69,0,0,0-16,11.55l11-4,11.07-4.53,24.89-10.18A154.61,154.61,0,0,1,713,164.16a138.76,138.76,0,0,1,25.24-1.8,13,13,0,0,1,11,6.47L780,226.33a70.94,70.94,0,0,0-2.24-15.78Z"
                    transform="translate(-570.26 -137.72)"
                  />
                )}
            </g>
          </g>
        )}

        {styles.collar === "Band" && (
          <g id="band" transform="translate(64, 26)">
            <path
              id="base"
              d="M116.48,40.15l-2.83-32.5S112.34,0,105.9,1c-5.56.85-42.08,15.12-59.42,20.59S18.13,29,8.54,32a9.84,9.84,0,0,0-7,9.77c.54,14.15-.11,24.45-.11,24.45s20.28,1.18,64.11-16.95C108.19,31.67,116.48,40.15,116.48,40.15Z"
              transform="translate(-0.92 -0.41)"
              fill={colors.band ? colors.band : "#ffffff"}
              stroke="#1d1d1b"
              strokeMiterlimit="10"
              className="cjd-color-hover"
              onClick={() => colorPicker("band")}
            />
          </g>
        )}

        {styles.collar === 'Sailor' &&
          <g id="sailor">
            <path id="sailor_base" data-name="sailor base" d="M188.74,81.61l14.53,25.83c5.19,24.22,8,40.06,6.66,4.14-1-26.6-26.71-78.82-38.84-84.11-25.19-7.07-37.35-.32-57.67,20.11C101,60.12,63.7,73.12,65.61,90.14c29.62-7.71,54.18-25.34,84.59-28.23,26.73-2.53,26.83-1.11,38.54,19.7Z" style={{
              fill: colors.base,
              stroke: '#231f20',
              strokeMiterlimit: 2.613126039505005,
              strokeWidth: '0.5px'
            }} />

            <g id="knit-2" data-name="knit">
              <g style={{ clipPath: 'url(#clip-path-3)' }}>
                {(styles.knit === 'Double Line' || styles.knit === 'Double Line Border') &&
                  <path id="double" d="M61.53,84.66C91.15,77,119.79,57.87,150.2,55c26.73-2.54,26.83-1.11,38.54,19.69l14.53,25.83L213,129M61.53,77c29.62-7.7,58.26-26.78,88.67-29.67,26.73-2.53,26.83-1.11,38.54,19.69l14.53,25.83,9.69,28.5" style={{
                    fill: colors.lines ? colors.lines : '#e6e6e6',
                    fillRule: 'evenodd',
                    strokeWidth: '0.5px',
                    strokeMiterlimit: 2.613126039505005,
                    stroke: styles.knit === 'Double Line Border' && (colors.border ? colors.border : '#000000')
                  }} />
                }

                {(styles.knit === 'Single Line' || styles.knit === 'Single Line Border') &&
                  <path id="single" d="M62.53,80.66C92.15,73,120.79,53.87,151.2,51c26.73-2.54,26.83-1.11,38.54,19.69l14.53,25.83L214,125M61.53,77c29.62-7.7,58.26-26.78,88.67-29.67,26.73-2.53,26.83-1.11,38.54,19.69l14.53,25.83,9.69,28.5" style={{
                    fill: colors.lines ? colors.lines : '#e6e6e6',
                    fillRule: 'evenodd',
                    strokeWidth: '0.5px',
                    strokeMiterlimit: 2.613126039505005,
                    stroke: styles.knit === 'Single Line Border' && (colors.border ? colors.border : '#000000')
                  }} />
                }
              </g>
            </g>
          </g>
        }

        <g id="cuff" strokeWidth="1px">
          <path
            id="cuff_base"
            data-name="cuff base"
            d="M72,466.94c23.49,5.85,41,16.14,53.66,29.93L100,531.22c-22.13-6.67-38.1-16.29-48.62-28.51L72,466.94Z"
            fill={colors.base ? colors.base : "#ffffff"}
            stroke={colors.base == "#000000" ? "#ffffff" : "#231f20"}
            strokeMiterlimit="2.61312"
            strokeWidth="1px"
            className="cjd-color-hover"
            onClick={() => colorPicker("base")}
          />

          {(styles.knit === "Double Line" ||
            styles.knit === "Double Line Border") && (
              <g
                id="knit_double-4"
                data-name="knit double"
                strokeWidth="1px"
                className="cjd-color-hover"
                onClick={() => colorPicker("lines")}
              >
                <g style={{ clipPath: "url(#clip-path-4)" }}>
                  <path
                    d="M112.46,514.53l-4.15,5.56-.49-.64A79.22,79.22,0,0,0,87,502.07,129,129,0,0,0,59.38,490.3l-.75-.19,3.46-6a134,134,0,0,1,28.25,12.15,85.91,85.91,0,0,1,22.12,18.26Z"
                    fillRule="evenodd"
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        (colors.border ? colors.border : "#000000"),
                    }}
                  />

                  <path
                    d="M118.82,506l-4.15,5.56-.53-.69a78.09,78.09,0,0,0-21.1-18,127.61,127.61,0,0,0-28.15-12.1l-.78-.14,3.49-6a132.81,132.81,0,0,1,28.87,12.52A85,85,0,0,1,118.82,506Z"
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                    fillRule="evenodd"
                  />
                </g>
              </g>
            )}

          {(styles.knit === "Single Line" ||
            styles.knit === "Single Line Border") && (
              <path
                className="cjd-color-hover"
                onClick={() => colorPicker("lines")}
                id="knit_single-2"
                data-name="knit single"
                d="M66.22,477.48c20.85,6.48,38,16.39,51.22,30-2.43,3.31-5,6.7-7.65,10.24-9.05-14.89-31.05-28.89-49.32-30.26Z"
                fill={colors.lines ? colors.lines : "#cacae8"}
                style={{
                  stroke:
                    styles.knit === "Single Line Border" &&
                    // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                    (colors.border ? colors.border : "#000000"),
                }}
                fillRule="evenodd"
              />
            )}
        </g>

        {globals.catName !== 'Hoodies' && (
          <g
            id="pockets"
            fill={colors.pockets ? colors.pockets : "#e6e6e6"}
            strokeMiterlimit="10"
            strokeWidth="1px"
            stroke="#231f20"
            transform={
              laddiesJacket ? "translate(12, 280)" : "translate(12, 322)"
            }
            className="cjd-color-hover"
            onClick={() => colorPicker("pockets")}
          >
            {styles.pocket === "Slash Pocket" && (
              <polygon points="34.19 84.3 40.76 83 27.1 0.74 20.53 2.04 34.19 84.3" />
            )}

            {styles.pocket === "Welt Pocket" && (
              <>
                <polygon
                  id="pocket_left"
                  data-name="pocket left"
                  points="55.24 84.35 0.35 8.65 11.81 0.35 66.7 76.04 55.24 84.35 55.24 84.35"
                />
                <path
                  id="double_bone"
                  data-name="double bone"
                  d="M7,5.23,61.93,80.92"
                  transform="translate(-1.14 -0.85)"
                  fill="none"
                />

                <g id="left-pocket-pipe" fill="none" stroke={colors.piping}>
                  <line x1="11.87" y1="0.29" x2="67.34" y2="76.79" />
                  <line x1="0.4" y1="8.59" x2="55.88" y2="85.09" />
                </g>
              </>
            )}

            {styles.pocket === "Snap Pocket" && (
              <g
                id="pocket_flap_right-2"
                data-name="pocket flap right"
                transform="translate(-187, 0)"
              >
                <polygon
                  points="205.45 0.34 192.35 8.85 239.15 80.25 252.25 71.75 205.45 0.34"
                  fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                  stroke="#404041"
                  strokeMiterlimit="10"
                  strokeWidth="1"
                />

                <path
                  d="M220.25,41.75a4.75,4.75,0,1,1,3.7,5.6A4.76,4.76,0,0,1,220.25,41.75Z"
                  transform="translate(-2.7 -2.2)"
                  fill="#fff"
                  stroke="#404041"
                  strokeMiterlimit="10"
                />
              </g>
            )}

            {styles.pocket === "Straight Pocket" && (
              <g id="Right-2" data-name="Right" transform="translate(-187, 0)">
                <rect
                  x="221.18"
                  y="4.02"
                  width="9.9"
                  height="79.1"
                  transform="translate(-3.32 15.8) rotate(-4.28)"
                  fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                  stroke="#404041"
                  strokeWidth="0.75"
                />
                <g id="outline-2" data-name="outline">
                  <polygon
                    points="224 83 222.6 83.1 222.5 81.6 221.9 81.7 222.1 83.7 224.1 83.5 224 83"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M223,79.48h-.6l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Z"
                    transform="translate(-0.7 -1.18)"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M222,65.88h-.6l-.3-3.4h.6Zm-.5-6.7h-.6l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Zm-.5-6.7h-.6l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Zm-.5-6.7h-.6l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Zm-.6-6.8h-.6l-.3-3.4h.6Z"
                    transform="translate(-0.7 -1.18)"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <polygon
                    points="216.6 2.4 218 2.3 218 1.8 216 1.9 216.1 3.9 216.7 3.9 216.6 2.4"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M225.6,3l-1.7.1v-.6l1.7-.1Zm-3.4.3-1.7.1v-.6l1.7-.1Z"
                    transform="translate(-0.7 -1.18)"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <polygon
                    points="228.7 1 226.7 1.1 226.7 1.7 228.2 1.6 228.3 3 228.8 2.9 228.7 1"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M235.1,78.58h-.6l-.3-3.4h.6Zm-.5-6.8H234l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Zm-.5-6.7H233l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Zm-.5-6.8H232l-.3-3.4h.6Zm-.5-6.7h-.6l-.3-3.4h.6Zm-.5-6.8H231l-.3-3.4h.6Zm-.5-6.7h-.6l-.3-3.4h.6Z"
                    transform="translate(-0.7 -1.18)"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <polygon
                    points="234.7 80.7 234.1 80.8 234.2 82.2 232.8 82.3 232.8 82.9 234.8 82.7 234.7 80.7"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M231.7,84.18l-1.7.1v-.6l1.7-.1Zm-3.5.3-1.7.1V84l1.7-.1Z"
                    transform="translate(-0.7 -1.18)"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                  <path
                    d="M230.6,17.68H230l-.3-3.4h.6Zm-.5-6.8h-.6l-.3-3.4h.6Z"
                    transform="translate(-0.7 -1.18)"
                    opacity="0.44"
                    style={{ isolation: "isolate" }}
                  />
                </g>
                <path
                  id="inline-2"
                  data-name="inline"
                  d="M220.9,4.28h-.3l.1,1.1h.3Zm.6,7.7h-.3l-.2-2.3h.3Zm-.2-3.3H221l-.2-2.2h.3Zm5.4,72.2h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.2h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.2h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3L223,36h.3Zm-.2-3.3H223l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.2h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3H222l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3ZM226.7,82h-.3l.1,1.1h.3Zm-1.1-78.1h-.3l.1,1.1h.3Zm.6,7.7h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm5.4,72.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.2h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.2h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.3h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm-.3-3.2h-.3l-.2-2.2h.3Zm-.2-3.3h-.3l-.2-2.2h.3Zm4.9,66.8h-.3l.1,1.1h.3Z"
                  transform="translate(-0.7 -1.18)"
                />
              </g>
            )}

            {styles.pocket === "Flap Pocket" && (
              <g
                id="pocket_flap_right-2"
                data-name="pocket flap right"
                transform="translate(-180, 0)"
              >
                <polygon
                  points="205.45 0.34 192.35 8.85 206.35 50.74 239.15 80.25 252.25 71.75 205.45 0.34"
                  fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                  stroke="#404041"
                  strokeMiterlimit="10"
                  strokeWidth="1"
                />
                <path
                  d="M214.46,48.11a4.75,4.75,0,1,1,3.7,5.6A4.76,4.76,0,0,1,214.46,48.11Z"
                  transform="translate(-4.91 -3.56)"
                  fill="#fff"
                  stroke="#404041"
                  strokeMiterlimit="10"
                />
              </g>
            )}
          </g>
        )}

        {globals.catName === 'Hoodies' && (
          <g
            id="kangroo"
            transform="translate(0, 313)"
            className="cjd-color-hover"
            onClick={() => colorPicker("pockets")}
          >
            <path
              d="M61.93,149.2c-28.52-3.57-50-12.33-57.21-31.61C-1.07,101.76,1.21,69.52,5,34.15L8.2,1l25.29,7.9c-3,42.06-4.91,83.44,29.07,102.41C62.56,111.27,61.62,149.51,61.93,149.2Z"
              transform="translate(-0.71 -0.3)"
              fill={colors.pockets ? colors.pockets : "#e6e6e6"}
              stroke="#c6c6c4"
              strokeMiterlimit="10"
            />
            <path
              d="M26.85,6.65C11.57,63.37,32.67,117.31,61.93,121.7"
              transform="translate(-0.71 -0.3)"
              fill="none"
              stroke="#c6c6c4"
              strokeMiterlimit="10"
            />
          </g>
        )}
      </g>

      {!advance.sleevePocket && designs["Left Sleeve"]?.done && (
        <g transform={patchArt(162.5, 217.5, 85, 85, SLEEVE_PATCH, patchMove(globals.productId, "Left Sleeve"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g id="leftSleeveArt 123">
          {designs["Left Sleeve"]?.name && (
            <g transform="translate(163, 237)">
              <text
                x="0"
                y="0"
                dy="-1.25rem"
                fontFamily={designs["Left Sleeve"]?.name.font}
                fill={designs["Left Sleeve"]?.name.fill}
                stroke={designs["Left Sleeve"]?.name?.stroke}
                strokeWidth="2"
                style={{ paintOrder: "stroke fill" }}
                fontSize={
                  designs["Left Sleeve"]?.name?.title?.length === 1
                    ? 110
                    : designs["Left Sleeve"]?.name?.title?.length === 2
                      ? 80
                      : designs["Left Sleeve"]?.name?.title?.length === 3
                        ? 50
                        : designs["Left Sleeve"]?.name?.title?.length === 4
                          ? 37
                          : designs["Left Sleeve"]?.name?.title?.length === 5
                            ? 30
                            : designs["Left Sleeve"]?.name?.title?.length === 6
                              ? 25
                              : designs["Left Sleeve"]?.name?.title?.length === 7
                                ? 21
                                : designs["Left Sleeve"]?.name?.title?.length === 8
                                  ? 18
                                  : (designs["Left Sleeve"]?.name?.font === "Graduate" || designs["Left Sleeve"]?.name?.font === "Cutive" || designs["Left Sleeve"]?.name?.font === "Merienda One" ? 17 : 22)
                }
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan alignmentBaseline="middle">
                  {designs["Left Sleeve"]?.name.title.substr(0, 8)}
                </tspan>
              </text>
              <text
                x="0"
                y="-10"
                dy="1rem"
                fontFamily={designs["Left Sleeve"]?.name.font}
                fill={designs["Left Sleeve"]?.name.fill}
                stroke={designs["Left Sleeve"]?.name?.stroke}
                fontSize={
                  designs["Left Sleeve"]?.name?.title?.length >= 8
                    ? 18
                    : (designs["Left Sleeve"]?.name.size === 19 ? 18 : designs["Left Sleeve"]?.name.size)
                }
                style={{ marginTop: "20px" }}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan alignmentBaseline="hanging">
                  {designs["Left Sleeve"]?.name.title.substr(8)}
                </tspan>
              </text>
            </g>
          )}

          {designs["Left Sleeve"]?.letters && (
            <>
              {designs["Left Sleeve"]?.letters.type === "Type Your Own" && (
                <g transform="translate(162, 217)">
                  <text
                    x="0"
                    y="0"
                    fontFamily={designs["Left Sleeve"]?.letters.font}
                    fill="none"
                    fontSize={
                      designs["Left Sleeve"]?.letters?.title?.length === 1
                        ? 102
                        : designs["Left Sleeve"]?.letters?.title?.length === 2
                          ? 70
                          : designs["Left Sleeve"]?.letters?.title?.length === 3
                            ? 45
                            : designs["Left Sleeve"]?.letters?.title?.length === 4
                              ? 35
                              : designs["Left Sleeve"]?.letters.size
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="8"
                    stroke={designs["Left Sleeve"]?.letters.border}
                    style={{ paintOrder: "stroke fill" }}
                  >
                    {designs["Left Sleeve"]?.letters.title}
                  </text>

                  <text
                    x="0"
                    y="0"
                    fontFamily={designs["Left Sleeve"]?.letters.font}
                    fill={designs["Left Sleeve"]?.letters.fill}
                    fontSize={
                      designs["Left Sleeve"]?.letters?.title?.length === 1
                        ? 102
                        : designs["Left Sleeve"]?.letters?.title?.length === 2
                          ? 70
                          : designs["Left Sleeve"]?.letters?.title?.length === 3
                            ? 45
                            : designs["Left Sleeve"]?.letters?.title?.length === 4
                              ? 35
                              : designs["Left Sleeve"]?.letters.size
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="4"
                    stroke={designs["Left Sleeve"]?.letters.stroke}
                    style={{ paintOrder: "stroke fill" }}
                  >
                    {designs["Left Sleeve"]?.letters.title}
                  </text>
                </g>
              )}
            </>
          )}
          {designs["Left Sleeve"]?.letters && (
            <>
              {designs["Left Sleeve"]?.letters.type === 'Ready To Use' && designs["Left Sleeve"]?.letters.path && (
                <g transform="translate(120, 175.5)">
                  {/* a square the size of the patch: a wide letter is fitted inside it (config/sleevePatches.js) */}
                  <svg
                    width="85"
                    height="85"
                    viewBox={designs["Left Sleeve"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {designs["Left Sleeve"]?.letters.path.match(/(<path.*?><\/path>)/g).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)[1];
                      const pShape = li.match(/d="(.*?)"/)[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Left Sleeve"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Left Sleeve"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Left Sleeve"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              )}
            </>
          )}
          {designs["Left Sleeve"]?.symbol && (
            <g transform="translate(123, 177)">
              <svg
                width="80"
                height="80"
                viewBox="0 0 72 72"
                preserveAspectRatio="xMidYMid meet"
              >
                {designs["Left Sleeve"]?.symbol.type === "Badges" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Left Sleeve"]?.symbol.fill}
                        stroke={designs["Left Sleeve"]?.symbol.stroke}
                        border={designs["Left Sleeve"]?.symbol.border}
                      />
                    </svg>
                  </g>
                )}

                {designs["Left Sleeve"]?.symbol.type === "Mascots" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="72"
                        height="72"
                        xlinkHref={require(`../../assets/images/mascots/${designs["Left Sleeve"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  </g>
                )}

                {designs["Left Sleeve"]?.symbol.type === "Flags" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <image
                        width="72"
                        height="72"
                        xlinkHref={require(`../../assets/images/flags/${designs["Left Sleeve"]?.symbol.flag}.svg`)}
                      />
                      <rect
                        x="1"
                        y="14"
                        width="70"
                        height="43.5"
                        fill="none"
                        strokeWidth="2"
                        stroke={designs["Left Sleeve"]?.symbol.fill}
                      ></rect>
                    </svg>
                  </g>
                )}
              </svg>
            </g>
          )}

          {designs["Left Sleeve"]?.upload && (
            <g transform="translate(120, 175)">
              <image
                xlinkHref={designs["Left Sleeve"]?.upload.file}
                width="85"
                height="85"
              />
            </g>
          )}
        </g>
        </g>
      )}

      {advance.extraSleevePatches && designs["Left Mid Sleeve Upper"]?.done && (
        <g transform={patchArt(167.5, 304.5, 65, 65, SLEEVE_PATCH, patchMove(globals.productId, "Left Mid Sleeve Upper"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g id="leftMidSleeveUpperArt">
          {designs["Left Mid Sleeve Upper"]?.name && (
            <g transform="translate(168, 304)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Left Mid Sleeve Upper"]?.name.font}
                fill={designs["Left Mid Sleeve Upper"]?.name.fill}
                stroke={designs["Left Mid Sleeve Upper"]?.name?.stroke}
                strokeWidth="1"
                style={{ paintOrder: "stroke fill" }}
                fontSize={
                  designs["Left Mid Sleeve Upper"]?.name?.title?.length === 1
                    ? 84
                    : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 2
                      ? 60
                      : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 3
                        ? 40
                        : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 4
                          ? 29
                          : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 5
                            ? 24
                            : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 6
                              ? 20
                              : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 7
                                ? 16
                                : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 8
                                  ? 15
                                  : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 9
                                    ? 13
                                    : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 10
                                      ? 12
                                      : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 11
                                        ? 11
                                        : designs["Left Mid Sleeve Upper"]?.name?.title?.length === 12
                                          ? 10
                                          : 10
                }
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan alignmentBaseline="middle">
                  {designs["Left Mid Sleeve Upper"]?.name.title}
                </tspan>
              </text>
            </g>
          )}

          {designs["Left Mid Sleeve Upper"]?.letters?.type === "Type Your Own" && (
            <g transform="translate(167, 305)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Left Mid Sleeve Upper"]?.letters.font}
                fill="none"
                fontSize={
                  designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 1
                    ? 75
                    : designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 2
                      ? 50
                      : designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 3
                        ? 35
                        : designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 4
                          ? 25
                          : midUpperLettersSize
                }
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="8"
                stroke={designs["Left Mid Sleeve Upper"]?.letters.border}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Left Mid Sleeve Upper"]?.letters.title}
              </text>

              <text
                x="0"
                y="0"
                fontFamily={designs["Left Mid Sleeve Upper"]?.letters.font}
                fill={designs["Left Mid Sleeve Upper"]?.letters.fill}
                fontSize={
                  designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 1
                    ? 75
                    : designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 2
                      ? 50
                      : designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 3
                        ? 35
                        : designs["Left Mid Sleeve Upper"]?.letters?.title?.length === 4
                          ? 25
                          : midUpperLettersSize
                }
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="4"
                stroke={designs["Left Mid Sleeve Upper"]?.letters.stroke}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Left Mid Sleeve Upper"]?.letters.title}
              </text>
            </g>
          )}

          {designs["Left Mid Sleeve Upper"]?.letters && (
            <>
              {designs["Left Mid Sleeve Upper"]?.letters.type === 'Ready To Use' && designs["Left Mid Sleeve Upper"]?.letters.path && (
                <g transform="translate(136, 271.5)">
                  {/* a square the size of the patch: a wide letter is fitted inside it (config/sleevePatches.js) */}
                  <svg
                    width="65"
                    height="65"
                    viewBox={designs["Left Mid Sleeve Upper"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {designs["Left Mid Sleeve Upper"]?.letters.path.match(/(<path.*?><\/path>)/g).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)[1];
                      const pShape = li.match(/d="(.*?)"/)[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Left Mid Sleeve Upper"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Left Mid Sleeve Upper"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Left Mid Sleeve Upper"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              )}
            </>
          )}

          {designs["Left Mid Sleeve Upper"]?.symbol && (
            <g transform="translate(135, 272)">
              <svg
                width="65"
                height="65"
                viewBox="0 0 60 60"
                preserveAspectRatio="xMidYMid meet"
              >
                {designs["Left Mid Sleeve Upper"]?.symbol.type === "Badges" && (
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <BadgeTemp
                      fill={designs["Left Mid Sleeve Upper"]?.symbol.fill}
                      stroke={designs["Left Mid Sleeve Upper"]?.symbol.stroke}
                      border={designs["Left Mid Sleeve Upper"]?.symbol.border}
                    />
                  </svg>
                )}
                {designs["Left Mid Sleeve Upper"]?.symbol.type === "Mascots" && (
                  <image
                    width="60"
                    height="60"
                    xlinkHref={require(`../../assets/images/mascots/${designs["Left Mid Sleeve Upper"]?.symbol.flag}.svg`)}
                  />
                )}
                {designs["Left Mid Sleeve Upper"]?.symbol.type === "Flags" && (
                  <>
                    <image
                      width="60"
                      height="60"
                      xlinkHref={require(`../../assets/images/flags/${designs["Left Mid Sleeve Upper"]?.symbol.flag}.svg`)}
                    />
                    <rect
                      x="1"
                      y="11.5"
                      width="58"
                      height="37"
                      fill="none"
                      strokeWidth="2"
                      stroke={designs["Left Mid Sleeve Upper"]?.symbol.fill}
                    />
                  </>
                )}
              </svg>
            </g>
          )}

          {designs["Left Mid Sleeve Upper"]?.upload && (
            <g transform="translate(135, 271)">
              <image
                xlinkHref={designs["Left Mid Sleeve Upper"]?.upload.file}
                width="67"
                height="67"
              />
            </g>
          )}
        </g>
        </g>
      )}

      {advance.extraSleevePatches && designs["Left Mid Sleeve Lower"]?.done && (
        <g transform={patchArt(154.86, 385, 55, 55, SLEEVE_PATCH, patchMove(globals.productId, "Left Mid Sleeve Lower"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g id="leftMidSleeveLowerArt">
          {designs["Left Mid Sleeve Lower"]?.name && (
            <g transform="translate(155, 385) rotate(28)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Left Mid Sleeve Lower"]?.name.font}
                fill={designs["Left Mid Sleeve Lower"]?.name.fill}
                stroke={designs["Left Mid Sleeve Lower"]?.name?.stroke}
                strokeWidth="1"
                style={{ paintOrder: "stroke fill" }}
                fontSize={
                  designs["Left Mid Sleeve Lower"]?.name?.title?.length === 1
                    ? 68
                    : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 2
                      ? 50
                      : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 3
                        ? 33
                        : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 4
                          ? 25
                          : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 5
                            ? 20
                            : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 6
                              ? 16
                              : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 7
                                ? 14
                                : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 8
                                  ? 12
                                  : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 9
                                    ? 11
                                    : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 10
                                      ? 10
                                      : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 11
                                        ? 9
                                        : designs["Left Mid Sleeve Lower"]?.name?.title?.length === 12
                                          ? 8
                                          : 8
                }
                textAnchor="middle"
                dominantBaseline="middle"

              >
                <tspan alignmentBaseline="middle">
                  {designs["Left Mid Sleeve Lower"]?.name.title}
                </tspan>
              </text>
            </g>
          )}

          {designs["Left Mid Sleeve Lower"]?.letters?.type === "Type Your Own" && (
            <g transform="translate(155, 384) rotate(28)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Left Mid Sleeve Lower"]?.letters.font}
                fill="none"
                fontSize={
                  designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 1
                    ? 65
                    : designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 2
                      ? 47
                      : designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 3
                        ? 30
                        : designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 4
                          ? 22
                          : midLowerLettersSize
                }
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="6"
                stroke={designs["Left Mid Sleeve Lower"]?.letters.border}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Left Mid Sleeve Lower"]?.letters.title}
              </text>

              <text
                x="0"
                y="0"
                fontFamily={designs["Left Mid Sleeve Lower"]?.letters.font}
                fill={designs["Left Mid Sleeve Lower"]?.letters.fill}
                fontSize={
                  designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 1
                    ? 65
                    : designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 2
                      ? 47
                      : designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 3
                        ? 30
                        : designs["Left Mid Sleeve Lower"]?.letters?.title?.length === 4
                          ? 22
                          : midLowerLettersSize
                }
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="3"
                stroke={designs["Left Mid Sleeve Lower"]?.letters.stroke}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Left Mid Sleeve Lower"]?.letters.title}
              </text>
            </g>
          )}

          {designs["Left Mid Sleeve Lower"]?.letters && (
            <>
              {designs["Left Mid Sleeve Lower"]?.letters.type === 'Ready To Use' && designs["Left Mid Sleeve Lower"]?.letters.path && (
                <g transform="translate(132, 342) rotate(28)">
                  {/* a square the size of the patch: a wide letter is fitted inside it (config/sleevePatches.js) */}
                  <svg
                    x="14"
                    y="-0.5"
                    width="55"
                    height="55"
                    viewBox={designs["Left Mid Sleeve Lower"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {designs["Left Mid Sleeve Lower"]?.letters.path.match(/(<path.*?><\/path>)/g).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)[1];
                      const pShape = li.match(/d="(.*?)"/)[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Left Mid Sleeve Lower"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Left Mid Sleeve Lower"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Left Mid Sleeve Lower"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              )}
            </>
          )}

          {designs["Left Mid Sleeve Lower"]?.symbol && (
            <g transform="translate(143, 348) rotate(28)">
              <svg
                width="55"
                height="55"
                viewBox="0 0 50 50"
                preserveAspectRatio="xMidYMid meet"
              >
                {designs["Left Mid Sleeve Lower"]?.symbol.type === "Badges" && (
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <BadgeTemp
                      fill={designs["Left Mid Sleeve Lower"]?.symbol.fill}
                      stroke={designs["Left Mid Sleeve Lower"]?.symbol.stroke}
                      border={designs["Left Mid Sleeve Lower"]?.symbol.border}
                    />
                  </svg>
                )}
                {designs["Left Mid Sleeve Lower"]?.symbol.type === "Mascots" && (
                  <image
                    width="50"
                    height="50"
                    xlinkHref={require(`../../assets/images/mascots/${designs["Left Mid Sleeve Lower"]?.symbol.flag}.svg`)}
                  />
                )}
                {designs["Left Mid Sleeve Lower"]?.symbol.type === "Flags" && (
                  <>
                    <image
                      width="50"
                      height="50"
                      xlinkHref={require(`../../assets/images/flags/${designs["Left Mid Sleeve Lower"]?.symbol.flag}.svg`)}
                    />
                    <rect
                      x="1"
                      y="10"
                      width="48"
                      height="30"
                      fill="none"
                      strokeWidth="2"
                      stroke={designs["Left Mid Sleeve Lower"]?.symbol.fill}
                    />
                  </>
                )}
              </svg>
            </g>
          )}

          {designs["Left Mid Sleeve Lower"]?.upload && (
            <g transform="translate(144, 348) rotate(28)">
              <image
                xlinkHref={designs["Left Mid Sleeve Lower"]?.upload.file}
                width="55"
                height="55"
              />
            </g>
          )}
        </g>
        </g>
      )}

      {designs["Left Sleeve End"]?.done && (
        <g transform={patchArt(124.46, 441.64, 47, 47, SLEEVE_PATCH, patchMove(globals.productId, "Left Sleeve End"))}>
          {/* sized like every sleeve patch (config/sleevePatches.js) */}
        <g
          id="leftSleeveEndArt"
          style={{ transform: `translate(222px, -5px) rotate(28deg) scaleX(1)` }}
        >
          {designs["Left Sleeve End"]?.name && (
            <g transform="translate(124, 440)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Left Sleeve End"]?.name?.font}
                fill={designs["Left Sleeve End"]?.name?.fill}
                stroke={designs["Left Sleeve End"]?.name?.stroke}
                strokeWidth="1"
                style={{ paintOrder: "stroke fill" }}
                fontSize={
                  designs["Left Sleeve End"]?.name?.title?.length === 1
                    ? 60
                    : designs["Left Sleeve End"]?.name?.title?.length === 2
                      ? 43
                      : designs["Left Sleeve End"]?.name?.title?.length === 3
                        ? 28
                        : designs["Left Sleeve End"]?.name?.title?.length === 4
                          ? 20
                          : designs["Left Sleeve End"]?.name?.title?.length === 5
                            ? 16
                            : designs["Left Sleeve End"]?.name?.title?.length === 6
                              ? 14
                              : designs["Left Sleeve End"]?.name?.title?.length === 7
                                ? 12
                                : designs["Left Sleeve End"]?.name?.title?.length === 8
                                  ? 10
                                  : 8
                }
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan alignmentBaseline="middle">
                  {designs["Left Sleeve End"]?.name?.title}
                </tspan>
              </text>
            </g>
          )}

          {designs["Left Sleeve End"]?.letters?.type === "Type Your Own" && (
            <g transform="translate(124, 440)">
              <text
                x="0"
                y="0"
                fontFamily={designs["Left Sleeve End"]?.letters.font}
                fill="none"
                fontSize={
                  designs["Left Sleeve End"]?.letters?.title?.length === 1
                    ? 50
                    : designs["Left Sleeve End"]?.letters?.title?.length === 2
                      ? 35
                      : designs["Left Sleeve End"]?.letters?.title?.length === 3
                        ? 23
                        : designs["Left Sleeve End"]?.letters?.title?.length === 4
                          ? 17
                          : designs["Left Sleeve End"]?.letters.size
                }
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="8"
                stroke={designs["Left Sleeve End"]?.letters.border}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Left Sleeve End"]?.letters.title}
              </text>

              <text
                x="0"
                y="0"
                fontFamily={designs["Left Sleeve End"]?.letters.font}
                fill={designs["Left Sleeve End"]?.letters.fill}
                fontSize={
                  designs["Left Sleeve End"]?.letters?.title?.length === 1
                    ? 50
                    : designs["Left Sleeve End"]?.letters?.title?.length === 2
                      ? 35
                      : designs["Left Sleeve End"]?.letters?.title?.length === 3
                        ? 23
                        : designs["Left Sleeve End"]?.letters?.title?.length === 4
                          ? 17
                          : designs["Left Sleeve End"]?.letters.size
                }
                textAnchor="middle"
                dominantBaseline="middle"
                strokeWidth="4"
                stroke={designs["Left Sleeve End"]?.letters.stroke}
                style={{ paintOrder: "stroke fill" }}
              >
                {designs["Left Sleeve End"]?.letters.title}
              </text>
            </g>
          )}

          {designs["Left Sleeve End"]?.letters && (
            <>
              {designs["Left Sleeve End"]?.letters.type === 'Ready To Use' && designs["Left Sleeve End"]?.letters.path && (
                <g transform="translate(100.5, 417)">
                  {/* a square the size of the patch: a wide letter is fitted inside it (config/sleevePatches.js) */}
                  <svg
                    width="47"
                    height="47"
                    viewBox={designs["Left Sleeve End"]?.letters.path.match(/viewBox="(.*?)"/)[1]}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {designs["Left Sleeve End"]?.letters.path.match(/(<path.*?><\/path>)/g).map((li, idx) => {
                      const pClass = li.match(/class="(.*?)"/)[1];
                      const pShape = li.match(/d="(.*?)"/)[1];
                      let color;

                      if (pClass === 'cjd-fill') {
                        color = designs["Left Sleeve End"]?.letters.fill || '#fff';
                      } else if (pClass === 'cjd-stroke') {
                        color = designs["Left Sleeve End"]?.letters.stroke || '#8089a2';
                      } else {
                        color = designs["Left Sleeve End"]?.letters.border || '#525a6f';
                      }
                      return <path key={idx} d={pShape} fill={color}></path>;
                    })}
                  </svg>
                </g>
              )}
            </>
          )}

          {designs["Left Sleeve End"]?.symbol && (
            <g transform="translate(100, 417)">
              <svg
                width="47"
                height="47"
                viewBox="0 0 42 42"
                preserveAspectRatio="xMidYMin meet"
              >
                {designs["Left Sleeve End"]?.symbol.type === "Badges" && (
                  <g transform="translate(0, 0)">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 42 42"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <BadgeTemp
                        fill={designs["Left Sleeve End"]?.symbol.fill}
                        stroke={designs["Left Sleeve End"]?.symbol.stroke}
                        border={designs["Left Sleeve End"]?.symbol.border}
                      />
                    </svg>
                  </g>
                )}

                {designs["Left Sleeve End"]?.symbol.type === "Mascots" && (
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
                        xlinkHref={require(`../../assets/images/mascots/${designs["Left Sleeve End"]?.symbol.flag}.svg`)}
                      />
                    </svg>
                  </g>
                )}

                {designs["Left Sleeve End"]?.symbol.type === "Flags" && (
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
                        xlinkHref={require(`../../assets/images/flags/${designs["Left Sleeve End"]?.symbol.flag}.svg`)}
                      />
                      <rect
                        x="1"
                        y="8"
                        width="40"
                        height="26"
                        fill="none"
                        strokeWidth="2"
                        stroke={designs["Left Sleeve End"]?.symbol.fill}
                      ></rect>
                    </svg>
                  </g>
                )}
              </svg>
            </g>
          )}

          {designs["Left Sleeve End"]?.upload && (
            <g transform="translate(100, 417)">
              <image
                xlinkHref={designs["Left Sleeve End"]?.upload.file}
                width="47"
                height="47"
              />
            </g>
          )}
        </g>
        </g>
      )}

      {!advance.sleevePocket && (
        <g transform={moveTransform(patchMove(globals.productId, "Left Sleeve"))}>
        <rect
          {...patchGuide(120, 175, 85, 85, SLEEVE_PATCH)}
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          onClick={() => openModal("Left Sleeve")}
        />
        </g>
      )}

      {/* Left Mid Sleeve Upper - between Left Sleeve and Left Sleeve End */}
      {advance.extraSleevePatches && (
        <g transform={moveTransform(patchMove(globals.productId, "Left Mid Sleeve Upper"))}>
        <rect
          {...patchGuide(135, 272, 65, 65, SLEEVE_PATCH)}
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          onClick={() => openModal("Left Mid Sleeve Upper")}
        />
        </g>
      )}

      {/* Left Mid Sleeve Lower - between Mid Upper and Sleeve End */}
      {advance.extraSleevePatches && (
        <g transform={moveTransform(patchMove(globals.productId, "Left Mid Sleeve Lower"))}>
        <rect
          {...patchGuide(125, 350, 55, 55, SLEEVE_PATCH)}
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          onClick={() => openModal("Left Mid Sleeve Lower")}
          style={{ transform: "translate(-250px, 342px) rotate(-61.94deg)" }}
        />
        </g>
      )}

      <g transform={moveTransform(patchMove(globals.productId, "Left Sleeve End"))}>
      <rect
        {...patchGuide(100, 420, 47, 47, SLEEVE_PATCH)}
        className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
        onClick={() => openModal("Left Sleeve End")}
        style={{ transform: "translate(-325px, 342px) rotate(-61.94deg)" }}
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

export default connect(mapStateToProps, mapDispatchToProps)(JacketLeft);
