({
    doInit: function(cmp, event, helper) {
        var preact = cmp.find('preact');

        preact.registerPreactlet('CountingButton', {
            view: (state, actions) => {
                return `
                    <Button
                        className="{! props.className }"
                        label="{! 'Clicked: ' + state.count }"
                        variant="primary"
                        onClick="{! e => actions.onClick() }"
                    >
                    </Button>
                `;
            },
            props: {
                className: '',
            },
            state: {
                count: 0,
            },
            actions: (state, setState) => ({
                onClick: () => {
                    setState({
                        count: state.count + 1,
                    });

                    var utils = preact.requireComponent('Utils');
                    utils.toast({
                        variant: 'success',
                        content: 'A test toast',
                    });
                },
            }),
        });

        var preactlet = {
            view: (state, actions) => {
                return `
                    <FormGroup>
                        <FormTile>
                            <Textarea
                                name="test"
                                label="Test"
                                value="{! state.value }"
                                onValueChange="{! newVal => actions.onValueChange('value', newVal) }"
                            >
                            </Textarea>
                        </FormTile>
                        <TableManager
                                name="customTableManager"
                                data="{! state.data }"
                                columns="{! state.columns }"
                                onValueChange="{! newVal => actions.onValueChange('data', newVal) }"
                            >
                        </TableManager>
                        <FormActions>
                            <CountingButton
                                className="slds-col_bump-left"
                            >
                            </CountingButton>
                        </FormActions>
                    </FormGroup>
                `;
            },
            state: {
                value: 'some content',
                data: [
                    {
                        id: '0',
                        name: 'Test Name',
                        age: 18,
                    },
                ],
                columns: [
                    {
                        name: 'name',
                        header: 'Name',
                        cell: (item, callbacks, context) => {
                            return preact.wrap(`
                                <div>${item.name}</div>
                            `);
                        },
                        searchBy: 'name',
                        filterBy: 'String',
                    },
                    {
                        name: 'age',
                        header: 'Age',
                        cell: (item, callbacks, context) => {
                            return preact.wrap({
                                view: (state, actions) => {
                                    return `
                                        <Input
                                            type="number"
                                            label="Age"
                                            name="age"
                                            variant="label-removed"
                                            value="${item.age}"
                                            onValueChange="{! newVal => actions.onItemValueChange(newVal) }"
                                        >
                                        </Input>
                                    `;
                                },
                                actions: (state, setState) => ({
                                    onItemValueChange: newVal => {
                                        callbacks.updateItem(callbacks.row.index, { age: newVal});
                                    },
                                }),
                            });
                        },
                        searchBy: 'age',
                        filterBy: 'Number',
                    },
                ],
            },
            actions: (state, setState) => ({
                onValueChange: (key, newVal) => {
                    setState({
                        [key]: newVal,
                    });
                },
            }),
        };

        cmp.set('v.preactlet', preactlet);
    },
})
