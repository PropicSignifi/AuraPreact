({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var privatePageInfos = window.$Utils.getItems(cmp, "privatePageInfos");
        var classnames = this.classnamesLibrary.classnames('', {
            'slds-paginator': _.size(privatePageInfos) > 1,
            'slds-paginator_default': !variant || this.equal(variant, 'default'),
            'slds-hide': _.size(privatePageInfos) <= 1,
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    computePageData: function(cmp) {
        var total = _.parseInt(cmp.get("v.total"));
        var pageSize = _.parseInt(cmp.get("v.pageSize"));
        var current = _.parseInt(cmp.get("v.current"));
        var range = _.parseInt(cmp.get("v.range"));

        var totalPages = _.ceil(total / pageSize);
        var startPage = _.max([1, current - range]);
        var endPage = _.min([totalPages, current + range]);

        return {
            total: total,
            pageSize: pageSize,
            current: current,
            range: range,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
        };
    },

    computePagination: function(cmp) {
        var data = this.computePageData(cmp);

        var privatePageInfos = [];
        for(var i = data.startPage; i <= data.endPage; i++) {
            privatePageInfos.push({
                page: i,
                current: i === data.current,
            });
        }

        window.$Utils.setItems(cmp, "privatePageInfos", privatePageInfos);
        cmp.set("v.privateHasFirst", data.startPage > 1);
        cmp.set("v.privateHasLast", data.endPage < data.totalPages);
        cmp.set("v.privateHasPrev", data.current > 1);
        cmp.set("v.privateHasNext", data.current < data.totalPages);
    },

    gotoPage: function(cmp, event) {
        var data = this.computePageData(cmp);
        var current = data.current;
        var srcElement = window.$Utils.getSrcElement(event);
        var source = srcElement ? srcElement.getAttribute("data-id") : current;
        switch(source) {
            case 'first':
                if(!cmp.get("v.privateHasFirst")) {
                    return;
                }
                current = 1;
                break;
            case 'prev':
                if(!cmp.get("v.privateHasPrev")) {
                    return;
                }
                current = _.max([current - 1, 1]);
                break;
            case 'next':
                if(!cmp.get("v.privateHasNext")) {
                    return;
                }
                current = _.min([current + 1, data.endPage]);
                break;
            case 'last':
                if(!cmp.get("v.privateHasLast")) {
                    return;
                }
                current = data.totalPages;
                break;
            default:
                var sourcePage = _.parseInt(source);
                if(event && sourcePage === current) {
                    return;
                }
                current = sourcePage;
        }

        cmp.set("v.current", current);

        var privateLastPage = cmp.get("v.privateLastPage");
        var privateLastTotal = cmp.get("v.privateLastTotal");
        if(privateLastPage !== current || privateLastTotal !== data.total) {
            cmp.set("v.privateLastPage", current);
            cmp.set("v.privateLastTotal", data.total);
            this.fireAppEvent("appEvent", {
                event: event,
                name: cmp.get("v.name"),
                type: "onPageChange",
                current: current,
                startIndex: _.max([(current - 1) * data.pageSize, 0]),
                endIndex: _.min([current * data.pageSize, data.total]),
            });
        }
    },

    handleSizeChange: function(cmp, event) {
        var data = event.getParam("data");
        if(data.type === "onSizeChange" &&
            (data.name === cmp.get("v.tableName") || data.name === cmp.get("v.listName")) &&
            data.size !== _.parseInt(cmp.get("v.total"))
        ) {
            cmp.set("v.total", data.size);
            cmp.set("v.current", 1);

            this.gotoPage(cmp);
        }
    },
})
