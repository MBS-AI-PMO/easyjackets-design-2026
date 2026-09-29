import React from 'react';

const AdvanceIcon = ({ fill }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"  xlink="http://www.w3.org/1999/xlink" style={{ fill: "var(--svg-fill-color)", }} height="25px" width="25px" version="1.1" id="Icons" viewBox="0 0 32 32"  space="preserve">
             <defs>
                <style>

                    {`
        :root {
            --svg-fill-color: none;
            --svg-stroke-color: none;
          }
        .cls-1 {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }`}
                </style>
            </defs>
            <path d="M23,8H9c-4.4,0-8,3.6-8,8s3.6,8,8,8h14c4.4,0,8-3.6,8-8S27.4,8,23,8z M9,21c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5  S11.8,21,9,21z" />
        </svg>
    );
};

export default AdvanceIcon;
