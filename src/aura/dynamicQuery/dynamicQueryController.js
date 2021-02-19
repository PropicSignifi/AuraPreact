({
    init: function(cmp, event, helper) {
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var name = cmp.get('v.name');
        var title = cmp.get('v.title');
        var query = cmp.get('v.query');
        var pageSize = cmp.get('v.pageSize');
        var columns = [
            cmp.get('v.column1'),
            cmp.get('v.column2'),
            cmp.get('v.column3'),
            cmp.get('v.column4'),
            cmp.get('v.column5'),
            cmp.get('v.column6'),
            cmp.get('v.column7'),
            cmp.get('v.column8'),
            cmp.get('v.column9'),
            cmp.get('v.column10'),
        ];
        var actions = [
            cmp.get('v.action1'),
            cmp.get('v.action2'),
            cmp.get('v.action3'),
            cmp.get('v.action4'),
            cmp.get('v.action5'),
            cmp.get('v.action6'),
            cmp.get('v.action7'),
            cmp.get('v.action8'),
            cmp.get('v.action9'),
            cmp.get('v.action10'),
        ];
        var extension = cmp.get('v.extension');
        cmp.find('preact').set('v.props', {
            recordId: recordId,
            sObjectName: sObjectName,
            name: name,
            title: title,
            query: query,
            pageSize: pageSize,
            columns: columns,
            actions: actions,
            extension: extension,
        });
    },
})
