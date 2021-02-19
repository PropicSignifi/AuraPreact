import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class FormActions extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ `slds-col slds-size_1-of-1 slds-m-top_medium slds-grid slds-wrap ${className}` } { ...rest }>
                { children }
            </div>
        );
    }
}

FormActions.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    children: PropTypes.isChildren('children'),
};

FormActions.propTypesRest = true;
FormActions.displayName = "FormActions";
