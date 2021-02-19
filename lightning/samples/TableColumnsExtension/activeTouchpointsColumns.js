$define('activeTouchpointsColumns', ['Utils', 'Preactlet'], function(Utils, Preactlet) {
    return [
        {
            name: 'id',
            header: 'Id',
            type: 'String',
        },
        {
            name: 'assignedTo',
            header: 'Assigned To',
            cell: (item, callbacks) => {
                return Preactlet.render({
                    view: `
                    <div>
                        ${item.assignedTo.name}
                    </div>
                    `,
                });
            },
            searchBy: 'assignedTo.name',
            filterBy: [
                {
                    name: 'assignedTo.name',
                    label: 'Assigned To',
                    type: 'String',
                },
            ],
        },
        {
            name: 'task',
            header: 'Task',
            type: 'String',
        },
        {
            name: 'type',
            header: 'Activity Type',
            type: 'String',
        },
        {
            name: 'comment',
            header: 'Comment',
            type: 'String',
        },
        {
            name: 'priority',
            header: 'Priority',
            type: 'String',
        },
        {
            name: 'action',
        },
    ];
});
