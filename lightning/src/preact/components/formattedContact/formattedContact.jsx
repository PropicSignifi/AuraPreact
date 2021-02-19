import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import PreviewText from '../previewText/previewText';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.css';

export default class FormattedContact extends BaseComponent {
    constructor() {
        super();
    }

    getContactType(contact) {
        switch(contact.type) {
            case 'mobile':
                return 'Mobile';
            case 'homePhone':
                return 'Home Phone';
            case 'otherPhone':
                return 'Other Phone';
            case 'phone':
                return 'Phone';
            default:
                return 'Unknown contact';
        }
    }

    getContactValues(contacts) {
        return _.chain(contacts).
            filter(contact => !!contact.number).
            map(contact => {
                if(contact.DNC) {
                    return (
                        <div className={ styles.contactInfo } title={ this.getContactType(contact) }>
                            { contact.number }
                            <PrimitiveIcon variant="bare" iconName="ctc-utility:info_dnc" size="x-small" className={ styles.iconDNC }></PrimitiveIcon>
                        </div>
                    );
                }
                else {
                    return (
                        <div title={ this.getContactType(contact) }>{ contact.number }</div>
                    );
                }
            }).
            value();
    }

    render(props, state) {
        const [{
            className,
            value,
        }, rest] = this.getPropValues();

        return (
            <PreviewText className={ className } value={ this.getContactValues(value) } data-type={ this.getTypeName() } { ...rest }></PreviewText>
        );
    }
}

FormattedContact.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    value: PropTypes.isArray('value').required().shape({
        number: PropTypes.isString('number'),
        type: PropTypes.isString('type').values([
            "mobile",
            "homePhone",
            "otherPhone",
            "phone",
        ]),
        DNC: PropTypes.isBoolean('DNC'),
    }),
};

FormattedContact.propTypesRest = true;
FormattedContact.displayName = "FormattedContact";
