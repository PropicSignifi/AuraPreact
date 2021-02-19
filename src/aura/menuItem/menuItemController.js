({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "eventRegistrationLibrary");
        window.$System.addLibrary(helper, "domLibrary");

        helper.computeStyles(cmp);
        cmp.set("v.privateRole", cmp.get("v.checked") === undefined ? "menuitem" : "menuitemcheckbox");
    },

    handleClassChange: function(cmp, event, helper) {
        helper.computeStyles(cmp);
    },

    handleCheckedChange: function(cmp, event, helper) {
        helper.computeStyles(cmp);
    },

    handleClick: function(cmp, event, helper) {
        helper.fireDomEvent(cmp, "MENUITEM_CLICK", {
            sourceEvent: event
        });
    },

    handleKeyDown: function(cmp, event, helper) {
        helper.fireDomEvent(cmp, "MENUITEM_KEYDOWN", {
            sourceEvent: event
        });
    },

    focus: function(cmp) {
        var element = cmp.find("anchor").getElement();
        if (element) {
            element.focus();
        } else {
            throw new Error("Unable to focus on the menu item as it has not yet been rendered.");
        }
    },

    handleBlur: function(cmp, event, helper) {
        helper.fireDomEvent(cmp, "MENUITEM_BLUR", {
            sourceEvent: event
        });

        helper.fireEvent(cmp, "onblur", {
            event: event,
        });
    },

    handleFocus: function(cmp, event, helper) {
        helper.fireDomEvent(cmp, "MENUITEM_FOCUS", {
            sourceEvent: event
        });

        helper.fireEvent(cmp, "onfocus", {
            event: event,
        });
    },
})
