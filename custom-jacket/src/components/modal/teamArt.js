import React from 'react';

// The team (identical) jackets illustration in the guide dialog: our varsity jacket seen from the
// back (the same drawing as the builder's back view, components/Jacket/back.js, default style:
// set-in sleeves, simple collar), coloured, twice: the same design with a different name and
// number. Styled and animated in css/builder-dialogs.scss (.cjd-team-art): the copy slides out
// from behind the first jacket and the "same design" badge pops in when the dialog opens.

const WOOL = '#1d1a17';
const KNIT = '#14110f';
const LEATHER = '#efe6d6';
const GOLD = '#c9a227';
const CREAM = '#f4efe6';
const LINE = 'rgba(20, 17, 15, .55)';

// one jacket, in the builder's own coordinates (viewBox 0 0 514.73 545.96)
const Jacket = () => (
  <>
    {/* waistband and its two stripes */}
    <path d="M257.13,528.65c-69.54-2.79-125.94-8.94-137.34-26.63.13-16,.24-30.9.37-46.9,66.26,27.65,223.29,27.86,273.93,0,.13,16,.24,30.9.37,46.9-11.4,17.69-67.8,23.84-137.33,26.63Z" fill={KNIT} stroke={LINE} />
    <path transform="translate(-426, 107.9)" fill={GOLD} fillRule="evenodd" d="M546.23,359.37l-.07,8.95c9.16,6.22,22.38,10.86,38.84,14.25a376.23,376.23,0,0,0,47.55,6.14,670.32,670.32,0,0,0,101.1,0,377.75,377.75,0,0,0,47.93-6.16c16.45-3.39,29.68-8,38.84-14.25l-.07-8.95-2,1.73c-8.31,6.36-21.38,11.09-38.18,14.55a372.13,372.13,0,0,1-46.9,6,662.4,662.4,0,0,1-100.5,0,370.65,370.65,0,0,1-46.36-6c-16.8-3.46-29.88-8.19-38.18-14.55l-2-1.73Zm86.31,36.46a369.45,369.45,0,0,1-46.13-6c-16.8-3.47-29.88-8.2-38.18-14.55l-2.11-1.83-.07,9c9.16,6.26,22.43,10.92,39,14.33a376.35,376.35,0,0,0,47.41,6.12,667.93,667.93,0,0,0,101.61,0,378.62,378.62,0,0,0,47.56-6.13c16.52-3.41,29.79-8.07,38.95-14.33l-.07-9-2.11,1.83c-8.31,6.35-21.38,11.08-38.18,14.55a371.24,371.24,0,0,1-46.52,6,664,664,0,0,1-101.11,0Z" />

    {/* body (wool) */}
    <path transform="translate(70, 70)" fill={WOOL} stroke={LINE} d="M325.36,252.47c-1.9-12-3.51-22.63-5.09-34.14,11.31-49.51,28.09-101.86,52.09-157.58-5.59-13.39-18-22.81-35.59-30.53-3.92-1.7-7.78-3.21-11.92-4.77-13.86-5.24-23.08-7.37-37.29-10.81-10.69-2.59-20.6-5.35-32.69-8.35-18.44-7.42-117.44-4.42-136.25,0-12.09,3-22,5.76-32.69,8.35C71.72,18.08,62.5,20.21,48.64,25.47c-4.14,1.56-8,3.07-11.92,4.77C19.13,38,6.72,47.38,1.13,60.77c24,55.7,40.82,108,52.15,157.6-1.58,11.51-3.19,22.1-5.09,34.1-2.33,14.73-2.57,10.39,2.27,24-.27,24.16-12.3,51.89-12.43,78.08C38,364.94,44,377.06,49.8,385.77c1.67,11.35,47.14,17.89,100.57,19.78,26.5,1.6,51.2,2.72,72.52.56,52.36-2.16,97.22-9.53,100.84-20.35,5.82-8.71,11.82-20.83,11.77-31.22-.14-26.19-12.14-53.92-12.43-78.07C327.91,262.9,327.67,267.24,325.36,252.47Z" />

    {/* sleeves (leather) */}
    <path fill={LEATHER} stroke={LINE} d="M123.64,287.73c-11.33-49.55-28.13-101.91-52.15-157.62C45.61,187.07,26.32,250,4.71,307.93c-5.82,15.62-.69,19.85-2.43,34.59a279.7,279.7,0,0,0-1.13,55.94c.78,9.43,4.34,20.08,6.13,29.13a290,290,0,0,1,4.91,37.63c.1,2.07,4.48,2.18,5,4.07.77,2.55-3,7-1.95,9.49,5.34,12,14.53,15,20.13,23.62l63.75-10.88c-.63-11.2,2.21-24.93,1.23-35.67-.61-6.66-5.27-12.32-5.86-24.37-.07-1.23-.13-2.45-.18-3.68-.69-14.67.15-29.7-.4-44.55-.12-3.31-3.25-5.67-3.51-9-.23-2.85,3.62-5.67,3.71-8.62.08-2.43-4.32-4.12-4.29-6.63,0-3.22,5.1-1.77,5.4-3.76.41-2.75-4.53-4.15-4.66-6.58,1-1.78,4.63-1.88,5.44-3.78,7.16-16.84,21.4-40.63,27.59-57.19Z" />
    <path fill={LEATHER} stroke={LINE} d="M390.61,287.73c11.33-49.55,28.13-101.91,52.15-157.62,25.88,57,45.17,119.91,66.78,177.82,5.82,15.62.69,19.85,2.43,34.59a279.7,279.7,0,0,1,1.13,55.94c-.78,9.43-4.34,20.08-6.13,29.13a290,290,0,0,0-4.91,37.63c-.11,2.07-4.48,2.18-5.05,4.07-.78,2.55,3,7,1.94,9.49-5.33,12-14.52,15-20.12,23.62l-63.75-10.88c.63-11.2-2.21-24.93-1.23-35.67.61-6.66,5.27-12.32,5.86-24.37.07-1.23.13-2.45.18-3.68.69-14.67-.16-29.7.4-44.55.12-3.31,3.25-5.67,3.51-9,.23-2.85-3.62-5.67-3.71-8.62-.08-2.43,4.32-4.12,4.29-6.63-.05-3.22-5.1-1.77-5.4-3.76-.41-2.75,4.53-4.15,4.66-6.58-1.05-1.78-4.63-1.88-5.44-3.78-7.16-16.84-21.4-40.63-27.59-57.19Z" />

    {/* cuffs and their stripes */}
    <path fill={KNIT} stroke={LINE} fillRule="evenodd" d="m415.08 491.52c25.36-2.43 46.31 1.65 63.75 10.88l-13.46 43.11c-24.3 1.14-43.53-2.8-58.26-11.24l8-42.75z" />
    <path fill={GOLD} d="M471.91,524.57l-2.18,7-.7-.46a83,83,0,0,0-26.81-9.93,135.46,135.46,0,0,0-31.49-2l-.81.07,1.34-7.16a141.3,141.3,0,0,1,32.29,2.15,90.51,90.51,0,0,1,28.36,10.37Z" />
    <path fill={GOLD} d="M475.24,513.9l-2.18,7-.76-.49A81.71,81.71,0,0,0,445,509.89a134,134,0,0,0-32.19-2.14l-.82.13,1.35-7.22a139.36,139.36,0,0,1,33,2.31,89.19,89.19,0,0,1,28.82,10.93Z" />
    <path fill={KNIT} stroke={LINE} fillRule="evenodd" d="m99.69 491.52c-25.36-2.43-46.3 1.65-63.75 10.88l13.47 43.11c24.3 1.14 43.53-2.8 58.25-11.24l-8-42.75z" />
    <path fill={GOLD} d="M42.87,524.57l2.17,7,.71-.46a83.06,83.06,0,0,1,26.8-9.93,135.55,135.55,0,0,1,31.5-2l.81.07-1.34-7.16a141.39,141.39,0,0,0-32.3,2.15,90.45,90.45,0,0,0-28.35,10.37Z" />
    <path fill={GOLD} d="M39.53,513.9l2.18,7,.76-.49a81.77,81.77,0,0,1,27.27-10.49,133.9,133.9,0,0,1,32.18-2.14l.82.13-1.34-7.22A139.44,139.44,0,0,0,68.35,503,89.28,89.28,0,0,0,39.53,513.9Z" />

    {/* collar and its stripes (kept inside the collar) */}
    <path fill={KNIT} stroke={LINE} fillRule="evenodd" d="M325.5,75.5q-4.59-17.28-9.17-34.56c-13-8.77-33.62-12.25-59-12.36-25.36.11-45.94,3.59-59,12.36q-4.59,17.28-9.17,34.56Z" />
    <g clipPath="url(#cjd-team-collar)">
      <path transform="translate(188.8, 28) translate(-614.82 -124.83)" fill={GOLD} fillRule="evenodd" d="M747.23,157.15q-6.6-.65-13.58-1.16a669,669,0,0,0-101.1,0q-6.78.49-13.21,1.13c-.08,0-2,7.31-1.93,7.3q7.43-.78,15.37-1.36a662.27,662.27,0,0,1,100.49,0q8.22.6,15.9,1.4C749.26,164.46,747.32,157.16,747.23,157.15Zm-3.87-14.57c-3.05-.28-6.17-.54-9.34-.77a669.22,669.22,0,0,0-101.61,0q-4.68.35-9.2.76c-.09,0-2,7.28-1.93,7.28q5.49-.54,11.26-1a661.38,661.38,0,0,1,101.11,0c4,.29,7.86.62,11.64,1C745.38,149.86,743.45,142.58,743.36,142.58Z" />
    </g>
  </>
);

// name arched across the shoulders (the builder's Back Top) over a chenille number (Back Middle),
// and the team name arched the other way across the lower back (Back Bottom): the same on every
// jacket of the team
const Lettering = ({ name, number }) => (
  <>
    <text className="cjd-team-name" fill={GOLD}>
      <textPath href="#cjd-team-arc" startOffset="50%" textAnchor="middle">{name}</textPath>
    </text>
    <text className="cjd-team-number" x="257" y="338" textAnchor="middle" fill={CREAM} stroke={GOLD}>{number}</text>
    <text className="cjd-team-team" fill={GOLD} stroke={CREAM}>
      <textPath href="#cjd-team-smile" startOffset="50%" textAnchor="middle">TIGERS</textPath>
    </text>
  </>
);

const Caption = ({ x, title, detail }) => (
  <>
    <text className="cjd-team-caption" x={x} y="652" textAnchor="middle">{title}</text>
    <text className="cjd-team-detail" x={x} y="696" textAnchor="middle">{detail}</text>
  </>
);

const TeamArt = () => (
  <svg className="cjd-team-art" viewBox="0 0 1240 712" role="img" aria-label="Two identical Tigers team jackets: the same design, one with James 12 on the back and one with Maya 07">
    <defs>
      <clipPath id="cjd-team-collar">
        <path d="M325.5,75.5q-4.59-17.28-9.17-34.56c-13-8.77-33.62-12.25-59-12.36-25.36.11-45.94,3.59-59,12.36q-4.59,17.28-9.17,34.56Z" />
      </clipPath>
      <path id="cjd-team-arc" d="M150,168 Q257,118 364,168" fill="none" />
      <path id="cjd-team-smile" d="M150,384 Q257,462 364,384" fill="none" />
    </defs>

    {/* the copy first, so it slides out from behind the original */}
    <g className="cjd-team-copy">
      <ellipse cx="942" cy="578" rx="200" ry="14" fill={KNIT} opacity=".08" />
      <g transform="translate(685 20)">
        <Jacket />
        <Lettering name="MAYA" number="07" />
      </g>
      <Caption x={942} title="Jacket #2" detail="Maya · 07" />
    </g>

    <g>
      <ellipse cx="297" cy="578" rx="200" ry="14" fill={KNIT} opacity=".08" />
      <g transform="translate(40 20)">
        <Jacket />
        <Lettering name="JAMES" number="12" />
      </g>
      <Caption x={297} title="Jacket #1" detail="James · 12" />
    </g>

    {/* "same design" badge between them */}
    <g className="cjd-team-badge" transform="translate(620 290)">
      <circle r="52" fill={GOLD} />
      <rect x="-20" y="-12" width="28" height="32" rx="3" fill="none" stroke={KNIT} strokeWidth="4.5" />
      <rect x="-8" y="-22" width="28" height="32" rx="3" fill={GOLD} stroke={KNIT} strokeWidth="4.5" />
      <text className="cjd-team-badge-text" textAnchor="middle">
        <tspan x="0" y="90">SAME</tspan>
        <tspan x="0" y="118">DESIGN</tspan>
      </text>
    </g>
  </svg>
);

export default TeamArt;
