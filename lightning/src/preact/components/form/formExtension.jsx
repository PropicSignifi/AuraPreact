import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import RecordForm from '../recordForm/recordForm';
import Config from '../utils/config';

Config.defineConfig([
    {
        name: 'Form - extension with layout',
        path: '/System/UI/Form/${name}/extension/layoutName',
        type: Config.Types.String,
        description: 'Add form extension with a layout name',
    },
    {
        name: 'Form - extension with record type api name',
        path: '/System/UI/Form/${name}/extension/recordTypeApiName',
        type: Config.Types.String,
        description: 'Add form extension with a record type api name',
    },
    {
        name: 'Form - extension with static resource extension',
        path: '/System/UI/Form/${name}/extension/resourceName',
        type: Config.Types.String,
        description: 'Add form extension with a static resource extension name',
    },
]);

export default class FormExtension extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            name: null,
            disabled: false,
            readonly: false,
        });

        this._recordForm = null;

        this.bind([
            'setForm',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        if(this.context.form) {
            this.context.registerExtension(this);

            this.setState({
                name: this.context.form.getName(),
            });
        }
    }

    setForm(node) {
        this._recordForm = node;
    }

    setDisabled(disabled) {
        this.setState({
            disabled,
        });
    }

    setReadonly(readonly) {
        this.setState({
            readonly,
        });
    }

    isDisabled() {
        return this.prop('disabled') || this.state.disabled || this.state.readonly;
    }

    validate() {
        return this._recordForm && this._recordForm.validate();
    }

    save(id, submit = true) {
        if(submit && !id) {
            throw new Error(`Record id is required for saving extension for form ${this.state.name}`);
        }

        if(this._recordForm) {
            if(submit) {
                return this._recordForm.updateRecord(id);
            }
            else {
                window.$Utils.markUnsaved(false);

                return Promise.resolve(this._recordForm.getData());
            }
        }
        else {
            return Promise.resolve(null);
        }
    }

    render(props, state) {
        const [{
            className,
            recordId,
            sObjectName,
        }, rest] = this.getPropValues();

        if(this.state.name) {
            const layoutName = Config.getValue(`/System/UI/Form/${this.state.name}/extension/layoutName`, this.context.globalData);
            const recordTypeApiName = Config.getValue(`/System/UI/Form/${this.state.name}/extension/recordTypeApiName`, this.context.globalData);
            const resourceName = Config.getValue(`/System/UI/Form/${this.state.name}/extension/resourceName`, this.context.globalData);

            if(layoutName || recordTypeApiName || resourceName) {
                return (
                    <div
                        className={ `slds-col ${className }`}
                        data-type={ this.getTypeName() }
                        { ...rest }
                    >
                        <RecordForm
                            ref={ this.setForm }
                            groupClassName="slds-grid_pull-padded-small"
                            name={ `${this.state.name}-extension` }
                            recordId={ recordId }
                            sObjectName={ sObjectName }
                            hideButtons="true"
                            layoutName={ layoutName }
                            recordTypeApiName={ recordTypeApiName }
                            resourceName={ resourceName }
                            disabled={ this.isDisabled() }
                        >
                        </RecordForm>
                    </div>
                );
            }
        }
    }
}

FormExtension.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    recordId: PropTypes.isString('recordId'),
    sObjectName: PropTypes.isString('sObjectName'),
    disabled: PropTypes.isBoolean('disabled'),
};

FormExtension.propTypesRest = true;
FormExtension.displayName = "FormExtension";
