({
    notifyParentAccordion: function(eventName, cmp, details) {
        var el = cmp.getElement();
        var detail = details;
        detail.targetId = cmp.getGlobalId();

        var sectionEvent = new this.domLibrary.CustomEvent(eventName,{
            bubbles: true,
            cancelable: true,
            detail: detail,
        });

        el.dispatchEvent(sectionEvent);
    },

    registerSectionOnParent: function(cmp) {
        this.notifyParentAccordion('accordionsectionregister', cmp, {
            targetName: cmp.get('v.name'),
            element: cmp.getElement(),
            openSection: $A.getCallback(this.openSection.bind(this, cmp)),
            closeSection: $A.getCallback(this.closeSection.bind(this, cmp)),
            focusSection: $A.getCallback(this.focusSection.bind(this, cmp))
        });
    },

    deregisterSectionOnParent: function(cmp) {
        this.notifyParentAccordion('accordionsectionderegister', cmp, {});
    },

    openSection: function(cmp) {
        cmp.set('v.privateIsOpen', true);
    },

    closeSection: function(cmp) {
        cmp.set('v.privateIsOpen', false);
    },

    focusSection: function(cmp) {
        cmp.find('section-control').getElement().focus();
    },

    handleSelectSection: function(cmp) {
        this.notifyParentAccordion('accordionsectionselect', cmp, {});
    },

    handleKeyDown: function(cmp, event) {
        var keyCodes = this.utilsLibrary.keyCodes;

        switch (event.keyCode) {
            case keyCodes.up:
            case keyCodes.right:
            case keyCodes.down:
            case keyCodes.left:
                event.preventDefault();
                event.stopPropagation();
                this.notifyParentAccordion('accordionsectionkeynav', cmp, {
                    keyCode: event.keyCode
                });
                break;
            default:
        }
    },
})
