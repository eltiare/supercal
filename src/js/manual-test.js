import * as stuff from './supercal.js';
import TimeDial from 'time-dial';
import React from 'react';
import ReactDOM from 'react-dom';

let classes = { TimeDial };

window.renderComponent = (ele, name, props, callback) => {
  let comp = React.createElement(stuff[name], props || {});
  return ReactDOM.render(comp, ele, callback);
};

window.getClass = (name) => {
  return stuff[name] || classes[name];
}
