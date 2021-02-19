({
    DEFAULT_ANCHORING: {
        trigger: {
            horizontal: 'left',
            vertical: 'top',
        },
        bubble: {
            horizontal: 'left',
            vertical: 'bottom',
        }
    },

    // compute class value for this bubble
    updateClassList: function(cmp) {
        var visible = cmp.get("v.visible");
        var align = cmp.get("v.align");
        var classnames = this.classnamesLibrary.classnames('slds-popover slds-popover_tooltip', {
            'slds-rise-from-ground': visible === true,
            'slds-fall-into-ground': visible === false,
            'slds-nubbin_top-left': align.horizontal === 'left' && align.vertical === 'top',
            'slds-nubbin_top-right': align.horizontal === 'right' && align.vertical === 'top',
            'slds-nubbin_bottom-left': align.horizontal === 'left' && align.vertical === 'bottom',
            'slds-nubbin_bottom-right': align.horizontal === 'right' && align.vertical === 'bottom',
        });
        cmp.set('v.privateComputedClass', classnames);
    },

    // manually set the content value
    setContentManually: function(cmp) {
        var root = cmp.getElement();
        var content = cmp.get("v.content");
        /* manipulate DOM directly */
        root.querySelector('.slds-popover__body').textContent = content;
    },
})
