import React from 'react';

import Component from './component';
import Arise from 'react-arise';
import SingleDatePicker from './single-date-picker';
import TimeDial from 'time-dial';

export default class SingleDateInput extends Component {

  get passPropsToState() { return ['selectedDay', 'value']; }

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
    let { inputName, inputClass, modal,  ... passProps } = this.props;
    let { show, selectedDay, value } = this.state;
    value = value || ( selectedDay && selectedDay.format(this.props.format || 'YYYY-MM-DD') );
    let input = <input type="text" name={ inputName || 'date' }
      value={ value } onChange={ this.inputChange }
      onFocus={ this._inputFocus } onBlur={ this._inputBlur }
      className={ inputClass || 'Supercal-input' } ref="input" key="input" />;
    return <div class="Supercal-single-picker-input">
      { input }
      <Arise show={ this.props.show === undefined ? show : this.props.show }
          anchorElement={ input } key="holder" modal={ modal }>
        <SingleDatePicker { ... passProps } onDaySelect={ this._pickerChange }
          onFocus={ this._pickerFocus } onBlur={ this._inputBlur }  />
      </Arise>
    </div>;
  }

  _inputChange(e) {
    let value = this.refs.input.value, selectedDay;
    if (value) selectedDay = new TimeDial(value, this.props.format || 'YYYY-MM-DD');
    this.setState({ value, selectedDay });
  }

  _pickerChange(day, e) {
    this.setState({
      value: day.format(this.props.format || 'YYYY-MM-DD '),
      selectedDay: day,
      show: false
    });
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
