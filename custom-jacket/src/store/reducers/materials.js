let initState = {
  body: "Cotton Fleece",
  sleeves: "Cotton Fleece",
};

const materials = (state = initState, { type, data }) => {
  switch (type) {
    case "SELECT_MATERIAL":
      return {
        ...state,
        [data.key]: data.val,
        sleeves: data.val,
      };

    case "SELECT_MATERIAL_SLEEVES":
      return {
        ...state,
        [data.key]: data.val,
      };

    case "REPLACE_MATERIALS":
      return data;

    default:
      return state;
  }
};

export default materials;
