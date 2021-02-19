import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Box extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            size,
            theme,
            showAlertTexture,
            children,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ window.$Utils.classnames(
                'slds-box',
                `slds-box_${size}`,
                `slds-theme_${theme}`,
                {
                    'slds-theme_alert-texture': showAlertTexture,
                },
                className
                ) }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                { children }
            </div>
        );
    }
}

Box.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    size: PropTypes.isString('size').values([
        'base',
        'small',
        'x-small',
        'xx-small',
    ]).defaultValue('base').demoValue('base'),
    theme: PropTypes.isString('theme').values([
        'default',
        'shade',
        'inverse',
        'alt-inverse',
        'success',
        'info',
        'warning',
        'error',
        'offline',
    ]).defaultValue('default').demoValue('default'),
    showAlertTexture: PropTypes.isBoolean('showAlertTexture').defaultValue(false).demoValue(false),
    children: PropTypes.isChildren('children'),
};

Box.propTypesRest = true;
Box.displayName = "Box";
