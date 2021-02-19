({
    init: function(cmp, event, helper) {
        var params = window.$Utils.getUrlSearchParams();
        var ns = window.$Config.getNamespace() + '__';
        var recordId = _.get(params, 'recordId') || cmp.get('v.recordId');
        var sObjectName = _.get(params, 'sObjectName') || cmp.get('v.sObjectName');
        var channel = _.get(params, 'channel') || cmp.get('v.channel');
        var title = _.get(params, 'title') || cmp.get('v.title');
        var sourceRecordId = _.get(params, 'sourceRecordId') || cmp.get('v.sourceRecordId');
        var saveToId = _.get(params, 'saveToId') || cmp.get('v.saveToId');
        var sourceRecordIdList = _.get(params, 'sourceRecordIdList') || cmp.get('v.sourceRecordIdList');
        var pageRef = cmp.get("v.pageReference");
        var paramString = _.get(params, 'paramsObject') || cmp.get('v.paramsObject');
        var paramMap = null;

        if(pageRef) {
            recordId = pageRef.state[ns + 'recordId'] || recordId;
            sObjectName = pageRef.state[ns + 'sObjectName'] || sObjectName;
            channel = pageRef.state[ns + 'channel'] || channel;
            title = pageRef.state[ns + 'title'] || title;
            sourceRecordId = pageRef.state[ns + 'sourceRecordId'] || sourceRecordId;
            sourceRecordIdList = pageRef.state[ns + 'sourceRecordIdList'] || sourceRecordIdList;
            saveToId = pageRef.state[ns + 'saveToId'] || saveToId;
            paramString = pageRef.state[ns + 'paramsObject'] || paramString;
        }

        try {
            paramMap = JSON.parse(paramString);
        }
        catch(e) {}

        cmp.find('preact').set('v.props', {
            recordId: recordId,
            sObjectName: sObjectName,
            channel: channel,
            title: title,
            paramsObject: paramMap,
            sourceRecordId: sourceRecordId,
            sourceRecordIdList: sourceRecordIdList,
            saveToId: saveToId,
        });
    },
})
