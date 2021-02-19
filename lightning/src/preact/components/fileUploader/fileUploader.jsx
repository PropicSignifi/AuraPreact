import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import FileDroppableZone from '../input/fileDroppableZone';
import FlatPanel from '../flatPanel/flatPanel';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Button from '../button/button';
import styles from './styles.less';
import Utils from '../utils/utils';
import Spinner from '../spinner/spinner';

const MAX_FILE_SIZE = 1900000;
const CHUNK_SIZE = 950000;

const formatFileSize = size => {
    return Number(size / (1024 * 1024)).toFixed(2);
};

export default class FileUploader extends BaseComponent {
    constructor() {
        super();

        this.state = {
            message: null,
            loading: false,
            uploadButtonDisabled: true,
        };

        this.bind([
            'sendMessage',
            'setIFrame',
        ]);

        this._files = [];
        this.vfHost = null;
        this._iframe = null;
    }

    componentDidMount() {
        super.componentDidMount();

        //Add message listener
        if(this.prop('type') === 'raw') {
            window.addEventListener("message", event => {
                // Handle the message
                if(event.data.state === 'LOADED') {
                    //Set vfHost which will be used later to send message
                    this.vfHost = event.data.vfHost;
                }
                else if(event.data.state === 'uploadFileSelected') {
                    this.setState({
                        uploadButtonDisabled: false,
                    });
                }
                else if(event.data.state === 'fileUploadprocessed') {
                    Utils.toast({
                        variant: event.data.messageType,
                        content: event.data.message,
                    });

                    this.setState({
                        loading: false,
                        uploadButtonDisabled: true,
                    }, () => {
                        const newFile = {
                            name: event.data.name,
                            type: event.data.type,
                        };
                        const newFiles = [newFile];
                        const attachIds = {};
                        attachIds[newFile.name] = event.data.attachId;
                        this.prop('onFilesUploaded')(attachIds);
                        this.setValue(newFiles);
                    });
                }
            }, false);
        }
    }

    setIFrame(node) {
        this._iframe = node;
    }

    addFiles(files) {
        const oldFiles = this.prop('value');

        const valid = this.checkValid(oldFiles, files);
        if(!valid) {
            return;
        }

        const newFiles = [];
        _.each(oldFiles, file => {
            newFiles.push(file);
        });
        const addedFiles = [];
        if(this.prop('multiple')) {
            _.each(files, file => {
                if(!_.find(newFiles, f => f.name === file.name)) {
                    if(this.prop('parentId') && file.size > MAX_FILE_SIZE) {
                        return Utils.toast({
                            variant: 'error',
                            content: `File size cannot exeed ${formatFileSize(MAX_FILE_SIZE)} MB. Selected file size: ${formatFileSize(file.size)} MB.`,
                        });
                    }

                    newFiles.push(file);
                    addedFiles.push(file);
                }
            });
        }
        else {
            if(_.isEmpty(newFiles)) {
                newFiles.push(files[0]);
            }
            else {
                newFiles[0] = files[0];
            }
            addedFiles.push(files[0]);
        }

        if(!_.isEqual(this._files, newFiles)) {
            this._files = newFiles;

            if(this.prop('parentId')) {
                const attachIds = {};
                this.setState({
                    loading: true,
                }, () => {
                    Utils.delay(() => {
                        this.uploadFiles(addedFiles, attachIds, () => {
                            this.setState({
                                loading: false,
                            }, () => {
                                this.prop('onFilesUploaded')(attachIds);
                                this.setValue(newFiles);
                            });
                        });
                    }, 50);
                });
            }
            else {
                this.setValue(newFiles);
            }
        }
    }

    uploadFiles(files, attachIds, callback) {
        const [file, ...otherFiles] = files;

        if(file) {
            this.uploadFile(file, attachIds, () => {
                this.uploadFiles(otherFiles, attachIds, callback);
            });
        }
        else {
            Utils.delay(() => {
                if(_.isFunction(callback)) {
                    callback();
                }
            }, 50);
        }
    }

    uploadFile(file, attachIds, callback) {
        const fr = new FileReader();

        fr.onload = () => {
            let fileContents = fr.result;
            const base64Mark = 'base64,';
            const dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;

            fileContents = fileContents.substring(dataStart);

            this.upload(file, fileContents, attachIds, callback);
        };

        fr.readAsDataURL(file);
    }

    upload(file, fileContents, attachIds, callback) {
        const fromPos = 0;
        const toPos = Math.min(fileContents.length, fromPos + CHUNK_SIZE);

        // start with the initial chunk
        this.uploadChunk(file, fileContents, fromPos, toPos, '', attachIds, callback);
    }

    uploadChunk(file, fileContents, fromPos, toPos, attachId, attachIds, callback) {
        const chunk = fileContents.substring(fromPos, toPos);

        window.$ActionService.DataLightningExtension.invokePlain('uploadFile', {
            parentId: this.prop('parentId'),
            fileName: file.name,
            base64Data: encodeURIComponent(chunk),
            contentType: file.type,
            fileId: attachId
        }).then(attachId => {
            fromPos = toPos;
            toPos = Math.min(fileContents.length, fromPos + CHUNK_SIZE);
            attachIds[file.name] = attachId;
            if (fromPos < toPos) {
                this.uploadChunk(file, fileContents, fromPos, toPos, attachId, attachIds, callback);
            }
            else {
                if(_.isFunction(callback)) {
                    callback();
                }
            }
        });
    }

    setValue(files) {
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(files);
        }
    }

    removeFile(file) {
        const oldFiles = this.prop('value');
        const newFiles = _.without(oldFiles, file);

        this.setValue(newFiles);
    }

    handleDropFiles(e) {
        if(e.dataTransfer && e.dataTransfer.files) {
            if(this.input) {
                try {
                    this.input.files = e.dataTransfer.files;
                    this.addFiles(e.dataTransfer.files);
                }
                catch(ex) {
                    this.addFiles(e.dataTransfer.files);
                }
            }
        }
    }

    handleChange(e) {
        if(e.target && e.target.files) {
            this.addFiles(e.target.files);
        }
    }

    createFileInput(id, disabled, multiple, accept) {
        return (
            <input
                ref={ dom => this.setFileInput(dom) }
                className="slds-file-selector__input slds-assistive-text"
                type="file"
                multiple={ multiple }
                accept={ accept }
                id={ id }
                disabled={ disabled }
                value={ this.prop('value') }
                onChange={ e => this.handleChange(e) }>
            </input>
        );
    }

    setValidFileTypes() {
        const accept = this.prop('accept');
        if(!accept || accept === '*.*') {
            this.validFileTypes = null;
            this.validFileRegexes = null;
        }
        else {
            const fileTypes = [];
            const fileTypeRegexes = [];
            _.each(accept.split(','), item => {
                item = item.trim();
                fileTypes.push(item);
                const pos = item.lastIndexOf('.');
                if(pos >= 0) {
                    item = item.substring(pos);
                    fileTypeRegexes.push('.*\\' + item);
                }
                else {
                    fileTypeRegexes.push(_.replace(item, '*', '.*'));
                }
            });

            this.validFileTypes = fileTypes;
            this.validFileRegexes = fileTypeRegexes;
        }
    }

    isValidFileType(file) {
        if(this.validFileRegexes) {
            return this.validFileRegexes.some(fileType => new RegExp(fileType).test(file.type) || new RegExp(fileType).test(file.name));
        }

        return true;
    }

    checkValid(oldFiles, addedFiles) {
        let max = this.prop('max');

        if(!this.prop('multiple')) {
            max = 1;
        }

        if(max >= 0 && (_.size(oldFiles) + _.size(addedFiles) > max)) {
            this.setState({
                message: this.prop('messageWhenTooManyFiles').replace('{0}', max),
            });

            return false;
        }

        if(!_.every(addedFiles, this.isValidFileType.bind(this))) {
            this.setState({
                message: this.prop('messageWhenInvalidType').replace('{0}', _.join(this.validFileTypes, ',')),
            });

            return false;
        }

        this.setState({
            message: null,
        });

        return true;
    }

    setFileInput(input) {
        this.input = input;
    }

    sendMessage() {
        //Prepare message in the format required in VF page
        const message = {
            origin: window.location.hostname,
            uploadFile : true
        };

        //Send message to VF
        const vfWindow = this._iframe.contentWindow;
        vfWindow.postMessage(message, this.vfHost);
        this.setState({
            loading: true,
        });
    }

    render(props, state) {
        const [{
            className,
            header,
            message,
            buttonText,
            multiple,
            accept,
            disabled,
            value,
            type,
            children,
        }, rest] = this.getPropValues();

        const id = this.id();

        this.setValidFileTypes();

        if(type === 'standard') {
            return (
                <FlatPanel className={ `slds-is-relative ${className}` } style="panel" header={ header } data-type={ this.getTypeName() } { ...rest }>
                    <Spinner className={ this.state.loading ? '' : 'slds-hide' }></Spinner>
                    <FileDroppableZone
                        disabled={ disabled }
                        visualizeDropzone="false"
                        className="slds-p-around_large"
                        onDrop={ e => this.handleDropFiles(e) }
                        >
                        <div className="slds-align_absolute-center">
                            { message || 'Please drag files here or click button to upload files.' }
                        </div>
                        { this.createFileInput(id, disabled, multiple, accept) }
                        <label className="slds-file-selector__body slds-align_absolute-center slds-m-top_large" for={ id }>
                            <span className={ window.$Utils.classnames(
                                'slds-button slds-button--neutral',
                                {
                                    'disabled-element': disabled,
                                }
                                ) }>
                                <PrimitiveIcon variant="bare" iconName="utility:upload" className="slds-button__icon slds-button__icon--left"></PrimitiveIcon>
                                { buttonText }
                            </span>
                        </label>
                        {
                            _.isArrayLike(value) && value.length > 0?
                            <div className="slds-box slds-align_absolute-center slds-m-top_medium slds-p-around_small">
                                <ul>
                                {
                                    _.map(value, file => {
                                        return (
                                        <li class="slds-grid slds-grid_vertical-align-center">
                                            <span>{ file.name }</span>
                                            <ButtonIcon iconName="ctc-utility:a_delete" size="small" variant="bare" onClick={ e => this.removeFile(file) }></ButtonIcon>
                                        </li>
                                        );
                                    })
                                }
                                </ul>
                            </div>
                            : null
                        }
                        {
                            state.message != null ?
                            <div className="slds-align_absolute-center slds-m-top_small">
                                <div class={ styles.errorText }>{ state.message }</div>
                            </div>
                            : null
                        }
                        { children }
                    </FileDroppableZone>
                </FlatPanel>
            );
        }
        else if(type === 'raw' && this.prop('parentId')) {
            return (
                <div className={ `slds-is-relative ${className}` }>
                    <Spinner className={ this.state.loading ? '' : 'slds-hide' }></Spinner>
                    <iframe
                        ref={ this.setIFrame }
                        src={ `/apex/${Utils.getNamespacePrefix()}FileUploadPage?id=${this.prop('parentId')}&lcHost=${window.location.hostname}` }
                        className={ styles.vfFrame }
                    >
                    </iframe>
                    <Button
                        label={ buttonText }
                        onClick={ this.sendMessage }
                        disabled={ this.state.uploadButtonDisabled }
                    >
                    </Button>
                </div>
            );
        }
    }
}

FileUploader.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    header: PropTypes.isString('header').demoValue('Upload Files').defaultValue('Upload Files'),
    message: PropTypes.isObject('message'),
    buttonText: PropTypes.isString('buttonText').demoValue('Upload Files').defaultValue('Upload Files'),
    multiple: PropTypes.isBoolean('multiple').demoValue(true).defaultValue(true),
    max: PropTypes.isNumber('max').demoValue(-1).defaultValue(-1),
    disabled: PropTypes.isBoolean('disabled').demoValue(false).defaultValue(false),
    accept: PropTypes.isString('accept').demoValue('*.*').defaultValue('*.*'),
    messageWhenTooManyFiles: PropTypes.isString('messageWhenTooManyFiles').defaultValue('The max number of files allowed is {0}'),
    messageWhenInvalidType: PropTypes.isString('messageWhenInvalidType').defaultValue('We only allow uploading files with types of {0}'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    parentId: PropTypes.isString('parentId'),
    onFilesUploaded: PropTypes.isFunction('onFilesUploaded'),
    value: PropTypes.isObject('value'),
    children: PropTypes.isChildren('children'),
    type: PropTypes.isString('type').values([
        'standard',
        'raw',
    ]).defaultValue('standard').demoValue('standard'),
};

FileUploader.propTypesRest = true;
FileUploader.displayName = "FileUploader";
