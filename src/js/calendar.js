import React from 'react';
import PropTypes from 'prop-types';
import Component from './component';

import fecha from 'fecha';
import TimeDial from './time-dial';

export default class Calendar extends Component {

  static proptypes = {
    displayMonth: PropTypes.instanceOf(TimeDial).isRequired
  }

  constructor() {
    super(...arguments);
    this._bindFunctions('_getListener', '_renderDay');
  }

  get i18n() {
    return this.props.i18n || fecha.i18n;
  }

  computeWeeks(date) {

    let currentDay = date.startOf('month');
    let weeks = [[]], i, startWeekDay = currentDay.getDay(), weekCount = 0;

    for (i=0; i < 7; i++) {
      if (i < startWeekDay) {
        // TODO: put in code for displaying previous days
        weeks[weekCount][i] = { inMonth: false };
      } else {
        weeks[weekCount][i] = {
          inMonth: true,
          ... this._renderDay(currentDay)
        };
        currentDay = currentDay.add(1, 'day');
      }
    }
    let endOfMonth = false;
    while( currentDay.getDate() > 1 ) {
      weekCount += 1;
      weeks[weekCount] = [];
      for(i=0; i < 7; i++) {
        // TODO: put in code for displaying next days
        if (currentDay.getDate() == 1) {
          endOfMonth = true;
          break;
        }
        weeks[weekCount][i] = {
          inMonth: true,
          ... this._renderDay(currentDay)
        };
        currentDay = currentDay.add(1, 'day');
      }
      for(; i < 7; i++) {
        weeks[weekCount][i] = { inMonth: false };
      }
    }
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
                  let classes = classNames(
                    day.classNames,
                    'Supercal-' + (day.inMonth ? 'in-month' : 'out-of-month')
                  );
                  return <td
                      className={ classes }
                      onClick={ this._getListener('onDaySelect', day.object) }
                      onMouseOver={ this._getListener('onDayHover', day.object) }
                      onMouseOut={ this._getListener('onDayHoverOut', day.object) }
                      >
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
    return {
      content: this.props.renderDay ? this.props.renderDay(day) : day.getDate(),
      classNames: this.props.dayClasses ? this.props.dayClasses(day) : [],
      object: day
    };
  }

  _getListener(name, day) {
    return this.props[name] && day ? e => this.props[name](day, e) : null;
  }

}

function classNames() {
  return [].slice.call(arguments).map( cn =>
    Array.isArray(cn) ? classNames.apply(this, cn) : cn
  ).join(' ');
}
