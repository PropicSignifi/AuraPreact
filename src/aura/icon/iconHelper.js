({
    SEPARATOR: ":",
    VALID_VARIANTS: ["inverse", "error", "warning"],

    normalizeVariant: function(cmp) {
        var variant = cmp.get('v.variant');
        if (variant === 'bare') {
            $A.warning('[c:icon] The variant value "bare" will eventually be deprecated. Please use the variant value "inverse" instead.' + ' (Instance ID: ' + cmp.getGlobalId() + ')');
            variant = 'inverse';
        }

        var category = this.getIconType(cmp);
        if (category !== 'utility' && variant !== 'inverse') {
            if (variant !== undefined) {

                $A.warning('[c:icon] The variant value "' + variant + '" cannot be used with icons from the "' + category + '" icon category. Please use the variant value "inverse" instead.' + ' (Instance ID: ' + cmp.getGlobalId() + ')');
            }
            variant = 'inverse';
        }

        cmp.set('v.privateVariant', this.propValuesLibrary.normalize(variant, {
            validValues: this.VALID_VARIANTS
        }));
    },

    normalizeName: function(name) {
        return name.replace(/_/g, '-');
    },

    getIconName: function(cmp) {
        var iconName = cmp.get('v.iconName');
        if (!iconName || (iconName.indexOf(this.SEPARATOR) < 0)) {
            return '';
        }

        return iconName.split(this.SEPARATOR)[1];
    },

    getIconType: function(cmp) {
        var iconName = cmp.get('v.iconName');
        if (!iconName) {
            return '';
        }

        var category = iconName.split(this.SEPARATOR)[0];
        return category.includes("-") ? category.split("-")[1] : category;
    },

    setContainerClassNames: function(cmp) {
        var classnames = this.classnamesLibrary.classnames;
        var iconType = this.getIconType(cmp);
        var iconName = this.normalizeName(this.getIconName(cmp));
        var classAttr = cmp.get('v.class');
        var classNamesObject = {
            'slds-icon_container': true,
            'slds-icon_container--circle': iconType === 'action'
        };

        classNamesObject['slds-icon-' + iconType + '-' + iconName] = true;

        cmp.set('v.privateContainerClassNames', classnames(classNamesObject, classAttr));
    },
})
