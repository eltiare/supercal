import React from 'react';
import Component from './component';
import CalendarController from './calendar-controller';
import Calendar from './calendar';

export default class SingleDatePicker extends Component {

  get passPropsToState() { return [ 'selectedDay' ]; }

  constructor(props) {
    super(props);
    this._bindFunctions('_onDaySelect', '_onDayHover', '_onDayHoverOut', '_renderDay');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(props) {
    this.setState( this._stateFromProps(props, this.props) );
  }

  render() {
    let { onDaySelect, onDayHover, onDayHoverOut, dayClasses, ... other } = this.props;
    return <CalendarController
      { ... other }
      onDaySelect={ this._onDaySelect }
      onDayHover={ this._onDayHover }
      onDayHoverOut={ this._onDayHoverOut }
      renderDay={ this._renderDay }
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

  _renderDay(day) {
    let { renderDay } = this.props;
    let { selectedDay, hoverDay } = this.state;
    let obj = Calendar.normalizeDayResponse(renderDay && renderDay(day) );
    obj.classes = obj.classes || [];
    if ( day.eq(selectedDay) ) obj.classes.push('Supercal-day-selected');
    if ( day.eq(hoverDay) ) obj.classes.push('Supercal-day-hover');
    return obj;
  }

}
