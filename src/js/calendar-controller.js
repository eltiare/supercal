/* Open-sourced licensed MIT 2017 by Jeremy Nicoll
 * look for updated code at http://github.com/eltiare */

import React from 'react';
import TimeDial from 'time-dial';
import Calendar from './calendar';
import PropTypes from 'prop-types';
import Component from './component';

export default class CalendarController extends Component {

  static proptypes = {
    displayMonth: PropTypes.oneOfType([
      PropTypes.instanceOf(TimeDial),
      PropTypes.instanceOf(Date)
    ])
  }

  constructor(props) {
    super(...arguments);
    this._bindFunctions('next', 'prev', '_keyListener', '_onDayHover',
      '_onDaySelect', '_onDayHoverOut', '_resizeListener');
    this.state = this._stateFromProps(props);
  }

  componentWillReceiveProps(newProps) {
    this.setState( this._stateFromProps(newProps, this.props) );
  }

  componentDidMount() {
    this.refs.calendar.addEventListener('keydown', this._keyListener);
    window.addEventListener('resize', this._resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener);
  }

  componentDidUpdate(prevProps, prevState) {
    let { prevMonth, displayMonth } = this.state;
    let prevTime = prevMonth && prevMonth.getTime();
    let changed = prevTime != (
        prevState.prevMonth && prevState.prevMonth.getTime() );
    if ( prevMonth && changed ) {
      let currentTime = displayMonth.getTime();
      let { prevMonths, currentMonths, container } = this.refs;
      let sideMove = container.clientWidth + 5;
      this._withoutTransitions([currentMonths, prevMonths], () => {
        currentMonths.style.top = 0;
        currentMonths.style.left = ( prevTime < currentTime ? sideMove : -sideMove ) + 'px';
      });
      currentMonths.addEventListener('transitionend', (e) => {
        // wtf, React. Quit reusing this div for another ref
        if (prevMonths) prevMonths.style.left = 0;
        this.setState({ prevMonth: null });
      });
      currentMonths.style.left = 0;
      prevMonths.style.left = ( prevTime < currentTime ? -sideMove : sideMove ) + 'px';
      container.style.height = currentMonths.clientHeight + 'px';
    }
  }

  next(e) {
    e && e.preventDefault();
    this._alterDisplay( m => m.add(this.props.numberOfMonths || 1, 'months') );
    return false;
  }

  prev(e) {
    e && e.preventDefault();
    this._alterDisplay( m => m.subtract(this.props.numberOfMonths || 1, 'months') );
    return false;
  }

  render() {
    let { numberOfMonths, onFocus, onBlur } = this.props;
    let { displayMonth, prevMonth } = this.state;
    let months = [], prevMonths = [], monthsContainers;

    for (let i=1; i <= ( numberOfMonths || 1 ); i++) {
      months.push( this._constructMonth(displayMonth) );
      displayMonth = displayMonth.add(1, 'month');
      if (prevMonth) {
        prevMonths.push( this._constructMonth(prevMonth) );
        prevMonth = prevMonth.add(1, 'month');
      }
    }

    return <div className="Supercal" ref="calendar" tabindex="0"
          onFocus={ onFocus } onBlur={ onBlur }>
      <div className="Supercal-nav">
        <div className="Supercal-prev" onClick={ this.prev }>Prev</div>
        <div className="Supercal-next" onClick={ this.next }>Next</div>
      </div>
      <div className="Supercal-month-container" ref="container">
        { prevMonth ? [
          <div className="Supercal-prev-months" ref="prevMonths">{ prevMonths }</div>,
          <div className="Supercal-current-months" ref="currentMonths">{ months }</div>,
          <div className="Supercal-placeholder-months">{ prevMonths }</div>
        ] : <div ref="staticMonths" className="Supercal-static-months">{ months }</div> }
      </div>
    </div>;
  }

  // Private functions, do not use as they are not guaranteed to be stable across versions

  _resizeListener(e) {
    let { onResize } = this.props;
    let { currentMonths, container , staticMonths } = this.refs;
    if ( Array.isArray(onResize) ) { onResize.forEach( (fun) => fun(e) ) }
      else if ( onResize ) { onResize(e); }
    container.style.height = ''; container.offsetHeight; // Reset, reflow
    container.style.height = (currentMonths || staticMonths).offsetHeight + 'px';
  }

  _stateFromProps(props, oldProps) {
    let ret = {};
    if ( ( props.displayMonth && !props.displayMonth.eq(oldProps.displayMonth) ) ||
         ( !props.displayMonth && !this.state.displayMonth ) )
      ret.displayMonth = new TimeDial(props.displayMonth).startOf('month');
    if ( ( props.currentDay && !props.currentDay.eq(oldProps.currentDay) ) ||
         ( !props.currentDay && !this.state.currentDay ) )
         ret.currentDay = new TimeDial(props.currentDay).startOf('day');
    return ret;
  }

  _constructMonth(timeDial) {
    let { renderDay, showOutOfMonthDays } = this.props;
    return <Calendar
              displayMonth={ timeDial }
              onDayHover={ this._onDayHover }
              onDayHoverOut={ this._onDayHoverOut }
              onDaySelect={ this._onDaySelect }
              renderDay={ renderDay }
              showOutOfMonthDays= { showOutOfMonthDays }
              />;
  }

  _alterDisplay(fun) {
    let { displayMonth } = this.state;
    this.setState({
      displayMonth: fun(displayMonth),
      prevMonth: displayMonth
    });
  }

  _withoutTransitions(eles, fun) {
    if (!Array.isArray(eles)) eles = [eles];
    let transitions = [], ele, i;
    for (i=0; ele = eles[i]; i++) {
      transitions.push(ele.style.transition);
      ele.style.transition = 'none !important'; ele.offsetHeight;
    }
    fun(eles);
    for(i=0; ele = eles[i]; i++) {
      ele.style.transition = transitions[i]; ele.offsetHeight;
    }
  }

  _keyListener(e) {
    let { currentDay, hoverDay } = this.state;
    let numberOfMonths = this.props.numberOfMonths || 1;
    hoverDay = hoverDay || currentDay;
    if ( this._dayInDisplay(hoverDay) !== 0 ) {
      this._onDayHover(this.state.displayMonth, e);
      return;
    }
    let listeners = {
      32: () => { this._onDaySelect(hoverDay, e); return false }, // Spacebar
      33: () => { hoverDay = hoverDay.subtract(numberOfMonths, 'months') }, // Page up
      34: () => { hoverDay = hoverDay.add(numberOfMonths, 'months') }, // Page down
      35: () => { hoverDay = hoverDay.add(1, 'month'); }, // End of line
      36: () => { hoverDay.subtract(1, 'month') }, // Start of line
      37: () => { hoverDay = hoverDay.subtract(1, 'day') }, // Left arrow
      38: () => { hoverDay = hoverDay.subtract(1, 'week') }, // Up arrow
      39: () => { hoverDay = hoverDay.add(1, 'day') }, // Right arrow
      40: () => { hoverDay = hoverDay.add(1, 'week') } // Down arrow
    }
    if(listeners[e.keyCode]) {
      e.preventDefault();
      if (listeners[e.keyCode]() !== false) this._onDayHover(hoverDay, e);
    }
  }

  _onDaySelect(day, e) {
    if (!this.props.showOutOfMonthDays && this._dayInDisplay(day) !== 0) return;
    clearTimeout(this._hoverTimeout);
    this.setState({ currentDay: day, hoverDay: null }, () => {
      if (this.props.onDaySelect) this.props.onDaySelect(day, e);
      this._ensureDayInDisplay(day);
    });
  }

  _onDayHover(day, e) {
    clearTimeout(this._hoverTimeout);
    this.setState({ hoverDay: day }, () => {
      this.props.onDayHover && this.props.onDayHover(day, e);
      e.type != 'mouseover' && this._ensureDayInDisplay(day);
    })
  }

  _onDayHoverOut(day, e) {
    const stateListener = () => {
      if (this.props.onDayHoverOut) this.props.onDayHoverOut(day, e);
    };
    const timeoutListener = () => {
      this.setState({ hoverDay: null }, stateListener);
    };
    clearTimeout(this._hoverTimeout);
    this._hoverTimeout = setTimeout(timeoutListener, 100);
  }

  _dayInDisplay(day) {
    let { displayMonth } = this.state;
    let { numberOfMonths } = this.props;
    let endMonth = displayMonth.add( (numberOfMonths || 1) - 1, 'months').endOf('month');
    if ( day.lt(displayMonth) ) return -1;
    if ( day.gt(endMonth) ) return 1;
    return 0;
  }

  _ensureDayInDisplay(day) {
    switch( this._dayInDisplay(day) ) {
      case -1: this.prev(); break;
      case 1: this.next(); break;
    }
  }

}
