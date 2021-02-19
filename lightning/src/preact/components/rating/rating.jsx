import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import { PrimitiveIcon } from '../icon/icon';

export default class Rating extends AbstractField {
    constructor() {
        super();
    }

    handleOptionClick(e, index) {
        const option = this.prop("options")[index];
        if(option) {
            if(this.props.defaultValue) {
                if(this.props.value === option.value) {
                    this.setValue(null);
                }
                else {
                    this.setValue(option.value);
                }
            }
            else {
                this.setValue(option.value);
            }
        }
    }

    getIconName(index, currentIndex, currentDefaultIndex) {
        if(currentDefaultIndex >= 0) {
            if(currentIndex < 0) {
                return index <= currentDefaultIndex ? this.prop("activeIconName") : this.prop("inactiveIconName");
            }
            else {
                return index <= currentIndex ? this.prop("activeIconName") : this.prop("inactiveIconName");
            }
        }
        else {
            return index <= currentIndex ? this.prop("activeIconName") : this.prop("inactiveIconName");
        }
    }

    renderField(props, state, variables) {
        const [{
            className,
            tooltip,
            name,
            label,
            value,
            variant,
            disabled,
            readonly,
            required,
            options,
            showTooltip,
            style,
            activeIconName,
            inactiveIconName,
            size,
            defaultValue,
            onValueChange,
        }, rest] = this.getPropValues();

        const currentIndex = _.findIndex(options, ["value", value]);
        const currentDefaultIndex = _.findIndex(options, ["value", defaultValue]);

        if(showTooltip) {
            return (
                <div className="slds-rating" data-type={ this.getTypeName() } { ...rest }>
                    {
                        _.map(options, (option, index) => {
                            return (
                            <button className={ window.$Utils.classnames(
                                'slds-button',
                                {
                                    [`${style}-active`]: index <= currentIndex,
                                    [`${style}-inactive`]: index > currentIndex,
                                }
                                ) } onClick={ e => this.handleOptionClick(e, index) } disabled={ variables.isDisabled }>
                                <Helptext content={ option.label } iconName={ index <= currentIndex ? activeIconName : inactiveIconName } align="bottom-left"></Helptext>
                            </button>
                            );
                        })
                    }
                </div>
            );
        }
        else {
            return (
                <div className="slds-rating" data-type={ this.getTypeName() } { ...rest }>
                    {
                        _.map(options, (option, index) => {
                            return (
                            <button className={ window.$Utils.classnames(
                                'slds-button',
                                {
                                    [`${style}-active`]: index <= currentIndex,
                                    [`${style}-inactive`]: index > currentIndex,
                                }
                                ) } onClick={ e => this.handleOptionClick(e, index) } disabled={ variables.isDisabled }>
                                <PrimitiveIcon iconName={ this.getIconName(index, currentIndex, currentDefaultIndex) } variant="bare" className={ `slds-icon--${size} slds-m-bottom_xxx-small` }></PrimitiveIcon>
                            </button>
                            );
                        })
                    }
                </div>
            );
        }
    }
}

Rating.propTypes = PropTypes.extend(AbstractField.propTypes, {
    options: PropTypes.isArray('options').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
    }),
    showTooltip: PropTypes.isBoolean('showTooltip').demoValue(false),
    style: PropTypes.isString('style').values([
        'favorite',
    ]).defaultValue('favorite').demoValue('favorite'),
    size: PropTypes.isString('size').values([
        'x-small',
        'small',
    ]).defaultValue('small').demoValue('small'),
    activeIconName: PropTypes.isIcon('activeIconName').defaultValue('ctc-utility:stars_fill').demoValue('ctc-utility:stars_fill'),
    inactiveIconName: PropTypes.isIcon('inactiveIconName').defaultValue('ctc-utility:stars_outline').demoValue('ctc-utility:stars_outline'),
    defaultValue: PropTypes.isObject('defaultValue').demoValue('3'),
});

Rating.propTypes.name.demoValue('rating');
Rating.propTypes.label.demoValue('Rating');

Rating.propTypesRest = true;
Rating.displayName = "Rating";
