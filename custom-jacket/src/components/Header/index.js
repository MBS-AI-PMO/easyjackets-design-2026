import React, { useState, useEffect, useCallback } from 'react';
import { connect, useStore } from 'react-redux';
import { svgAsPngUri } from 'save-svg-as-png';

import { updateDefaults } from '../../store/actions/defaults';
import { apiCall, getPrice, isLocalhost } from '../../utils';
import CartIcon from '../icons/cartIcon';
import PencilIcon from '../icons/pencilIcon';

import Back from '../../assets/images/icon-back.webp';
import { frontendUrl } from '../../config/url';
import { NavBurger, NavDrawer, NavLinks, NavLogo, useNavLogo } from '../SiteNav';
import Presence from '../presence';

import {
  saveSvg,
  modalState,
  firstJacket,
  currentJacket,
  duplicate,
  replaceMaterials,
  replaceStyles,
  replaceColors,
  replaceDesigns,
  replaceSizes,
  replaceAdvance,
  removeJacket,
  updatePreviousState,
  setActiveJacket,
  renameJacket,
  jacketSnapshot,
  updateGlobals,
  guideModalState,
} from '../../store/actions';

//import './styles.scss';
import '../../css/components/Header/styles.scss'
import NewGuide from '../modal/newguide';
import Required from '../modal/required';
import axiosInstance from '../../utils/axiosConfig';
import Loader from '../loader';
import CjdAlert from '../alert';
import { getRequiredColorKeys } from '../../utils/requiredOptions';

const Header = ({
  globals,
  jackets,
  firstJacket,
  currentJacket,
  duplicate,
  replaceMaterials,
  replaceStyles,
  replaceColors,
  replaceDesigns,
  replaceSizes,
  replaceAdvance,
  updatePreviousState,
  removeJacket,
  styles,
  materials,
  colors,
  designs,
  sizes,
  advance,
  setActiveJacket,
  renameJacket,
  saveSvg,
  jacketSnapshot,
  updateGlobals
}) => {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [msg, setMsg] = useState('Please wait while we prepare your order!');
  // The page is always light (the navbar's dark mode button is gone): drop a dark choice saved earlier.
  React.useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.removeItem('ej-theme'); } catch { }
  }, []);
  // const [proceed, setProceed] = useState(false);
  const [guidemodal, setGuidemodal] = useState(false);
  const [requiremodal, setRequiremodal] = useState(false);

  // Share Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFormData, setShareFormData] = useState({ name: '', email: '' });
  const [shareLoading, setShareLoading] = useState(false);
  const [saveRequiredOpen, setSaveRequiredOpen] = useState(false);
  // Replaces window.alert() — see components/alert.
  const [notice, setNotice] = useState(null);
  const store = useStore();
  let state = store.getState();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
  // the storefront navbar parts of this bar: logo, links, and the menu drawer on narrow screens
  const navLogo = useNavLogo();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() => {
    if (!isLocalhost) {
      window.onbeforeunload = function () {
        if (document.getElementById('cjd-root').classList.contains('cjd-hide')) {
        } else {
          return 'Data will be lost if you leave the page, are you sure?';
        }
      };
    }
  }, []);

  const closeGuideModal = () => {
    setGuidemodal(false);
  };

  const currentJacketData = () => ({ materials, styles, colors, designs, sizes, advance });

  const isSameJacketData = (left, right) => {
    try {
      return JSON.stringify(left || {}) === JSON.stringify(right || {});
    } catch {
      return false;
    }
  };

  const activeJacketNeedsSave = () => {
    const active = store.getState().jackets[globals.activeJacket];
    return !active?.saved || !isSameJacketData(active.savedData, currentJacketData());
  };

  const openGuideModal = () => {
    if (activeJacketNeedsSave()) {
      setSaveRequiredOpen(true);
      return;
    }

    // always explained first: the "Don't show this again" option was removed, and a choice saved
    // by it earlier is no longer read
    setGuidemodal(true);
  };

  const proceedAfterGuide = () => copyDefaults();

  const copyDefaults = async () => {
    // guideModalState('open', true);
    await closeGuideModal();

    if (jackets.length === 1) {
      firstJacket({ materials, styles, colors, designs, sizes, advance }, getPrice(state));
      jacketSnapshot(0);
    }
    duplicate();
    updatePreviousState(
      store.getState().jackets.length - 2,
      { materials, styles, colors, designs, sizes, advance },
      getPrice(state)
    );
    jacketSnapshot(store.getState().jackets.length - 2);
    const newJac = store.getState().jackets[0].data;
    replaceMaterials(newJac.materials);
    replaceStyles(newJac.styles);
    replaceColors(newJac.colors);
    replaceDesigns(newJac.designs);
    replaceSizes(newJac.sizes);
    replaceAdvance(newJac.advance);
    updateGlobals('activeJacket', store.getState().jackets.length - 1);
  };

  const changeJacket = (key, id) => {
    currentJacket(
      globals.activeJacket,
      { materials, styles, colors, designs, sizes, advance },
      getPrice(state)
    );
    jacketSnapshot(key);
    updateGlobals('activeJacket', key);

    setActiveJacket(id);
    replaceMaterials(store.getState().jackets[key].data.materials);
    replaceStyles(store.getState().jackets[key].data.styles);
    replaceColors(store.getState().jackets[key].data.colors);
    replaceDesigns(store.getState().jackets[key].data.designs);
    replaceSizes(store.getState().jackets[key].data.sizes);
    replaceAdvance(store.getState().jackets[key].data.advance);
  };

  // Removing a jacket tab. The active jacket is its place in the list (ids are renumbered to match
  // on removal, store/reducers/jackets.js). It used to be set one past the end of the list, so Save
  // marked no jacket and "Save your jacket" came back forever.
  const remove = (key, e) => {
    e.stopPropagation();
    const active = globals.activeJacket;

    if (key !== active) {
      // another tab: stay on this jacket, whose place moves up one if it came after the removed one
      removeJacket(key);
      const next = active > key ? active - 1 : active;
      updateGlobals('activeJacket', next);
      setActiveJacket(next);
      return;
    }

    // the jacket being edited: open the one before it
    const previous = store.getState().jackets[key - 1];
    removeJacket(key);
    updateGlobals('activeJacket', key - 1);
    setActiveJacket(key - 1);
    replaceMaterials(previous.data.materials);
    replaceStyles(previous.data.styles);
    replaceColors(previous.data.colors);
    replaceDesigns(previous.data.designs);
    replaceSizes(previous.data.sizes);
    replaceAdvance(previous.data.advance);
  };

  const rename = (key, title, e) => {
    e.preventDefault();
    e.stopPropagation();

    var jacket = prompt('Name your Jacket', title);
    if (jacket != null) {
      renameJacket(key, jacket);
    }
  };

  const updateJacket = async (key) => {
    await currentJacket(
      key,
      { materials, styles, colors, designs, sizes, advance },
      getPrice(state)
    );
  };

  const getSvg = (key) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        changeJacket(key, key);
        // transparent ground: the site shows it on its own colour, emails flatten it on white
        const options = {
          encoderType: 'image/webp',
          encoderOptions: 0.92
        };
        const svg = document.getElementById('jacketFront');
        const svgBack = document.getElementById('jacketBack');
        const svgRight = document.getElementById('jacketRight');
        const svgLeft = document.getElementById('jacketLeft');

        await svgAsPngUri(svg, options).then(uri => saveSvg(key, 'front', uri));
        await svgAsPngUri(svgBack, options).then(uri => saveSvg(key, 'back', uri));
        await svgAsPngUri(svgRight, options).then(uri => saveSvg(key, 'right', uri));
        await svgAsPngUri(svgLeft, options).then(uri => saveSvg(key, 'left', uri));

        store.getState();
        resolve(store.getState().jackets[key].front);
      }, 1 * key);
    });
  };

  const addData = (data) => {
    return new Promise((resolve, reject) => {
      axiosInstance.post(`/custom/addToCart`, { categoryCode: globals?.productId, ...data })
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  };

  function doSomeAsyncStuff(v) {
    return new Promise((resolve, reject) => {
      if (colors[v] === '') {
        setRequiremodal(true);
        reject(new Error(`Missing color value for ${v}`));
      } else {
        resolve();
      }
    });
  }


  const checkIfDirty = async () => {
    if (sizes.size === '') {
      setRequiremodal(true);
      throw new Error('Size is not selected');
    }

    const requiredColors = getRequiredColorKeys({ styles, advance, jacket: globals.catName });
    const promises = requiredColors.map((v) => doSomeAsyncStuff(v));

    // return this directly
    return Promise.all(promises);
  }

  const addToCart = async () => {
    try {
      const response = await checkIfDirty(); // if this throws, we catch it below
    } catch (error) {
      // Error already handled in `doSomeAsyncStuff`, just exit
      return;
    }

    let data = {}
    // Final Code
    setLoading(true);
    updateJacket(globals.activeJacket);

    let images = [];
    let ids = []
    let keys = [] // each saved design's private key: the cart needs it to change the design later
    for (let index = 0; index < store.getState().jackets.length; index++) {
      let svgResult = await getSvg(index);
      images.push(svgResult);
    }



    Promise.all(images).then(async () => {
      let promises = [];

      for (let index = 0; index < store.getState().jackets.length; index++) {
        const element = store.getState().jackets[index];

        data = {
          // action: 'cjd_add_to_cart',
          product_qty: 1,
          product_id: globals?.productId, // change to category id 
          title: element.title,
          styles: element.data.styles,
          advance: element.data.advance,
          colors: element.data.colors,
          materials: element.data.materials,
          sizes: element.data.sizes,
          designs: element.data.designs,
          globals,
          jackets: store.getState().jackets,
          custom_price: element.price,
          custom_image: element.front,
          custom_image_back: element.back,
          custom_image_left: element.left,
          custom_image_right: element.right,
        };

        let result = await addData(data);

        if (result.status === 200) {
          ids.push(result.data.id)
          keys.push(result.data.editKey || '')
        }
        promises.push(result);
      }

      Promise.all(promises).then(async (res) => {
        setLoading(false);
        setTimeout(() => {
          //     window.onbeforeunload = function () {};
          //     window.parent.postMessage({data: JSON.stringify(data) , result: JSON.stringify(res) }, '*');
          window.onbeforeunload = null;
          window.location.href = frontendUrl(`/cart?index=${ids.join(',')}&keys=${keys.join(',')}`);
        }, 0);
      });
    });


  };

  const updateCart = async () => {
    // const data = {
    //   action: 'cjd_product_remove_cart',
    //   product_id: globals.cart.productId,
    //   cart_item_key: globals.cart.cartItemKey,
    // };

    const designId = globals.design.designItemKey

    await checkIfDirty();
    // console.log(response)
    let data = {}
    // Final Code
    setLoading(true);
    updateJacket(globals.activeJacket);

    let images = [];
    for (let index = 0; index < store.getState().jackets.length; index++) {
      let svgResult = await getSvg(index);
      images.push(svgResult);
    }

    Promise.all(images).then(async () => {
      let promises = [];

      for (let index = 0; index < store.getState().jackets.length; index++) {
        const element = store.getState().jackets[index];

        data = {
          title: element.title,
          styles: element.data.styles,
          advance: element.data.advance,
          colors: element.data.colors,
          materials: element.data.materials,
          sizes: element.data.sizes,
          designs: element.data.designs,
          globals,
          jackets: store.getState().jackets,
          custom_price: element.price,
          custom_image: element.front,
          custom_image_back: element.back,
          custom_image_left: element.left,
          custom_image_right: element.right,

        };

        let result = await axiosInstance.put(`/custom/updateDesign/${designId}`, { ...data });
        if (result.status === 200) {
          window.onbeforeunload = null;
          window.history.go(-1)
        }
        promises.push(result);
      }
    })

  };

  const saveDesign = async () => {
    try {
      await checkIfDirty();
      setLoading(true);
      await updateJacket(globals.activeJacket);

      let images = [];
      for (let index = 0; index < store.getState().jackets.length; index++) {
        let svgResult = await getSvg(index);
        images.push(svgResult);
      }

      await Promise.all(images);

      let promises = [];
      for (let index = 0; index < store.getState().jackets.length; index++) {
        const element = store.getState().jackets[index];

        const data = {
          product_qty: 1,
          product_id: globals?.productId,
          title: element.title,
          styles: element.data.styles,
          advance: element.data.advance,
          colors: element.data.colors,
          materials: element.data.materials,
          sizes: element.data.sizes,
          designs: element.data.designs,
          globals,
          jackets: store.getState().jackets,
          custom_price: element.price,
          custom_image: element.front,
          custom_image_back: element.back,
          custom_image_left: element.left,
          custom_image_right: element.right,
        };

        promises.push(axiosInstance.post(`/custom/product-design/?productId=${globals.madeProduct}`, { categoryCode: globals?.productId, ...data }));
      }

      await Promise.all(promises);
      setLoading(false);
      window.onbeforeunload = null;
      window.history.go(-1);
    } catch (error) {
      setLoading(false);
      const validationOnly = !error?.response && (
        error?.message?.includes('Missing color value') ||
        error?.message?.includes('Size is not selected')
      );
      if (validationOnly) return;

      console.error('Error saving custom design:', error);
      setNotice({
        tone: 'error',
        title: "Couldn't save your design",
        message: error?.response?.data?.message || 'Something went wrong on our end. Please try again in a moment.',
      });
    }
  }

  const handleShareClick = () => setShowShareModal(true);

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareLoading(true);

    try {
      // Capture current jacket snapshot
      await updateJacket(globals.activeJacket);
      // Generate SVGs
      await getSvg(globals.activeJacket);

      const element = store.getState().jackets[globals.activeJacket];
      const designData = {
        product_id: globals?.productId,
        title: element.title,
        styles: element.data.styles,
        advance: element.data.advance,
        colors: element.data.colors,
        materials: element.data.materials,
        sizes: element.data.sizes,
        designs: element.data.designs,
        globals,
        jackets: store.getState().jackets,
        custom_price: element.price,
        custom_image: element.front,
        custom_image_back: element.back,
        custom_image_left: element.left,
        custom_image_right: element.right,
      };

      const { data } = await axiosInstance.post(`/custom/share`, {
        name: shareFormData.name,
        email: shareFormData.email,
        design: designData,
      });

      setShowShareModal(false);
      setNotice({
        tone: 'success',
        title: 'Design sent',
        message: `We emailed your jacket design to ${shareFormData.email}.${data?.pdfAttached === false ? ' The PDF spec could not be generated this time, but the full preview is in the email.' : ''}`,
      });
    } catch (error) {
      console.error(error);
      setNotice({
        tone: 'error',
        title: "Couldn't send your design",
        message: error?.response?.data?.error || 'Something went wrong on our end. Please try again in a moment.',
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleReview = async () => {
    // If it's an existing design, we can jump to review
    if (globals.design.update && globals.design.designItemKey) {
      window.open(frontendUrl(`/design/${globals.design.designItemKey}`), '_blank');
      return;
    }

    // For new designs, we should save it first to get an ID for the review page
    // For now, let's just alert that they should save it to cart first or use the share feature
    setNotice({
      tone: 'info',
      title: 'Save your design first',
      message: 'Save this design to your cart to see the full detailed review, or use Share to email yourself a summary.',
    });
  };

  if (loading) {
    return <Loader msg="Wait while we prepare the custom experience for you" />;
  }
  return (

    <header className='cjd-header'>
      <div className='ez-site cjd-nav'>
        <NavLogo logo={navLogo} />

        {/* {loading && (
          <div className='cjd-loader'>
            <div className='lds-roller'>
              {' '}
              <div /> <div /> <div /> <div /> <div /> <div /> <div /> <div />{' '}
            </div>
            <div className='cjd-loading-msg'>{msg}</div>
          </div>
        )} */}

        <div className='cjd-jackets-tabs'>
          <div className='cjd-scroll'>
            {jackets.map((val, key) => {
              return (
                <div
                  className={`cjd-jacket-tab-item ${val.active && 'cjd-active'}`}
                  key={key}
                  onClick={() => changeJacket(key, val.id)}
                >
                  <span className='cjd-tab-span' onClick={(e) => rename(val.id, val.title, e)}>
                    {/* <CartIcon fill={'#ff9503'}></CartIcon> */}
                    <PencilIcon></PencilIcon>
                  </span>
                  <h4>{val.title}</h4>
                  {key !== 0 && <div className='cjd-remove' onClick={(e) => remove(key, e)}></div>}
                </div>
              );
            })}
          </div>
          {globals.design.update ? '' : (
            <button type='button' className='cjd-add-more' aria-label='Add another jacket' title='Add another jacket' onClick={() => openGuideModal()}>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' aria-hidden='true'><path d='M12 4v16M4 12h16' /></svg>
            </button>
          )}
          {/* phones: Share sits up here next to + (it was in the workspace toolbar), css/components/Header/styles.scss */}
          <button type='button' className='cjd-tab-share' aria-label='Share your design' title='Share your design' onClick={handleShareClick}>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><circle cx='18' cy='5' r='3' /><circle cx='6' cy='12' r='3' /><circle cx='18' cy='19' r='3' /><line x1='8.59' y1='13.51' x2='15.42' y2='17.49' /><line x1='15.41' y1='6.51' x2='8.59' y2='10.49' /></svg>
            Share
          </button>
        </div>

        <NavLinks />

        <div className='cjd-header-actions'>
          <span className='cjd-price-wrapper'>
            <strong className='current'>${getPrice(state)}</strong>
          </span>

          <button className="cjd-btn-secondary" onClick={handleShareClick} title="Share your design">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
            Share
          </button>

          <button
            className={`cjd-btn cjd-btn-cart  ${isMobile ? 'cjd-btn-mobile cjd-btn-addtocart-mobile' : ''}`}
            onClick={() => (globals.design.update ? updateCart() : (globals.save ? saveDesign() : addToCart()))}
          >
            {globals.design.update ? 'Update Design' : (globals.save ? 'SAVE DESIGN' : 'ADD TO CART')}
            {/* <span className='cjd-price-wrapper'>
              <strong className='current'>${getPrice(state)}</strong>
            </span> */}
            <strong className='current-mobile'>${getPrice(state)}</strong>

          </button>
        </div>

        <NavBurger open={menuOpen} onOpen={() => setMenuOpen(true)} />
      </div>
      <NavDrawer open={menuOpen} onClose={closeMenu} logo={navLogo} />

      <NewGuide
        modal={guidemodal}
        closeGuideModal={closeGuideModal}
        proceedAfterGuide={proceedAfterGuide}
      />
      <Required
        modal={requiremodal}
        jacket={globals.catName}
        styles={styles}
        colors={colors}
        sizes={sizes}
        advance={advance}
        setRequiremodal={(val) => setRequiremodal(val)}
      />

      <CjdAlert
        open={saveRequiredOpen}
        tone="save"
        title="Save your jacket"
        message="This jacket is full of aura. Save it before starting a new one."
        onClose={() => setSaveRequiredOpen(false)}
      />

      <CjdAlert
        open={Boolean(notice)}
        tone={notice?.tone}
        title={notice?.title}
        message={notice?.message}
        onClose={() => setNotice(null)}
      />

      {/* Share Modal */}
      <Presence open={showShareModal}>
        <div className="cjd-share-modal" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="cjd-dialog-eyebrow">Share</div>
                <h3>Share Your Creation</h3>
              </div>
              <button type="button" className="close-btn" aria-label="Close" onClick={() => setShowShareModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="desc">Enter your details to share this configuration via email.</p>
              <form onSubmit={handleShareSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={shareFormData.name}
                    onChange={e => setShareFormData({ ...shareFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="recipient@example.com"
                    value={shareFormData.email}
                    onChange={e => setShareFormData({ ...shareFormData, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={shareLoading}>
                  {shareLoading ? 'Processing...' : 'Send Design'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Presence>
    </header>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  jackets: state.jackets,
  materials: state.materials,
  styles: state.styles,
  colors: state.colors,
  designs: state.designs,
  sizes: state.sizes,
  advance: state.advance,
  pricing: state.pricing,
  guideModal: state.guideModal,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  modalState: (key, val) => dispatch(modalState(key, val)),
  firstJacket: (obj, price) => dispatch(firstJacket(obj, price)),
  currentJacket: (key, obj, price) => dispatch(currentJacket(key, obj, price)),
  duplicate: (obj) => dispatch(duplicate(obj)),
  replaceMaterials: (obj) => dispatch(replaceMaterials(obj)),
  replaceStyles: (obj) => dispatch(replaceStyles(obj)),
  replaceColors: (obj) => dispatch(replaceColors(obj)),
  replaceDesigns: (obj) => dispatch(replaceDesigns(obj)),
  replaceSizes: (obj) => dispatch(replaceSizes(obj)),
  replaceAdvance: (obj) => dispatch(replaceAdvance(obj)),
  removeJacket: (key) => dispatch(removeJacket(key)),
  updatePreviousState: (key, obj, price) => dispatch(updatePreviousState(key, obj, price)),
  setActiveJacket: (key) => dispatch(setActiveJacket(key)),
  renameJacket: (key, val) => dispatch(renameJacket(key, val)),
  saveSvg: (key, part, svg) => dispatch(saveSvg(key, part, svg)),
  updateDefaults: (key, data) => dispatch(updateDefaults(key, data)),
  updateGlobals: (key, val) => dispatch(updateGlobals(key, val)),
  guideModalState: (key, val) => dispatch(guideModalState(key, val)),
  jacketSnapshot: (key) => dispatch(jacketSnapshot(key)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
