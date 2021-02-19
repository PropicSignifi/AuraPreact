({
    init: function(cmp, event, helper) {
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var label = cmp.get('v.label');
        var fieldName = cmp.get('v.fieldName');
        var previewWidth = cmp.get('v.previewWidth');
        var previewHeight = cmp.get('v.previewHeight');

        cmp.find('preact').set('v.props', {
            recordId: recordId,
            sObjectName: sObjectName,
            label: label,
            fieldName: fieldName,
            previewWidth: previewWidth,
            previewHeight: previewHeight,
        });
    },
})
