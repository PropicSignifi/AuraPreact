import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import ButtonMenu from '../menu/buttonMenu';
import Button from '../button/button';
import ButtonIcon from '../buttonIcon/buttonIcon';
import MenuItem from '../menu/menuItem';
import ExpandableSection from '../expandableSection/expandableSection';
import Popover from '../popover/popover';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import renderField from '../renderField/renderField';
import createLoadingIndicator from '../busyloading/busyloading';
import Utils from '../utils/utils';
import Storage from '../storage/storage';
import styles from './styles.less';

const ActivityDisplayTypes = [
    {
        name: 'task',
        iconContainerClass: 'slds-icon-standard-task',
        iconName: 'standard:task',
    },
    {
        name: 'email',
        iconContainerClass: 'slds-icon-standard-email',
        iconName: 'standard:email',
    },
    {
        name: 'call',
        iconContainerClass: 'slds-icon-standard-log-a-call',
        iconName: 'standard:log_a_call',
    },
    {
        name: 'event',
        iconContainerClass: 'slds-icon-standard-event',
        iconName: 'standard:event',
    },
];

const DefaultDateTimeFormat = 'h:mma | D/M/YY';
const DefaultDateFormat = 'D/M/YY';
const DefaultLimit = 10;
const DefaultStream = {
    data: [],
    done: true,
};

export default class ActivityStream extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            expanded: [],
            checked: [],
            streams: {},
            options: {},
            optionsInEdit: {},
        });

        this.$loadingIndicator = createLoadingIndicator(false);
    }

    componentDidMount() {
        super.componentDidMount();

        this.reload();
    }

    reload() {
        if(this.isLoadingStreamEnabled()) {
            const regionedStreams = this.getRegionedStreams();
            const requests = _.map(regionedStreams, regionedStream => {
                return {
                    region: regionedStream.regionType.name,
                    offset: 0,
                    limit: regionedStream.regionType.initialLimit,
                };
            });

            this.loadStream(requests);
        }

        this.setState({
            expanded: [],
            checked: [],
        });
    }

    loadFilterOptions() {
        let options = Storage.load('ActivityStreamFilterOptions', this.prop('name'), {});

        if(_.isEmpty(options)) {
            options = this.prop('defaultOptions') || {};
        }

        return options;
    }

    saveFilterOptions(options) {
        return Storage.save('ActivityStreamFilterOptions', this.prop('name'), options);
    }

    loadStream(requests) {
        _.forEach(requests, request => {
            request.offset = request.offset || 0;
            request.limit = request.limit || DefaultLimit;
        });
        const filterOptions = this.loadFilterOptions();

        this.$loadingIndicator.until(
            this.prop('loadStream')(requests, filterOptions).then(data => {
                const streams = {};
                for(let i = 0; i < _.size(requests); i++) {
                    const request = requests[i];
                    const requestData = data[i];

                    const oldStream = this.state.streams[request.region] || DefaultStream;
                    streams[request.region] = {
                        data: [
                            ...(_.slice(oldStream.data, 0, request.offset)),
                            ...(requestData.data || []),
                        ],
                        done: requestData.done,
                    };
                }
                this.setState({
                    streams: _.assign({}, this.state.streams, streams),
                    options: filterOptions,
                    optionsInEdit: _.cloneDeep(filterOptions),
                });
            })
        );
    }

    toggleExpand(item, isOpen) {
        const newExpanded = isOpen ? _.without(this.state.expanded, item.id) : [...(this.state.expanded), item.id];
        this.setState({
            expanded: newExpanded,
        });
    }

    toggleCheck(item, isCompleted, onCheck) {
        const newChecked = isCompleted ? _.without(this.state.checked, item.id) : [...(this.state.checked), item.id];
        this.setState({
            checked: newChecked,
        }, () => {
            if(_.isFunction(onCheck)) {
                onCheck(item, newChecked);
            }
        });
    }

    onSelectAction(item, action) {
        if(_.isFunction(action.execute)) {
            action.execute(item);
        }
    }

    renderGroup(group, activityTypes) {
        return (
            <ul className="slds-timeline">
                {
                    _.map(group, item => {
                        const activityType = _.find(activityTypes, ['name', item.activityType]);
                        const activityDisplayType = _.find(ActivityDisplayTypes, ['name', activityType.displayType]);
                        const isOpen = _.includes(this.state.expanded, item.id);
                        const isCompleted = _.includes(this.state.checked, item.id);
                        const actions = _.isFunction(activityType.renderActions) ? activityType.renderActions(item) : [];
                        const formatDateTime = datetime => {
                            return moment(datetime).format(activityType.datetimeFormat || DefaultDateTimeFormat)
                        };
                        const formatDate = datetime => {
                            return moment(datetime).format(activityType.dateFormat || DefaultDateFormat)
                        };

                        return (
                            <li key={ item.id }>
                                <div className={ window.$Utils.classnames(
                                    `slds-timeline__item_expandable slds-timeline__item_${activityDisplayType.name}`,
                                    {
                                        'slds-is-open': isOpen,
                                    }
                                    ) }>
                                    <span className="slds-assistive-text">{ activityDisplayType.name }</span>
                                    <div className="slds-media">
                                        <div class="slds-media__figure">
                                            <button className="slds-button slds-button_icon" title={ item.name } onclick={ () => this.toggleExpand(item, isOpen) }>
                                                <PrimitiveIcon className="slds-button__icon slds-timeline__details-action-icon" iconName="utility:switch"></PrimitiveIcon>
                                                <span className="slds-assistive-text">Toggle details for { item.name }</span>
                                            </button>
                                            <div className={ `slds-icon_container ${activityDisplayType.iconContainerClass} slds-timeline__icon` } title={ activityDisplayType.name }>
                                                <PrimitiveIcon className="slds-icon slds-icon_small" iconName={ activityDisplayType.iconName }></PrimitiveIcon>
                                            </div>
                                        </div>
                                        <div className="slds-media__body">
                                            <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                                                <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                                    {
                                                        item.checkable && (
                                                        <div className="slds-checkbox">
                                                            <input type="checkbox" name={ `options-${item.id}` } id={ `checkbox-${item.id}` } value={ isCompleted } onclick={ () => this.toggleCheck(item, isCompleted, activityType.onCheck) }/>
                                                            <label className="slds-checkbox__label" for={ `checkbox-${item.id}` }>
                                                            <span className="slds-checkbox_faux"></span>
                                                            <span className="slds-form-element__label slds-assistive-text">Mark { item.name } complete</span>
                                                            </label>
                                                        </div>
                                                        )
                                                    }
                                                    {
                                                        _.isFunction(activityType.renderHeader) ?
                                                        activityType.renderHeader(item)
                                                        :
                                                        <h3 className={ `${isCompleted && styles.checked}` } title={ item.name }>
                                                            <a href="javascript:void(0);" onClick={ () => Utils.openSObject(item.id) }>
                                                                <strong>{ item.name }</strong>
                                                            </a>
                                                        </h3>
                                                    }
                                                </div>
                                                <div className="slds-timeline__actions slds-timeline__actions_inline">
                                                    <p className="slds-timeline__date">
                                                        {
                                                            _.isFunction(activityType.renderDateTime) ?
                                                            activityType.renderDateTime(item, { formatDateTime, formatDate, })
                                                            :
                                                            formatDateTime(item.datetime)
                                                        }
                                                    </p>
                                                    {
                                                        !_.isEmpty(actions) && (
                                                        <ButtonMenu
                                                            variant="border"
                                                            menuAlignment="right"
                                                            iconName="ctc-utility:a_down"
                                                            iconSize="x-small"
                                                            name="buttonMenu"
                                                            value="value"
                                                            onSelect={ newVal => this.onSelectAction(item, _.find(actions, ['value', newVal])) }
                                                        >
                                                            {
                                                                _.map(actions, action => {
                                                                    return (
                                                                        <MenuItem
                                                                            { ...action }
                                                                        >
                                                                        </MenuItem>
                                                                    );
                                                                })
                                                            }
                                                        </ButtonMenu>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <p className="slds-m-horizontal_xx-small">
                                                {
                                                    _.isFunction(activityType.renderMessage) && activityType.renderMessage(item)
                                                }
                                            </p>
                                            {
                                                isOpen && (
                                                <article className={ `slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium ${activityType.detailClassName}` }>
                                                    { _.isFunction(activityType.renderDetail) && activityType.renderDetail(item) }
                                                </article>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

    renderTimeline(regionedStream, activityTypes) {
        const regionType = regionedStream.regionType;

        const data = _.get(regionedStream, 'stream.data');
        if(regionType.groupBy) {
            const groups = _.chain(data)
                .groupBy(item => moment(item.datetime).format(regionType.groupBy))
                .toPairs()
                .value();
            return (
            <div>
                {
                    _.map(groups, (item, index) => {
                        const [title, group] = item;

                        return (
                            <ExpandableSection
                                title={ title }
                                initialExpanded={ index === 0 }
                            >
                                { this.renderGroup(group, activityTypes) }
                            </ExpandableSection>
                        );
                    })
                }
            </div>
            );
        }
        else {
            return (
                <ul className="slds-timeline">
                    {
                        this.renderGroup(data, activityTypes)
                    }
                </ul>
            );
        }
    }

    isLoadingStreamEnabled() {
        return _.isFunction(this.prop('loadStream'));
    }

    getRegionedStreams() {
        const regionTypes = this.prop('regionTypes');
        const defaultRegionType = _.first(regionTypes);

        const streams = this.isLoadingStreamEnabled() ?
            this.state.streams :
            _.chain(this.prop('value'))
                .groupBy(item => {
                    return item.regionName || defaultRegionType.name;
                })
                .toPairs()
                .map(([key, value]) => ([key, { data: value, done: true }]))
                .fromPairs()
                .value();

        return _.map(regionTypes, regionType => {
            return {
                stream: streams[regionType.name] || DefaultStream,
                regionType,
            };
        });
    }

    onViewMore(regionedStream) {
        if(this.isLoadingStreamEnabled()) {
            const stream = regionedStream.stream;
            const streamSize = _.size(stream.data);

            const requests = [
                {
                    region: regionedStream.regionType.name,
                    offset: streamSize,
                    limit: regionedStream.regionType.limit,
                },
            ];

            this.loadStream(requests);
        }
    }

    onConfigOptionChanged(key, newVal) {
        const newOptionsInEdit = _.assign({}, this.state.optionsInEdit, {
            [key]: newVal,
        });

        this.setState({
            optionsInEdit: newOptionsInEdit,
        });
    }

    onApplyFilters(callbacks) {
        this.setState({
            options: _.cloneDeep(this.state.optionsInEdit),
        }, () => {
            this.saveFilterOptions(this.state.options);
            callbacks.close && callbacks.close();
            this.reload();
        });
    }

    renderFilterPanelContent() {
        const configOptions = this.prop('configOptions');
        const options = this.state.optionsInEdit;

        return (
            <Form name="filterOptionsPanelForm" className="slds-m-horizontal_medium">
                <FormGroup>
                    {
                        _.map(configOptions, configOption => {
                            return (
                                <FormTile>
                                    {
                                        renderField(configOption.type || 'input', _.assign({}, configOption.renderConfig, {
                                            key: configOption.name,
                                            name: configOption.name,
                                            label: _.get(configOption, 'renderConfig.label') || configOption.name,
                                            value: options[configOption.name],
                                            onValueChange: newVal => this.onConfigOptionChanged(configOption.name, newVal),
                                        }))
                                    }
                                </FormTile>
                            );
                        })
                    }
                </FormGroup>
            </Form>
        );
    }

    renderFilterPanelFooter(callbacks) {
        return (
            <div className="slds-grid">
                <Button
                    className="slds-col_bump-left"
                    variant="primary"
                    label="Apply"
                    onClick={ () => this.onApplyFilters(callbacks) }
                >
                </Button>
            </div>
        );
    }

    getOptionsDisplay() {
        const configOptions = this.prop('configOptions');

        return 'Filters: ' + _.chain(configOptions)
            .map(configOption => {
                const label = _.get(configOption, 'renderConfig.label') || configOption.name;
                const value = this.state.options[configOption.name];
                const options = _.get(configOption, 'renderConfig.options');
                if(!_.isEmpty(options)) {
                    if(_.isArray(value)) {
                        return _.chain(value)
                            .map(item => {
                                const option = _.find(options, ['value', item]);
                                return option && option.label;
                            })
                            .compact()
                            .join(',')
                            .value();
                    }
                    else {
                        const option = _.find(options, ['value', value]);
                        return option && option.label;
                    }
                }
                else {
                    return `${label}: ${value}`;
                }
            })
            .join(' • ')
            .value();
    }

    render(props, state) {
        const [{
            className,
            activityTypes,
            regionTypes,
        }, rest] = this.getPropValues();

        const regionedStreams = this.getRegionedStreams();
        const LoadingZone = this.$loadingIndicator.Zone;

        return (
            <div
                className={ className }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <LoadingZone>
                    <div className="slds-grid">
                        <div className="slds-col">
                            { this.getOptionsDisplay() }
                        </div>
                        <div className="slds-col_bump-left slds-button-group">
                            <Popover
                                label="Filter Panel"
                                alignment="top-right"
                                header="Filter Activity Stream"
                                renderContent={ () => this.renderFilterPanelContent() }
                                footer={ callbacks => this.renderFilterPanelFooter(callbacks) }
                            >
                                <ButtonIcon
                                    className={ styles.filterButton }
                                    variant="border-filled"
                                    iconName="utility:filterList"
                                    size="medium"
                                    alternativeText="Filter"
                                >
                                </ButtonIcon>
                            </Popover>
                            <ButtonIcon
                                iconName="utility:refresh"
                                size="medium"
                                alternativeText="Reload"
                                onClick={ () => this.reload() }
                            >
                            </ButtonIcon>
                        </div>
                    </div>
                    {
                        _.map(regionedStreams, regionedStream => {
                            return !_.isEmpty(regionedStream.stream) && (
                            <div className="slds-m-top_small">
                                <div className={ `slds-section__title ${styles.activityHeader}` }>
                                    <h3 className="slds-section__title-action slds-align-middle slds-truncate">
                                        { regionedStream.regionType.label }
                                    </h3>
                                </div>
                                { this.renderTimeline(regionedStream, activityTypes) }
                                {
                                    !regionedStream.stream.done && (
                                    <div className="slds-align_absolute-center slds-m-top_small">
                                        <Button
                                            label="View More"
                                            onClick={ () => this.onViewMore(regionedStream) }
                                        >
                                        </Button>
                                    </div>
                                    )
                                }
                            </div>
                            );
                        })
                    }
                </LoadingZone>
            </div>
        );
    }
}

ActivityStream.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    activityTypes: PropTypes.isArray('activityTypes').shape({
        name: PropTypes.isString('name'),
        displayType: PropTypes.isString('displayType'),
        renderHeader: PropTypes.isFunction('renderHeader'),
        renderMessage: PropTypes.isFunction('renderMessage'),
        renderDetail: PropTypes.isObject('renderDetail'),
        renderActions: PropTypes.isFunction('renderActions'),
        renderDateTime: PropTypes.isFunction('renderDateTime'),
        onCheck: PropTypes.isFunction('onCheck'),
        datetimeFormat: PropTypes.isString('datetimeFormat'),
    }).required(),
    regionTypes: PropTypes.isArray('regionTypes').shape({
        name: PropTypes.isString('name'),
        label: PropTypes.isString('label'),
        initialLimit: PropTypes.isNumber('initialLimit'),
        limit: PropTypes.isNumber('limit'),
    }).required(),
    value: PropTypes.isArray('value').shape({
        id: PropTypes.isString('id'),
        name: PropTypes.isString('name'),
        regionName: PropTypes.isString('regionName').description('Set region name if a flat list of items is to build multiple regions'),
        activityType: PropTypes.isString('activityType'),
        datetime: PropTypes.isNumber('datetime'),
        checkable: PropTypes.isBoolean('checkable'),
    }),
    loadStream: PropTypes.isFunction('loadStream'),
    configOptions: PropTypes.isArray('configOptions').description('Set a list of render field config options'),
    defaultOptions: PropTypes.isObject('defaultOptions').description('The default options object'),
};

ActivityStream.propTypesRest = true;
ActivityStream.displayName = "ActivityStream";
