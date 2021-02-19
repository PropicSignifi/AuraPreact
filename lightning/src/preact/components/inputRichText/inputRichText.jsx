import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import Spinner from '../spinner/spinner';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Button from '../button/button';
import Modal from '../modal/modal';
import Form from '../form/form';
import Input from '../input/input';
import PropTypes from '../propTypes/propTypes';
import QuickText from '../quickText/quickText';
import Utils from '../utils/utils';
import { Observable, Subject, } from 'rxjs';

const ACTION_APPEND_LINK = 'append_link';
const ACTION_APPEND_IMAGE = 'append_image';
const ACTION_APPEND_QUICKTEXT = 'append_quickText';

const extraFormats = [
    ACTION_APPEND_LINK,
    ACTION_APPEND_IMAGE,
    ACTION_APPEND_QUICKTEXT,
];

export default class InputRichText extends AbstractField {
    constructor() {
        super();

        this.instance = null;
        this.modalAction = null;
        this.form = null;
        this.shouldUpdateRichTextarea = false;
        this.quickText = null;
        this.$synced = true;

        this.state = _.assign({}, super.state, {
            modalVisible: false,
            modalHeader: '',

            inputLabel: '',
            inputUrl: '',
            inputWidth: '100%',
            inputHeight: '100%',

            showQuickTextModal: false,
        });

        this.bind([
            'setQuickText',
            'onQuickTextModalClose',
        ]);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.label !== this.props.label ||
            nextProps.disabled !== this.props.disabled ||
            nextProps.placeholder !== this.props.placeholder) {
            this.shouldUpdateRichTextarea = true;
            return true;
        }

        if(nextState.modalVisible !== this.state.modalVisible ||
            nextState.modalHeader !== this.state.modalHeader ||
            nextState.inputLabel !== this.state.inputLabel ||
            nextState.inputUrl !== this.state.inputUrl ||
            nextState.inputWidth !== this.state.inputWidth ||
            nextState.inputHeight !== this.state.inputHeight ||
            nextState.showQuickTextModal !== this.state.showQuickTextModal ||
            nextProps.value !== this.props.value) {
            return true;
        }

        this.shouldUpdateRichTextarea = false;
        return false;
    }

    setInstanceValue(value, triggerSync = true) {
        this.instance.setValue(value);
        if(triggerSync) {
            this.$synced = false;
        }
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        if(this.shouldUpdateRichTextarea) {
            this.reload();
        }
        if(this.instance && this.$synced){
            this.setInstanceValue(this.prop('value'), false);
        }
    }

    setQuickText(node) {
        this.quickText = node;
    }

    getAuraFormats() {
        return _.without(this.prop('formats'), ...this.prop('disabledFormats'));
    }

    getAllFormats() {
        return _.without([
            ...this.prop('formats'),
            ...extraFormats,
        ], ...this.prop('disabledFormats'));
    }

    reload() {
        const id = this.id();
        const label = this.prop('label');
        const disabled = this.prop('disabled') || false;
        const placeholder = this.prop('placeholder') || '';
        const formats = _.chain(this.getAuraFormats())
            .map(f => `'${f}'`)
            .join(',')
            .value();

        window.$Shadow.create(`<lightning:inputRichText value="{! v.value }" disabled="${disabled}" label="${label}" placeholder="${placeholder}" valid="{! v.config.valid }" formats="[${formats}]" messageWhenBadInput="{! v.config.errorMessage }"></lightning:inputRichText>`)
            .then(shadow => {
                const parent = document.getElementById(id);
                while(parent && parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
                this.instance = shadow;
                shadow.show(parent, this.prop('value'), value => {
                    this.subject.next(value);
                });
                this.instance.setConfig('valid', true);
            });
    }

    validate(newVal) {
        const errorMessage = super.validate(newVal);
        if(errorMessage) {
            this.instance.setConfig('valid', false);
            this.instance.setConfig('errorMessage', errorMessage);
        }
        else {
            this.instance.setConfig('valid', true);
        }

        return errorMessage;
    }

    doValidation(newVal) {
        if(this.prop('required')) {
            this.validate(newVal);
        }

        this.doContextValidation(newVal);
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject) {
            this.subject = new Subject();
            this.subject.debounceTime(this.prop('wait')).subscribe(data => {
                this.setValue(data);
                this.$synced = true;
            });
        }

        this.reload();
    }

    appendLink(e) {
        this.modalAction = ACTION_APPEND_LINK;
        if(this.form){
            this.form.clearMessages();
        }
        this.setState({
            modalVisible: true,
            modalHeader: 'Append Link',
            inputLabel: '',
            inputUrl: '',
        });
    }

    appendImage(e) {
        this.modalAction = ACTION_APPEND_IMAGE;
        if(this.form){
            this.form.clearMessages();
        }
        this.setState({
            modalVisible: true,
            modalHeader: 'Append Image',
            inputLabel: '',
            inputUrl: '',
        });
    }

    onQuickTextModalClose(quickText) {
        this.setState({
            showQuickTextModal: false,
        }, () => {
            if(quickText) {
                let value = this.instance.getValue() || '';
                value += quickText;
                this.setInstanceValue(value);
            }
        });
    }

    appendQuickText(e) {
        this.setState({
            showQuickTextModal: true,
        }, () => {
            Utils.delay(() => {
                this.quickText.focus();
            }, 50);
        });
    }


    modalConfirmed(e) {
        if(this.instance) {
            return Utils.delay("", 50).then( data => {
                const message = this.form.validate();
                if(!_.isEmpty(message)) {
                    return;
                }

                let value = this.instance.getValue() || '';
                if(this.modalAction === ACTION_APPEND_LINK) {
                    value += `<a href="${this.state.inputUrl}">${this.state.inputLabel}</a>`;
                }
                else if(this.modalAction === ACTION_APPEND_IMAGE) {
                    const width = this.state.inputWidth || '100%';
                    const height = this.state.inputHeight || '100%';
                    value += `<img src="${this.state.inputUrl}" alt="${this.state.inputLabel}" width="${width}" height="${height}"/>`;
                }

                this.setInstanceValue(value);
                Utils.delay(() => {
                    this.modalCancelled(e);
                }, 50);
            });
        }

        this.modalCancelled(e);
    }

    showAdvancedImageEdit() {
        // Currently width and height attributes will be stripped out by salesforce rich text editor
        return false;
    }

    modalCancelled(e) {
        this.setState({
            modalVisible: false,
            inputLabel: '',
            inputUrl: '',
        });
    }

    formValueChanged(value, name) {
        this.setState({
            [name]: value,
        });
    }

    setForm(node) {
        this.form = node;
    }

    renderField(props, state, variables) {
        const [{
            className,
            label,
            value,
            disabled,
            placeholder,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
        } = variables;

        const allFormats = this.getAllFormats();

        return (
            <div
                className={ className }
                data-anchor={ this.getDataAnchor() }
                { ...rest }
            >
                <div id={ id } className={ className }>
                    <Spinner variant="brand" size="medium" container="with" visible={ !this.instance }>
                    </Spinner>
                </div>
                <div className="slds-button-group slds-m-top_xx-small">
                    {
                        _.includes(allFormats, ACTION_APPEND_LINK) &&
                        <ButtonIcon iconName="utility:link" variant="border" size="medium" disabled={ isDisabled } alternativeText="Append Link" type="button" onClick={ e => this.appendLink(e) }>
                        </ButtonIcon>
                    }
                    {
                        _.includes(allFormats, ACTION_APPEND_IMAGE) &&
                        <ButtonIcon iconName="utility:image" variant="border" size="medium" disabled={ isDisabled } alternativeText="Append Image" type="button" onClick={ e => this.appendImage(e) }>
                        </ButtonIcon>
                    }
                    {
                        _.includes(allFormats, ACTION_APPEND_QUICKTEXT) &&
                        <ButtonIcon iconName="utility:quick_text" variant="border" size="medium" disabled={ isDisabled } alternativeText="Append Quick Text" type="button" onClick={ e => this.appendQuickText(e) }>
                        </ButtonIcon>
                    }
                </div>
                <Modal header={ state.modalHeader } visible={ state.modalVisible } footer={
                    <div>
                        <Button variant="tertiary" label="Cancel" onClick={ e => this.modalCancelled(e) }></Button>
                        <Button variant="primary" label="Save" onClick={ e => this.modalConfirmed(e) }></Button>
                    </div>
                } onClose={ e => this.modalCancelled(e) }>
                    <Form name={ `${id}-form` } ref={ node => this.setForm(node) }>
                        <div class="slds-grid slds-grid_pull-padded-medium slds-wrap">
                            <div class="slds-col slds-p-horizontal_medium slds-size_1-of-1">
                                <Input name="inputLabel" label="Label" value={ state.inputLabel } onValueChange={ (val, name) => this.formValueChanged(val, name) } required="true"></Input>
                            </div>
                            <div class="slds-col slds-p-horizontal_medium slds-p-top_medium slds-size_1-of-1">
                                <Input name="inputUrl" label="URL" value={ state.inputUrl } onValueChange={ (val, name) => this.formValueChanged(val, name) } required="true"></Input>
                            </div>
                            {
                                this.showAdvancedImageEdit() ?
                                [
                                <div class="slds-col slds-p-horizontal_medium slds-p-top_medium slds-size_1-of-1">
                                    <Input name="inputWidth" label="Image Width" value={ state.inputWidth } onValueChange={ (val, name) => this.formValueChanged(val, name) }></Input>
                                </div>,
                                <div class="slds-col slds-p-horizontal_medium slds-p-top_medium slds-size_1-of-1">
                                    <Input name="inputHeight" label="Image Height" value={ state.inputHeight } onValueChange={ (val, name) => this.formValueChanged(val, name) }></Input>
                                </div>,
                                ]
                                : []
                            }
                        </div>
                    </Form>
                </Modal>
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

InputRichText.propTypes = PropTypes.extend(AbstractField.propTypes, {
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    formats: PropTypes.isArray('formats').defaultValue([
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'clean',
        'table',
        'header',
        'background',
        'color',
        'code',
        'script',
    ]),
    disabledFormats: PropTypes.isArray('disabledFormats').defaultValue([
        'append_link',
        'append_image',
        'append_quickText',
    ]),
    categories: PropTypes.isArray('categories'),
    channel: PropTypes.isString('channel'),
    mergeFieldContext: PropTypes.isObject('mergeFieldContext'),
    wait: PropTypes.isNumber('wait').defaultValue(200).demoValue(200),
});

InputRichText.propTypes.name.demoValue('inputRichText');
InputRichText.propTypes.value = PropTypes.isString('value').demoValue('hi');
InputRichText.propTypes.label.demoValue('Input Rich Text');
InputRichText.propTypes.placeholder.demoValue('Edit rich text here');

InputRichText.propTypesRest = true;
InputRichText.displayName = "InputRichText";
