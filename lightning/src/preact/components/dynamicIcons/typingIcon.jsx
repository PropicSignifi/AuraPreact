import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class TypingIcon extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            active,
            title,
        }, rest] = this.getPropValues();

        return (
            <span
                className={ window.$Utils.classnames(
                "slds-icon-typing",
                {
                    'slds-is-animated': active,
                    'slds-is-paused': !active,
                },
                className
                ) }
                title={ title }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <span className="slds-icon-typing__dot"></span>
                <span className="slds-icon-typing__dot"></span>
                <span className="slds-icon-typing__dot"></span>
                <span className="slds-assistive-text">{ title }</span>
            </span>
        );
    }
}

TypingIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    active: PropTypes.isBoolean('active').defaultValue(true).demoValue(true),
    title: PropTypes.isString('title').demoValue(''),
};

TypingIcon.propTypesRest = true;
TypingIcon.displayName = "TypingIcon";
