import { h, render, Component } from 'preact';
import AbstractProxyField from '../field/proxyField';
import PropTypes from '../propTypes/propTypes';
import InputFile from '../inputFile/inputFile';
import Utils from '../utils/utils';

export default class InputImage extends AbstractProxyField {
    constructor() {
        super();
    }

    onImageValueChange(newVal) {
        if(_.isFunction(this.prop("onValueChange"))) {
            this.prop("onValueChange")(newVal);
        }
    }

    processFile(file) {
        if(this.prop('crop') && file) {
            const self = this;

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    let image = null;
                    let cropper = null;

                    const cropOptions = self.prop('cropOptions') || {
                        viewMode: 2,
                        minContainerHeight: 300,
                    };

                    return Utils.alert({
                        header: 'Crop Image',
                        forceModal: true,
                        renderContent: () => {
                            return (
                                <img ref={ node => image = node } src={ reader.result } width="100%"></img>
                            );
                        },
                        componentDidMount: () => {
                            window.$Utils.requireLibrary(this.getPreactContainerName(), 'Cropper').then(() => {
                                cropper = new Cropper(image, cropOptions);
                            });
                        },
                        onSaveText: 'Crop and Upload',
                        onSave: () => {
                            const canvas = cropper.getCroppedCanvas({
                                width: self.prop('cropWidth'),
                                height: self.prop('cropHeight'),
                            });
                            canvas.toBlob(blob => {
                                cropper.destroy();
                                cropper = null;

                                resolve(blob);
                            });
                        },
                        onOtherText: 'Discard Crop and Upload',
                        onOther: () => {
                            cropper.destroy();
                            cropper = null;

                            resolve(file);
                        },
                    });
                };
                reader.readAsDataURL(file);
            });
        }
        else {
            return Promise.resolve(file)
        }
    }

    render(props, state) {
        const {
            configurer,
            onValueChange,
            ...rest,
        } = props;

        const newConfigurer = _.assign({}, configurer);
        newConfigurer.processFile = file => {
            return this.processFile(file);
        };

        return (
            <InputFile
                ref={ node => this.setField(node) }
                accept="image/*"
                showPreview="true"
                onValueChange={ newVal => this.onImageValueChange(newVal) }
                configurer={ newConfigurer }
                data-type={ this.getTypeName() }
                { ...rest }
            >
            </InputFile>
        );
    }
}

InputImage.propTypes = PropTypes.extend(InputFile.propTypes, {
    value: PropTypes.isString('value'),
    showPreview: PropTypes.isBoolean('showPreview').defaultValue(true).demoValue(true),
    accept: PropTypes.isString('accept').demoValue('image/*').defaultValue('image/*'),
    crop: PropTypes.isBoolean('crop').defaultValue(false).demoValue(false),
    cropWidth: PropTypes.isNumber('cropWidth').defaultValue(200).demoValue(200),
    cropHeight: PropTypes.isNumber('cropHeight').defaultValue(160).demoValue(160),
    cropOptions: PropTypes.isObject('cropOptions'),
});

InputImage.propTypes.name.demoValue('inputImage');
InputImage.propTypes.label.demoValue('Input Image');

InputImage.propTypesRest = true;
InputImage.displayName = "InputImage";
