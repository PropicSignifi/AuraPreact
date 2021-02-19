({
    handleDragLeave: function(cmp, event, helper) {
        helper.removeDragOverStyles(cmp);
    },

    handleOnDrop: function(cmp, event, helper) {
        var disabled = cmp.get('v.disabled');

        event.preventDefault();
        helper.removeDragOverStyles(cmp);

        if (disabled) {
            event.stopPropagation();
            return;
        }

        if (!helper.meetsMultipleCriteria(cmp, event)) {
            event.stopPropagation();
        }
    },

    allowDrop: function(cmp, event, helper) {
        var disabled = cmp.get('v.disabled');

        event.preventDefault();
        if (!disabled) {
            helper.setDragOverStyles(cmp);
        }
    },
})
