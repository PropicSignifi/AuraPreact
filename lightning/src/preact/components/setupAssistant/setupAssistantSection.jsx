import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class SetupAssistantSection extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const {
            className,
            children,
        } = this.getPropValues();

        return (
            <div className={ className }>{ children }</div>
        );
    }
}

SetupAssistantSection.propTypes = {
    className: PropTypes.isString('className'),
    name: PropTypes.isString('name').required(),
    label: PropTypes.isString('label'),
    description: PropTypes.isString('description'),
    skippable: PropTypes.isBoolean('skippable'),
    disabled: PropTypes.isBoolean('disabled'),
    toggleLabel: PropTypes.isString('toggleLabel'),
    isCompleted:  PropTypes.isBoolean('isCompleted'),
    children: PropTypes.isChildren('children'),
};

SetupAssistantSection.displayName = "SetupAssistantSection";
