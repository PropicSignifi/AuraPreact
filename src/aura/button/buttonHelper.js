({
    computeClassNames: function(cmp) {
        var variant = cmp.get('v.variant');
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('slds-button', {
            'slds-button--neutral': this.equal(variant, 'neutral'),
            'slds-button--brand': this.equal(variant, 'brand'),
            'slds-button--destructive': this.equal(variant, 'destructive'),
            'slds-button--inverse': this.equal(variant, 'inverse'),
            'slds-button--success': this.equal(variant, 'success'),
            'slds-button_primary': this.equal(variant, 'primary'),
            'slds-button_secondary': this.equal(variant, 'secondary'),
            'slds-button_tertiary': this.equal(variant, 'tertiary'),
            'slds-button_save': this.equal(variant, 'save'),
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },
})
