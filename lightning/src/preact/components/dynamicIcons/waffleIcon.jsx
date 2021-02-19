import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class WaffleIcon extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            title,
        }, rest] = this.getPropValues();

        return (
            <button
                className={ `slds-button slds-icon-waffle_container ${className}` }
                title={ title }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <span className="slds-icon-waffle">
                    <span className="slds-r1"></span>
                    <span className="slds-r2"></span>
                    <span className="slds-r3"></span>
                    <span className="slds-r4"></span>
                    <span className="slds-r5"></span>
                    <span className="slds-r6"></span>
                    <span className="slds-r7"></span>
                    <span className="slds-r8"></span>
                    <span className="slds-r9"></span>
                </span>
                <span className="slds-assistive-text">{ title }</span>
            </button>
        );
    }
}

WaffleIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').demoValue(''),
};

WaffleIcon.propTypesRest = true;
WaffleIcon.displayName = "WaffleIcon";
