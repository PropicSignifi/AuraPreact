({
    initializeComputed: function(cmp) {
        this.setComputed(cmp, {
            rowTemplate: function() {
                return '<c:tableBodyRow index="{! v.index }" row="{! v.object }" rowConfig="{! table.v.rowConfig }" providers="{! table.v.providers }" checkable="{! table.v.checkable }" select="{! table.v.select }" onselect="{! table.c.handleSelect }" expanderConfig="{! table.v.expanderConfig }" onRowEvent="{! table.c.onRowEvent }"/>';
            },
            rowProviders: function() {
                return {
                    table: cmp,
                };
            },
        });
    },

    computeClassNames: function(cmp) {
        if(!this.classnamesLibrary) {
            return;
        }
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var resizable = cmp.get("v.resizable");
        var classnames = this.classnamesLibrary.classnames('slds-table', {
            'slds-table_bordered': !variant || this.equal(variant, 'default'),
            'slds-table_bordered slds-table_striped': this.equal(variant, 'striped'),
            'slds-hide': !cmp.get('v.privateLoaded'),
        }, {
            'slds-table_fixed-layout': this.isTableSortable(cmp) || resizable,
            'slds-table_custom-resizable': resizable,
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    setExpanded: function(cmp, row, expanded) {
        var rows = cmp.get("v.rows");
        if(expanded) {
            _.each(rows, function(r) {
                if(r !== row) {
                    r.$expanded = false;
                }
            });
        }
        row.$expanded = expanded;
        this.computeRows(cmp);
    },

    isTableSortable: function(cmp) {
        var headerRowConfig = cmp.get("v.headerRowConfig");
        return !!_.find(headerRowConfig, ["sortable", true]);
    },

    computeRows: function(cmp, options) {
        options = options || {};
        window.$Utils.startLoading(cmp);
        cmp.set("v.privateLoaded", false);
        var helper = this;
        var rows = cmp.get("v.rows");
        var privateFilterPredicate = cmp.get("v.privateFilterPredicate");

        var privateRows = rows;
        var filteredRows;
        if(_.isFunction(privateFilterPredicate)) {
            filteredRows = _.filter(privateRows, privateFilterPredicate);
        }
        else {
            filteredRows = privateRows;
        }

        var privateLastSize = cmp.get("v.privateLastSize");
        var size = _.size(filteredRows);
        if(privateLastSize !== size) {
            cmp.set("v.privateLastSize", size);
            this.fireAppEvent("appEvent", {
                name: cmp.get("v.name"),
                type: "onSizeChange",
                size: size,
            });
        }

        var startIndex = cmp.get("v.privateStartIndex");
        var endIndex = cmp.get("v.privateEndIndex");
        var visibleRows = filteredRows;
        if(startIndex || endIndex) {
            visibleRows = _.filter(filteredRows, function(row, index) {
                return index >= startIndex && index < endIndex;
            });
        }

        var configurer = cmp.get("v.configurer");
        if(configurer && _.isFunction(configurer.refreshRow)) {
            _.each(visibleRows, configurer.refreshRow);
        }

        var itemList = cmp.find("itemList");
        cmp.set("v.privateRows", visibleRows);
        itemList.renderItems(function() {
            helper.renderTable(cmp, options.includingHeader);
        });
    },

    renderTable: function(cmp, includingHeader) {
        var headerRowPreload = cmp.find("headerRowPreload");
        var rowPreload = cmp.find("rowPreload");
        Promise.all([headerRowPreload.renderRow(), rowPreload.renderRow()]).then($A.getCallback(function(data) {
            var headerRow = cmp.find("headerRow");
            if(headerRow) {
                if(includingHeader) {
                    headerRow._rowRendered = false;
                }
                headerRow.setTable(cmp);
                headerRow.renderRow();
            }

            var itemList = cmp.find("itemList");
            if(itemList) {
                window.$Utils.each(itemList.getItemUIs(), function(itemUI) {
                    var row = itemUI[0];
                    row.renderRow();
                });
            }

            cmp.set("v.privateLoaded", true);
            window.$Utils.stopLoading(cmp);
        }));
    },

    isFiltered: function(cmp) {
        return _.isFunction(cmp.get("v.privateFilterPredicate"));
    },

    handleSelect: function(cmp, event) {
        var index = event.getParam('data').index;
        var selectedRow = cmp.get("v.privateRows")[index];
        var headerRow = cmp.get("v.headerRow");
        var rows = cmp.get("v.rows");
        if(cmp.get("v.select") == 'single') {
            _.each(rows, function(row) {
                if(row === selectedRow) {
                    row.$selected = true;
                }
                else {
                    row.$selected = false;
                }
            });
        }
        if(_.every(rows, ["$selected", true])) {
            headerRow.$selected = true;
        }
        else if(_.every(rows, ["$selected", false])) {
            headerRow.$selected = false;
        }
        cmp.set("v.headerRow", headerRow);
    },

    handleSelectAll: function(cmp) {
        var headerRow = cmp.get("v.headerRow");
        var rows = cmp.get("v.rows");
        _.each(rows, function(row) {
            row.$selected = headerRow.$selected;
        });
        cmp.set("v.rows", rows);
    },

    handleSort: function(cmp, event) {
        var data = event.getParam("data");
        var sortName = data.name;
        var sortDirection = data.direction;
        this.sortBy(cmp, sortName, sortDirection);
    },

    sortBy: function(cmp, sortName, sortDirection) {
        var headerRowConfig = cmp.get("v.headerRowConfig");
        var rows = cmp.get("v.rows");
        var config = _.find(headerRowConfig, ["name", sortName]);
        if(config && config.sortable) {
            // Sorting takes significant time when it comes to more than 1000
            // Currently no web worker is supported in Salesforce and a long running
            // calculation will inevitably hang the UI
            if(_.isFunction(config.sort)) {
                rows = rows.sort(function(a, b) {
                    return sortDirection === "asc" ? config.sort(a, b) : -config.sort(a, b);
                });
            }
            else {
                rows = sortDirection === "asc" ?
                    _.sortBy(rows, config.name) :
                    _.reverse(_.sortBy(rows, config.name));
            }

            cmp.set("v.rows", rows);

            config.sortDirection = sortDirection;
            _.each(headerRowConfig, function(c) {
                c.sortActive = c === config;
            });
            cmp.set("v.headerRowConfig", headerRowConfig);
            this.forceRefreshHeaderRow(cmp);
        }
    },

    forceRefreshHeaderRow: function(cmp) {
        var headerRow = cmp.find("headerRow");
        headerRow._rowRendered = false;
        headerRow.renderRow();
    },

    handlePageChange: function(cmp, event) {
        var data = event.getParam("data");
        var paginatorName = cmp.get("v.paginatorName");
        if(paginatorName === data.name && "onPageChange" === data.type) {
            cmp.set("v.privateStartIndex", data.startIndex);
            cmp.set("v.privateEndIndex", data.endIndex);

            this.computeRows(cmp);
        }
    },

    selectAll: function(cmp, event) {
        if(!cmp.get("v.checkable")) {
            return;
        }
        var rows = cmp.get("v.rows");
        var headerRow = cmp.get("v.headerRow");
        _.each(rows.concat(headerRow), function(row) {
            row.$selected = true;
        });
        cmp.set("v.rows", rows);
        cmp.set("v.headerRow", headerRow);
    },

    deselectAll: function(cmp, event) {
        if(!cmp.get("v.checkable")) {
            return;
        }
        var rows = cmp.get("v.rows");
        var headerRow = cmp.get("v.headerRow");
        _.each(rows.concat(headerRow), function(row) {
            row.$selected = false;
        });
        cmp.set("v.rows", rows);
        cmp.set("v.headerRow", headerRow);
    },

    getSelectedRows: function(cmp, event) {
        return cmp.get("v.checkable") ?
            _.chain(cmp.get("v.rows")). filter(["$selected", true]). value() :
            [];
    },

    onRowEvent: function(cmp, event) {
        event.stopPropagation();
        var data = event.getParam('data');
        var index = _.parseInt(window.$Utils.findFromEvent(data.event, "data-col"));
        if(index >= 0) {
            var rowConfig = cmp.get("v.rowConfig");
            var config = rowConfig[index];
            if(config && config.triggerRefresh) {
                this.computeRows(cmp);
            }
        }
        this.fireEvent(cmp, "onRowEvent", data);
    },
})
