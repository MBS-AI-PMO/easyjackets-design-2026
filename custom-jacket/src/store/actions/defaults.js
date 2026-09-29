import { updateGlobals } from './'
import { apiCall } from '../../utils'
import axiosInstance from '../../utils/axiosConfig'

export const defaultUpdates = (key, val) => ({
  type: 'UPDATE_DEFAULTS',
  data: { key, val }
})

export const updateDefaults = (data) => {
  let colors =  data?.colors
  
  let materials = data?.materials
  
  let parts = data?.parts
  let sizes = data?.sizes

  let materialprice = data?.materialPrice
  let closurePrice = data?.closurePrice
  let collarPrice = data?.collarPrice
  let pocketPrice = data?.pocketPrice
  let liningPrice = data?.liningPrice
  let designPrice = data?.designPrice
  let sizePrice = data?.sizePrice
  // let data =[
  //   colors : [...colors],
  //   {parts},
  //   {materials},
  //   {sizes}
  // ]
  return (dispatch) => {
    // apiCall({ action: 'cjd_defaults' })
      // .then(res => {
        // const data = res.data;
        // console.log("data" , data)
        // Object.keys(data).map( val => {
          // dispatch( defaultUpdates(val, data[val]) )
          dispatch(defaultUpdates("colors" , colors))
          dispatch(defaultUpdates("parts", parts))
          dispatch(defaultUpdates("sizes" , sizes))
          dispatch(defaultUpdates("materials" , materials))
          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'materials',
              value : materialprice
            }
          })

          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'closure',
              value : closurePrice
            }
          })

          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'collar',
              value : collarPrice
            }
          })

          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'pocket',
              value : pocketPrice
            }
          })

          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'lining',
              value : liningPrice
            }
          })

          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'designs',
              value : designPrice
            }
          })

          dispatch({
            type : 'UPDATE_PRICE',
            payload : {
              category : 'sizes',
              value : sizePrice
            }
          })
          // return true
        // } )
        dispatch( updateGlobals('loading', false) )
      // });
  }
}