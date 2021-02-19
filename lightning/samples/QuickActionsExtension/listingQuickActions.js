$define('listingQuickActions', ['Utils', 'Preactlet'], function(Utils, Preactlet) {
    const actionsFn = (fn, args) => {
        // This case specifically requires a function to be returned as the quick actions are dynamically changed
        return (...args) => {
            const actions = fn(...args);
            return [
                ...(actions || []),
                {
                    name: 'Test Action',
                    onClick: args => {
                        Utils.toast({
                            variant: 'success',
                            content: 'Test action',
                        });
                    },
                },
                {
                    name: 'Render Action',
                    attributes: {
                        onSaveText: 'Save',
                    },
                    render: context => {
                        return Preactlet.render({
                            view: `<div>Test</div>`,
                            callbacks: {
                                componentDidMount: actions => {
                                    context.registerOnSaveHandler(proceed => {
                                        console.log('Saved');
                                        proceed();
                                    });
                                },
                            },
                        });
                    },
                },
                {
                    name: 'Flow Action',
                    actionType: 'flow_modal',
                    actionName: 'hello',
                },
                {
                    name: 'Fields Action',
                    attributes: {
                        onSaveText: 'Save',
                        onSaveHandler: (state, proceed) => {
                            console.log(state);
                            proceed();
                        },
                    },
                    fields: [
                        {
                            name: 'firstname',
                            label: 'First Name',
                            type: 'Text',
                            renderConfig: {
                                required: true,
                            },
                        },
                        {
                            name: 'lastname',
                            label: 'Last Name',
                            type: 'Text',
                            renderConfig: {
                                required: true,
                            },
                        },
                    ],
                },
                {
                    name: 'Record Form Action',
                    attributes: {
                        onSaveText: 'Save',
                        onSaveHandler: (record, proceed) => {
                            console.log(record);
                            proceed(record);
                        },
                    },
                    recordForm: {
                        sObjectName: 'Task',
                        layoutName: 'Task Layout',
                    },
                },
                {
                    name: 'URL Action',
                    actionType: 'visualforce_page_modal',
                    actionName: 'https://www.wikipedia.com',
                },
            ];
        };
    };

    // Only for demo purpose, promise not really needed
    return Utils.delay(() => actionsFn, 1000);
});
