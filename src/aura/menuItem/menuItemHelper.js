({
    addListeners: function(cmp) {
        this.eventRegistrationLibrary.eventRegistration.addEventListener(cmp, cmp, "MENUITEM_SELECT", $A.getCallback(this.activeHandler.bind(this, cmp)));
    },

    removeListeners: function(cmp) {
        this.eventRegistrationLibrary.eventRegistration.removeAllEventListeners(cmp);
    },

    activeHandler: function(cmp) {
        this.fireEvent(cmp, "onactive", {
            cmp: cmp,
        });
    },

    computeStyles: function(cmp) {
        var classes = cmp.get("v.class");
        var classnames = this.classnamesLibrary.classnames("slds-dropdown__item", {
            "slds-is-selected": cmp.get("v.checked")
        }, classes);
        cmp.set("v.privateClassNames", classnames);
    },

    fireDomEvent: function(cmp, eventName, data) {
        var detail = data || {};
        detail.menuItem = cmp;

        cmp.getElement().dispatchEvent(new this.domLibrary.CustomEvent(eventName,{
            bubbles: true,
            cancelable: true,
            detail: detail
        }));
    },
})
