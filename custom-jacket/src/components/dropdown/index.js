import React from 'react'
import { connect } from 'react-redux'
import Dropdown from 'react-dropdown'

import { selectFont } from '../../store/actions'
import { fallbackTypeFonts, loadCustomizerFonts } from '../../utils/fontLoader'
//import './css/styles.scss'
import '../../css/components/Dropdown/styles.scss'
 import 'react-dropdown/style.css'

const Fonts = ({ fixFont, font, selectFont }) => {
  const [options, setOptions] = React.useState(
    fallbackTypeFonts.map((item) => ({ value: item.family, label: item.name }))
  )

  React.useEffect(() => {
    let isMounted = true

    loadCustomizerFonts().then((fonts) => {
      if (!isMounted) return
      setOptions(fonts.map((item) => ({ value: item.family, label: item.name })))
    })

    return () => {
      isMounted = false
    }
  }, [])

  function onSelect(option) {
    selectFont(option.value)
    fixFont()
  }

  return (
    <Dropdown
      options={options}
      onChange={onSelect}
      value={font}
      placeholder="Select an option"
    />
  )
}

const mapStateToProps = (state) => ({
  font: state.designs.font
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectFont: (val) => dispatch( selectFont(val) )
})


export default connect(mapStateToProps, mapDispatchToProps)(Fonts)
