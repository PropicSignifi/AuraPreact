import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Tabset from '../tabset/tabset';
import Tab from '../tabset/tab';
import Button from '../button/button';
import Preactlet from '../preactlet/preactlet';
import ExpandableSection from '../expandableSection/expandableSection';

export default class FeatureViewer extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            selectedTabId: null,
        });

        this.bind([
            'onTabSelected',
            'onAddToSelection',
            'onRemoveFromSelection',
        ]);
    }

    onTabSelected(newVal) {
        this.setState({
            selectedTabId: newVal,
        });
    }

    onAddToSelection() {
        if(_.isFunction(this.prop('onAddToSelection'))) {
            this.prop('onAddToSelection')(this.prop('feature'));
        }
    }

    onRemoveFromSelection() {
        if(_.isFunction(this.prop('onRemoveFromSelection'))) {
            this.prop('onRemoveFromSelection')(this.prop('feature'));
        }
    }

    getFeatureType() {
        return _.get(this.prop('feature'), 'properties.type');
    }

    getFeatureSchema() {
        return _.get(this.prop('schema'), `features.${this.getFeatureType()}`);
    }

    getSelectedTabId() {
        if(this.state.selectedTabId) {
            return this.state.selectedTabId;
        }
        else {
            const featureSchema = this.getFeatureSchema();
            return _.chain(featureSchema.tabs).map('name').first().value() || 'actions';
        }
    }

    triggerAction(feature, actionName) {
        const schema = this.prop('schema');
        const action = _.find(schema.featureActions, ['name', actionName]);
        if(action && _.isFunction(action.execute)) {
            action.execute(feature);
        }
    }

    renderTabContent(feature, schemaItem) {
        if(_.isFunction(schemaItem.render)) {
            return schemaItem.render(feature);
        }
        else if(schemaItem.view) {
            return Preactlet.render({
                view: schemaItem.view,
                state: _.assign({}, schemaItem.state, { feature }),
                props: schemaItem.props,
                actions: (state, setState) => ({
                    trigger: actionName => {
                        this.triggerAction(feature, actionName);
                    },
                }),
            });
        }
    }

    renderFeature(feature, featureSchema, schema) {
        if(!_.isEmpty(featureSchema.tabs)) {
            return (
            <Tabset
                variant="scoped"
                selectedTabId={ this.getSelectedTabId() }
                onSelect={ this.onTabSelected }
            >
                {
                    _.map(featureSchema.tabs, tabItem => {
                        return (
                        <Tab
                            id={ tabItem.name }
                            label={ tabItem.name }
                        >
                            { this.renderTabContent(feature, tabItem) }
                        </Tab>
                        );
                    })
                }
                <Tab
                    id="actions"
                    label="Actions"
                >
                    {
                        _.map(featureSchema.actionGroups, actionGroup => {
                            return (
                            <ExpandableSection title={ actionGroup.name } initialExpanded={ actionGroup.expanded }>
                                <div className="slds-button-group">
                                    {
                                        _.map(actionGroup.actions, actionName => {
                                            const action = _.find(schema.featureActions, ['name', actionName]);
                                            return action && (
                                                <Button
                                                    variant="tertiary"
                                                    label={ action.label }
                                                    onClick={ () => action.execute(feature) }
                                                >
                                                </Button>
                                            );
                                        })
                                    }
                                </div>
                            </ExpandableSection>
                            );
                        })
                    }
                    <ExpandableSection title="System" initialExpanded="true">
                        <div className="slds-button-group">
                            <Button
                                variant="tertiary"
                                label="Select"
                                onClick={ this.onAddToSelection }
                            >
                            </Button>
                            <Button
                                variant="tertiary"
                                label="Deselect"
                                onClick={ this.onRemoveFromSelection }
                            >
                            </Button>
                        </div>
                    </ExpandableSection>
                </Tab>
            </Tabset>
            );
        }
        else {
            return this.renderTabContent(feature, featureSchema);
        }
    }

    render(props, state) {
        const [{
            className,
            feature,
            schema,
        }, rest] = this.getPropValues();

        const featureSchema = this.getFeatureSchema();

        return (
            <div
                className={ className }
            >
                { this.renderFeature(feature, featureSchema, schema) }
            </div>
        );
    }
}

FeatureViewer.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    feature: PropTypes.isObject('feature'),
    schema: PropTypes.isObject('schema'),
    onAddToSelection: PropTypes.isFunction('onAddToSelection'),
    onRemoveFromSelection: PropTypes.isFunction('onRemoveFromSelection'),
};

FeatureViewer.propTypesRest = true;
FeatureViewer.displayName = "FeatureViewer";
