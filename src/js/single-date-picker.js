import React from 'react';
import Component from './component';
import CalendarController from './calendar-controller';

export default class SingleDatePicker extends Component {

  get passPropsToState() { return [ 'selectedDay' ]; }

  constructor(props) {
    super(props);
    this._bindFunctions('_onDaySelect', '_onDayHover', '_onDayHoverOut', '_dayClasses');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(props) {
    this.setState( this._stateFromProps(props, this.props) );
  }

  render() {
    let { onDaySelect, onDayHover, onDayHoverOut, dayClasses, ... other } = this.props;
    return <CalendarController
      onDaySelect={ this._onDaySelect }
      onDayHover={ this._onDayHover }
      onDayHoverOut={ this._onDayHoverOut }
      dayClasses={ this._dayClasses }
      { ... other }
    />;
  }

  _onDaySelect(day, e) {
    let { onDaySelect } = this.props;
    let listener = onDaySelect ? () => onDaySelect(day, e) : null;
    this.setState({ selectedDay: day }, listener);
  }

  _onDayHover(day, e) {
    let { onDayHover } = this.props;
    let listener = onDayHover ? () => onDayHover(day, e) : null;
    this.setState({ hoverDay: day}, listener);
  }

  _onDayHoverOut(day, e) {
    let { onDayHoverOut } = this.props;
    let listener = onDayHoverOut ? () => onDayHoverOut(day, e) : null;
    this.setState({ hoverDay: null }, listener);
  }

  _dayClasses(day) {
    let { selectedDay, hoverDay } = this.state;
    let ret = this.props.dayClasses ? [this.props.dayClasses(day)] : [];
    if ( day.eq(selectedDay) ) ret.push('Supercal-day-selected');
    if ( day.eq(hoverDay) ) ret.push('Supercal-day-hover');
    return ret;
  }

}
