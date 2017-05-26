import React from 'react';

import Component from './component';
import { HolderComponent } from './holder';
import SingleDatePicker from './single-date-picker';
import TimeDial from './time-dial';

export default class SingleDateInput extends Component {

  get passPropsToState() { return ['value']; }

  constructor(props) {
    super(... arguments);
    this._bindFunctions('_inputChange', '_pickerChange', '_inputFocus', '_inputBlur');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(newProps) {
    this.setState( this._stateFromProps(newProps, this.props) );
  }

  render() {
    let { inputName, inputClass, propsShow } = this.props;
    let { show, value, selectedDay } = this.state;
    let input = <input type="text" name={ inputName || 'date' }
      value={ value } onChange={ this.inputChange }
      onFocus={ this.inputFocus } onBlur={ this.inputBlur }
      className={ inputClass || 'Supercal-input' } ref="input" key="input" />;
    return [
      input,
      <HolderComponent show={ propsShow === undefined ? show : propsShow }
          anchorElement={ input } key="holder">
        <SingleDatePicker onDaySelect={ this.pickerChange } />
      </HolderComponent>
    ];
  }

  _inputChange(e) {
    let value = this.refs.input.value, selectedDay;
    if (value) selectedDay = new TimeDial(value, this.props.format || 'YYYY-MM-DD');
    this.setState({ value, selectedDay });
  }

  _pickerChange(day, e) {
    let ret = {
      value: day.format(this.props.format || 'YYYY-MM-DD '),
      selectedDay: day
    };
    if (this.props.show === undefined ) ret.show = false;
    this.setState(ret);
  }

  _inputFocus() {
    if (this.props.show === undefined) this.setState({ show: true });
  }

  _inputBlur() {
    if (this.props.show === undefined) this.setState({ show: false });
  }

}
