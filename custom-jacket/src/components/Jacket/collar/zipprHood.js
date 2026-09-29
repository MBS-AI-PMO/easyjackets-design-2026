import React from 'react';

const ZipperHood = ({ outside, inside, zipper, flip, lining, colorPicker }) => {
  return (
    <>
      {flip ? (
        <>
          <g
            id="hood_zipper"
            data-name="hood zipper"
            style={{ transform: 'translate(94px, 37px)' }}
          >
            <path
              id="hood_z_back"
              data-name="hood z back"
              d="M308.07,71.71,293.33,44.8A442.64,442.64,0,0,1,233.8,24.62c-5.6-2.84-9.46-6.88-11.12-12.42-3.59-6.44-9.27-9.31-17.09-8.54H126.4c-7.82-.77-13.49,2.1-17.08,8.54-1.67,5.54-5.52,9.58-11.12,12.42A442.64,442.64,0,0,1,38.67,44.8L23.93,71.71c-25.25,70-23.86,84.21-17.08,87.22,29.73,5.71,61.3,9.18,97.3,7.24,22.8-6.39,40.12-18.14,53.57-33.64a17.55,17.55,0,0,0,.78-8.28c1-3,3.15-4.66,7.49-3.89,4.36-.77,6.53.89,7.51,3.89a17.55,17.55,0,0,0,.78,8.28c13.45,15.5,30.77,27.25,53.57,33.64,36,1.94,67.57-1.53,97.3-7.24C331.93,155.92,333.32,141.66,308.07,71.71Z"
              transform="translate(-2.36 -3.29)"
              fill={inside}
              stroke={inside == "#000000" ? "#ffffff" : "#000"}
              strokeMiterlimit="10"
              strokeWidth="1"
              className="cjd-color-hover"
              onClick={() => colorPicker('inside')}
            />

            <path
              d="M166,139a5.54,5.54,0,0,1-4.08-1.84,4.44,4.44,0,0,1-1.15-3.53l1-8.71a.74.74,0,0,1,.73-.65h7a.73.73,0,0,1,.73.65l1,8.71a4.48,4.48,0,0,1-1.16,3.53A5.54,5.54,0,0,1,166,139Zm-2.85-13.26-.93,8.06a3,3,0,0,0,.8,2.39,4,4,0,0,0,6,0,3,3,0,0,0,.8-2.39l-.93-8.06Z"
              transform="translate(-2.36 -3.29)"
              fill={zipper}
            />

            <path
              d="M166,136.22a3,3,0,0,1-2.25-1.05,2.27,2.27,0,0,1-.54-1.88l.25-1.55a.74.74,0,0,1,.73-.61h3.61a.74.74,0,0,1,.72.6l.27,1.56a2.33,2.33,0,0,1-.56,1.91A3,3,0,0,1,166,136.22Zm-1.19-3.63-.16.94a.86.86,0,0,0,.22.7,1.53,1.53,0,0,0,1.13.52,1.51,1.51,0,0,0,1.11-.51.89.89,0,0,0,.24-.72l-.17-.93Z"
              transform="translate(-2.36 -3.29)"
              fill={zipper}
            />
          </g>

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
              <tspan alignmentBaseline="middle">HOOD OUTSIDE</tspan>
            </text>

            <g
              className="cjd-color-hover"
              onClick={() => colorPicker('outside')}
              style={{ transform: 'translate(0, 25px)' }}
            >
              <path
                id="back"
                d="M83.08,130.5c-38.36-2.28-61-75.4-82-72.74C12.81,44.59,22.56,14.37,30.85,9.5,41.59,4.69,61.54,3.24,92.48,1.56c31,1.68,50.9,3.13,61.63,7.94,8.3,4.87,18,35.09,29.81,48.26-19-2.4-44.85,66.89-77.3,71.62-3.51.51-7.13.9-10.87,1.12Z"
                transform="translate(-0.86 -1.31)"
                fill={outside}
                stroke={outside == "#000000" ? "#ffffff" : "#404041"}
                strokeMiterlimit="2.61"
                strokeWidth="1"
                fillRule="evenodd"
              />
              <g>
                <path
                  d="M94.75,1.71a15.13,15.13,0,0,1-5.2,0h-.2V130.25l.2.1a5.54,5.54,0,0,0,1.9.39,2.44,2.44,0,0,0,.7-.1,4.81,4.81,0,0,0,2.7-.29l.2-.1V1.71Zm-.2,126.78a4.32,4.32,0,0,1-2.4.19h0a5.68,5.68,0,0,1-2.4-.19V2.2a13.45,13.45,0,0,0,4.9,0V128.49Z"
                  transform="translate(-0.86 -1.31)"
                  fill="#404041"
                  style={{ isolation: 'isolate' }}
                />
                <path
                  d="M92.15,11.81a2.26,2.26,0,0,1-2.3-2.3c0-.7.8-7.4.9-7.7v-.2h2.9v.2c0,.3.9,7,.9,7.7A2.48,2.48,0,0,1,92.15,11.81Zm-1-9.7c-.3,2.5-.8,6.9-.8,7.4a1.8,1.8,0,1,0,3.6,0c0-.5-.5-5-.8-7.4Zm1,8.8a1.5,1.5,0,1,1,1.5-1.5A1.54,1.54,0,0,1,92.15,10.91Zm0-2.5a1,1,0,1,0,1,1A1,1,0,0,0,92.15,8.41Z"
                  transform="translate(-0.86 -1.31)"
                  fill="#404041"
                />
              </g>
            </g>
          </g>
        </>
      ) : (
        <g
          id="hood_zipper"
          data-name="hood zipper"
          style={{ transform: 'translate(118px, 39px)' }}
        >
          <path
            d="M277.51,51.47a1.77,1.77,0,0,1-1.17,3.1H192.53A19,19,0,0,0,185.21,56c-7.64,3.14-15.23,6.64-24.05,9.52a21.31,21.31,0,0,1-6.58,1H124.39a21.31,21.31,0,0,1-6.58-1c-8.82-2.88-16.41-6.38-24-9.52a19,19,0,0,0-7.32-1.46H2.63a1.77,1.77,0,0,1-1.17-3.1C10,44,41.83,27.89,70.23,20.58a7,7,0,0,0,3.61-2.27C79.69,11.27,85.43,5,90.75,1.76a7.44,7.44,0,0,1,3.85-1h89.78a7.38,7.38,0,0,1,3.78,1c5.34,3.21,11.11,9.53,17,16.59a6.94,6.94,0,0,0,3.62,2.27C237.14,27.89,268.94,44,277.51,51.47Z"
            transform="translate(-0.6 -0.47)"
            fill={inside}
            stroke={inside == "#000000" ? "#ffffff" : "#404041"}
            strokeMiterlimit="10"
            strokeWidth="1"
            className="cjd-color-hover"
            onClick={() => colorPicker('inside')}
          />

          <path
            d="M84.6,10.57c36.68-9.48,73.37-10,110.07,0,6.22,10.14-49,49-49,49-3.91,3.8-8.17,3.31-12.66,0C133,59.58,75.53,18.22,84.6,10.57Z"
            transform="translate(-0.6 -0.47)"
            fill={inside}
            stroke={inside == "#000000" ? "#ffffff" : "#9ca1a4"}
            strokeMiterlimit="2.61"
            strokeWidth="1"
            fillRule="evenodd"
            className="cjd-color-hover"
            onClick={() => colorPicker('inside')}
          />

          <path
            d="M.31.28h69L41.66,21.72c-4.28,4.44-9.13,4.11-14.47-.31Z"
            fill={lining}
            style={{ transform: 'translate(104px, 36.5px)' }}
            className="cjd-color-hover"
            onClick={() => colorPicker('lining')}
          />
        </g>
      )}
    </>
  );
};

export default ZipperHood;
