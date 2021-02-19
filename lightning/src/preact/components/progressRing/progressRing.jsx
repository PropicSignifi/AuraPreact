import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class ProgressRing extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {

        });
    }

    getProgress() {
        const min = this.prop('min');
        const max = this.prop('max');
        const value = this.prop('value');
        return _.toInteger(100 * (value - min) / (max - min));
    }

    render(props, state) {
        const [{
            className,
            variant,
            size,
            label,
        }, rest] = this.getPropValues();

        const progress = this.getProgress();
        const isLong = progress > 50 ? 1 : 0;
        const arcX = Math.cos(2 * Math.PI * progress / 100);
        const arcY = -Math.sin(2 * Math.PI * progress / 100);

        return (
            <div className={ window.$Utils.classnames(
                "slds-progress-ring",
                {
                    'slds-progress-ring_active-step': variant === 'base' && progress < 100,
                    'slds-progress-ring_warning': variant === 'warning' && progress < 100,
                    'slds-progress-ring_expired': variant === 'error' && progress < 100,
                    'slds-progress-ring_complete': progress >= 100,
                },
                {
                    'slds-progress-ring_large': size === 'large',
                },
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <div className="slds-progress-ring__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={ progress }>
                    <svg viewBox="-1 -1 2 2">
                        <path className="slds-progress-ring__path" d={ `M 1 0 A 1 1 0 ${isLong} 0 ${arcX} ${arcY} L 0 0` }></path>
                    </svg>
                </div>
                <div className="slds-progress-ring__content">
                    {
                        progress >= 100 ?
                        <span className="slds-icon_container slds-icon-utility-check" title="Complete">
                            <PrimitiveIcon
                                variant="bare"
                                className="slds-icon"
                                iconName="utility:check"
                            >
                            </PrimitiveIcon>
                            <span className="slds-assistive-text">Complete</span>
                        </span>
                        :
                        label
                    }
                </div>
            </div>
        );
    }
}

ProgressRing.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'base',
        'warning',
        'error',
    ]).defaultValue('base').demoValue('base'),
    min: PropTypes.isNumber('min').defaultValue(0).demoValue(0),
    max: PropTypes.isNumber('max').defaultValue(100).demoValue(100),
    value: PropTypes.isNumber('value').demoValue(40),
    label: PropTypes.isString('label').demoValue(''),
    size: PropTypes.isString('size').values([
        'medium',
        'large',
    ]).defaultValue('medium').demoValue('medium'),
};

ProgressRing.propTypesRest = true;
ProgressRing.displayName = "ProgressRing";
