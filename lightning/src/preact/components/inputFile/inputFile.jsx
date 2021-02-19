import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';
import { PrimitiveIcon } from '../icon/icon';
import createLoadingIndicator from '../busyloading/busyloading';
import Utils from '../utils/utils';
import styles from './styles.less';

export default class InputFile extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.bind([
        ]);

        this.$loadingIndicator = createLoadingIndicator(false);
    }

    shouldShowPreview() {
        return this.prop('value') && this.prop('showPreview');
    }

    uploadFile(file, configurer) {
        if(_.isFunction(configurer.uploadFile)) {
            this.$loadingIndicator.until(
                configurer.uploadFile(file).then(url => {
                    this.setValue(url);
                })
            );
        }
    }

    handleChange(e) {
        if(e.target && e.target.files) {
            const file = e.target.files[0];
            const configurer = this.prop('configurer');
            if(_.isFunction(configurer.processFile)) {
                configurer.processFile(file).then(file => {
                    this.uploadFile(file, configurer);
                });
            }
            else {
                this.uploadFile(file, configurer);
            }
        }
    }

    renderField(props, state, variables) {
        const [{
            name,
            value,
            disabled,
            readonly,
            required,
            onValueChange,
            editable,
            previewWidth,
            previewHeight,
            configurer,
            accept,
        }, rest] = this.getPropValues();

        const LoadingZone = this.$loadingIndicator.Zone;

        return (
            <LoadingZone>
                <Input
                    label="Path"
                    name="path"
                    variant="label-removed"
                    disabled={ !editable || disabled || readonly }
                    value={ value }
                    onValueChange={ newVal => this.setValue(newVal) }
                    addonStyle="bareOnAfter"
                    addonAfter={
                    <div className="slds-file-selector slds-file-selector_files">
                        <div className="">
                            <input
                                id={ `input_${this.id()}` }
                                type="file"
                                className="slds-file-selector__input slds-assistive-text"
                                accept={ accept }
                                disabled={ disabled || !_.isFunction(configurer.uploadFile) }
                                multiple="false"
                                onChange={ e => this.handleChange(e) }
                            >
                            </input>
                            <label className="slds-file-selector__body" for={ `input_${this.id()}` }>
                                <span className={ `slds-file-selector__button slds-button slds-button_neutral ${styles.uploadButton}` }>
                                    <PrimitiveIcon
                                        className="slds-button__icon"
                                        iconName="utility:upload"
                                    >
                                    </PrimitiveIcon>
                                </span>
                            </label>
                        </div>
                    </div>
                    }
                >
                </Input>
                {
                    this.shouldShowPreview() && (
                    <div className="slds-file slds-file_card slds-has-title slds-m-top_xx-small">
                        <figure>
                            <a href={ value } target="_blank">
                                <span className="slds-assistive-text">Preview:</span>
                                <img src={ value } alt="Preview" style={ `height: ${previewHeight}px; width: ${previewWidth}px` }/>
                            </a>
                        </figure>
                    </div>
                    )
                }
            </LoadingZone>
        );
    }
}

InputFile.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isString('value').demoValue(''),
    editable: PropTypes.isBoolean('editable').defaultValue(true).demoValue(true),
    showPreview: PropTypes.isBoolean('showPreview').defaultValue(false).demoValue(false),
    previewWidth: PropTypes.isNumber('previewWidth').defaultValue(200).demoValue(200),
    previewHeight: PropTypes.isNumber('previewHeight').defaultValue(200).demoValue(200),
    accept: PropTypes.isString('accept').demoValue('*.*').defaultValue('*.*'),
    configurer: PropTypes.isObject('configurer').shape({
        uploadFile: PropTypes.isFunction('uploadFile'),
        processFile: PropTypes.isFunction('processFile'),
    }),
});

InputFile.propTypes.name.demoValue('Input File');
InputFile.propTypes.label.demoValue('InputFile');

InputFile.propTypesRest = true;
InputFile.displayName = "InputFile";
