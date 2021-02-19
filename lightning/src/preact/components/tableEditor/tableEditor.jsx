import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Table from '../table/table';
import Button from '../button/button';

export default class TableEditor extends AbstractField {
    constructor() {
        super();
    }

    setTableValue(newVal) {
        this.setValue(newVal);
    }

    validate(newVal) {
        if(this.prop('required') && _.isEmpty(newVal)) {
            return `'${this.prop('label')}' is required`;
        }

        return super.validate(newVal);
    }

    onCreate() {
        const newItem = _.isFunction(this.prop('onCreate')) ? this.prop('onCreate')() : {};
        const newVal = [
            ...(this.prop('value')),
            newItem,
        ];
        this.setTableValue(newVal);
    }

    onDelete() {
        this.setTableValue(_.dropRight(this.prop('value')));
    }

    renderField(props, state, variables) {
        const [{
            columns,
            value,
            isAddDisabled,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        return (
            <div>
                <Table
                    variant="responsive"
                    resizable="true"
                    data={ value }
                    columns={ columns }
                    disabled={ isDisabled }
                    readonly={ isReadonly }
                    onValueChange={ this.setTableValue.bind(this) }
                >
                </Table>
                <div className="slds-grid">
                    <div className="slds-button-group slds-col_bump-left slds-p-around_x-small">
                        <Button
                            variant="tertiary"
                            label="Remove"
                            onClick={ e => this.onDelete() }
                        >
                        </Button>
                        <Button
                            variant="tertiary"
                            label="Add"
                            disabled={ isAddDisabled }
                            onClick={ e => this.onCreate() }
                        >
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

TableEditor.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isArray('value').required(),
    columns: PropTypes.isArray('columns').required(),
    onCreate: PropTypes.isFunction('onCreate'),
    isAddDisabled: PropTypes.isBoolean('isAddDisabled').defaultValue(false),
});

TableEditor.propTypes.name.demoValue('tableEditor');
TableEditor.propTypes.label.demoValue('TableEditor');

TableEditor.propTypesRest = true;
TableEditor.displayName = "TableEditor";
