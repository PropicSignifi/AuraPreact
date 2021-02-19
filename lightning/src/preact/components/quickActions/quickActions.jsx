import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Button from '../button/button';
import ButtonMenu from '../menu/buttonMenu';
import MenuItem from '../menu/menuItem';
import Modal from '../modal/modal';
import Utils from '../utils/utils';
import Config from '../utils/config';
import Preactlet from '../preactlet/preactlet';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import renderField from '../renderField/renderField';
import RecordForm from '../recordForm/recordForm';
import IFrame from '../iframe/iframe';

Config.defineConfig([
    {
        name: 'Quick Actions - extension',
        path: '/System/UI/QuickActions/${name}/extension',
        type: Config.Types.Extension,
        description: 'Customise the specific quick actions',
    },
]);

const TYPE_URL = 'url';
const TYPE_VISUALFORCE_PAGE = 'visualforce_page';
const TYPE_LIGHTNING_COMPONENT = 'lightning_component';
const TYPE_FLOW = 'flow';
const TYPE_FLOW_MODAL = 'flow_modal';
const TYPE_VISUALFORCE_PAGE_MODAL = 'visualforce_page_modal';

export default class QuickActions extends BaseComponent {
    constructor() {
        super();

        this.state = {
            selectedAction: null,
            actions: null,
            createActions: null,
            modalLoading: false,
            fieldsState: {},
        };

        this.spinner = null;
        this.unregisterEventListener = null;
        this._onSaveHandler = null;
        this._onFieldsSaveHandler = null;
        this._onRecordFormSaveHandler = null;
        this._fieldsForm = null;
        this._recordForm = null;

        this.bind([
            'setFieldsForm',
            'onSaveModal',
            'setRecordForm',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        this.unregisterEventListener = window.$Utils.registerEventListener(event => {
            if(event.getType() === 'force:closeQuickAction') {
                this.onCloseModal();
            }
        });

        if(this.prop('name')) {
            Config.loadExtension(`/System/UI/QuickActions/${this.prop('name')}/extension`, this.context.globalData, resources => {
                const resource = _.last(resources);
                Utils.retrieve(resource, [this.prop('createActions'), this.prop('createActionsParams')]).then(actions => {
                    if(_.isFunction(actions)) {
                        this.setState({
                            createActions: actions,
                        });
                    }
                    else {
                        this.setState({
                            actions,
                        });
                    }
                });
            });
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if(this.unregisterEventListener) {
            this.unregisterEventListener();
        }
    }

    setFieldsForm(node) {
        this._fieldsForm = node;
    }

    setRecordForm(node) {
        this._recordForm = node;
    }

    setSpinner(node) {
        this.spinner = node;
    }

    getNumOfVisibleActions(actions) {
        if(window.$Utils.isMobileScreenSize()) {
            //fix for small screen width
            return 1;
        }
        else {
            return _.min([_.size(actions), this.prop('visibleActions')]);
        }
    }

    invoke(action) {
        const params = _.get(action, 'attributes.params') || {};
        const recordId = params.recordId || this.prop('recordId');
        const sObjectName = params.sObjectName || this.prop('sObjectName');
        if(action.actionType === TYPE_URL) {
            Utils.openUrl(action.actionName);
        }
        else if(action.actionType === TYPE_VISUALFORCE_PAGE) {
            Utils.openVisualforcePage(action.actionName, params);
        }
        else if(action.actionType === TYPE_FLOW) {
            window.$Utils.navigateToComponent('c:runFlow', {
                recordId,
                sObjectName,
                flowName: action.actionName,
                retRecordId: params.retRecordId,
            });
        }
        else if(action.actionType === TYPE_FLOW_MODAL) {
            if(window.$Utils.isNonDesktopBrowser()) {
                window.$Utils.navigateToComponent('c:runFlow', {
                    recordId,
                    sObjectName,
                    flowName: action.actionName,
                    retRecordId: params.retRecordId,
                });
            }
            else {
                this.setState({
                    selectedAction: action,
                }, () => {
                    if(this.spinner) {
                        this.spinner.style.display = 'block';
                    }

                    const id = this.id();
                    const flowName = action.actionName;
                    window.$Shadow.create(`<c:runFlow recordId="${recordId}" sObjectName="${sObjectName}" flowName="${flowName}" onFinish="{! v.config.onFinish }"/>`)
                        .then(shadow => {
                            const parent = document.getElementById(id);
                            if(this.spinner) {
                                this.spinner.style.display = 'none';
                            }
                            shadow.show(parent, null, value => {
                            });

                            shadow.setConfig('onFinish', this.onFlowModalFinish.bind(this));
                        });
                });
            }
        }
        else if(action.actionType === TYPE_LIGHTNING_COMPONENT) {
            if(params.forceNavigate || window.$Utils.isNonDesktopBrowser()) {
                window.$Utils.navigateToComponent(action.actionName, {
                    recordId,
                    sObjectName,
                }, true);
            }
            else {
                this.setState({
                    selectedAction: action,
                }, () => {
                    if(this.spinner) {
                        this.spinner.style.display = 'block';
                    }

                    const id = this.id();
                    const compName = action.actionName;
                    window.$Shadow.create(`<${compName} recordId="${recordId}" sObjectName="${sObjectName}"/>`)
                        .then(shadow => {
                            const parent = document.getElementById(id);
                            if(this.spinner) {
                                this.spinner.style.display = 'none';
                            }
                            shadow.show(parent, null, value => {
                            });
                        });
                });
            }
        }
        else if(_.isFunction(action.onClick)) {
            const context = this.buildContext(action);

            action.onClick(context);
        }
        else {
            this.setState({
                selectedAction: action,
            });
        }
    }

    setFieldsState(key, newVal) {
        const newState = _.set(this.state.fieldsState, key, newVal);

        this.setState({
            fieldsState: _.assign({}, newState),
        });
    }

    startModalLoading() {
        this.setState({
            modalLoading: true,
        });
    }

    endModalLoading() {
        this.setState({
            modalLoading: false,
        });
    }

    buildContext(action) {
        const params = _.get(action, 'attributes.params') || {};
        const recordId = params.recordId || this.prop('recordId');
        const sObjectName = params.sObjectName || this.prop('sObjectName');

        const context = {
            recordId,
            sObjectName,
            params,
            Busyloading: {
                start: this.startModalLoading.bind(this),
                end: this.endModalLoading.bind(this),
                until: p => {
                    this.startModalLoading();
                    return p.then(data => {
                        this.endModalLoading();
                        return data;
                    }, error => {
                        this.endModalLoading();
                        return error;
                    });
                },
            },
            invokeAction: this.invoke.bind(this),
            registerOnSaveHandler: this.registerOnSaveHandler.bind(this),
        };

        return _.assign({}, context, this.prop('context'));
    }

    renderAction(action) {
        const context = this.buildContext(action);

        if(_.isString(action.render) || _.isPlainObject(action.render)) {
            return Preactlet.render(action.render);
        }
        else if(_.isFunction(action.render)) {
            return action.render(context);
        }
        else if(action.fields) {
            let fields = [];

            if(_.isFunction(action.fields)) {
                fields = action.fields(context);
            }
            else if(_.isArray(action.fields)) {
                fields = action.fields;
            }

            const onSaveHandler = _.get(action, 'attributes.onSaveHandler');
            if(_.isFunction(onSaveHandler)) {
                this._onFieldsSaveHandler = onSaveHandler;
                this._onSaveHandler = null;
                this._onRecordFormSaveHandler = null;
            }

            return (
                <Form
                    ref={ this.setFieldsForm }
                    name={ `${this.prop('name')}-${action.name}-fieldsForm` }
                >
                    <FormGroup>
                        {
                            _.map(fields, field => {
                                return field && (
                                <FormTile size={ field.size || '1-of-1' }>
                                    {
                                        renderField(field.type || 'Text', _.assign({}, {
                                            key: field.name,
                                            name: field.name,
                                            label: field.label,
                                            value: _.get(this.state.fieldsState, field.name),
                                            onValueChange: newVal => this.setFieldsState(field.name, newVal),
                                        }, field.renderConfig), this.state.fieldsState)
                                    }
                                </FormTile>
                                );
                            })
                        }
                    </FormGroup>
                </Form>
            );
        }
        else if(action.recordForm) {
            let recordForm = null;

            if(_.isFunction(action.recordForm)) {
                recordForm = action.recordForm(context);
            }
            else if(_.isPlainObject(action.recordForm)) {
                recordForm = action.recordForm;
            }
            else {
                throw new Error(`Invalid definition for record form in action ${action.name}`);
            }

            const onSaveHandler = _.get(action, 'attributes.onSaveHandler');
            if(_.isFunction(onSaveHandler)) {
                this._onRecordFormSaveHandler = (record, proceed) => {
                    onSaveHandler(record, record => {
                        return proceed(record).then(() => this.onCloseModal());
                    });
                };
                this._onSaveHandler = null;
                this._onFieldsSaveHandler = null;
            }

            return (
                <RecordForm
                    ref={ this.setRecordForm }
                    name={ `${this.prop('name')}-${action.name}-recordForm` }
                    variant="base"
                    hideButtons="true"
                    onSave={ this._onRecordFormSaveHandler }
                    { ...recordForm }
                >
                </RecordForm>
            );
        }
        else if(action.actionType === TYPE_VISUALFORCE_PAGE_MODAL) {
            return (
                <IFrame
                    url={ action.actionName }
                    width="100%"
                    height="250px"
                >
                </IFrame>
            );
        }
        else {
            throw new Error(`Invalid action ${action.name}`);
        }
    }

    onFlowModalFinish() {
        this.onCloseModal();
    }

    onCloseModal() {
        this.setState({
            selectedAction: null,
        });
    }

    onSaveModal(...args) {
        if(_.isFunction(this._onRecordFormSaveHandler)) {
            if(this._recordForm) {
                this._recordForm.save();
            }
        }
        else if(_.isFunction(this._onFieldsSaveHandler)) {
            if(this._fieldsForm) {
                const msgs = this._fieldsForm.validate();
                if(!_.isEmpty(msgs)) {
                    return;
                }
            }

            this._onFieldsSaveHandler(this.state.fieldsState, () => {
                this.onCloseModal();
            });
        }
        else if(_.isFunction(this._onSaveHandler)) {
            this._onSaveHandler(() => {
                this.onCloseModal();
            });
        }
    }

    registerOnSaveHandler(handler) {
        this._onSaveHandler = handler;
        this._onFieldsSaveHandler = null;
        this._onRecordFormSaveHandler = null;
    }

    getActions() {
        if(_.isFunction(this.state.createActions)) {
            return this.state.createActions(...(this.prop('createActionsParams')));
        }
        else if(this.state.actions) {
            return this.state.actions;
        }
        else if(_.isFunction(this.prop('createActions'))) {
            return this.prop('createActions')(...(this.prop('createActionsParams')));
        }
        else {
            return this.prop('actions');
        }
    }

    isActionDisabled(action) {
        if(_.isFunction(action.disabled)) {
            const context = this.buildContext(action);
            return action.disabled(context);
        }
        else {
            return !!action.disabled;
        }
    }

    renderHeader() {
        const action = this.state.selectedAction;
        if(action && action.actionType !== TYPE_FLOW_MODAL) {
            return action.name;
        }
    }

    renderFooter() {
        const action = this.state.selectedAction;
        const attributes = action.attributes || {};

        if(action && action.actionType !== TYPE_FLOW_MODAL) {
            return (
                <div>
                    <Button variant="tertiary" label="Cancel" onClick={ this.onCloseModal.bind(this) }/>
                    {
                        attributes.onSaveText && (
                            <Button variant="primary" label={ attributes.onSaveText } onClick={ this.onSaveModal }/>
                        )
                    }
                </div>
            );
        }
    }

    getModalBodyStyle() {
        const action = this.state.selectedAction;

        const style = {
            position: 'relative',
            minHeight: '100px',
        };
        if(action && action.actionType !== TYPE_FLOW_MODAL) {
            style.height = `${_.get(action, 'attributes.height') || 250}px`;
        }

        return style;
    }

    render(props, state) {
        const [{
            className,
            name,
            variant,
            label,
        }, rest] = this.getPropValues();

        const id = this.id();
        const actions = this.getActions();
        const availableActions = _.reject(actions, ['visible', false]);
        const visibleActions = this.getNumOfVisibleActions(actions);
        const children = [];
        if(state.selectedAction) {
            children.push(
                <Modal
                    visible={ !!state.selectedAction }
                    header={ this.renderHeader() }
                    footer={ this.renderFooter() }
                    onClose={ this.onCloseModal.bind(this) }
                    loading={ this.state.modalLoading }
                >
                    {
                        state.selectedAction.actionType === TYPE_LIGHTNING_COMPONENT || state.selectedAction.actionType === TYPE_FLOW_MODAL ?
                        <div id={ id } style={ this.getModalBodyStyle() }>
                            <div ref={ node => this.setSpinner(node) } role="status" className="slds-spinner slds-spinner_brand slds-spinner_medium">
                                <span className="slds-assistive-text">Loading</span>
                                <div className="slds-spinner__dot-a"></div>
                                <div className="slds-spinner__dot-b"></div>
                            </div>
                        </div>
                        :
                        this.renderAction(state.selectedAction)
                    }
                </Modal>
            );
        }

        if(_.isEmpty(availableActions)) {
            return (
                <div>{ children }</div>
            );
        }
        else if(_.size(availableActions) === 1) {
            const action = _.first(availableActions);

            return (
                <Button
                    className={ className }
                    label={ action.name }
                    variant="tertiary"
                    onClick={ e => this.invoke(action)  }
                    disabled={ this.isActionDisabled(action) }
                    tooltip={ action.tooltip }
                >
                    { children }
                </Button>
            );
        }
        else if(variant === 'base') {
            return (
                <div
                    className={ window.$Utils.classnames(
                    'slds-button-group',
                    className
                    ) }
                    role="group"
                    data-type={ this.getTypeName() }
                    data-name={ name }
                >
                    {
                        _.map(_.take(availableActions, visibleActions), action => {
                            return (
                                <Button label={ action.name } variant="tertiary" onClick={ e => this.invoke(action)  } disabled={ this.isActionDisabled(action) } tooltip={ action.tooltip }></Button>
                            );
                        })
                    }
                    {
                        _.size(availableActions) > visibleActions && (
                            <ButtonMenu
                                variant="border-filled"
                                className="slds-button_last"
                                menuAlignment="right"
                                iconName="ctc-utility:a_down"
                                onSelect={ action => this.invoke(action) }
                                { ...rest }
                            >
                                {
                                    _.map(_.slice(availableActions, visibleActions), action => {
                                        return (
                                            <MenuItem label={ action.name } value={ action } disabled={ this.isActionDisabled(action) } tooltip={ action.tooltip }>
                                            </MenuItem>
                                        );
                                    })
                                }
                            </ButtonMenu>
                        )
                    }
                    { children }
                </div>
            );
        }
        else if(variant === 'dropdown') {
            return (
                <ButtonMenu
                    className={ className }
                    variant={ !!label ? 'tertiary' : 'border-filled' }
                    menuAlignment="right"
                    iconName="ctc-utility:a_down"
                    label={ label }
                    onSelect={ action => this.invoke(action) }
                    data-type={ this.getTypeName() }
                    data-name={ name }
                    { ...rest }
                >
                    {
                        _.map(availableActions, action => {
                            return (
                                <MenuItem label={ action.name } value={ action } disabled={ this.isActionDisabled(action) } tooltip={ action.tooltip }>
                                </MenuItem>
                            );
                        })
                    }
                    { children }
                </ButtonMenu>
            );
        }
    }
}

QuickActions.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').demoValue('Action'),
    variant: PropTypes.isString('variant').values([
        'base',
        'dropdown',
    ]).defaultValue('base').demoValue('base'),
    visibleActions: PropTypes.isNumber('visibleActions').defaultValue(2).demoValue(2),
    actions: PropTypes.isArray('actions').shape({
        name: PropTypes.isString('name').required(),
        actionName: PropTypes.isString('actionName'),
        actionType: PropTypes.isString('actionType'),
        attributes: PropTypes.isObject('attributes'),
        onClick: PropTypes.isFunction('onClick'),
        disabled: PropTypes.isObject('disabled'),
        tooltip: PropTypes.isString('tooltip'),
        render: PropTypes.isObject('render'),
        fields: PropTypes.isObject('fields'),
        recordForm: PropTypes.isObject('recordForm'),
    }),
    createActions: PropTypes.isFunction('createActions'),
    createActionsParams: PropTypes.isArray('createActionsParams').defaultValue([]),
    recordId: PropTypes.isString('recordId'),
    sObjectName: PropTypes.isString('sObjectName'),
    name: PropTypes.isString('name'),
    context: PropTypes.isObject('context'),
};

QuickActions.propTypesRest = true;
QuickActions.displayName = "QuickActions";
