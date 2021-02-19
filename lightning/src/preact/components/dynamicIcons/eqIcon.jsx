import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class EqIcon extends BaseComponent {
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
            <div className={ window.$Utils.classnames(
                'slds-icon-eq',
                {
                    'slds-is-animated': active,
                },
                className
                ) }
                title={ title }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <div className="slds-icon-eq__bar"></div>
                <div className="slds-icon-eq__bar"></div>
                <div className="slds-icon-eq__bar"></div>
                <span className="slds-assistive-text">{ title }</span>
            </div>
        );
    }
}

EqIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    active: PropTypes.isBoolean('active').defaultValue(true).demoValue(true),
    title: PropTypes.isString('title').demoValue(''),
};

EqIcon.propTypesRest = true;
EqIcon.displayName = "EqIcon";
