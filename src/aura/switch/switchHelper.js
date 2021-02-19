({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var classnames = this.classnamesLibrary.classnames('slds-box', {
            'slds-theme_default': !variant || this.equal(variant, 'default'),
            'slds-theme_shade': this.equal(variant, 'shade'),
            'slds-theme_shade slds-theme_alert-texture': this.equal(variant, 'shade_texture'),
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    computeCaseChange: function(cmp) {
        var cases = cmp.get("v.body");
        var caseName = cmp.get("v.case");
        _.each(cases, function(c) {
            if(c.isInstanceOf(window.$Config.getNamespace() + ":case")) {
                var cName = c.get("v.name");
                c.setVisible(cName === caseName);
            }
        });
    },
})
