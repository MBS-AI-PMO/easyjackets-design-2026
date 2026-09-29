import React from "react";
import { connect } from "react-redux";

import {
  saveName,
  deleteDesign,
  changePose,
  modalState,
} from "../../store/actions";

const Designs = ({
  globals,
  advance,
  modalState,
  designs,
  deleteDesign,
  styles,
}) => {
  const key = [
    'Front Center',
    'Right Chest',
    'Left Chest',

    // 'Right Chest Verticle': {},
    // 'Left Chest Verticle': {},

    'Right Sleeve',
    'Left Sleeve',

    'Right Mid Sleeve Upper',
    'Left Mid Sleeve Upper',

    'Right Mid Sleeve Lower',
    'Left Mid Sleeve Lower',

    'Right Sleeve End',
    'Left Sleeve End',

    'Right Pocket',
    'Left Pocket',

    'Back Top',
    'Back Middle',
    'Back Bottom'
  ]
  let DESKEYS = Object.keys(designs)

  DESKEYS = [...new Set([...DESKEYS, ...key])]

  const openModal = (tab) => {
    if (designs[tab]?.done) {
      if (designs[tab]?.name) {
        modalState("index", 0);
        modalState("tab", "name");
      } else if (designs[tab]?.letters) {
        modalState(
          "index",
          tab === "Left Pocket" || tab === "Right Pocket" ? 0 : 1
        );
        modalState("tab", "letters");
      } else if (designs[tab]?.editables) {
        modalState("index", 1);
        modalState("tab", "editables");
      } else if (designs[tab]?.symbol) {
        modalState(
          "index",
          tab === "Left Pocket" || tab === "Right Pocket" ? 1 : 2
        );
        modalState("tab", "symbol");
      }
    } else {
      modalState("index", 0);
    }

    modalState("title", tab);
    modalState("open", true);
  };

  const removeDesign = (id, e) => {
    e.stopPropagation();
    deleteDesign(id);
  };

  return (
    <div className="cjd-cd-wrapper">
      {DESKEYS
        .filter(
          (parts) =>
            parts !== "font" &&
            parts !== "fill" &&
            parts !== "stroke" &&
            parts !== "border"
        )
        .map((val, i) => {
          if (
            !(val === "Left Chest" && designs["Front Center"]?.done) &&
            !(val === "Right Chest" && designs["Front Center"]?.done) &&
            !(val === "Front Center" && designs["Right Chest"]?.done) &&
            !(val === "Front Center" && advance.chestPocket) &&
            // Removed: !(val === "Front Center" && advance.insertsCount === 2) - Allow Front Center with double inserts
            !(val === "Left Chest" && advance.chestPocket) &&
            !(val === "Left Sleeve" && globals.catName === 'Bomber Jackets') &&
            !(val === "Left Pocket" && (globals.catName === 'Hoodies' || globals.productId === "5995")) &&
            !(val === "Right Pocket" && (globals.catName === 'Hoodies' || globals.productId === "5995")) &&
            // !(val === "Left Pocket" && globals.catName === 'Coach Jackets') &&
            // !(val === "Back Bottom" && (globals.catName === 'Hoodies' || globals.productId === "5995")) &&
            !(val === "Right Pocket" && globals.catName === 'ladies Varsity Jackets') &&
            !(val === "Left Pocket" && globals.catName === 'ladies Varsity Jackets') &&

            // !(val === "Right Pocket" && globals.catName === 'Coach Jackets') &&
            !(val === "Front Center" && designs["Left Chest"]?.done) &&
            !(val === "Right Mid Sleeve Upper" && !advance.extraSleevePatches) &&
            !(val === "Left Mid Sleeve Upper" && !advance.extraSleevePatches) &&
            !(val === "Right Mid Sleeve Lower" && !advance.extraSleevePatches) &&
            !(val === "Left Mid Sleeve Lower" && !advance.extraSleevePatches)
          ) {
            return (
              <div
                key={i}
                className={`cjd-cd-box designLocations`}
                onClick={() => openModal(val)}
              >
                <span>
                  {styles.collar === "Zipper Hood" && val === "Back Top"
                    ? "Overhood"
                    : val}
                </span>
                <span
                  className={` ${designs[val]?.done && "cjd-done"}`}
                  onClick={(e) => removeDesign(val, e)}
                ></span>
              </div>
            );
          } else {
            return false;
          }
        })}
    </div>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  advance: state.advance,
  designs: state.designs,
  styles: state.styles,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  saveName: (part, section, obj) => dispatch(saveName(part, section, obj)),
  deleteDesign: (sec) => dispatch(deleteDesign(sec)),
  changePose: (val) => dispatch(changePose(val)),
  modalState: (key, val) => dispatch(modalState(key, val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Designs);
