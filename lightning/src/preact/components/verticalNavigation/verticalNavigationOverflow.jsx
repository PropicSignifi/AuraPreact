import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class VerticalNavigationOverflow extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        return (
            <div></div>
        );
    }
}

VerticalNavigationOverflow.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label'),
    labelWhenCollapsed: PropTypes.isString('labelWhenCollapsed'),
    labelWhenExpanded: PropTypes.isString('labelWhenExpanded'),
    id: PropTypes.isString('id').required(),
    children: PropTypes.isChildren('children'),
};

VerticalNavigationOverflow.propTypesRest = true;
VerticalNavigationOverflow.displayName = "VerticalNavigationOverflow";
