import { h, render, Component } from 'preact';
import {
    BaseComponent,
    FlatPanel,
    Form,
    FormGroup,
    FormTile,
    FormActions,
    Input,
    Picklist,
    Textarea,
    Button,
    Spinner,

    Utils,
} from 'components';
import styles from './styles.less';

const methodOptions = _.chain([
    'get',
    'post',
    'put',
    'delete',
]).map(val => {
    return {
        label: val,
        value: val,
    };
}).value();

export default class RestApiExplorer extends BaseComponent {
    constructor() {
        super();

        this.state = {
            request: {
                url: '/services/data',
                method: 'get',
            },
            loading: false,
            result: null,
        };

        this.bind([
            'onRequestChange',
            'onSend',
        ]);
    }

    onRequestChange(newVal, key) {
        this.setState({
            request: _.assign({}, this.state.request, {
                [key]: newVal,
            }),
        });
    }

    onSend() {
        this.setState({
            loading: true,
        });

        Utils.restRequest('restApiExplorer', this.state.request).then(resp => {
            this.setState({
                loading: false,
                result: JSON.stringify(resp, null, 4),
            });

            console.log(resp);
        }, error => {
            this.setState({
                loading: false,
                result: _.toString(error),
            });
        });
    }

    render(props, state) {
        return (
            <FlatPanel className="slds-size_1-of-1 slds-p-around_medium slds-is-relative" header="Rest API Explorer">
                {
                    state.loading && <Spinner></Spinner>
                }
                <Form name="restApiExplorerForm">
                    <FormGroup>
                        <FormTile>
                            <Input
                                name="url"
                                label="URL"
                                required="true"
                                value={ this.state.request.url }
                                onValueChange={ this.onRequestChange }
                            >
                            </Input>
                        </FormTile>
                        <FormTile>
                            <Picklist
                                name="method"
                                label="Method"
                                required="true"
                                options={ methodOptions }
                                value={ this.state.request.method }
                                onValueChange={ this.onRequestChange }
                            >
                            </Picklist>
                        </FormTile>
                        <FormTile>
                            <Textarea
                                name="headers"
                                label="Headers"
                                rows="3"
                                value={ this.state.request.headers }
                                onValueChange={ this.onRequestChange }
                            >
                            </Textarea>
                        </FormTile>
                        <FormTile>
                            <Textarea
                                name="body"
                                label="Body"
                                rows="5"
                                value={ this.state.request.body }
                                onValueChange={ this.onRequestChange }
                            >
                            </Textarea>
                        </FormTile>
                        <FormActions>
                            <Button
                                className="slds-col_bump-left"
                                type="submit"
                                variant="primary"
                                label="Send"
                                onClick={ this.onSend }
                            >
                            </Button>
                        </FormActions>
                    </FormGroup>
                </Form>
                {
                    state.result && (
                    <div className="slds-m-top_medium slds-p-top_medium slds-border_top">
                        <code>
                            <pre>{ state.result }</pre>
                        </code>
                    </div>
                    )
                }
            </FlatPanel>
        );
    }
}
