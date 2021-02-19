import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Button from '../button/button';
import Modal from '../modal/modal';
import renderField from '../renderField/renderField';
import Preactlet from '../preactlet/preactlet';
import Utils from '../utils/utils';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import styles from './styles.less';

const defaultPath = {
    props: {},
    items: [],
};

export default class PathEditor extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showModal: false,
        });

        this.bind([
            'onNewModuleModalClose',
            'showNewModuleModal',
            'renderPathItem',
        ]);

        this._forms = [];
    }

    setForm(index, node) {
        this._forms[index] = node;
    }

    getModules() {
        return this.prop('modules');
    }

    onNewModuleModalClose() {
        this.setState({
            showModal: false,
        });
    }

    showNewModuleModal() {
        const form = _.last(this._forms);
        if(form) {
            const msg = form.validate();
            if(!_.isEmpty(msg)) {
                return;
            }
        }

        this.setState({
            showModal: true,
        });
    }

    setValue(newVal) {
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(newVal, this.prop('name'));
        }
    }

    getValue() {
        const path = this.prop('value');
        return path || defaultPath;
    }

    isEnabled(module) {
        const callbacks = this.buildCallbacks();

        if(_.isFunction(module.isEnabled)) {
            return module.isEnabled(callbacks);
        }
        else if(_.isPlainObject(module.isEnabled)) {
            return _.chain(module.isEnabled)
                .toPairs()
                .every(([name, val]) => callbacks.getState(name) === val)
                .value();
        }
        else if(_.isBoolean(module.isEnabled)) {
            return module.isEnabled;
        }
        else {
            return true;
        }
    }

    onAddModule(module) {
        const newPathItem = {
            id: `${module.name}-${_.uniqueId()}`,
            name: module.name,
            state: _.assign({}, module.defaultState),
        };

        const path = this.getValue();
        const newPath = _.assign({}, path, {
            items: [
                ...(path.items),
                newPathItem,
            ],
        });

        this.setState({
            showModal: false,
        }, () => {
            this.setValue(newPath);
        });
    }

    findModule(name) {
        const modules = this.getModules();
        return _.find(modules, ['name', name]);
    }

    deletePathItem(index) {
        const path = this.getValue();
        const newPath = _.assign({}, path, {
            items: _.reject(path.items, (item, idx) => idx === index),
        });

        this.setValue(newPath);
    }

    renderModuleHeader(pathItem, module, index) {
        return (
            <header className="slds-path-editor_module-header slds-grid">
                { module.title }
                <div className="slds-col_bump-left">
                    <button className="slds-button slds-button_icon slds-button_icon" title="Delete" onClick={ () => this.deletePathItem(index) }>
                        <PrimitiveIcon
                            iconName="utility:delete"
                            className="slds-button__icon"
                            variant="bare"
                        >
                        </PrimitiveIcon>
                    </button>
                </div>
            </header>
        );
    }

    renderPathItem(pathItem, index) {
        const module = this.findModule(pathItem.name);
        if(!module) {
            return null;
        }

        return (
            <section className="slds-path-editor_module">
                { this.renderModuleHeader(pathItem, module, index) }
                <div className="slds-path-editor_module-body slds-p-horizontal_medium slds-p-bottom_medium">
                    <Form
                        ref={ node => this.setForm(index, node) }
                        name={ `form-${pathItem.id}` }
                    >
                        { this.renderPathItemContent(pathItem, module) }
                    </Form>
                </div>
            </section>
        );
    }

    validate() {
        const msg = [];

        _.forEach(this._forms, form => {
            const formMsg = form.validate();
            msg.push(...(formMsg || []));
        });

        return msg;
    }

    getPathState() {
        const path = this.getValue();
        const state = {};

        _.forEach(path.items, item => {
            _.merge(state, item.state);
        });

        return state;
    }

    buildCallbacks(pathItem) {
        const path = this.getValue();

        return {
            getProps: name => _.get(path.props, name),

            getState: name => {
                if(pathItem) {
                    return _.get(pathItem.state, name);
                }
                else {
                    return _.get(this.getPathState(), name);
                }
            },

            setState: (name, val) => {
                if(!pathItem) {
                    return;
                }

                const newPathItem = _.assign({}, pathItem, {
                    state: _.set(pathItem.state, name, val),
                });
                const newPath = _.assign({}, path, {
                    items: Utils.update(path.items, 'id', newPathItem),
                });

                this.setValue(newPath);
            },
        };
    }

    renderPathItemContent(pathItem, module) {
        const callbacks = this.buildCallbacks(pathItem);
        if(_.isString(module.render) || _.isPlainObject(module.render)) {
            return Preactlet.render(module.render);
        }
        else if(_.isFunction(module.render)) {
            return module.render(callbacks);
        }
        else {
            let fields = [];
            if(_.isFunction(module.fields)) {
                fields = module.fields(callbacks);
            }
            else if(_.isArray(module.fields)) {
                fields = module.fields;
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
                                    }, field.renderConfig))
                                }
                            </FormTile>
                            );
                        })
                    }
                </FormGroup>
            );
        }
    }

    render(props, state) {
        const [{
            className,
            name,
        }, rest] = this.getPropValues();

        const modules = this.getModules();
        const groups = _.groupBy(modules, 'category');
        const path = this.getValue();

        return (
            <div
                className={ `slds-path-editor ${className}` }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    _.map(path.items, this.renderPathItem)
                }
                <section className="slds-path-editor_module slds-align_absolute-center">
                    <Button
                        label="New Module"
                        variant="primary"
                        iconName="utility:add"
                        onClick={ this.showNewModuleModal }
                    >
                    </Button>
                </section>
                <Modal
                    header="Add New Module"
                    visible={ this.state.showModal }
                    onClose={ this.onNewModuleModalClose }
                >
                    {
                        _.map(groups, (group, groupName) => {
                            return (
                            <div className="slds-m-bottom_medium">
                                <div className="slds-m-bottom_small">
                                    { groupName }
                                </div>
                                <div className="slds-grid slds-gutters">
                                    {
                                        _.map(group, module => {
                                            return (
                                            <div className="slds-col slds-size_1-of-4">
                                                <Button
                                                    className="slds-size_1-of-1"
                                                    variant="tertiary"
                                                    label={ module.title }
                                                    disabled={ !this.isEnabled(module) }
                                                    onClick={ () => this.onAddModule(module) }
                                                >
                                                </Button>
                                            </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                            );
                        })
                    }
                </Modal>
            </div>
        );
    }
}

PathEditor.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    value: PropTypes.isObject('value'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    modules: PropTypes.isArray('modules'),
};

PathEditor.propTypesRest = true;
PathEditor.displayName = "PathEditor";
