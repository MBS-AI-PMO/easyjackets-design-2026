import React from "react";
import { connect } from "react-redux";

import { modalState, activeSidebar, colorPicker } from "../../store/actions";
import { getStaggeredElm } from "../../utils";
import { pocketBoxTransform } from "../../config/pocketBoxes";

// Collar
import Simple from "./collar/simple";
import SimpleBomber from "./collar/simple-bomber";
import RollUp from "./collar/rollup";
import Sailor from "./collar/sailor";
import Hood from "./collar/hood";
import Classic from "./collar/classic";
import ZipperHood from "./collar/zipprHood";
import Band from "./collar/band";
import PocketZipper from "./pockets/Zipper";
import BadgeTemp from "./badge";

// Chest
import { ReactComponent as ChestPocket } from "../../assets/images/pocket-chest.svg";

// Sleeves
import { SetIn, Raglan } from "./sleeves";

// Closure
import Zipper from "./closure/zipper";
import Buttons from "./closure/buttons";
import Flap from "./closure/flap";

const Jacket = ({
  globals,
  styles,
  colors,
  designs,
  advance,
  modalState,
  activeSidebar,
  colorPicker,
  flip = false,
  pose,
}) => {
  const openModal = (tab) => {
    modalState("title", tab);
    modalState("open", true);
    activeSidebar(globals.catName === 'Hoodies' ? 3 : 4);

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
      // tab === 'Right Chest Verticle' ? 2 : 0
      modalState("index", 0);
    }
  };

  let laddiesJacket = String(globals.productId).trim() === "4893";

  return (
    <>
      <svg
        id="jacketFront"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 514.73 545.96"
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

            {(styles.knit === "Single Line" ||
              styles.knit === "Single Line Border") && (
                <g
                  className="cjd-color-hover"
                  onClick={() => colorPicker("lines")}
                  fill={colors.lines ? colors.lines : "#cacae8"}
                  data-name="knit single"
                  strokeWidth="1px"
                  style={{
                    stroke:
                      styles.knit === "Single Line Border" &&
                      // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                      (colors.border ? colors.border : "#000000"),
                  }}
                >
                  <path
                    transform="translate(0, 1)"
                    className="cjd-color-hover"
                    onClick={() => colorPicker("lines")}
                    id="knit_single"
                    data-name="knit single"
                    d={
                      laddiesJacket ?
                        "m394.29 397.59v13c-23.9 11.14-59.63 16.46-101 19v-12c44.33-2.35 80.14-8.08 101-19z"
                        : "m394.29 474.73v13c-23.9 11.14-59.63 16.46-101 19v-12c44.33-2.35 80.14-8.08 101-20z"}
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Single Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                  />
                  <path
                    transform="translate(0, 1)"
                    className="cjd-color-hover"
                    onClick={() => colorPicker("lines")}
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Single Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                    d={
                      laddiesJacket ?
                        "m120.29 397.73c20.86 11.92 56.67 17.65 101 20v12c-41.37-2.54-77.1-7.86-101-19z" :
                        "m120.29 474.73c20.86 11.92 56.67 17.65 101 20v12c-41.37-2.54-77.1-7.86-101-19z"
                    }
                  />
                </g>
              )}

            {(styles.knit === "Double Line" ||
              styles.knit === "Double Line Border") && (
                <g
                  className="cjd-color-hover"
                  onClick={() => colorPicker("lines")}
                  fill={colors.lines ? colors.lines : "#cacae8"}
                  fillRule="evenodd"
                  data-name="knit double"
                  strokeWidth="0.5px"
                  style={{
                    stroke:
                      styles.knit === "Double Line Border" &&
                      // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                      (colors.border ? colors.border : "#000000"),
                  }}
                >
                  <path
                    transform="translate(0, 1)"

                    d={
                      laddiesJacket
                        ? "M120 384.34L119.93 393.34C129.09 399.55 142.32 404.2 158.77 407.59C176.28 411.2 197.52 413.43 221.45 414.67L221.81 407.61C198.21 406.39 177.31 404.2 160.19 400.67C143.39 397.2 130.31 392.47 122.01 386.12L120.01 384.39L120 384.34ZM119.89 398.45L119.82 407.45C128.99 413.7 142.25 418.37 158.82 421.78C176.33 425.39 197.57 427.62 221.5 428.85L221.86 421.8C198.26 420.58 177.36 418.39 160.24 414.86C143.44 411.39 130.36 406.66 122.06 400.31L119.94 398.48L119.89 398.45Z"
                        : "M120,467.34l-.07,9c9.16,6.21,22.39,10.86,38.84,14.25,17.51,3.61,38.75,5.84,62.68,7.08l.36-7.06c-23.6-1.22-44.5-3.41-61.62-6.94-16.8-3.47-29.88-8.2-38.18-14.55l-2-1.73Zm-.11,14.11-.07,9c9.17,6.25,22.43,10.92,39,14.33,17.51,3.61,38.75,5.84,62.68,7.07l.36-7.05c-23.6-1.22-44.5-3.41-61.62-6.94-16.8-3.47-29.88-8.2-38.18-14.55l-2.12-1.83Z"
                    }
                    data-name="right"
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                  />
                  <path
                    transform="translate(0, 1)"

                    d={
                      laddiesJacket
                        ? "M394.19 384.34L394.26 393.34C385.1 399.55 371.87 404.2 355.42 407.59C337.91 411.2 316.66 413.43 292.74 414.67L292.38 407.61C315.98 406.39 336.88 404.2 354 400.67C370.8 397.2 383.88 392.47 392.18 386.12L394.18 384.39L394.19 384.34ZM394.3 398.45L394.37 407.45C385.2 413.7 371.94 418.37 355.42 421.78C337.91 425.39 316.66 427.62 292.74 428.85L292.38 421.8C315.98 420.58 336.88 418.39 354 414.86C370.8 411.39 383.88 406.66 392.18 400.31L394.3 398.48V398.45Z"
                        : "M394.19,467.34l.07,9c-9.16,6.21-22.39,10.86-38.84,14.25-17.51,3.61-38.76,5.84-62.68,7.08l-.36-7.06c23.6-1.22,44.5-3.41,61.62-6.94,16.8-3.47,29.88-8.2,38.18-14.55l2-1.73Zm-.11,14.11.07,9c-9.17,6.25-22.43,10.92-38.95,14.33-17.51,3.61-38.76,5.84-62.68,7.07l-.36-7.05c23.6-1.22,44.5-3.41,61.62-6.94,16.8-3.47,29.88-8.2,38.18-14.55l2.12-1.83Z"
                    }
                    data-name="left"
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                        (colors.border ? colors.border : "#000000"),
                    }}
                  />
                </g>
              )}
          </g>

          {globals.catName === 'Hoodies' ? (
            <path
              d="M325.36,252.47c-1.9-12-3.51-22.63-5.09-34.14,11.31-49.51,28.09-101.86,52.09-157.58-5.59-13.39-18-22.81-35.59-30.53-3.92-1.7-7.78-3.21-11.92-4.77-13.86-5.24-23.08-7.37-37.29-10.81-10.69-2.59-20.6-5.35-32.69-8.35-18.44-7.42-117.44-4.42-136.25,0-12.09,3-22,5.76-32.69,8.35C71.72,18.08,62.5,20.21,48.64,25.47c-4.14,1.56-8,3.07-11.92,4.77C19.13,38,6.72,47.38,1.13,60.77c24,55.7,40.82,108,52.15,157.6-1.58,11.51-3.19,22.1-5.09,34.1-2.33,14.73-2.57,10.39,2.27,24-.27,24.16-12.3,51.89-12.43,78.08C38,364.94,44,377.06,49.8,385.77c1.67,11.35,47.14,17.89,100.57,19.78,26.5,1.6,51.2,2.72,72.52.56,52.36-2.16,97.22-9.53,100.84-20.35,5.82-8.71,11.82-20.83,11.77-31.22-.14-26.19-12.14-53.92-12.43-78.07C327.91,262.9,327.67,267.24,325.36,252.47Z"
              transform="translate(70, 70)"
              fill={colors.body ? colors.body : "#ffffff"}
              stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
              strokeMiterlimit="2.61"
              className="cjd-color-hover"
              onClick={() => colorPicker("body")}
            />
          ) : (
            <path
              d={
                laddiesJacket
                  ? "M395.501 314C393.601 302 391.991 299.37 390.411 287.86C401.721 238.35 418.501 186 442.501 130.28C436.911 116.89 424.501 107.47 406.911 99.7497C402.991 98.0497 399.131 96.5397 394.991 94.9797C381.131 89.7397 371.911 87.6097 357.701 84.1697C347.011 81.5797 337.101 78.8197 325.011 75.8197C306.571 68.3997 207.571 71.3997 188.761 75.8197C176.671 78.8197 166.761 81.5797 156.071 84.1697C141.861 87.6097 132.641 89.7397 118.781 94.9997C114.641 96.5597 110.781 98.0697 106.861 99.7697C89.2705 107.49 76.8605 116.91 71.2705 130.3C95.2905 186 112.091 238.35 123.421 287.9C121.841 299.41 120.231 302 118.331 314V314C115.361 332.774 107.655 352.006 117.418 368.315C118.25 369.704 119.097 371.038 119.941 372.3C121.611 383.65 167.08 390.19 220.51 392.08V443.73C244.632 446.295 268.959 446.295 293.081 443.73V391.84C345.441 389.68 390.251 383.11 393.871 372.29C394.716 371.024 395.566 369.687 396.4 368.293C406.155 351.993 398.436 332.768 395.501 314V314Z"
                  : "M329,254c-1.9-12-3.51-22.63-5.09-34.14C335.22,170.35,352,118,376,62.28c-5.59-13.39-18-22.81-35.59-30.53-3.92-1.7-7.78-3.21-11.92-4.77-13.86-5.24-23.08-7.37-37.29-10.81-10.69-2.59-20.6-5.35-32.69-8.35C240.07.4,141.07,3.4,122.26,7.82c-12.09,3-22,5.76-32.69,8.35C75.36,19.61,66.14,21.74,52.28,27c-4.14,1.56-8,3.07-11.92,4.77-17.59,7.72-30,17.14-35.59,30.53C28.79,118,45.59,170.35,56.92,219.9,55.34,231.41,53.73,242,51.83,254c-2.33,14.73-2.57,10.39,2.27,24-.27,24.16-12.3,51.89-12.43,78.08-.05,10.39,5.95,22.51,11.77,31.22,1.67,11.35,47.14,17.89,100.57,19.78v51.4a343.07,343.07,0,0,0,72.57,0V406.84c52.36-2.16,97.17-8.73,100.79-19.55,5.82-8.71,11.82-20.83,11.77-31.22C339,329.88,327,302.15,326.71,278,331.55,264.43,331.31,268.77,329,254Z"
              }
              transform={laddiesJacket ? "" : "translate(66.5, 68)"}
              stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
              strokeMiterlimit="2.61"
              fill={colors.body ? colors.body : "#ffffff"}
              className="cjd-color-hover"
              onClick={() => colorPicker("body")}
            />
          )}

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
                        stroke={colors.inserts ? colors.inserts : "#000000"}
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
                        stroke={colors.inserts ? colors.inserts : "#000000"}
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

          {advance.chestPocket && (
            <g transform="translate(286, 150)">
              {" "}
              <ChestPocket />{" "}
            </g>
          )}

          {globals.catName !== 'Hoodies' && (
            <g
              id="cjd-pockets"
              className="cjd-color-hover"
              onClick={() => colorPicker("pockets")}
            >
              {styles.pocket === "Slash Pocket" && (
                <g
                  id="pocketSlash"
                  data-name="pocket slash"
                  transform={
                    laddiesJacket
                      ? "translate(140, 280)"
                      : "translate(140, 336)"
                  }
                >
                  <polygon
                    points="227.02 83.86 233.59 82.56 219.94 0.3 213.37 1.6 227.02 83.86"
                    fill={colors.pockets ? colors.pockets : "#cacae8"}
                    stroke={
                      advance.piping
                        ? colors.piping
                          ? colors.piping
                          : "#eadc32"
                        : "#cacae8"
                    }
                    //stroke={colors.body == "#000000" ? "#ffffff" : "#000000"}
                    strokeWidth="1px"
                  />
                  <polygon
                    points="13.3 0.3 19.57 1.59 6.55 83.45 0.28 82.16 13.3 0.3"
                    fill={colors.pockets ? colors.pockets : "#cacae8"}
                    stroke={
                      advance.piping
                        ? colors.piping
                          ? colors.piping
                          : "#eadc32"
                        : "#cacae8"
                    }
                    //stroke={colors.body == "#000000" ? "#ffffff" : "#000000"}
                    strokeWidth="1px"
                  />
                </g>
              )}

              {styles.pocket === "Welt Pocket" && (
                <g
                  transform={
                    laddiesJacket ? "translate(140, 290)" : "translate(140, 336)"
                  }
                >
                  {/* right Pocket + its path */}
                  <g transform="translate(-23, 0)">
                    <polygon
                      points="0.7 76.39 55.59 0.7 67.05 9 12.16 84.69 0.7 76.39"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
                    />
                    <path
                      d="M61.79,5.75,6.9,81.45"
                      fill="none"
                      stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
                    />
                    <g
                      id="right-pocket-pipe"
                      fill="none"
                      stroke={
                        advance.piping
                          ? colors.piping
                            ? colors.piping
                            : "#eadc32"
                          : "#231f20"
                      }
                      strokeMiterlimit="4"
                      strokeWidth={advance.piping ? "2px" : ".5px"}
                    >
                      <line x1="55.88" y1="0.29" x2="0.41" y2="76.79" />
                      <line x1="67.34" y1="8.59" x2="11.87" y2="85.09" />
                    </g>
                  </g>

                  {/* left Pocket + its path */}
                  <g transform="translate(11, 0)">
                    <polygon
                      points="232.15 84.69 177.26 9 188.72 0.7 243.61 76.39 232.15 84.69"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
                      transform="rotate(2 210 45)"
                    />
                    <path
                      d="M183.45,5.75l54.89,75.7"
                      fill="none"
                      stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
                      transform="rotate(2 210 45)"
                    />
                    <g
                      id="left-pocket-pipe"
                      fill="none"
                      stroke={
                        advance.piping
                          ? colors.piping
                            ? colors.piping
                            : "#eadc32"
                          : "#231f20"
                      }
                      strokeMiterlimit="4"
                      strokeWidth={advance.piping ? "2px" : ".5px"}
                      transform="rotate(2 210 45)"
                    >
                      <line x1="188.43" y1="0.3" x2="243.9" y2="76.79" />
                      <line x1="176.97" y1="8.59" x2="232.44" y2="85.09" />
                    </g>
                  </g>
                </g>
              )}


              {styles.pocket === "Flap Pocket" && (
                <g
                  id="Pocket_Flap"
                  data-name="Pocket Flap"
                  transform={
                    laddiesJacket ? "translate(128, 290)" : "translate(128, 345)"
                  }
                >
                  {/* Left Flap */}
                  <g id="pocket_flap_left" data-name="pocket flap left" transform="translate(-12, -15)">
                    <polygon
                      points="0.35 73.75 13.45 82.25 46.25 52.74 60.25 10.85 47.15 2.35 0.35 73.75"
                      fill={colors.pockets ? colors.pockets : "transparent"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeMiterlimit="10"
                      strokeWidth="1"
                    />
                    <path
                      d="M44.26,55.71a4.75,4.75,0,1,1,3.7-5.6A4.76,4.76,0,0,1,44.26,55.71Z"
                      transform="translate(-4.91 -3.56)"
                      fill="#9ca1a4"
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeMiterlimit="10"
                    />
                  </g>

                  {/* Right Flap */}
                  <g
                    id="pocket_flap_right"
                    data-name="pocket flap right"
                    transform="translate(16, -15)" // Adjust right flap's position
                  >
                    <polygon
                      points="205.45 0.34 192.35 8.85 206.35 50.74 239.15 80.25 252.25 71.75 205.45 0.34"
                      fill={colors.pockets ? colors.pockets : "transparent"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeMiterlimit="10"
                      strokeWidth="1"
                    />
                    <path
                      d="M214.46,48.11a4.75,4.75,0,1,1,3.7,5.6A4.76,4.76,0,0,1,214.46,48.11Z"
                      transform="translate(-4.91 -3.56)"
                      fill="#9ca1a4"
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeMiterlimit="10"
                    />
                  </g>
                </g>
              )}


              {styles.pocket === "Snap Pocket" && (
                <g
                  id="Pocket_Snap"
                  data-name="Pocket Snap"
                  transform={
                    laddiesJacket ? "translate(128, 290)" : "translate(128, 345)"
                  }
                >
                  {/* LEFT SNAP POCKET */}
                  <g
                    id="pocket_snap_left"
                    data-name="pocket snap left"
                    transform="translate(-6, -10)" // 👈 move slightly up, adjust as needed
                  >
                    <polygon
                      points="0.35 73.75 13.45 82.25 60.25 10.85 47.15 2.35 0.35 73.75"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeMiterlimit="10"
                      strokeWidth="1"
                    />
                    {/* the snap: its ring is set inline, so it is a part of the drawing and not an outline
                        (App.scss's outline colour and the Outlines switch leave it alone, App.js) */}
                    <path
                      d="M35.05,47.35a4.75,4.75,0,1,1,3.7-5.6A4.76,4.76,0,0,1,35.05,47.35Z"
                      transform="translate(-2.7 -2.2)"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      style={{ stroke: colors.body == "#000000" ? "#ffffff" : "#9ca1a4" }}
                      strokeMiterlimit="10"
                    />
                  </g>

                  {/* RIGHT SNAP POCKET */}
                  <g
                    id="pocket_snap_right"
                    data-name="pocket snap right"
                    transform="translate(9, -10)" // 👈 move slightly up/right, adjust freely
                  >
                    <polygon
                      points="205.45 0.34 192.35 8.85 239.15 80.25 252.25 71.75 205.45 0.34"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeMiterlimit="10"
                      strokeWidth="1"
                    />
                    <path
                      d="M220.25,41.75a4.75,4.75,0,1,1,3.7,5.6A4.76,4.76,0,0,1,220.25,41.75Z"
                      transform="translate(-2.7 -2.2)"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      style={{ stroke: colors.body == "#000000" ? "#ffffff" : "#9ca1a4" }}
                      strokeMiterlimit="10"
                    />
                  </g>
                </g>
              )}


              {styles.pocket === "Straight Pocket" && (
                <g
                  id="pocket_straight"
                  data-name="pocket straight"
                  transform={
                    laddiesJacket
                      ? "translate(139.5, 280)"
                      : "translate(139.5, 338)"
                  }
                >
                  <g id="Right">
                    <rect
                      x="1.47"
                      y="1.58"
                      width="9.9"
                      height="79.1"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeWidth="0.75"
                    />
                  </g>
                  {/* the mirror of the first strip about the front opening (x 257.13), so both pocket boxes have
                      the same 10.3 units beside their strip (it was 6.5 further in, 1.9 lower and tilted) */}
                  <g id="Right-2" data-name="Right">
                    <rect
                      x="223.89"
                      y="1.58"
                      width="9.9"
                      height="79.1"
                      fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                      stroke={colors.body == "#000000" ? "#ffffff" : "#404041"}
                      strokeWidth="0.75"
                    />
                  </g>
                </g>
              )}

              {styles.pocket === "Zipper Pocket" && (
                <PocketZipper
                  color={colors.pockets ? colors.pockets : "#e6e6e6"}
                  laddiesJacket={laddiesJacket}
                />
              )}
            </g>
          )}

          {globals.catName === 'Hoodies' && (
            <g
              id="kangroo"
              className="cjd-color-hover"
              onClick={() => colorPicker("pockets")}
              transform="translate(137.5, 314)"
            >
              <g>
                <path
                  d="M122.37,167A518,518,0,0,1,20.3,156.44c-8-11.9-14.57-31.72-18.89-57.36C18.17,75.62,30.92,44.92,39.32,7.81a556.52,556.52,0,0,1,83.45-6.42A521.37,521.37,0,0,1,204.4,7.8c7.56,38.7,19.07,67.72,36.19,91.3-2.55,21-10.34,42.44-20.89,57.35A450.72,450.72,0,0,1,122.37,167Z"
                  transform="translate(-0.89 -0.89)"
                  fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                />
                <path
                  d="M122.78,1.89A520.67,520.67,0,0,1,204,8.24c7.57,38.51,19.05,67.45,36.1,91-2.55,20.82-10.26,42-20.66,56.77a450,450,0,0,1-97,10.5A517.76,517.76,0,0,1,20.6,156C12.67,144.16,6.22,124.55,1.94,99.21c16.69-23.43,29.4-54,37.79-91a556.3,556.3,0,0,1,83.05-6.36h0m0-1A554.37,554.37,0,0,0,38.91,7.36C30.14,46.29,17.18,76.22.89,99c3.5,20.89,9.4,43.68,19.11,57.93A516.09,516.09,0,0,0,122.37,167.5,448.81,448.81,0,0,0,220,156.89c11-15.5,18.67-37.5,21.11-57.93C222,72.65,211.4,41.19,204.82,7.36a519.26,519.26,0,0,0-82-6.47Z"
                  transform="translate(-0.89 -0.89)"
                />
              </g>
              <path
                d="M190,6.31c0,57.17,21.6,103.43,48.3,103.43"
                transform="translate(-0.89 -0.89)"
                fill="none"
                stroke="#c6c6c4"
                strokeMiterlimit="10"
              />
              <path
                d="M52,6.31c0,57.17-21.6,103.43-48.29,103.43"
                transform="translate(-0.89 -0.89)"
                fill="none"
                stroke="#c6c6c4"
                strokeMiterlimit="10"
              />
            </g>
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
              id="sleeve_zipper"
              data-name="sleeve zipper"
              transform="translate(441, 200)"
              className="cjd-color-hover"
              onClick={() => colorPicker("pockets")}
            >
              <g>
                <path
                  d="M31.48.23l-16.29,6L.28,11.77l22.9,61.9,14.91-5.51,15.47-5.73c-.29-1-.6-1.9-.91-2.86C50.42,53.52,32,.43,31.48.23Z"
                  transform="translate(-0.28 -0.23)"
                  fill={colors.pockets ? colors.pockets : "#e6e6e6"}
                />
                <path
                  d="M.28,11.77l22.9,61.9,14.91-5.51,15.47-5.73c-.29-1-.6-1.9-.91-2.86L46.13,62,29.27,16.4,36,13.92l-.3-.95L28,15.81,45.19,62.33l-8.14,3L16.23,9.07l16.2-6c-.32-1-.63-1.91-.95-2.85l-16.29,6Zm33,55-2.22.82-.37.13h0l-2.69,1h0l-.4.15-2.19.8L4.63,13.36l7.86-2.91Z"
                  transform="translate(-0.28 -0.23)"
                  fillOpacity="0.2"
                />
              </g>
              <path
                d="M15.09,23.75a3,3,0,0,0,.14-2.4c-.33-.9-5-10-5-10L6.92,12.61s2.33,9.93,2.66,10.83a3,3,0,0,0,1.67,1.73L24.07,59.82l3.35,9.06h0l.08,0,.05,0,.42-.15h0l2.74-1h0l.37-.14.17-.06Zm-4.43-.88A1.8,1.8,0,1,1,13,23.93,1.8,1.8,0,0,1,10.66,22.87ZM25.94,59.12l-1.33.49-.54-1.46,1.42-.52a.25.25,0,0,0-.17-.47l-1.42.53-.54-1.46,1.42-.53a.25.25,0,0,0,.14-.32.24.24,0,0,0-.31-.14l-1.42.52-1.25-3.38,1.41-.53a.24.24,0,0,0,.15-.31.25.25,0,0,0-.32-.15l-1.42.52-1.25-3.38L21.93,48a.24.24,0,0,0,.14-.32.24.24,0,0,0-.31-.14l-1.42.52-1.25-3.38,1.41-.53a.25.25,0,0,0,.15-.32.25.25,0,0,0-.32-.14l-1.41.52-1.26-3.38,1.42-.53a.26.26,0,0,0,.15-.32.25.25,0,0,0-.32-.14l-1.42.52L16.24,37l1.42-.53a.25.25,0,0,0,.14-.32.25.25,0,0,0-.32-.14l-1.41.52-1.25-3.39,1.41-.52a.26.26,0,0,0,.15-.32.25.25,0,0,0-.32-.14l-1.42.52-1.25-3.38,1.42-.53a.25.25,0,0,0,.14-.32.24.24,0,0,0-.31-.14l-1.42.52L12,25.42l.11,0a2.94,2.94,0,0,0,1.37-.16,2.88,2.88,0,0,0,1.23-.87l.57,1.52-1.42.53a.26.26,0,0,0-.15.32.25.25,0,0,0,.32.14l1.42-.52,1.25,3.38-1.42.53a.25.25,0,0,0,.18.46l1.41-.52,1.26,3.38-1.42.53a.26.26,0,0,0-.15.32.25.25,0,0,0,.32.14L18.27,34l1.25,3.38L18.1,38a.25.25,0,0,0-.14.32.24.24,0,0,0,.31.14l1.42-.52,1.25,3.38-1.41.53a.24.24,0,0,0-.15.32.25.25,0,0,0,.32.14l1.42-.52,1.25,3.38L21,45.65a.25.25,0,0,0-.14.32.24.24,0,0,0,.31.14l1.42-.52L23.79,49l-1.41.53a.25.25,0,0,0-.15.32.25.25,0,0,0,.32.14L24,49.44l1.26,3.38-1.42.53a.26.26,0,0,0-.15.32.25.25,0,0,0,.32.14l1.42-.52,2,5.31Z"
                transform="translate(-0.28 -0.23)"
              />
            </g>
          )}

          {!advance.stripes &&
            advance.piping &&
            !advance.inserts &&
            styles.sleeves === "Set-In" && (
              <g
                transform="translate(70.8, 130)"
                id="piping"
                className="cjd-color-hover"
                fill={colors.piping ? colors.piping : "#eadc32"}
                stroke={colors.piping ? colors.piping : "#eadc32"}
                strokeMiterlimit="10"
                strokeWidth="2.5"
                onClick={() => colorPicker("piping")}
              >
                <path
                  d="M1.15.62c21.75,50.06,40.12,102,52.16,157.52"
                  transform="translate(-0.46 -0.33)"
                />
                <path
                  d="M372.31.62c-21.75,50.06-40.12,102-52.16,157.52"
                  transform="translate(-0.46 -0.33)"
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

          {/* {!advance.stripes &&
            advance.piping &&
            advance.inserts &&
            styles.sleeves === 'Set-In' && (
              <g
                id="piping"
                transform="translate(70.8, 104)"
                className="cjd-color-hover"
                onClick={() => colorPicker('piping')}
                fill="none"
                stroke={colors.piping ? colors.piping : '#eadc32'}
                strokeMiterlimit="10"
                strokeWidth="1.5"
              >
                <path
                  d="M.78,25.46C22.53,75.52,40.9,127.46,52.94,183"
                  transform="translate(-0.09 -0.13)"
                />
                <path
                  d="M24.78.46C45,41.25,67.25,125.6,52.94,183"
                  transform="translate(-0.09 -0.13)"
                />
                <path
                  d="M371.57,25.69c-21.75,50.06-40.12,102-52.16,157.52"
                  transform="translate(-0.09 -0.13)"
                />
                <path
                  d="M347.57.69c-20.26,40.79-42.46,125.14-28.16,182.52"
                  transform="translate(-0.09 -0.13)"
                />
              </g>
            )} */}

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
                    fill={colors.lines ? colors.lines : "#cacae8"}
                    fillRule="evenodd"
                    strokeWidth="0.5px"
                    data-name="knit double"
                    style={{
                      stroke:
                        styles.knit === "Double Line Border" &&
                        (colors.border ? colors.border : "#000000"),
                    }}
                  >
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                          (colors.border ? colors.border : "#000000"),
                      }}
                      d="M471.91,524.57l-2.18,7-.7-.46a83,83,0,0,0-26.81-9.93,135.46,135.46,0,0,0-31.49-2l-.81.07,1.34-7.16a141.3,141.3,0,0,1,32.29,2.15,90.51,90.51,0,0,1,28.36,10.37Z"
                    />
                    <path
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Double Line Border" &&
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
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
                    fill={colors.lines ? colors.lines : "#cacae8"}
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
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
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
                    strokeWidth="0.5px"
                    fill={colors.lines ? colors.lines : "#cacae8"}
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
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
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
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                          (colors.border ? colors.border : "#000000"),
                      }}
                    />
                  </g>
                )}

              {(styles.knit === "Single Line" ||
                styles.knit === "Single Line Border") && (
                  <g
                    fill={colors.lines ? colors.lines : "#cacae8"}
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
                      d="m41.21 519.28c18.38-7.17 38.88-11.37 61.24-12.95l2.23 11.94a179.06 179.06 0 0 0-59.84 12.62z"
                      data-name="trim"
                      fill={colors.lines ? colors.lines : "#cacae8"}
                      style={{
                        stroke:
                          styles.knit === "Single Line Border" &&
                          // (colors.body == "#000000" ? '#ffffff' : '#000000'),
                          (colors.border ? colors.border : "#000000"),
                      }}
                    />
                  </g>
                )}
            </>
          )}

          {advance.proCuff && (
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
          )}

          {styles.closure === "Zipper" && (
            <Zipper
              colorPicker={(part) => colorPicker(part)}
              color={colors.zip ? colors.zip : "#c4c6c6"}
              laddiesJacket={laddiesJacket}
            />
          )}


          {styles.closure === "Buttons" && globals.catName !== "Hoodies" && (
            <>
              {!styles.flap ? (
                <Buttons
                  collar={styles.collar}
                  colorPicker={(part) => colorPicker(part)}
                  color={colors.buttons ? colors.buttons : "#cacae8"}
                  laddiesJacket={laddiesJacket}
                  colors={colors}
                />) : (
                <Flap
                  colorPicker={(part) => colorPicker(part)}
                  color={colors.buttons ? colors.buttons : "#cacae8"}
                  laddiesJacket={laddiesJacket}
                  colors={colors}
                />)
              }
              {/*
              {styles.flap && (
                <g id="flap" transform="translate(242.6, 103)">
                  <path
                    class="cls-1"
                    d="M57,20.49C44.86-4.45,19,1,19,1s.07,78.08-2.26,101.33c-1.57,15.87-9,40.09-13.57,60.53,3.84-15.73,10.53-30.8,19.65-56.27C33.77,76,50.06,43.92,56.09,31.21,58.65,25.82,58.57,23.8,57,20.49Z"
                    fill={colors.body ? colors.body : "#ffffff"}
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeWidth="1"
                  />
                  <path
                    class="cls-1"
                    d="M23.89,104.76c-9.12,24.13-15.8,38.72-19.64,53.63C2.06,167.62.5,173.88.5,173.88V372.81h0v52.41c7.33.68,20.3.16,34.64-.47V75.52A271.77,271.77,0,0,0,23.89,104.76Z"
                    fill={colors.body ? colors.body : "#ffffff"}
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeWidth="1"
                  />
                  <g
                    onClick={() => colorPicker("buttons")}
                    fill={colors.buttons ? colors.buttons : "#ffffff"}
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeWidth="1"
                  >
                    <path
                      id="button"
                      class="cls-2"
                      d="M11.7,405.07a6.57,6.57,0,1,1-6.54,6.6v0h0A6.59,6.59,0,0,1,11.7,405.07Z"
                    />
                    <path
                      id="button-2"
                      class="cls-2"
                      d="M11.7,381.36A6.57,6.57,0,1,1,5.16,388v0a6.57,6.57,0,0,1,6.57-6.57h0Z"
                    />
                  </g>
                </g>
              )} */}

              {/* {styles.flap && (
                <g id="flap" transform="translate(245.6, 103)">
                  <path
                    d="M25.73,105.76c-9.12,24.13-15.8,38.72-19.64,53.63-2.19,9.23-3.75,15.49-3.75,15.49V373.81H37L37,76.52A271.76,271.76,0,0,0,25.73,105.76Z"
                    transform="translate(-2.09 -1.25)"
                    fill={colors.body ? colors.body : '#ffffff'}
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeWidth="1"
                    style={{ isolation: 'isolate' }}
                  />

                  <path
                    d="M58.8,21.49C46.7-3.45,20.83,2,20.83,2s.07,78.08-2.26,101.33C17,119.2,9.59,143.42,5,163.86c3.84-15.73,10.53-30.8,19.65-56.27C35.61,77,51.9,44.92,57.93,32.21,60.49,26.82,60.41,24.8,58.8,21.49Z"
                    transform="translate(-2.09 -1.25)"
                    fill={colors.body ? colors.body : '#ffffff'}
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeWidth="1"
                    style={{ isolation: 'isolate' }}
                  />
                  <path
                    d="M37,425.75c-14.34.63-27.31,1.15-34.64.47V373.71H37Z"
                    transform="translate(-2.09 -1.25)"
                    fill={colors.body ? colors.body : '#ffffff'}
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeWidth="1"
                  />

                  <path
                    id="button"
                    d="M13.54,406.07A6.57,6.57,0,1,1,7,412.64H7A6.58,6.58,0,0,1,13.54,406.07Z"
                    transform="translate(-2.09 -1.25)"
                    fill={colors.buttons ? colors.buttons : '#ffffff'}
                    stroke="#231f20"
                    strokeMiterlimit="2.61"
                    strokeWidth="1"
                    fillRule="evenodd"
                  />

                  <path
                    id="button-2"
                    data-name="button"
                    d="M13.54,382.36A6.57,6.57,0,1,1,7,388.93a6.57,6.57,0,0,1,6.57-6.57Z"
                    transform="translate(-2.09 -1.25)"
                    fill={colors.buttons ? colors.buttons : '#ffffff'}
                    stroke="#231f20"
                    strokeMiterlimit="2.61"
                    strokeWidth="1"
                    fillRule="evenodd"
                  />
                </g>
              )} */}
            </>
          )}

          {/* {!designs['Front Center']?.done && (
            <g id="right-chest-verticle">
              <rect
                className={`cjd-guides ${!globals.guides && 'cjd-guides-hide'}`}
                x="145"
                y="165"
                width="85"
                height="175"
                fill="#e6e6e6"
                data-name="right-chest-verticle"
                onClick={() => openModal('Right Chest Verticle')}
              />
              {designs['Right Chest Verticle']?.done && (
                <>
                  {designs['Right Chest Verticle']?.upload && (
                    <g transform="translate(145, 165)">
                      <image
                        xlinkHref={designs['Right Chest Verticle']?.upload.file}
                        width="85"
                        height="175"
                      />
                    </g>
                  )}
                </>
              )}
            </g>
          )} */}

          {!designs["Front Center"]?.done && (
            <g id="right-chest">
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
                    <g transform="translate(188, 208)">
                      <g className="name">
                        <text
                          x="0"
                          y="0"
                          fontFamily={designs["Right Chest"]?.name?.font}
                          fill={designs["Right Chest"]?.name?.fill}
                          stroke={designs["Right Chest"]?.name?.stroke}
                          strokeWidth="2"
                          style={{ paintOrder: "stroke fill" }}
                          fontSize={
                            designs["Right Chest"]?.name?.title?.length === 1
                              ? 110
                              : designs["Right Chest"]?.name?.title?.length === 2
                                ? 80
                                : designs["Right Chest"]?.name?.title?.length === 3
                                  ? 50
                                  : designs["Right Chest"]?.name?.title?.length === 4
                                    ? 37
                                    : designs["Right Chest"]?.name?.title?.length === 5
                                      ? 30
                                      : designs["Right Chest"]?.name?.title?.length === 6
                                        ? 25
                                        : designs["Right Chest"]?.name?.title?.length === 7
                                          ? 21
                                          : designs["Right Chest"]?.name?.title?.length === 8
                                            ? 18
                                            : designs["Right Chest"]?.name?.title?.length === 9
                                              ? 16
                                              : designs["Right Chest"]?.name?.title?.length === 10
                                                ? 14
                                                : designs["Right Chest"]?.name?.title?.length === 11
                                                  ? 12
                                                  : designs["Right Chest"]?.name?.title?.length === 12
                                                    ? 12
                                                    : 12
                          }
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan alignmentBaseline="middle">
                            {designs["Right Chest"].name?.title}
                          </tspan>
                        </text>
                      </g>
                    </g>
                  )}

                  {designs["Right Chest"]?.letters && (
                    <g transform="translate(187, 207)">
                      <g className="letters">
                        {designs["Right Chest"].letters?.type ===
                          "Type Your Own" && (
                            <>
                              <text
                                x="0"
                                y="0"
                                fontFamily={designs["Right Chest"]?.letters?.font}
                                fill="none"
                                fontSize={
                                  designs["Right Chest"]?.letters?.title?.length === 1
                                    ? 102
                                    : designs["Right Chest"]?.letters?.title?.length === 2
                                      ? 70
                                      : designs["Right Chest"]?.letters?.title?.length === 3
                                        ? 45
                                        : designs["Right Chest"]?.letters?.title?.length === 4
                                          ? 35
                                          : designs["Right Chest"].letters?.size
                                }
                                textAnchor="middle"
                                dominantBaseline="middle"
                                strokeWidth="8"
                                stroke={designs["Right Chest"]?.letters?.border}
                              >
                                {designs["Right Chest"].letters?.appearance ===
                                  "Staggered"
                                  ? getStaggeredElm(
                                    designs["Right Chest"].letters?.title
                                  )
                                  : designs["Right Chest"].letters?.title}
                              </text>

                              <text
                                x="0"
                                y="0"
                                fontFamily={designs["Right Chest"]?.letters?.font}
                                fill={designs["Right Chest"]?.letters?.fill}
                                fontSize={
                                  designs["Right Chest"]?.letters?.title?.length === 1
                                    ? 102
                                    : designs["Right Chest"]?.letters?.title?.length === 2
                                      ? 70
                                      : designs["Right Chest"]?.letters?.title?.length === 3
                                        ? 45
                                        : designs["Right Chest"]?.letters?.title?.length === 4
                                          ? 35
                                          : designs["Right Chest"].letters?.size
                                }
                                textAnchor="middle"
                                dominantBaseline="middle"
                                strokeWidth="4"
                                stroke={designs["Right Chest"]?.letters?.stroke}
                              >
                                {designs["Right Chest"].letters?.appearance ===
                                  "Staggered"
                                  ? getStaggeredElm(
                                    designs["Right Chest"].letters?.title
                                  )
                                  : designs["Right Chest"].letters?.title}
                              </text>
                            </>
                          )}

                        {designs["Right Chest"].letters?.type ===
                          "Ready To Use" && designs["Right Chest"]?.letters.path && (
                            <g transform="translate(-35, -40)">
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
                      </g>
                    </g>
                  )}

                  {designs["Right Chest"]?.symbol && (
                    <g transform="translate(151, 171)">
                      {designs["Right Chest"]?.symbol.type === "Badges" && (
                        <svg
                          width="74"
                          height="74"
                          viewBox="0 0 74 74"
                          preserveAspectRatio="xMidYMid meet"
                        >
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
                            stroke={designs["Right Chest"]?.symbol.fill}
                          ></rect>
                        </svg>
                      )}
                    </g>
                  )}

                  {designs["Right Chest"]?.upload && (
                    <g transform="translate(145, 165)">
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

          {/* {!designs['Front Center']?.done && !advance.chestPocket && (
            <g id="left-chest-verticle">
              <rect
                className={`cjd-guides ${!globals.guides && 'cjd-guides-hide'}`}
                x="280"
                y="165"
                width="85"
                height="175"
                fill="#e6e6e6"
                data-name="left-chest-verticle"
                onClick={() => openModal('Left Chest Verticle')}
              />
              {designs['Left Chest Verticle']?.done && (
                <>
                  {designs['Left Chest Verticle']?.upload && (
                    <g transform="translate(280, 165)">
                      <image
                        xlinkHref={designs['Left Chest Verticle']?.upload.file}
                        width="85"
                        height="175"
                      />
                    </g>
                  )}
                </>
              )}
            </g>
          )} */}

          {!designs["Front Center"]?.done && !advance.chestPocket && (
            <g id="left-chest">
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
                    <g className="name" transform="translate(322, 208)">
                      <text
                        x="0"
                        y="0"
                        fontFamily={designs["Left Chest"]?.name?.font}
                        fill={designs["Left Chest"]?.name?.fill}
                        stroke={designs["Left Chest"]?.name?.stroke}
                        strokeWidth="2"
                        style={{ paintOrder: "stroke fill" }}
                        fontSize={
                          designs["Left Chest"]?.name?.title?.length === 1
                            ? 110
                            : designs["Left Chest"]?.name?.title?.length === 2
                              ? 80
                              : designs["Left Chest"]?.name?.title?.length === 3
                                ? 50
                                : designs["Left Chest"]?.name?.title?.length === 4
                                  ? 37
                                  : designs["Left Chest"]?.name?.title?.length === 5
                                    ? 30
                                    : designs["Left Chest"]?.name?.title?.length === 6
                                      ? 25
                                      : designs["Left Chest"]?.name?.title?.length === 7
                                        ? 21
                                        : designs["Left Chest"]?.name?.title?.length === 8
                                          ? 18
                                          : designs["Left Chest"]?.name?.title?.length === 9
                                            ? 16
                                            : designs["Left Chest"]?.name?.title?.length === 10
                                              ? 14
                                              : designs["Left Chest"]?.name?.title?.length === 11
                                                ? 12
                                                : designs["Left Chest"]?.name?.title?.length === 12
                                                  ? 10
                                                  : 10
                        }
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan alignmentBaseline="middle">
                          {designs["Left Chest"].name?.title}
                        </tspan>
                      </text>
                    </g>
                  )}

                  {designs["Left Chest"]?.letters && (
                    <g className="letters" transform="translate(322, 207)">
                      {designs["Left Chest"].letters?.type ===
                        "Type Your Own" && (
                          <>
                            <text
                              x="0"
                              y="0"
                              fontFamily={designs["Left Chest"]?.letters?.font}
                              fill="none"
                              fontSize={
                                designs["Left Chest"]?.letters?.title?.length === 1
                                  ? 102
                                  : designs["Left Chest"]?.letters?.title?.length === 2
                                    ? 70
                                    : designs["Left Chest"]?.letters?.title?.length === 3
                                      ? 45
                                      : designs["Left Chest"]?.letters?.title?.length === 4
                                        ? 35
                                        : designs["Left Chest"].letters?.size
                              }
                              textAnchor="middle"
                              dominantBaseline="middle"
                              strokeWidth="8"
                              stroke={designs["Left Chest"]?.letters?.border}
                            >
                              {designs["Left Chest"].letters?.appearance ===
                                "Staggered"
                                ? getStaggeredElm(
                                  designs["Left Chest"].letters?.title
                                )
                                : designs["Left Chest"].letters?.title}
                            </text>

                            <text
                              x="0"
                              y="0"
                              fontFamily={designs["Left Chest"]?.letters?.font}
                              fill={designs["Left Chest"]?.letters?.fill}
                              fontSize={
                                designs["Left Chest"]?.letters?.title?.length === 1
                                  ? 102
                                  : designs["Left Chest"]?.letters?.title?.length === 2
                                    ? 70
                                    : designs["Left Chest"]?.letters?.title?.length === 3
                                      ? 45
                                      : designs["Left Chest"]?.letters?.title?.length === 4
                                        ? 35
                                        : designs["Left Chest"].letters?.size
                              }
                              textAnchor="middle"
                              dominantBaseline="middle"
                              strokeWidth="4"
                              stroke={designs["Left Chest"]?.letters?.stroke}
                            >
                              {designs["Left Chest"].letters?.appearance ===
                                "Staggered"
                                ? getStaggeredElm(
                                  designs["Left Chest"].letters?.title
                                )
                                : designs["Left Chest"].letters?.title}
                            </text>
                          </>
                        )}

                      {designs["Left Chest"]?.letters?.type ===
                        "Ready To Use" && designs["Left Chest"]?.letters.path && (
                          <g transform="translate(-35, -40)">
                            <svg
                              width="73"
                              height="82"
                              viewBox={
                                designs["Left Chest"]?.letters.path.match(
                                  /viewBox="(.*?)"/
                                )?.[1]
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
                                      designs["Left Chest"]?.letters.fill ||
                                      "#fff";
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
                    </g>
                  )}

                  {designs["Left Chest"]?.symbol && (
                    <g transform="translate(286, 171)">
                      {designs["Left Chest"]?.symbol.type === "Badges" && (
                        <svg
                          width="74"
                          height="74"
                          viewBox="0 0 74 74"
                          preserveAspectRatio="xMidYMid meet"
                        >
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
                            stroke={designs["Left Chest"]?.symbol.fill}
                          ></rect>
                        </svg>
                      )}
                    </g>
                  )}

                  {designs["Left Chest"]?.upload && (
                    <g transform="translate(280, 165)">
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
            // moved in and made smaller with the pocket styles that reach into it (config/pocketBoxes.js)
            <g id="right-pocket" transform={pocketBoxTransform(styles.pocket, "right")}>
              <rect
                className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
                x="161.13"
                y="353.23"
                width="68"
                height="68"
                fill="#e6e6e6"
                data-name="right-pocket"
                data-patch="true" // fitted like a sleeve patch (utils/autoFitText.js)
                onClick={() => openModal("Right Pocket")}
                /* 167.63 keeps this guide exactly 62 units left of the jacket centre
                   (257.13), mirroring the left pocket. They were 62.84 / 61.16 before,
                   which left each letter a different distance from its pocket welt. */
              />
              {designs["Right Pocket"]?.done && (
                <g>
                  {designs["Right Pocket"]?.letters?.type ===
                    "Ready To Use" && designs["Right Pocket"]?.letters.path && (
                      /* Centred on the pocket guide (166.79,374.23 + 55/2). Must stay in
                         step with the left pocket block so both letters render identically. */
                      <g transform="translate(161.13, 353.23)">
                        {/* Box matches the right-pocket guide exactly, and the letter's own
                            viewBox is used rather than a hardcoded 0 0 100 100 - the assets
                            have differing native sizes (e.g. 62.84 x 53.79), so a fixed
                            viewBox made each letter a different size and off-centre.
                            Bottom edge (353.23 + 68) sits on the pocket bottom at 421.23. */}
                        <svg
                          width="68"
                          height="68"
                          viewBox={designs["Right Pocket"]?.letters.path.match(/viewBox="(.*?)"/)?.[1] || "0 0 100 100"}
                          preserveAspectRatio="xMidYMid meet"
                        >
                          {(designs["Right Pocket"]?.letters.path
                            .match(/<path[^>]*>(?:<\/path>)?/g) || [])
                            .map((li, idx) => {
                              const pClass = li.match(/class="(.*?)"/)?.[1];
                              const pShape = li.match(/d="(.*?)"/)?.[1];
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
                      <g transform="translate(194.29, 401.73)">
                        {(() => {
                          const text = designs["Right Pocket"]?.letters.title || "";
                          const textLength = text.length;
                          const maxSize = 45; // Pocket area size (55 - 10 for padding)

                          // Calculate font size based on text length - same logic for both pockets
                          let fontSize;
                          const font = designs["Right Pocket"]?.letters?.font;
                          if (textLength === 1) {
                            fontSize = font === "Graduate" || font === "Cutive" ? 55 : 60;
                          } else if (textLength === 2) {
                            fontSize = font === "Graduate" || font === "Cutive" ? 24 : 38;
                          } else if (textLength === 3) {
                            fontSize = font === "Graduate" || font === "Cutive" ? 18 : 28;
                          } else {
                            fontSize = font === "Graduate" || font === "Cutive" ? 15 : 19;
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
                          const font = designs["Right Pocket"]?.letters?.font;
                          if (textLength === 1) {
                            fontSize = font === "Graduate" || font === "Cutive" ? 55 : 60;
                          } else if (textLength === 2) {
                            fontSize = font === "Graduate" || font === "Cutive" ? 24 : 38;
                          } else if (textLength === 3) {
                            fontSize = font === "Graduate" || font === "Cutive" ? 18 : 28;
                          } else {
                            fontSize = font === "Graduate" || font === "Cutive" ? 15 : 19;
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
                        <g transform="translate(187.5, 378)">
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
                        <g transform="translate(163.13, 355.23)">
                          <svg
                            width="64"
                            height="64"
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
                        <g transform="translate(163.13, 355.23)">
                          <svg
                            width="64"
                            height="64"
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
                    // in the pocket guide (161.13, 353.23, 68 x 68) with the 2-unit margin the symbols and
                    // letters keep: as large as it fits, centred (it sat 3 right and 17 low, past the guide)
                    <g transform="translate(163.13, 355.23)">
                      <image
                        xlinkHref={designs["Right Pocket"]?.upload.file}
                        width="64"
                        height="64"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )}
                </g>
              )}
            </g>
          )}

          {globals.catName !== 'Hoodies' && !laddiesJacket && (
            <g id="left-pocket" transform={pocketBoxTransform(styles.pocket, "left")}>
              <rect
                className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
                x="285.13"
                y="353.23"
                width="68"
                height="68"
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
                          /* Centred on the pocket guide (290.79,374.23 + 55/2). Size, scale
                             and aspect handling match the right pocket exactly - they used to
                             differ (50px box, xMidYMin), which rendered this letter 17% smaller
                             and top-aligned instead of centred. */
                          <g transform="translate(285.13, 353.23)">
                            <svg
                              width="68"
                              height="68"
                              viewBox={designs["Left Pocket"]?.letters.path.match(/viewBox="(.*?)"/)?.[1] || "0 0 100 100"}
                              preserveAspectRatio="xMidYMid meet"
                            >
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
                          <g transform="translate(318.29, 401.73)">
                            {(() => {
                              const text = designs["Left Pocket"]?.letters.title || "";
                              const textLength = text.length;
                              const maxSize = 45; // Pocket area size (55 - 10 for padding)

                              // Calculate font size based on text length - same logic for both pockets
                              let fontSize;
                              const font = designs["Left Pocket"]?.letters?.font;
                              if (textLength === 1) {
                                fontSize = font === "Graduate" || font === "Cutive" ? 55 : 60;
                              } else if (textLength === 2) {
                                fontSize = font === "Graduate" || font === "Cutive" ? 24 : 38;
                              } else if (textLength === 3) {
                                fontSize = font === "Graduate" || font === "Cutive" ? 18 : 28;
                              } else {
                                fontSize = font === "Graduate" || font === "Cutive" ? 15 : 19;
                              }

                              return (
                                <text
                                  x="0"
                                  y="0"
                                  fontFamily={
                                    designs["Left Pocket"]?.letters?.font
                                  }
                                  fill="none"
                                  fontSize={fontSize}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  strokeWidth="8"
                                  stroke={designs["Left Pocket"]?.letters?.border}
                                  style={{ paintOrder: "stroke fill" }}
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
                              const font = designs["Left Pocket"]?.letters?.font;
                              if (textLength === 1) {
                                fontSize = font === "Graduate" || font === "Cutive" ? 55 : 60;
                              } else if (textLength === 2) {
                                fontSize = font === "Graduate" || font === "Cutive" ? 24 : 38;
                              } else if (textLength === 3) {
                                fontSize = font === "Graduate" || font === "Cutive" ? 18 : 28;
                              } else {
                                fontSize = font === "Graduate" || font === "Cutive" ? 15 : 19;
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
                                  style={{ paintOrder: "stroke fill" }}
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
                        <g transform="translate(277.5, 378)">
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
                        <g transform="translate(287.13, 355.23)">
                          <svg
                            width="64"
                            height="64"
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
                        <g transform="translate(287.13, 355.23)">
                          <svg
                            width="64"
                            height="64"
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
                    // in the pocket guide (285.13, 353.23, 68 x 68), as the right pocket
                    <g transform="translate(287.13, 355.23)">
                      <image
                        xlinkHref={designs["Left Pocket"]?.upload.file}
                        width="64"
                        height="64"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  )}
                </g>
              )}
            </g>
          )}

          {!designs["Left Chest"]?.done &&
            !designs["Right Chest"]?.done &&
            !advance.chestPocket && (
              <g
                id="front-center-wrapper 123"
                transform={
                  globals.catName === 'Hoodies' ? "translate(0, 50)" : "translate(0, 0)"
                }
              >
                <rect
                  className={`cjd-guides ${!globals.guides && "cjd-guides-hide"
                    }`}
                  x="124.32"
                  y="152"
                  width="267"
                  height="44.92"
                  fill="#e6e6e6"
                  data-name="front-center"
                  onClick={() => openModal("Front Center")}
                />

                <g transform="translate(257, 174)">
                  <g>
                    {designs["Front Center"]?.done && (
                      <g className="name">
                        <path
                          id="frontArt"
                          d="M57.019,348.069c0-104.42,84.649-189.07,189.069-189.07 s189.069,84.649,189.069,189.07"
                          fill="none"
                          transform="translate(-245, -168)"
                        />
                        <text
                          x="0"
                          y="0"
                          fontFamily={designs["Front Center"].name?.font}
                          fill={designs["Front Center"]?.name?.fill}
                          stroke={designs["Front Center"]?.name?.stroke}
                          strokeWidth="2.5"
                          fontSize={designs["Front Center"]?.name?.size}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ paintOrder: "stroke fill" }}
                        >
                          {designs["Front Center"]?.name?.appearance ===
                            "Arc" ? (
                            <textPath
                              alignmentBaseline="middle"
                              xlinkHref="#frontArt"
                              startOffset="50%"
                              style={{ letterSpacing: '1px' }}
                            >
                              {designs["Front Center"].name?.title}
                            </textPath>
                          ) : (
                            <tspan alignmentBaseline="middle">
                              {designs["Front Center"].name?.title}
                            </tspan>
                          )}
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              </g>
            )}

          {styles.collar === "Overlap" && (
            <Simple
              colorPicker={(part) => colorPicker(part)}
              knit={styles.knit}
              base={colors.base ? colors.base : "#ffffff"}
              lines={colors.lines ? colors.lines : "#cacae8"}
              border={colors.border ? colors.border : "#000000"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={flip}
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
              flip={flip}
            />
          )}

          {styles.collar === "Shirt Collar" && (
            <RollUp
              colorPicker={(part) => colorPicker(part)}
              outside={colors.outside ? colors.outside : "#ffffff"}
              inside={colors.inside ? colors.inside : "#ffffff"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={flip}
            />
          )}

          {styles.collar === "Hood" && (
            <Hood
              colorPicker={(part) => colorPicker(part)}
              outside={colors.outside ? colors.outside : "#ffffff"}
              inside={colors.inside ? colors.inside : "#000000"}
              lining={colors.lining ? colors.lining : "#000000"}
              lace={colors.lace ? colors.lace : "#c4c6c6"}
              flip={flip}
            />
          )}

          {styles.collar === "Zipper Hood" && (
            <ZipperHood
              colorPicker={(part) => colorPicker(part)}
              outside={colors.outside ? colors.outside : "#ffffff"}
              inside={colors.inside ? colors.inside : "#ffffff"}
              zipper={colors.zip ? colors.zip : "#c4c6c6"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={flip}
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
              flip={flip}
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
              flip={flip}
            />
          )}

          {styles.collar === "Band" && (
            <Band
              colorPicker={(part) => colorPicker(part)}
              band={colors.band ? colors.band : "#ffffff"}
              lining={colors.lining ? colors.lining : "#000000"}
              flip={flip}
            />
          )}
        </g>
      </svg>
    </>
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

export default connect(mapStateToProps, mapDispatchToProps)(Jacket);
