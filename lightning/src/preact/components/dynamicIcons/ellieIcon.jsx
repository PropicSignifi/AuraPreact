import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class EllieIcon extends BaseComponent {
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
            <span className={ window.$Utils.classnames(
                'slds-icon-ellie',
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
                <svg viewBox="0 0 280 14" aria-hidden="true">
                    <circle cx="7" cy="7" r="4" />
                    <circle cx="7" cy="7" r="3" />
                    <circle cx="21" cy="7" r="4" />
                    <circle cx="21" cy="7" r="3" />
                    <circle cx="35" cy="7" r="4" />
                    <circle cx="35" cy="7" r="3" />
                    <circle cx="49" cy="7" r="4" />
                    <circle cx="49" cy="7" r="3" />
                    <circle cx="63" cy="7" r="4" />
                    <circle cx="63" cy="7" r="3" />
                    <circle cx="77" cy="7" r="4" />
                    <circle cx="77" cy="7" r="3" />
                    <circle cx="91" cy="7" r="4" />
                    <circle cx="91" cy="7" r="3" />
                    <circle cx="105" cy="7" r="4" />
                    <circle cx="105" cy="7" r="3" />
                    <circle cx="119" cy="7" r="4" />
                    <circle cx="119" cy="7" r="3" />
                    <circle cx="133" cy="7" r="4" />
                    <circle cx="133" cy="7" r="3" />
                    <circle cx="147" cy="7" r="4" />
                    <circle cx="147" cy="7" r="3" />
                    <circle cx="161" cy="7" r="4" />
                    <circle cx="161" cy="7" r="3" />
                    <circle cx="175" cy="7" r="4" />
                    <circle cx="175" cy="7" r="3" />
                    <circle cx="189" cy="7" r="4" />
                    <circle cx="189" cy="7" r="3" />
                    <circle cx="203" cy="7" r="4" />
                    <circle cx="203" cy="7" r="3" />
                    <circle cx="217" cy="7" r="4" />
                    <circle cx="217" cy="7" r="3" />
                    <circle cx="231" cy="7" r="4" />
                    <circle cx="231" cy="7" r="3" />
                    <circle cx="245" cy="7" r="4" />
                    <circle cx="245" cy="7" r="3" />
                    <circle cx="259" cy="7" r="4" />
                    <circle cx="259" cy="7" r="3" />
                    <circle cx="273" cy="7" r="4" />
                    <circle cx="273" cy="7" r="3" />
                </svg>
                <span className="slds-assistive-text">{ title }</span>
            </span>
        );
    }
}

EllieIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    active: PropTypes.isBoolean('active').defaultValue(true).demoValue(true),
    title: PropTypes.isString('title').demoValue(''),
};

EllieIcon.propTypesRest = true;
EllieIcon.displayName = "EllieIcon";
