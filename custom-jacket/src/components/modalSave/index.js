import React from 'react';
import { connect, useStore } from 'react-redux';
import Modal from 'react-modal';

import { MODAL_ANIM_MS } from '../../config/modalAnimation';

import {
  modalState,
  saveDesign,
  updateGlobals,
  switchJacket,
} from '../../store/actions';

// eslint-disable-next-line
const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
); //eslint-disable-line

const SaveDesign = ({
  globals,
  jackets,
  updateGlobals,
  popup,
  modalState,
  switchJacket,
  saveDesign,
}) => {
  const { save, share } = popup;
  const store = useStore();

  const getSvg = (key) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        switchJacket(key);
        resolve(store.getState().jackets[key].front);
      }, 3000 * key);
    });
  };

  const dummy = async () => {
    let images = [];
    for (let index = 0; index < jackets.length; index++) {
      let svgResult = await getSvg(index);
      images.push(svgResult);
    }

    Promise.all(images).then(() => {
      saveDesign();
    });
  };

  const saveYourDesign = async () => {
    await dummy();
    // if (globals.email === '' || !validEmailRegex.test(globals.email)) {
    //   alert('Please Enter your valid email');
    // } else if (
    //   share &&
    //   (globals.recipient === '' || !validEmailRegex.test(globals.recipient))
    // ) {
    //   alert('Please Enter recipient valid email');
    // } else {
    //   saveDesign();
    // }
  };

  return (
    <Modal
      isOpen={save || share}
      onRequestClose={() => modalState(share ? 'share' : 'save', false)}
      className={{
        base: `cjd-modal ${share ? 'cjd-modal-share' : 'cjd-modal-save'}`,
        afterOpen: "cjd-modal--after-open",
        beforeClose: "cjd-modal--before-close",
      }}
      overlayClassName={{
        base: "cjd-modal-overlay",
        afterOpen: "cjd-modal-overlay--after-open",
        beforeClose: "cjd-modal-overlay--before-close",
      }}
      closeTimeoutMS={MODAL_ANIM_MS}
      contentLabel="Save Your Design"
      ariaHideApp={false}
    >
      <header className="cjd-modal-header">
        <h4>{share ? 'Share' : 'Save'} Your Design</h4>
        <div
          className="cjd-modal-close"
          onClick={() => modalState(share ? 'share' : 'save', false)}
        >
          {' '}
          ×{' '}
        </div>
      </header>

      <div className="cjd-modal-content">
        <div className="cjd-modal-form-wrapper">
          <div className="cjd-form-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="text"
              className="cjd-form-control"
              name="email"
              placeholder="Enter Your Email Address"
              value={globals.email}
              onChange={(e) => updateGlobals('email', e.target.value)}
            />
          </div>

          {share && (
            <>
              <div className="cjd-form-group">
                <label htmlFor="recipient">Recipient Email</label>
                <input
                  type="text"
                  className="cjd-form-control"
                  name="recipient"
                  placeholder="Enter Recipient Email Address"
                  value={globals.recipient}
                  onChange={(e) => updateGlobals('recipient', e.target.value)}
                />
              </div>

              <div className="cjd-form-group">
                <label htmlFor="email">Message (Optional)</label>
                <textarea
                  className="cjd-form-control"
                  name="message"
                  placeholder=""
                  value={globals.message}
                  onChange={(e) => updateGlobals('message', e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cjd-modal-footer">
        <div
          className="cjd-btn cjd-btn-secondary"
          onClick={() => modalState(share ? 'share' : 'save', false)}
        >
          Cancel
        </div>
        <div
          className="cjd-btn cjd-btn-primary"
          onClick={() => saveYourDesign()}
        >
          {share ? 'Share' : 'Save'} Design
        </div>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  jackets: state.jackets,
  popup: state.popup,
});

const mapDispatchToProps = (dispatch) => ({
  updateGlobals: (key, val) => dispatch(updateGlobals(key, val)),
  modalState: (key, val) => dispatch(modalState(key, val)),
  switchJacket: (key) => dispatch(switchJacket(key)),
  saveDesign: () => dispatch(saveDesign()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveDesign);
