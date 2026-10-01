import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import { MODAL_ANIM_MS } from '../../config/modalAnimation';

import TeamArt from './teamArt';

// "+" in the navbar: explains team (identical) jackets before adding one. Styled in
// css/builder-dialogs.scss (the storefront look).
const NewGuide = ({ modal, closeGuideModal, proceedAfterGuide }) => {
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
        <div>
          <div className="cjd-dialog-eyebrow">Team order</div>
          <h4>
            Create team <span>identical</span> jackets
          </h4>
        </div>
        <button type="button" className="cjd-modal-close" aria-label="Close" onClick={closeGuideModal}>
          ×
        </button>
      </header>

      <div className={`cjd-modal-content guides ${isMobile ? 'cjd-modal-content mobile' : ''}`}>
        <p className="cjd-dialog-text">
          The new jacket starts as a copy of this one. Change the name and number on each, so every
          teammate gets the same design with their own details.
        </p>
        <div className="cjd-dialog-figure">
          <TeamArt />
        </div>
      </div>

      <div className="cjd-modal-footer">
        <button type="button" className="cjd-dialog-btn cjd-dialog-btn--line" onClick={closeGuideModal}>
          Cancel
        </button>
        <button type="button" className="cjd-dialog-btn cjd-dialog-btn--ink" onClick={proceedAfterGuide}>
          Proceed
        </button>
      </div>
    </Modal>
  );
};

export default NewGuide;
