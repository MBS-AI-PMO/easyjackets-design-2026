import React from "react";

const Classic = ({ colorPicker, knit, base, lines, border, lining, flip }) => (
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
          transform="translate(188.8, 28)"
          style={{
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
      <g data-name="collar simple front" transform="translate(189, 24)">
        <path
          d="M71.81,82.55a10.29,10.29,0,0,1-.11-1.89c.43-14.59,29.6-38.76,42.35-48.89,4-3.23,14.54-9.25,4.21-16.49-17.14-17.56-77.92-17.46-97.44,0C10.5,22.52,21.14,28.65,25,31.77,37.78,42,66.75,66.07,67.39,80.55a12.26,12.26,0,0,1-.11,2Z"
          transform="translate(-0.78 -1.27)"
          fill={base}
        />

        <polygon
          points="0 0 79.95 0 44.77 38.9 31.78 38.9 0 0"
          fill={lining}
          transform="translate(30, 42.5)"
          className="cjd-color-hover"
          onClick={() => colorPicker("lining")}
        />

        <path
          d="M20.91,15.27c-3,3,.27,13.27,4.22,16.45C38.38,42.35,69.5,68.14,67.23,82.34c0,0-23.6.55-41.21-7.53S2.41,55.08,1.05,52.53l9.22-34.72C50.44-3.43,90-4.47,128.84,18l9.2,34.6c-1.36,2.55-7.45,14.09-25.07,22.16S71.79,82.3,71.79,82.3c-2.27-14.2,28.81-40,42.07-50.62,4-3.17,6.83-13.1,4.22-16.45C96.54-3.32,45.88-2.33,20.91,15.27Z"
          transform="translate(-0.78 -1.27)"
          fill={base}
          stroke={base == "#000000" ? "#ffffff" : "#231f20"}
          strokeMiterlimit="10"
          strokeWidth="1"
          className="cjd-color-hover"
          onClick={() => colorPicker("base")}
        />

        {(knit === "Single Line" || knit === "Single Line Border") && (
          <g
            id="knit_single"
            data-name="knit single"
            fill={lines}
            className="cjd-color-hover"
            onClick={() => colorPicker("lines")}
          >
            <path
              id="top"
              d="M133.37,35.87l-2.6-9.8L129.15,30c-3.85,6.52-12.88,13.92-22.69,22-10.7,8.77-22.3,18.28-29.95,28.89L76,82.06l8.49-.45s17-16.84,26.3-24.43,17.69-14.51,22.6-21.31Z"
              transform="translate(-0.78 -1.27)"
              strokeWidth="1px"
              fillRule="evenodd"
              fill={lines ? lines : "#cacae8"}
              style={{
                stroke:
                  knit === "Single Line Border" &&
                  (border ? border : "#000000"),
              }}
            />

            <path
              fill={lines ? lines : "#cacae8"}
              style={{
                stroke:
                  knit === "Single Line Border" &&
                  (border ? border : "#000000"),
              }}
              id="top-2"
              data-name="top"
              d="M5.61,35.87l2.6-9.8L9.83,30C13.68,36.5,22.71,43.9,32.52,52c10.7,8.77,22.3,18.28,29.95,28.89L63,82.06l-8.49-.45s-17-16.84-26.3-24.43S10.52,42.67,5.61,35.87Z"
              transform="translate(-0.78 -1.27)"
              strokeWidth="1px"
              fillRule="evenodd"
            />
          </g>
        )}

        {(knit === "Double Line" || knit === "Double Line Border") && (
          <g
            id="knit_double"
            data-name="knit double"
            fill={lines}
            className="cjd-color-hover"
            onClick={() => colorPicker("lines")}
          >
            <g id="trims_left-3" data-name="trims left">
              <path
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
                id="bottom"
                d="M137,49.52l-1.58-5.92A158.21,158.21,0,0,1,121.6,55.79c-8.37,6.86-17.44,14.29-23.42,22.59l-.41.85-.16.6q4.24-1.08,8.17-2.48c5.42-6.18,12.53-12,19.18-17.47,4.38-3.59,8.56-7,12-10.36Z"
                transform="translate(-0.78 -1.27)"
                fillRule="evenodd"
                strokeWidth="1px"
              />
              <path
                id="top-3"
                data-name="top"
                d="M133.37,35.87l-2.6-9.8L129.15,30c-3.85,6.52-12.88,13.92-22.69,22-10.7,8.77-22.3,18.28-29.95,28.89L76,82.06l8.49-.45s17-16.84,26.3-24.43,17.69-14.51,22.6-21.31Z"
                transform="translate(-0.78 -1.27)"
                strokeWidth="1px"
                fillRule="evenodd"
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
              />
            </g>

            <g id="trims_left-4" data-name="trims left" fill={lines}>
              <path
                id="bottom-2"
                data-name="bottom"
                d="M2,49.52,3.56,43.6A158.21,158.21,0,0,0,17.38,55.79c8.37,6.86,17.44,14.29,23.42,22.59l.41.85.16.6q-4.24-1.08-8.17-2.48c-5.42-6.18-12.53-12-19.18-17.47-4.38-3.59-8.56-7-12-10.36Z"
                transform="translate(-0.78 -1.27)"
                strokeWidth="1px"
                fillRule="evenodd"
                fill={lines ? lines : "#cacae8"}
                style={{
                  stroke:
                    knit === "Double Line Border" &&
                    (border ? border : "#000000"),
                }}
              />
              <path
                id="top-4"
                data-name="top"
                d="M5.61,35.87l2.6-9.8L9.83,30C13.68,36.5,22.71,43.9,32.52,52c10.7,8.77,22.3,18.28,29.95,28.89L63,82.06l-8.49-.45s-17-16.84-26.3-24.43S10.52,42.67,5.61,35.87Z"
                transform="translate(-0.78 -1.27)"
                strokeWidth="1px"
                fillRule="evenodd"
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
      </g>
    )}
  </>
);

export default Classic;
