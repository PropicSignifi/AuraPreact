import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class VerticalNavigationItem extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        return (
            <div></div>
        );
    }
}

VerticalNavigationItem.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').required(),
    id: PropTypes.isString('id').required(),
    iconName: PropTypes.isString('iconName'),
    notification: PropTypes.isString('notification'),
    children: PropTypes.isChildren('children'),
};

VerticalNavigationItem.propTypesRest = true;
VerticalNavigationItem.displayName = "VerticalNavigationItem";
