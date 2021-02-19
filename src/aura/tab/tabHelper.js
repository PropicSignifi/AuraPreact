({
    setId: function(cmp) {
        if (!cmp.get('v.id')) {
            cmp.set('v.id', cmp.getGlobalId());
        }
    },

    computeStyles: function(cmp) {
        this.computeTabClassNames(cmp);
        this.computedLinkClassNames(cmp);
    },

    computeTabClassNames: function(cmp) {
        var classnames = this.classnamesLibrary.classnames;
        var isSelected = cmp.get('v.privateSelected');
        var privateVariant = cmp.get('v.privateVariant');
        var isScopedVariant = privateVariant === 'scoped';
        var isVerticalVariant = privateVariant === 'vertical';
        var disabled = cmp.get("v.disabled");

        var tabClassNames = classnames({
            'slds-tabs--default__item': !isScopedVariant && !isVerticalVariant,
            'slds-tabs--scoped__item': isScopedVariant,
            'slds-vertical-tabs__nav-item': isVerticalVariant,
            'slds-active': isSelected && !isVerticalVariant,
            'slds-is-active': isSelected && isVerticalVariant,
            'slds-is-not-allowed': disabled,
        }, cmp.get('v.class'));
        cmp.set('v.privateTabClassNames', tabClassNames);
    },

    computedLinkClassNames: function(cmp) {
        var classnames = this.classnamesLibrary.classnames;
        var privateVariant = cmp.get('v.privateVariant');
        var isScopedVariant = privateVariant === 'scoped';
        var isVerticalVariant = privateVariant === 'vertical';

        var linkClassNames = classnames({
            'slds-tabs--default__link': !isScopedVariant && !isVerticalVariant,
            'slds-tabs--scoped__link': isScopedVariant,
            'slds-vertical-tabs__link': isVerticalVariant
        });
        cmp.set('v.privateLinkClassNames', linkClassNames);
    },

    createCustomEvent: function(eventName, cmp) {
        return new this.domLibrary.CustomEvent(eventName,{
            bubbles: true,
            cancelable: true,
            detail: {
                target: cmp
            }
        });
    },

    addListeners: function(cmp) {
        this.eventRegistrationLibrary.eventRegistration.addEventListener(cmp, cmp, 'TAB_ACTIVE', $A.getCallback(this.activeHandler.bind(this, cmp)));
    },

    removeListeners: function(cmp) {
        this.eventRegistrationLibrary.eventRegistration.removeAllEventListeners(cmp);
    },

    activeHandler: function(cmp) {
        this.fireEvent(cmp, "onactive");
    },

    fireRegisterEvent: function(cmp) {
        var el = cmp.getElement();
        var registerEvent = this.createCustomEvent('TAB_REGISTER', cmp);
        el.dispatchEvent(registerEvent);
    },

    fireSelectEvent: function(cmp) {
        var el = cmp.getElement();
        var selectEvent = this.createCustomEvent('TAB_SELECT', cmp);
        el.dispatchEvent(selectEvent);
    },

    fireUnRegisterEvent: function(cmp) {
        var el = cmp.getElement();
        var unRegisterEvent = this.createCustomEvent('TAB_UNREGISTER', cmp);
        el.dispatchEvent(unRegisterEvent);
    },

    fireBodyChangeEvent: function(cmp) {
        var el = cmp.getElement();
        if(el) {
            var freshBodyEvent = this.createCustomEvent('TAB_FRESHBODY', cmp);
            el.dispatchEvent(freshBodyEvent);
        }
    },

    setFocus: function(cmp) {
        var anchor = cmp.find('privateAnchor').getElement();

        if (anchor) {
            anchor.focus();
        }
    },
})
