import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { Icon, } from '../icon/icon';
import styles from './styles.less';

export default class FormattedPhone extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            value,
            dnc,
            linkify,
        }, rest] = this.getPropValues();

        return (
            <div className={ `slds-grid slds-grid_vertical-align-center slds-truncate ${className}` } data-type={ this.getTypeName() } { ...rest }>
                {
                    (linkify && !dnc) ? <a href={ `tel:${value}` }>{ value }</a> : value
                }
                { dnc && <Icon iconName="ctc-utility:info_dnc" size="small" className={ styles.dnc }></Icon> }
            </div>
        );
    }
}

FormattedPhone.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    value: PropTypes.isString('value').demoValue('+61 2 1111 1111'),
    dnc: PropTypes.isBoolean('dnc').defaultValue(false).demoValue(false),
    linkify: PropTypes.isBoolean('linkify').defaultValue(false).demoValue(false),
};

FormattedPhone.propTypesRest = true;
FormattedPhone.displayName = "FormattedPhone";
