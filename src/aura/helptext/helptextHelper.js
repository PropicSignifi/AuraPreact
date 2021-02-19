({
    computeClassNames: function(cmp) {
        var privateShowTooltip = cmp.get('v.privateShowTooltip');
        var align = cmp.get('v.align');
        var classnames = this.classnamesLibrary.classnames('slds-popover slds-popover_tooltip', {
            'slds-nubbin_top slds-popover_tooltip_top': this.equal(align, 'top'),
            'slds-nubbin_top-left slds-popover_tooltip_top-left': this.equal(align, 'top-left'),
            'slds-nubbin_top-right slds-popover_tooltip_top-right': this.equal(align, 'top-right'),
            'slds-nubbin_bottom slds-popover_tooltip_bottom': this.equal(align, 'bottom'),
            'slds-nubbin_bottom-left slds-popover_tooltip_bottom-left': this.equal(align, 'bottom-left'),
            'slds-nubbin_bottom-right slds-popover_tooltip_bottom-right': this.equal(align, 'bottom-right'),
            'slds-nubbin_left slds-popover_tooltip_left': this.equal(align, 'left'),
            'slds-nubbin_left-top slds-popover_tooltip_left-top': this.equal(align, 'left-top'),
            'slds-nubbin_left-bottom slds-popover_tooltip_left-bottom': this.equal(align, 'left-bottom'),
            'slds-nubbin_right slds-popover_tooltip_right': this.equal(align, 'right'),
            'slds-nubbin_right-top slds-popover_tooltip_right-top': this.equal(align, 'right-top'),
            'slds-nubbin_right-bottom slds-popover_tooltip_right-bottom': this.equal(align, 'right-bottom'),
            'slds-show': privateShowTooltip,
            'slds-hide': !privateShowTooltip,
        });
        cmp.set('v.privateComputedClass', classnames);
    },

    computeContainerClassNames: function(cmp) {
        var classes = cmp.get("v.class");
        var classnames = this.classnamesLibrary.classnames(classes);
        cmp.set('v.privateContainerComputedClass', classnames);
    },

    handleContentChange: function(cmp) {
        var content = cmp.get("v.content");
        var data = window.$Utils.extractHint(content);
        var hint = data[0];
        var message = data[1];
        if(_.includes(hint, "unescaped")) {
            cmp.set("v.privateUnescaped", true);
            cmp.set("v.privateContent", message);
        }
        else {
            cmp.set("v.privateUnescaped", false);
            cmp.set("v.privateContent", message);
        }
    },
})
