import React, { Component } from 'react';
import { connect } from 'react-redux'
import { activeAccordin } from '../../store/actions'
import { Select2 } from "select2-react-component";

import Arrow from '../../assets/images/icon-arrow.svg'

class AccordionSection extends Component {
  onClick = () => {
    this.props.onClick(this.props.label);
    this.props.activeAccordin(this.props.parent, this.props.label)
  };

  render() {
    const {
      onClick,
      props: { isOpen, label },
    } = this;

    return (
      // <div className={`cjd-accordin ${isOpen ? 'cjd-accordin-open' : 'cjd-accordin-close'}`}>
      //   <div onClick={onClick} className="cjd-label-wrapper" style={{ cursor: 'pointer' }}>
      //     {label}
      //     <div className={`cjd-icon-wrapper ${isOpen ? 'cjd-expanded' : 'cjd-collapsed'}`}>
      //       {/* <img src={Arrow} alt={label} /> */}
      //       <span className='cjd-round-span'>
      //             {/* <CartIcon fill={'#ff9503'}></CartIcon> */}
      //             <img src={Arrow} alt={label} />
      //       </span>
      //     </div>
      //   </div>
      //   {isOpen && (
      //     <div className="cjd-accordin-wrapper">
      //       {this.props.children}
      //     </div>
      //   )}
      // </div>

      // <div>
      //   <label className='select-label'>{label} </label>
      //   <select name="body" required="required" class="form-control select2 hide select2-hidden-accessible" data-select2-id="select2-data-1-qg8d" tabindex="-1" aria-hidden="true">
      //     <option value="" data-select2-id="select2-data-91-gbj5">Select</option>
      //     <option data-select2-id="select2-data-92-r30e">Cowhide Leather</option>
      //     <option data-select2-id="select2-data-93-fad4">Sheep Leather</option>
      //     <option data-select2-id="select2-data-94-4yzj">Faux Leather</option>
      //     <option data-select2-id="select2-data-95-t8em">Melton Wool</option>
      //     <option data-select2-id="select2-data-3-lth1">Cotton Fleece</option>
      //     <option data-select2-id="select2-data-96-jx7b">Cotton Twill</option>
      //     <option data-select2-id="select2-data-97-8ami">Polyester Satin</option>
      //     <option data-select2-id="select2-data-98-50gx">Softshell</option>
      //     <option data-select2-id="select2-data-99-yf98">Nylon</option>
      //   </select>

      //   <span class="select2 select2-container select2-container--default select2-container--below select2-container--focus" dir="ltr" data-select2-id="select2-data-2-inhx" style={{ width: "307.792px" }}>
      //     <span class="selection">
      //       <span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-disabled="false" aria-labelledby="select2-body-1o-container" aria-controls="select2-body-1o-container">
      //         <span class="select2-selection__rendered" id="select2-body-1o-container" role="textbox" aria-readonly="true" title="Cotton Fleece">Cotton Fleece</span>
      //         <span class="select2-selection__arrow" role="presentation"><b role="presentation"></b>
      //         </span>
      //       </span>
      //     </span>
      //     <span class="dropdown-wrapper" aria-hidden="true">
      //     </span>
      //   </span>

      //   <span class="select2-container select2-container--default select2-container--open" style={{ position: "absolute" }}>
      //     <span class="select2-dropdown select2-dropdown--below" dir="ltr" style={{ width: "307.792px" }}>
      //       <span class="select2-search select2-search--dropdown select2-search--hide">
      //         {/* <input class="select2-search__field" type="search" tabindex="0" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" autocomplete="off" aria-label="Search" aria-controls="select2-body-1o-results" aria-activedescendant="select2-body-1o-result-knq8-Sheep Leather" /> */}
      //         </span>
      //       <span class="select2-results">
      //         <ul class="select2-results__options" role="listbox" id="select2-body-1o-results" aria-expanded="true" aria-hidden="false">
      //           <li class="select2-results__option select2-results__option--selectable" role="option" data-select2-id="select2-data-107-fla6" aria-selected="false">Select</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-3c43-Cowhide Leather" role="option" data-select2-id="select2-data-select2-body-1o-result-3c43-Cowhide Leather" aria-selected="false">Cowhide Leather</li>
      //           <li class="select2-results__option select2-results__option--selectable select2-results__option--highlighted" id="select2-body-1o-result-knq8-Sheep Leather" role="option" data-select2-id="select2-data-select2-body-1o-result-knq8-Sheep Leather" aria-selected="true">Sheep Leather</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-uhe0-Faux Leather" role="option" data-select2-id="select2-data-select2-body-1o-result-uhe0-Faux Leather" aria-selected="false">Faux Leather</li>
      //           <li class="select2-results__option select2-results__option--selectable select2-results__option--selected" id="select2-body-1o-result-er1t-Melton Wool" role="option" data-select2-id="select2-data-select2-body-1o-result-er1t-Melton Wool" aria-selected="false">Melton Wool</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-2141-Cotton Fleece" role="option" data-select2-id="select2-data-select2-body-1o-result-2141-Cotton Fleece" aria-selected="false">Cotton Fleece</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-rtq7-Cotton Twill" role="option" data-select2-id="select2-data-select2-body-1o-result-rtq7-Cotton Twill" aria-selected="false">Cotton Twill</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-z206-Polyester Satin" role="option" data-select2-id="select2-data-select2-body-1o-result-z206-Polyester Satin" aria-selected="false">Polyester Satin</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-j5ca-Softshell" role="option" data-select2-id="select2-data-select2-body-1o-result-j5ca-Softshell" aria-selected="false">Softshell</li>
      //           <li class="select2-results__option select2-results__option--selectable" id="select2-body-1o-result-xd54-Nylon" role="option" data-select2-id="select2-data-select2-body-1o-result-xd54-Nylon" aria-selected="false">Nylon</li>
      //         </ul>
      //       </span>
      //     </span>
      //   </span>
      // </div>
      <>
      {/* <p>{this.props.children}</p> */}
        {/* <Select2 data={this.props.children}
          value={''}
          update={value => this.update(value)}>
        </Select2> */}
      </>
    );
  }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = (dispatch) => ({
  activeAccordin: (par, cur) => dispatch(activeAccordin(par, cur))
})


export default connect(mapStateToProps, mapDispatchToProps)(AccordionSection);