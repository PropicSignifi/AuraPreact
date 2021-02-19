({
    init: function(cmp) {
        this.computeContainerClassNames(cmp);
    },

    handleClassChange: function(cmp) {
        this.computeContainerClassNames(cmp);
    },

    computeContainerClassNames: function(cmp) {
        var classAttr = cmp.get('v.class');
        var containerClassNames = ['slds-tile'];
        var hasMediaFigure = cmp.get('v.media').length > 0;

        if (hasMediaFigure) {
            containerClassNames.push('slds-media');
        }
        if (typeof classAttr === 'string') {
            containerClassNames.push(classAttr);
        }

        cmp.set('v.privateComputedContainerClassNames', containerClassNames.join(' '));
    },
})
