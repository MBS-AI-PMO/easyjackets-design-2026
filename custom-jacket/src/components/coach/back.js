import React from "react";
import { connect } from "react-redux";

import { modalState, activeSidebar, colorPicker } from "../../store/actions";

import Hood from "../Jacket/collar/hood";
import BadgeTemp from "../Jacket/badge";

const CoachBack = ({
  globals,
  materials,
  styles,
  colors,
  designs,
  advance,
  modalState,
  activeSidebar,
  colorPicker,
  jackets,
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

  return (
    <svg
      id="jacketBack"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -18 460 622"
      className={pose ? "" : "cjd-hide"}
    >
      <g
        id="laces"
        style={{ transform: "translate(193px, 494px)" }}
        className="cjd-color-hover"
        onClick={() => colorPicker("Lace Color")}
      >
        <path
          d="M77,1.05a3.9,3.9,0,1,1-3.9,3.89A3.9,3.9,0,0,1,77,1.05Z"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke="#231f20"
          strokeMiterlimit="2.61"
          strokeWidth="1"
        />
        <path
          d="M77,4.94c-5.89,41.87-1.6,85.24-6,122.32"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke={colors.lace ? colors.lace : "#c4c6c6"}
          strokeLinecap="round"
          strokeMiterlimit="2.61"
          strokeWidth="2.44"
        />
        <path
          d="M4.92,1.07A3.9,3.9,0,1,1,1.46,5.36,3.9,3.9,0,0,1,4.92,1.07Z"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke="#231f20"
          strokeMiterlimit="2.61"
          strokeWidth="1"
        />
        <path
          d="M5.33,4.94c-1.41,42.26,7.47,84.93,7,122.26"
          transform="translate(-0.72 -0.33)"
          fill="none"
          stroke={colors.lace ? colors.lace : "#c4c6c6"}
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
              stroke-miterlimit="10"
            />
            <path
              d="M456.49,535.06c-.45,6.28-.41,11.46-1.37,16.44a7.77,7.77,0,0,1-4.67,4.88c-6,1.76-12.2,3.53-18.4,3.83a261.12,261.12,0,0,1-28.24-.63c-5.07-.3-8-3.28-8.28-8.71-.2-3.78-.95-7.53-1.57-12.13C415,541.31,435.39,542.1,456.49,535.06Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              stroke-miterlimit="10"
            />
          </g>
          <g id="right">
            <path
              d="M160.45,35.16l-10.78,3.13c-27.77,13.8-101.38,36-105.45,71.55,0,0-15.71,57.83-21.65,87.13a505.64,505.64,0,0,0-8.75,68.74C10.91,312.42,9.47,359.21,7.35,406Q4.62,466.09,1.74,526.22c-.19,4.06,3.71,10.1,7.6,11.29,18.57,5.68,37.47,5.56,56.36,2.41,4.7-.78,6-5.86,6.46-10.07,1.4-12.9,2.44-25.85,3.53-38.8,2.09-24.88,4.24-49.75,6.12-74.65.83-11.12.72-22.32,1.61-33.43,1.51-18.72,3.78-37.38,5.14-56.1a360.71,360.71,0,0,0,1.09-38.33,269.21,269.21,0,0,1,2.95-49.72c.08-12.8-2.89-33-2.89-33C89.65,151.63,117.54,75.09,165.62,35,168,34.41,160.45,35.16,160.45,35.16Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              stroke-miterlimit="10"
            />
            <path
              d="M5.28,535.06c.45,6.28.42,11.46,1.38,16.44a7.77,7.77,0,0,0,4.67,4.88c6,1.76,12.2,3.53,18.39,3.83A261.25,261.25,0,0,0,58,559.58c5.06-.3,8-3.28,8.28-8.71.19-3.78.94-7.53,1.56-12.13C46.82,541.31,26.38,542.1,5.28,535.06Z"
              transform="translate(-1.24 -0.47)"
              stroke="#000"
              stroke-miterlimit="10"
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



      <g id="back-middle" style={{ transform: "translate(-28px, 30px)" }}>
        <rect
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          x="130"
          y="175"
          width="255"
          height="190"
          fill="#e6e6e6"
          data-name="cjd-back-middle"
          data-patch="true" // names fitted like a sleeve patch: as large as it fits, centred (utils/autoFitText.js)
          onClick={() => openModal("Back Middle")}
        />

        {designs["Back Middle"]?.done && designs["Back Middle"]?.name && (
          <g style={{ transform: "translate(256px, 270px)" }}>
            <path
              id="backMiddleArc"
              d="M101.689,171.438 c78.71-78.71,206.092-78.71,284.802,0"
              style={{ fill: "none", transform: "translate(-242px, -115px)" }}
            ></path>
            <text
              x="0"
              y="0"
              fontFamily={designs["Back Middle"]?.name.font}
              fill={designs["Back Middle"]?.name.fill}
              stroke={designs["Back Middle"]?.name?.stroke}
              strokeWidth="2.5"
              fontSize={
                designs["Back Middle"]?.name?.title.length <= 2
                  ? designs["Back Middle"]?.name?.font === "Cutive"
                    ? 140
                    : 230
                  : designs["Back Middle"]?.name?.title?.length === 3
                    ? designs["Back Middle"]?.name?.font === "Cutive" ||
                      designs["Back Middle"]?.name?.font === "Graduate"
                      ? 115
                      : 150
                    : designs["Back Middle"]?.name?.title?.length === 4
                      ? designs["Back Middle"]?.name?.font === "Cutive" ||
                        designs["Back Middle"]?.name?.font === "Graduate"
                        ? 90
                        : 110
                      : designs["Back Middle"]?.name?.title?.length === 5
                        ? designs["Back Middle"]?.name?.font === "Cutive" ||
                          designs["Back Middle"]?.name?.font === "Graduate"
                          ? 70
                          : 80
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
                  style={{ letterSpacing: '1px' }}
                  fontSize={
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

        {designs["Back Middle"]?.done && designs["Back Middle"]?.editables && (
          <g style={{ transform: "translate(160px, 175px)" }}>
            <svg
              width="190"
              height="190"
              viewBox="0 0 260 45"
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
          <g style={{ transform: "translate(58px, 175px)" }}>
            {designs["Back Middle"]?.symbol.type === "Flags" && (
              <g style={{ transform: "translate(0px, 0px)" }}>
                {/* the flag across the guide (255 wide, from x 130), cropped to the flag and its outline */}
                <svg
                  x="77"
                  width="245"
                  height="190"
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
              <g style={{ transform: "translate(0px, 0px)" }}>
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
              <g style={{ transform: "translate(0px, 0px)" }}>
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
          <g style={{ transform: "translate(142px, 175px)" }}>
            <image
              xlinkHref={designs["Back Middle"]?.upload.file}
              width="230"
              height="190"
            />
          </g>
        )}
      </g>

      <g id="back-bottom" style={{ transform: "translate(-28px, 60px)" }}>
        {/* 58 tall (it was 45, grown upwards): an arched name is fitted to its height, so the taller band
            draws it bigger. config/designAreaConfig.js has the same size for the dialog's preview. */}
        <rect
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          x="142"
          y="372"
          width="230"
          height="58"
          fill="#e6e6e6"
          data-name="cjd-back-bottom"
          data-arc-fit="true" // an arched name is fitted to this guide (utils/autoFitText.js fitArcInGuide)
          onClick={() => openModal("Back Bottom")}
        />

        {designs["Back Bottom"]?.done && designs["Back Bottom"]?.name && (
          <g style={{ transform: "translate(257px, 401px)" }}>
            <path
              id="backBottomArc"
              d="M107.448,346.152
            c76.631,76.631,200.649,76.631,277.28,0"
              fill="none"
              style={{ fill: "none", transform: "translate(-245px, -393px)" }}
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

      {styles.collar === "Hood" ? (
        <g style={{ transform: "translate(-28px, -31px)" }}>
          <Hood
            colorPicker={(part) => colorPicker(part)}
            outside={colors.outside ? colors.outside : "#ffffff"}
            inside={colors.inside ? colors.inside : "#000000"}
            lining={colors.lining ? colors.lining : "#ffffff"} // the coach lining only comes in white
            lace={colors.lace ? colors.lace : "#c4c6c6"}
            flip={true}
          />
        </g>
      ) : (
        <path
          id="collar_back"
          data-name="collar back"
          d="M308.8,36.47c-51-5-102-6.23-154.64,0C160.3,26,165.53,16.65,171.33,7.64c1.17-1.82,4.45-2.9,6.88-3.18,36-4.18,72.1-5,108.17-.23,4.5.59,7.71,2.34,9.89,6.39C300.74,18.92,309.2,36.09,308.8,36.47Z"
          transform="translate(-1.48 -0.49)"
          fill={colors.outside ? colors.outside : "#ffffff"}
          className="cjd-color-hover"
          onClick={() => colorPicker("outside")}
          stroke="#000"
          strokeMiterlimit="10"
        />
      )}

      <g id="back-top" style={{ transform: "translate(-42px, 0)" }}>
        <rect
          className={`cjd-guides ${!globals.guides && "cjd-guides-hide"}`}
          x="140"
          y="110"
          width="260"
          height="45"
          fill="#e6e6e6"
          data-name="cjd-back-top"
          onClick={() => openModal("Back Top")}
        />

        {designs["Back Top"]?.done && designs["Back Top"]?.name && (
          <g style={{ transform: "translate(270px, 132.5px)" }}>
            <path
              id="backTopArc"
              d="M101.689,171.438   c78.71-78.71,206.092-78.71,284.802,0"
              style={{ fill: "none", transform: "translate(-245px, -123px)" }}
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
                  style={{ letterSpacing: "1x" }}
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

export default connect(mapStateToProps, mapDispatchToProps)(CoachBack);
