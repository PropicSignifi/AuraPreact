import { h, render, Component } from 'preact';
import Picklist from '../picklist/picklist';
import PropTypes from '../propTypes/propTypes';
import Utils from '../utils/utils';

export const renderFieldRaw = (type, params) => {
    if(!type) {
        return null;
    }

    const components = require('components');
    const Comp = _.isString(type) ? components[type] : type;
    if(Comp) {
        return (
            <Comp key={ params.name } { ...params }></Comp>
        );
    }
    else {
        return null;
    }
};

const fieldRenderers = {
    'Boolean': params => renderFieldRaw('Input', _.assign({}, {
        type: 'toggle',
        checkStyle: 'label',
    }, params)),

    'Number': params => renderFieldRaw('Input', _.assign({}, {
        type: 'number',
    }, params)),

    'Integer': params => renderFieldRaw('Input', _.assign({}, {
        type: 'formatted-number',
        formatter: 'decimal',
        allowedPattern: '^[0-9,]*$',
        step: '1',
    }, params)),

    'Currency': params => renderFieldRaw('InputCurrency', _.assign({}, params)),

    'Days': params => renderFieldRaw('InputDays', _.assign({}, params)),

    'Email': params => renderFieldRaw('InputEmail', _.assign({}, params)),

    'Percent': params => renderFieldRaw('InputPercent', _.assign({}, params)),

    'Phone': params => renderFieldRaw('InputPhone', _.assign({}, params)),

    'Video': params => renderFieldRaw('InputVideo', _.assign({}, params)),

    'URL': params => renderFieldRaw('InputUrl', _.assign({}, params)),

    'String': params => renderFieldRaw('Input', _.assign({}, {
        type: 'text',
    }, params)),

    'Text': params => renderFieldRaw('Input', _.assign({}, {
        type: 'text',
    }, params)),

    'LongText': params => renderFieldRaw('Textarea', _.assign({}, params)),

    'Enum': {
        propTypes: _.assign({}, Picklist.propTypes, {
            values: PropTypes.isArray('values'),
            valuesUrl: PropTypes.isString('valuesUrl'),
        }),

        render: params => {
            const omittedValues = ['values', 'valuesUrl'];

            const options = _.map(params.values, value => {
                return {
                    label: value,
                    value,
                };
            });

            let configurer = null;
            if(params.valuesUrl) {
                configurer = params.configurer || {};
                configurer.getOptions = () => {
                    return fetch(params.valuesUrl)
                        .then(resp => resp.json())
                        .then(data => _.map(data, value => {
                            return {
                                label: value,
                                value,
                            };
                        }));
                };
            }

            return renderFieldRaw('Picklist', _.assign({}, {
                options,
                configurer,
            }, _.omit(params, omittedValues)));
        },
    },

    'Date': params => renderFieldRaw('DatePicker', _.assign({}, params)),

    'Time': params => renderFieldRaw('TimePicker', _.assign({}, params)),

    'ObjectList': params => renderFieldRaw('ObjectTableField', _.assign({}, params)),
};

export const registerFieldRenderer = (type, renderer) => {
    if(type && renderer) {
        fieldRenderers[type] = renderer;
    }
};

export const unregisterFieldRenderer = type => {
    if(type) {
        delete fieldRenderers[type];
    }
};

export const getFieldRenderers = () => fieldRenderers;

const renderField = (type, params, container) => {
    if(!type) {
        return null;
    }

    const directParams = {};
    const expressionParams = {};
    _.forEach(params, (value, key) => {
        if(key.startsWith('@')) {
            expressionParams[key.substring(1)] = Utils.evalInContext(value, {
                '$Data': container || {},
            });
        }
        else {
            directParams[key] = value;
        }
    });

    const finalParams = _.assign({}, directParams, expressionParams);

    const renderer = fieldRenderers[type];
    if(_.isFunction(renderer)) {
        return renderer(finalParams);
    }
    else if(_.isPlainObject(renderer) && _.isFunction(renderer.render)) {
        return renderer.render(finalParams);
    }
    else {
        return renderFieldRaw(type, finalParams);
    }
};

export default renderField;
