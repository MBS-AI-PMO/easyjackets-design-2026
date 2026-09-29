let initState = {
  open: false,
  title: 'Pimp Your Jacket',
  tab: 'name',
  index: 0,
  save: false,
};

const popup = (state = initState, { type, data }) => {
  switch (type) {
    case 'MODAL_STATE':
      return {
        ...state,
        [data.key]: data.val,
      };

    default:
      return state;
  }
};

export default popup;
