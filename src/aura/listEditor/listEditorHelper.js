({
    initializeComputed: function(cmp) {
        this.setComputed(cmp, {
            template: function() {
                return '<c:listEditorItem object="{! v.object }" index="{! v.index }" itemsConfig="{! listEditor.v.itemsConfig }"/>';
            },
            providers: function() {
                return {
                    listEditor: cmp,
                };
            },
        });
    },

    computeItems: function(cmp) {
        window.$Utils.startLoading(cmp);
        cmp.set("v.privateLoaded", false);
        var helper = this;
        var items = cmp.get("v.items");

        var privateItems = items;
        var filteredItems = privateItems;

        var privateLastSize = cmp.get("v.privateLastSize");
        var size = _.size(filteredItems);
        if(privateLastSize !== size) {
            cmp.set("v.privateLastSize", size);
            this.fireAppEvent("appEvent", {
                name: cmp.get("v.name"),
                type: "onSizeChange",
                size: _.size(filteredItems),
            });
        }

        var startIndex = cmp.get("v.privateStartIndex");
        var endIndex = cmp.get("v.privateEndIndex");
        var visibleItems;
        if(startIndex || endIndex) {
            visibleItems = _.filter(filteredItems, function(item, index) {
                return index >= startIndex && index < endIndex;
            });
        }
        else {
            visibleItems = filteredItems;
        }

        var itemList = cmp.find("itemList");
        cmp.set("v.privateItems", visibleItems);
        itemList.renderItems(function() {
            window.$Utils.stopLoading(cmp);
            cmp.set("v.privateLoaded", true);
        });
    },

    handlePageChange: function(cmp, event) {
        var data = event.getParam("data");
        var paginatorName = cmp.get("v.paginatorName");
        if(paginatorName === data.name && "onPageChange" === data.type) {
            cmp.set("v.privateStartIndex", data.startIndex);
            cmp.set("v.privateEndIndex", data.endIndex);

            this.computeItems(cmp);
        }
    },
})
