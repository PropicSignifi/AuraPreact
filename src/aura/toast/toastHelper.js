({
    computeClassNames: function(cmp) {
        var variant = cmp.get("v.variant");
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('slds-notify slds-notify_toast', {
            'slds-theme_info': !variant || this.equal(variant, "base"),
            'slds-theme_success': this.equal(variant, "success"),
            'slds-theme_warning': this.equal(variant, "warning"),
            'slds-theme_error': this.equal(variant, "error"),
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    computeContainerClassNames: function(cmp) {
        var position = cmp.get("v.position");
        var classnames = this.classnamesLibrary.classnames('slds-notify_container', {
            'slds-is-fixed': !position || this.equal(position, "fixed") || this.equal(position, "fixed-one"),
            'slds-is-relative': this.equal(position, "relative"),
            'inside-one-app': this.equal(position, "fixed-one"),
        });
        cmp.set('v.privateComputedContainerClass', classnames);
    },

    getIconName: function(variant) {
        switch(variant) {
            case 'success':
                return "utility:success";
            case 'warning':
                return "utility:warning";
            case 'error':
                return "utility:error";
            default:
                return "utility:info";
        }
    },

    computeIconName: function(cmp) {
        var variant = cmp.get("v.variant");
        cmp.set('v.privateIcon', this.getIconName(variant));
    },

    closeToast: function(cmp) {
        cmp.set('v.visible', false);
    },
})
