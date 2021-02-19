import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Utils from '../utils/utils';
import styles from './styles.less';

const RangeMode = {
    FIXED: 'Fixed',
    WITH_STEP: 'With Step',
    WITHOUT_STEP: 'Without Step',
};

const getOptionValue = option => _.isPlainObject(option) ? option.value : option;

const getOptionLabel = option => _.isPlainObject(option) ? option.label : option;

const isObjectOptions = options => _.isPlainObject(options[0]);

const closestStepValue = (value, step) => _.round(value / step) * step;

export default class Slider extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.bind([
            'setTrackNode',
            'setDotNode',
            'onTrackClick',
            'onMouseMove',
            'onMouseUp',
        ]);

        this.onMouseMove = _.throttle(this.onMouseMove, 300);

        this._track = null;
        this._dots = [];
        this._isDragging = false;
        this._isDraggingIndex = null;
        this._leftBound = null;
        this._rightBound = null;
        this._rangeMode = null;
    }

    checkData(props) {
        if(props.optionsString || props.options) {
            this._rangeMode = RangeMode.FIXED;
        }
        else if(props.step) {
            this._rangeMode = RangeMode.WITH_STEP;
        }
        else {
            this._rangeMode = RangeMode.WITHOUT_STEP;
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.checkData(nextProps);
    }

    componentDidMount() {
        super.componentDidMount();

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);

        this.checkData(this.props);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    setTrackNode(node) {
        this._track = node;
    }

    setDotNode(node, index) {
        this._dots[index] = node;
    }

    format(value) {
        return _.round(value, this.prop('precision'));
    }

    getOptions() {
        if(this.prop('optionsString')) {
            return _.chain(this.prop('optionsString'))
                .trim()
                .split(';')
                .value();
        }
        else {
            return this.prop('options');
        }
    }

    getMinValue() {
        if(this._rangeMode === RangeMode.FIXED) {
            const options = this.getOptions();
            const option = _.first(options);
            return getOptionValue(option);
        }
        else {
            return this.format(this.prop('minValue'));
        }
    }

    getMaxValue() {
        if(this._rangeMode === RangeMode.FIXED) {
            const options = this.getOptions();
            const option = _.last(options);
            return getOptionValue(option);
        }
        else {
            return this.format(this.prop('maxValue'));
        }
    }

    getValue() {
        const value = this.prop('value');
        const dots = this.prop('dots');

        if(!_.isNil(value)) {
            if(dots === 1) {
                return value;
            }
            else {
                if(_.size(value) === dots) {
                    return value;
                }
            }
        }

        return this.getDefaultValue();
    }

    getDefaultValue() {
        const dots = this.prop('dots');
        const itemPercent = 1 / (1 + dots);
        const result = [];
        for(let i = 1; i < dots + 1; i++) {
            result.push(this.percentToValue(itemPercent * i));
        }

        return dots === 1 ? result[0] : result;
    }

    getLabel(value) {
        if(this._rangeMode === RangeMode.FIXED) {
            const options = this.getOptions();
            if(isObjectOptions(options)) {
                const option = _.find(options, ['value', value]);
                return getOptionLabel(option);
            }
            else {
                return value;
            }
        }
        else {
            return value;
        }
    }

    getActiveTrackInfo() {
        const value = this.getValue();
        const dots = this.prop('dots');

        if(dots === 1) {
            return {
                left: 0,
                width: this.valueToPercent(value),
            };
        }
        else {
            const left = _.first(value);
            const right = _.last(value);
            const leftPercent = this.valueToPercent(left);
            const rightPercent = this.valueToPercent(right);

            return {
                left: leftPercent,
                width: rightPercent - leftPercent,
            };
        }
    }

    getDotInfos() {
        const dots = this.prop('dots');
        const value = dots === 1 ? [this.getValue()] : this.getValue();

        return _.chain(value)
            .map(item => {
                const percent = this.valueToPercent(item);
                return {
                    left: percent,
                    value: item,
                };
            })
            .value();
    }

    valueToPercent(value) {
        const minValue = this.getMinValue();
        const maxValue = this.getMaxValue();

        if(this._rangeMode === RangeMode.FIXED) {
            const options = this.getOptions();
            let index = 0;
            if(isObjectOptions(options)) {
                index = _.findIndex(options, ['value', value]);
            }
            else {
                index = _.indexOf(options, value);
            }

            return 100 * index / (_.size(options) - 1);
        }
        else {
            return 100 * (value - minValue) / (maxValue - minValue);
        }
    }

    percentToValue(percent) {
        const minValue = this.getMinValue();
        const maxValue = this.getMaxValue();

        if(this._rangeMode === RangeMode.FIXED) {
            const options = this.getOptions();
            const index = _.round((_.size(options) - 1) * percent);
            return getOptionValue(options[index]);
        }
        else if(this._rangeMode === RangeMode.WITH_STEP) {
            const newVal = closestStepValue(minValue + (maxValue - minValue) * percent, this.prop('step'));
            return this.format(newVal);
        }
        else {
            const newVal = minValue + (maxValue - minValue) * percent;
            return this.format(newVal);
        }
    }

    onTrackClick(e) {
        if(this._isDragging) {
            return;
        }

        const x = e.clientX;
        const track = this._track;

        const trackRect = track.getBoundingClientRect();

        const percent = (x - trackRect.left) / trackRect.width;
        const newVal = this.percentToValue(percent);
        this.setValue(newVal);
    }

    setValue(newVal) {
        const dots = this.prop('dots');
        if(dots === 1) {
            super.setValue(newVal);
        }
        else {
            const value = this.getValue();
            let index = 0;
            if(!_.isNil(this._isDraggingIndex)) {
                index = this._isDraggingIndex;
            }
            else {
                const newPercent = this.valueToPercent(newVal);
                const closestVal = _.minBy(value, item => {
                    return Math.abs(this.valueToPercent(item) - newPercent);
                });
                index = _.indexOf(value, closestVal);
            }

            super.setValue(Utils.update(value, index, newVal));
        }
    }

    onMouseDown(e, index) {
        this._isDragging = true;
        this._isDraggingIndex = index;

        const dots = this.prop('dots');
        const value = this.getValue();
        if(index === 0) {
            this._leftBound = 0;
        }
        else {
            this._leftBound = this.valueToPercent(value[index - 1]);
        }
        if(index === dots - 1) {
            this._rightBound = 100;
        }
        else {
            this._rightBound = this.valueToPercent(value[index + 1]);
        }
    }

    onMouseUp(e, index) {
        Utils.delay(() => {
            this._isDragging = false;
            this._isDraggingIndex = null;
            this._leftBound = null;
            this._rightBound = null;
        }, 50);
    }

    onMouseMove(e) {
        if(!this._isDragging) {
            return;
        }

        const x = e.clientX;
        const track = this._track;

        const trackRect = track.getBoundingClientRect();

        let percent = _.clamp((x - trackRect.left) / trackRect.width, this._leftBound / 100, this._rightBound / 100);

        window.requestAnimationFrame(() => {
            const newVal = this.percentToValue(percent);
            this.setValue(newVal);
        });
    }

    renderField(props, state, variables) {
        const [{
            className,
            tooltip,
            name,
            label,
            value,
            dots,
            variant,
            disabled,
            readonly,
            required,
            onValueChange,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        if(dots < 1) {
            throw new Error('Dots should be at lease one');
        }

        const activeTrackInfo = this.getActiveTrackInfo();
        const activeTrackStyle = {
            left: `${activeTrackInfo.left}%`,
            width: `${activeTrackInfo.width}%`,
        };

        const minValue = this.getMinValue();
        const maxValue = this.getMaxValue();
        const dotInfos = this.getDotInfos();

        return (
            <div className={ window.$Utils.classnames(
                "slds-input-range",
                {
                    'slds-input-range--disabled': isDisabled,
                },
                className
                ) }>
                <span className="slds-input-range__label slds-input-range__label--min">
                    <span className="slds-input-range__label-container">{ this.getLabel(this.getMinValue()) }</span>
                </span>
                <div
                    ref={ this.setTrackNode }
                    className="slds-input-range__track slds-input-range__track--background"
                    onClick={ this.onTrackClick }
                >
                    <div className="slds-input-range__track slds-input-range__track--active" style={ activeTrackStyle }></div>
                    {
                        _.map(dotInfos, (dotInfo, index) => {
                            return (
                                <span
                                    key={ index }
                                    ref={ node => this.setDotNode(node, index) }
                                    className="slds-input-range__slider-container"
                                    style={
                                        {
                                            position: 'absolute',
                                            left: `${dotInfo.left}%`,
                                        }
                                    }
                                >
                                    <span className="slds-input-range__label slds-input-range__label--value">
                                        <span className="slds-input-range__label-container">{ this.getLabel(dotInfo.value) }</span>
                                    </span>
                                    <div
                                        onMouseDown={ e => this.onMouseDown(e, index) }
                                        aria-valuemax={ maxValue }
                                        aria-valuemin={ minValue }
                                        aria-valuenow={ dotInfo.value }
                                        className="slds-input-range__slider"
                                        draggable={ false }
                                        role="slider"
                                        tabindex="0"
                                    >
                                    </div>
                                </span>
                            );
                        })
                    }
                </div>
                <span className="slds-input-range__label slds-input-range__label--max">
                    <span className="slds-input-range__label-container">{ this.getLabel(this.getMaxValue()) }</span>
                </span>
            </div>
        );
    }
}

Slider.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isObject('value'),
    minValue: PropTypes.isNumber('minValue').defaultValue(0).demoValue(0),
    maxValue: PropTypes.isNumber('maxValue').defaultValue(100).demoValue(100),
    step: PropTypes.isNumber('step').defaultValue(0).demoValue(0),
    options: PropTypes.isArray('options'),
    optionsString: PropTypes.isString('optionsString').demoValue(''),
    dots: PropTypes.isNumber('dots').defaultValue(1).demoValue(1),
    precision: PropTypes.isNumber('precision').defaultValue(0).demoValue(0),
});

Slider.propTypes.name.demoValue('slider');
Slider.propTypes.label.demoValue('Slider');

Slider.propTypesRest = true;
Slider.displayName = "Slider";
