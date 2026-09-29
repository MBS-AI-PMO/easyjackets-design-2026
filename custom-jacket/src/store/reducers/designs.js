let initState = {
  font: 'Baseball',
  fill: '#e00000',
  stroke: '#fffed0',
  border: '#e00000',
  'Front Center': {},

  'Right Chest': {},
  'Left Chest': {},

  // 'Right Chest Verticle': {},
  // 'Left Chest Verticle': {},

  'Right Sleeve': {},
  'Left Sleeve': {},

  'Right Mid Sleeve Upper': {},
  'Left Mid Sleeve Upper': {},

  'Right Mid Sleeve Lower': {},
  'Left Mid Sleeve Lower': {},

  'Right Sleeve End': {},
  'Left Sleeve End': {},

  'Right Pocket': {},
  'Left Pocket': {},

  'Back Top': {},
  'Back Middle': {},
  'Back Bottom': {},
};

const designs = (state = initState, { type, data }) => {
  switch (type) {
    case 'DESIGN_COLOR':
      return {
        ...state,
        [data.key]: data.val,
      };

    case 'SELECT_FONT':
      return {
        ...state,
        font: data.val,
      };

    case 'UPDATE_NAME':
      return {
        ...state,
        [data?.part]: {
          done: state[data.part]?.done || false,
          [data.tab]: {
            ...state[data.part]?.[data.tab],
            [data.key]: data.val,
            size: data.font,
          },
        },
      };

    case 'SAVE_PART':
      return {
        ...state,
        [data.part]: {
          done: true,
          [data.section]: data.obj,
        },
      };

    case 'UPDATE_LETTER_TYPE':
      return {
        ...state,
        [data.part]: {
          [data.sec]: {
            [data.key]: data.val,
          },
        },
      };

    case 'REMOVE_DESIGN':
      return {
        ...state,
        [data.sec]: {},
      };

    case 'REPLACE_DESIGNS':
      return data;

    default:
      return state;
  }
};

export default designs;
