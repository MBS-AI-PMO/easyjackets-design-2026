let initState = {
  chestPocket: false,
  stripes: false,
  piping: false,
  sleevesPiping: false,
  proCuff: false,
  inserts: false,
  insertsCount: 1,
  sleevePocket: false,
  // Always on: the extra sleeve patch places (mid-sleeve upper/lower) are part of
  // every jacket and there is no switch for them any more. Carries no price,
  // unlike the options above it — see the advance block in reducers/pricing.js.
  extraSleevePatches: true,
};

const advance = (state = initState, { type, data }) => {
  switch (type) {
    case 'ADVANCE_OPTION':
      return {
        ...state,
        [data.key]: data.val,
      };

    // a saved design may say No (or predate the setting): the patch places stay on regardless
    case 'REPLACE_ADVANCE':
      return { ...data, extraSleevePatches: true };

    default:
      return state;
  }
};

export default advance;
