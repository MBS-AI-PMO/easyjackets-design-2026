import React from "react";

const Simple = ({ colorPicker, knit, base, lines, border, lining, flip }) => (
  <>
    {flip ? (
      <g data-name="collar simple back">
        <path
          d="M325.5,75.5q-4.59-17.28-9.17-34.56c-13-8.77-33.62-12.25-59-12.36-25.36.11-45.94,3.59-59,12.36q-4.59,17.28-9.17,34.56Z"
          stroke={base == "#000000" ? "#ffffff" : "#231f20"}
          strokeMiterlimit="2.6131"
          strokeWidth="1px"
          fill={base}
          fillRule="evenodd"
          className="cjd-color-hover"
          onClick={() => colorPicker("base")}
        />

        <g
          id="knit"
          fill={lines}
          fillRule="evenodd"
          strokeWidth="1px"
          style={{
            transform: "translate(188.8px, 28px)",
            clipPath: "url(#simpleCollarBack)",
            stroke:
              (knit === "Single Line Border" ||
                knit === "Double Line Border") &&
              border,
          }}
          className="cjd-color-hover"
          onClick={() => colorPicker("lines")}
        >
          {(knit === "Double Line" || knit === "Double Line Border") && (
            <path
              fill={lines ? lines : "#cacae8"}
              style={{
                stroke:
                  knit === "Double Line Border" &&
                  (border ? border : "#000000"),
              }}
              id="double"
              d="M747.23,157.15q-6.6-.65-13.58-1.16a669,669,0,0,0-101.1,0q-6.78.49-13.21,1.13c-.08,0-2,7.31-1.93,7.3q7.43-.78,15.37-1.36a662.27,662.27,0,0,1,100.49,0q8.22.6,15.9,1.4C749.26,164.46,747.32,157.16,747.23,157.15Zm-3.87-14.57c-3.05-.28-6.17-.54-9.34-.77a669.22,669.22,0,0,0-101.61,0q-4.68.35-9.2.76c-.09,0-2,7.28-1.93,7.28q5.49-.54,11.26-1a661.38,661.38,0,0,1,101.11,0c4,.29,7.86.62,11.64,1C745.38,149.86,743.45,142.58,743.36,142.58Z"
              transform="translate(-614.82 -124.83)"
            />
          )}

          {(knit === "Single Line" || knit === "Single Line Border") && (
            <path
              fill={lines ? lines : "#cacae8"}
              style={{
                stroke:
                  knit === "Single Line Border" &&
                  (border ? border : "#000000"),
              }}
              id="single"
              d="M744.72,147.7s-5.2-.62-7.85-.91a491,491,0,0,0-106.89,0c-2.75.3-8.15.95-8.15.95l-2.94,11.12s7.4-1,11.23-1.37a485.43,485.43,0,0,1,106.35,0c3.82.4,11.2,1.35,11.2,1.35Z"
              transform="translate(-614.82 -124.83)"
            />
          )}
        </g>
      </g>
    ) : (
      <g data-name="collar simple">
        <path
          d="m189.66 75.73 13.34-37.31c37.5-17.32 74-18.42 109.18 0l13.48 37.31c-45.76 27.27-91.1 27.76-136 0z"
          stroke={base == "#000000" ? "#ffffff" : "#231f20"}
          strokeMiterlimit="2.6131"
          strokeWidth="1px"
          fill={base}
        />

        <polygon
          points="0 0 79.95 0 44.77 38.9 31.78 38.9 0 0"
          fill={lining}
          style={{ transform: "translate(218px, 66.5px)" }}
          className="cjd-color-hover"
          onClick={() => colorPicker("lining")}
        />

        <g className="cjd-color-hover" onClick={() => colorPicker("base")}>
          <path
            d="M189.35,75.65q4.59-17.28,9.17-34.57a52.94,52.94,0,0,1,10.41-5.33c-8.19,5.16-7,11.38,1.24,17.88C223.94,64.48,242.58,80.27,257.31,93c5.17,4.47,9.85,8.56,13.68,11.94-10.31.43-18.24,1-26.8,0-25.62-3-44.93-13.33-54.84-29.3Z"
            fill={base}
            fillRule="evenodd"
            data-name="base"
            stroke={base == "#000000" ? "#ffffff" : "#231f20"}
            strokeMiterlimit="2.6131"
            strokeWidth="1px"
          />

          <path
            d="m325.83 75.65q-4.57-17.28-9.17-34.57a52.94 52.94 0 0 0-10.41-5.33c8.19 5.16 7 11.38-1.24 17.88-13.77 10.85-32.4 26.64-47.13 39.37-5.17 4.47-5.44 8.12-5.71 12.47a108.48 108.48 0 0 0 25.34-1.47c22.37-3.89 39.27-13.76 48.32-28.35z"
            fill={base}
            fillRule="evenodd"
            data-name="base"
            stroke={base == "#000000" ? "#ffffff" : "#231f20"}
            strokeMiterlimit="2.6131"
            strokeWidth="1px"
          />
        </g>

        {(knit === "Double Line" || knit === "Double Line Border") && (
          <g
            className="cjd-color-hover"
            onClick={() => colorPicker("lines")}
            fill="#e6e6e6"
            fillRule="evenodd"
            strokeWidth="1px"
            data-name="knit double"
          >
            <g data-name="trims right">
              <path
                d="M190.6,72l1.57-5.93A156.83,156.83,0,0,0,206,78.26c8.37,6.86,17.44,14.3,23.42,22.6l.4.85.17.59c-2.83-.72-5.56-1.54-8.17-2.47-5.42-6.19-12.53-12-19.19-17.47-4.37-3.59-8.56-7-12-10.36Z"
                data-name="bottom"
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
              />
              <path
                d="M194.22,58.35l2.6-9.81,1.62,3.92c3.86,6.52,12.88,13.92,22.7,22,10.7,8.77,22.3,18.28,29.94,28.89l.52,1.09.31,1.14c-2.7-.11-5.36-.33-8.15-.68-7.14-9-17.4-17.4-26.93-25.21-9.18-7.52-17.7-14.51-22.61-21.31Z"
                data-name="top"
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
              />
            </g>
            <g data-name="trims left">
              <path
                d="M324.87,72l-1.58-5.93a155.14,155.14,0,0,1-13.82,12.19c-8.37,6.86-17.44,14.3-23.42,22.6l-.41.85-.16.59c2.83-.72,5.56-1.54,8.17-2.47,5.42-6.19,12.53-12,19.18-17.47,4.38-3.59,8.57-7,12-10.36Z"
                data-name="bottom"
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
              />
              <path
                d="M321.25,58.35l-2.61-9.81L317,52.46c-3.85,6.52-12.88,13.92-22.69,22-10.7,8.77-22.3,18.28-29.95,28.89l-.52,1.09-.31,1.14c2.7-.11,5.36-.33,8.16-.68,7.13-9,17.4-17.4,26.93-25.21,9.17-7.52,17.69-14.51,22.61-21.31Z"
                data-name="top"
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
              />
            </g>
          </g>
        )}

        {(knit === "Single Line" || knit === "Single Line Border") && (
          <g
            className="cjd-color-hover"
            onClick={() => colorPicker("lines")}
            fill={base}
            fillRule="evenodd"
            strokeWidth="1px"
            data-name="knit single"
          >
            <path
              d="m192.12 65.7 3.8-14.35c5.54 7.9 14.26 16.24 25.23 24.88 13.57 10.77 23.33 20.41 29.85 29.1a138.3 138.3 0 0 1-16.75-2.2c-6.83-6.81-8.1-8.9-22.1-19.9s-14.38-11.4-20.03-17.53z"
              data-name="trim right"
              fill={lines ? lines : "#cacae8"}
              style={{
                stroke:
                  knit === "Single Line Border" &&
                  (border ? border : "#000000"),
              }}
            />
            <path
              d="m323.19 65.7-3.8-14.35c-5.54 7.9-14.26 16.24-25.23 24.88-13.57 10.76-23.33 20.41-29.85 29.1a138.3 138.3 0 0 0 16.75-2.2c6.83-6.81 8.1-8.9 22.1-19.9s14.38-11.4 20.03-17.53z"
              data-name="trim left"
              fill={lines ? lines : "#cacae8"}
              style={{
                stroke:
                  knit === "Single Line Border" &&
                  (border ? border : "#000000"),
              }}
            />
          </g>
        )}

        {/* <path d="m325.83 75.65q-4.57-17.28-9.17-34.57a52.94 52.94 0 0 0-10.41-5.33c8.19 5.16 7 11.38-1.24 17.88-13.77 10.85-32.4 26.64-47.13 39.37-5.17 4.47-5.44 8.12-5.71 12.47a108.48 108.48 0 0 0 25.34-1.47c22.37-3.89 39.27-13.76 48.32-28.35z" fill="none" stroke="#231f20"  strokeMiterlimit="2.6131" strokeWidth="1px" data-name="border" /> */}
      </g>
    )}
  </>
);

export default Simple;
