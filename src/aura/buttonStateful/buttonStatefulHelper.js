({
    init: function(cmp) {
        this.computeClassNames(cmp);
        this.validateLabelsIcons(cmp);
    },

    computeClassNames: function(cmp) {
        var variant = cmp.get('v.variant');
        var classes = cmp.get('v.class');
        var state = cmp.get('v.state');
        var isClicked = cmp.get('v.privateIsClicked');
        var classnames = this.classnamesLibrary.classnames('slds-button slds-button--stateful', {
            'slds-button--neutral': this.equal(variant, 'neutral'),
            'slds-button--brand': this.equal(variant, 'brand'),
            'slds-button--inverse': this.equal(variant, 'inverse'),
            'slds-button--reset': this.equal(variant, 'text'),
            'slds-button--destructive': this.equal(variant, 'destructive'),
            'slds-button--success': this.equal(variant, 'success'),
            'slds-button_primary': this.equal(variant, 'primary'),
            'slds-button_secondary': this.equal(variant, 'secondary'),
            'slds-button_tertiary': this.equal(variant, 'tertiary'),
            'slds-button_save': this.equal(variant, 'save'),
        }, {
            'slds-not-selected': !state,
            'slds-is-selected': state && !isClicked,
            'slds-is-selected-clicked': state && isClicked
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    validateLabelsIcons: function(cmp) {
        var label = cmp.get('v.labelWhenOff');
        if (typeof label !== 'string' || label.length <= 0) {
            cmp.set('v.labelWhenOff', '');
            console.error('[c:buttonStateful]', cmp.getGlobalId(), 'The "labelWhenOff" attribute value is required to show the label when the state is false');
        }

        var labelOn = cmp.get('v.labelWhenOn');
        if (typeof labelOn !== 'string' || labelOn.length <= 0) {
            cmp.set('v.labelWhenOn', '');
            console.error('[c:buttonStateful]', cmp.getGlobalId(), 'The "labelWhenOn" attribute value is required to show the label when the state is true');
        }

        var labelHover = cmp.get('v.labelWhenHover');
        if (typeof labelHover !== 'string' || labelHover.length <= 0) {
            cmp.set('v.labelWhenHover', labelOn);
        }

        var iconNameHover = cmp.get('v.iconNameWhenHover');
        if (typeof iconNameHover !== 'string' || iconNameHover.length <= 0) {
            cmp.set('v.iconNameWhenHover', cmp.get('v.iconNameWhenOn'));
        }
    },

    handleClassChange: function(cmp) {
        this.computeClassNames(cmp);
    },

    handleVariantChange: function(cmp) {
        this.computeClassNames(cmp);
    },

    handleStateChange: function(cmp) {
        this.computeClassNames(cmp);
    },

    handlePrivateIsClickedChange: function(cmp) {
        this.computeClassNames(cmp);
    },

    handleClick: function(cmp, event) {
        cmp.set('v.privateIsClicked', true);
        var state = cmp.get("v.state");
        this.fireEvent(cmp, "onclick", {
            event: event,
            state: state,
        });
        cmp.set("v.state", !state);
    },

    handleFocus: function(cmp, event) {
        this.fireEvent(cmp, "onfocus", {
            event: event,
        });
    },

    handleBlur: function(cmp, event) {
        cmp.set('v.privateIsClicked', false);
        this.fireEvent(cmp, "onblur", {
            event: event,
        });
    }
})
