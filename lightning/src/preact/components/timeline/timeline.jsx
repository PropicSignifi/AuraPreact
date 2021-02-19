import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Timeline extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            children,
        }, rest] = this.getPropValues();
        return (
            <ul className={ window.$Utils.classnames('slds-timeline', className) } data-type={ this.getTypeName() } { ...rest }>
                { children }
            </ul>
        );
    }
}

Timeline.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    children: PropTypes.isChildren('children'),
};

Timeline.propTypesRest = true;
Timeline.displayName = "Timeline";
