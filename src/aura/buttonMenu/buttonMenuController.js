({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "eventRegistrationLibrary");
        window.$System.addLibrary(helper, "menuKeyboardLibrary");
        window.$System.addLibrary(helper, "domLibrary");

        cmp._items = [];
        helper.computeClassNames(cmp);
        helper.computeButtonClassNames(cmp);
        helper.computeDropdownClassNames(cmp);
        helper.computeDropdownIcon(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computeDropdownClassNames: function(cmp, event, helper) {
        helper.computeDropdownClassNames(cmp);
    },

    changeVisibility: function(cmp, event, helper) {
        if (cmp.get("v.disabled") && cmp.get("v.visible")) {
            throw new Error("A disabled menu cannot be shown.");
        } else {
            helper.maybeCreateMenuItems(cmp);
            helper.computeClassNames(cmp);
        }
    },

    changeVariant: function(cmp, event, helper) {
        helper.computeButtonClassNames(cmp);
    },

    changeIconName: function(cmp, event, helper) {
        helper.computeButtonClassNames(cmp);
        helper.computeDropdownIcon(cmp);
    },

    handleClick: function(cmp, event, helper) {
        helper.handleClickOnButton(cmp, event);
    },

    handleKeyDown: function(cmp, event, helper) {
        helper.handleKeyDownOnButton(cmp, event);
    },

    handleMouseDown: function(cmp, event, helper) {
        var mainButton = 0;
        if (event.button === mainButton) {
            helper.cancelBlur(cmp);
        }
    },

    handleFocus: function(cmp, event, helper) {
        helper.fireEvent(cmp, "onfocus", {
            event: event,
        });
    },

    handleBlur: function(cmp, event, helper) {
        helper.handleBlur(cmp, event);
        helper.fireEvent(cmp, "onblur", {
            event: event,
        });
    },

    focus: function(cmp, event, helper) {
        helper.focusOnButton(cmp);
    },
})
