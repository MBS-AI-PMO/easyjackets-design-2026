let initState = {
  custom: false,
  scale: 'in',
  size: '',
  price: 0,
};

const sizes = (state = initState, { type, data }) => {
  switch (type) {
    case 'SELECT_SIZE':
      return {
        ...state,
        [data.type]: data.val,
      };

    case 'REPLACE_SIZES':
      return data;

    default:
      return state;
  }
};

export default sizes;
