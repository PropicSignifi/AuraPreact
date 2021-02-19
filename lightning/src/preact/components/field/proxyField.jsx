import { h, render, Component } from 'preact';
import AbstractField from './field';

export default class AbstractProxyField extends AbstractField {
    constructor() {
        super();

        this.$field = null;
    }

    setField(field) {
        this.$field = field;
    }

    validate(newVal) {
        return this.$field && this.$field.validate(newVal);
    }

    doValidation(newVal) {
        return this.$field && this.$field.doValidation(newVal);
    }

    setErrorMessage(errorMessage) {
        this.$field && this.$field.setErrorMessage(errorMessage);
    }

    getErrorMessage() {
        return this.$field && this.$field.getErrorMessage();
    }

    setDisabled(disabled) {
        this.$field && this.$field.setDisabled(disabled);
    }

    setReadonly(readonly) {
        this.$field && this.$field.setReadonly(readonly);
    }
}

AbstractProxyField.displayName = "AbstractProxyField";
