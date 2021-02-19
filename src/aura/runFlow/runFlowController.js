({
    init: function(cmp, event, helper) {
        var ns = window.$Config.getNamespace() + '__';
        var flowName = cmp.get('v.flowName');
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var retRecordId = cmp.get('v.retRecordId');
        var pageRef = cmp.get("v.pageReference");
        if(pageRef) {
            flowName = pageRef.state[ns + 'flowName'] || flowName;
            recordId = pageRef.state[ns + 'recordId'] || recordId;
            sObjectName = pageRef.state[ns + 'sObjectName'] || sObjectName;
            retRecordId = pageRef.state[ns + 'retRecordId'] || retRecordId;
        }
        cmp.retRecordId = retRecordId;
        cmp.find('flow').startFlow(flowName, [
            {
                name: 'recordId',
                type: 'String',
                value: recordId,
            },
            {
                name: 'sObjectName',
                type: 'String',
                value: sObjectName,
            },
        ]);
    },

    onStatusChange: function(cmp, event, helper) {
        if (event.getParam('status') === "FINISHED") {
            if(cmp.retRecordId) {
                window.$Utils.fireAppEvent('e.force:navigateToSObject', {
                    recordId: cmp.retRecordId,
                });
            }

            if(_.isFunction(cmp.get('v.onFinish'))) {
                cmp.get('v.onFinish')();
            }
        }
    },
})
