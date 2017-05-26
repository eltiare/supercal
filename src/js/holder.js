import React from 'react';
import ReactDOM from 'react-dom';
import Component from './component';

export class HolderComponent extends Component {

  get passPropsToState() { return ['show']; }

  constructor(props) {
    super(props);
    this._bindFunctions('open', 'close', '_reposition');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(newProps) {
    this.setState( this._stateFromProps(newProps, this.props) );
  }

  componentDidMount() {
    this._handleTransitions();
    this._reposition();
  }

  componentDidUpdate(prevProps, prevState) {
    this._handleTransitions(prevState);
    this._reposition();
  }

  open() { this.setState({ show: true }); }

  close() { this.setState({ show: false }); }

  toggle() { this.setState({ show: !this.state.show }); }

  render() {
    const { show } = this.state;
    const { html, children, modal, popupClass } = this.props;
    const modalClasses = this.props.modalClasses || {};
    const contentOpts = html ?
      { dangerouslySetInnerHTML : { __html: html } } : { children };
    if (modal) {
      return <div className={ modalClasses.container || 'Holder-modal-container' } ref="container">
        <div ref="overlay" className={ modalClasses.overlay || 'Holder-modal-overlay' }
          onClick={ this.close } />
        <div className={ modalClasses.content || 'Holder-modal-content '} ref="content"
          { ... contentOpts } />
      </div>;
    } else {
      return <div className={ popupClass || 'Holder-popup' } ref="container"
        { ... contentOpts } />;
    }
  }

  _handleTransitions(prevState = {}) {
    if (prevState.show == this.state.show) return;
    let { container } = this.refs;
    let { showClass, hideTransitionClass } = this.props;
    let sc = showClass || 'Holder-show',
      htc = hideTransitionClass || 'Holder-hide-transition',
      cl = container.classList;
    const listener = (e) => {
      container.removeEventListener('transitionend', listener);
      cl.remove(htc);
    };
    if (this.state.show) {
      cl.add(sc);
    } else {
      container.addEventListener('transitionend', listener);
      cl.remove(sc);
      cl.add(htc);
    }
  }

  _reposition() {
    let { modal, anchorElement, popupPadding, universalPositioning } = this.props;
    let { show } = this.state;
    let { container } = this.refs;
    if (modal || !show) return;
    let bottom, left;
    if (universalPositioning) {
      let bcr = anchorElement.getBoundingClientRect();
      bottom = bcr.bottom + ( window.scrollY || window.pageYOffset );
      left = bcr.left + ( window.scrollX || window.pageXOffset );
    } else {
      bottom = anchorElement.offsetTop + anchorElement.offsetHeight;
      left = anchorElement.offsetLeft;
    }
    container.style.top = `calc(${ bottom }px + ${ popupPadding || '5px' })`;
    container.style.left = left + 'px';
  }

}

let div;
export default function holder(props) {
  if (!div) {
    div = document.createElement('div');
    document.body.appendChild(div);
  }
  return ReactDOM.render( <HolderComponent { ... props } universalPositioning={ true } />, div );
}
