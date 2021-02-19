import { h, render, Component } from 'preact';
import AbstractProxyField from '../field/proxyField';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';

export default class InputEmail extends AbstractProxyField {
    constructor() {
        super();
    }

    onEmailValueChange(newVal) {
        if(_.isFunction(this.prop("onValueChange"))) {
            this.prop("onValueChange")(newVal);
        }
    }

    render(props, state) {
        const {
            pattern,
            onValueChange,
            ...rest,
        } = props;

        const emailPattern = pattern || '^(.+)@(.+)\.(.+)$';

        return (
            <Input
                ref={ node => this.setField(node) }
                type="email"
                pattern={ emailPattern }
                onValueChange={ newVal => this.onEmailValueChange(newVal) }
                data-type={ this.getTypeName() }
                { ...rest }
            >
            </Input>
        );
    }
}

InputEmail.propTypes = PropTypes.extend(Input.propTypes, {
    value: PropTypes.isString('value'),
});

InputEmail.propTypes.name.demoValue('inputEmail');
InputEmail.propTypes.label.demoValue('Input Email');

InputEmail.propTypesRest = true;
InputEmail.displayName = "InputEmail";
