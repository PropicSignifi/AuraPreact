({
    handleNodeClick: function(cmp, event) {
        var index = _.parseInt(window.$Utils.findFromEvent(event, "data-index"));
        this.fireEvent(cmp, "onclick", {
            index: index,
        });
    },
})
