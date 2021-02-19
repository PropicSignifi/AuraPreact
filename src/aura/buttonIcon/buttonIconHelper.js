({
    fixPropValues: function(cmp) {
        this.propValuesLibrary.propValues(cmp, [{
            name: 'variant',
            oneOf: ['bare', 'container', 'border', 'border-filled', 'bare-inverse', 'border-inverse'],
            force: 'border',
            lowercase: true
        }]);
    },

    setTitleValue: function(cmp) {
        var title = cmp.get('v.title');
        var privateTitle = title;

        if ($A.util.isEmpty(title)) {
            privateTitle = cmp.get('v.alternativeText');
        }

        cmp.set('v.privateTitle', privateTitle);
    },

    checkIconType: function(cmp) {
    },

    computeButtonClassNames: function(cmp) {
        var variant = cmp.get('v.variant') || '';
        var isBare = this.equal(this.getVariantBase(variant), 'bare');

        var sizeModifier;
        var size = (cmp.get('v.size') || '').toLowerCase();

        if (!isBare) {
            switch (size) {
                case 'small':
                    sizeModifier = 'slds-button--icon-small';
                    break;
                case 'x-small':
                    sizeModifier = 'slds-button--icon-x-small';
                    break;
                case 'xx-small':
                    sizeModifier = 'slds-button--icon-xx-small';
                    break;
                default:
                    sizeModifier = undefined;
            }
        }

        cmp.set('v.privateComputedButtonClass', this.classnamesLibrary.classnames('slds-button', cmp.get('v.class'), sizeModifier, {
            'slds-button--icon-bare': isBare,
            'slds-button--icon-container': this.equal(variant, 'container'),
            'slds-button--icon-border': this.equal(variant, 'border'),
            'slds-button--icon-border-filled': this.equal(variant, 'border-filled'),
            'slds-button--icon-border-inverse': this.equal(variant, 'border-inverse'),
            'slds-button--icon-inverse': this.equal(variant, 'bare-inverse')
        }));
    },

    getVariantBase: function(variant) {
        return (variant || '').split('-')[0];
    },

    getVariantModifier: function(variant) {
        return (variant || '').split('-')[1] || '';
    },

    setIconClass: function(cmp) {
        var variant = cmp.get('v.variant') || '';
        var isInverse = this.equal('inverse', this.getVariantModifier(variant));
        var isBare = this.equal('bare', this.getVariantBase(variant));
        var iconClass = cmp.get('v.iconClass') || '';

        var sizeModifier;
        if (isBare) {
            var size = (cmp.get('v.size') || '').toLowerCase();
            switch (size) {
                case 'large':
                    sizeModifier = 'slds-button__icon--large';
                    break;
                case 'small':
                    sizeModifier = 'slds-button__icon--small';
                    break;
                case 'x-small':
                    sizeModifier = 'slds-button__icon--x-small';
                    break;
                default:
                    sizeModifier = undefined;
            }
        }

        cmp.set('v.privateIconClass', this.classnamesLibrary.classnames('slds-button__icon', isInverse ? 'slds-button--icon--inverse' : undefined, sizeModifier, iconClass));
    },
})
