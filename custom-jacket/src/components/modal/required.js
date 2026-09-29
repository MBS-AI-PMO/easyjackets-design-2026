import React from 'react';
import Modal from 'react-modal';

import { MODAL_ANIM_MS } from '../../config/modalAnimation';
import { getRequiredColorKeys } from '../../utils/requiredOptions';

const Required = ({ modal, colors, sizes, setRequiremodal, jacket, styles, advance }) => {
  const requiredColors = getRequiredColorKeys({ styles, advance, jacket });

  return (
    <Modal
      isOpen={modal}
      className={{
        base: "cjd-modal cjd-modal-notifs",
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
      ariaHideApp={false}
    >
      <header className='cjd-modal-header'>
        <h4>Please select all required items</h4>
        <div className='cjd-modal-close' onClick={() => setRequiremodal(false)}>
          ×
        </div>
      </header>

      <div className='cjd-modal-content guides'>
        <ol>
          {sizes.size === '' && <li>Please select size</li>}
          {requiredColors.map((c, i) => {
            if (colors[c] === '') {
              let txt;
              if ( 'inside' === c || 'outside' === c ) {
                txt = (styles.collar === 'Roll Up' ? 'Collar ' : 'Hood ') + c;
              } else {
                txt = c;
              }
              return (
                <li key={i}>
                  Please select <strong>{txt}</strong> color
                </li>
              );
            }
          })}
        </ol>
      </div>

      <div className='cjd-modal-footer'>
        <div className='cjd-btn cjd-btn-primary cjd-btn-ok' onClick={() => setRequiremodal(false)}>
          OK
        </div>
      </div>
    </Modal>
  );
};

export default Required;
