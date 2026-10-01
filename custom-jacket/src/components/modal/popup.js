import React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';

import { MODAL_ANIM_MS } from '../../config/modalAnimation';
import { getGuideRatio } from '../../config/designAreaConfig';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Letters from './letters';
import Name from './name';
import Upload from './upload';
import Symbol from './symbol';
import { modalState, changePose, saveName, deleteDesign } from '../../store/actions';
import CjdAlert from '../alert';

const nameTab = [
  'Front Center',
  'Back Top',
  'Back Bottom',
  'Left Chest',
  'Right Chest',
  'Left Sleeve',
  'Right Sleeve',
  'Right Mid Sleeve Upper',
  'Left Mid Sleeve Upper',
  'Right Mid Sleeve Lower',
  'Left Mid Sleeve Lower',
  'Right Sleeve End',
  'Left Sleeve End',
  'Back Middle',
];
const nameOnly = ['Front Center', 'Back Top', 'Back Bottom'];
const verticalChest = ['Right Chest Verticle', 'Left Chest Verticle'];

// The section a tab position stands for in a place's dialog: the tabs differ per place (pockets
// start at Letters, Back Middle has no Letters, the vertical chest places only Uploads).
const tabForIndex = (title, idx) => {
  if (verticalChest.includes(title)) return 'upload';
  const noName = title === 'Left Pocket' || title === 'Right Pocket';
  const noLetters = noName || title === 'Back Middle';
  const order = noName ? ['letters', 'symbol', 'upload'] : noLetters ? ['name', 'symbol', 'upload'] : ['name', 'letters', 'symbol', 'upload'];
  return order[idx] || order[0];
};

const PopUp = ({ popup, designs, modalState, saveName, deleteDesign, changePose, styles }) => {

  const { open, title, index } = popup;
  // what Save says when there is nothing to save yet, in the builder's own notice (was the browser's alert)
  const [notice, setNotice] = React.useState(null);

  const setActiveTab = (idx) => {
    modalState('tab', tabForIndex(title, idx));
    modalState('index', idx);
  };

  // a place without a design opens on its first tab (the tab shown could be left over from the
  // dialog opened before)
  const afterOpenModal = () => {
    if (!designs[title]?.done) {
      modalState('index', 0);
      modalState('tab', tabForIndex(title, 0));
    }
  };

  const removeDesign = (id, e) => {
    e.stopPropagation();
    deleteDesign(id);
    modalState('open', false);
  };

  // Saves what is set in the tab on screen and shows it on the jacket.
  const saveDesign = () => {
    const part = title;
    const tabActive = tabForIndex(title, index);
    const curPart = designs[title]?.[tabActive];
    let data;

    // nothing set in this tab yet
    if (typeof curPart === 'undefined') {
      setNotice({ title: 'Pimp up your jacket', message: 'Add a name, letters, a symbol or an upload before saving.' });
      return false;
    }

    switch (tabActive) {
      case 'name':
        if (curPart.title === undefined || curPart?.title === '') {
          setNotice({ title: 'Type a name', message: 'Type the name you want on the jacket, then save.' });
          return false;
        }

        data = {
          title: curPart.title,
          appearance: curPart.appearance,
          size: curPart.size,
          font: designs.font,
          fill: designs.fill,
          stroke: designs.stroke,
        };
        break;

      case 'letters':
        if (
          curPart.type === 'Type Your Own' &&
          (curPart.title === undefined || curPart?.title === '')
        ) {
          setNotice({ title: 'Type a letter', message: 'Type the letters you want on the jacket, then save.' });
          return false;
        } else if (
          curPart.type === 'Ready To Use' &&
          (curPart.path === undefined || curPart?.path === '')
        ) {
          setNotice({ title: 'Pick a letter', message: 'Pick one of the ready-to-use letters, then save.' });
          return false;
        }

        data = {
          title: curPart.title,
          path: curPart.path,
          type:
            curPart.type ||
            (part === 'Right Sleeve End' ||
              part === 'Left Sleeve End' ||
              part === 'Right Mid Sleeve Upper' ||
              part === 'Left Mid Sleeve Upper' ||
              part === 'Right Chest Verticle' ||
              part === 'Left Chest Verticle'
              ? 'Type Your Own'
              : 'Ready To Use'),
          appearance: curPart?.appearance || 'Straight',
          treatment: curPart?.treatment || false,
          size: curPart.size,
          font: designs.font,
          fill: designs.fill,
          stroke: designs.stroke,
          border: designs.border,
        };
        break;

      case 'editables':
        if (curPart.path === undefined || curPart?.path === '') {
          setNotice({ title: 'Pick a badge', message: 'Pick a badge, then save.' });
          return false;
        }

        data = {
          path: curPart.path,
          txt1: curPart?.txt1 || '',
          txt2: curPart?.txt2 || '',
          fill: designs.fill,
          stroke: designs.stroke,
          border: designs.border,
        };
        break;

      case 'symbol':
        data = {
          flag: curPart.flag,
          type: curPart.type,
          path: curPart.path,
          fill: designs.fill,
          stroke: designs.stroke,
          border: designs.border,
        };
        break;

      case 'upload':
        data = {
          file: curPart.file,
          image: curPart.image,
        };
        break;

      default:
        break;
    }

    if (['Right Sleeve', 'Right Sleeve End', 'Right Mid Sleeve Upper', 'Right Mid Sleeve Lower'].includes(part)) {
      changePose('right');
    } else if (['Left Sleeve', 'Left Sleeve End', 'Left Mid Sleeve Upper', 'Left Mid Sleeve Lower'].includes(part)) {
      changePose('left');
    } else if (['Back Top', 'Back Middle', 'Back Bottom'].includes(part)) {
      changePose('back');
    } else {
      changePose('front');
    }

    saveName(part, tabActive, data);
    modalState('open', false);
  };

  return (
    <>
    <Modal
      isOpen={open}
      onAfterOpen={afterOpenModal}
      className={{
        base: "cjd-modal cjd-modal-design",
        afterOpen: "cjd-modal--after-open",
        beforeClose: "cjd-modal--before-close",
      }}
      overlayClassName={{
        base: "cjd-modal-overlay",
        afterOpen: "cjd-modal-overlay--after-open",
        beforeClose: "cjd-modal-overlay--before-close",
      }}
      closeTimeoutMS={MODAL_ANIM_MS}
      // the preview takes the shape of this place's guide on the jacket (css/builder-design-modal.scss)
      style={{ content: { '--cjd-guide-ratio': getGuideRatio(title) } }}
      contentLabel={title}
      onRequestClose={() => modalState('open', false)}
      ariaHideApp={false}
    >
      <header className='cjd-modal-header'>
        <div>
          <div className='cjd-dialog-eyebrow'>Add design</div>
          <h4>{styles.collar === 'Zipper Hood' && title === 'Back Top' ? 'Overhood' : title}</h4>
        </div>
        <button type='button' className='cjd-modal-close' aria-label='Close' onClick={() => modalState('open', false)}>
          ×
        </button>
      </header>

      <Tabs
        className='cjd-modal-content'
        selectedIndex={index}
        onSelect={(tabIndex) => setActiveTab(tabIndex)}
      >
        <TabList className='cjd-modal-tabs'>
          {(nameTab.includes(title) || nameOnly.includes(title)) && (
            <Tab selectedClassName='cjd-active' className='cjd-tab-option cjd-name'>
              Name
            </Tab>
          )}

          {!nameOnly.includes(title) &&
            title !== 'Back Middle' &&
            title !== 'Right Chest Verticle' &&
            title !== 'Left Chest Verticle' && (
              <Tab selectedClassName='cjd-active' className='cjd-tab-option cjd-letters'>
                Letters
              </Tab>
            )}

          {/* {!nameOnly.includes(title) && title === 'Back Middle' && (
            <Tab selectedClassName='cjd-active' className='cjd-tab-option cjd-letters'>
              Editables
            </Tab>
          )} */}

          {!nameOnly.includes(title) &&
            title !== 'Right Chest Verticle' &&
            title !== 'Left Chest Verticle' && (
              <Tab selectedClassName='cjd-active' className='cjd-tab-option cjd-symbol'>
                Symbol
              </Tab>
            )}

          {!nameOnly.includes(title) && (
            <Tab selectedClassName='cjd-active' className='cjd-tab-option cjd-symbol'>
              Uploads
            </Tab>
          )}
        </TabList>

        <div className='cjd-modal-tab-content'>
          {(nameTab.includes(title) || nameOnly.includes(title)) && (
            <TabPanel>
              <Name part={title} />
            </TabPanel>
          )}

          {!nameOnly.includes(title) &&
            title !== 'Back Middle' &&
            title !== 'Right Chest Verticle' &&
            title !== 'Left Chest Verticle' && (
              <TabPanel>
                <Letters part={title} />
              </TabPanel>
            )}

          {/* {!nameOnly.includes(title) && title === 'Back Middle' && (
            <TabPanel>
              <Editables part={title} />
            </TabPanel>
          )} */}

          {!nameOnly.includes(title) &&
            title !== 'Right Chest Verticle' &&
            title !== 'Left Chest Verticle' && (
              <TabPanel>
                <Symbol part={title} />
              </TabPanel>
            )}

          {!nameOnly.includes(title) && (
            <TabPanel>
              <Upload part={title} />
            </TabPanel>
          )}
        </div>
      </Tabs>

      <div className='cjd-modal-footer'>
        <button type='button' className='cjd-dialog-btn cjd-dialog-btn--line' onClick={(e) => removeDesign(title, e)}>
          Remove
        </button>
        <button type='button' className='cjd-dialog-btn cjd-dialog-btn--ink' onClick={saveDesign}>
          Save
        </button>
      </div>
    </Modal>
    <CjdAlert
      open={Boolean(notice)}
      tone="info"
      title={notice?.title}
      message={notice?.message}
      onClose={() => setNotice(null)}
    />
    </>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  designs: state.designs,
  styles: state.styles,
  materials: state.materials,
  colors: state.colors,
  popup: state.popup,
});

const mapDispatchToProps = (dispatch) => ({
  saveName: (part, section, obj) => dispatch(saveName(part, section, obj)),
  deleteDesign: (sec) => dispatch(deleteDesign(sec)),
  modalState: (key, val) => dispatch(modalState(key, val)),
  changePose: (val) => dispatch(changePose(val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PopUp);
