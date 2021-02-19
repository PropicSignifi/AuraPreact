$define('formQuickActions', ['Utils'], function(Utils) {
    return [
        {
            name: 'Test Action',
            onClick: args => {
                Utils.toast({
                    variant: 'success',
                    content: 'Test action',
                });
            },
        },
    ];
});
