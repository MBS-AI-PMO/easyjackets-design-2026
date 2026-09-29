let initState = {
  section: {
    title: 'collar',
    open: false,
  },
  collar: 'Classic',
  sleeves: 'Set-In',
  closure: 'Buttons',
  pocket: 'Slash Pocket',
  knit: 'Double Line',
  lining: 'Quilt',
  flap: false,
  zipout: false,
};

const styles = (state = initState, { type, data }) => {
  switch (type) {
    case 'SELECT_STYLE':
      return {
        ...state,
        [data.key]: data.val,
      };

    case 'OPEN_ACCORDIN':
      return {
        ...state,
        section: {
          title: data.title,
          open: data.open,
        },
      };

    case 'REPLACE_STYLES':
      return data;

    default:
      return state;
  }
};

export default styles;
