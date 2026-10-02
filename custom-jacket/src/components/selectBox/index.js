import React from 'react'

//import './select-box.scss'
import '../../css/components/SelectBox/select-box.scss';

// A colour's name bubble is centred over its swatch, but near the left or right side of the colour
// panel that would cut it off: those swatches are marked so the bubble lines up with the swatch's
// outer edge instead (css/builder-design-modal.scss), whatever the number of columns.
const TIP_ROOM = 70; // px from the swatch centre to the panel side that a centred name needs
const alignTip = (e) => {
  const swatch = e.currentTarget;
  const panel = swatch.closest('.cjd-color-box') || swatch.parentElement;
  if (!panel) return;
  const s = swatch.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  const centre = s.left + s.width / 2;
  swatch.dataset.tipAlign = centre - p.left < TIP_ROOM ? 'start' : p.right - centre < TIP_ROOM ? 'end' : '';
};

const SelectBox = ({
  type,
  label,
  current,
  dispatch,
  src,
  className = '',
  tooltip = '',
  customLabel = '',
  material = false,
  colors = false,
  sizes = false,
  style = false
}) => {
  if (material) {
    return (
      <div
        className={`cjd-select-box ${current === label ? 'cjd-active-box' : 'cjd-not-active-box'} ${className} cjd-material-active-box`}
        onClick={() => dispatch(type, label)}
        data-label={label}
      />
    )
  } else if (colors) {
    return (
      <>
        <div
          style={{ backgroundColor: label }}
          className={`cjd-select-box cjd-colors-box ${current === label && 'cjd-active-box'} ${className}`}
          onClick={(e) => dispatch(type, label, e)}
          onMouseEnter={alignTip}
          data-label={label}
          data-tip={tooltip}
        />
      </>
    )
  } else if (sizes) {
    return (
      <div className={`cjd-select-box-size cjd-size-box ${current === label && 'cjd-active-box'}`} onClick={() => dispatch(type, label)}>
        <span className="cjd-span">{label}</span>
      </div>
    )
  } else if (style) {
    return (
      <div
        className={`cjd-select-box-style ${current === label ? 'cjd-active-box' : 'cjd-not-active-box'} ${className}`}
        onClick={() => dispatch(type, label)}
      >
        {src && (
          <div className="cjd-select-image">
            <img src={src} alt={label} />
          </div>
        )}
        <span className="cjd-select-label">{customLabel || label}</span>
      </div>
    )
  } else {
    return (
      <>
        <div
          className={`cjd-select-box ${current === label ? 'cjd-active-box' : 'cjd-not-active-box'} ${className}`}
          onClick={() => dispatch(type, label)}
        >
          {src && (
            <div className="cjd-select-image">
              <img src={src} alt={label} />
            </div>
          )}
          <span className="cjd-select-label">{customLabel || label}</span>
        </div>
      </>
    )
  }
}

export default SelectBox