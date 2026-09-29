let initState = {
  sidebar: 0,
  0: 'Body Material',
  1: 'Collar Type',
  3: 'body',
  activeJacket: 0,
  guides: false,
  pose: 'front',
  fill: '#e00000',
  stroke: '#fffed0',
  border: '#e00000',
  modalTitle: 'Front Center',
  bomber: false,
  hoodies: false,
  coach: false,
  loading: true,
  save: false,
  share: false,
  email: '',
  recipient: '',
  message: '',
  design: {
    update: false,
    productId: '',
    designItemKey: '',
  },
  productId : '',
  save : false,
  madeProduct : ''
};

const globals = (state = initState, { type, data }) => {
  switch (type) {
    case 'UPDATE_GLOBAL':
      return {
        ...state,
        [data.key]: data.val,
      };

    case 'COLOR_PICKER':
      return {
        ...state,
        3: data,
        sidebar: state.hoodies || state.coach ? 2 : 3,
      };

    case 'ACTIVE_ACCORDIN':
      return {
        ...state,
        [data.par]: data.cur,
      };

    case 'ACTIVE_SIDEBAR':
      return {
        ...state,
        sidebar: data,
      };

    case 'CHANGE_POSE':
      return {
        ...state,
        pose: data,
      };

    case 'GLOBAL_FILL_COLOR':
      return {
        ...state,
        [data.key]: data.val,
      };

    case 'ACTIVE_TAB':
      return {
        ...state,
      };

    case 'REPLACE_GLOBALS':
      return data;

    case 'ACTIVE_SECTION':
      break;

    default:
      return state;
  }
};

export default globals;
