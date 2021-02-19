import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import renderField from '../renderField/renderField';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import Utils from '../utils/utils';
import Config from '../utils/config';
import Preactlet from '../preactlet/preactlet';
import styles from './styles.less';
import ProcessManager from './manager';
import createLoadingIndicator from '../busyloading/busyloading';
import ProgressRing from '../progressRing/progressRing';
import RecordForm from '../recordForm/recordForm';

Config.defineConfig([
    {
        name: 'Process - enable debug',
        path: '/System/UI/Process/${name}/isDebugEnabled',
        type: Config.Types.Boolean,
        description: 'Enable debug in processes',
    },
    {
        name: 'Process - extension',
        path: '/System/UI/Process/${name}/extension',
        type: Config.Types.Extension,
        description: 'Customise process',
    },
]);

const ACTION_PREV = 'prev';
const ACTION_DEBUG = 'debug';
const ACTION_NEXT = 'next';
const ACTION_FINISH = 'finish';
const ACTION_SKIP = 'skip';
const ACTION_SEPARATOR = '_';

const defaultActions = [
    {
        name: ACTION_PREV,
        label: 'Prev',
        action: ACTION_PREV,
        renderConfig: {
            variant: 'tertiary',
        },
    },
    {
        name: ACTION_DEBUG,
        label: 'Debug',
        action: ACTION_DEBUG,
        renderConfig: {
            variant: 'tertiary',
        },
    },
    {
        name: ACTION_SKIP,
        label: 'Skip',
        action: ACTION_SKIP,
        renderConfig: {
            variant: 'tertiary',
        },
    },
    {
        name: ACTION_NEXT,
        label: 'Next',
        action: ACTION_NEXT,
        renderConfig: {
            variant: 'primary',
            type: 'submit',
        },
    },
    {
        name: ACTION_FINISH,
        label: 'Finish',
        action: ACTION_FINISH,
        renderConfig: {
            variant: 'save',
            type: 'submit',
        },
    },
    {
        name: ACTION_SEPARATOR,
        label: '_',
        action: ACTION_SEPARATOR,
    },
];

const convertToStageInfo = exit => {
    if(_.isPlainObject(exit)) {
        return exit;
    }
    else if(_.isString(exit)) {
        return {
            name: exit,
            props: {},
        };
    }
};

const getDefaultExit = definitionStage => {
    if(definitionStage.defaultExit) {
        return definitionStage.defaultExit;
    }
    else if(_.isString(definitionStage.exit)) {
        return definitionStage.exit;
    }
};

const findStageBy = (defStage, defStages, filter) => {
    if(filter(defStage)) {
        return defStage;
    }
    else {
        const exit = getDefaultExit(defStage);
        if(exit) {
            const exitStage = _.find(defStages, ['name', exit]);
            return findStageBy(exitStage, defStages, filter);
        }
    }
};

const stepThroughStages = (defStage, defStages, stepToEndMappings, pending = []) => {
    if(_.includes(pending, defStage.name)) {
        stepToEndMappings[defStage.name] = -1;
    }
    else if(stepToEndMappings[defStage.name] === undefined) {
        const defaultExit = getDefaultExit(defStage);
        if(defaultExit) {
            const exitStage = _.find(defStages, ['name', defaultExit]);
            if(!_.includes(pending, defStage.name)) {
                pending.push(defStage.name);
            }
            stepThroughStages(exitStage, defStages, stepToEndMappings, pending);
            _.pull(pending, defStage.name);
            if(stepToEndMappings[defaultExit] >= 0) {
                stepToEndMappings[defStage.name] = stepToEndMappings[defaultExit] + 1;
            }
            else {
                stepToEndMappings[defStage.name] = -1;
            }
        }
        else {
            stepToEndMappings[defStage.name] = 0;
        }
    }
};

const LoadingIndicator = createLoadingIndicator(false);

export default class Process extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            instance: {
                stages: [],
            },
        });

        this._definition = {
            stages: [],
        };
        this._form = null;
        this._recordForm = null;
        this._stepToEndMappings = {};
        this._lastProgress = 0;

        this.bind([
            'setForm',
            'setRecordForm',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        const name = this.prop('name');
        LoadingIndicator.until(
            Config.loadExtension(`/System/UI/Process/${name}/extension`, this.context.globalData).then(resources => {
                return Promise.all(_.map(resources, Utils.retrieve)).then(definitions => {
                    _.forEach(definitions, definition => {
                        if(_.isArray(definition)) {
                            ProcessManager.addDefinitions(definition);
                        }
                        else {
                            ProcessManager.addDefinition(definition);
                        }
                    });

                    this.initInstance(this.props.definitionName);
                });
            })
        );
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.initInstance(nextProps.definitionName);
    }

    setForm(node) {
        this._form = node;
    }

    setRecordForm(node) {
        this._recordForm = node;
    }

    initInstance(definitionName) {
        const definition = ProcessManager.getDefinition(definitionName);

        if(definition && this._definition !== definition) {
            this._definition = definition;

            const instance = this.buildInstance(this._definition);

            this.setState({
                instance,
            });
        }
    }

    findEntryStage(definition) {
        const stageName = this.prop('stageName');
        if(stageName) {
            return _.find(definition.stages, stageName);
        }
        else {
            return _.first(definition.stages);
        }
    }

    validateDefinition(definition) {
        let msg = null;

        // Stages should have defaultExit unless they are end stages
        _.forEach(definition.stages, stage => {
            if(this.isEndStage(stage)) {
                return;
            }

            if(!_.isString(stage.exit) && !stage.defaultExit) {
                msg = `The default exit for stage [${stage.name}] is missing`;
                return false;
            }
        });

        // Skips should only be used in groups
        if(!msg) {
            _.forEach(definition.stages, stage => {
                if(stage.skip && !stage.group) {
                    msg = `Skip can only be used together with group`;
                    return false;
                }
            });
        }

        // Check for endless loops for defaultExits
        if(!msg) {
            _.forEach(definition.stages, stage => {
                stepThroughStages(stage, definition.stages, this._stepToEndMappings);
            });

            const endlessStageNames = _.chain(this._stepToEndMappings)
                .toPairs()
                .map(([name, steps]) => steps < 0 ? name : null)
                .compact()
                .join(', ')
                .value();

            if(endlessStageNames) {
                msg = `Possible loops detected for ${endlessStageNames}`;
            }
        }

        return msg;
    }

    buildInstance(definition) {
        const msg = this.validateDefinition(definition);
        if(msg) {
            throw new Error(`Validation failed for ${definition.name}: ${msg}`);
        }

        const entryStage = this.findEntryStage(definition);
        if(!entryStage) {
            throw new Error(`Cannot find entry stage for process ${definition.name}`);
        }

        // Process instance state is combined by all the instance stage states
        const instance = {
            name: definition.name,
            defaultState: definition.defaultState,
            props: this.prop('props') || {},
            actions: [],
            stages: [
            ],
            currentStageIndex: -1,
            lastStageIndex: -1,
        };

        // Build entry stage instance
        const entryInstanceStage = this.buildInstanceStage(entryStage, instance, null);
        instance.stages.push(entryInstanceStage);
        instance.currentStageIndex = 0;

        // Build actions
        const actions = definition.actions;
        const instanceActions = [];

        _.forEach(defaultActions, defaultAction => {
            const overrideAction = _.find(actions, ['name', defaultAction.name]);
            if(overrideAction) {
                instanceActions.push(_.assign({}, defaultAction, overrideAction));
            }
            else {
                instanceActions.push(defaultAction);
            }
        });

        _.forEach(actions, action => {
            const existingAction = _.find(defaultActions, ['name', action.name]);
            if(!existingAction) {
                instanceActions.push(action);
            }
        });

        instance.actions = instanceActions;

        return instance;
    }

    getInstance() {
        return this.state.instance;
    }

    getDefinition() {
        return this._definition;
    }

    getInstanceState() {
        const instance = this.getInstance();
        const state = _.assign({}, instance.defaultState);

        _.forEach(this.getInstanceStages(), stage => {
            _.merge(state, stage.state);
        });

        return state;
    }

    getInstanceStages() {
        const instance = this.getInstance();
        return _.slice(instance.stages, 0, instance.currentStageIndex + 1);
    }

    getInstanceProgress() {
        const currentStage = this.getCurrentStage();
        const toComplete = this._stepToEndMappings[currentStage.name];
        const completed = _.size(this.getInstanceStages());
        return _.toInteger(100 * completed / (completed + toComplete));
    }

    buildCallbacks(stage) {
        const instance = this.getInstance();

        return {
            getState: path => _.get(this.getInstanceState(), path),
            setState: (path, newVal) => this.setCurrentStageState(path, newVal),
            getProp: path => _.get(_.assign({}, instance.props, stage.props), path),
            trigger: actionName => this.trigger(actionName, stage),
            gotoStage: (stageName, stageProps) => this.gotoStage(stageName, stageProps),
            form: this._form,
        };
    }

    buildInstanceStage(definitionStage, instance, stageProps) {
        const instanceStage = {
            id: definitionStage.name + '-' + _.size(instance.stages),
            name: definitionStage.name,
            props: stageProps,
            state: {},
        };

        const callbacks = this.buildCallbacks(instanceStage);

        const defaultState = _.isFunction(definitionStage.defaultState) ? definitionStage.defaultState(callbacks) : definitionStage.defaultState;
        instanceStage.state = _.assign({}, defaultState);

        // Build group
        let group = [];
        if(_.isString(definitionStage.group)) {
            group.push(definitionStage.group);
        }
        else if(_.isArray(definitionStage.group)) {
            group = definitionStage.group;
        }
        else if(_.isFunction(definitionStage.group)) {
            group = definitionStage.group(callbacks);
        }
        instanceStage.group = group;

        // Build skip
        let skip;
        if(_.isString(definitionStage.skip)) {
            skip = definitionStage.skip;
        }
        else if(_.isFunction(definitionStage.skip)) {
            skip = definitionStage.skip(callbacks);
        }
        else if(definitionStage.skip === true) {
            // Find next possible stage to skip to
            const definition = this.getDefinition();
            const skipToStage = findStageBy(definitionStage, definition.stages, stage => {
                if((_.isString(stage.group) || _.isArray(stage.group)) &&
                    (_.isString(definitionStage.group) || _.isArray(definitionStage.group))) {
                    const src = _.isString(definitionStage.group) ? [definitionStage.group] : definitionStage.group;
                    const dest = _.isString(stage.group) ? [stage.group] : stage.group;
                    return !_.isEqual(src, dest);
                }

                return true;
            });
            if(!skipToStage) {
                throw new Error('Cannot detect next possible stage to skip to');
            }
            skip = skipToStage.name;
        }
        instanceStage.skip = skip;

        return instanceStage;
    }

    getCurrentStage() {
        const instance = this.getInstance();
        return instance.stages[instance.currentStageIndex];
    }

    getDefinitionStage(stageName) {
        const definition = this.getDefinition();
        return _.find(definition.stages, ['name', stageName]);
    }

    isEndStage(definitionStage) {
        return _.isNil(definitionStage.exit);
    }

    getInstanceAction(actionName) {
        const instance = this.getInstance();

        return _.find(instance.actions, ['name', actionName]);
    }

    getCurrentStageActions() {
        const currentStage = this.getCurrentStage();
        const definitionStage = this.getDefinitionStage(currentStage.name);
        let actions = [];

        if(definitionStage.actions) {
            let defActions = [];
            const callbacks = this.buildCallbacks(currentStage);

            if(_.isArray(definitionStage.actions)) {
                defActions = definitionStage.actions;
            }
            else if(_.isFunction(definitionStage.actions)) {
                defActions = definitionStage.actions(callbacks);
            }

            _.forEach(defActions, action => {
                const actionObject = _.isString(action) ? { name: action } : action;
                const instanceAction = this.getInstanceAction(actionObject.name);
                actions.push(_.assign({}, instanceAction, actionObject));
            });
        }
        else {
            const instance = this.getInstance();
            const index = instance.currentStageIndex;

            if(index !== 0) {
                actions.push(this.getInstanceAction(ACTION_PREV));
            }

            actions.push(this.getInstanceAction(ACTION_SEPARATOR));

            if(definitionStage.skip) {
                actions.push(this.getInstanceAction(ACTION_SKIP));
            }

            if(this.isEndStage(definitionStage)) {
                actions.push(this.getInstanceAction(ACTION_FINISH));
            }
            else {
                actions.push(this.getInstanceAction(ACTION_NEXT));
            }
        }

        if(this.isDebugEnabled()) {
            const index = _.findIndex(actions, ['name', ACTION_SEPARATOR]);
            const debugAction = this.getInstanceAction(ACTION_DEBUG);
            if(index >= 0) {
                actions = [
                    ...(_.slice(actions, 0, index + 1)),
                    debugAction,
                    ...(_.slice(actions, index + 1)),
                ];
            }
            else {
                actions.push(debugAction);
            }
        }

        return actions;
    }

    getActionGroups() {
        const actions = this.getCurrentStageActions();
        const index = _.findIndex(actions, ['name', ACTION_SEPARATOR]);
        const leftGroup = _.slice(actions, 0, index);
        const rightGroup = _.slice(actions, index + 1);
        return [leftGroup, rightGroup];
    }

    setCurrentStageState(path, newVal) {
        const currentStage = this.getCurrentStage();
        const instance = this.getInstance();

        let newState = _.assign({}, currentStage.state);

        if(_.isString(path)) {
            _.set(newState, path, newVal);
        }
        else if(_.isPlainObject(path)) {
            _.forEach(path, (val, key) => {
                _.set(newState, key, val);
            });
        }

        const newCurrentStage = _.assign({}, currentStage, {
            state: newState,
        });

        const newInstance = _.assign({}, instance, {
            stages: Utils.update(instance.stages, instance.currentStageIndex, newCurrentStage),
        });

        this.setState({
            instance: newInstance,
        });
    }

    gotoPrevStage() {
        const instance = this.getInstance();
        const index = instance.currentStageIndex;

        if(index > 0) {
            this.setState({
                instance: _.assign({}, instance, {
                    currentStageIndex: index - 1,
                    lastStageIndex: index,
                }),
            });
        }
    }

    gotoNextStage(stageProps = {}) {
        const nextStageInfo = this.findNextStageInfo();
        if(!nextStageInfo) {
            return;
        }

        this.gotoStage(nextStageInfo.name, nextStageInfo.props);
    }

    onFinish() {
        const state = this.getInstanceState();
        if(_.isFunction(this.prop('onFinish'))) {
            const currentStage = this.getCurrentStage();
            const callbacks = this.buildCallbacks(currentStage);
            const result = this.prop('onFinish')(state, callbacks);
            if(result && _.isFunction(result.then)) {
                LoadingIndicator.start();
                result.then(() => LoadingIndicator.stop(), () => LoadingIndicator.stop());
            }
        }
    }

    findNextStageInfo() {
        const currentStage = this.getCurrentStage();
        const definitionStage = this.getDefinitionStage(currentStage.name);
        const callbacks = this.buildCallbacks(currentStage);

        let info = null;
        if(_.isString(definitionStage.exit)) {
            info = convertToStageInfo(definitionStage.exit);
        }
        else if(_.isArray(definitionStage.exit)) {
            _.forEach(definitionStage.exit, item => {
                const [criteria, exit] = item;
                const matched = _.chain(criteria)
                    .toPairs()
                    .every(([path, val]) => callbacks.getState(path) === val)
                    .value();

                if(matched) {
                    info = convertToStageInfo(exit);
                    return false;
                }
            });
        }
        else if(_.isFunction(definitionStage.exit)) {
            info = convertToStageInfo(definitionStage.exit(callbacks));
        }
        else {
            info = convertToStageInfo(definitionStage.defaultExit);
        }

        return info;
    }

    isDebugEnabled() {
        const name = this.prop('name');
        return Config.getValue(`/System/UI/Process/${name}/isDebugEnabled`, this.context.globalData);
    }

    debug() {
        const instance = this.getInstance();
        const currentStage = this.getCurrentStage();
        const instanceStages = this.getInstanceStages();

        console.log('Definitions: ', ProcessManager.getDefinitions());
        console.log('Process Name: ', this.prop('name'));
        console.log('Process Entry Stage Name: ', this.prop('stageName'));
        console.log('Process Props: ', this.prop('props'));
        console.log('Instance: ', instance);
        console.log('Instance State: ', this.getInstanceState());
        console.log('Steps to complete: ', this._stepToEndMappings[currentStage.name]);
        console.log('Steps completed: ', _.size(instanceStages));
    }

    gotoStage(stageName, stageProps) {
        const instance = this.getInstance();
        const index = instance.currentStageIndex;
        const nextPossibleStage = instance.stages[index + 1];
        let stages = instance.stages;

        if(nextPossibleStage) {
            if(nextPossibleStage.name === stageName) {
                // Use existing next stage
                const newInstance = _.assign({}, instance, {
                    currentStageIndex: index + 1,
                    lastStageIndex: index,
                });

                this.setState({
                    instance: newInstance,
                });

                return;
            }
            else {
                // Clear existing following stages
                stages = _.slice(stages, 0, index + 1);
            }
        }

        // Create new instance stage
        const templateStage = _.find(this._definition.stages, ['name', stageName]);
        const nextStage = this.buildInstanceStage(templateStage, instance, stageProps);
        const newInstance = _.assign({}, instance, {
            stages: [
                ...stages,
                nextStage,
            ],
            currentStageIndex: index + 1,
            lastStageIndex: index,
        });

        this.setState({
            instance: newInstance,
        });
    }

    validate() {
        const currentStage = this.getCurrentStage();
        const defStage = this.getDefinitionStage(currentStage.name);

        let msg = [];
        if(defStage.recordForm) {
            msg = this._recordForm.validate();
        }
        else {
            msg = this._form.validate();
        }

        return msg;
    }

    skip() {
        const instance = this.getInstance();
        const currentStage = this.getCurrentStage();
        if(!currentStage.skip) {
            return;
        }
        const skipToDefinitionStage = this.getDefinitionStage(currentStage.skip);
        const skipToInstanceStage = this.buildInstanceStage(skipToDefinitionStage, instance, null);

        const activeInstanceStages = _.slice(instance.stages, 0, instance.currentStageIndex + 1);
        const staleInstanceStages = _.slice(instance.stages, instance.currentStageIndex + 1);
        const remainingActiveInstanceStages = _.dropRightWhile(activeInstanceStages, stage => {
            return _.isEqual(stage.group, currentStage.group);
        });

        const newInstance = _.assign({}, instance, {
            stages: [
                ...remainingActiveInstanceStages,
                skipToInstanceStage,
                ...staleInstanceStages,
            ],
            currentStageIndex: _.size(remainingActiveInstanceStages),
            lastStageIndex: instance.currentStageIndex,
        });

        this.setState({
            instance: newInstance,
        });
    }

    trigger(actionName, currentStage) {
        const definitionStage = this.getDefinitionStage(currentStage.name);
        let result = null;

        const action = this.getInstanceAction(actionName);
        if(_.get(action, 'renderConfig.type') === 'submit') {
            const msg = this.validate();
            if(!_.isEmpty(msg)) {
                return;
            }
        }

        if(_.isFunction(definitionStage.onAction)) {
            const callbacks = this.buildCallbacks(currentStage);
            result = definitionStage.onAction(actionName, callbacks);
        }

        if(result) {
            if(_.isFunction(result.then)) {
                LoadingIndicator.start();
                result.then(() => LoadingIndicator.stop(), () => LoadingIndicator.stop());
            }
        }
        else {
            switch(actionName) {
                case ACTION_NEXT:
                    this.gotoNextStage();
                    break;
                case ACTION_PREV:
                    this.gotoPrevStage();
                    break;
                case ACTION_FINISH:
                    this.onFinish();
                    break;
                case ACTION_DEBUG:
                    this.debug();
                    break;
                case ACTION_SKIP:
                    this.skip();
                    break;
                default:
                    break;
            }
        }
    }

    renderHeader(currentStage, definitionStage, callbacks) {
        const instance = this.getInstance();
        let progress = this.getInstanceProgress();

        if(progress < this._lastProgress && instance.currentStageIndex >= instance.lastStageIndex) {
            progress = this._lastProgress;
        }

        this._lastProgress = progress;

        return (
            <div className="slds-process_header slds-p-bottom_medium slds-border_bottom slds-grid slds-grid_align-spread">
                <div className="slds-text-heading_medium">
                    {
                        _.isFunction(definitionStage.title) ? definitionStage.title(callbacks) : definitionStage.title
                    }
                </div>
                <ProgressRing
                    value={ progress }
                    size="large"
                >
                </ProgressRing>
            </div>
        );
    }

    renderBodyFormContent(currentStage, definitionStage, callbacks) {
        if(_.isString(definitionStage.render) || _.isPlainObject(definitionStage.render)) {
            return Preactlet.render(definitionStage.render);
        }
        else if(_.isFunction(definitionStage.render)) {
            return definitionStage.render(callbacks);
        }
        else {
            let fields = [];

            if(_.isFunction(definitionStage.fields)) {
                fields = definitionStage.fields(callbacks);
            }
            else if(_.isArray(definitionStage.fields)) {
                fields = definitionStage.fields;
            }

            return (
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
                                        value: callbacks.getState(field.name),
                                        onValueChange: newVal => callbacks.setState(field.name, newVal),
                                    }, field.renderConfig), this.getInstanceState())
                                }
                            </FormTile>
                            );
                        })
                    }
                </FormGroup>
            );
        }
    }

    renderBody(currentStage, definitionStage, callbacks) {
        let recordForm = null;
        if(definitionStage.recordForm) {
            if(_.isFunction(definitionStage.recordForm)) {
                recordForm = definitionStage.recordForm(callbacks);
            }
            else if(_.isPlainObject(definitionStage.recordForm)) {
                recordForm = definitionStage.recordForm;
            }
        }

        return (
            <div className="slds-process_body">
                <Form
                    ref={ this.setForm }
                    name={ currentStage.id }
                >
                    {
                        recordForm ?
                        <RecordForm
                            ref={ this.setRecordForm }
                            { ...(recordForm.props) }
                            hideButtons="true"
                            value={ callbacks.getState(recordForm.target) }
                            onValueChange={ newVal => callbacks.setState(recordForm.target, newVal) }
                        >
                        </RecordForm>
                        :
                        this.renderBodyFormContent(currentStage, definitionStage, callbacks)
                    }
                </Form>
            </div>
        );
    }

    renderFooter(currentStage, definitionStage, callbacks) {
        const [leftGroup, rightGroup] = this.getActionGroups();

        return (
            <div className="slds-process_footer slds-m-top_medium slds-p-top_medium slds-grid">
                <div className="slds-button-group">
                    {
                        _.map(leftGroup, action => {
                            return renderField('Button', _.assign({}, {
                                label: action.label,
                                onClick: () => this.trigger(action.name, currentStage),
                            }, action.renderConfig), this.getInstanceState());
                        })
                    }
                </div>
                <div className="slds-button-group slds-col_bump-left">
                    {
                        _.map(rightGroup, action => {
                            return renderField('Button', _.assign({}, {
                                label: action.label,
                                onClick: () => this.trigger(action.name, currentStage),
                            }, action.renderConfig), this.getInstanceState());
                        })
                    }
                </div>
            </div>
        );
    }

    render(props, state) {
        const [{
            className,
            name,
        }, rest] = this.getPropValues();

        const currentStage = this.getCurrentStage();

        if(currentStage) {
            const callbacks = this.buildCallbacks(currentStage);
            const definitionStage = this.getDefinitionStage(currentStage.name);

            return (
                <LoadingIndicator.Zone
                    minHeight="5rem"
                >
                    <div
                        className={ `slds-process ${className}` }
                        data-type={ this.getTypeName() }
                        data-name={ name }
                        { ...rest }
                    >
                        { this.renderHeader(currentStage, definitionStage, callbacks) }
                        { this.renderBody(currentStage, definitionStage, callbacks) }
                        { this.renderFooter(currentStage, definitionStage, callbacks) }
                    </div>
                </LoadingIndicator.Zone>
            );
        }
    }
}

Process.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    definitionName: PropTypes.isString('definitionName').demoValue('main'),
    stageName: PropTypes.isString('stageName'),
    props: PropTypes.isObject('props'),
    onFinish: PropTypes.isFunction('onFinish'),
};

Process.propTypesRest = true;
Process.displayName = "Process";
