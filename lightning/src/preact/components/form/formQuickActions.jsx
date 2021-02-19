import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import QuickActions from '../quickActions/quickActions';
import Config from '../utils/config';
import Utils from '../utils/utils';

Config.defineConfig([
    {
        name: 'Form - quick actions',
        path: '/System/UI/Form/${name}/actions',
        type: Config.Types.Extension,
        description: 'Add a form quick actions',
    },
]);

export default class FormQuickActions extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            name: null,
            actions: [],
        });
    }

    componentDidMount() {
        super.componentDidMount();

        const form = this.context.form;
        if(form) {
            this.setState({
                name: form.getName(),
            }, () => {
                Config.loadExtension(this.getConfigPath(), this.context.globalData)
                    .then(resources => {
                        const context = {
                            recordId: this.prop('recordId'),
                            sObjectName: this.prop('sObjectName'),
                            form,
                        };
                        return Utils.retrieve(_.last(resources), [context]);
                    })
                    .then(actions => {
                        this.setState({
                            actions: actions || [],
                        });
                    });
            });
        }
    }

    getConfigPath() {
        return `/System/UI/Form/${this.state.name}/actions`;
    }

    render(props, state) {
        const [{
            className,
            recordId,
            sObjectName,
            children,
        }, rest] = this.getPropValues();

        if(this.state.name && Config.getValue(this.getConfigPath(), this.context.globalData)) {
            return (
                <QuickActions
                    className="slds-button"
                    name={ `${this.state.name}-actions` }
                    label="Action"
                    variant="dropdown"
                    recordId={ recordId }
                    sObjectName={ sObjectName }
                    actions={ this.state.actions }
                    iconName="ctc-utility:a_up"
                    menuAlignment="bottom-left"
                >
                </QuickActions>
            );
        }
    }
}

FormQuickActions.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    recordId: PropTypes.isString('recordId'),
    sObjectName: PropTypes.isString('sObjectName'),
    children: PropTypes.isChildren('children'),
};

FormQuickActions.propTypesRest = true;
FormQuickActions.displayName = "FormQuickActions";
