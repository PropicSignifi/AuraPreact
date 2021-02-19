({
    computeClassNames: function(cmp) {
        if(!this.classnamesLibrary) {
            return;
        }

        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var size = cmp.get('v.size');
        var timing = cmp.get('v.timing');
        var container = cmp.get('v.container');
        var classnames = this.classnamesLibrary.classnames('slds-spinner', {
            'slds-spinner_brand': this.equal(variant, 'brand'),
            'slds-spinner_inverse': this.equal(variant, 'inverse'),
            'slds-spinner_xx-small': this.equal(size, 'xx-small'),
            'slds-spinner_x-small': this.equal(size, 'x-small'),
            'slds-spinner_small': this.equal(size, 'small'),
            'slds-spinner_medium': this.equal(size, 'medium'),
            'slds-spinner_large': this.equal(size, 'large'),
            'slds-spinner_delayed': this.equal(timing, 'delayed'),
        }, container === 'without' ? classes : '');
        cmp.set('v.privateComputedClass', classnames);

        var containerClassnames = '';
        if(container === 'with') {
            containerClassnames = 'slds-spinner_container ' + classes;
        }
        else if(container === 'with_fixed') {
            containerClassnames = 'slds-spinner_container slds-is-fixed ' + classes;
        }
        cmp.set("v.privateComputedContainerClass", containerClassnames);
    },
})
