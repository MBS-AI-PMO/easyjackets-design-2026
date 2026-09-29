let initState = {
  collar: {
    classic: 0,
    simple: 5,
    rollup: 8,
    hood: 10,
    zipperhood: 15,
    shirtcollar: 8,
    sailor: 15,
    band: 5,
    overlap: 5,
  },
  sleeves: {
    setin: 0,
    raglan: 10,
  },
  closure: {
    buttons: 0,
    zipper: 8,
    flap: 20,
    pullover: 0,
  },
  pocket: {
    slashpocket: 0,
    weltpocket: 4,
    flappocket: 4,
    snappocket: 4,
    straightpocket: 0,
    zipperpocket: 4,
  },
  lining: {
    quilt: 0,
    satin: 0,
    fur: 10,
    polarfleece: 10,
    brushedtricot: 10,
    cotton: 8,
    zipout: 0,
  },
  materials: {
    body: {
      cowhideleather: 65,
      meltonwool: 30,
      cottontwill: 25,
      sheepleather: 75,
      nylonmemory: 25,
      cottonfleece: 25,
      softshell: 25,
      satin: 25,
      synthaticleather: 25,
      nylon: 25,
      taffeta: 25,
    },
    sleeves: {
      cowhideleather: 0,
      meltonwool: 0,
      cottontwill: 0,
      sheepleather: 0,
      nylonmemory: 0,
      cottonfleece: 0,
      softshell: 0,
      satin: 0,
      synthaticleather: 0,
      nylon: 0,
      taffeta: 0,
    },
  },
  designs: {
    frontcenter: 25,
    backtop: 25,
    backbottom: 25,
    backmiddle: 25,
    leftchest: 20,
    rightchest: 20,
    leftpocket: 15,
    rightpocket: 0,
    leftsleeve: 0,
    rightsleeve: 10,
    leftsleeveend: 10,
    rightsleeveend: 10,
    rightsleevemidupper: 8,
    leftsleevemidupper: 8,
    rightsleevemidlower: 8,
    leftsleevemidlower: 8,
  },
  sizes: {
    xxs: 0,
    xs: 0,
    s: 0,
    m: 0,
    mtall: 0,
    l: 0,
    ltall: 0,
    xl: 0,
    xltall: 5,
    '2xl': 5,
    '2xltall': 5,
    '3xl': 10,
    '4xl': 10,
    '5xl': 10,
    '6xl': 10,
    custom: 20,
  },
  advance: {
    chestPocket: 8,
    proCuff: 8,
    insertsCount1: 8,
    insertsCount2: 16,
    piping: 5,
  },
};

const pricing = (state = initState, action) => {

  switch (action.type) {
    case "UPDATE_PRICE": {
      const { category, value } = action.payload;
      return {
        ...state,
        [category]: {
          ...state[category],
          ...value
        },
      };
    }
    case "RESET_PRICING": {
      return { ...initState }; // Reset to initial state
    }
    default:
      return state;
  }
};

export default pricing;
