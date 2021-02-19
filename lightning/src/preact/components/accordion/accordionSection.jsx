import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class AccordionSection extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const {
            className,
            name,
            label,
            actions,
            children,
        } = this.getPropValues();

        return (
            <div className={ className }>{ children }</div>
        );
    }
}

AccordionSection.propTypes = {
    className: PropTypes.isString('className'),
    name: PropTypes.isString('name').required(),
    label: PropTypes.isString('label'),
    actions: PropTypes.isObject('actions'),
    children: PropTypes.isChildren('children'),
};

AccordionSection.displayName = "AccordionSection";
