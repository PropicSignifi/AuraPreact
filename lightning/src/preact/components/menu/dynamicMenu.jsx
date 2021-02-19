import { h, render, Component } from 'preact';
import AbstractSimplePopupComponent from '../base/simplePopupComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Modal from '../modal/modal';
import styles from './styles.css';

export default class DynamicMenu extends AbstractSimplePopupComponent {
    constructor() {
        super();
    }

    onSelect(newVal) {
        if(_.isFunction(this.prop("onSelect"))) {
            this.prop("onSelect")(newVal);
        }
        this.setState({
            prompted: false,
        });
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            onSelect: this.onSelect.bind(this),
        });
    }

    shouldShowModal() {
        return window.$Utils.isMobileScreenSize();
    }

    triggerClose() {
        this.setState({
            prompted: false,
        });
    }

    render(props, state) {
        const [{
            className,
            variant,
            iconName,
            alternativeText,
            disabled,
            children,
        }, rest] = this.getPropValues();

        const id = this.id();

        this.setPopupSource(id);

        return (
            <div className={ window.$Utils.classnames(styles.dynamicMenu, className) } data-type={ this.getTypeName() } { ...rest }>
                <button className={ window.$Utils.classnames(
                    'slds-button slds-button_icon',
                    {
                        'slds-button_icon-border-filled': variant === 'border',
                    }
                    ) } data-popup-source={ id } disabled={ disabled } onFocusIn={ e => this.onFocus(e) } onClick={ e => this.onFocus(e) }>
                    <PrimitiveIcon variant="bare" iconName={ iconName } className="slds-button__icon"></PrimitiveIcon>
                    <span className="slds-assistive-text">{ alternativeText }</span>
                </button>
                {
                    !this.shouldShowModal() ?
                    <section className={ window.$Utils.classnames(
                        'slds-popover slds-nubbin_top-left slds-dynamic-menu',
                        styles.popover,
                        {
                            'slds-show': state.prompted,
                            'slds-hide': !state.prompted,
                            [styles.positionBorder]: variant === 'border',
                            [styles.positionBare]: variant !== 'border',
                        }
                        ) } role="dialog" aria-label={ alternativeText } aria-describedby={ `dialog-${id}` } data-popup-source={ id }>
                        <div className="slds-popover__body slds-p-horizontal_none" id={ `dialog-${id}` }>
                            <div className="slds-p-vertical_x-small slds-p-horizontal_small">
                                { children }
                            </div>
                        </div>
                    </section>
                    :
                    <Modal visible={ state.prompted } alwaysModal="true" onClose={ this.triggerClose.bind(this) }>
                        { children }
                    </Modal>
                }
            </div>
        );
    }
}

DynamicMenu.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "bare",
        "border",
    ]).defaultValue('bare').demoValue('bare'),
    iconName: PropTypes.isIcon('iconName').required().demoValue('ctc-utility:info_info'),
    alternativeText: PropTypes.isString('alternativeText').demoValue(''),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    children: PropTypes.isChildren('children'),
};

DynamicMenu.propTypesRest = true;
DynamicMenu.displayName = "DynamicMenu";
