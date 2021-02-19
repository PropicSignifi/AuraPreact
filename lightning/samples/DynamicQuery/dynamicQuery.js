$define('dynamicQuery', ['Utils'], function(Utils) {
    return {
        baseActions: [
            {
                name: 'Test Action',
                attributes: {
                    select: 'single',
                },
                onClick: args => {
                    Utils.toast({
                        variant: 'success',
                        content: `Selected items are: ${args.selected}`,
                    });
                },
            },
        ],

        buildColumns: columns => columns,
        buildActions: actions => actions,
    };
});
