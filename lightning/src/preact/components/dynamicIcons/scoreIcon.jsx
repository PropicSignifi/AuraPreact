import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class ScoreIcon extends BaseComponent {
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
        const propState = this.prop('state');

        return (
            <span
                data-slds-state={ propState }
                class={ `slds-icon-score ${className}` }
                title={ title }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <svg viewBox="0 0 5 5" className="slds-icon-score__positive" aria-hidden="true">
                    <circle cx="50%" cy="50%" r="1.875" />
                </svg>
                <svg viewBox="0 0 5 5" className="slds-icon-score__negative" aria-hidden="true">
                    <circle cx="50%" cy="50%" r="1.875" />
                </svg>
                <span className="slds-assistive-text">{ title }</span>
            </span>
        );
    }
}

ScoreIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    state: PropTypes.isString('state').values([
        'positive',
        'negative',
    ]).defaultValue('positive').demoValue('positive'),
    title: PropTypes.isString('title').demoValue(''),
};

ScoreIcon.propTypesRest = true;
ScoreIcon.displayName = "ScoreIcon";
