import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class StrengthIcon extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            active,
            strength,
            title,
        }, rest] = this.getPropValues();

        return (
            <span
                className={ window.$Utils.classnames(
                'slds-icon-strength',
                {
                    'slds-is-animated': active,
                    'slds-is-paused': !active,
                },
                className
                ) }
                data-slds-strength={ strength }
                title={ title }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <svg viewBox="0 0 27 7" aria-hidden="true">
                    <circle r="3.025" cx="3.5" cy="3.5" />
                    <circle r="3.025" cx="13.5" cy="3.5" />
                    <circle r="3.025" cx="23.5" cy="3.5" />
                </svg>
                <span className="slds-assistive-text">{ title }</span>
            </span>
        );
    }
}

StrengthIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    active: PropTypes.isBoolean('active').defaultValue(true).demoValue(true),
    title: PropTypes.isString('title').demoValue(''),
    strength: PropTypes.isNumber('strength').defaultValue(0).demoValue(0),
};

StrengthIcon.propTypesRest = true;
StrengthIcon.displayName = "StrengthIcon";
