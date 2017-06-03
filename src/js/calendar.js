import React from 'react';
import PropTypes from 'prop-types';
import Component from './component';

import fecha from 'fecha';
import TimeDial from 'time-dial';

export default class Calendar extends Component {

  static proptypes = {
    displayMonth: PropTypes.instanceOf(TimeDial).isRequired
  }

  static normalizeDayResponse(response) {
    // This will catch null, which is intended here
    return typeof(response) === 'object' ? Object.assign({}, response) :
      { content: response };
  }

  constructor() {
    super(...arguments);
    this._bindFunctions('_getListener', '_renderDay');
  }

  get i18n() {
    return this.props.i18n || fecha.i18n;
  }

  computeWeeks(date) {
    let { renderDayStart, renderDayEnd } = this.props;
    renderDayStart && renderDayStart();
    let currentDay = date.startOf('month');
    let weeks = [[]], i, startWeekDay = currentDay.getDay(), weekCount = 0;
    let { showOutOfMonthDays } = this.props;
    for (i=0; i < 7; i++) {
      if (i < startWeekDay) {
        let day = currentDay.subtract(startWeekDay - i, 'days');
        let props = showOutOfMonthDays ? this._renderDay(day) : {};
        weeks[weekCount][i] = { ... props, inMonth: false, object: day };
      } else {
        weeks[weekCount][i] = { ... this._renderDay(currentDay), inMonth: true, object: currentDay };
        currentDay = currentDay.add(1, 'day');
      }
    }
    let endOfMonth = false;
    while( !endOfMonth ) {
      weekCount += 1;
      weeks[weekCount] = [];
      for(i=0; i < 7; i++) {
        if (!endOfMonth && currentDay.getDate() == 1) {
          endOfMonth = true;
          if (i == 0) break;
        }
        if (showOutOfMonthDays || !endOfMonth) {
          weeks[weekCount][i] = {
            ... this._renderDay(currentDay),
            inMonth: !endOfMonth,
            object: currentDay
          };
        } else if (!showOutOfMonthDays && endOfMonth) {
          weeks[weekCount][i] = { inMonth: false, object: currentDay }
        }
        currentDay = currentDay.add(1, 'day');
      }
    }
    renderDayEnd && renderDayEnd();
    return weeks;
  }

  render() {
    let { displayMonth } = this.props;
    let weeks = this.computeWeeks( displayMonth );

    return <div className="Supercal-month">
      <div className="Supercal-month-title">{ this.i18n.monthNames[ displayMonth.getMonth() ] }, { displayMonth.getFullYear() }</div>
      <table>
        <thead><tr>
          { this.i18n.dayNamesShort.map( dn => <th>{dn}</th> ) }
        </tr></thead>
        <tbody>
          { weeks.map( week  => <tr>
              { week.map(day => {
                let c = [];
                if (!day.inMonth && this.props.showOutOfMonthDays)
                  c.push('Supercal-out-of-month');
                else if (day.inMonth)
                  c.push('Supercal-in-month');
                if (day.disabled) c.push('Supercal-disabled');
                let classes = classNames( day.classes, c );
                return <td
                    className={ classes }
                    onClick={ this._getListener('onDaySelect', day) }
                    onMouseOver={ this._getListener('onDayHover', day) }
                    onMouseOut={ this._getListener('onDayHoverOut', day) }>
                  { day.content }
                </td>;
              } ) }
            </tr>
          ) }
        </tbody>
      </table>
    </div>;
  }

  _renderDay(day) {
    let { renderDay } = this.props, obj;
    obj = Calendar.normalizeDayResponse( renderDay && renderDay(day) );
    if (obj.content === false) obj.content = null;
    else if (!obj.content) obj.content = day.getDate();
    obj.classNames = obj.classNames || [];
    return obj;
  }

  _getListener(name, day) {
    return this.props[name] && !day.disabled ?
      e => this.props[name](day.object, e) : null;
  }

}

function classNames() {
  return [].slice.call(arguments).map( cn =>
    Array.isArray(cn) ? classNames.apply(this, cn) : cn
  ).join(' ');
}
