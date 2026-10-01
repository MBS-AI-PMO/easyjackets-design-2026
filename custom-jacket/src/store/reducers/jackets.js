let initState = [
  {
    id: 0,
    title: 'Jacket # 1',
    active: true,
    saved: false,
    savedData: null,
    svg: '',
    data: {
      materials: {}
    }
  }
]

const cloneSavedData = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const jackets = (state = initState, { type, data }) => {
  switch (type) {
    case 'NEW_JACKET':
      return [...state, Object.assign({}, state[0], { id: state.length, title: `Jacket # ${state.length + 1}`, active: true, saved: false, savedData: null })]

    case 'UPDATE_JACKET_DATA':
      return state

    case 'UPDATE_PREVIOUS_JACKET':
      return state.map(count => {
        if (count.id === data.key) {
          return {...count, price: data.price, active: false, data: data.obj}
        }
        return count;
      })

    case 'SET_ACTIVE_JACKET':
      return state.map(count => {
        if (count.id === data) {
          return { ...count, active: true }
        } else {
          return { ...count, active: false }
        }

      })

    case 'FIRST_JACKET':
      return state.map(count => {
        if (count.id === 0) {
          return {...count, data: data.obj, price: data.price }
        }
        return count;
      })

    case 'JACKET_DATA':
      return state.map(count => {
        if (count.id === data.key) {
          return {...count, data: data.obj, price: data.price}
        }
        return count;
      })

    case 'SAVE_JACKET_SVG':
      return state.map(count => {
        if (count.id === data.key) {
          return { ...count, [data.part]: data.svg }
        }
        return count;
      })

    case 'MARK_JACKET_SAVED':
      return state.map(count => {
        if (count.id === data.key) {
          return { ...count, saved: data.saved, savedData: data.saved ? cloneSavedData(data.snapshot || count.data) : count.savedData }
        }
        return count;
      })

    case 'RENAME_JACKET':
      return state.map(count => {
        if (count.id === data.key) {
          return {...count, title: data.val}
        }
        return count;
      })

    case 'REMOVE_JACKET':
      let newState = [...state];
      newState.splice(data, 1);
      // ids follow the list again (the rest of the builder finds a jacket by its place)
      return newState.map((jacket, index) => (jacket.id === index ? jacket : { ...jacket, id: index }))

    case 'REPLACE_JACKETS':
      return data

    default:
      return state
  }
}

export default jackets
