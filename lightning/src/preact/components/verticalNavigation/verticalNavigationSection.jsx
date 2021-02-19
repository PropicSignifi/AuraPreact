import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class VerticalNavigationSection extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        return (
            <div></div>
        );
    }
}

VerticalNavigationSection.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').required(),
    children: PropTypes.isChildren('children'),
};

VerticalNavigationSection.propTypesRest = true;
VerticalNavigationSection.displayName = "VerticalNavigationSection";
