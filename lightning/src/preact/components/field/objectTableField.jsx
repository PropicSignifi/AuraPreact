import { h, render, Component } from 'preact';
import AbstractProxyField from './proxyField';
import PropTypes from '../propTypes/propTypes';
import TableField from './tableField';
import Modal from '../modal/modal';
import Button from '../button/button';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import renderField from '../renderField/renderField';
import Utils from '../utils/utils';

const evaluatePropOverrideExpression = (value, expression) => {
    return Utils.evalInContext(expression, {
        '$items': value,
    });
};

export default class ObjectTableField extends AbstractProxyField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            item: null,
        });
    }

    getSaveValue(value, selectedItem, item) {
        if(selectedItem) {
            const index = _.findIndex(value, v => _.isEqual(v, selectedItem));
            return Utils.update(value, index, item);
        }
        else {
            return [
                ...(value || []),
                item,
            ];
        }
    }

    onSaveObject(onSave, value, selectedItem) {
        const item = this.state.item;
        if(item) {
            this.setState({
                item: null,
            }, () => {
                onSave(this.getSaveValue(value, selectedItem, item));
            });
        }
        else {
            onSave(value);
        }
    }

    createFooter(onSave, onCancel, value, selectedItem) {
        return (
            <div>
                <Button variant="tertiary" label="Cancel" onClick={ onCancel }></Button>
                <Button variant="primary" label="Save" type="submit" onClick={ e => this.onSaveObject(onSave, value, selectedItem) }></Button>
            </div>
        );
    }

    getDefaultValue(name) {
        const properties = this.prop('properties');
        const property = _.find(properties, ['name', name]);
        return property && property.defaultValue;
    }

    getPropertyValue(name, selectedItem) {
        const item = this.state.item || selectedItem || {};
        return item[name] || this.getDefaultValue(name);
    }

    setPropertyValue(value, name, selectedItem) {
        this.setState({
            item: _.assign({}, this.state.item || selectedItem, {
                [name]: value,
            }),
        });
    }

    buildObjectPropsOverride() {
        const result = {};
        const value = this.prop('value');
        const objectProps = this.prop('objectProps');

        if(_.isPlainObject(objectProps)) {
            _.forEach(objectProps, (val, key) => {
                const override = _.chain(val)
                    .toPairs()
                    .map(([propKey, propOverride]) => {
                        if(_.isString(propOverride)) {
                            return [propKey, _.map(value, item => _.get(item, propOverride))];
                        }
                        else if(propOverride && _.isString(propOverride.expression)){
                            return [propKey, evaluatePropOverrideExpression(value, propOverride.expression)];
                        }
                    })
                    .fromPairs()
                    .value();

                result[key] = override;
            });
        }

        return result;
    }

    createObjectModalContent(value, selectedItem) {
        const properties = this.prop('properties');
        const propOverrides = this.buildObjectPropsOverride();

        return (
            <Form name={ `objectModalForm-${this.prop('itemName')}` }>
                <FormGroup>
                    {
                        _.map(properties, property => {
                            return (
                                <FormTile>
                                    {
                                        renderField(property.type, _.assign({}, property.renderConfig, propOverrides[property.name],
                                        {
                                            name: property.name,
                                            label: _.get(property, 'renderConfig.label') || _.capitalize(property.name),
                                            value: this.getPropertyValue(property.name, selectedItem),
                                            onValueChange: newVal => this.setPropertyValue(newVal, property.name, selectedItem),
                                        }), this.state.item || selectedItem || {})
                                    }
                                </FormTile>
                            );
                        })
                    }
                </FormGroup>
            </Form>
        );
    }

    createObjectModal({
        visible,
        title,
        value,
        selectedItem,
        onSave,
        onCancel,
    }) {
        return (
            <Modal
                header={ title }
                visible={ visible }
                onClose={ onCancel }
                footer={ this.createFooter(onSave, onCancel, value, selectedItem) }
            >
                {
                    this.createObjectModalContent(value, selectedItem)
                }
            </Modal>
        );
    }

    render(props, state) {

        const [{
            createModal,
            editable,
            ...restProps
        }, rest] = this.getPropValues();

        const _createModal = createModal || this.createObjectModal.bind(this);

        return (
            <TableField
                ref={ node => this.setField(node) }
                createModal={ _createModal }
                editable={ editable }
                data-type={ this.getTypeName() }
                { ...restProps }
                { ...rest }
            >
            </TableField>
        );
    }
}

ObjectTableField.propTypes = PropTypes.extend(TableField.propTypes, {
    properties: PropTypes.isArray('properties').shape({
        name: PropTypes.isString('name').required(),
        type: PropTypes.isString('type').required(),
        defaultValue: PropTypes.isObject('defaultValue'),
        renderConfig: PropTypes.isObject('renderConfig'),
    }),
    tableProps: PropTypes.isObject('tableProps').defaultValue({header: 'Selected Items', name: 'demo_object_table_field_table'}),
    itemName: PropTypes.isString('itemName').defaultValue('Item').demoValue('Item'),
    editable: PropTypes.isBoolean('editable'),
    createModal: PropTypes.isFunction('createModal'),
    objectProps: PropTypes.isObject('objectProps'),
});

ObjectTableField.propTypes.name.demoValue('objectTableField');
ObjectTableField.propTypes.label.demoValue('Object Table Field');

ObjectTableField.propTypesRest = true;
ObjectTableField.displayName = "ObjectTableField";
