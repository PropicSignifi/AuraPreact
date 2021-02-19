import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Picklist from "../picklist/picklist";
import Input from '../input/input';
import ButtonStateful from '../buttonStateful/buttonStateful';
import Button from '../button/button';
import Utils from '../utils/utils';
import renderField from '../renderField/renderField';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import FormActions from '../form/formActions';
import styles from './styles.less';

export const defaultCondition = {};

export const defaultGroup = {
    action: 'AND',
    conditions: [
        defaultCondition,
    ],
};

export const isEmptyCondition = condition => {
    return !condition || (!condition.action && !condition.resource);
};

export const isValid = (condition, schema) => {
    if(isEmptyCondition(condition)) {
        return false;
    }

    if(condition.resource) {
        const operator = _.find(schema.operators, ['name', condition.operator]);
        if(operator) {
            if(operator.valueRequired) {
                return !!condition.value;
            }
            else {
                return true;
            }
        }

        return false;
    }
    else {
        return _.every(condition.conditions, c => isValid(c, schema));
    }
};

export default class Expression extends BaseComponent {
    constructor() {
        super();

        this.state = {
            isAdvanced: false,
            editingCondition: null,
            editingIndex: null,
            editingChildIndex: null,
        };
    }

    getValue() {
        const value = this.prop('value');
        return isEmptyCondition(value) ? defaultGroup : value;
    }

    canSwitchMode() {
        if(this.prop('showAdvancedMode')){
            const oldValue = this.getValue();
            return _.size(oldValue.conditions) <= 1;
        } else return null;
    }

    isAdvancedMode() {
        const oldValue = this.getValue();
        return _.size(oldValue.conditions) > 1 ||
            _.size(_.get(oldValue, 'conditions[0].conditions')) > 0 ||
            this.state.isAdvanced;
    }

    onModeChange(newVal) {
        this.setState({
            isAdvanced: newVal,
        });
    }

    getActionOptions() {
        const actionOptions = [
            {
                label: this.prop('actionAndLabel'),
                value: 'AND',
            },
            {
                label: this.prop('actionOrLabel'),
                value: 'OR',
            },
        ];

        return actionOptions;
    }

    onGroupActionChange(newVal, group, childIndex) {
        const oldValue = this.getValue();
        if(childIndex >= 0) {
            const target = oldValue.conditions[childIndex];
            const newTarget = _.assign({}, target, {
                action: newVal,
            });
            const newValue = _.assign({}, oldValue, {
                conditions: Utils.update(oldValue.conditions, childIndex, newTarget),
            });
            this.notifyOnValueChange(newValue);
        }
        else {
            const newValue = _.assign({}, oldValue, {
                action: newVal,
            });
            this.notifyOnValueChange(newValue);
        }
    }

    onConditionKeyChange(pairs, condition, index, childIndex, isEditingFilter) {
        if(isEditingFilter) {
            this.setState({
                editingCondition: _.assign({}, this.state.editingCondition, pairs),
            });
        }
        else {
            const oldValue = this.getValue();
            if(childIndex >= 0) {
                const target = oldValue.conditions[childIndex];
                const newTarget = _.assign({}, target, {
                    conditions: Utils.update(target.conditions, index, _.assign({}, condition, pairs)),
                });
                const newValue = _.assign({}, oldValue, {
                    conditions: Utils.update(oldValue.conditions, childIndex, newTarget),
                });
                this.notifyOnValueChange(newValue);
            }
            else {
                const newValue = _.assign({}, oldValue, {
                    conditions: Utils.update(oldValue.conditions, index, _.assign({}, condition, pairs)),
                });
                this.notifyOnValueChange(newValue);
            }
        }
    }

    onConditionResouceChange(newVal, condition, index, childIndex, isEditingFilter) {
        const changes = {
            resource: newVal,
            operator: null,
            value: null,
        };

        const resource = this.getSchemaResource(newVal);
        if(_.size(resource.operators) === 1) {
            const operatorName = _.first(resource.operators);
            const operator = this.getSchemaOperator(operatorName);
            changes.operator = operatorName;
            changes.value = operator && operator.defaultValue;
        }

        return this.onConditionKeyChange(changes, condition, index, childIndex, isEditingFilter);
    }

    onConditionOperatorChange(newVal, condition, index, childIndex, isEditingFilter) {
        const operator = this.getSchemaOperator(newVal);
        const pairs = {
            operator: newVal,
            value: operator && operator.defaultValue,
        };
        return this.onConditionKeyChange(pairs, condition, index, childIndex, isEditingFilter);
    }

    onConditionValueChange(newVal, condition, index, childIndex, isEditingFilter) {
        return this.onConditionKeyChange({ value: newVal }, condition, index, childIndex, isEditingFilter);
    }

    onConditionEdit(condition, index, childIndex) {
        this.setState({
            editingCondition: condition,
            editingIndex: index,
            editingChildIndex: childIndex,
        });
    }

    onCancelEditingCondition(callback) {
        this.setState({
            editingCondition: null,
            editingIndex: null,
            editingChildIndex: null,
        }, () => {
            if(_.isFunction(callback)) {
                callback();
            }
        });
    }

    onSaveEditingCondition() {
        const condition = this.state.editingCondition;
        const index = this.state.editingIndex;
        const childIndex = this.state.editingChildIndex;

        this.onCancelEditingCondition(() => {
            const oldValue = this.getValue();
            if(childIndex >= 0) {
                const target = oldValue.conditions[childIndex];
                const newTarget = _.assign({}, target, {
                    conditions: Utils.update(target.conditions, index, condition),
                });
                const newValue = _.assign({}, oldValue, {
                    conditions: Utils.update(oldValue.conditions, childIndex, newTarget),
                });
                this.notifyOnValueChange(newValue);
            }
            else {
                const newValue = _.assign({}, oldValue, {
                    conditions: Utils.update(oldValue.conditions, index, condition),
                });
                this.notifyOnValueChange(newValue);
            }
        });
    }

    onConditionDelete(condition, index, childIndex) {
        const oldValue = this.getValue();
        if(childIndex >= 0) {
            const target = oldValue.conditions[childIndex];
            const newTarget = _.assign({}, target, {
                conditions: _.filter(target.conditions, (c, i) => i !== index),
            });
            const newValue = _.isEmpty(newTarget.conditions) ?
                _.assign({}, oldValue, {
                    conditions: _.filter(oldValue.conditions, (c, i) => i !== childIndex),
                }) :
                _.assign({}, oldValue, {
                    conditions: Utils.update(oldValue.conditions, childIndex, newTarget),
                });
            if(_.isEmpty(newValue.conditions)) {
                newValue.conditions.push(defaultCondition);
            }
            this.notifyOnValueChange(newValue);
        }
        else {
            const newValue = _.assign({}, oldValue, {
                conditions: _.filter(oldValue.conditions, (c, i) => i !== index),
            });
            if(_.isEmpty(newValue.conditions)) {
                newValue.conditions.push(defaultCondition);
            }
            this.notifyOnValueChange(newValue);
        }
    }

    onAdd(group, childIndex, newObj) {
        const oldValue = this.getValue();
        if(childIndex >= 0) {
            const target = oldValue.conditions[childIndex];
            const newTarget = _.assign({}, target, {
                conditions: [
                    ...target.conditions,
                    newObj,
                ],
            });
            const newValue = _.assign({}, oldValue, {
                conditions: Utils.update(oldValue.conditions, childIndex, newTarget),
            });
            this.notifyOnValueChange(newValue);
        }
        else {
            const newValue = _.assign({}, oldValue, {
                conditions: [
                    ...oldValue.conditions,
                    newObj,
                ],
            });
            this.notifyOnValueChange(newValue);
        }
    }

    onAddCondition(group, childIndex) {
        return this.onAdd(group, childIndex, defaultCondition);
    }

    notifyOnValueChange(newVal) {
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(newVal);
        }
    }

    onRemoveAll(group, childIndex) {
        this.notifyOnValueChange(defaultCondition);
    }

    onAddGroup(group, childIndex) {
        return this.onAdd(group, childIndex, defaultGroup);
    }

    renderValueUI(condition, index, childIndex, isEditingFilter) {
        const label = this.prop('valueLabel');
        const slim = this.prop('slim');
        const disabled = this.prop('disabled') || !condition.resource || !condition.operator;
        const operator = this.getSchemaOperator(condition.operator);
        const type = (operator && operator.type) || 'Text';
        const resource = this.getSchemaResource(condition.resource);
        if(operator && _.isFunction(operator.renderValueUI)) {
            return operator.renderValueUI({
                type,
                resource,
                condition,
                index,
                name: `condition-${index}-value`,
                label,
                variant: slim ? 'label-removed' : 'standard',
                required: !!this.isOperatorValueRequired(condition.operator),
                disabled: disabled || operator.valueOmitted,
                value: condition.value,
                onValueChange: newVal => this.onConditionValueChange(newVal, condition, index, childIndex, isEditingFilter),
            });
        }
        else {
            return renderField(type, _.assign({}, (operator && operator.renderConfig), {
                key: `${condition.resource}-${condition.operator}`,
                name: `condition-${index}-value`,
                label,
                variant: slim ? 'label-removed' : 'standard',
                required: !!this.isOperatorValueRequired(condition.operator),
                disabled: disabled || (operator && operator.valueOmitted),
                value: condition.value,
                onValueChange: newVal => this.onConditionValueChange(newVal, condition, index, childIndex, isEditingFilter),
            }));
        }
    }

    isOperatorValueRequired(operatorName) {
        const operator = this.getSchemaOperator(operatorName);
        return operator && operator.valueRequired;
    }

    getSchemaResources() {
        const schema = this.prop('schema');
        const resources = schema.resources || [];
        return resources;
    }

    getSchemaOperators() {
        const schema = this.prop('schema');
        const operators = schema.operators || [];
        return operators;
    }

    getSchemaOperator(operatorName) {
        return _.find(this.getSchemaOperators(), ['name', operatorName]);
    }

    getSchemaOperatorLabel(operatorName) {
        const operator = this.getSchemaOperator(operatorName);
        return operator && operator.label;
    }

    getConditionValueDisplay(condition) {
        const operator = this.getSchemaOperator(condition.operator);
        if(_.isFunction(operator.getValueLabel)) {
            return operator.getValueLabel(condition.value);
        }
        else {
            return JSON.stringify(condition.value);
        }
    }

    getSchemaResource(resourceName) {
        return _.find(this.getSchemaResources(), ['name', resourceName]);
    }

    getSchemaResourceLabel(resourceName) {
        const resource = this.getSchemaResource(resourceName);
        return resource && resource.label;
    }

    getSchemaResourceOperators(resourceName) {
        const schema = this.prop('schema');
        const conditionSchema = _.find(schema.resources, ['name', resourceName]) || {};
        const operators = conditionSchema.operators || [];
        return _.chain(operators)
            .map(op => _.find(schema.operators, ['name', op]))
            .compact()
            .value();
    }

    getResourceOptions() {
        return _.map(this.getSchemaResources(), resource => {
            return {
                label: resource.label,
                value: resource.name,
            };
        });
    }

    getOperatorOptions(condition) {
        return _.map(this.getSchemaResourceOperators(condition.resource), op => {
            return {
                label: op.label,
                value: op.name,
            };
        });
    }

    renderGroup(group, childIndex) {
        group = group || defaultGroup;
        const isAdvancedMode = this.isAdvancedMode();
        const type = this.prop('type');
        const slim = this.prop('slim');

        return [
            isAdvancedMode && type === 'expression' && !slim && (
                <div className="slds-expression__options">
                    <Picklist
                        name="expressionOptions"
                        label={ this.prop('actionLabel') }
                        required="true"
                        placeholder="-- Please Select --"
                        options={ this.getActionOptions() }
                        disabled={ this.prop('disabled') }
                        value={ group.action }
                        onValueChange={ newVal => this.onGroupActionChange(newVal, group, childIndex)  }
                    >
                    </Picklist>
                </div>
            ),

            type === 'filter' && (
                <div className="slds-m-vertical_small">
                    <Picklist
                        name="expressionOptions"
                        label={ this.prop('actionLabel') }
                        variant={ slim ? 'label-removed' : 'standard' }
                        required="true"
                        placeholder="-- Please Select --"
                        options={ this.getActionOptions() }
                        disabled={ this.prop('disabled') }
                        value={ group.action }
                        onValueChange={ newVal => this.onGroupActionChange(newVal, group, childIndex)  }
                    >
                    </Picklist>
                </div>
            ),

            <ul className={ type === 'filter' ? 'slds-list_vertical slds-list_vertical-space' : '' }>
                {
                    _.map(group.conditions, (condition, index) => {
                        if(condition.action && isAdvancedMode) {
                            return (
                            <li className={ type === 'filter' ? "slds-item slds-hint-parent" : "slds-expression__group" }>
                                {
                                    type === 'filter' ?
                                    <div className="slds-filters__group">
                                        <div className="slds-grid slds-grid_align-spread">
                                            {
                                                index !== 0 && (
                                                <span><strong>{ group.action }</strong></span>
                                                )
                                            }
                                            <span className="slds-assistive-text">Condition Group { index + 1 }</span>
                                        </div>
                                        {
                                            this.renderGroup(condition, index)
                                        }
                                    </div>
                                    :
                                    <fieldset>
                                        <legend className={ window.$Utils.classnames(
                                            "slds-expression__legend slds-expression__legend_group",
                                            {
                                                [styles.slimPadding]: slim,
                                            }) }>
                                            {
                                                index !== 0 && (
                                                <span>
                                                    {
                                                        slim ?
                                                        <ButtonStateful
                                                            className={ `slds-m-top_small ${styles.operatorButton}` }
                                                            state={ group.action === 'AND' }
                                                            disabled={ this.prop('disabled') }
                                                            labelWhenOff="OR"
                                                            labelWhenOn="AND"
                                                            labelWhenHover="AND"
                                                            variant="tertiary"
                                                            onClick={ newVal => this.onGroupActionChange(newVal ? 'AND' : 'OR', group, childIndex) }
                                                        >
                                                        </ButtonStateful>
                                                        :
                                                        group.action
                                                    }
                                                </span>
                                                )
                                            }
                                            <span className="slds-assistive-text">Condition Group { index + 1 }</span>
                                        </legend>
                                        {
                                            this.renderGroup(condition, index)
                                        }
                                    </fieldset>
                                }
                            </li>
                            );
                        }
                        else {
                            const ui = this.renderValueUI(condition, index, childIndex);
                            let valueUI = null;
                            let regionUI = null;
                            if(_.isArray(ui)) {
                                valueUI = ui[0];
                                regionUI = ui[1];
                            }
                            else {
                                valueUI = ui;
                            }

                            return (
                            <li className={ type === 'filter' ? "slds-item slds-hint-parent" : "slds-expression__row" }>
                                {
                                    type === 'filter' ?
                                    <div className={ window.$Utils.classnames(
                                        'slds-filters__item slds-grid slds-grid_vertical-align-center',
                                        {
                                            'slds-is-new': !condition.resource,
                                        }
                                        ) }>
                                        <button
                                            className="slds-button_reset slds-grow slds-has-blur-focus"
                                            onClick={ e => this.onConditionEdit(condition, index, childIndex) }
                                            disabled={ this.prop('disabled') }
                                        >
                                            <span className="slds-assistive-text">Edit filter:</span>
                                            {
                                                index === 0 ?
                                                <span className="slds-show slds-text-body_small">{ this.getSchemaResourceLabel(condition.resource) || 'New Filter' }</span>
                                                :
                                                <span className="slds-show">
                                                    <span>
                                                        <strong>{ group.action } </strong>
                                                    </span>
                                                    <span className="slds-text-body_small">{ this.getSchemaResourceLabel(condition.resource) || 'New Filter' }</span>
                                                </span>
                                            }
                                            {
                                                condition.resource && (
                                                <span className="slds-show">{ this.getSchemaOperatorLabel(condition.operator) } { this.getConditionValueDisplay(condition) }</span>
                                                )
                                            }
                                        </button>
                                        <button className="slds-button slds-button_icon slds-button_icon slds-button_icon-small" onClick={ e => this.onConditionDelete(condition, index, childIndex) } disabled={ this.prop('disabled') }>
                                            <PrimitiveIcon iconName="utility:delete" variant="bare" className="slds-button__icon slds-button__icon_hint"></PrimitiveIcon>
                                        </button>
                                    </div>
                                    :
                                    <fieldset>
                                        {
                                            isAdvancedMode && (
                                            <legend className={ window.$Utils.classnames(
                                                "slds-expression__legend",
                                                {
                                                    [styles.slimPadding]: slim,
                                                }
                                                ) }>
                                                {
                                                    index !== 0 && (
                                                    <span>
                                                        {
                                                            slim ?
                                                            <ButtonStateful
                                                                className={ styles.operatorButton }
                                                                state={ group.action === 'AND' }
                                                                disabled={ this.prop('disabled') }
                                                                labelWhenOff="OR"
                                                                labelWhenOn="AND"
                                                                labelWhenHover="AND"
                                                                variant="tertiary"
                                                                onClick={ newVal => this.onGroupActionChange(newVal ? 'AND' : 'OR', group, childIndex) }
                                                            >
                                                            </ButtonStateful>
                                                            :
                                                            group.action
                                                        }
                                                    </span>
                                                    )
                                                }
                                                <span className="slds-assistive-text">Condition { index + 1 }</span>
                                            </legend>
                                            )
                                        }
                                        <div className="slds-grid slds-gutters_xx-small slds-wrap">
                                            <div className={ `slds-col ${styles.col}` }>
                                                <Picklist
                                                    name={ `condition-${index}-resource` }
                                                    label={ this.prop('resourceLabel') }
                                                    variant={ slim ? 'label-removed' : 'standard' }
                                                    required="true"
                                                    placeholder="-- Please Select --"
                                                    disabled={ this.prop('disabled') }
                                                    options={ this.getResourceOptions()  }
                                                    value={ condition.resource }
                                                    onValueChange={ newVal => this.onConditionResouceChange(newVal, condition, index, childIndex) }
                                                >
                                                </Picklist>
                                            </div>
                                            <div className={ `slds-col ${styles.col}` }>
                                                <Picklist
                                                    name={ `condition-${index}-operator` }
                                                    label={ this.prop('operatorLabel') }
                                                    variant={ slim ? 'label-removed' : 'standard' }
                                                    placeholder="-- Please Select --"
                                                    disabled={ this.prop('disabled') || !condition.resource || _.size(this.getOperatorOptions(condition)) < 2 }
                                                    required="true"
                                                    options={ this.getOperatorOptions(condition)  }
                                                    value={ condition.operator }
                                                    onValueChange={ newVal => this.onConditionOperatorChange(newVal, condition, index, childIndex) }
                                                >
                                                </Picklist>
                                            </div>
                                            <div className={ `slds-col ${styles.col}` }>
                                                { valueUI }
                                            </div>
                                            <div className="slds-col slds-grow-none">
                                                <div className="slds-form-element">
                                                    {
                                                        !slim && (
                                                        <span className="slds-form-element__label"></span>
                                                        )
                                                    }
                                                    <div className={ window.$Utils.classnames(
                                                        `slds-form-element__control`,
                                                        {
                                                            [styles.deleteBtn]: !slim,
                                                        }
                                                        ) }>
                                                        <button className="slds-button slds-button_icon slds-button_icon-border-filled" title={ `Delete Condition ${index + 1}` } onClick={ e => this.onConditionDelete(condition, index, childIndex) } disabled={ this.prop('disabled') }>
                                                            <PrimitiveIcon variant="bare" iconName="utility:delete" className="slds-button__icon"></PrimitiveIcon>
                                                            <span className="slds-assistive-text">{ `Delete Condition ${index + 1}` }</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {
                                                regionUI && (
                                                <div className="slds-grid slds-col">
                                                    <div className="slds-box slds-m-top_small">
                                                        { regionUI }
                                                    </div>
                                                </div>
                                                )
                                            }
                                        </div>
                                    </fieldset>
                                }
                            </li>
                            );
                        }
                    })
                }
            </ul>,

            type === 'expression' && <div className="slds-expression__buttons slds-grid">
                {
                    isAdvancedMode && (
                    <button className="slds-button slds-button_neutral" onClick={ e => this.onAddCondition(group, childIndex) } disabled={ this.prop('disabled') }>
                        <PrimitiveIcon variant="bare" iconName="utility:add" className="slds-button__icon slds-button__icon_left"></PrimitiveIcon>
                        { this.prop('addConditionButtonLabel') }
                    </button>
                    )
                }
                {
                    isAdvancedMode && childIndex < 0 && (
                    <button className="slds-button slds-button_neutral" onClick={ e => this.onAddGroup(group, childIndex) } disabled={ this.prop('disabled') }>
                        <PrimitiveIcon variant="bare" iconName="utility:add" className="slds-button__icon slds-button__icon_left"></PrimitiveIcon>
                        { this.prop('addGroupButtonLabel') }
                    </button>
                    )
                }
                {
                    this.canSwitchMode() && (
                    <ButtonStateful
                        state={ this.state.isAdvanced }
                        disabled={ this.prop('disabled') }
                        labelWhenOff="Advanced Mode"
                        labelWhenOn="Basic Mode"
                        labelWhenHover="Basic Mode"
                        variant="tertiary"
                        onClick={ newVal => this.onModeChange(newVal) }
                    >
                    </ButtonStateful>
                    )
                }
                {
                    childIndex < 0 && (
                    <div className="slds-col_bump-left">
                        { this.prop('children') }
                    </div>
                    )
                }
            </div>,

            type === 'filter' && (
                <div className="slds-m-top_small slds-grid">
                    <a className="" onClick={ e => this.onAddCondition(group, childIndex) } disabled={ this.prop('disabled') }>
                        { this.prop('addConditionButtonLabel') }
                    </a>
                    {
                        childIndex < 0 && [
                        <a className="slds-m-left_small" onClick={ e => this.onAddGroup(group, childIndex) } disabled={ this.prop('disabled') }>
                            { this.prop('addGroupButtonLabel') }
                        </a>,
                        <a className="slds-col_bump-left" onClick={ e => this.onRemoveAll(group, childIndex) } disabled={ this.prop('disabled') }>
                            Remove All
                        </a>,
                        ]
                    }
                </div>
            ),
        ];
    }

    render(props, state) {
        const [{
            className,
            label,
            variant,
            type,
            disabled,
            actionLabel,
            resourceLabel,
            operatorLabel,
            valueLabel,
            addConditionButtonLabel,
            addGroupButtonLabel,
            slim,
            children,
        }, rest] = this.getPropValues();

        if(this.state.editingCondition) {
            const condition = this.state.editingCondition;
            const index = this.state.editingIndex;
            const childIndex = this.state.editingChildIndex;
            const ui = this.renderValueUI(condition, index, childIndex, true);
            let valueUI = null;
            let regionUI = null;
            if(_.isArray(ui)) {
                valueUI = ui[0];
                regionUI = ui[1];
            }
            else {
                valueUI = ui;
            }

            return (
                <Form name="filterForm">
                    <FormGroup className={ className }>
                        <FormTile>
                            <div className="slds-text-heading_small">
                                Edit Filter
                            </div>
                        </FormTile>
                        <FormTile>
                            <Picklist
                                name={ `condition-${index}-resource` }
                                label={ this.prop('resourceLabel') }
                                variant={ slim ? 'label-removed' : 'standard' }
                                required="true"
                                placeholder="-- Please Select --"
                                disabled={ this.prop('disabled') }
                                options={ this.getResourceOptions()  }
                                value={ condition.resource }
                                onValueChange={ newVal => this.onConditionResouceChange(newVal, condition, index, childIndex, true) }
                            >
                            </Picklist>
                        </FormTile>
                        <FormTile>
                            <Picklist
                                name={ `condition-${index}-operator` }
                                label={ this.prop('operatorLabel') }
                                variant={ slim ? 'label-removed' : 'standard' }
                                placeholder="-- Please Select --"
                                disabled={ this.prop('disabled') || !condition.resource || _.size(this.getOperatorOptions(condition)) < 2 }
                                required="true"
                                options={ this.getOperatorOptions(condition)  }
                                value={ condition.operator }
                                onValueChange={ newVal => this.onConditionOperatorChange(newVal, condition, index, childIndex, true) }
                            >
                            </Picklist>
                        </FormTile>
                        <FormTile>
                            { valueUI }
                        </FormTile>
                        {
                            regionUI && (
                            <FormTile>
                                <div className="slds-box slds-m-top_small">
                                    { regionUI }
                                </div>
                            </FormTile>
                            )
                        }
                        <FormActions>
                            <Button
                                variant="tertiary"
                                label="Back"
                                onClick={ this.onCancelEditingCondition.bind(this) }
                            >
                            </Button>
                            <Button
                                className="slds-col_bump-left"
                                variant="primary"
                                type="submit"
                                label="Done"
                                onClick={ this.onSaveEditingCondition.bind(this) }
                            >
                            </Button>
                        </FormActions>
                    </FormGroup>
                </Form>
            );
        }
        else {
            return (
                <div className={ window.$Utils.classnames(
                    {
                        'slds-expression': type === 'expression',
                        'slds-filters': type === 'filter',
                    },
                    className
                    ) } data-type={ this.getTypeName() } { ...rest }>
                    {
                        variant !== 'label-removed' && (
                        <h2 className={ window.$Utils.classnames(
                            {
                                'slds-expression__title': type === 'expression',
                                'slds-text-heading_small': type === 'filter',
                            }
                            ) }>{ label }</h2>
                        )
                    }
                    {
                        this.renderGroup(this.getValue(), -1)
                    }
                </div>
            );
        }
    }
}

Expression.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').defaultValue('Conditions').demoValue('Conditions'),
    actionLabel: PropTypes.isString('actionLabel').defaultValue('Take Action When').demoValue('Take Action When'),
    resourceLabel: PropTypes.isString('resourceLabel').defaultValue('Resource').demoValue('Resource'),
    operatorLabel: PropTypes.isString('operatorLabel').defaultValue('Operator').demoValue('Operator'),
    valueLabel: PropTypes.isString('valueLabel').defaultValue('Value').demoValue('Value'),
    addConditionButtonLabel: PropTypes.isString('addConditionButtonLabel').defaultValue('Add Condition').demoValue('Add Condition'),
    addGroupButtonLabel: PropTypes.isString('addGroupButtonLabel').defaultValue('Add Group').demoValue('Add Group'),
    actionAndLabel: PropTypes.isString('actionAndLabel').defaultValue('All Conditions Are Met').demoValue('All Conditions Are Met'),
    actionOrLabel: PropTypes.isString('actionOrLabel').defaultValue('Any Condition Is Met').demoValue('Any Condition Is Met'),
    variant: PropTypes.isString('variant').values([
        "standard",
        "label-removed",
    ]).defaultValue("standard").demoValue('standard'),
    type: PropTypes.isString('type').values([
        "expression",
        "filter",
    ]).defaultValue("expression").demoValue('expression'),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    value: PropTypes.isObject('value'),
    schema: PropTypes.isObject('schema').required(),
    onValueChange: PropTypes.isFunction('onValueChange'),
    children: PropTypes.isChildren('children'),
    showAdvancedMode: PropTypes.isBoolean('showAdvancedMode').defaultValue(true).demoValue(true),
    slim: PropTypes.isBoolean('slim').defaultValue(false).demoValue(false).description('Whether to remove labels from resources, operators and targets'),
};

Expression.propTypesRest = true;
Expression.displayName = "Expression";
