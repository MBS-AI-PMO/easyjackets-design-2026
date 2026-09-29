import React from 'react';

const RollUp = ({ colorPicker, outside, inside, lining, flip }) => {
  return (
    <>
      {flip ? (
        <>
          <path
            className="cjd-color-hover"
            onClick={() => colorPicker('outside')}
            id="pro_shirt_back"
            data-name="pro shirt back"
            d="M683.6,178.29c-41.5,0-64.9-6.8-64.9-6.8s12.5-26.7,14.2-29.4,3.1-3.2,4.4-3.2,26.2,1.7,46.3,1.7,45-1.7,46.3-1.7,2.6.4,4.4,3.2,14.2,29.4,14.2,29.4-23.4,6.8-64.9,6.8"
            transform="translate(-618.35 -138.64)"
            fill={outside}
            stroke={outside == "#000000" ? "#ffffff" : "#000"}
            strokeMiterlimit="10"
            strokeWidth="1"
            style={{ transform: 'translate(-426px, -97px)' }}
          />

          <g
            id="hood-back"
            style={{ transform: 'translate(18px, 30px) scale(0.5)' }}
          >
            <text
              x="88"
              y="0"
              fontFamily="Baseball"
              fill="#404041"
              stroke="none"
              fontSize="22"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <tspan alignmentBaseline="middle">COLLAR BACK</tspan>
            </text>
            <g
              className="cjd-color-hover"
              onClick={() => colorPicker('inside')}
              style={{ transform: 'translate(26px, 20px)' }}
            >
              <path
                d="M124.41,2.07c-.5-2.1-9.4,7-58.6,7s-63.2-9.2-63.7-7,6.6,24.4,1.2,44.7c0,0,18.4,6.8,59.9,6.8s59.9-6.8,59.9-6.8h0C117.81,26.57,124.91,4.27,124.41,2.07Z"
                transform="translate(-1.59 -1.23)"
                fill={inside}
                stroke={inside == "#000000" ? "#ffffff" : "#404041"}
                strokeMiterlimit="10"
              />
              <path
                d="M121.51,37.27c-6,1.5-23.2,6.4-58.2,6.4s-52.2-4.8-58.2-6.4"
                transform="translate(-1.59 -1.23)"
                fill={inside}
                stroke={inside == "#000000" ? "#ffffff" : "#404041"}
                strokeMiterlimit="10"
              />
            </g>
          </g>
        </>
      ) : (
        <g
          id="pro_shirt"
          data-name="collar pollar"
          style={{ transform: 'translate(185px, 41px)' }}
        >
          <path
            id="collar_inside"
            data-name="collar inside"
            d="M23,2.21C14.18,1.87,6.42.05,4.65.62,3.43,1,2.09,2.55,1.21,5.27a37.23,37.23,0,0,0,.33,16c.11.56,1.22,4,1.66,5.45a11.39,11.39,0,0,0,.56,1.47c9.31,24,38.7,36.68,38.7,36.68H60.88s29.39-12.71,38.7-36.68a9.06,9.06,0,0,0,.56-1.47c.44-1.48,1.55-4.89,1.66-5.45a35.44,35.44,0,0,0,.33-16C101.25,2.55,99.91,1,98.69.62,96.81.05,89.05,1.75,80.4,2.21Z"
            fill={lining}
            stroke={lining == "#000000" ? "#ffffff" : "#000"}
            strokeWidth="1px"
            transform="translate(20.2, 0.4)"
            className="cjd-color-hover"
            onClick={() => colorPicker('lining')}
          />
          <g className="cjd-color-hover" onClick={() => colorPicker('outside')}>
            <path
              d="M729.52,169.7c.22-.34.78-.91,1.45-1.93,3.46-8.18,5.13-16.58,3.35-24.87-.9-2.73-2.23-4.32-3.46-4.66-1.9-.57-9.7,1.14-18.4,1.59-13.28.57-44.06.57-57.33,0-8.82-.34-16.62-2.16-18.41-1.59-1.22.34-2.56,1.93-3.46,4.66a12.71,12.71,0,0,0-.55,1.93c-1.34,8.74,1,17.83,5.24,26.35C653.12,174.36,727.4,173.56,729.52,169.7Z"
              transform="translate(-612.06 -137.86)"
              fill={outside}
              stroke={outside == "#000000" ? "#ffffff" : "#000"}
              strokeMiterlimit="10"
              strokeWidth="1"
            />

            <path
              d="M633.51,142.9c0-.12.22-1-.22-.46-2.11,2.62-5.22,6.7-9.1,12.5-8.32,12.49-11.86,18.28-11.86,18.28s.11,38.38,5,54.85c18.41-1.82,44.14-31.68,57.33-25.55C670.44,197.52,626.63,174.58,633.51,142.9Z"
              transform="translate(-612.06 -137.86)"
              fill={outside}
              stroke={outside == "#000000" ? "#ffffff" : "#000"}
              strokeMiterlimit="10"
              strokeWidth="1"
            />

            <path
              d="M734.21,142.9c0-.12-.22-1,.22-.46,2.11,2.62,5.22,6.7,9.1,12.5,8.32,12.49,11.87,18.28,11.87,18.28s-.12,38.38-5,54.85c-18.41-1.82-44.14-31.68-57.33-25.55C697.39,197.52,741.2,174.58,734.21,142.9Z"
              transform="translate(-612.06 -137.86)"
              fill={outside}
              stroke={outside == "#000000" ? "#ffffff" : "#000"}
              strokeMiterlimit="10"
              strokeWidth="1"
            />
          </g>
        </g>
      )}
    </>
  );
};

// const RollUp = ({ knit, base, lines, border, flip }) => (
//   <>
//     { flip ? (
//       <g data-name="collar rollup back" style={{ transform: 'translate(188.5px, 3.5px)' }}>
//         <defs>
//           <clipPath id="clip-path" transform="translate(-0.04 0.04)">
//             <path d="M.35,72.32C5.22,57.47,16.62,32.37,22.54,15.87a15.31,15.31,0,0,1,6-7.87c.37-.26.75-.5,1.14-.74a12.36,12.36,0,0,0,2.25-1.17h0A2.09,2.09,0,0,0,32.38,6h0a3.34,3.34,0,0,0,.58-.2h0a6.34,6.34,0,0,0,.68-.35h0c.25-.14.51-.31.79-.5h0c.28-.2.58-.42.9-.67C44,1.53,54.41.29,70.58.21c14.9.07,24.84,1.28,33.06,4.06q.47.38.9.66l0,0c.27.17.52.33.77.46l.12.07c.22.11.43.21.64.29a13.14,13.14,0,0,0,3.76,1.78,15.45,15.45,0,0,1,6.64,8.31c5.93,16.5,17.32,41.6,22.19,56.45C106,84.38,36.25,86.15.35,72.32Z" fill="none" />
//           </clipPath>
//         </defs>
//         <path d="M.35,72.32C5.22,57.47,16.62,32.37,22.54,15.87a15.31,15.31,0,0,1,6-7.87c.37-.26.75-.5,1.14-.74a12.36,12.36,0,0,0,2.25-1.17h0A2.09,2.09,0,0,0,32.38,6h0a3.34,3.34,0,0,0,.58-.2h0a6.34,6.34,0,0,0,.68-.35h0c.25-.14.51-.31.79-.5h0c.28-.2.58-.42.9-.67C44,1.53,54.41.29,70.58.21c14.9.07,24.84,1.28,33.06,4.06q.47.38.9.66l0,0c.27.17.52.33.77.46l.12.07c.22.11.43.21.64.29a13.14,13.14,0,0,0,3.76,1.78,15.45,15.45,0,0,1,6.64,8.31c5.93,16.5,17.32,41.6,22.19,56.45C106,84.38,36.25,86.15.35,72.32Z" transform="translate(-0.04 0.04)" fill={base} stroke="#231f20" strokeMiterlimit="2.6131" strokeWidth="0.50002" />

//         <g id="knit">
//           <g clipPath="url(#clip-path)" fill={lines} fillRule="evenodd" stroke={ (knit === 'Single Line Border' || knit === 'Double Line Border') && border }>
//             { (knit === 'Double Line' || knit === 'Double Line Border') &&
//               <path d="M128.85,47.42s-5.49-.46-8.3-.67a669.14,669.14,0,0,0-101.11,0c-3.15.23-9.29.76-9.29.76l-3,7.39s8.24-.76,12.52-1.08a662.27,662.27,0,0,1,100.49,0c4,.29,11.69,1,11.69,1Zm-7.23-17.63-.7-.05a670.65,670.65,0,0,0-101.62,0l-1.91.15-3,7.33,5-.4a662.66,662.66,0,0,1,101.11,0l4.07.32Z" transform="translate(-0.04 0.04)" />
//             }

//             { (knit === 'Single Line' || knit === 'Single Line Border') &&
//               <path id="single" d="M124.64,37.2a466.31,466.31,0,0,0-110.36.31L10,48a561.18,561.18,0,0,1,119-.25Z" transform="translate(-0.04 0.04)" />
//             }
//           </g>
//         </g>
//       </g>
//     ) : (
//       <g data-name="collar rollup">
//         <path d="M193.36,63.93,218.43,11C246-3.55,272.36-3.11,297.66,11l25.07,52.94C279,94.93,235.89,95.09,193.36,63.93Z" stroke="#231f20" strokeMiterlimit="2.6131" strokeWidth=".50003px" data-name="base" />
//         <path d="M188.87,76.19c4.87-14.85,16.27-39.95,22.19-56.45,2.54-7.09,7.54-8.9,12.87-11.6-9.2,7.24-9.21,16-2.23,25.07,12.71,16.61,24.49,34.31,37,51.17,4.08,5.5,6.85,10.33,5.8,21.52-9.39.55-16.23.15-25.06-2.08-21.62-5.45-35.1-9.78-50.53-27.63Z" fill={base} fillRule="evenodd" data-name="base" />
//         <path d="M188.87,76.19c4.87-14.85,16.27-39.95,22.19-56.45,2.54-7.09,7.54-8.9,12.87-11.6-9.2,7.24-9.21,16-2.23,25.07,12.71,16.61,24.49,34.31,37,51.17,4.08,5.5,6.85,10.33,5.8,21.52-9.39.55-16.23.15-25.06-2.08-21.62-5.45-35.1-9.78-50.53-27.63Z" fill="none" stroke="#231f20" strokeMiterlimit="2.6131" strokeWidth=".50003px" data-name="border" />

//         { (knit === 'Double Line' || knit === 'Double Line Border') &&
//           <g fill="#fff" fillRule="evenodd" data-name="knit double">
//             <path
//               d="m198.27 59-1.67-3.13 3.23-7.87 1.16 2.7c2.84 5.3 7 11 11.46 17.08 7 9.62 14.66 20.05 19 31.68l0.24 1.19v1s-5.91-1.33-7.45-2c-3.19-8.75-10.37-18.46-16-26.11-3.67-5-7.19-9.84-10-14.52z"
//               data-name="bottom" style={{
//                 fill: lines,
//                 stroke: knit === 'Double Line Border' && border
//               }} />
//             <path
//               d="M204.54,39.83,204.19,38l4.7-12.44,1,6c2.58,9.14,10.17,19.51,18.42,30.79,9,12.3,18.75,25.64,24.33,40.51l.31,1.53.09,1.59a67.77,67.77,0,0,1-8-.95c-5.38-12.59-14-24.39-22-35.34-7.72-10.55-14.88-20.34-18.47-29.87Z"
//               data-name="top" style={{
//                 fill: lines,
//                 stroke: knit === 'Double Line Border' && border
//               }} />
//           </g>
//         }

//         <path d="M327.22,76.19C322.35,61.34,311,36.24,305,19.74c-2.55-7.09-7.55-8.9-12.88-11.6,9.2,7.24,9.22,16,2.24,25.07-12.72,16.61-24.49,34.31-37,51.17-4.07,5.5-6.84,10.33-5.79,21.52,9.38.55,16.22.15,25.05-2.08,21.62-5.45,35.1-9.78,50.53-27.63Z" fill={base} fillRule="evenodd" data-name="base" />

//         { (knit === 'Double Line' || knit === 'Double Line Border') &&
//           <g fill="#fff" fillRule="evenodd" data-name="knit double">
//             <path
//               d="m317.83 59 1.66-3.13-3.23-7.87-1.16 2.7c-2.84 5.3-7 11-11.45 17.08-7 9.62-14.66 20.05-19 31.68l-0.24 1.19v1s5.39-1.35 7.44-2c3.19-8.75 10.38-18.46 16-26.11 3.68-5 7.2-9.84 10-14.52z"
//               data-name="bottom" style={{
//                 fill: lines,
//                 stroke: knit === 'Double Line Border' && border
//               }} />
//             <path
//               d="m311.55 39.83 0.44-2.28-4.79-12-1 6c-2.6 9.16-10.2 19.53-18.44 30.81-9 12.3-18.74 25.64-24.33 40.51l-0.3 1.53-0.13 1.6a67.61 67.61 0 0 0 8-0.95c5.39-12.59 14-24.39 22-35.34 7.8-10.56 15-20.35 18.55-29.88z"
//               data-name="top" style={{
//                 fill: lines,
//                 stroke: knit === 'Double Line Border' && border
//               }} />
//           </g>
//         }

//         <path d="M327.22,76.19C322.35,61.34,311,36.24,305,19.74c-2.55-7.09-7.55-8.9-12.88-11.6,9.2,7.24,9.22,16,2.24,25.07-12.72,16.61-24.49,34.31-37,51.17-4.07,5.5-6.84,10.33-5.79,21.52,9.38.55,16.22.15,25.05-2.08,21.62-5.45,35.1-9.78,50.53-27.63Z" fill="none" stroke="#231f20" strokeMiterlimit="2.6131" strokeWidth=".50003px" data-name="border" />
//       </g>
//     )}
//   </>
// )

export default RollUp;
