import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import styles from './calendar.less';

export default class Calendar extends BaseComponent {
    constructor() {
        super();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentDidMount() {
        window.$Utils.requireLibrary(this.getPreactContainerName(), 'fullcalendar').then(() => {
            const id = this.id();

            const dom = $(document.getElementById(id));
            if(dom.length === 0){
                return;
            }
            // hacking to remove existing calendar
            dom.data('fullCalendar', null);
            const calendar = dom.fullCalendar(this.prop('config')).fullCalendar('getCalendar');
            if(_.isFunction(this.prop('onInit'))) {
                this.prop('onInit')(calendar);
            }
        });
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        const id = this.id();

        return (
            <div className={ className } id={ id } data-type={ this.getTypeName() } { ...rest }></div>
        );
    }
}

Calendar.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    config: PropTypes.isObject('config'),
    onInit: PropTypes.isFunction('onInit'),
};

Calendar.propTypesRest = true;
Calendar.displayName = "Calendar";
