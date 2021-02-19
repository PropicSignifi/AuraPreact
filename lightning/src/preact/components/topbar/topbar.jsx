import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';
import QuickActions from '../quickActions/quickActions';
import Config from '../utils/config';
import Utils from '../utils/utils';

Config.defineConfig([
    {
        name: 'Topbar - quick actions',
        path: '/System/UI/Topbar/${name}/actions',
        type: Config.Types.Extension,
        description: 'Add quick actions to topbars',
    },
]);

export default class Topbar extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            actions: [],
        });
    }

    componentDidMount() {
        super.componentDidMount();

        Config.loadExtension(this.getConfigPath(), this.context.globalData)
            .then(resources => {
                const context = {
                    recordId: this.prop('recordId'),
                    sObjectName: this.prop('sObjectName'),
                };
                return Utils.retrieve(_.last(resources), [context]);
            })
            .then(actions => {
                this.setState({
                    actions: actions || [],
                });
            });
    }

    getConfigPath() {
        return `/System/UI/Topbar/${this.prop('name')}/actions`;
    }

    render(props, state) {
        const [{
            className,
            name,
            recordId,
            sObjectName,
            onReload,
            children,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ `slds-grid slds-grid_vertical-align-center slds-p-vertical_medium slds-border_bottom slds-m-bottom_medium ${className}` }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                <div className="slds-text-heading_medium">
                    { children }
                </div>
                <div className="slds-col_bump-left slds-button-group">
                    {
                        onReload && (
                        <ButtonIcon
                            iconName="utility:refresh"
                            className="slds-m-left_xx-small"
                            size="medium"
                            alternativeText="Reload"
                            onClick={ onReload }
                        >
                        </ButtonIcon>
                        )
                    }
                    {
                        name && Config.getValue(this.getConfigPath(), this.context.globalData) && (
                        <QuickActions
                            className="slds-button_last"
                            name={ `${name}-actions` }
                            variant="dropdown"
                            recordId={ recordId }
                            sObjectName={ sObjectName }
                            actions={ this.state.actions }
                        >
                        </QuickActions>
                        )
                    }
                </div>
            </div>
        );
    }
}

Topbar.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name'),
    recordId: PropTypes.isString('recordId'),
    sObjectName: PropTypes.isString('sObjectName'),
    onReload: PropTypes.isFunction('onReload'),
    children: PropTypes.isChildren('children'),
};

Topbar.propTypesRest = true;
Topbar.displayName = "Topbar";
