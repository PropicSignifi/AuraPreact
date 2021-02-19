({
    init: function(cmp, event, helper) {
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        cmp.find('preact').set('v.props', {
            recordId: recordId,
            sObjectName: sObjectName,
        });
    },
})
