({
    init: function(cmp, event, helper) {
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var resourceName = cmp.get('v.resourceName');
        var attributes = [
            cmp.get('v.attribute1'),
            cmp.get('v.attribute2'),
            cmp.get('v.attribute3'),
            cmp.get('v.attribute4'),
            cmp.get('v.attribute5'),
            cmp.get('v.attribute6'),
            cmp.get('v.attribute7'),
            cmp.get('v.attribute8'),
            cmp.get('v.attribute9'),
            cmp.get('v.attribute10'),
        ];

        var setAttribute = $A.getCallback(function(index, value) {
            if(index >= 0 && index <= 9) {
                cmp.set('v.attribute' + (index + 1), value);
            }
        });

        cmp.find('preact').set('v.props', {
            recordId: recordId,
            sObjectName: sObjectName,
            resourceName: resourceName,
            attributes: attributes,
            setAttribute: setAttribute,
        });
    },
})
