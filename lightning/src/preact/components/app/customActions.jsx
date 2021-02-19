import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Actions from '../utils/actions';
import Utils from '../utils/utils';
import TableManager from '../table/TableManager';
import Button from '../button/button';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import Input from '../input/input';
import Picklist from '../picklist/picklist';
import FormActions from '../form/formActions';
import Modal from '../modal/modal';

const CUSTOM_ACTIONS_KEY = '$CustomActions';

const customActionTypeOptions = [
    {
        label: 'URL',
        value: 'URL',
    },
];

const createCustomActionColumns = ({ onEditCustomAction, }) => [
    {
        name: 'name',
        header: 'Name',
    },
    {
        name: 'type',
        header: 'Type',
    },
    {
        name: 'value',
        header: 'Value',
    },
    {
        name: 'description',
        header: 'Description',
    },
    {
        name: 'actions',
        header: 'Actions',
        cell: (item, callbacks, context) => {
            return (
                <div>
                    <ButtonIcon
                        iconName="ctc-utility:a_edit"
                        variant="bare"
                        size="large"
                        onClick={ e => onEditCustomAction(callbacks.row.index) }
                        alternativeText="Edit">
                    </ButtonIcon>
                    <ButtonIcon
                        iconName="ctc-utility:a_delete"
                        iconClass="slds-icon-text-error"
                        variant="bare"
                        size="large"
                        onClick={ e => callbacks.deleteItem(callbacks.row.index) }
                        alternativeText="Delete">
                    </ButtonIcon>
                </div>
            );
        },
    },
];

export default class CustomActions extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showCustomActions: false,
            customActions: [],
            selectedCustomAction: null,
            selectedCustomActionIndex: null,
        });

        this.bind([
            'onCancelCustomActions',
            'onSaveCustomActions',
            'onEditCustomAction',
            'onCustomActionsChange',
            'onCreateCustomAction',
            'onSelectedCustomActionChange',
            'onSaveCustomAction',
            'onCancelCustomAction',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        const customActions = window.$UserConfigStore.getConfig(CUSTOM_ACTIONS_KEY) || [];
        this.setState({
            customActions,
        }, () => {
            Actions.registerAction('Custom Action', () => {
                this.setState({
                    showCustomActions: true,
                });
            });

            this.registerCustomActions();
        });
    }

    registerCustomActions() {
        _.forEach(this.state.customActions, customAction => {
            Actions.registerAction(customAction.name, {
                execute: () => {
                    switch(customAction.type) {
                        case 'URL':
                            return Utils.openUrl(customAction.value);
                        default:
                            return;
                    }
                },
            });
        });
    }

    onCancelCustomActions() {
        this.setState({
            showCustomActions: false,
        });
    }

    onSaveCustomActions() {
        this.setState({
            showCustomActions: false,
        }, () => {
            this.registerCustomActions();
            window.$UserConfigStore.setConfig(CUSTOM_ACTIONS_KEY, this.state.customActions);
        });
    }

    createCustomActionsFooter() {
        return (
            <div>
                <Button
                    label="Cancel"
                    variant="tertiary"
                    onClick={ this.onCancelCustomActions }
                >
                </Button>
                <Button
                    label="Save"
                    variant="save"
                    onClick={ this.onSaveCustomActions }
                >
                </Button>
            </div>
        );
    }

    onEditCustomAction(index) {
        this.setState({
            selectedCustomAction: this.state.customActions[index],
            selectedCustomActionIndex: index,
        });
    }

    onCancelCustomAction() {
        this.setState({
            selectedCustomAction: null,
            selectedCustomActionIndex: null,
        });
    }

    onSaveCustomAction() {
        const newCustomAction = this.state.selectedCustomAction;
        const newCustomActions = this.state.selectedCustomActionIndex === null ?
            [
                ...(this.state.customActions),
                newCustomAction,
            ]
            :
            [
                ...(_.slice(this.state.customActions, 0, this.state.selectedCustomActionIndex)),
                newCustomAction,
                ...(_.slice(this.state.customActions, this.state.selectedCustomActionIndex + 1)),
            ];

        this.setState({
            selectedCustomAction: null,
            customActions: newCustomActions,
        });
    }

    onCustomActionsChange(newVal) {
        this.setState({
            customActions: newVal,
        });
    }

    onCreateCustomAction() {
        this.setState({
            selectedCustomAction: {
                type: 'URL',
            },
            selectedCustomActionIndex: null,
        });
    }

    onSelectedCustomActionChange(value, key) {
        this.setState({
            selectedCustomAction: _.assign({}, this.state.selectedCustomAction, {
                [key]: value,
            }),
        });
    }

    render(props, state) {
        return (
            <div data-type={ this.getTypeName() }>
                <Modal
                    visible={ this.state.showCustomActions }
                    onClose={ this.onCancelCustomActions }
                    header="Custom Actions"
                    footer={ this.createCustomActionsFooter() }
                >
                    <TableManager
                        className={ this.state.selectedCustomAction ? 'slds-hide' : '' }
                        name="system_customActionTable"
                        header="Custom Actions"
                        data={ this.state.customActions }
                        columns={ createCustomActionColumns({ onEditCustomAction: this.onEditCustomAction, }) }
                        pageSize="10"
                        onValueChange={ this.onCustomActionsChange }
                    >
                        <Button
                            className="slds-col_bump-left"
                            label="New"
                            variant="primary"
                            onClick={ this.onCreateCustomAction }
                        >
                        </Button>
                    </TableManager>
                    {
                        this.state.selectedCustomAction && (
                        <Form name="newCustomActionForm">
                            <div className="slds-p-around_medium slds-m-bottom_medium slds-border_bottom slds-text-heading_medium">
                                { this.state.selectedCustomActionIndex === null ? 'New Custom Action' : 'Edit Custom Action' }
                            </div>
                            <FormGroup>
                                <FormTile>
                                    <Input
                                        label="Name"
                                        name="name"
                                        required="true"
                                        value={ this.state.selectedCustomAction.name }
                                        onValueChange={ this.onSelectedCustomActionChange }
                                    >
                                    </Input>
                                </FormTile>
                                <FormTile>
                                    <Picklist
                                        label="Type"
                                        name="type"
                                        required="true"
                                        options={ customActionTypeOptions }
                                        value={ this.state.selectedCustomAction.type }
                                        onValueChange={ this.onSelectedCustomActionChange }
                                    >
                                    </Picklist>
                                </FormTile>
                                <FormTile>
                                    <Input
                                        label="Value"
                                        name="value"
                                        value={ this.state.selectedCustomAction.value }
                                        onValueChange={ this.onSelectedCustomActionChange }
                                    >
                                    </Input>
                                </FormTile>
                                <FormTile>
                                    <Input
                                        label="Description"
                                        name="description"
                                        value={ this.state.selectedCustomAction.description }
                                        onValueChange={ this.onSelectedCustomActionChange }
                                    >
                                    </Input>
                                </FormTile>
                            </FormGroup>
                            <FormActions>
                                <div className="slds-col_bump-left">
                                    <Button
                                        label="Back"
                                        variant="tertiary"
                                        onClick={ this.onCancelCustomAction }
                                    >
                                    </Button>
                                    <Button
                                        label="Save Custom Action"
                                        variant="primary"
                                        onClick={ this.onSaveCustomAction }
                                    >
                                    </Button>
                                </div>
                            </FormActions>
                        </Form>
                        )
                    }
                </Modal>
            </div>
        );
    }
}
