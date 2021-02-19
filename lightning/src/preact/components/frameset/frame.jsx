import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Frame extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        return (
            <div></div>
        );
    }
}

Frame.propTypes = {
    className: PropTypes.isString('className'),
    name: PropTypes.isString('name').required(),
    label: PropTypes.isObject('label'),
    iconName: PropTypes.isString('iconName'),
    row: PropTypes.isNumber('row'),
    column: PropTypes.isNumber('column'),
    minimized: PropTypes.isBoolean('minimized'),
    maximized: PropTypes.isBoolean('maximized'),
    actions: PropTypes.isObject('actions'),
    children: PropTypes.isChildren('children'),
};

Frame.displayName = "Frame";
