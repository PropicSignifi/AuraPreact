import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class FormTile extends BaseComponent {
    constructor() {
        super();
    }

    shouldShow() {
        if(this.prop('isAdvanced')) {
            return this.context.showAdvanced;
        }
        else {
            return true;
        }
    }

    render(props, state) {
        const [{
            className,
            size,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ window.$Utils.classnames(
                    `slds-col slds-small-size_${size} slds-size_1-of-1 slds-m-top_medium ${className}`,
                    {
                        ['slds-hide']: !this.shouldShow(),
                    }
                ) } { ...rest }>
                { children }
            </div>
        );
    }
}

FormTile.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    size: PropTypes.isString('size').defaultValue('1-of-1').demoValue('1-of-1'),
    isAdvanced: PropTypes.isBoolean('isAdvanced').defaultValue(false).demoValue(false),
    children: PropTypes.isChildren('children'),
};

FormTile.propTypesRest = true;
FormTile.displayName = "FormTile";
