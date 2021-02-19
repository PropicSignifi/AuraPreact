import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Combobox from '../combobox/combobox';
import Button from '../button/button';
import Picklist from '../picklist/picklist';
import Utils from '../utils/utils';
import renderField from '../renderField/renderField';
import ExpandableSection from '../expandableSection/expandableSection';
import ButtonStateful from '../buttonStateful/buttonStateful';
import styles from './controlPanelView.less';

import {
    getFeatureId,
    getSystemIcon,
} from './mapViewer';

export default class ControlPanelView extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            searchText: null,
            filterBy: null,
            expanded: !window.$Utils.isNonDesktopBrowser(),
        });

        this.bind([
            'onFilterByChange',
            'onSelectAction',
        ]);
    }

    getFilterBy() {
        return this.state.filterBy || (this.prop('viewer') && this.prop('viewer').getFilterBy());
    }

    onFilterByChange(key, newVal) {
        this.setState({
            filterBy: _.assign({}, this.state.filterBy, {
                [key]: newVal,
            }),
        }, () => {
            Utils.delay(() => {
                const viewer = this.prop('viewer');
                viewer.setFilterBy(this.state.filterBy);
            }, 100);
        });
    }

    onSelectAction(name) {
        const viewer = this.prop('viewer');
        const schema = viewer.getSchema();
        const selectedIds = viewer.getSelectedIds();
        const features = viewer.getFeatures();
        const groupActions = schema.groupActions;

        const selectedFeatures = _.chain(selectedIds)
            .map(id => _.find(features, f => getFeatureId(f) === id))
            .compact()
            .value();

        const action = _.find(groupActions, ['name', name]);
        if(action && _.isFunction(action.execute)) {
            action.execute(selectedFeatures);
        }
    }

    getValueSetOptions(name) {
        const viewer = this.prop('viewer');
        return _.chain(viewer.getAllFeatures())
            .map(f => _.toString(_.get(f, `properties.${name}`)))
            .compact()
            .uniq()
            .map(val => {
                return {
                    label: val,
                    value: val,
                };
            })
            .value();
    }

    onSwitchExpanded(newVal) {
        this.setState({
            expanded: newVal,
        });
    }

    render(props, state) {
        const [{
            className,
            features,
            viewer,
        }, rest] = this.getPropValues();

        if(!viewer) {
            return;
        }

        const schema = viewer.getSchema();
        const featureNames = _.chain(features)
            .map(f => f.properties && f.properties.name)
            .compact()
            .value();
        const style = {};
        if(_.get(schema, 'controlPanel.width') && this.state.expanded) {
            style.width = `${_.get(schema, 'controlPanel.width')}px`;
        }

        const iconInfos = _.chain(schema.features)
            .map((feature, name) => {
                return {
                    name,
                    icon: getSystemIcon(feature.icon || {}),
                };
            })
            .value();

        const fields = _.get(schema, 'controlPanel.fields');

        return (
            <div
                className={ `slds-grid ${className}` }
                style={ style }
            >
                <div className={
                    window.$Utils.classnames(
                    'slds-col slds-m-right_xx-small',
                    {
                        [styles.collapsed]: !this.state.expanded,
                    }
                    )
                    }>
                    {
                        !_.isEmpty(fields) && this.state.expanded && (
                        <ExpandableSection title={ _.get(schema, 'controlPanel.header', 'Filter') } initialExpanded="false">
                            {
                                _.map(_.get(schema, 'controlPanel.fields'), field => {
                                    const variant = _.get(schema, 'controlPanel.showFieldLabel') ? 'standard' : 'label-removed';
                                    const configurer = {
                                        getTotalSelectionLabel: () => {
                                            return field.label;
                                        },
                                    };

                                    return (
                                        <div className="slds-m-top_x-small">
                                            {
                                                field.type === 'ValueSet' ?
                                                <Picklist
                                                    label={ field.label }
                                                    name={ field.name }
                                                    variant={ variant }
                                                    placeholder={ field.label }
                                                    configurer={ configurer }
                                                    select="multiple"
                                                    style="checkbox"
                                                    options={ this.getValueSetOptions(field.name) }
                                                    value={ _.get(this.getFilterBy(), field.name) }
                                                    onValueChange={ newVal => this.onFilterByChange(field.name, newVal) }
                                                >
                                                </Picklist>
                                                :
                                                renderField(field.type, _.assign({
                                                    name: field.name,
                                                    label: field.label,
                                                    variant,
                                                    placeholder: field.label,
                                                    value: _.get(this.getFilterBy(), field.name),
                                                    onValueChange: newVal => this.onFilterByChange(field.name, newVal),
                                                }, field.renderConfig), this.state.filterBy)
                                            }
                                        </div>
                                    );
                                })
                            }
                        </ExpandableSection>
                        )
                    }
                    {
                        this.state.expanded && (
                            <ExpandableSection title="Legend" initialExpanded="true">
                                {
                                    _.map(iconInfos, iconInfo => {
                                        return (
                                            <div className="slds-grid slds-grid_vertical-align-center slds-m-top_xxx-small">
                                                <img
                                                    src={ iconInfo.icon.iconRetinaUrl || iconInfo.icon.iconUrl }
                                                    alt={ iconInfo.name }
                                                    width={ iconInfo.icon.iconSize[0] }
                                                    height={ iconInfo.icon.iconSize[1] }
                                                >
                                                </img>
                                                <div className="slds-m-left_xxx-small">
                                                    { iconInfo.name }
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </ExpandableSection>
                        )
                    }
                </div>
                <ButtonStateful
                    className={ styles.separator }
                    iconNameWhenOn="utility:left"
                    iconNameWhenHover="utility:left"
                    iconNameWhenOff="utility:right"
                    iconSize="x-small"
                    state={ this.state.expanded }
                    onClick={ this.onSwitchExpanded.bind(this) }
                >
                </ButtonStateful>
            </div>
        );
    }
}

ControlPanelView.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    onSelectFeature: PropTypes.isFunction('onSelectFeature'),
    viewer: PropTypes.isObject('viewer'),
};

ControlPanelView.propTypesRest = true;
ControlPanelView.displayName = "ControlPanelView";
