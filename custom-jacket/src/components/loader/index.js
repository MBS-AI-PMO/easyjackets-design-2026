import React from 'react'

const Loader = ({ msg }) => {
  return (
    <div className="cjd-loader">
      <div className="cjd-loader-inner">
        <div className="cjd-spinner">
          <svg viewBox="0 0 50 50">
            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
          </svg>
        </div>
        <div className="cjd-loading-msg">{msg}</div>
      </div>
    </div>
  )
}

export default Loader