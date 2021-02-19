({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);

        helper.initializeComputed(cmp);
        helper.computeRows(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computeRows: function(cmp, event, helper) {
        helper.computeRows(cmp);
    },

    refreshTable: function(cmp, event, helper) {
        helper.computeRows(cmp, {
            includingHeader: true,
        });
    },

    filter: function(cmp, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            cmp.set("v.privateFilterPredicate", args.predicate);
        }
    },

    isFiltered: function(cmp, event, helper) {
        return helper.isFiltered(cmp);
    },

    handleSelect: function(cmp, event, helper) {
        return helper.handleSelect(cmp, event);
    },

    handleSelectAll: function(cmp, event, helper) {
        return helper.handleSelectAll(cmp);
    },

    handleSort: function(cmp, event, helper) {
        event.preventDefault();
        return helper.handleSort(cmp, event);
    },

    handlePageChange: function(cmp, event, helper) {
        return helper.handlePageChange(cmp, event);
    },

    setExpanded: function(cmp, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            helper.setExpanded(cmp, args.row, args.expanded);
        }
    },

    selectAll: function(cmp, event, helper) {
        return helper.selectAll(cmp, event);
    },

    deselectAll: function(cmp, event, helper) {
        return helper.deselectAll(cmp, event);
    },

    getSelectedRows: function(cmp, event, helper) {
        return helper.getSelectedRows(cmp, event);
    },

    sortBy: function(cmp, event, helper) {
        var args = event.getParam('arguments');
        if(args) {
            helper.sortBy(cmp, args.name, args.direction);
        }
    },

    onRowEvent: function(cmp, event, helper) {
        helper.onRowEvent(cmp, event);
    },
})
