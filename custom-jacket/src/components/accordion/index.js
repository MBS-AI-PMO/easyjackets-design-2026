import React, { Component } from 'react';
import { connect } from 'react-redux';

import { openSection } from '../../store/actions';
import AccordionSection from './section';
//import './accordin.scss';
import '../../css/components/Accordion/accordin.scss';

class Accordion extends Component {
  constructor(props) {
    super(props);

    const openSections = {};

    // this.props.children.filter(Boolean).forEach(child => {
    //   if (child.props.isOpen) {
    //     openSections[child.props.label] = true;
    //   }
    // });

    this.state = { openSections };
  }

  onClick = label => {
    const {
      props: { allowMultipleOpen },
      state: { openSections },
    } = this;

    const isOpen = !!openSections[label];

    if (allowMultipleOpen) {
      this.setState({
        openSections: {
          ...openSections,
          [label]: !isOpen
        }
      });
    } else {
      this.setState({
        openSections: {
          [label]: !isOpen
        }
      });
    }
  };

  render() {
    const {
      onClick,
      props: { children },
      state: { openSections },
    } = this;

    return (
      // children.filter(Boolean).map(child => (
      //   <AccordionSection
      //     parent={child.props.parent}
      //     isOpen={!!openSections[child.props.label]}
      //     label={child.props.label}
      //     onClick={onClick}
      //     key={child.props.label.toLocaleLowerCase()}
      //   >
      //     {child.props.children}
      //   </AccordionSection>
      // ))
      <p>{children}</p>
    );
  }
}

const mapStateToProps = (state) => ({
  styles: state.styles
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  openSection: (title, open) => dispatch( openSection(title, open) )
})

export default connect(mapStateToProps, mapDispatchToProps)(Accordion);