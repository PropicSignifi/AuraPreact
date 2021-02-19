import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Picklist from '../picklist/picklist';
import styles from './styles.less';

export default class Path extends BaseComponent {
    constructor() {
        super();

        this.bind([
            'setPathElement',
            'onScrollLeft',
            'onScrollRight',
        ]);

        this.$pathElement = null;
    }

    setPathElement(node) {
        this.$pathElement = node;
    }

    onScrollLeft() {
        const scrollLeft = this.$pathElement.scrollLeft;
        this.$pathElement.scrollLeft = scrollLeft - 100 < 0 ? 0 : scrollLeft - 100;
    }

    onScrollRight() {
        const scrollLeft = this.$pathElement.scrollLeft;
        this.$pathElement.scrollLeft = scrollLeft + 100;
    }

    onClick(value) {
        const stage = _.find(this.props.stages, ['value', value]);
        if(stage.disable) {
            return;
        } else {
            if(_.isFunction(this.prop('onValueChange'))) {
                this.prop('onValueChange')(stage.value);
            }
        }
    }

    getCurrentLabel() {
        const stage = _.find(this.prop('stages'), ['value', this.prop('value')]);
        return stage ? stage.label : null;
    }

    render(props, state) {
        const [{
            className,
            variant,
            stages,
            value,
            action,
            mobileEnabled,
        }, rest] = this.getPropValues();
        const currentIndex = _.findIndex(stages, ["value", value]);
        if(action) {
            action.attributes.className += " slds-path__mark-complete";
        }

        if(!window.$Utils.isDesktopScreenSize() && !mobileEnabled) {
            if(action) {
                action.attributes.className += " " + styles.actionContainer;
            }

            return (
                <div className={ window.$Utils.classnames(
                    'slds-grid',
                    className
                    ) } data-type={ this.getTypeName() } { ...rest }>
                    <div className={ `${styles.picklistContainer} slds-align_absolute-center` }>
                        <Picklist name="stages" label="Stages" variant="label-removed" required="true" value={ this.getCurrentLabel() } type="link" width="x-small" options={ stages } onValueChange={ newVal => this.onClick(newVal) }>
                        </Picklist>
                    </div>
                    { action }
                </div>
            );
        }
        else {
            return (
                <div className={ window.$Utils.classnames(
                        'slds-path',
                        {
                            'slds-path_select': variant === 'select',
                        },
                        className
                    ) } data-type={ this.getTypeName() } { ...rest }>
                    <div className={ window.$Utils.classnames(
                        "slds-grid slds-path__track",
                        {
                            'slds-has-overflow': window.$Utils.isNonDesktopBrowser() && mobileEnabled,
                        }
                        ) }>
                        <div className="slds-grid slds-path__scroller-container">
                            <div className="slds-path__scroller" role="application">
                                <div className="slds-path__scroller_inner">
                                    <ul
                                        ref={ this.setPathElement }
                                        className="slds-path__nav"
                                        role="listbox"
                                        aria-orientation="horizontal"
                                    >
                                        {
                                            _.map(stages, (stage, index) => {
                                                return (
                                                <li key={ stage.value } className={ window.$Utils.classnames(
                                                    'slds-path__item',
                                                    {
                                                        'slds-is-complete': index < currentIndex && !stage.disable,
                                                        'slds-is-incomplete': index > currentIndex || stage.disable,
                                                        'slds-is-current slds-is-active': index === currentIndex,
                                                        'slds-is-not-allowed': stage.disable
                                                    }
                                                    ) } role="presentation">
                                                    <a aria-selected="true" className="slds-path__link" href="javascript:void(0);" role="option" tabindex="0" onclick={ e => this.onClick(stage.value) }>
                                                        <span className="slds-path__stage">
                                                            <PrimitiveIcon variant="bare" iconName="utility:check" className="slds-icon slds-icon_x-small"></PrimitiveIcon>
                                                            <span className="slds-assistive-text">{ stage.label }</span>
                                                        </span>
                                                        <span className="slds-path__title">{ stage.label }</span>
                                                    </a>
                                                </li>
                                                );
                                            })
                                        }
                                    </ul>
                                    {
                                        window.$Utils.isNonDesktopBrowser() && mobileEnabled && (
                                        <div className={ `slds-path__scroll-controls ${styles.scrollControls}` }>
                                            <button
                                                className="slds-button slds-button_icon slds-button_icon-border-filled"
                                                title="Scroll left"
                                                tabindex="-1"
                                                onclick={ this.onScrollLeft }
                                            >
                                                <PrimitiveIcon className="slds-button__icon" iconName="utility:left"></PrimitiveIcon>
                                            </button>
                                            <button
                                                className="slds-button slds-button_icon slds-button_icon-border-filled"
                                                title="Scroll right"
                                                tabindex="-1"
                                                onclick={ this.onScrollRight }
                                            >
                                                <PrimitiveIcon className="slds-button__icon" iconName="utility:right"></PrimitiveIcon>
                                            </button>
                                        </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            action &&
                            <div className="slds-grid slds-path__action">
                                <span className="slds-path__stage-name">{ value }</span>
                                { action }
                            </div>
                        }
                    </div>
                </div>
            );
        }
    }
}

Path.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'standard',
        'select',
    ]).defaultValue('standard').demoValue('standard'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    stages: PropTypes.isArray('stages').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
        disable: PropTypes.isBoolean('disable').defaultValue('false'),
    }),
    value: PropTypes.isString('value').demoValue('two'),
    action: PropTypes.isObject('action'),
    mobileEnabled: PropTypes.isBoolean('mobileEnabled'),
};

Path.propTypesRest = true;
Path.displayName = "Path";
