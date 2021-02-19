import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Button from '../button/button';
import Modal from '../modal/modal';
import DualListbox from '../dualListbox/dualListbox';
import TableConfig from './tableConfig';

export default class TableConfigButton extends BaseComponent {
    constructor() {
        super();

        this.state = {
            showConfigModal: false,
            columns: null,
        };
    }

    onClick(e) {
        this.setState({
            showConfigModal: true,
        });
    }

    onCancel(e) {
        this.setState({
            columns: null,
            showConfigModal: false,
        });
    }

    onSave(e) {
        TableConfig.setColumns(this.prop('name'), this.state.columns);

        this.setState({
            columns: null,
            showConfigModal: false,
        }, () => {
            if(_.isFunction(this.prop('onValueChange'))) {
                this.prop('onValueChange')();
            }
        });
    }

    onColumnsChange(newVal) {
        this.setState({
            columns: newVal,
        });
    }

    renderFooter() {
        return (
            <div>
                <Button variant="tertiary" label="Cancel" onClick={ e => this.onCancel(e) }></Button>
                <Button variant="save" label="Save" onClick={ e => this.onSave(e) }></Button>
            </div>
        );
    }

    getColumnLabel(column) {
        if(_.isString(column.header)) {
            return column.header;
        }

        return column.label || column.name;
    }

    render(props, state) {
        const [{
            className,
            name,
            columns,
            iconName,
            iconClass,
            variant,
            size,
            disabled,
            alternativeText,
            type,
        }, rest] = this.getPropValues();

        const options = _.map(columns, column => {
            return {
                label: this.getColumnLabel(column),
                value: column.name,
                locked: column.locked,
            };
        });

        let visibleColumns = state.columns || TableConfig.getColumns(name);
        if(_.isEmpty(visibleColumns)) {
            visibleColumns = _.map(columns, column => column.name);
        }

        return (
            <ButtonIcon
                iconName={ iconName }
                iconClass={ iconClass }
                variant={ variant }
                size={ size }
                disabled={ disabled }
                alternativeText={ alternativeText }
                type={ type }
                onClick={ e => this.onClick(e) }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <Modal header="Table Setting" visible={ this.state.showConfigModal } footer={ this.renderFooter() } onClose={ e => this.onCancel(e)  }>
                    <div className="slds-m-around_x-small">
                        <DualListbox
                            name="tableColumns"
                            label="Table Columns"
                            variant="label-removed"
                            sourceLabel="All Columns"
                            selectedLabel="Visible Columns"
                            options={ options }
                            value={ visibleColumns }
                            onValueChange={ newVal => this.onColumnsChange(newVal) }
                        >
                        </DualListbox>
                    </div>
                </Modal>
            </ButtonIcon>
        );
    }
}

TableConfigButton.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    iconName: PropTypes.isIcon('iconName').defaultValue('utility:settings').demoValue('utility:settings'),
    name: PropTypes.isIcon('name').required(),
    columns: PropTypes.isArray('columns').required(),
    iconClass: PropTypes.isString('iconClass').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "bare",
        "container",
        "border",
        "border-filled",
        "border-inverse",
        "inverse",
    ]).defaultValue('border').demoValue('border'),
    size: PropTypes.isString('size').values([
        "large",
        "medium",
        "small",
        "x-small",
        "xx-small",
    ]).defaultValue('small').demoValue('small'),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    alternativeText: PropTypes.isString('alternativeText').demoValue(''),
    type: PropTypes.isString('type').values([
        'button',
        'submit',
    ]).defaultValue('button').demoValue('button'),
    onValueChange: PropTypes.isFunction('onValueChange'),
};

TableConfigButton.propTypesRest = true;
TableConfigButton.displayName = "TableConfigButton";
