import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import RecordForm from '../recordForm/recordForm';
import Config from '../utils/config';
import Actions from '../utils/actions';
import Utils from '../utils/utils';

Config.defineConfig([
    {
        name: 'New Task Layout',
        path: '/Task/New/PageLayout/name',
        type: Config.Types.String,
        description: 'The name of the layout of the new task',
    },
]);

export default class NewTask extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showTaskModal: false,
        });

        this.bind([
            'onCancelTaskModal',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        Actions.registerAction('New Task', () => {
            this.setState({
                showTaskModal: true,
            });
        });
    }

    onCancelTaskModal() {
        this.setState({
            showTaskModal: false,
        });
    }

    render(props, state) {
        if(this.state.showTaskModal) {
            return (
                <RecordForm
                    name="newTaskForm"
                    variant="modal"
                    sObjectName="Task"
                    layoutName={ Config.getValue('/Task/New/PageLayout/name') }
                    header="New Task"
                    onSave={ (data, proceed) => {
                        proceed(data).then(() => {
                        Utils.toast({
                            variant: 'success',
                            content: 'Task created successfully',
                        });
                            this.onCancelTaskModal();
                        });
                    } }
                    onCancel={ this.onCancelTaskModal }
                    onClose={ this.onCancelTaskModal }
                    data-type={ this.getTypeName() }
                >
                </RecordForm>
            );
        }
    }
}
