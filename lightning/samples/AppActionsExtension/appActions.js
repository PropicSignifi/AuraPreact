$define('appActions', ['Utils'], function(Utils) {
    return [
        {
            name: 'test',
            execute: () => {
                Utils.toast({
                    variant: 'success',
                    content: 'Test Action',
                });
            },
        },
    ];
});
