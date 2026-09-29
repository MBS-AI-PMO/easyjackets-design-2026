import React, { useState } from 'react'
import { connect } from 'react-redux'
import SelectBox from '../selectBox'
import { ReactComponent as Seniors } from '../../assets/images/badges/seniors.svg'
import { designColor, chooseName } from '../../store/actions'
import { BODY_COLORS } from '../../utils'
//import './editables.scss'
import '../../css/components/Modal/editables.scss';

const Editables = ({ part, designs, colors, updateColor, updateName }) => {
  const [badge, setBadge] = useState(designs[part]?.editables?.path || '')
  const [cPanel, setCpanel] = useState(false)
  const [colPart, setColPart] = useState('fill')
  const [type, setType] = useState(false)
  const [txt1, setTxt1] = useState(designs[part]?.editables?.txt1 || 'WRITE NAME')
  const [txt2, setTxt2] = useState(designs[part]?.editables?.txt2 || 'WRITE NAME')

  const nameFun = (num, val) => {
    if (val.length <= 12) {
      if (num === 1) {
        setTxt1(val)
        updateName('txt1', val, part)
      } else {
        setTxt2(val)
        updateName('txt2', val, part)
      }
    }
  }

  const chooseBadge = (e) => {
    e.preventDefault()
    e.stopPropagation()

    let svg = e.target.innerHTML
    svg = svg.replace('<svg', '<svg width="190" height="190"')

    setBadge(svg)
    updateName('path', svg, part)
  }

  const viewCbox = (val) => {
    (val === colPart && cPanel) ? setCpanel(false) : setCpanel(true)
    setColPart(val)
  }

  return (
    <div className="cjd-modal-form-wrapper">
      <div className="cjd-row">
        <div className="cjd-modal-half">
          <div className="cjd-editables-wrapper">
            <div className="cjd-badge" onClick={(e) => chooseBadge(e)}> <Seniors /> </div>
          </div>
        </div>

        <div className="cjd-modal-half">
          {badge &&
            <div className="cjd-form-group cjd-btn-group" style={{ marginBottom: '20px' }}>
              <div className={`cjd-btn ${type && 'cjd-btn-secondary'}`} onClick={() => setType(false)}>Colors</div>
              <div className={`cjd-btn ${!type && 'cjd-btn-secondary'}`} onClick={() => setType(true)}>Edit Text</div>
            </div>
          }

          <div className="cjd-mock-preview" style={{ background: colors.body }}>
            {badge &&
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" data-viewbox="0 0 190 190" viewBox="0 0 190 190">
                {/* <g dangerouslySetInnerHTML={{ __html: badge }} /> */}
                {badge.match(/(<path.*?>|<text.*?>.*?<\/text>)/g).map((path, idx) => {
                  let pShape, color, pId, tPath
                  const pClass = path.match(/class="(.*?)"/)[1]

                  pId = path.match(/id="(.*?)"/)
                  pId = pId === null ? 'noId' : pId[1]

                  if (path.match(/^<text/) === null) {
                    pShape = path.match(/ d="(.*?)"/)[1]
                  } else {
                    const text = path.match(/<text.*?>(.*?)<\/text>/)[1]
                    tPath = text.match(/xlink:href="(.*?)"/)[1]
                  }

                  if (pClass === 'cjd-fill') {
                    color = designs.fill || '#fff'
                  } else if (pClass === 'cjd-stroke') {
                    color = designs.stroke || '#8089a2'
                  } else if (pClass === 'cjd-none') {
                    color = 'none'
                  } else {
                    color = designs.border || '#525a6f'
                  }

                  return (
                    <g key={idx}>
                      {path.match(/^<text/) ? (
                        <text fontFamily="Franchise-Bold" fontSize="18.3251px" textAnchor="middle" dominantBaseline="middle">
                          <textPath xlinkHref={tPath} startOffset="50%" fill={color}>
                            {tPath === '#upperTextArc' ? txt1 : txt2}
                          </textPath>
                        </text>
                      ) : (
                        <path id={pId} d={pShape} fill={color} />
                      )}
                    </g>
                  )
                })}
              </svg>
            }
          </div>

          {!type ? (
            <div className="cjd-preview-colors-wrapper cjd-multiple" data-color="pink">
              <div className="cjd-color-selector" onClick={() => viewCbox('fill')}>
                <div className="cjd-color-pointer" style={{ backgroundColor: designs.fill }}></div>
                <span>Fill</span>
              </div>

              <div className="cjd-color-selector" onClick={() => viewCbox('stroke')}>
                <div className="cjd-color-pointer" style={{ backgroundColor: designs.stroke }}></div>
                <span>Stroke</span>
              </div>

              <div className="cjd-color-selector" onClick={() => viewCbox('border')}>
                <div className="cjd-color-pointer" style={{ backgroundColor: designs.border }}></div>
                <span>Border</span>
              </div>

              {cPanel &&
                <div className="cjd-color-box">
                  <label className="cjd-note">
                    <span>Select {colPart} Color</span>
                    <div className="cjd-close-color-box" onClick={() => setCpanel(false)}> × </div>
                  </label>

                  <div className="cjd-colors-list">
                    <div className="cjd-select-wrapper cjd-single">

                      {BODY_COLORS.map((col, key) => (
                        <SelectBox
                          key={key}
                          type={colPart}
                          label={col}
                          current={designs[colPart]}
                          colors={true}
                          dispatch={(type, label) => updateColor(type, label)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              }
            </div>
          ) : (
            <div className="cjd-stext-wrapper">
              <div className="cjd-form-group">
                <label htmlFor="txt1">Text 1</label>
                <input type="text" value={txt1} onChange={e => nameFun(1, e.target.value)} className="cjd-form-control" />
              </div>

              <div className="cjd-form-group">
                <label htmlFor="txt2">Text 2</label>
                <input type="text" value={txt2} onChange={e => nameFun(2, e.target.value)} className="cjd-form-control" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  designs: state.designs,
  colors: state.colors,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateColor: (key, val) => dispatch(designColor(key, val)),
  updateName: (key, val, part, font, tab = 'editables') => dispatch(chooseName(key, val, part, font, tab))
})


export default connect(mapStateToProps, mapDispatchToProps)(Editables)