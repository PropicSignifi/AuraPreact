import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Tab extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            id,
            label,
            disabled,
            tooltip,
            iconName,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ className } { ...rest }>{ children }</div>
        );
    }
}

Tab.propTypes = {
    className: PropTypes.isString('className'),
    id: PropTypes.isString('id').required(),
    label: PropTypes.isString('label').required(),
    disabled: PropTypes.isBoolean('disabled'),
    tooltip: PropTypes.isString('tooltip'),
    iconName: PropTypes.isIcon('iconName'),
    children: PropTypes.isChildren('children'),
};

Tab.propTypesRest = true;
Tab.displayName = "Tab";
