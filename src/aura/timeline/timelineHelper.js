({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var classnames = this.classnamesLibrary.classnames('slds-timeline', {
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },
})
