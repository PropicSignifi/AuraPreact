import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class TrendIcon extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            active,
            trend,
            title,
        }, rest] = this.getPropValues();

        return (
            <span
                className={ window.$Utils.classnames(
                "slds-icon-trend",
                {
                    'slds-is-animated': active,
                    'slds-is-paused': !active,
                },
                className
                ) }
                data-slds-trend={ trend }
                title={ title }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path className="slds-icon-trend__arrow" d="M.75 8H11M8 4.5L11.5 8 8 11.5" />
                    <circle className="slds-icon-trend__circle" cy="8" cx="8" r="7.375" transform="rotate(-28 8 8) scale(-1 1) translate(-16 0)" />
                </svg>
                <span className="slds-assistive-text">{ title }</span>
            </span>
        );
    }
}

TrendIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    active: PropTypes.isBoolean('active').defaultValue(true).demoValue(true),
    title: PropTypes.isString('title').demoValue(''),
    trend: PropTypes.isString('trend').values([
        'neutral',
        'up',
        'down',
    ]).defaultValue('neutral').demoValue('neutral'),
};

TrendIcon.propTypesRest = true;
TrendIcon.displayName = "TrendIcon";
