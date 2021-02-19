import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class BottomNavigationItem extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        return (
            <div></div>
        );
    }
}

BottomNavigationItem.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    id: PropTypes.isString('id').required(),
    iconName: PropTypes.isString('iconName').defaultValue('utility:touch_action'),
    iconClass: PropTypes.isString('iconClass'),
    label: PropTypes.isString('label').required(),
    children: PropTypes.isChildren('children'),
};

BottomNavigationItem.propTypesRest = true;
BottomNavigationItem.displayName = "BottomNavigationItem";
