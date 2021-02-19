import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Utils from '../utils/utils';
import QuickText from '../quickText/quickText';

export default class Textarea extends AbstractField {
    constructor() {
        super();

        this.node = null;
        this.textarea = null;
        this.quickText = null;

        this.state = _.assign({}, super.state, {
            showQuickTextModal: false,
            focused: false,
        });

        this.bind([
            'onKeyDown',
            'onQuickTextModalClose',
            'setQuickText',
            'onFocusIn',
            'onFocusOut',
            'onTriggerQuickText',
        ]);
    }

    isQuickTextEnabled() {
        return this.prop('enableQuickText') || this.prop('channel') || this.prop('categories');
    }

    onFocusIn() {
        this.setState({
            focused: true,
        });
    }

    onFocusOut() {
        Utils.delay(() => {
            this.setState({
                focused: false,
            });
        }, 100);
    }

    onQuickTextModalClose(quickText) {
        this.setState({
            showQuickTextModal: false,
        }, () => {
            if(quickText) {
                const index = this.textarea.selectionEnd;
                const value = this.textarea.value || '';
                const newVal = value.substring(0, index) + quickText + value.substring(index);
                this.setValue(newVal);
            }
        });
    }

    focus() {
        this.textarea.focus();
    }

    onTriggerQuickText() {
        if(!this.isQuickTextEnabled()) {
            return;
        }

        this.setState({
            showQuickTextModal: true,
        }, () => {
            Utils.delay(() => {
                this.quickText.focus();
            }, 50);
        });
    }

    onKeyDown(e) {
        if(e.key === '.' && (e.ctrlKey || e.metaKey)) {
            this.setValue(e.target.value);
            Utils.delay(() => {
                this.onTriggerQuickText();
            }, 0);
        }
    }

    inputSetValue(value) {
        if (this.prop('messagePosition') != "none" && this.prop('maxlength')) {
            this.node.innerHTML = this.getMessage(value, this.prop('maxlength'));
        }

        if(this.prop('auto') && this.textarea) {
            const lines = this.getNumOfLines(value);
            const rows = this.prop('rows');
            this.textarea.rows = _.max([lines, rows]);
        }
    }

    getNumOfLines(text) {
        return _.chain(text)
            .split('\n')
            .size()
            .value();
    }

    getMessage(value, maxlength) {
        const getRemainingMessage = this.prop('getRemainingMessage');
        const remainingPattern = this.prop('remainingPattern');
        const number = maxlength - _.size(value);
        const current = _.size(value);

        if(_.isFunction(getRemainingMessage)) {
            return getRemainingMessage(value, maxlength);
        } else if ( remainingPattern ) {
            const result = remainingPattern.replace(/\$\{total\}/g, maxlength).replace(/\$\{remaining\}/g,number).replace(/\$\{current\}/g,current);
            return result;
        } else {
            return number + " Remaining";
        }
    }

    getMessagePosition() {
        const messagePosition = this.prop('messagePosition');
        if (messagePosition === "left") {
            return "slds-col_bump-right";
        } else if ( messagePosition === "right") {
            return "slds-col_bump-left";
        } else {
            return null;
        }
    }

    setNode(node) {
        this.node = node;
    }

    setTextarea(node) {
        this.textarea = node;
    }

    setQuickText(node) {
        this.quickText = node;
    }

    getRows() {
        const rows = this.prop('rows');
        if(this.prop('auto')) {
            return _.max([rows, this.getNumOfLines(this.prop('value'))]);
        }
        else {
            return rows;
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
            placeholder,
            maxlength,
            getRemainingMessage,
            remainingPattern,
            messagePosition,
            onValueChange,
        }, rest] = this.getPropValues();

        return (
            <div className="slds-is-relative">
                <textarea
                    ref={ node => this.setTextarea(node) }
                    className="slds-textarea"
                    id={ variables.id }
                    name={ name }
                    value={ value }
                    placeholder={ placeholder }
                    disabled={ variables.isDisabled }
                    readonly={ variables.isReadonly }
                    maxlength={ maxlength }
                    onChange={ e => this.setValue(e.target.value) }
                    onInput={ e => this.inputSetValue(e.target.value)}
                    onKeyDown={ this.onKeyDown }
                    rows={ this.getRows() }
                    onFocus={ this.onFocusIn }
                    onBlur={ this.onFocusOut }
                    { ...rest }
                >
                </textarea>
                {
                    this.prop('messagePosition') != "none" && this.prop('maxlength') ?
                    <div className = "slds-grid">
                        <div className={this.getMessagePosition()} ref={ node => this.setNode(node) }>
                            {
                                this.getMessage(value, maxlength)
                            }
                        </div>
                    </div>
                    :
                    ""
                }
                <ButtonIcon
                    className={ window.$Utils.classnames(
                    'slds-is-absolute',
                    {
                        'slds-hidden': !this.state.focused || !this.isQuickTextEnabled(),
                    }
                    ) }
                    style={ { top: '10px', right: '-15px', } }
                    iconName="utility:quick_text"
                    size="medium"
                    variant="border-filled"
                    alternativeText="Quick Text"
                    onClick={ this.onTriggerQuickText }
                >
                </ButtonIcon>
                <QuickText
                    ref={ this.setQuickText }
                    visible={ this.state.showQuickTextModal }
                    onClose={ this.onQuickTextModalClose }
                    categories={ this.prop('categories') }
                    channel={ this.prop('channel') }
                    mergeFieldContext={ this.prop('mergeFieldContext') }
                >
                </QuickText>
            </div>
        );
    }
}

Textarea.propTypes = PropTypes.extend(AbstractField.propTypes, {
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    maxlength: PropTypes.isNumber('maxlength').demoValue( null ),
    getRemainingMessage: PropTypes.isFunction('getRemainingMessage').demoValue(null),
    remainingPattern: PropTypes.isString('remainingPattern').demoValue(''),
    messagePosition: PropTypes.isString('messagePosition').values([
        'right',
        'left',
        'none',
    ]).defaultValue('none').demoValue('right'),
    rows: PropTypes.isNumber('rows').defaultValue(3).demoValue(3),
    auto: PropTypes.isBoolean('auto').defaultValue(false).demoValue(false),
    categories: PropTypes.isArray('categories'),
    channel: PropTypes.isString('channel'),
    enableQuickText: PropTypes.isBoolean('enableQuickText').demoValue(false),
    mergeFieldContext: PropTypes.isObject('mergeFieldContext'),
});

Textarea.propTypes.name.demoValue('textarea');
Textarea.propTypes.label.demoValue('Textarea');

Textarea.propTypesRest = true;
Textarea.displayName = "Textarea";
