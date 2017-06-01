/* Open-sourced licensed MIT 2017 by Jeremy Nicoll
 * look for updated code at http://github.com/eltiare */

import React from 'react';
import TimeDial from './time-dial';
import Calendar from './calendar';
import PropTypes from 'prop-types';
import Component from './component';

export default class CalendarController extends Component {

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
      this._withoutTransitions(currentMonths, () => {
        currentMonths.style.top = 0;
        currentMonths.style.left = ( prevTime < currentTime ? sideMove : -sideMove ) + 'px';
      });
      currentMonths.addEventListener('transitionend', (e) => {
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
    container.style.height = ( currentMonths || staticMonths ).clientHeight + 'px';
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
    let { dayClasses, renderDay } = this.props;
    return <Calendar
              displayMonth={ timeDial }
              onDayHover={ this._onDayHover }
              onDayHoverOut={ this._onDayHoverOut }
              onDaySelect={ this._onDaySelect }
              dayClasses={ dayClasses }
              renderDay={ renderDay }
              />;
  }

  _alterDisplay(fun) {
    let { displayMonth } = this.state;
    this.setState({
      displayMonth: fun(displayMonth),
      prevMonth: displayMonth
    });
  }

  _withoutTransitions(ele, fun) {
    let transition = ele.style.transition;
    ele.style.transition = 'none !important'; ele.offsetHeight;
    fun(ele);
    ele.style.transition = transition; ele.offsetHeight;
  }

  _keyListener(e) {
    let { currentDay, hoverDay } = this.state;
    let numberOfMonths = this.props.numberOfMonths || 1;
    hoverDay = hoverDay || currentDay;
    if ( this._dayInDisplay(hoverDay) !== 0 ) {
      this._onDayHover(this.state.displayMonth, e);
      return;
    }
    switch(e.keyCode) {
      case 32: // Spacebar
        this._onDaySelect(hoverDay, e);
        return;
      case 33: // Page up
        hoverDay = hoverDay.subtract(numberOfMonths, 'months');
        break;
      case 34: // Page down
        hoverDay = hoverDay.add(numberOfMonths, 'months');
        break;
      case 35: // End of line
        hoverDay = hoverDay.add(1, 'month');
        break;
      case 36:
        hoverDay = hoverDay.subtract(1, 'month');
        break;
      case 37: // Arrow left
        hoverDay = hoverDay.subtract(1, 'day');
        break;
      case 39: // Arrow right
        hoverDay = hoverDay.add(1, 'day');
        break;
      case 38: // Arrow up
        hoverDay = hoverDay.subtract(1, 'week');
        break;
      case 40: // Arrow down
        hoverDay = hoverDay.add(1, 'week');
        break;
    }
    this._onDayHover(hoverDay, e);
  }

  _onDaySelect(day, e) {
    clearTimeout(this._hoverTimeout);
    this.setState({ currentDay: day, hoverDay: null }, () => {
      if (this.props.onDaySelect) this.props.onDaySelect(day, e);
    });
  }

  _onDayHover(day, e) {
    clearTimeout(this._hoverTimeout);
    this.setState({ hoverDay: day }, () => {
      if (this.props.onDayHover) this.props.onDayHover(day, e);
      switch( this._dayInDisplay(day) ) {
        case -1: this.prev(); break;
        case 1: this.next(); break;
      }
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

}

Calendar.proptypes = {
  displayMonth: PropTypes.oneOfType([
    PropTypes.instanceOf(TimeDial),
    PropTypes.instanceOf(Date)
  ])
}
