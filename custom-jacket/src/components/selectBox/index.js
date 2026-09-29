import React from 'react'

//import './select-box.scss'
import '../../css/components/SelectBox/select-box.scss';

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