({
    appendToBody: function(cmp) {
        var modal = cmp.find("privateModal").getElement();
        var backdrop = cmp.find("privateBackdrop").getElement();
        document.body.appendChild(modal);
        document.body.appendChild(backdrop);
        cmp._modal = modal;
        cmp._backdrop = backdrop;
    },

    doDestroy: function(cmp) {
        // Ommit removing child here because of lightning lazy handling of components
    },

    computeClassNames: function(cmp) {
        var privateVisible = cmp.get("v.privateVisible");
        var size = cmp.get("v.size");
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var classnames = this.classnamesLibrary.classnames('slds-modal', {
            'slds-fade-in-open': privateVisible,
            'slds-modal_large': this.equal(size, 'large'),
            'slds-modal_prompt': variant === 'prompt',
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    computeBackdropClassNames: function(cmp) {
        var privateVisible = cmp.get("v.privateVisible");
        var classnames = this.classnamesLibrary.classnames('slds-backdrop', {
            'slds-backdrop_open': privateVisible,
        });
        cmp.set('v.privateComputedBackdropClass', classnames);
    },

    hide: function(cmp) {
        cmp.set("v.privateVisible", false);
    },

    show: function(cmp) {
        cmp.set("v.privateVisible", true);
    },
})
