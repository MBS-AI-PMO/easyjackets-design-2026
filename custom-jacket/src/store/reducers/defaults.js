let initState = {
  materials: [],
  sizes: [],
  parts: [],
  colors: []
}

const defaults = (state = initState, { type, data }) => {
  switch (type) {
    case 'UPDATE_DEFAULTS':
      return {
        ...state,
        [data.key]: data.val
      }

    case 'REPLACE_GLOBALS':
      return data

    default:
      return state
  }
}

export default defaults