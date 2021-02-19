({
    init: function(cmp, event, helper) {
        var ns = window.$Config.getNamespace() + '__';
        var name = cmp.get('v.name');
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var layoutCode = cmp.get('v.layoutCode');
        var resourceName = cmp.get('v.resourceName');
        var header = cmp.get('v.header');
        var hideHeader = cmp.get('v.hideHeader');
        var type = cmp.get('v.type');

        var pageRef = cmp.get("v.pageReference");
        if(pageRef) {
            name = pageRef.state[ns + 'name'] || name;
            recordId = pageRef.state[ns + 'recordId'] || recordId;
            sObjectName = pageRef.state[ns + 'sObjectName'] || sObjectName;
            layoutCode = pageRef.state[ns + 'layoutCode'] || layoutCode;
            resourceName = pageRef.state[ns + 'resourceName'] || resourceName;
            header = pageRef.state[ns + 'header'] || header;
            hideHeader = pageRef.state[ns + 'hideHeader'] || hideHeader;
            type = pageRef.state[ns + 'type'] || type;
        }
        cmp.find('preact').set('v.props', {
            name: name,
            recordId: recordId,
            sObjectName: sObjectName,
            layoutCode: layoutCode,
            resourceName: resourceName,
            header: header,
            hideHeader: hideHeader,
            type: type,
        });
    },
})
