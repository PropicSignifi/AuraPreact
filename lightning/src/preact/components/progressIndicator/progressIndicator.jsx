import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class ProgressIndicator extends BaseComponent {
    constructor() {
        super();

        this.state = {
            value: null,
            offsetPercent: 0,
            tooltip: null,
        };
    }

    handleOptionClick(e, index) {
        const option = this.prop("options")[index];
        const newVal = option.value;
        this.setState({
            value: newVal,
        });
        if(_.isFunction(this.prop("onValueChange"))) {
            this.prop("onValueChange")(e, newVal);
        }
    }

    handleMouseOver(e, index) {
        const total = _.size(this.prop("options"));
        const option = this.prop("options")[index];
        this.setState({
            offsetPercent: 15 + 70 * index / (total - 1),
            tooltip: option.label,
        });
    }

    handleMouseOut(e) {
        this.setState({
            tooltip: null,
        });
    }

    getPercent(index, options) {
        const total = _.size(options);
        if(total > 1) {
            return 100 * index / (total - 1);
        }
        else {
            return 0;
        }
    }

    render(props, state) {
        const [{
            variant,
            className,
            options,
            value,
            error,
            onValueChange,
        }, rest] = this.getPropValues();
        const realValue = _.isUndefined(value) ? state.value : value;

        const currentIndex = _.findIndex(options, ["value", realValue]);
        const barStyle = {
            width: this.getPercent(currentIndex, options) + "%",
        };
        const popoverStyle = {
            position: 'absolute',
            top: "-45px",
            left: 'calc(' + state.offsetPercent + '% + 0px)',
            transform: 'translateX(-50%)',
        };
        const rootStyle = {
            position: 'relative',
        };

        return (
            <div style={ variant === 'vertical' ? null : rootStyle } data-type={ this.getTypeName() }>
                <div className={ window.$Utils.classnames('slds-progress', {
                    'slds-progress_vertical': variant === 'vertical',
                    }, className) } { ...rest }>
                    <ol className="slds-progress__list">
                        {
                            _.map(options, (option, index) => {
                                return (
                                <li className={ window.$Utils.classnames(
                                    'slds-progress__item',
                                    {
                                        'slds-is-completed': index < currentIndex,
                                        'slds-is-active': index === currentIndex && !error,
                                        'slds-has-error': index === currentIndex && error,
                                    }
                                    ) }>
                                    {
                                        variant === 'vertical' ?
                                        [
                                            index < currentIndex ?
                                            <span className="slds-icon_container slds-icon-utility-success slds-progress__marker slds-progress__marker_icon" title="Complete">
                                                <PrimitiveIcon iconName="utility:success" variant="bare" className=""></PrimitiveIcon>
                                                <span className="slds-assistive-text">Complete</span>
                                            </span>
                                            :
                                            <div className="slds-progress__marker">
                                                {
                                                    index === currentIndex && <span className="slds-assistive-text">Active</span>
                                                }
                                            </div>,
                                            <div className="slds-progress__item_content slds-grid slds-grid_align-spread slds-button slds-text-link_reset" onClick={ e => this.handleOptionClick(e, index) }>{ option.label }</div>
                                        ]
                                        :
                                        <button className={ window.$Utils.classnames(
                                            'slds-button slds-progress__marker',
                                            {
                                                'slds-button_icon slds-progress__marker_icon': index < currentIndex || (index === currentIndex && error),
                                            }
                                            ) } onClick={ e => this.handleOptionClick(e, index) } onMouseOver={ e => this.handleMouseOver(e, index) } onMouseOut={ e => this.handleMouseOut(e) }>
                                            {
                                                index < currentIndex ?
                                                <PrimitiveIcon iconName="utility:success" variant="bare" className="slds-button__icon"></PrimitiveIcon> : null
                                            }
                                            {
                                                index === currentIndex && error ?
                                                <PrimitiveIcon iconName="utility:warning" variant="bare" className="slds-button__icon"></PrimitiveIcon> : null
                                            }
                                            <span className="slds-assistive-text">{ option.label + ' - ' + (index < currentIndex ? 'Completed' : '') + (index === currentIndex ? 'Active' : '') }</span>
                                        </button>
                                    }
                                </li>
                                );
                            })
                        }
                    </ol>
                    {
                        variant !== 'vertical' && (
                            <div className="slds-progress-bar slds-progress-bar_x-small" aria-valuemin="0" aria-valuemax="100" aria-valuenow={ this.getPercent(currentIndex, options) } role="progressbar">
                                <span className="slds-progress-bar__value" style={ barStyle }>
                                <span className="slds-assistive-text">Progress: { this.getPercent(currentIndex, options) }%</span>
                                </span>
                            </div>
                        )
                    }
                </div>
                {
                    variant !== 'vertical' && (
                        <div className={ window.$Utils.classnames(
                            'slds-popover slds-popover_tooltip slds-nubbin_bottom',
                            {
                                'slds-hide': !state.tooltip,
                            }
                            ) } role="tooltip" style={ popoverStyle }>
                            <div className="slds-popover__body">{ state.tooltip }</div>
                        </div>
                    )
                }
            </div>
        );
    }
}

ProgressIndicator.propTypes = {
    variant: PropTypes.isString('variant').values([
        'horizontal',
        'vertical',
    ]).defaultValue('horizontal').demoValue('horizontal'),
    className: PropTypes.isString('className').demoValue(''),
    options: PropTypes.isArray('options').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
    }),
    value: PropTypes.isString('value').demoValue('two'),
    error: PropTypes.isBoolean('error').demoValue(false),
    onValueChange: PropTypes.isFunction('onValueChange'),
};

ProgressIndicator.propTypesRest = true;
ProgressIndicator.displayName = "ProgressIndicator";
