import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Spinner from '../spinner/spinner';
import { PrimitiveIcon } from '../icon/icon';
import Portal from 'preact-portal';

export default class Modal extends BaseComponent {
    constructor() {
        super();

        this.state = {
            visible: false,
        };

        this.setLayeredEditorUI = this.setLayeredEditorUI.bind(this);
        this.form = null;
        this.$body = null;
    }

    registerForm(form) {
        this.form = form;
    }

    getForm() {
        return this.form;
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            registerForm: this.registerForm.bind(this),
            getForm: this.getForm.bind(this),
        });
    }

    setLayeredEditorUI() {
        if(!this.shouldShowModal()) {
            if(_.isFunction(this.context.setLayeredEditorUI)) {
                const ui = this.createLayeredEditor();
                this.context.setLayeredEditorUI(ui, () => {
                    this.onCloseModal();
                }, this.id());
            }
        }
    }

    createLayeredEditor() {
        const header = this.prop('header');
        const loading = this.prop('loading');
        const children = this.prop('children');
        const footer = this.prop('footer');

        return this.isVisible() ? (
            <div
                data-type={ this.getTypeName() }
                className={ this.prop('className') }
            >
                {
                    header && (
                        <header className="slds-grid slds-grid_align-center slds-p-around_medium slds-border_bottom">
                            { _.isString(header) ? <h2 className="slds-text-heading_medium slds-hyphenate">{ header }</h2> : { header } }
                        </header>
                    )
                }
                <div className="slds-p-around_medium slds-is-relative">
                    {
                        loading ?
                        <Spinner variant="brand" size="medium" container="with" alternativeText="loading"></Spinner>
                        : null
                    }
                    { children }
                </div>
                {
                    footer && (
                        <footer className="slds-grid slds-grid_align-center">
                            { footer }
                        </footer>
                    )
                }
            </div>
        ) : null;
    }

    onCloseModal(e) {
        this.setState({
            visible: false,
        });
        if(_.isFunction(this.prop("onClose"))) {
            this.prop("onClose")(e);
        }
    }

    isVisible() {
        return _.isBoolean(this.prop('visible')) ? this.prop('visible') : this.state.visible;
    }

    isModalVisible() {
        return this.isVisible() && this.shouldShowModal();
    }

    shouldShowModal() {
        return this.prop('alwaysModal') || !window.$Utils.isNonDesktopBrowser();
    }

    scrollToTop() {
        if(this.$body) {
            this.$body.scrollTop = this.$body.parentElement.offsetTop;
        }
    }

    render(props, state) {
        const [{
            className,
            visible,
            loading,
            size,
            header,
            footer,
            children,
            onClose,
        }, rest] = this.getPropValues();
        const isVisible = this.isModalVisible();

        this.setLayeredEditorUI();

        return this.shouldShowModal() ? isVisible && (
            <Portal into="body">
                <div data-type={ this.getTypeName() }>
                    <section role="dialog" tabindex="-1" className={ window.$Utils.classnames(
                        'slds-modal slds-fade-in-open',
                        {
                            'slds-modal_large': size === 'large',
                        },
                        className
                        )  } { ...rest }>
                        <div className="slds-modal__container">
                            <header className={ window.$Utils.classnames(
                                'slds-modal__header',
                                {
                                    'slds-modal__header_empty': !header,
                                }
                                ) }>
                                <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close" onClick={ e => this.onCloseModal(e) }>
                                    <PrimitiveIcon variant="bare" iconName="utility:close" className="slds-button__icon slds-button__icon_large"></PrimitiveIcon>
                                    <span class="slds-assistive-text">Close</span>
                                </button>
                                {
                                    header && ( _.isString(header) ? <h2 className="slds-text-heading_medium slds-hyphenate">{ header }</h2> : header )
                                }
                            </header>
                            <div ref={ node => this.$body = node } className="slds-modal__content slds-p-around_medium slds-is-relative">
                                {
                                    loading ?
                                    <Spinner variant="brand" size="medium" container="with" alternativeText="loading"></Spinner>
                                    : null
                                }
                                { children }
                            </div>
                            {
                                footer && (
                                    <footer className="slds-modal__footer">
                                        { footer }
                                    </footer>
                                )
                            }
                        </div>
                    </section>
                    <div className={ window.$Utils.classnames(
                        'slds-backdrop',
                        {
                            'slds-backdrop_open': isVisible,
                        }
                        ) }></div>
                </div>
            </Portal>
        )
        :
        (
            <div></div>
        );
    }
}

Modal.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    visible: PropTypes.isBoolean('visible').demoValue(true),
    loading: PropTypes.isBoolean('loading').demoValue(false),
    alwaysModal: PropTypes.isBoolean('alwaysModal').defaultValue(false).demoValue(false),
    size: PropTypes.isString('size').values([
        "base",
        "large",
    ]).defaultValue('base').demoValue('base'),
    header: PropTypes.isString('header').demoValue('Header'),
    footer: PropTypes.isObject('footer'),
    children: PropTypes.isChildren('children'),
    onClose: PropTypes.isFunction('onClose'),
};

Modal.propTypesRest = true;
Modal.displayName = "Modal";
