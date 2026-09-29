import React from "react";

// const Buttons = ({ collar, color, colorPicker }) => (
//   <g
//     stroke="#231f20"
//     strokeMiterlimit="2.6131"
//     className="cjd-color-hover"
//     onClick={() => colorPicker('buttons')}
//   >
//     <line
//       x1="245.9"
//       x2="245.9"
//       y1={collar === 'Band' ? '95.33' : '105.33'}
//       y2="528.06"
//       fill="none"
//       strokeWidth="1px"
//       data-name="button split"
//     />
//     <path
//       d="m257.38 115a6.57 6.57 0 1 1-6.57 6.56 6.57 6.57 0 0 1 6.57-6.56z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//     />
//     <path
//       d="m257.38 199.55a6.57 6.57 0 1 1-6.57 6.57 6.57 6.57 0 0 1 6.57-6.57z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//       data-name="button"
//     />
//     <path
//       d="m257.38 284.09a6.57 6.57 0 1 1-6.57 6.57 6.57 6.57 0 0 1 6.57-6.57z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//       data-name="button"
//     />
//     <path
//       d="m257.38 368.63a6.57 6.57 0 1 1-6.57 6.57 6.57 6.57 0 0 1 6.57-6.57z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//       data-name="button"
//     />
//     <path
//       d="m257.38 430.17a6.57 6.57 0 1 1-6.57 6.57 6.57 6.57 0 0 1 6.57-6.57z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//       data-name="button"
//     />
//     <path
//       d="m257.38 470.09a6.57 6.57 0 1 1-6.57 6.57 6.57 6.57 0 0 1 6.57-6.57z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//       data-name="button"
//     />
//     <path
//       d="m257.38 498.8a6.57 6.57 0 1 1-6.57 6.56 6.57 6.57 0 0 1 6.57-6.56z"
//       fill={color}
//       fillRule="evenodd"
//       strokeWidth="1"
//       data-name="button"
//     />
//   </g>
// );

const Buttons = ({ collar, colors, color, colorPicker, laddiesJacket }) => (
  <g
    id="Layer_2"
    data-name="Layer 2"
    stroke={colors.body == "#000000" ? "#ffffff" : "#231f20"}
    strokeMiterlimit="2.6131"
    className="cjd-color-hover"
    onClick={() => colorPicker("buttons")}
    transform="translate(245, 105)"
  >
    <g id="Layer_1-2" data-name="Layer 1">
      <line
        x1="1.19"
        x2="0.5"
        y1={collar === "Band" ? "-10" : "0"}
        y2={laddiesJacket ? "338.73" : "422.73"}
        fill="none"
        strokeWidth="1px"
        data-name="button split"
      />
      <path
        fill={color}
        d="M12.66,9.69a6.57,6.57,0,1,1-6.59,6.56h0A6.57,6.57,0,0,1,12.66,9.69Z"
      />
      <path
        fill={color}
        d={
          laddiesJacket
            ? "M12.52,64.23a6.57,6.57,0,1,1-6.58,6.56,6.58,6.58,0,0,1,6.58-6.56Z"
            : "M12.52,94.23a6.57,6.57,0,1,1-6.58,6.56,6.58,6.58,0,0,1,6.58-6.56Z"
        }
      />
      <path
        fill={color}
        d={
          laddiesJacket
            ? "M12.38,138.78a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
            : "M12.38,178.78a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
        }
      />
      <path
        fill={color}
        d={
          laddiesJacket
            ? "M12.24,223.32a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
            : "M12.24,263.32a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
        }
      />
      <path
        fill={color}
        d={
          laddiesJacket
            ? ""
            : "M12.09,344.86a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
        }
      />
      <path
        fill={color}
        d={
          laddiesJacket
            ? "M12.05,280.78a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
            : "M12.05,374.78a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
        }
      />
      <path
        fill={color}
        d={
          laddiesJacket
            ? "M12.05,315.78a6.57,6.57,0,1,1-6.58,6.56,6.57,6.57,0,0,1,6.58-6.56Z"
            : "M12,404.49a6.57,6.57,0,1,1-6.58,6.56h0A6.56,6.56,0,0,1,12,404.49Z"
        }
      />
    </g>
  </g>
);

export default Buttons;
