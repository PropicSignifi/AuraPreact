import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Button from '../button/button';
import TableManager from '../table/TableManager';
import ButtonMenu from '../menu/buttonMenu';
import MenuItem from '../menu/menuItem';

import {
    getFeatureId,
} from './mapViewer';

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

export default class ListView extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.bind([
            'onShowListView',
            'onHideListView',
            'onSelectAction',
            'onSelect',
        ]);
    }

    onShowListView() {
        const viewer = this.prop('viewer');
        viewer.setShowListView(true);
    }

    onHideListView() {
        const viewer = this.prop('viewer');
        viewer.setShowListView(false);
    }

    onSelectAction(name) {
        const viewer = this.prop('viewer');
        const selectedIds = viewer.getSelectedIds();
        const features = viewer.getFeatures();
        const groupActions = viewer.getSchema().groupActions;

        const selectedFeatures = _.chain(selectedIds)
            .map(id => _.find(features, f => getFeatureId(f) === id))
            .compact()
            .value();

        const action = _.find(groupActions, ['name', name]);
        if(action && _.isFunction(action.execute)) {
            action.execute(selectedFeatures);
        }
    }

    onSelect(selectedIds) {
        const viewer = this.prop('viewer');
        viewer.setSelectedIds(selectedIds);
    }

    render(props, state) {
        const [{
            className,
            viewer,
        }, rest] = this.getPropValues();

        if(!viewer) {
            return;
        }

        const schema = viewer.getSchema();

        return (
            <div
                className={ className }
            >
                {
                    viewer.showListView() ?
                    <TableManager
                        name={ `mapViewer_listView_table_${_.get(schema, 'listView.header')}` }
                        header={ _.get(schema, 'listView.header') }
                        columns={ _.get(schema, 'listView.columns') || featureColumns }
                        data={ _.map(viewer.getFeatures(), 'properties') }
                        pageSize="10"
                        select="multiple"
                        selected={ viewer.getSelectedIds() }
                        onSelect={ this.onSelect }
                    >
                        <div className="slds-col_bump-left">
                            <Button
                                label="Close"
                                variant="tertiary"
                                onClick={ this.onHideListView }
                            >
                            </Button>
                            {
                                !_.isEmpty(schema.groupActions) && (
                                <ButtonMenu
                                    className="slds-m-left_small"
                                    label="Actions"
                                    variant="primary"
                                    menuAlignment="bottom-right"
                                    iconName="ctc-utility:a_up"
                                    iconSize="medium"
                                    name="actionsMenu"
                                    onSelect={ this.onSelectAction }
                                >
                                    {
                                        _.map(schema.groupActions, groupAction => {
                                            return (
                                            <MenuItem
                                                label={ groupAction.label }
                                                value={ groupAction.name }
                                            >
                                            </MenuItem>
                                            );
                                        })
                                    }
                                </ButtonMenu>
                                )
                            }
                        </div>
                    </TableManager>
                    :
                    <Button
                        label={ _.get(schema, 'listView.buttonLabel', 'List View') }
                        variant="reset"
                        onClick={ this.onShowListView }
                    >
                    </Button>
                }
            </div>
        );
    }
}

ListView.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    viewer: PropTypes.isObject('viewer'),
};

ListView.propTypesRest = true;
ListView.displayName = "ListView";
