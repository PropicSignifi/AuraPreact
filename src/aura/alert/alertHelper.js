({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var privateClosed = cmp.get('v.privateClosed');
        var classnames = this.classnamesLibrary.classnames('slds-notify slds-notify_alert slds-theme_alert-texture', {
            'slds-theme_info': !variant || this.equal(variant, 'info'),
            'slds-theme_warning': this.equal(variant, 'warning'),
            'slds-theme_error': this.equal(variant, 'error'),
            'slds-hide': privateClosed,
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    onclose: function(cmp) {
        cmp.set("v.privateClosed", true);
    },
})
