({
    init: function(cmp, event, helper) {
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var label = cmp.get('v.label');
        var fieldName = cmp.get('v.fieldName');
        cmp.find('preact').set('v.props', {
            recordId: recordId,
            sObjectName: sObjectName,
            label: label,
            fieldName: fieldName,
        });
    },
})
