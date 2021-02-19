import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';

export default class Select extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            options: [],
        });
    }

    loadFromDataProducer(dataProducer) {
        if(dataProducer) {
            window.$DataProducer.produce(dataProducer).then(data => {
                this.setState({
                    options: data,
                });
            });
        }
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadFromDataProducer(this.prop("dataProducer"));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(nextProps.dataProducer && nextProps.dataProducer !== this.prop("dataProducer")) {
            this.loadFromDataProducer(nextProps.dataProducer);
        }
    }

    onChange(e, options) {
        const val = e.target.value;
        const option = _.find(options, o => _.toString(o.value) === val);
        this.setValue(option.value);
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
            options,
            dataProducer,
            multiple,
            onValueChange,
            children,
        }, rest] = this.getPropValues();

        const realOptions = _.isEmpty(state.options) ? options : state.options;

        return (
            <div className="slds-select_container">
                <select className="slds-select" id={ variables.id } name={ name } value={ value } disabled={ variables.isDisabled } readonly={ variables.isReadonly } multiple={ multiple } onChange={ e => this.onChange(e, realOptions) } { ...rest }>
                    {
                        !_.isEmpty(realOptions) ?
                        _.map(realOptions, option => {
                            return (
                                <option key={ option.value } value={ option.value } selected={ option.value === value }>{ option.label }</option>
                            );
                        })
                        :
                        { children }
                    }
                </select>
            </div>
        );
    }
}

Select.propTypes = PropTypes.extend(AbstractField.propTypes, {
    options: PropTypes.isArray('options').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
    }),
    dataProducer: PropTypes.isString('dataProducer').demoValue(''),
    multiple: PropTypes.isBoolean('multiple'),
    children: PropTypes.isChildren('children'),
});

Select.propTypes.name.demoValue('select');
Select.propTypes.label.demoValue('Select');

Select.propTypesRest = true;
Select.displayName = "Select";
