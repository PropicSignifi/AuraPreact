({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "domLibrary");

        helper.computeTabsetClassNames(cmp);
        helper.computeTabClassNames(cmp);
        helper.computeTabNavClassnames(cmp);
    },

    handleTabsetClassNameChange: function(cmp, event, helper) {
        helper.computeTabsetClassNames(cmp);
    },

    handleSelectedTabIdChange: function(cmp, event, helper) {
        var newSelectedTabId = cmp.get('v.selectedTabId');
        var tab;

        if (helper.isDiffSelectedTabIdAndCurrentSelectTabId(cmp)) {
            tab = helper.getTabById(newSelectedTabId, cmp);
            if (!tab) {
                throw new Error('There is not a tab with that id "' + newSelectedTabId + '"');
            }
            tab.ref.select();
        }
    },

    handleKeysIteration: function(cmp, event, helper) {
        if (helper.isArrowKey(event)) {
            event.preventDefault();
            event.stopPropagation();
            helper.switchTabs(cmp, event);
        }
    },

    handleOverflowChange: function(cmp, event, helper) {
        helper.computeTabClassNames(cmp);
    },

    onScroll: function(cmp, event, helper) {
        helper.updateScrollArrows(cmp);
    },

    scrollBack: function(cmp, event, helper) {
        helper.scrollTabs(cmp, "back");
    },

    scrollForward: function(cmp, event, helper) {
        helper.scrollTabs(cmp, "forward");
    },
})
