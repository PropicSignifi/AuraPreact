import { h, render, Component } from 'preact';
import AbstractField from './field';
import PropTypes from '../propTypes/propTypes';

export default class ComponentField extends AbstractField {
    constructor() {
        super();
    }

    renderField(props, state, variables) {
        const [{
            value,
            children,
        }, rest] = this.getPropValues();

        if(!_.isEmpty(children)) {
            return (
                <div { ...rest }>{ children }</div>
            );
        }
        else {
            return (
                <div { ...rest }>
                    { value }
                </div>
            );
        }
    }
}

ComponentField.propTypes = PropTypes.extend(AbstractField.propTypes, {
    children: PropTypes.isChildren('children'),
});

ComponentField.propTypes.name.demoValue('componentField');
ComponentField.propTypes.label.demoValue('Component Field');

ComponentField.propTypesRest = true;
ComponentField.displayName = "ComponentField";
