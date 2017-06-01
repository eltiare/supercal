import React from 'react';

import Component from './component';
import { HolderComponent } from './holder';
import SingleDatePicker from './single-date-picker';
import TimeDial from './time-dial';

export default class SingleDateInput extends Component {

  get passPropsToState() { return ['value']; }

  constructor(props) {
    super(... arguments);
    this._bindFunctions('_inputChange', '_pickerChange', '_inputFocus',
      '_inputBlur', '_pickerFocus');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(newProps) {
    this.setState( this._stateFromProps(newProps, this.props) );
  }

  render() {
    let { inputName, inputClass, propsShow, modal, ... passProps } = this.props;
    let { show, value, selectedDay } = this.state;
    let input = <input type="text" name={ inputName || 'date' }
      value={ value } onChange={ this.inputChange }
      onFocus={ this._inputFocus } onBlur={ this._inputBlur }
      className={ inputClass || 'Supercal-input' } ref="input" key="input" />;
    return <div class="Supercal-single-picker-input">
      { input }
      <HolderComponent show={ propsShow === undefined ? show : propsShow }
          anchorElement={ input } key="holder" modal={ modal }>
        <SingleDatePicker onDaySelect={ this._pickerChange }
          onFocus={ this._pickerFocus } onBlur={ this._inputBlur } { ... passProps } />
      </HolderComponent>
    </div>;
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
    clearTimeout(this.hiderTimeout);
    if (this.props.show !== undefined) return;
    this.setState({ show: true });
  }

  _inputBlur() {
    clearTimeout(this.hiderTimeout);
    if (this.props.show !== undefined) return;
    this.hiderTimeout = setTimeout( () => this.setState({ show: false }), 50 );
  }

  _pickerFocus() {
    clearTimeout(this.hiderTimeout);
  }

}
