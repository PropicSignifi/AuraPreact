$define('myCustomUI', ['Utils', 'Preactlet'], function(Utils, Preactlet) {
    return () => {
        return ({ recordId, sObjectName, attributes, setAttribute, }) => {
            return Preactlet.render({
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

                        Utils.toast({
                            variant: 'success',
                            content: 'A test toast',
                        });
                    },
                }),
            });
        };
    };
});
