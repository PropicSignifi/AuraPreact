import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Tabset from '../tabset/tabset';
import Tab from '../tabset/tab';
import Button from '../button/button';
import TableManager from '../table/TableManager';
import ExpandableSection from '../expandableSection/expandableSection';

const featureColumns = [
    {
        name: 'name',
        header: 'Name',
    },
    {
        name: 'description',
        header: 'Description',
    },
];

export default class RegionViewer extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            selectedTabId: null,
        });

        this.bind([
            'onTabSelected',
            'onAddToSelection',
            'onRemoveFromSelection',
            'onDelete',
            'onSelectAction',
        ]);
    }

    onSelectAction(name) {
        const features = this.prop('features');
        const schema = this.prop('schema');
        const action = _.find(schema.groupActions, ['name', name]);
        if(action && _.isFunction(action.execute)) {
            action.execute(features);
        }
    }

    onTabSelected(newVal) {
        this.setState({
            selectedTabId: newVal,
        });
    }

    onAddToSelection() {
        if(_.isFunction(this.prop('onAddToSelection'))) {
            this.prop('onAddToSelection')(this.prop('features'));
        }
    }

    onRemoveFromSelection() {
        if(_.isFunction(this.prop('onRemoveFromSelection'))) {
            this.prop('onRemoveFromSelection')(this.prop('features'));
        }
    }

    onDelete() {
        if(_.isFunction(this.prop('onDelete'))) {
            this.prop('onDelete')();
        }
    }

    getSelectedTabId() {
        return this.state.selectedTabId || 'information';
    }

    render(props, state) {
        const [{
            className,
            features,
            schema,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ className }
            >
                <div className="slds-text-heading_medium slds-text-align_center slds-m-around_x-small">Region</div>
                <Tabset
                    variant="scoped"
                    selectedTabId={ this.getSelectedTabId() }
                    onSelect={ this.onTabSelected }
                >
                    <Tab
                        id="information"
                        label="Information"
                    >
                        <TableManager
                            name="regionViewer_features_table"
                            header={ `Total ${_.size(features)}` }
                            columns={ _.get(schema, 'region.columns') || featureColumns }
                            data={ _.map(features, 'properties') }
                            pageSize="10"
                        >
                        </TableManager>
                    </Tab>
                    <Tab
                        id="actions"
                        label="Actions"
                    >
                        {
                            _.map(_.get(schema, 'region.actionGroups'), actionGroup => {
                                return (
                                    <ExpandableSection title={ actionGroup.name } initialExpanded={ actionGroup.expanded }>
                                        <div className="slds-button-group">
                                            {
                                                _.map(actionGroup.actions, actionName => {
                                                    const action = _.find(schema.groupActions, ['name', actionName]);
                                                    return action && (
                                                    <Button
                                                        variant="tertiary"
                                                        label={ action.label }
                                                        onClick={ () => this.onSelectAction(actionName) }
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
                                <Button
                                    variant="tertiary"
                                    label="Delete Region"
                                    onClick={ this.onDelete }
                                >
                                </Button>
                            </div>
                        </ExpandableSection>
                    </Tab>
                </Tabset>
            </div>
        );
    }
}

RegionViewer.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    features: PropTypes.isArray('features'),
    onAddToSelection: PropTypes.isFunction('onAddToSelection'),
    onRemoveFromSelection: PropTypes.isFunction('onRemoveFromSelection'),
    onDelete: PropTypes.isFunction('onDelete'),
    schema: PropTypes.isObject('schema'),
};

RegionViewer.propTypesRest = true;
RegionViewer.displayName = "RegionViewer";
