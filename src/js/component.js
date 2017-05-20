import React from 'react';

export default class Component extends React.Component {

  get passPropsToState() { return []; }

  _bindFunctions() {
    let arg;
    for (let i=0; arg = arguments[i]; i++) {
      this[arg] = this[arg].bind(this);
    }
  }

  _stateFromProps(newProps, oldProps) {
    let vars = this.passPropsToState, p;
    let newState = {};
    oldProps = oldProps || {};
    for (let i=0; p = vars[i]; i++) {
      if (newProps[p] !== oldProps[p]) newState[p] = newProps[p];
    }
    this.setState(newState);
  }

}
