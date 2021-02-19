({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var classnames = this.classnamesLibrary.classnames('slds-timeline__item', classes);
        cmp.set('v.privateComputedClass', classnames);
        var iconClass = this.classnamesLibrary.classnames('slds-icon_container', {
            'slds-icon-standard-task': this.equal(variant, 'task'),
            'slds-icon-standard-event': this.equal(variant, 'event'),
            'slds-icon-standard-log-a-call': this.equal(variant, 'call'),
            'slds-icon-standard-email': this.equal(variant, 'email'),
        });
        cmp.set('v.privateComputedIconClass', iconClass);
    },
})
