({
    setContainerClassNames: function(cmp) {
        if(!this.classnamesLibrary) {
            return;
        }
        var classnames = this.classnamesLibrary.classnames;
        var variant = cmp.get('v.variant');
        var isScopedContent = variant === 'scoped';
        var isVerticalContent = variant === 'vertical';
        var isVisible = cmp.get('v.visible');

        cmp.set('v.privateComputedClassNames', classnames({
            'slds-tabs--scoped__content': isScopedContent,
            'slds-vertical-tabs__content': isVerticalContent,
            'slds-tabs--default__content': !isScopedContent && !isVerticalContent,
            'slds-hide': !isVisible,
            'slds-show': isVisible
        }));
    },
})
