let initState = {
  defaults: [],
  body: '',
  sleeves: '',
  buttons: '',
  zip: '',
  pockets: '',
  lining: '',
  base: '',
  lines: '',
  border: '',
  inside: '',
  outside: '',
  stripes: '',
  stripes: '#e6e6e6',
  piping: '',
  lace: '',
  band: '',
  inserts: '',
};

const colors = (state = initState, { type, data }) => {
  switch (type) {
    case 'DEFAULT_COLORS':
      return {
        ...state,
        defaults: data,
      };

    case 'SELECT_COLOR':
      return {
        ...state,
        [data.key]: data.val,
      };

    case 'REPLACE_COLORS':
      return {
        ...state,
        body: data.body,
        sleeves: data.sleeves,
        buttons: data.buttons,
        zip: data.zip,
        pockets: data.pockets,
        lining: data.lining,
        stripes: data.stripes,
        base: data.base,
        lines: data.lines,
        border: data.border,
        inside: data.inside,
        outside: data.outside,
        piping: data.piping,
        lace: data.lace,
        band:data.band,
        inserts: data.inserts
      };

    default:
      return state;
  }
};

export default colors;
