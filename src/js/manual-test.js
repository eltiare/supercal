import * as stuff from './supercal.js';
import React from 'react';
import ReactDOM from 'react-dom';

window.renderComponent = (ele, name, props, callback) => {
  let comp = React.createElement(stuff[name], props || {});
  return ReactDOM.render(comp, ele, callback);
};

window.getClass = (name) => {
  return stuff[name];
}
