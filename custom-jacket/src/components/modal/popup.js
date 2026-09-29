import React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';

import { MODAL_ANIM_MS } from '../../config/modalAnimation';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Letters from './letters';
import Name from './name';
import Upload from './upload';
import Symbol from './symbol';
import { modalState, changePose, saveName, deleteDesign } from '../../store/actions';

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

const PopUp = ({ popup, designs, modalState, saveName, deleteDesign, changePose, styles }) => {

  const { open, title, tab, index } = popup;

  const setActiveTab = (idx) => {
    let activeTab = 'name';

    if (idx === 1) activeTab = 'letters';
    else if (idx === 2) activeTab = 'symbol';
    else if (idx === 3) activeTab = 'upload';

    if (idx === 0 && (title === 'Left Pocket' || title === 'Right Pocket')) activeTab = 'letters';

    if (
      idx === 1 &&
      (title === 'Left Pocket' || title === 'Right Pocket' || title === 'Back Middle')
    )
      activeTab = 'symbol';

    if (
      idx === 2 &&
      (title === 'Left Pocket' || title === 'Right Pocket' || title === 'Back Middle')
    )
      activeTab = 'upload';

    modalState('tab', activeTab);
    modalState('index', idx);
  };

  const afterOpenModal = () => {
    let currentTab;

    if (!designs[title]?.done) {
      if (nameTab.includes(title) || nameOnly.includes(title)) {
        currentTab = 'name';
      } else if (
        !nameOnly.includes(title) &&
        title !== 'Back Middle' &&
        title !== 'Right Chest Verticle' &&
        title !== 'Left Chest Verticle'
      ) {
        currentTab = 'letters';
      } else if (
        !nameOnly.includes(title) &&
        title !== 'Back Middle' &&
        title !== 'Right Chest Verticle' &&
        title !== 'Left Chest Verticle'
      ) {
        currentTab = 'symbol';
      } else if (
        !nameOnly.includes(title) &&
        (title === 'Right Chest Verticle' || title === 'Left Chest Verticle')
      ) {
        currentTab = 'upload';
      }
      modalState('tab', currentTab);
    }
  };

  const removeDesign = (id, e) => {
    e.stopPropagation();
    deleteDesign(id);
    modalState('open', false);
  };

  const saveDesign = (tabActive) => {
    const part = title;
    const curPart = designs[title][tabActive];
    let data;

    if (typeof curPart === 'undefined') {
      alert('Pimp up your Jacket before saving!');
      return false;
    }

    switch (tabActive) {
      case 'name':
        if (curPart.title === undefined || curPart?.title === '')
          alert('Please enter your desired name');

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
          alert('Please enter your desired letter');
          return false;
        } else if (
          curPart.type === 'Ready To Use' &&
          (curPart.path === undefined || curPart?.path === '')
        ) {
          alert('Please select your patch');
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
          alert('Please Select Editable badge');
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
      contentLabel={title}
      onRequestClose={() => modalState('open', false)}
      ariaHideApp={false}
    >
      <header className='cjd-modal-header'>
        <h4>{styles.collar === 'Zipper Hood' && title === 'Back Top' ? 'Overhood' : title}</h4>
        <div className='cjd-modal-close' onClick={() => modalState('open', false)}>
          ×
        </div>
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
        <div className='cjd-btn cjd-btn-secondary' onClick={(e) => removeDesign(title, e)}>
          Remove
        </div>
        <div className='cjd-btn cjd-btn-primary' onClick={() => saveDesign(tab)}>
          Save
        </div>
      </div>
    </Modal>
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
