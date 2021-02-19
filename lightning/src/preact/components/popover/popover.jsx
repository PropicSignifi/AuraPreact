import { h, render, Component } from 'preact';
import AbstractSimplePopupComponent from '../base/simplePopupComponent';
import PropTypes from '../propTypes/propTypes';
import Button from '../button/button';
import { PrimitiveIcon } from '../icon/icon';
import Portal from 'preact-portal';
import Spinner from '../spinner/spinner';
import Utils from '../utils/utils';
import Modal from '../modal/modal';
import styles from './styles.less';

const createPopoverSection = ({
    alignment,
    width,
    variant,
    prompted,
    label,
    id,
    popupStyle,
    onClose,
    createHeader,
    renderContent,
    createFooter,
    withOverlay,
}) => {
    return (
        <section
            className={ window.$Utils.classnames(
            "slds-popover",
            `slds-nubbin_${alignment} popover-${alignment}`,
            `slds-popover_${width}`,
            {
                'slds-popover_error': variant === 'error',
                'slds-popover_warning': variant === 'warning',
                'slds-popover_walkthrough': variant === 'feature' || variant === 'walkthrough',
                'slds-popover_feature': variant === 'feature',
            },
            {
                'slds-hide': !prompted,
            }
            ) }
            role="dialog"
            aria-label={ label || 'Popover' }
            aria-describedby={ `dialog-body-${id}` }
            data-popup-source={ id }
            style={ popupStyle }
        >
            <button
                className={ window.$Utils.classnames(
                "slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close",
                {
                    "slds-button_icon-inverse": variant === 'error' || variant === 'feature',
                }
                ) }
                title="Close"
                onClick={ onClose }
            >
                <PrimitiveIcon
                    variant="bare"
                    className="slds-button__icon"
                    iconName="utility:close"
                >
                </PrimitiveIcon>
                <span className="slds-assistive-text">Close</span>
            </button>
            { createHeader && createHeader() }
            <div className="slds-popover__body" id={ `dialog-body-${id}` }>
                { renderContent && renderContent() }
            </div>
            { createFooter && createFooter({
                close: onClose,
            }) }
        </section>
    );
};

export const createPopover = options => {
    return (
        <Portal into="body">
            {
                options.withOverlay ?
                <div>
                    <div className="slds-backdrop slds-backdrop_open" style={ { 'z-index': 1000, opacity: 0.5, } }>
                    </div>
                    {
                        createPopoverSection(options)
                    }
                </div>
                :
                createPopoverSection(options)
            }
        </Portal>
    );
};

export default class Popover extends AbstractSimplePopupComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            data: null,
        });
    }

    renderContent() {
        if(this.state.data) {
            if(_.isFunction(this.prop('renderContent'))) {
                const content = this.prop('renderContent')(this.state.data);
                const variant = this.prop('variant');

                if(variant === 'feature') {
                    return (
                        <div className="slds-media">
                            <div className="slds-media__body">
                                { content }
                            </div>
                        </div>
                    );
                }
                else {
                    return content;
                }
            }
        }
        else {
            return (
                <div className={ `slds-is-relative ${styles.placeholder}` }>
                    <Spinner></Spinner>
                </div>
            );
        }
    }

    onTrigger(e) {
        if(!this.state.data) {
            if(_.isFunction(this.prop('loadContent'))) {
                const p = this.prop('loadContent')();
                if(window.$Utils.isPromise(p)) {
                    p.then(data => {
                        this.setState({
                            data,
                        });
                    }, Utils.catchError);
                }
                else {
                    this.setState({
                        data: p,
                    });
                }
            }
            else {
                this.setState({
                    data: {},
                });
            }
        }

        this.promptPopup();
    }

    onClose(e) {
        this.setState({
            prompted: false,
        });
    }

    computePopupStyle(pos, elem) {
        const rect = elem.getBoundingClientRect();

        const popupStyle = {
            position: "absolute",
        };

        const nubbingRadius = 15;

        switch(this.prop('alignment')) {
            case 'left':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + (rect.height / 2) + "px";
                break;
            case 'left-top':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top - nubbingRadius * 2 / 3 + "px";
                break;
            case 'left-top-corner':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 1 / 3 + "px";
                break;
            case 'left-bottom':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 8 / 3 + "px";
                break;
            case 'left-bottom-corner':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 5 / 3 + "px";
                break;
            case 'right':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + (rect.height / 2) + "px";
                break;
            case 'right-top':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top - nubbingRadius * 2 / 3 + "px";
                break;
            case 'right-top-corner':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 1 / 3 + "px";
                break;
            case 'right-bottom':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 8 / 3 + "px";
                break;
            case 'right-bottom-corner':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 5 / 3 + "px";
                break;
            case 'top':
                popupStyle.left = pos.left + rect.width / 2 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-left':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-left-corner':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-right':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-right-corner':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'bottom':
                popupStyle.left = pos.left + rect.width / 2 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-left':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-left-corner':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-right':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-right-corner':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            default:
                break;
        }

        return popupStyle;
    }

    createTriggerComponent() {
        const children = this.prop('children');
        let trigger = _.isArray(children) ? children[0] : children;
        if(!trigger) {
            trigger = (
                <Button
                    label={ this.prop('label') }
                    variant="tertiary"
                >
                </Button>
            );
        }
        const onTrigger = this.prop('onTrigger');
        trigger.attributes[onTrigger] = this.onTrigger.bind(this);
        return trigger;
    }

    createHeader() {
        const header = this.prop('header');
        const variant = this.prop('variant');

        if(variant === 'error' || variant === 'warning') {
            return (
                <header className="slds-popover__header">
                    <div className="slds-media slds-media_center slds-has-flexi-truncate ">
                        <div className="slds-media__figure">
                            <span className={ `slds-icon_container slds-icon-utility-${variant}` }>
                                <PrimitiveIcon
                                    variant="bare"
                                    className="slds-icon slds-icon_x-small"
                                    iconName={ `utility:${variant}` }
                                >
                                </PrimitiveIcon>
                            </span>
                        </div>
                        <div className="slds-media__body">
                            <h2 className="slds-truncate slds-text-heading_medium">{ header }</h2>
                        </div>
                    </div>
                </header>
            );
        }
        else {
            return header && (
                <header className="slds-popover__header">
                    {
                        _.isString(header) ?
                        <h2 className="slds-text-heading_small">{ header }</h2>
                        :
                        header
                    }
                </header>
            );
        }
    }

    createFooter(callbacks) {
        const footer = this.prop('footer');

        return footer && (
            <footer className="slds-popover__footer">
                {
                    _.isString(footer) ?
                    <p>{ footer }</p>
                    :
                        (_.isFunction(footer) ?
                            footer(callbacks)
                            :
                            footer
                        )
                }
            </footer>
        );
    }

    onClickOutside(e) {
        if(this.state.prompted) {
            const isInside = window.$Utils.findFromEvent(e, "data-popup-source") === this.$popupId;
            if(!isInside && !this.$requestingPopup && this.prop('closeWhenClickOutside')) {
                this.setState({
                    prompted: false,
                });
            }
        }
    }

    render(props, state) {
        const [{
            className,
            label,
            variant,
            header,
            footer,
            alignment,
            width,
            children,
        }, rest] = this.getPropValues();

        const id = this.id();

        this.setPopupSource(id);

        return (
            <div className={ window.$Utils.classnames(
                styles.container,
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <div
                    ref={ node => this.setMainInput(node) }
                    className={ styles.triggerContainer }
                    data-popup-source={ id }
                    aria-haspopup="true"
                >
                    { this.createTriggerComponent() }
                </div>
            {
                window.$Utils.isNonDesktopBrowser() ?
                <Modal
                    header={ header }
                    visible={ this.isPrompted() }
                    onClose={ this.onClose.bind(this) }
                    loading={ !this.state.data }
                    footer={
                        _.isFunction(footer) ?
                        footer({ close: this.onClose.bind(this) })
                        :
                        footer
                    }
                >
                    { this.renderContent() }
                </Modal>
                :
                createPopover({
                    alignment,
                    width,
                    variant,
                    prompted: this.isPrompted(),
                    label,
                    id,
                    popupStyle: state.popupStyle,
                    onClose: this.onClose.bind(this),
                    createHeader: this.createHeader.bind(this),
                    createFooter: this.createFooter.bind(this),
                    renderContent: this.renderContent.bind(this),
                })
            }
            </div>
        );
    }
}

Popover.propTypes = PropTypes.extend(AbstractSimplePopupComponent.propTypes, {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').defaultValue('Click').demoValue('Click'),
    variant: PropTypes.isString('variant').values([
        "base",
        "error",
        "feature",
        "warning",
        "walkthrough",
    ]).defaultValue('base').demoValue('base'),
    closeWhenClickOutside: PropTypes.isBoolean('closeWhenClickOutside').defaultValue(true).demoValue(true),
    header: PropTypes.isObject('header'),
    footer: PropTypes.isObject('footer'),
    alignment: PropTypes.isString('alignment').values([
        "top",
        "top-left",
        "top-right",
        "bottom",
        "bottom-left",
        "bottom-right",
        "left",
        "left-top",
        "left-bottom",
        "right",
        "right-top",
        "right-bottom",
        "top-left-corner",
        "bottom-left-corner",
        "top-right-corner",
        "bottom-right-corner",
        "left-top-corner",
        "right-top-corner",
        "left-bottom-corner",
        "right-bottom-corner",
    ]).defaultValue('left').demoValue('left'),
    width: PropTypes.isString('width').values([
        "small",
        "medium",
        "large",
    ]).defaultValue('medium').demoValue('medium'),
    onTrigger: PropTypes.isString('onTrigger').defaultValue('onClick'),
    renderContent: PropTypes.isFunction('renderContent'),
    loadContent: PropTypes.isFunction('loadContent'),
    children: PropTypes.isChildren('children'),
});

Popover.propTypesRest = true;
Popover.displayName = "Popover";
