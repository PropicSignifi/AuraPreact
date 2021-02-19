import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import DnD from '../dnd/dnd';
import Storage from '../storage/storage';
import Button from '../button/button';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Popover from '../popover/popover';
import Form from '../form/form';
import FormGroup from '../form/formGroup';
import FormTile from '../form/formTile';
import renderField from '../renderField/renderField';

export default class Kanban extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            options: {},
            optionsInEdit: {},
            selectedLaneIndex: 0,
        });

        this.bind([
            'gotoPrevLane',
            'gotoNextLane',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        const filterOptions = this.loadFilterOptions();
        this.setState({
            options: filterOptions,
            optionsInEdit: _.cloneDeep(filterOptions),
        });
    }

    loadFilterOptions() {
        let options = Storage.load('Kanban', this.prop('name'), {});

        if(_.isEmpty(options)) {
            options = this.prop('defaultOptions') || {};
        }

        return options;
    }

    gotoPrevLane() {
        const index = this.state.selectedLaneIndex <= 0 ? 0 : this.state.selectedLaneIndex - 1;

        this.setState({
            selectedLaneIndex: index,
        });
    }

    gotoNextLane() {
        const lanes = this.prop('lanes');
        const index = this.state.selectedLaneIndex >= _.size(lanes) - 1 ? _.size(lanes) - 1 : this.state.selectedLaneIndex + 1;

        this.setState({
            selectedLaneIndex: index,
        });
    }

    saveFilterOptions(options) {
        return Storage.save('Kanban', this.prop('name'), options);
    }

    renderFilter(lane, context) {
        return !_.isEmpty(lane.filterFields) && (
            <Popover
                label="Filters"
                alignment="top-right"
                header="Filters"
                renderContent={ () => this.renderFilterPanelContent(lane, context) }
                footer={ callbacks => this.renderFilterPanelFooter(callbacks) }
            >
                <ButtonIcon
                    className={ context.className }
                    variant="border-filled"
                    iconName="utility:filterList"
                    size="medium"
                    alternativeText="Filter"
                >
                </ButtonIcon>
            </Popover>
        );
    }

    renderFilterPanelContent(lane, context) {
        const filterFields = lane.filterFields;
        const options = this.state.optionsInEdit[lane.fieldValue] || {};

        return (
            <Form name={ `${this.prop('name')}-lane-${context.index}-filterForm` } className="">
                <FormGroup>
                    {
                        _.map(filterFields, field => {
                            return (
                                <FormTile>
                                    {
                                        renderField(field.type || 'Input', _.assign({}, field.renderConfig, {
                                            key: field.name,
                                            name: field.name,
                                            label: _.get(field, 'renderConfig.label') || field.label || field.name,
                                            value: options[field.name],
                                            onValueChange: newVal => this.onConfigOptionChanged(lane, field.name, newVal),
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

    onConfigOptionChanged(lane, key, newVal) {
        const newOptionsInEdit = _.assign({}, this.state.optionsInEdit[lane.fieldValue], {
            [key]: newVal,
        });

        this.setState({
            optionsInEdit: _.assign({}, this.state.optionsInEdit, {
                [lane.fieldValue]: newOptionsInEdit,
            }),
        });
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

    onApplyFilters(callbacks) {
        this.setState({
            options: _.cloneDeep(this.state.optionsInEdit),
        }, () => {
            this.saveFilterOptions(this.state.options);
            callbacks.close && callbacks.close();
        });
    }

    renderLaneHeader(lane, context) {
        if(_.isFunction(lane.header)) {
            return lane.header(lane, _.assign({}, context, {
                renderFilter: className => this.renderFilter(lane, _.assign({}, context, { className })),
            }));
        }
        else if(_.isString(lane.header)) {
            return (
                <div className="slds-m-vertical_x-small slds-p-bottom_x-small slds-border_bottom slds-grid">
                    <div className="slds-text-heading_medium">
                        { lane.header }
                    </div>
                    <div className="slds-col_bump-left">
                        { this.renderFilter(lane, context) }
                    </div>
                </div>
            );
        }
        else {
            return lane.header;
        }
    }

    getItemId(item) {
        const idFieldName = this.prop('idFieldName');
        return _.get(item, idFieldName);
    }

    getItemById(id) {
        const data = this.prop('data');
        const item = _.find(data, item => this.getItemId(item) === id);
        return item;
    }

    allowDrop(item, lane, context) {
        const laneFieldName = this.prop('laneFieldName');
        const laneFieldValue = _.get(item, laneFieldName);
        if(laneFieldValue !== lane.fieldValue) {
            if(_.isFunction(lane.allowDrop)) {
                return lane.allowDrop(item, lane, context);
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }

    onDrop(item, lane, context) {
        const laneFieldName = this.prop('laneFieldName');
        const laneFieldValue = _.get(item, laneFieldName);
        if(laneFieldValue !== lane.fieldValue) {
            if(_.isFunction(lane.onDrop)) {
                return lane.onDrop(item, lane, context);
            }
        }
    }

    getLaneItems(lane) {
        const data = this.prop('data');
        const laneFieldName = this.prop('laneFieldName');
        const items = _.filter(data, item => _.get(item, laneFieldName) === lane.fieldValue);
        return items;
    }

    getFilteredLaneItems(lane) {
        let items = this.getLaneItems(lane);

        if(_.isFunction(lane.filterBy)) {
            const filter = this.state.options[lane.fieldValue] || {};

            items = _.filter(items, item => {
                return lane.filterBy(item, filter);
            });
        }

        if(_.isFunction(lane.sortBy)) {
            items = _.sortBy(items, lane.sortBy);
        }

        return items;
    }

    renderLane(lane, context) {
        const items = this.getFilteredLaneItems(lane);

        return (
            <DnD
                key={ `lane_${context.index}` }
                droppable={ _.defaultTo(lane.droppable, true) }
                allowDrop={ id => this.allowDrop(id, lane, context) }
                onDrop={ id => this.onDrop(id, lane, context) }
                dropClassName={ lane.dropClassName }
                className={ window.$Utils.classnames(
                'slds-col slds-box',
                {
                    'slds-m-right_xx-small': !context.isLast,
                    'slds-m-left_xx-small': !context.isFirst,
                },
                lane.className
                ) }
            >
                {
                    window.$Utils.isNonDesktopBrowser() ?
                    <div className="slds-grid slds-grid_align-spread">
                        <ButtonIcon
                            className={ context.isFirst ? 'slds-hidden' : '' }
                            variant="border-filled"
                            iconName="utility:left"
                            size="medium"
                            alternativeText="Left"
                            onClick={ this.gotoPrevLane }
                        >
                        </ButtonIcon>
                        {
                            this.renderLaneHeader(lane, _.assign({}, context, { items, }))
                        }
                        <ButtonIcon
                            className={ context.isLast ? 'slds-hidden' : '' }
                            variant="border-filled"
                            iconName="utility:right"
                            size="medium"
                            alternativeText="Right"
                            onClick={ this.gotoNextLane }
                        >
                        </ButtonIcon>
                    </div>
                    :
                    this.renderLaneHeader(lane, _.assign({}, context, { items, }))
                }
                <div className="slds-scrollable_y">
                    {
                        _.map(items, item => {
                            const itemId = this.getItemId(item);

                            return (
                            <DnD
                                key={ itemId }
                                draggable="true"
                                effect="move"
                                data={ item }
                                className={ lane.containerClassName }
                                dragClassName={ lane.dragClassName }
                            >
                                { _.isFunction(lane.renderItem) && lane.renderItem(item) }
                            </DnD>
                            );
                        })
                    }
                </div>
            </DnD>
        );
    }

    render(props, state) {
        const [{
            className,
            data,
            lanes,
            laneFieldName,
        }, rest] = this.getPropValues();
        return (
            <div
                className={ window.$Utils.classnames('slds-grid', className) }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                {
                    window.$Utils.isNonDesktopBrowser() ?
                    this.renderLane(lanes[this.state.selectedLaneIndex], {
                        index: this.state.selectedLaneIndex,
                        isFirst: this.state.selectedLaneIndex === 0,
                        isLast: this.state.selectedLaneIndex === _.size(lanes) - 1,
                    })
                    :
                    _.map(lanes, (lane, index) => {
                        return this.renderLane(lane, {
                            index,
                            isFirst: index === 0,
                            isLast: index === _.size(lanes) - 1,
                        });
                    })
                }
            </div>
        );
    }
}

Kanban.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    data: PropTypes.isArray('data'),
    laneFieldName: PropTypes.isString('laneFieldName').defaultValue('status').demoValue('status'),
    idFieldName: PropTypes.isString('idFieldName').defaultValue('id').demoValue('id'),
    lanes: PropTypes.isArray('lanes').shape({
        className: PropTypes.isObject('className'),
        containerClassName: PropTypes.isString('containerClassName'),
        dragClassName: PropTypes.isString('dragClassName'),
        dropClassName: PropTypes.isString('dropClassName'),
        header: PropTypes.isObject('header'),
        fieldValue: PropTypes.isObject('fieldValue'),
        droppable: PropTypes.isBoolean('droppable'),
        renderItem: PropTypes.isFunction('renderItem'),
        onDrop: PropTypes.isFunction('onDrop'),
        allowDrop: PropTypes.isFunction('allowDrop'),
        filterFields: PropTypes.isArray('filterFields'),
        filterBy: PropTypes.isFunction('filterBy'),
        sortBy: PropTypes.isFunction('sortBy'),
    }),
    defaultOptions: PropTypes.isObject('defaultOptions').description('The default options object'),
};

Kanban.propTypesRest = true;
Kanban.displayName = "Kanban";
