import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import renderField from '../renderField/renderField';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import RadioGroup from '../radioGroup/radioGroup';
import MjmlPreview from '../mjml/mjmlPreview';
import createLoadingIndicator from '../busyloading/busyloading';
import Utils from '../utils/utils';

const defaultSchema = {
    variables: [],
    layout: [],
};

export default class Variables extends BaseComponent {
    constructor() {
        super();

        this.state = {
            mutexGroup: {},
            context: null,
            userContext: null,
            activeSectionName: null,
        };

        this.bind([
            'onSectionSelect',
        ]);

        this._defaultValues = null;
        this.$loadingIndicator = createLoadingIndicator(false);
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadDefaultValues(this.props);
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.loadDefaultValues(nextProps);
    }

    loadDefaultValues(props) {
        const {
            schema,
            value,
            variant,
            mjmlConfigurer,
        } = props;

        if(!this._defaultValues && schema && _.isEmpty(value)) {
            const defaultValues = {};
            _.forEach(schema.variables, variable => {
                if(variable.defaultValue) {
                    _.set(defaultValues, variable.name, variable.defaultValue);
                }
            });

            this._defaultValues = defaultValues;
            if(_.isFunction(this.prop('onValueChange'))) {
                this.prop('onValueChange')(this._defaultValues);
            }
        }

        if(!this.state.context &&
            !this.state.userContext &&
            variant === 'mjml' &&
            mjmlConfigurer &&
            !_.isEmpty(value)
        ) {
            this.syncPreview();
        }
    }

    onSectionSelect(newSectionName) {
        this.setState({
            activeSectionName: newSectionName,
        });
    }

    syncPreview() {
        const mjmlConfigurer = this.prop('mjmlConfigurer');
        const loadContext = mjmlConfigurer.loadContext || (() => Utils.delay({}, 50));
        const loadUserContext = mjmlConfigurer.loadUserContext || (userContext => Utils.delay(userContext, 50));

        const userContext = this.prop('value');

        this.$loadingIndicator.until(
            Promise.all([
                loadContext(),
                loadUserContext(userContext),
            ]).then(([context, userContext]) => {
                this.setState({
                    context,
                    userContext,
                });
            })
        );
    }

    getSchemaVariables() {
        const schema = this.prop('schema') || defaultSchema;
        return schema.variables || [];
    }

    getSchemaLayout() {
        const schema = this.prop('schema') || defaultSchema;
        return schema.layout || [];
    }

    getSchemaVariable(name) {
        return _.find(this.getSchemaVariables(), ['name', name]);
    }

    getVariableValue(name) {
        const value = this.prop('value');
        return value && value[name];
    }

    onValueChange(newVal, name) {
        const value = this.prop('value') || {};
        const newValue = _.assign({}, value, {
            [name]: newVal,
        });

        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(newValue);
        }
    }

    shouldDisplaySection(sectionName) {
        if(this.state.activeSectionName) {
            return sectionName ? sectionName === this.state.activeSectionName : true;
        }
        else {
            return true;
        }
    }

    renderVariable(layoutItem, options) {
        layoutItem = _.isString(layoutItem) ? {
            name: layoutItem,
            size: '1-of-1',
        } : layoutItem;
        const name = layoutItem.name;
        const variable = this.getSchemaVariable(name);
        if(variable) {
            const label = _.get(variable.renderConfig, 'label') || _.capitalize(name);
            return (
                <FormTile className={ window.$Utils.classnames(
                    layoutItem.className,
                    options.itemClassName,
                    {
                        'slds-hide': !this.shouldDisplaySection(variable.section),
                    }
                    ) } size={ layoutItem.size }>
                    {
                        renderField(variable.type, _.assign({}, variable.renderConfig, {
                            name,
                            label,
                            value: this.getVariableValue(name) || variable.defaultValue,
                            onValueChange: newVal => this.onValueChange(newVal, name),
                        }), this.prop('value'))
                    }
                </FormTile>
            );
        }
        else {
            return null;
        }
    }

    renderVariables(layoutItem, options) {
        const type = layoutItem.type;
        switch(type) {
            case 'Group':
                return this.renderVariableGroup(layoutItem, options);
            case 'Mutex':
                return this.renderVariableMutex(layoutItem, options);
            default:
                return this.renderVariableRootGroup(layoutItem, options);
        }
    }

    onMutexValueChange(newVal, layoutItem) {
        this.setState({
            mutexGroup: _.assign({}, this.state.mutexGroup, {
                [layoutItem.label]: newVal,
            }),
        });

        if(_.isFunction(this.prop('onValueChange'))) {
            const value = this.prop('value');
            const overrideValue = {};
            _.forEach(layoutItem.children, child => {
                overrideValue[child] = null;
            });
            this.prop('onValueChange')(_.assign({}, value, overrideValue));
        }
    }

    renderVariableMutex(layoutItem, options) {
        if(!layoutItem.label) {
            throw new Error('Mutex label is required');
        }

        if(_.isEmpty(layoutItem.children)) {
            throw new Error('Mutex should not be empty');
        }

        const groupOptions = _.map(layoutItem.children, child => {
            const childVar = this.getSchemaVariable(child);
            return {
                label: (childVar.renderConfig && childVar.renderConfig.label) || childVar.name,
                value: childVar.name,
            };
        });

        const selected = this.state.mutexGroup[layoutItem.label] || groupOptions[0].value;

        return this.shouldDisplaySection(layoutItem.section) && [
            <FormTile>
                <RadioGroup
                    name={ layoutItem.label }
                    label={ layoutItem.label }
                    style="button"
                    options={ groupOptions }
                    value={ selected }
                    onValueChange={ newVal => this.onMutexValueChange(newVal, layoutItem)  }
                >
                </RadioGroup>
            </FormTile>,
            this.renderLayoutItem(selected, options),
        ];
    }

    renderVariableGroup(layoutItem, options) {
        return (
            <FormTile className={ window.$Utils.classnames(
                layoutItem.className,
                options.itemClassName,
                {
                    'slds-hide': !this.shouldDisplaySection(layoutItem.section),
                }
                ) } size={ layoutItem.size }>
                <div className={ window.$Utils.classnames(
                    'slds-grid slds-grid_vertical slds-box',
                    options.groupClassName
                    ) }>
                    {
                        layoutItem.label && (
                        <div className="slds-p-vertical_medium slds-m-bottom_medium slds-border_bottom">
                            { layoutItem.label }
                        </div>
                        )
                    }
                    <div className="slds-grid slds-gutters slds-wrap">
                        {
                            _.map(layoutItem.children, child => this.renderLayoutItem(child, options))
                        }
                    </div>
                </div>
            </FormTile>
        );
    }

    renderVariableRootGroup(layoutItem, options) {
        return this.shouldDisplaySection(layoutItem.section) && (
            <FormGroup className={ options.className } data-type={ this.getTypeName() }>
                {
                    _.map(layoutItem.children, child => this.renderLayoutItem(child, options))
                }
            </FormGroup>
        );
    }

    renderLayoutItem(layoutItem, options) {
        if(!layoutItem.children) {
            return this.renderVariable(layoutItem, options);
        }
        else {
            return this.renderVariables(layoutItem, options);
        }
    }

    isInMjmlPreviewMode() {
        return this.prop('variant') === 'mjml' && this.prop('mjmlConfigurer');
    }

    render(props, state) {
        const [{
            className,
            groupClassName,
            itemClassName,
        }, rest] = this.getPropValues();

        const rootLayoutItem = {
            type: 'RootGroup',
            children: this.getSchemaLayout(),
        };

        if(this.isInMjmlPreviewMode()) {
            const LoadingZone = this.$loadingIndicator.Zone;
            const mjmlConfigurer = this.prop('mjmlConfigurer');

            return (
                <LoadingZone>
                    <div className={ `slds-grid ${className}` }>
                        <div className="slds-col slds-size_1-of-2 slds-p-right_xx-small">
                            <div className="slds-text-heading_medium slds-text-align_center slds-p-around_x-small">
                                { mjmlConfigurer.previewHeading || 'Preview' }
                            </div>
                            <MjmlPreview
                                src={ mjmlConfigurer.template }
                                context={ this.state.context }
                                userContext={ this.state.userContext }
                                activeSectionName={ this.state.activeSectionName }
                                onSectionSelect={ this.onSectionSelect }
                            >
                            </MjmlPreview>
                        </div>
                        <div className="slds-col slds-size_1-of-2 slds-p-left_xx-small">
                            {
                                this.renderLayoutItem(rootLayoutItem, {
                                    className: '',
                                    groupClassName,
                                    itemClassName,
                                })
                            }
                        </div>
                    </div>
                </LoadingZone>
            );
        }
        else {
            return this.renderLayoutItem(rootLayoutItem, {
                className,
                groupClassName,
                itemClassName,
            });
        }
    }
}

Variables.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'standard',
        'mjml',
    ]).defaultValue('standard').demoValue('standard'),
    groupClassName: PropTypes.isString('groupClassName').demoValue(''),
    itemClassName: PropTypes.isString('itemClassName').demoValue(''),
    schema: PropTypes.isObject('schema').required(),
    value: PropTypes.isObject('value'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    mjmlConfigurer: PropTypes.isObject('mjmlConfigurer').shape({
        loadContext: PropTypes.isFunction('loadContext'),
        loadUserContext: PropTypes.isFunction('loadUserContext'),
        template: PropTypes.isString('template'),
        previewHeading: PropTypes.isString('previewHeading'),
    }),
};

Variables.propTypesRest = true;
Variables.displayName = "Variables";
