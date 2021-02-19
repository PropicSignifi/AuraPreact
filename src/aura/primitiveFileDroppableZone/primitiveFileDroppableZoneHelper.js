({
    setDragOverStyles: function(cmp) {
        var el = cmp.getElement();
        el.classList.add('slds-has-drag-over');
    },

    removeDragOverStyles: function(cmp) {
        var el = cmp.getElement();
        el.classList.remove('slds-has-drag-over');
    },

    hasFiles: function(dragEvent) {
        return dragEvent.dataTransfer.files.length > 0;
    },

    meetsMultipleCriteria: function(cmp, dragEvent) {
        var files = dragEvent.dataTransfer.files;
        var multiple = cmp.get('v.multiple');

        return !(files.length > 1 && !multiple);
    },
})
