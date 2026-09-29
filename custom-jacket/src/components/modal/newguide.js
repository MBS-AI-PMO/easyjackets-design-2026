import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import { MODAL_ANIM_MS } from '../../config/modalAnimation';

import identical from '../../assets/images/identical.webp';

const NewGuide = ({ modal, closeGuideModal, proceedAfterGuide }) => {
  const [cookie, setCookie] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Modal
      isOpen={modal}
      className={{
        base: `cjd-modal cjd-modal-guide ${isMobile ? 'cjd-modal-guide-mobile' : ''}`,
        afterOpen: "cjd-modal--after-open",
        beforeClose: "cjd-modal--before-close",
      }}
      overlayClassName={{
        base: "cjd-modal-overlay",
        afterOpen: "cjd-modal-overlay--after-open",
        beforeClose: "cjd-modal-overlay--before-close",
      }}
      closeTimeoutMS={MODAL_ANIM_MS}
      contentLabel={'Create Team (Identical) Jackets'}
      onRequestClose={closeGuideModal}
      ariaHideApp={false}
    >
      <header className="cjd-modal-header">
        <h4>
          Create Team (<span style={{ color: 'Tomato' }}>Identical</span>)
          Jackets
        </h4>
        <div className="cjd-modal-close" onClick={closeGuideModal}>
          {' '}
          ×{' '}
        </div>
      </header>

      <div className={`cjd-modal-content guides ${isMobile ? 'cjd-modal-content mobile':''}`}>   
        <img src={identical} alt="identical" width={`${isMobile ? '300':'400'}`} />
        <label htmlFor="dontshow" className="once-cookie">
          <input
            type="checkbox"
            name="dontshow"
            id="dontshow"
            onChange={(e) => setCookie(e.target.checked)}
          />
          Don't show this again
        </label>
      </div>

      <div className="cjd-modal-footer">
        <div className={`cjd-btn cjd-btn-secondary ${isMobile ? 'cjd-btn-modal':''}`} onClick={closeGuideModal}>
          Cancel
        </div>
        <div
          className= {`cjd-btn cjd-btn-primary cjd-btn-textcenter ${isMobile ? 'cjd-btn-modal':''}`}
          onClick={() => proceedAfterGuide(cookie)}
        >
          Proceed
        </div>
      </div>
    </Modal>
  );
};

export default NewGuide;
