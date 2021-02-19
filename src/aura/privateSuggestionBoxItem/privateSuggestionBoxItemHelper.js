({
    onClickItem: function(cmp, event) {
        event.stopPropagation();
        var index = _.parseInt(window.$Utils.findFromEvent(event, "data-index"));
        this.fireEvent(cmp, "onclick", {
            event: event,
            index: index,
        });
    },
})
