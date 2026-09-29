let initState = {
  chestPocket: false,
  stripes: false,
  piping: false,
  sleevesPiping: false,
  proCuff: false,
  inserts: false,
  insertsCount: 1,
  sleevePocket: false,
  // On by default so the mid-sleeve placement guides are already there the
  // first time guides are switched on, instead of the customer having to find
  // this option and answer Yes before they can see where a patch would go.
  // Answering No still removes them. Carries no price, unlike the options above
  // it — see the advance block in reducers/pricing.js.
  extraSleevePatches: true,
};

const advance = (state = initState, { type, data }) => {
  switch (type) {
    case 'ADVANCE_OPTION':
      return {
        ...state,
        [data.key]: data.val,
      };

    case 'REPLACE_ADVANCE':
      return data;

    default:
      return state;
  }
};

export default advance;
