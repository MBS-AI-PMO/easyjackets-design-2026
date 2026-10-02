import React from "react";
import { connect } from "react-redux";
import Toggle from "react-toggle";
import "react-toggle/style.css";

import { advanceOption } from "../../store/actions/index.js";
import { Select2 } from "../select2Component/select2.tsx";

const replaceKeyName = (array) => {
  return array.map((item) => {
    const { name, ...rest } = item;
    return { label: name, value: name, ...rest };
  });
};

const Advance = ({ globals, advance, styles, advanceOption }) => {
  const {
    chestPocket,
    inserts,
    insertsCount,
    stripes,
    piping,
    proCuff,
    sleevesPiping,
  } = advance;

  const sholderInserList = [
    { name: "None" },
    { name: "Single" },
    { name: "Double" },
  ];

  const transformedSAdvanceSholderInsertArray =
    replaceKeyName(sholderInserList);

  const cuffList = [{ name: "Pro Cuff" }, { name: "Knit Cuff" }];

  const transformedCuffArray = replaceKeyName(cuffList);
  // the ladies jacket (?id=4893) has no shoulder insert and no cuff style choice
  const isLadiesJacket = String(globals.productId).trim() === "4893";
  return (
    <>
      {globals.catName !== "Hoodies" && globals.catName !== "ladies Varsity Jackets" && (
        <>
          <label className="select-label">Add Chest Pocket</label>
          <div
            className=""
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              data-style="Set-In"
              class={`control-panel-btn ${chestPocket && "active"}`}
              onClick={() => advanceOption("chestPocket", true)}
            >
              Yes
            </button>
            <button
              data-style="Raglan"
              class={`control-panel-btn ${!chestPocket && "active"}`}
              onClick={() => advanceOption("chestPocket", false)}
            >
              No
            </button>
          </div>
        </>
      )}
      {/* <label className="select-label">Sleeves Material</label> */}
      {/*<Select2
        data={transformedSAdvanceSholderInsertArray}
        value={typeof inserts == 'boolean' ? sholderInserList[0]?.name : sholderInserList[inserts]?.name}
        open={(e) => console.log("Open",   e)}
        update={(value) => advanceOption(sholderInserList.findIndex(item => item.name == value) == 0 ? "inserts" : "insertsCount", sholderInserList.findIndex(item => item.name == value))}
        isOpen={false}
      ></Select2>*/}

      {!stripes &&
        !isLadiesJacket &&
        globals.catName !== "Hoodies" &&
        globals.catName !== "Bomber Jackets" &&
        // globals.catName !== "ladies Varsity Jackets" &&

        styles.sleeves !== "Raglan" && (
          <div

            style={{

              marginTop: "20px",
            }}
          >
            <label className="select-label">Shoulder insert</label>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <button
                data-style="shoulder-on"
                class={`control-panel-btn ${inserts && "active"}`}
                onClick={() => advanceOption("inserts", true)}
              >
                Yes
              </button>
              <button
                data-style="shoulder-off"
                class={`control-panel-btn ${!inserts && "active"}`}
                onClick={() => advanceOption("inserts", false)}
              >
                No
              </button>
            </div>
          </div>
        )}

      {inserts && !isLadiesJacket && styles.sleeves !== "Raglan" && (
        <>
          <div
            className=""
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              data-style="Set-In"
              class={`control-panel-btn ${insertsCount == 1 && "active"}`}
              onClick={() => advanceOption("insertsCount", 1)}
            >
              Single
            </button>
            <button
              data-style="Raglan"
              class={`control-panel-btn ${insertsCount == 2 && "active"}`}
              onClick={() => advanceOption("insertsCount", 2)}
            >
              Double
            </button>
          </div>
        </>
      )}

      {!inserts && styles.sleeves !== "Raglan" &&
        globals.catName !== "ladies Varsity Jackets" && globals.catName !== "Bomber Jackets" && (
          <>
            <label className="select-label">Add Sleeves Stripe</label>
            <div
              className=""
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <button
                data-style="Set-In"
                class={`control-panel-btn ${stripes && "active"}`}
                onClick={() => advanceOption("stripes", true)}
              >
                Yes
              </button>
              <button
                data-style="Raglan"
                class={`control-panel-btn ${!stripes && "active"}`}
                onClick={() => advanceOption("stripes", false)}
              >
                No
              </button>
            </div>
          </>
        )}

      {!inserts && styles.sleeves === "Raglan" &&
        (
          <>
            <label className="select-label">Add Sleeves Piping</label>
            <div
              className=""
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <button
                data-style="Set-In"
                class={`control-panel-btn ${sleevesPiping && "active"}`}
                onClick={() => advanceOption("sleevesPiping", true)}
              >
                Yes
              </button>
              <button
                data-style="Raglan"
                class={`control-panel-btn ${!sleevesPiping && "active"}`}
                onClick={() => advanceOption("sleevesPiping", false)}
              >
                No
              </button>
            </div>
          </>
        )}

      {globals.catName !== "Hoodies" && globals.catName !== "Bomber Jackets" && globals.catName !== "ladies Varsity Jackets" && (
        <>
          <label className="select-label">
            {stripes
              ? "Add Stripe Piping"
              : styles.pocket === "Welt Pocket" ||
                styles.pocket === "Slash Pocket"
                ? "Add Shoulder & Pockets Piping"
                : "Add Shoulder Piping"}
          </label>
          <div
            className=""
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              data-style="Set-In"
              class={`control-panel-btn ${piping && "active"}`}
              onClick={() => advanceOption("piping", true)}
            >
              Yes
            </button>
            <button
              data-style="Raglan"
              class={`control-panel-btn ${!piping && "active"}`}
              onClick={() => advanceOption("piping", false)}
            >
              No
            </button>
          </div>
        </>
      )}

      {globals.catName !== "Hoodies" && globals.catName !== "Bomber Jackets" && !isLadiesJacket && (
        <>
          <label className="select-label">Cuff Style</label>
          <Select2
            data={transformedCuffArray}
            value={advance.proCuff ? "Pro Cuff" : "Knit Cuff"}
            update={(value) =>
              advanceOption("proCuff", value === "Pro Cuff" ? true : false)
            }
            isOpen={false}
          ></Select2>
        </>
      )}

      {globals.catName === "Bomber Jackets" && (
        <div
          className="cjd-form-group"
          style={{ display: "flex", marginTop: "10px", padding: "10px" }}
        >
          <span
            id="sleeve-pocket"
            className="select-label"
            style={{ marginRight: "auto" }}
          >
            Remove Sleeve Pocket?
          </span>
          <Toggle
            icons={false}
            id="sleevePocket"
            defaultChecked={!advance.sleevePocket}
            aria-labelledby="sleeve-pocket"
            onChange={() =>
              advanceOption("sleevePocket", !advance.sleevePocket)
            }
          />
        </div>
      )}

      {/* {!globals.hoodies && (
        <div
          className="cjd-form-group"
          style={{
            display: 'flex',
            marginTop: '10px',
            padding: '10px',
            borderTop: '1px solid #e6e6e6',
          }}
        >
          <span id="chest-pocket" style={{ marginRight: 'auto' }}>
            Add Chest Pocket
          </span>
          <Toggle
            icons={false}
            id="chestPocket"
            defaultChecked={chestPocket}
            aria-labelledby="chest-pocket"
            onChange={() => advanceOption('chestPocket', !chestPocket)}
          />
        </div> */}
      {/* )} */}

      {/* {!stripes &&
        !globals.bomber &&
        !globals.hoodies &&
        styles.sleeves !== 'Raglan' && (
          <div
            className="cjd-form-group"
            style={{
              display: 'flex',
              padding: '10px',
              marginTop: '20px',
              borderTop: '1px solid #e6e6e6',
            }}
          >
            <span id="shoulder-inserts" style={{ marginRight: 'auto' }}>
              Add Shoulder Inserts
            </span>
            <Toggle
              icons={false}
              id="shoulderInserts"
              defaultChecked={inserts}
              aria-labelledby="shoulder-inserts"
              onChange={() => advanceOption('inserts', !inserts)}
            />
          </div>
        )} */}

      {/* {inserts && styles.sleeves !== 'Raglan' && (
        <div
          className="cjd-btn-group"
          style={{ marginTop: '20px', padding: '10px' }}
        >
          <div
            className={
              insertsCount === 1
                ? 'cjd-btn cjd-btn-primary'
                : 'cjd-btn cjd-btn-secondary'
            }
            onClick={() => advanceOption('insertsCount', 1)}
          >
            Single
          </div>
          <div
            className={
              insertsCount === 2
                ? 'cjd-btn cjd-btn-primary'
                : 'cjd-btn cjd-btn-secondary'
            }
            onClick={() => advanceOption('insertsCount', 2)}
          >
            Double
          </div>
        </div>
      )} */}

      {/* {!inserts && styles.sleeves !== 'Raglan' && !globals.bomber && (
        <div
          className="cjd-form-group"
          style={{
            display: 'flex',
            padding: '10px',
            marginTop: '20px',
            borderTop: '1px solid #e6e6e6',
          }}
        >
          <span id="sleeves-stripe" style={{ marginRight: 'auto' }}>
            Add Sleeves Stripe
          </span>
          <Toggle
            icons={false}
            id="sleevesSripe"
            defaultChecked={stripes}
            aria-labelledby="sleeves-stripe"
            onChange={() => advanceOption('stripes', !stripes)}
          />
        </div>
      )}

      {!inserts && styles.sleeves === 'Raglan' && (
        <div
          className="cjd-form-group"
          style={{
            display: 'flex',
            padding: '10px',
            marginTop: '20px',
            borderTop: '1px solid #e6e6e6',
          }}
        >
          <span id="sleeves-piping" style={{ marginRight: 'auto' }}>
            Add Sleeves Piping
          </span>
          <Toggle
            icons={false}
            id="sleevesPiping"
            defaultChecked={sleevesPiping}
            aria-labelledby="sleeves-piping"
            onChange={() => advanceOption('sleevesPiping', !sleevesPiping)}
          />
        </div>
      )}

      {!globals.bomber && !globals.hoodies && (
        <div
          className="cjd-form-group"
          style={{
            display: 'flex',
            padding: '10px',
            marginTop: '20px',
            borderTop: '1px solid #e6e6e6',
          }}
        >
          <span id="piping" style={{ marginRight: 'auto' }}>
            {stripes
              ? 'Add Stripe Piping'
              : styles.pocket === 'Welt Pocket' ||
                styles.pocket === 'Slash Pocket'
              ? 'Add Shoulder & Pockets Piping'
              : 'Add Shoulder Piping'}
          </span>
          <Toggle
            icons={false}
            id="piping"
            defaultChecked={piping}
            aria-labelledby="piping"
            onChange={() => advanceOption('piping', !piping)}
          />
        </div>
      )} */}

      {globals.catName === "Bomber Jackets" && (
        <div
          className="cjd-form-group"
          style={{
            display: 'flex',
            padding: '10px',
            marginTop: '20px',
            borderTop: '1px solid #e6e6e6',
          }}
        >
          <span id="pro-cuff" className="select-label"
            style={{ marginRight: 'auto' }}>
            Want Pro Cuff?
          </span>
          <Toggle
            icons={false}
            id="proCuff"
            defaultChecked={proCuff}
            aria-labelledby="pro-cuff"
            onChange={() => advanceOption('proCuff', !proCuff)}
          />
        </div>
      )}

      {/* no "Extra Sleeve Patches" switch on any jacket: the extra sleeve patch places stay on (store default) */}
    </>
  );
};

const mapStateToProps = (state) => ({
  advance: state.advance,
  globals: state.globals,
  styles: state.styles,
});

const mapDispatchToProps = (dispatch) => ({
  advanceOption: (key, val) => dispatch(advanceOption(key, val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Advance);
