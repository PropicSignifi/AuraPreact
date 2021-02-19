import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import InputUrl from '../inputUrl/inputUrl';
import Helptext from '../helptext/helptext';

export default class InputVideo extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    onVideoValueChange(key, value) {
        if(key === 'url') {
            this.fetchPreviewUrl(value);
        }
        else {
            this.onKeyValueChange(key, value);
        }
    }

    onKeyValueChange(key, value) {
        this.setValue(_.assign({}, this.prop('value'), {
            [key]: value,
        }));
    }

    fetchPreviewUrl(url) {
        const value = this.prop('value');
        if(value && value.previewUrl) {
            return this.onKeyValueChange('url', url);
        }

        let video_id = null;
        let result = null;
        if((result = /https?:\/\/vimeo.com\/.*?([\d]+)/.exec(url))) {
            video_id = result[1];
            this.setValue({
                url,
            });
            window.$Utils.ajax({
                url: `https://vimeo.com/api/v2/video/${video_id}.json`,
                method: 'GET',
                callback: data => {
                    const json = JSON.parse(data.response);
                    const previewUrl = _.get(json[0], 'thumbnail_large');
                    this.setValue({
                        url,
                        previewUrl,
                    });
                }
            });
        }
        else if((result = /https?:\/\/(?:www.)?youtube.com\/watch\?v=([^&\/]+)/.exec(url)) ||
            (result = /https?:\/\/(?:www.)?youtu.be\/([^&\/]+).*/.exec(url))) {
            video_id = result[1];
            const previewUrl = `https://img.youtube.com/vi/${video_id}/0.jpg`;
            this.setValue({
                url,
                previewUrl,
            });
        }
        else {
            this.onKeyValueChange('url', url);
        }
    }

    render(props, state) {
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
            onValueChange,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        return (
            <fieldset className={ window.$Utils.classnames(
                'slds-form-element slds-form_compound',
                {
                    'slds-form--inline': variant === 'label-hidden',
                },
                className
                ) }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    variant !== 'label-removed' ?
                    <legend className="slds-form-element__legend slds-form-element__label slds-form-element__label-has-tooltip">
                        <span className={ window.$Utils.classnames(
                            {
                                'slds-assistive-text': variant === 'label-hidden',
                            }
                            ) }>
                            { label }
                        </span>
                        { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"></Helptext> : null }
                    </legend>
                    : null
                }
                <div className="slds-form-element__control slds-grow">
                    <div className="slds-form-element__group">
                        <div className="slds-form-element__row">
                            <InputUrl
                                className="slds-size_1-of-1"
                                name={ `${name}-url` }
                                label={ `${label} URL` }
                                required={ required }
                                disabled={ isDisabled }
                                readonly={ isReadonly }
                                value={ value && value.url }
                                onValueChange={ newVal => this.onVideoValueChange('url', newVal) }
                            >
                            </InputUrl>
                        </div>
                        <div className="slds-form-element__row">
                            <InputUrl
                                className="slds-size_1-of-1"
                                name={ `${name}-previewUrl` }
                                label={ `${label} Preview URL` }
                                required={ required }
                                disabled={ isDisabled }
                                readonly={ isReadonly }
                                value={ value && value.previewUrl }
                                onValueChange={ newVal => this.onVideoValueChange('previewUrl', newVal) }
                            >
                            </InputUrl>
                        </div>
                    </div>
                </div>
            </fieldset>
        );
    }
}

InputVideo.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isObject('value').shape({
        url: PropTypes.isString('url'),
        previewUrl: PropTypes.isString('previewUrl'),
    }),
});

InputVideo.propTypes.name.demoValue('inputVideo');
InputVideo.propTypes.label.demoValue('Input Video');

InputVideo.propTypesRest = true;
InputVideo.displayName = "InputVideo";
