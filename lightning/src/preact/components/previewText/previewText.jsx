import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import DynamicMenu from '../menu/dynamicMenu';
import styles from './styles.css';

export default class PreviewText extends BaseComponent {
    constructor() {
        super();
    }

    getPreviewText() {
        if(_.isArray(this.prop("value"))) {
            return this.prop("value")[0];
        }
        else {
            return this.prop("value");
        }
    }

    getTextItems() {
        if(_.isArray(this.prop("value"))) {
            return this.prop("value");
        }
        else {
            return [this.prop("value")];
        }
    }

    render(props, state) {
        const [{
            className,
            value,
            hideWhenSingle,
            showAllInDropdown,
        }, rest] = this.getPropValues();

        const items = this.getTextItems();
        const shouldHideDropdown = (_.size(items) <= 1 && (hideWhenSingle || !showAllInDropdown));
        const dropdownItems = showAllInDropdown ? items : _.slice(items, 1);

        return (
            <div className={ window.$Utils.classnames(styles.previewText, className) } data-type={ this.getTypeName() } { ...rest }>
                <div className="slds-truncate">
                    { this.getPreviewText() }
                </div>
                {
                    shouldHideDropdown ?
                    null :
                    <DynamicMenu className="slds-m-left_xxx-small" iconName="ctc-utility:a_down">
                        { _.map(dropdownItems, item => <div>{ item }</div>) }
                    </DynamicMenu>
                }
            </div>
        );
    }
}

PreviewText.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    value: PropTypes.isObject('value').required().demoValue('A long text'),
    hideWhenSingle: PropTypes.isBoolean('hideWhenSingle').defaultValue(true).demoValue(true).description('Hide the dropdown when there is only one value'),
    showAllInDropdown: PropTypes.isBoolean('showAllInDropdown').defaultValue(true).demoValue(true).description('Show all items in the dropdown'),
};

PreviewText.propTypesRest = true;
PreviewText.displayName = "PreviewText";
