import { h, render, Component } from 'preact';

import Button from '../button/button';
import TableManager from '../table/TableManager';
import ButtonIcon from '../buttonIcon/buttonIcon';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Utils from '../utils/utils';

export default class TableField extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showSearchModal: false,
            selectedItem: null,
        });
    }

    deleteItem(item) {
        this.setValue(_.reject(this.prop('value'), v => _.isEqual(v, item)));
    }

    editItem(item) {
        this.openSearchModal(item);
    }

    validate(newVal) {
        if(_.isEmpty(newVal) && this.prop('required')) {
            return `'${this.prop('label')}' is required`;
        }
        else if(!_.isEmpty(this.prop('sizeIn'))) {
            const sizeIn = this.prop('sizeIn');
            if(!_.includes(sizeIn, _.size(newVal))) {
                return this.prop('sizeInMessage') || `Valid sizes are ${sizeIn.join(', ')}`;
            }
        }

        return super.validate(newVal);
    }

    openSearchModal(selectedItem) {
        this.setState({
            showSearchModal: true,
            selectedItem,
        });
    }

    onSave(result) {
        this.setState({
            showSearchModal: false,
        }, () => {
            this.setValue(result);
        });
    }

    onCancel() {
        this.setState({
            showSearchModal: false,
        });
    }

    render(props, state) {
        const [{
            className,
            name,
            label,
            disabled,
            readonly,
            required,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'slds-has-error': state.errorMessage,
                },
                className
                ) }>
                <div className="slds-form-element__control slds-grow">
                    {
                        this.renderField(props, state, {
                            id,
                            isDisabled,
                            isReadonly,
                        })
                    }
                </div>
                {
                    state.errorMessage ?
                    <div className="slds-form-element__help" aria-live="assertive">
                        { state.errorMessage }
                    </div>
                    : null
                }
            </div>
        );
    }

    createHeader(id) {
        return this.prop('variant') !== 'label-removed' ?
        (
            <label className="slds-form-element__label-has-tooltip" htmlFor={ id }>
                <span className={ window.$Utils.classnames(
                    {
                        'slds-assistive-text': this.prop('variant') === 'label-hidden',
                    }
                    ) }>
                    { this.prop('label') }
                </span>
                { this.prop('required') ? <abbr className="slds-required" title="required">*</abbr> : null }
                { this.prop('tooltip') ? <Helptext content={ this.prop('tooltip') } className="slds-m-left_xx-small"></Helptext> : null }
            </label>
        )
        : null
    }

    createModal(props) {
        return _.isFunction(this.prop('createModal')) ?
            this.prop('createModal')(props) :
            null;
    }

    createModalTitle() {
        if(!this.state.selectedItem) {
            return `Add ${this.prop('itemName')}` || this.prop('buttonLabel');
        }
        else {
            return `Edit ${this.prop('itemName')}` || this.prop('buttonLabel');
        }
    }

    renderField(props, state, variables) {
        const [{
            name,
            label,
            buttonLabel,
            tableProps,
            modalProps,
            itemName,
            value,
            variant,
            required,
            editable,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        return (
            <div>
                <TableManager
                    { ...tableProps }
                    name={ `${name}-field-inner-table` }
                    header={ this.createHeader(id) }
                    columns={ [
                        ...(tableProps.columns || []),
                        {
                            name: 'action',
                            header: 'Action',
                            cell: (item, callbacks, context) => {
                                return (
                                    <div>
                                        {
                                            editable && (
                                            <ButtonIcon
                                                iconName="ctc-utility:a_edit"
                                                variant="bare"
                                                size="large"
                                                disabled={ isDisabled }
                                                onClick={ e => this.editItem(item) }
                                                alternativeText="Edit">
                                            </ButtonIcon>
                                            )
                                        }
                                        <ButtonIcon
                                            iconName="ctc-utility:a_delete"
                                            iconClass="slds-icon-text-error"
                                            variant="bare"
                                            size="large"
                                            disabled={ isDisabled }
                                            onClick={ e => this.deleteItem(item) }
                                            alternativeText="Delete">
                                        </ButtonIcon>
                                    </div>
                                );
                            },
                        },
                    ] }
                    data={ value || [] }
                    onValueChange={ newVal => this.setValue(newVal) }
                >
                    <Button
                        variant="primary"
                        label={ buttonLabel || `Add ${itemName}`  }
                        className="slds-col_bump-left"
                        disabled={ isDisabled }
                        onClick={ e => this.openSearchModal() }
                    >
                    </Button>
                </TableManager>
                {
                    this.createModal(_.assign({}, modalProps, {
                        title: this.createModalTitle(),
                        visible: state.showSearchModal,
                        value,
                        selectedItem: state.selectedItem,
                        onSave: this.onSave.bind(this),
                        onCancel: this.onCancel.bind(this),
                    }))
                }
            </div>
        );
    }
}

TableField.propTypes = PropTypes.extend(AbstractField.propTypes, {
    buttonLabel: PropTypes.isString('buttonLabel').demoValue('Add Item'),
    tableProps: PropTypes.isObject('tableProps').defaultValue({
        header: 'Items',
        columns: [
            {
                name: 'name',
                header: 'Name',
            },
        ],
        pageSize: 10,
    }),
    modalProps: PropTypes.isObject('modalProps'),
    createModal: PropTypes.isFunction('createModal'),
    sizeIn: PropTypes.isArray('sizeIn'),
    sizeInMessage: PropTypes.isString('sizeInMessage'),
    editable: PropTypes.isBoolean('editable'),
    itemName: PropTypes.isString('itemName'),
});

TableField.propTypes.name.demoValue('tableField');
TableField.propTypes.label.demoValue('TableField');

TableField.propTypesRest = true;
TableField.displayName = "TableField";
