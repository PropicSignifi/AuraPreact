import { h, render, Component } from 'preact';
import AbstractSimplePopupComponent from '../base/simplePopupComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Modal from '../modal/modal';
import styles from './styles.css';
import Portal from 'preact-portal';

const LIMIT = 300;
const placeholder = 'Click to view details';

const detectHtml = text => text && (text.includes('<') || text.includes('>'));

export default class Helptext extends AbstractSimplePopupComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            content: null,
            prompted: false,
            modalPrompted: false,
        });
    }

    getContent() {
        return this.state.content || this.prop('content') || placeholder;
    }

    needShowModal() {
        return _.size(this.getContent()) > LIMIT || detectHtml(this.getContent());
    }

    getTooltip() {
        if(this.prop('showModal') || this.needShowModal()) {
            return placeholder;
        }
        else {
            return this.getContent();
        }
    }

    onClick() {
        this.triggerOpen(true);
    }

    promptTooltip(content, fromModal) {
        if(fromModal) {
            this.setState({
                modalPrompted: true,
            });
        }
        else {
            if(content) {
                this.setState({
                    content,
                }, this.promptPopup);
            }
            else {
                this.promptPopup();
            }
        }
    }

    triggerOpen(fromModal) {
        if(_.isFunction(this.prop('getContent')) && !this.state.content) {
            const data = this.prop('getContent')();
            if(window.$Utils.isPromise(data)) {
                data.then(content => {
                    this.promptTooltip(content, fromModal);
                });
            }
            else {
                this.promptTooltip(data, fromModal);
            }
        }
        else {
            this.promptTooltip(null, fromModal);
        }
    }

    triggerClose(fromModal) {
        if(fromModal) {
            this.setState({
                modalPrompted: false,
            });
        }
        else {
            this.setState({
                prompted: false,
            });
        }
    }

    onMouseOver() {
        this.triggerOpen();
    }

    onMouseOut() {
        this.triggerClose();
    }

    computePopupStyle(pos, elem) {
        return {
            position: "absolute",
            left: (pos.left - 15) + "px",
            right: pos.right + "px",
            top: (pos.top - 15) + "px",
            transform: 'translateY(-100%)',
        };
    }

    renderContent() {
        return this.prop('isHtml') ?
            (<div dangerouslySetInnerHTML={ { __html: this.getContent() } }></div>)
            :
            (<div>{ this.getContent() }</div>);
    }

    renderTooltip() {
        const tooltip = this.getTooltip();
        return (
            <div>{ tooltip }</div>
        );
    }

    isTooltipPrompted() {
        return super.isPrompted();
    }

    isModalPrompted() {
        return this.state.modalPrompted;
    }

    shouldShowModal() {
        if(this.needShowModal()) {
            return true;
        }

        if(this.prop('showModal')) {
            return true;
        }

        return window.$Utils.isNonDesktopBrowser();
    }

    render(props, state) {
        const [{
            className,
            title,
            align,
            size,
            iconName,
        }, rest] = this.getPropValues();

        const id = this.id();

        this.setPopupSource(id);

        return (
            <div ref={ node => this.setMainInput(node) } className={ window.$Utils.classnames(styles.root, className) } data-popup-source={ id } onClick={ this.onClick.bind(this) } onMouseOver={ e => this.onMouseOver(e) } onMouseOut={ e => this.onMouseOut(e) } data-type={ this.getTypeName() } { ...rest }>
                <PrimitiveIcon iconName={ iconName } variant="bare" size={ size }/>
                <Portal into="body">
                    <section data-popup-source={ id } className={ window.$Utils.classnames(
                        'slds-popover slds-popover_tooltip',
                        styles.popover,
                        {
                            'slds-nubbin_top': align === 'top',
                            'slds-nubbin_top-left': align === 'top-left',
                            'slds-nubbin_top-right': align === 'top-right',
                            'slds-nubbin_bottom': align === 'bottom',
                            'slds-nubbin_bottom-left': align === 'bottom-left',
                            'slds-nubbin_bottom-right': align === 'bottom-right',
                            'slds-show': this.isTooltipPrompted(),
                            'slds-hide': !this.isTooltipPrompted(),
                        }
                    ) } role="dialog" style={ state.popupStyle }>
                        <div className={ window.$Utils.classnames('slds-popover__body', styles.body) }>
                            { this.renderTooltip() }
                        </div>
                    </section>
                </Portal>
                <Modal visible={ this.isModalPrompted() } alwaysModal={ _.size(this.getContent()) < LIMIT } onClose={ e => this.triggerClose(true) }>
                    { this.renderContent() }
                </Modal>
            </div>
        );
    }
}

Helptext.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').demoValue(''),
    content: PropTypes.isString('content').defaultValue(placeholder).demoValue('Some content'),
    size: PropTypes.isString('size').values([
        'x-small',
        'small',
    ]).defaultValue('x-small').demoValue('x-small'),
    showModal: PropTypes.isBoolean('showModal').defaultValue(false).demoValue(false),
    getContent: PropTypes.isFunction('getContent'),
    isHtml: PropTypes.isBoolean('isHtml').defaultValue(false).demoValue(false),
    align: PropTypes.isString('align').values([
        'bottom-left',
    ]).defaultValue('bottom-left').demoValue('bottom-left'),
    iconName: PropTypes.isIcon('iconName').defaultValue('ctc-utility:info_info').demoValue('ctc-utility:info_info'),
};

Helptext.propTypesRest = true;
Helptext.displayName = "Helptext";
