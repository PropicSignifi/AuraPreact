import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';
import SuggestionBox from '../suggestionBox/suggestionBox';
import Picklist from '../picklist/picklist';
import Pill from '../pill/pill';
import createLoadingIndicator from '../busyloading/busyloading';
import styles from './styles.less';

const Groups = [
    {
        label: '',
        value: 'Organization',
    },
    {
        label: 'Role',
        value: 'Role',
    },
    {
        label: 'Role and Subordinates',
        value: 'RoleAndSubordinates',
    },
    {
        label: 'Public Groups',
        value: 'Regular',
    },
    {
        label: 'Manager',
        value: 'Manager',
    },
    {
        label: 'Manager and Subordinates',
        value: 'ManagerAndSubordinatesInternal',
    },
    {
        label: 'Territory',
        value: 'Territory',
    },
    {
        label: 'Territory and Subordinates',
        value: 'TerritoryAndSubordinates',
    },
];

const Types = {
    Owner: 'Owner',
    All: 'All',
    Custom: 'Custom',
};

const getGroupName = group => group.Name || _.get(group, 'Related.Name');

export default class UserOrGroupEditor extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            users: [],
            groups: [],
            type: null,
            userOrGroupName: 'User',
        });

        this.bind([
            'onOwnerSelected',
            'onAllSelected',
            'onCustomSelected',
            'searchUserOrGroup',
            'addNewUserOrGroup',
            'changeUserOrGroupName',
        ]);

        this.$loadingIndicator = createLoadingIndicator(false);
    }

    componentDidMount() {
        super.componentDidMount();

        const groupsInQuery = _.chain(Groups)
            .map(group => `'${group.value}'`)
            .join(',')
            .value();

        this.$loadingIndicator.until(
            Promise.all([
                window.$ActionService.DataLightningExtension.invoke('runQueryWithoutSharing', {
                    query: 'SELECT Id, Name FROM User WHERE IsActive = true',
                }),
                window.$ActionService.DataLightningExtension.invoke('runQueryWithoutSharing', {
                    query: `SELECT Id, Name, DeveloperName, Related.Name, Type FROM Group WHERE Type IN (${groupsInQuery})`,
                }),
            ]).then(([users, groups]) => {
                this.setState({
                    users: _.sortBy(users, 'Name'),
                    groups: _.sortBy(groups, getGroupName),
                });
            })
        );
    }

    getOrgGroupId() {
        const orgGroup = _.find(this.state.groups, ['Type', 'Organization']);
        return orgGroup && orgGroup.Id;
    }

    searchUserOrGroup(searchText) {
        if(this.state.userOrGroupName === 'User') {
            return _.map(this.state.users, user => {
                return {
                    label: user.Name,
                    value: user.Id,
                };
            });
        }
        else {
            const group = _.filter(this.state.groups, ['Type', this.state.userOrGroupName]);
            return _.map(group, groupItem => {
                return {
                    label: getGroupName(groupItem),
                    value: groupItem.Id,
                };
            });
        }
    }

    addNewUserOrGroup(option) {
        const value = this.prop('value');
        const ids = _.split(value, ';');
        if(!_.includes(ids, option.value)) {
            ids.push(option.value);
        }

        this.setValue(_.join(_.compact(ids), ';'));
    }

    changeUserOrGroupName(newVal) {
        this.setState({
            userOrGroupName: newVal,
        });
    }

    onOwnerSelected() {
        this.setValue('');
        this.setState({
            type: Types.Owner,
        });
    }

    onAllSelected() {
        this.setValue(this.getOrgGroupId());
        this.setState({
            type: Types.All,
        });
    }

    onCustomSelected() {
        this.setValue('');
        this.setState({
            type: Types.Custom,
        });
    }

    detectType(value) {
        const ids = _.chain(value).split(';').compact().value();
        if(_.size(ids) < 1) {
            return Types.Owner;
        }
        else {
            const id = _.first(ids);
            return this.getOrgGroupId() === id ? Types.All: Types.Custom;
        }
    }

    getUserOrGroupNameOptions() {
        const availableGroupNames = _.chain(this.state.groups)
            .map('Type')
            .uniq()
            .value();
        const groupOptions = _.filter(Groups, group => group.label && _.includes(availableGroupNames, group.value));
        return [
            {
                label: 'User',
                value: 'User',
            },
            ...(groupOptions || []),
        ];
    }

    onRemovePill(id) {
        const value = this.prop('value');
        const ids = _.split(value, ';');
        const newIds = _.without(ids, id);
        this.setValue(_.join(_.compact(newIds), ';'));
    }

    renderField(props, state, variables) {
        const [{
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        const type = this.state.type || this.detectType(value);
        const pills = _.chain(value)
            .split(';')
            .compact()
            .map(v => {
                const user = _.find(this.state.users, ['Id', v]);
                if(user) {
                    return {
                        label: `User: ${user.Name}`,
                        value: user.Id,
                    };
                }

                const group = _.find(this.state.groups, ['Id', v]);
                if(group) {
                    const groupOption = _.find(Groups, ['value', group.Type]);
                    const groupLabel = getGroupName(group);
                    return {
                        label: `${groupOption.label}: ${groupLabel}`,
                        value: group.Id,
                    };
                }
            })
            .value();
        const userOrGroupNameOptions = this.getUserOrGroupNameOptions();
        const userOrGroupNameOption = _.find(userOrGroupNameOptions, ['value', this.state.userOrGroupName]);
        const LoadingZone = this.$loadingIndicator.Zone;

        return (
            <LoadingZone>
                <div className="slds-m-top_x-small">
                    <Input
                        name="owner"
                        label="Visible to the owner"
                        type="radio"
                        value={ type === Types.Owner }
                        onValueChange={ this.onOwnerSelected }
                    >
                    </Input>
                </div>
                <div className="slds-m-top_x-small">
                    <Input
                        name="all"
                        label="Visible to all users"
                        type="radio"
                        value={ type === Types.All }
                        onValueChange={ this.onAllSelected }
                    >
                    </Input>
                </div>
                <div className="slds-m-top_x-small">
                    <Input
                        name="custom"
                        label="Visible to certain users or groups"
                        type="radio"
                        value={ type ===  Types.Custom}
                        onValueChange={ this.onCustomSelected }
                    >
                    </Input>
                    {
                        type === Types.Custom && !_.isEmpty(this.state.users) && !_.isEmpty(this.state.groups) && [
                            <SuggestionBox
                                className="slds-m-top_x-small"
                                variant="label-removed"
                                name="userOrGroupSuggestionBox"
                                label="User or Group Search"
                                value={ null }
                                getSuggestions={ this.searchUserOrGroup }
                                placeholder={ `Search ${userOrGroupNameOption && userOrGroupNameOption.label}` }
                                minLetters="0"
                                onValueChange={ this.addNewUserOrGroup }
                                addonBeforeClassName={ styles.referencePicklistAddon }
                                addonBefore={ (
                                <Picklist
                                    name="userOrGroupPicklist"
                                    label="User or Group Type"
                                    variant="label-removed"
                                    placeholder="-- Select --"
                                    options={ userOrGroupNameOptions }
                                    width="medium"
                                    value={ this.state.userOrGroupName }
                                    onValueChange={ this.changeUserOrGroupName }
                                >
                                </Picklist>
                                ) }
                            >
                            </SuggestionBox>,
                            !_.isEmpty(pills) && (
                            <div className="slds-pill_container slds-wrap slds-m-top_x-small">
                                {
                                    _.map(pills, pill => {
                                        return (
                                            <Pill name={ pill.value } label={ pill.label } onRemove={ () => this.onRemovePill(pill.value) }></Pill>
                                        );
                                    })
                                }
                            </div>
                            ),
                        ]
                    }
                </div>
            </LoadingZone>
        );
    }
}

UserOrGroupEditor.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isString('value'),
});

UserOrGroupEditor.propTypes.name.demoValue('userOrGroupEditor');
UserOrGroupEditor.propTypes.label.demoValue('UserOrGroupEditor');

UserOrGroupEditor.propTypesRest = true;
UserOrGroupEditor.displayName = "UserOrGroupEditor";
