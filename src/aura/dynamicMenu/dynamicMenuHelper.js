({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var privateMenuVisible = cmp.get("v.privateMenuVisible");
        var variant = cmp.get("v.variant");
        var classnames = this.classnamesLibrary.classnames('slds-popover slds-nubbin_top-left slds-dynamic-menu', {
            'slds-hide': !privateMenuVisible,
            'slds-show': privateMenuVisible,
            'position_border': this.equal(variant, 'border'),
            'position_bare': !variant || this.equal(variant, 'bare'),
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    showDynamicMenu: function(cmp) {
        var helper = this;
        cmp.set("v.privateMenuVisible", true);

        cmp._clickListener = $A.getCallback(function(event) {
            helper.onClickOutsideDynamicMenu(cmp, event);
        });

        window.addEventListener("click", cmp._clickListener);
    },

    hideDynamicMenu: function(cmp) {
        cmp.set("v.privateMenuVisible", false);

        window.removeEventListener("click", cmp._clickListener);
    },

    onClickOutsideDynamicMenu: function(component, event) {
        var isInDynamicMenu = window.$Utils.findFromEvent(event, "data-dynamicMenu") === component.getGlobalId();

        if(!isInDynamicMenu) {
            this.hideDynamicMenu(component);
        }
    },
})
