import React from 'react';
import { connect } from 'react-redux';

import Accordion from '../accordion';
import SelectBox from '../selectBox';

import { selectStyle, advanceOption } from '../../store/actions';

// Collar Type
import collarSimple from '../../assets/images/collar-simple.svg';
import collarRollUp from '../../assets/images/collar-roll-up.svg';
// import collarSailor from '../../assets/images/collar-sailor.svg';
import collarHood from '../../assets/images/icon-hood.svg';
import collarClassic from '../../assets/images/collar-classic.svg';
import zipperHood from '../../assets/images/zipper-hood.svg';
import band from '../../assets/images/band.svg';

// Pocket Style
import pocketSB from '../../assets/images/pocket-single-bone.svg';
import pocketDB from '../../assets/images/pocket-double-bone.svg';
import pocketFlap from '../../assets/images/pocket-flap.svg';
import pocketSnap from '../../assets/images/pocket-snap.svg';
import pocketStraight from '../../assets/images/pocket-straight.svg';
import pocketZipper from '../../assets/images/pocket-zipper.svg';

// Sleeves Style
import styleRaglan from '../../assets/images/style-raglan.webp';
import styleSimple from '../../assets/images/style-simple.webp';

// Front Closure
import closureButtons from '../../assets/images/icon-button.svg';
import closureZipper from '../../assets/images/icon-zipper.svg';
import closurePullover from '../../assets/images/icon-pullover.svg';

// Lining
import liningQuilt from '../../assets/images/lining-quilt.webp';
import liningSatin from '../../assets/images/satin.webp';
import liningCotton from '../../assets/images/cotton.webp';

const Styles = ({ globals, advance, styles, updateStyle, advanceOption }) => (
  <>
    <Accordion>
      {globals.catName !== "Hoodies" && (
        <div
          parent={1}
          label="Collar Type"
          isOpen={globals[1] === 'Collar Type'}
        >
          <div className="cjd-select-wrapper">
            {!globals.coach && (
              <SelectBox
                type={'collar'}
                label={'Classic'}
                customLabel={'Knit Collar'}
                src={collarClassic}
                current={styles.collar}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            {!globals.coach && globals.catName !== 'Bomber Jackets' && (
              <SelectBox
                type={'collar'}
                label={'Simple'}
                customLabel={'Over Lapped Collar'}
                src={collarSimple}
                current={styles.collar}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            <SelectBox
              type={'collar'}
              label={'Roll Up'}
              customLabel={'Shirt Collar'}
              src={collarRollUp}
              current={styles.collar}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            {/* {(!globals.coach && globals.catName !== 'Hoodies' && globals.catName !== 'Bomber Jackets') &&
          <SelectBox
            type={'collar'}
            label={'Sailor'}
            customLabel={'Sailor Collar'}
            src={ collarSailor }
            current={styles.collar}
            dispatch={ (type, label) => updateStyle(type, label) }
          />
          } */}

            <SelectBox
              type={'collar'}
              label={'Hood'}
              src={collarHood}
              current={styles.collar}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            {(!globals.coach && globals.catName !== "Hoodies" && globals.catName !== 'Bomber Jackets' && String(globals.productId).trim() !== "4893") && (
              <SelectBox
                type={'collar'}
                label={'Zipper Hood'}
                src={zipperHood}
                current={styles.collar}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            {!globals.coach && (globals.catName !== "Hoodies") && globals.catName !== 'Bomber Jackets' && (
              <SelectBox
                type={'collar'}
                label={'Band'}
                src={band}
                current={styles.collar}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}
          </div>
        </div>
      )}

      <div
        parent={1}
        label="Sleeves Style"
        isOpen={globals[1] === 'Sleeves Style'}
      >
        <div className="cjd-select-wrapper">
          <SelectBox
            type={'sleeves'}
            label={'Set-In'}
            src={styleSimple}
            current={styles.sleeves}
            dispatch={(type, label) => updateStyle(type, label)}
          />

          <SelectBox
            type={'sleeves'}
            label={'Raglan'}
            src={styleRaglan}
            current={styles.sleeves}
            dispatch={(type, label) => updateStyle(type, label)}
          />
        </div>
      </div>

      {globals.catName !== 'Bomber Jackets' && !globals.coach && (
        <div
          parent={1}
          label="Front Closure"
          isOpen={globals[1] === 'Front Closure'}
        >
          <div className="cjd-select-wrapper">
            {globals.catName !== "Hoodies" && (
              <SelectBox
                type={'closure'}
                label={'Buttons'}
                src={closureButtons}
                current={styles.closure}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            <SelectBox
              type={'closure'}
              label={'Zipper'}
              src={closureZipper}
              current={styles.closure}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            {globals.catName === "Hoodies" && (
              <SelectBox
                type={'closure'}
                label={'Pullover'}
                src={closurePullover}
                current={styles.closure}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}
          </div>

          {styles.closure === 'Buttons' && (
            <label
              htmlFor="cjdFlap"
              className="cjd-label"
              style={{
                display: 'inline-block',
                marginTop: '10px',
                fontSize: '12px',
              }}
            >
              <input
                id="cjdFlap"
                type="checkbox"
                checked={styles.flap}
                onChange={() => updateStyle('flap', !styles.flap)}
              />
              <span>Add Flap (Zip + Buttons)</span>
            </label>
          )}
        </div>
      )}

      {globals.catName !== "Hoodies" && (
        <div
          parent={1}
          label="Pocket Style"
          isOpen={globals[1] === 'Pocket Style'}
        >
          <div className="cjd-select-wrapper">
            <SelectBox
              type={'pocket'}
              label={'Slash Pocket'}
              src={pocketSB}
              current={styles.pocket}
              className="cjd-slash-pocket"
              dispatch={(type, label) => updateStyle(type, label)}
            />

            {!globals.coach && (
              <SelectBox
                type={'pocket'}
                label={'Welt Pocket'}
                src={pocketDB}
                current={styles.pocket}
                className="cjd-welt-pocket"
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            {!globals.coach && (
              <SelectBox
                type={'pocket'}
                label={'Flap Pocket'}
                src={pocketFlap}
                current={styles.pocket}
                className="cjd-flap-pocket"
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            <SelectBox
              type={'pocket'}
              label={'Snap Pocket'}
              customLabel={globals.coach ? 'Flap Pocket' : 'Snap Pocket'}
              src={pocketSnap}
              current={styles.pocket}
              className="cjd-snap-pocket"
              dispatch={(type, label) => updateStyle(type, label)}
            />

            {!globals.coach && (
              <SelectBox
                type={'pocket'}
                label={'Straight Pocket'}
                src={pocketStraight}
                current={styles.pocket}
                className="cjd-straight-pocket"
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}

            {globals.catName !== 'Coach Jackets' && (
              <SelectBox
                type={'pocket'}
                label={'Zipper Pocket'}
                src={pocketZipper}
                current={styles.pocket}
                className="cjd-straight-pocket"
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}
          </div>
        </div>
      )}

      {globals.catName !== 'Bomber Jackets' && globals.catName !== 'Hoodies' && !globals.coach && (
        <div
          parent={1}
          label="Knit / Trim"
          isOpen={globals[1] === 'Knit / Trim'}
        >
          <div className="cjd-select-wrapper cjd-single">
            <SelectBox
              type={'knit'}
              label={'Plain'}
              current={styles.knit}
              style={true}
              dispatch={(type, label) => updateStyle(type, label)}
            />
            {String(globals.productId).trim() !== '4893' && (
              <>
                <SelectBox
                  type={'knit'}
                  label={'Single Line'}
                  current={styles.knit}
                  className={'cjd-sl'}
                  style={true}
                  dispatch={(type, label) => updateStyle(type, label)}
                />

                <SelectBox
                  type={'knit'}
                  label={'Single Line Border'}
                  current={styles.knit}
                  className={'cjd-slb'}
                  style={true}
                  dispatch={(type, label) => updateStyle(type, label)}
                />
              </>
            )}
            <SelectBox
              type={'knit'}
              label={'Double Line'}
              current={styles.knit}
              className={'cjd-dl'}
              style={true}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            <SelectBox
              type={'knit'}
              label={'Double Line Border'}
              current={styles.knit}
              className={'cjd-dlb'}
              style={true}
              dispatch={(type, label) => updateStyle(type, label)}
            />
          </div>
        </div>
      )}

      {globals.catName !== "Hoodies" && !globals.coach && (
        <div parent={1} label="Lining" isOpen={globals[1] === 'Lining'}>
          <div className="cjd-select-wrapper">
            <SelectBox
              type={'lining'}
              label={'Quilt'}
              src={liningQuilt}
              current={styles.lining}
              material={true}
              className={`cjd-mat cjd-lining-quilt cjd-material-box`}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            <SelectBox
              type={'lining'}
              label={'Satin'}
              src={liningSatin}
              current={styles.lining}
              material={true}
              className={`cjd-mat cjd-lining-satin cjd-material-box`}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            {globals.catName !== "Hoodies" && !globals.coach && globals.catName !== 'Bomber Jackets' && (
              <SelectBox
                type={'lining'}
                label={'Cotton'}
                src={liningCotton}
                current={styles.lining}
                material={true}
                className={`cjd-mat cjd-lining-cotton cjd-material-box`}
                dispatch={(type, label) => updateStyle(type, label)}
              />
            )}
          </div>

          <label
            htmlFor="cjdZipout"
            className="cjd-label"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              fontSize: '12px',
            }}
          >
            <input
              id="cjdZipout"
              type="checkbox"
              checked={styles.zipout}
              onChange={() => updateStyle('zipout', !styles.zipout)}
            />
            <span>Add 1/2 Zipout Lining</span>
          </label>
          <div
            className="more-info"
            data-label={'something'}
            data-tip={'something'}
          >
            ?
          </div>
        </div>
      )}

      {globals.coach && (
        <div parent={1} label="Lining" isOpen={globals[1] === 'Lining'}>
          <div className="cjd-select-wrapper">
            <SelectBox
              type={'lining'}
              label={'Polar Fleece'}
              src={liningQuilt}
              current={styles.lining}
              material={true}
              className={`cjd-mat cjd-lining-polar-fleece`}
              dispatch={(type, label) => updateStyle(type, label)}
            />

            <SelectBox
              type={'lining'}
              label={'Brushed Tricot'}
              src={liningSatin}
              current={styles.lining}
              material={true}
              className={`cjd-mat cjd-lining-brushed-tricot`}
              dispatch={(type, label) => updateStyle(type, label)}
            />
          </div>
        </div>
      )}
    </Accordion>
  </>
);

const mapStateToProps = (state) => ({
  styles: state.styles,
  globals: state.globals,
  advance: state.advance,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateStyle: (key, val) => dispatch(selectStyle(key, val)),
  advanceOption: (key, val) => dispatch(advanceOption(key, val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Styles);
