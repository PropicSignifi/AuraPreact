({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('slds-text-link', classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    onClick: function(cmp) {
        var variant = cmp.get("v.variant");
        var url = cmp.get("v.url");
        var recordId = cmp.get("v.recordId");
        var parentRecordId = cmp.get("v.parentRecordId");
        var relatedListId = cmp.get("v.relatedListId");
        var isredirect = cmp.get("v.isredirect");
        var scope = cmp.get("v.scope");
        var resetHistory = cmp.get("v.resetHistory");
        var listViewId = cmp.get("v.listViewId");
        var listViewName = cmp.get("v.listViewName");
        var componentDef = cmp.get("v.componentDef");
        var componentAttributes = cmp.get("v.componentAttributes");
        if(variant === "url") {
            this.fireAppEvent("e.force:navigateToURL", {
                url: url,
                isredirect: isredirect,
            });
        }
        else if(variant === "sobject") {
            this.fireAppEvent("e.force:navigateToSObject", {
                recordId: recordId,
                isredirect: isredirect,
            });
        }
        else if(variant === "relatedList") {
            this.fireAppEvent("e.force:navigateToRelatedList", {
                parentRecordId: parentRecordId,
                relatedListId: relatedListId,
            });
        }
        else if(variant === "objectHome") {
            this.fireAppEvent("e.force:navigateToObjectHome", {
                scope: scope,
                resetHistory: resetHistory,
            });
        }
        else if(variant === "list") {
            this.fireAppEvent("e.force:navigateToList", {
                listViewId: listViewId,
                listViewName: listViewName,
                scope: scope,
            });
        }
        else if(variant === "component") {
            this.fireAppEvent("e.force:navigateToComponent", {
                componentDef: componentDef,
                componentAttributes: componentAttributes,
            });
        }
    },
})
