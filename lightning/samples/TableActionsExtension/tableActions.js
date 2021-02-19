$define('tableActions', ['Utils'], function(Utils) {
    return [
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
    ];
});
